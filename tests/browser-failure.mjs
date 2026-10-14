import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const directory = await fs.mkdtemp("/tmp/noog-model-failure-");
const extension = directory + "/extension";
await fs.cp("dist/extension", extension, { recursive: true });
await fs.rm(extension + "/wasm", { recursive: true });
const context = await chromium.launchPersistentContext(directory + "/profile", {
  ...(process.env.CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
    : { channel: "chromium" }),
  headless: true,
  args: [
    `--disable-extensions-except=${extension}`,
    `--load-extension=${extension}`,
  ],
});
try {
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const id = new URL(worker.url()).hostname;
  const requests = [];
  context.on("request", (request) => requests.push(request.url()));
  const page = await context.newPage();
  await page.goto(`chrome-extension://${id}/popup.html`);
  await page
    .getByRole("button", { name: "Retry image checks", exact: true })
    .waitFor({ timeout: 45000 });
  assert.equal(
    await page.locator(".status-pill").textContent(),
    "Image checks unavailable",
  );
  const state = await page.evaluate(() =>
    chrome.runtime.sendMessage({ type: "noog:model-status" }),
  );
  assert.equal(state.state, "failed");
  assert.ok(["model_load_failed", "model_timeout"].includes(state.error));
  assert.equal(
    requests.some((url) => /^https?:/.test(url)),
    false,
    "model failure must not contact a remote service",
  );
  await context.route("https://failure.noog.test/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><body><article style="width:400px;padding:20px">Join our casino and deposit now for a bonus</article></body>',
    }),
  );
  const feed = await context.newPage();
  await feed.goto("https://failure.noog.test/");
  await feed
    .locator(".noog-swap")
    .getByRole("button", { name: "Show once", exact: true })
    .waitFor();
  await feed
    .locator(".noog-swap")
    .getByRole("button", { name: "Show once", exact: true })
    .click();
  assert.equal(
    await feed
      .locator("article")
      .evaluate((node) => getComputedStyle(node).display),
    "block",
  );
  console.log(
    "Missing WASM: honest failure status, no remote fallback, caption filtering and reveal passed",
  );
} finally {
  await context.close();
  await fs.rm(directory, { recursive: true, force: true });
}
