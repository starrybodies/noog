import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Switchboard } from "./Switchboard.js";
import { Backup } from "./Backup.js";
import { normalizeSettings } from "./shared/settings.js";
import { sitePolicy } from "./shared/policy.js";

function Popup() {
  const [settings, setSettings] = useState(),
    [saved, setSaved] = useState("Changes saved");
  const [model, setModel] = useState({ state: "idle" }),
    [tab, setTab] = useState(),
    [page, setPage] = useState();
  const latest = useRef(),
    writes = useRef(Promise.resolve());
  async function checkModel() {
    setModel({ state: "loading" });
    try {
      const result = await chrome.runtime.sendMessage({
        type: "noog:self-test",
      });
      setModel(
        result.ok
          ? { state: "ready", ...result }
          : { state: "failed", error: result.error },
      );
    } catch {
      setModel({ state: "failed", error: "model_worker_failed" });
    }
  }
  useEffect(() => {
    let alive = true;
    const changed = (changes, area) => {
      if (!alive) return;
      if (area === "local" && changes.settings) {
        const next = normalizeSettings(changes.settings.newValue);
        latest.current = next;
        setSettings(next);
      }
      if (area === "session" && changes.modelStatus)
        setModel(changes.modelStatus.newValue ?? { state: "idle" });
    };
    chrome.storage.onChanged.addListener(changed);
    (async () => {
      const current = normalizeSettings(
        (await chrome.storage.local.get("settings")).settings,
      );
      if (!alive) return;
      latest.current = current;
      setSettings(current);
      const [active] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!alive) return;
      setTab(active);
      if (active?.id)
        chrome.tabs
          .sendMessage(active.id, { type: "noog:page-status" })
          .then((value) => alive && setPage(value))
          .catch(() => {});
      const state = await chrome.runtime.sendMessage({
        type: "noog:model-status",
      });
      if (!alive) return;
      setModel(state);
      if (current.enabled && current.sexual && state.state !== "ready")
        await checkModel();
    })().catch(() => alive && setSaved("Controls unavailable. Reload NOOG."));
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(changed);
    };
  }, []);
  const change = (update) => {
    const task = writes.current
      .then(async () => {
        const before = latest.current,
          next = normalizeSettings(
            typeof update === "function" ? update(before) : update,
          );
        setSaved("Saving…");
        const response = await chrome.runtime.sendMessage({
          type: "noog:settings",
          patch: next,
          addCreators: next.allowedCreators.filter(
            (value) => !before.allowedCreators.includes(value),
          ),
          removeCreators: before.allowedCreators.filter(
            (value) => !next.allowedCreators.includes(value),
          ),
        });
        if (!response?.ok) throw new Error("save_failed");
        latest.current = response.settings;
        setSettings(response.settings);
        setSaved("Changes saved");
        if (next.enabled && next.sexual && model.state !== "ready")
          checkModel();
        return true;
      })
      .catch(() => {
        setSaved("Could not save. Try again.");
        return false;
      });
    writes.current = task;
    return task;
  };
  if (!settings)
    return (
      <p className="popup-loading" role="status">
        Loading NOOG…
      </p>
    );
  const policy = tab?.url ? sitePolicy(tab.url, settings) : null;
  const readiness = !settings.sexual
    ? "Caption filters enabled"
    : model.state === "ready"
      ? "Local model ready"
      : model.state === "failed"
        ? "Image checks unavailable"
        : "Preparing image checks";
  return (
    <>
      <Switchboard
        settings={settings}
        onChange={change}
        status={saved}
        readiness={readiness}
      />
      <section className="page-status" aria-label="Protection status">
        <p role="status">
          {policy?.title ??
            (policy?.kind === "site_paused"
              ? "This site is paused"
              : policy?.kind === "blocked"
                ? "This site is covered"
                : page?.enabled
                  ? "Filtering this page"
                  : settings.enabled
                    ? "Filtering eligible websites"
                    : "NOOG is paused")}
        </p>
        {policy?.detail && <p className="hint">{policy.detail}</p>}
        {settings.sexual && model.state === "failed" && (
          <>
            <p className="hint">
              Image checks could not start ({model.error}). Reload NOOG in
              Chrome’s extensions page, then retry. Caption filters still run.
            </p>
            <button className="pill-button" onClick={checkModel}>
              Retry image checks
            </button>
          </>
        )}
        {tab?.url?.startsWith("http") && !policy?.title && (
          <button
            className="text-button"
            onClick={() =>
              change((current) => ({
                ...current,
                pausedSites:
                  policy?.kind === "site_paused"
                    ? current.pausedSites.filter((host) => host !== policy.host)
                    : [...current.pausedSites, policy.host],
              }))
            }
          >
            {policy?.kind === "site_paused"
              ? "Resume this site"
              : "Pause this site"}
          </button>
        )}
        <p className="hint">
          Automatic on accessible websites. Known private apps, messages, forms
          and editable content are skipped. Image estimates and sampled video
          frames can miss content.
        </p>
        <a href="self-test.html" target="_blank" rel="noreferrer">
          Check protection setup
        </a>{" "}
        ·{" "}
        <a href="privacy.html" target="_blank" rel="noreferrer">
          Privacy
        </a>
      </section>
      <Backup settings={settings} onChange={change} />
    </>
  );
}
createRoot(document.getElementById("root")).render(<Popup />);
