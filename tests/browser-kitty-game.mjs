import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { chromium } from "playwright";

const root = path.resolve(process.env.NOOG_EXTENSION_DIR ?? "dist/extension");
const prefix = "/portable/noog/";
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png" };
const server = createServer(async (request, response) => {
  try {
    const name = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (!name.startsWith(prefix)) throw new Error("outside portable root");
    const file = path.resolve(root, name.slice(prefix.length));
    if (!file.startsWith(root + path.sep)) throw new Error("outside root");
    const body = await fs.readFile(file);
    response.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
});
try {
  const context = await browser.newContext();
  const launcher = await context.newPage();
  const opened = launcher.waitForEvent("popup");
  await launcher.evaluate((url) => window.open(url), origin + prefix + "kitty-game.html");
  const page = await opened;
  const failures = [], external = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("request", (request) => {
    if (!request.url().startsWith(origin + prefix)) external.push(request.url());
  });
  await page.clock.install();
  await page.goto(origin + prefix + "kitty-game.html");
  const start = page.getByRole("button", { name: "Start game", exact: true });
  assert.equal(await start.count(), 1, "portable game must offer an explicit start before playing");
  assert.equal(await page.getByRole("button", { name: "Catch kitty", exact: true }).isVisible(), false);
  await start.focus();
  await page.keyboard.press("Enter");
  const kitty = page.getByRole("button", { name: "Catch kitty", exact: true });
  assert.equal(await kitty.evaluate((node) => node === document.activeElement), true, "starting moves keyboard focus to kitty");
  await page.keyboard.press("Space");
  assert.equal(await page.locator("#score").textContent(), "1");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#score").textContent(), "2", "keyboard catches increment real score");
  await page.clock.runFor(2000);
  const remaining = await page.locator("#time").textContent();
  // Visibility is a browser boundary: emulate it, then exercise the real pause path.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(20000);
  assert.equal(await page.locator("#time").textContent(), remaining, "hidden pages must not consume session time");
  assert.equal(await kitty.isDisabled(), true, "hidden sessions cannot score");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.getByRole("button", { name: "Resume game", exact: true }).click();
  await page.clock.runFor(16000);
  assert.equal(await kitty.isVisible(), false, "session finishes after its remaining time");
  assert.match(await page.locator("#game-status").textContent(), /2.*8/);
  const restart = page.getByRole("button", { name: "Play again", exact: true });
  await restart.click();
  assert.equal(await page.locator("#score").textContent(), "0", "restart clears previous session score");
  await kitty.focus();
  for (let count = 0; count < 8; count++) await page.keyboard.press("Enter");
  assert.equal(await kitty.isVisible(), false, "eight catches complete a session early");
  assert.match(await page.locator("#game-status").textContent(), /8.*8/);
  assert.equal(await page.locator("#game").evaluate((node) => node.dataset.state), "finished");
  await page.setViewportSize({ width: 1000, height: 820 });
  await fs.mkdir("docs/verification", { recursive: true });
  await page.screenshot({ path: "docs/verification/2026-10-16-kitty-game-desktop.png", fullPage: true });
  const closed = page.waitForEvent("close");
  await page.getByRole("button", { name: "Close game", exact: true }).click();
  await closed;
  await context.close();

  const reduced = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 320, height: 740 } });
  const narrow = await reduced.newPage();
  await narrow.clock.install();
  await narrow.goto(origin + prefix + "kitty-game.html");
  await narrow.getByRole("button", { name: "Start game", exact: true }).click();
  const reducedKitty = narrow.getByRole("button", { name: "Catch kitty", exact: true });
  const before = await reducedKitty.boundingBox();
  await reducedKitty.click();
  await narrow.clock.runFor(2000);
  assert.deepEqual(await reducedKitty.boundingBox(), before, "reduced motion keeps target in one position");
  assert.equal(await narrow.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "narrow layout has no horizontal overflow");
  const board = await narrow.locator("#playfield").boundingBox();
  const target = await reducedKitty.boundingBox();
  assert.ok(target.x >= board.x && target.y >= board.y && target.x + target.width <= board.x + board.width && target.y + target.height <= board.y + board.height, "target stays bounded by board");
  await narrow.screenshot({ path: "docs/verification/2026-10-16-kitty-game-narrow.png", fullPage: true });
  await narrow.getByRole("button", { name: "Pause game", exact: true }).click();
  await narrow.keyboard.press("Escape");
  assert.equal(await narrow.locator("#game").isVisible(), false, "close also dismisses game in a directly opened browser tab");
  assert.equal(await narrow.getByRole("button", { name: "Open game again", exact: true }).isVisible(), true);
  await narrow.getByRole("button", { name: "Open game again", exact: true }).click();
  assert.equal(await narrow.getByRole("button", { name: "Start game", exact: true }).isVisible(), true);

  await narrow.addInitScript((base) => {
    window.chrome = { runtime: { getManifest: () => ({ version: "test" }), getURL: (name) => base + name } };
  }, origin + prefix);
  await narrow.goto(origin + prefix + "welcome.html");
  const mascot = narrow.getByRole("button", { name: /kitty.*three times/i });
  assert.equal(await mascot.count(), 1, "mascot route has a descriptive accessible name");
  await mascot.focus();
  await narrow.keyboard.press("Enter");
  await narrow.keyboard.press("Space");
  assert.equal(await narrow.getByRole("link", { name: "Play kitty break" }).isVisible(), false, "game stays hidden before third mascot activation");
  await narrow.keyboard.press("Enter");
  const gameLink = narrow.getByRole("link", { name: "Play kitty break" });
  assert.equal(await gameLink.isVisible(), true);
  assert.equal(await gameLink.getAttribute("href"), origin + prefix + "kitty-game.html", "extension route uses runtime URL");
  assert.deepEqual(failures, [], "game has no browser errors");
  assert.deepEqual(external, [], "game makes no external requests");
  await reduced.close();

  const profile = await fs.mkdtemp(path.join(tmpdir(), "noog-kitty-ui-"));
  const extension = await chromium.launchPersistentContext(profile, {
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : { channel: "chromium" }),
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`],
  });
  try {
    const worker = extension.serviceWorkers()[0] ?? await extension.waitForEvent("serviceworker");
    const id = new URL(worker.url()).hostname;
    const popup = await extension.newPage();
    await popup.goto(`chrome-extension://${id}/popup.html`);
    const popupKitty = popup.getByRole("button", { name: /kitty.*three times/i });
    await popupKitty.waitFor();
    await popupKitty.focus();
    await popup.keyboard.press("Enter");
    await popup.keyboard.press("Space");
    assert.equal(await popup.getByRole("button", { name: "Play kitty break" }).count(), 0);
    await popup.keyboard.press("Enter");
    const entry = popup.getByRole("button", { name: "Play kitty break" });
    await entry.waitFor();
    await popup.setViewportSize({ width: 400, height: 950 });
    await popup.screenshot({ path: "docs/verification/2026-10-16-kitty-popup.png", fullPage: true });
    const newTab = extension.waitForEvent("page");
    await entry.click();
    const extensionGame = await newTab;
    await extensionGame.waitForLoadState();
    assert.equal(extensionGame.url(), `chrome-extension://${id}/kitty-game.html`, "popup opens the bundled extension game");
    assert.equal(await extensionGame.getByRole("button", { name: "Start game", exact: true }).count(), 1);
    await popup.goto(`chrome-extension://${id}/welcome.html`);
    await popup.setViewportSize({ width: 860, height: 900 });
    await popup.screenshot({ path: "docs/verification/2026-10-16-kitty-welcome.png", fullPage: true });
  } finally {
    await extension.close();
    await fs.rm(profile, { recursive: true, force: true });
  }
  console.log("Portable kitty game: keyboard, score, finish, restart, pause, close, reduced motion, narrow layout and mascot reveal passed");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
