import { isJpegFrame, publicImageUrl } from "./shared/media.js";

let worker,
  sequence = 0,
  active = 0,
  idleTimer;
const pending = new Map();
const fetches = new Map();
function scheduleIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!active)
      chrome.runtime
        .sendMessage({ type: "noog:offscreen-idle" })
        .catch(() => {});
  }, 120000);
}
function reset(error = "model_worker_failed") {
  for (const request of pending.values()) {
    clearTimeout(request.timer);
    request.resolve({ ok: false, error });
  }
  pending.clear();
  worker?.terminate();
  worker = undefined;
  scheduleIdle();
}
function imageWorker() {
  if (!worker) {
    worker = new Worker("image-worker.js");
    worker.onmessage = ({ data }) => {
      const request = pending.get(data.id);
      if (request) {
        pending.delete(data.id);
        clearTimeout(request.timer);
        request.resolve(
          request.cancelled
            ? { ok: false, error: "image_context_changed" }
            : data,
        );
      }
    };
    worker.onerror = () => reset();
  }
  return worker;
}
async function imageBytes(message, signal) {
  if (message.type === "noog:offscreen-frame") {
    if (!isJpegFrame(message.frame))
      return { ok: false, error: "video_unreadable" };
    return {
      bytes: Uint8Array.from(atob(message.frame.split(",")[1]), (c) =>
        c.charCodeAt(0),
      ),
      mime: "image/jpeg",
    };
  }
  const selfTest = message.type === "noog:offscreen-self-test";
  const url = new URL(
    selfTest ? chrome.runtime.getURL("assets/cats.webp") : message.url,
  );
  if (!selfTest && !publicImageUrl(url))
    return { ok: false, error: "image_host_not_allowed" };
  const response = await fetch(url.href, {
    credentials: "omit",
    referrerPolicy: "no-referrer",
    redirect: "error",
    signal,
  });
  const mime = response.headers.get("content-type") ?? "";
  if (!response.ok || !/^image\/(?:jpeg|png|webp|gif)(?:;|$)/i.test(mime))
    return { ok: false, error: "image_type_not_allowed" };
  if (Number(response.headers.get("content-length")) > 6000000)
    return { ok: false, error: "image_too_large" };
  const reader = response.body.getReader(),
    chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 6000000) {
      await reader.cancel();
      return { ok: false, error: "image_too_large" };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return { bytes, mime };
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (
    sender.id !== chrome.runtime.id ||
    sender.tab ||
    (sender.url && sender.url !== chrome.runtime.getURL("background.js")) ||
    ![
      "noog:offscreen-image",
      "noog:offscreen-frame",
      "noog:offscreen-self-test",
      "noog:offscreen-cancel",
    ].includes(message?.type)
  )
    return;
  if (message.type === "noog:offscreen-cancel") {
    fetches.get(message.jobId)?.abort();
    for (const request of pending.values())
      if (request.jobId === message.jobId) request.cancelled = true;
    reply({ ok: true });
    return;
  }
  if (active >= 3) {
    reply({ ok: false, error: "image_queue_full", retryable: true });
    return;
  }
  active++;
  const controller = new AbortController();
  fetches.set(message.jobId, controller);
  const fetchTimeout = setTimeout(() => controller.abort(), 8000);
  clearTimeout(idleTimer);
  (async () => {
    const permission = await chrome.runtime.sendMessage({
      type: "noog:authorize-model",
      jobId: message.jobId,
    });
    if (controller.signal.aborted || !permission?.allowed)
      return { ok: false, error: "image_context_changed" };
    const input = await imageBytes(message, controller.signal);
    clearTimeout(fetchTimeout);
    if (input.ok === false) return input;
    const authorization = await chrome.runtime.sendMessage({
      type: "noog:authorize-model",
      jobId: message.jobId,
    });
    if (controller.signal.aborted || !authorization?.allowed)
      return { ok: false, error: "image_context_changed" };
    const id = ++sequence;
    return new Promise((resolve) => {
      const timer = setTimeout(() => reset("model_timeout"), 30000);
      pending.set(id, { resolve, timer, jobId: message.jobId });
      try {
        imageWorker().postMessage(
          { id, bytes: input.bytes.buffer, mime: input.mime },
          [input.bytes.buffer],
        );
      } catch {
        reset();
      }
    });
  })()
    .then(reply)
    .catch(() => reply({ ok: false, error: "image_unavailable" }))
    .finally(() => {
      clearTimeout(fetchTimeout);
      fetches.delete(message.jobId);
      active--;
      scheduleIdle();
    });
  return true;
});
