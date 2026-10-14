import { normalizeSettings } from "./shared/settings.js";
import {
  excludedContext,
  sitePolicy,
  normalizeDomain,
} from "./shared/policy.js";
import { captionDecision, imageDecision } from "./shared/filters.js";
import { publicImageUrl, isJpegFrame } from "./shared/media.js";
import { settingsWriter, correctionWriter } from "./shared/storage.js";

const settings = async () =>
  normalizeSettings((await chrome.storage.local.get("settings")).settings);
const writeSettings = settingsWriter(chrome.storage);
const writeCorrection = correctionWriter(chrome.storage);
const cache = new Map(),
  inflight = new Map();
const jobs = new Map();
let opening,
  closing,
  active = 0;
const ui = (sender) =>
  ["popup.html", "welcome.html", "self-test.html"].some(
    (file) => sender.url === chrome.runtime.getURL(file),
  );
const page = (sender) => sender.tab && /^https?:\/\//.test(sender.url ?? "");
const privateSender = (sender) =>
  excludedContext(sender.url ?? "") || excludedContext(sender.tab?.url ?? "");
const contexts = () =>
  chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL("offscreen.html")],
  });
async function liveContext(sender) {
  if (!sender) return true; // Explicit setup check uses a bundled benign image.
  try {
    const tab = await chrome.tabs.get(sender.tab.id);
    if (tab.url !== sender.url || excludedContext(tab.url)) return false;
    const status = await chrome.tabs.sendMessage(
      sender.tab.id,
      { type: "noog:context-check" },
      { documentId: sender.documentId },
    );
    return status?.url === sender.url && status.allowed === true;
  } catch {
    return false;
  }
}
function cancelJob(id, job) {
  job.valid = false;
  chrome.runtime
    .sendMessage({ type: "noog:offscreen-cancel", jobId: id })
    .catch(() => {});
}
async function ensureOffscreen() {
  if (closing) await closing;
  if (opening) return opening;
  opening = (async () => {
    if (!(await contexts()).length)
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["WORKERS"],
        justification: "Run the bundled local image classifier on this device.",
      });
  })().finally(() => {
    opening = undefined;
  });
  return opening;
}
async function closeOffscreen() {
  if (active || opening) return;
  if (closing) return closing;
  closing = (async () => {
    if ((await contexts()).length && !active)
      await chrome.offscreen.closeDocument();
    await chrome.storage.session.set({ modelStatus: { state: "idle" } });
  })().finally(() => {
    closing = undefined;
  });
  return closing;
}
const modelErrors = new Set([
  "model_load_failed",
  "model_worker_failed",
  "model_timeout",
  "inference_failed",
]);
async function runModel(type, payload = {}, sender) {
  if (active >= 3)
    return { ok: false, error: "image_queue_full", retryable: true };
  active++;
  const jobId = crypto.randomUUID(),
    job = { sender, valid: true };
  jobs.set(jobId, job);
  try {
    if (!(await liveContext(sender)))
      return { ok: false, error: "image_context_changed" };
    await ensureOffscreen();
    const { modelStatus } = await chrome.storage.session.get("modelStatus");
    if (modelStatus?.state !== "ready")
      await chrome.storage.session.set({ modelStatus: { state: "loading" } });
    const dispatchAllowed = await liveContext(sender);
    if (!job.valid || !dispatchAllowed)
      return { ok: false, error: "image_context_changed" };
    const result = await chrome.runtime.sendMessage({
      type,
      ...payload,
      jobId,
    });
    const resultAllowed = await liveContext(sender);
    if (!job.valid || !resultAllowed)
      return { ok: false, error: "image_context_changed" };
    if (
      result?.ok &&
      imageDecision(result.scores, {}).action !== "unknown" &&
      result.backend === "wasm"
    ) {
      await chrome.storage.session.set({
        modelStatus: {
          state: "ready",
          backend: "wasm",
          elapsedMs: result.elapsedMs,
          tensorBytes: result.tensorBytes,
        },
      });
      return result;
    }
    const error = result?.error ?? "model_worker_failed";
    if (modelErrors.has(error))
      await chrome.storage.session.set({
        modelStatus: { state: "failed", error },
      });
    return result?.ok
      ? { ok: false, error: "inference_failed" }
      : (result ?? { ok: false, error });
  } catch {
    await chrome.storage.session.set({
      modelStatus: { state: "failed", error: "model_worker_failed" },
    });
    return { ok: false, error: "model_worker_failed" };
  } finally {
    jobs.delete(jobId);
    active--;
    const current = await settings();
    if (!current.enabled || !current.sexual) {
      for (const [id, job] of jobs) if (job.sender) cancelJob(id, job);
      closeOffscreen().catch(() => {});
    }
  }
}
async function checkImage(url, sender) {
  if (!(await liveContext(sender)))
    return { ok: false, error: "image_context_changed" };
  const key = sender.documentId + ":" + url;
  const prior = cache.get(url);
  if (prior && prior.expires > Date.now()) return prior.result;
  cache.delete(url);
  if (inflight.has(key)) return inflight.get(key);
  const task = runModel("noog:offscreen-image", { url }, sender)
    .then((result) => {
      if (result.ok) {
        cache.set(url, { result, expires: Date.now() + 300000 });
        while (cache.size > 128) cache.delete(cache.keys().next().value);
      }
      return result;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, task);
  return task;
}
async function analyse(message, sender) {
  if (privateSender(sender) || !(await liveContext(sender)))
    return { action: "allow", reason: "private_page" };
  const post = {
    caption:
      typeof message.caption === "string" ? message.caption.slice(0, 1200) : "",
    creator:
      typeof message.creator === "string" ? message.creator.slice(0, 512) : "",
  };
  let current = await settings();
  const stopped = () => sitePolicy(sender.url, current).kind !== "active";
  let decision = captionDecision(post, current);
  if (stopped())
    return { action: "allow", reason: sitePolicy(sender.url, current).kind };
  if (["allow", "replace"].includes(decision.action)) return decision;
  if (message.hasVideo && current.videoMode === "cover")
    return {
      action: "replace",
      reason: "video_cover_setting",
      category: "Videos · your cover setting",
    };
  const matches = { images: [], videos: [] };
  let firstMatch, unknown;
  const afterCheck = async () => {
    if (!(await liveContext(sender)))
      return { action: "allow", reason: "context_changed" };
    current = await settings();
    decision = captionDecision(post, current);
    if (stopped())
      return { action: "allow", reason: sitePolicy(sender.url, current).kind };
    if (["allow", "replace"].includes(decision.action)) return decision;
  };
  const scored = (result, target, isVideo = false) => {
    if (!result?.ok) {
      if (result?.retryable || !unknown)
        unknown = {
          action: "unknown",
          reason: result?.error ?? "image_unavailable",
          retryable: result?.retryable === true,
        };
      return;
    }
    const verdict = imageDecision(result.scores, current);
    if (verdict.action === "replace") {
      matches[isVideo ? "videos" : "images"].push(target);
      firstMatch ??= {
        ...verdict,
        reason: isVideo ? "local_video_frame" : "local_image_model",
        category: isVideo
          ? verdict.category.replace("images", "video frame")
          : verdict.category,
        modelMs: result.elapsedMs,
      };
    } else if (verdict.action === "unknown") unknown ??= verdict;
  };
  if (current.sexual) {
    const urls = Array.isArray(message.images)
      ? message.images.filter((url) => typeof url === "string").slice(0, 4)
      : [];
    for (const raw of urls) {
      let url;
      try {
        url = new URL(raw);
      } catch {
        unknown ??= { action: "unknown", reason: "image_host_not_allowed" };
        continue;
      }
      if (raw.length > 4096 || !publicImageUrl(url)) {
        unknown ??= { action: "unknown", reason: "image_host_not_allowed" };
        continue;
      }
      const result = await checkImage(url.href, sender),
        stop = await afterCheck();
      if (stop) return stop;
      if (!current.sexual) break;
      scored(result, url.href);
    }
  }
  if (current.sexual && message.hasVideo && current.videoMode === "sample") {
    const frames = Array.isArray(message.frames)
      ? message.frames.slice(0, 2)
      : [];
    if (
      !Number.isInteger(message.videoCount) ||
      message.videoCount < 1 ||
      message.videoCount > 2 ||
      frames.length !== message.videoCount ||
      !frames.every(isJpegFrame)
    )
      unknown ??= {
        action: "unknown",
        reason: message.videoPending ? "video_not_ready" : "video_unreadable",
        retryable: message.videoPending === true,
      };
    else
      for (const [index, frame] of frames.entries()) {
        const result = await runModel(
            "noog:offscreen-frame",
            { frame },
            sender,
          ),
          stop = await afterCheck();
        if (stop) return stop;
        if (!current.sexual || current.videoMode !== "sample") break;
        scored(result, index, true);
      }
  }
  const stop = await afterCheck();
  if (stop) return stop;
  if (
    current.sexual &&
    firstMatch &&
    (matches.images.length ||
      (current.videoMode === "sample" && matches.videos.length))
  )
    return { ...firstMatch, mediaMatches: matches };
  if (current.sexual && unknown) return unknown;
  return current.sexual && message.uninspectedMedia
    ? { action: "unknown", reason: "image_unavailable" }
    : { action: "allow", reason: "local_rules_no_match" };
}
async function handle(message, sender) {
  if (
    message.type === "noog:authorize-model" &&
    sender.url === chrome.runtime.getURL("offscreen.html")
  ) {
    const job = jobs.get(message.jobId);
    const allowed = job && (await liveContext(job.sender));
    return { allowed: !!job?.valid && allowed === true };
  }

  if (message.type === "noog:analyse" && page(sender))
    return analyse(message, sender);
  if (
    message.type === "noog:allow-media" &&
    page(sender) &&
    !privateSender(sender)
  )
    return { ok: true, count: await writeCorrection(message.hash) };
  if (
    message.type === "noog:allow-creator" &&
    page(sender) &&
    !privateSender(sender)
  ) {
    const host = normalizeDomain(sender.url),
      creator = message.creator;
    if (
      typeof creator !== "string" ||
      !(
        ["x.com", "twitter.com"].includes(host) ||
        creator.startsWith(host + ":")
      )
    )
      return { ok: false };
    return {
      ok: true,
      settings: await writeSettings({ addCreators: [creator] }),
    };
  }
  if (
    message.type === "noog:offscreen-idle" &&
    sender.url === chrome.runtime.getURL("offscreen.html")
  ) {
    await closeOffscreen();
    return { ok: true };
  }
  if (!ui(sender)) return;
  if (message.type === "noog:settings")
    return { ok: true, settings: await writeSettings(message) };
  if (message.type === "noog:clear-media") {
    await writeCorrection("clear");
    return { ok: true };
  }
  if (message.type === "noog:model-status") {
    const { modelStatus } = await chrome.storage.session.get("modelStatus");
    return (await contexts()).length
      ? (modelStatus ?? { state: "idle" })
      : { state: "idle" };
  }
  if (message.type === "noog:self-test") {
    const result = await runModel("noog:offscreen-self-test");
    return result.ok
      ? {
          ok: true,
          backend: result.backend,
          elapsedMs: result.elapsedMs,
          labels: Object.keys(result.scores).length,
          tensorBytes: result.tensorBytes,
        }
      : result;
  }
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (
    sender.id !== chrome.runtime.id ||
    !message?.type ||
    (message.type.startsWith("noog:offscreen-") &&
      message.type !== "noog:offscreen-idle")
  )
    return;
  handle(message, sender)
    .then(reply)
    .catch(() => reply({ ok: false, error: "request_failed" }));
  return true;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    const current = normalizeSettings(changes.settings.newValue);
    if (!current.enabled || !current.sexual) {
      for (const [id, job] of jobs) if (job.sender) cancelJob(id, job);
      closeOffscreen().catch(() => {});
    }
  }
});
chrome.runtime.onInstalled.addListener((event) => {
  if (event.reason === "install")
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});

chrome.tabs.onUpdated.addListener((tabId, changes) => {
  if (!changes.url) return;
  for (const [id, job] of jobs)
    if (job.sender?.tab.id === tabId && changes.url !== job.sender.url)
      cancelJob(id, job);
});
chrome.tabs.onRemoved.addListener((tabId) => {
  for (const [id, job] of jobs)
    if (job.sender?.tab.id === tabId) cancelJob(id, job);
});
