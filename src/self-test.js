const version = chrome.runtime.getManifest().version;
document.getElementById("version").textContent = version;
let report;
const button = document.getElementById("run-check"),
  status = document.getElementById("check-status"),
  results = document.getElementById("check-results"),
  save = document.getElementById("export-report");
button.addEventListener("click", async () => {
  button.disabled = true;
  save.hidden = true;
  results.replaceChildren();
  status.textContent = "Checking local protection…";
  const checks = [];
  function add(name, ok, detail) {
    const li = document.createElement("li");
    li.textContent = `${ok ? "PASS" : "ACTION"} · ${name}: ${detail}`;
    results.append(li);
    checks.push({ name, ok, detail });
  }
  try {
    const access = await chrome.permissions.contains({
      origins: ["https://*/*", "http://*/*"],
    });
    add(
      "Website access",
      access,
      access
        ? "Automatic HTTP(S) access is available."
        : "Allow website access in Chrome’s extension settings.",
    );
    const model = await chrome.runtime.sendMessage({ type: "noog:self-test" });
    add(
      "Local image model",
      model?.ok === true,
      model?.ok
        ? `WASM · ${model.labels} labels · ${model.elapsedMs} ms · ${model.tensorBytes} tensor bytes`
        : `Image checks unavailable (${model?.error ?? "model_worker_failed"}). Reload NOOG in Chrome’s extensions page and retry.`,
    );
    report = {
      version,
      checkedAt: new Date().toISOString(),
      checks,
      model: model?.ok
        ? {
            backend: model.backend,
            elapsedMs: model.elapsedMs,
            tensorBytes: model.tensorBytes,
          }
        : undefined,
    };
    status.textContent = checks.every((check) => check.ok)
      ? "Setup passed. Local checks are ready."
      : "Setup needs attention. See results below.";
    save.hidden = false;
  } catch {
    status.textContent = "Setup could not finish. Reload NOOG and try again.";
  } finally {
    button.disabled = false;
  }
});
save.addEventListener("click", () => {
  if (!report) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `NOOG-setup-${version}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
