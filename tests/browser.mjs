import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createServer } from "node:http";
const extension = path.resolve(
  process.env.NOOG_EXTENSION_DIR ?? "dist/extension",
);
const image = await fs.readFile("public/assets/cats.webp");
const imageRequests = [];
const server = createServer((req, res) => {
  if (req.url.endsWith(".webp")) {
    imageRequests.push({
      path: req.url,
      cookie: req.headers.cookie,
      referer: req.headers.referer,
    });
    res.writeHead(200, { "Content-Type": "image/webp" });
    res.end(image);
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  if (req.url === "/frame") {
    res.end(
      "<!doctype html><body><article>Join our casino and deposit now for a bonus</article></body>",
    );
    return;
  }
  const tweet = req.headers.host.startsWith("x.com");
  res.end(`<!doctype html><html><head><style>article{padding:10px;width:400px}img{width:240px;height:160px}body{margin:10px}</style></head><body>
 <article id="promotion" ${tweet ? 'data-testid="tweet"' : ""}><span ${tweet ? 'data-testid="tweetText"' : ""}>Join our casino and deposit now for a bonus</span></article>
 <article id="benign" ${tweet ? 'data-testid="tweet"' : ""}><span ${tweet ? 'data-testid="tweetText"' : ""}>A calm cat photo</span><img src="/benign.webp"></article>
 <form><article id="private-form"><p>Join our casino and deposit now for a bonus</p><img src="/private-form.webp"><textarea>Private conversation</textarea></article></form>
 <section contenteditable="true"><article id="private-editor">Join our casino and deposit now for a bonus<img src="/private-editor.webp"></article></section>
 <article id="embedded"><iframe src="/frame"></iframe></article>
 </body></html>`);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const profile = await fs.mkdtemp("/tmp/noog-browser-");
const context = await chromium.launchPersistentContext(profile, {
  ...(process.env.CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
    : { channel: "chromium" }),
  headless: true,
  args: [
    "--host-resolver-rules=MAP fixture.noog.test 127.0.0.1, MAP x.com 127.0.0.1, MAP app.slack.com 127.0.0.1",
    `--disable-extensions-except=${extension}`,
    `--load-extension=${extension}`,
  ],
});
try {
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const id = new URL(worker.url()).hostname;
  const analysis = [];
  await worker.evaluate(() => {
    globalThis.noogTestMessages = [];
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === "noog:analyse")
        globalThis.noogTestMessages.push({
          caption: message.caption,
          images: message.images,
        });
    });
  });
  const errors = [];
  context.on("page", (page) =>
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.error("Browser runtime error:", error.message);
    }),
  );
  const page = await context.newPage();
  await page.goto(`chrome-extension://${id}/self-test.html`);
  const result = await page.evaluate(() =>
    chrome.runtime.sendMessage({ type: "noog:self-test" }),
  );
  console.log("Cold model check:", result);
  assert.equal(
    result?.ok,
    true,
    "bundled model must start under the release CSP",
  );
  assert.equal(result.backend, "wasm");
  assert.equal(result.labels, 5);
  const warm = await page.evaluate(() =>
    chrome.runtime.sendMessage({ type: "noog:self-test" }),
  );
  console.log("Warm model check:", warm);
  assert.equal(warm.ok, true);
  assert.equal(
    warm.tensorBytes,
    result.tensorBytes,
    "warm inference must not accumulate tensors",
  );
  await context.addCookies([
    {
      name: "private-token",
      value: "test-value",
      domain: "fixture.noog.test",
      path: "/",
    },
  ]);
  const feed = await context.newPage();
  await feed.goto(`http://fixture.noog.test:${port}/public`);
  await feed
    .locator(".noog-swap")
    .getByRole("button", { name: "Show once", exact: true })
    .waitFor();
  assert.equal(
    await feed
      .locator("#promotion")
      .evaluate((node) => getComputedStyle(node).display),
    "none",
  );
  assert.equal(
    await feed
      .locator("#private-form")
      .evaluate((node) => getComputedStyle(node).display),
    "block",
  );
  assert.equal(
    await feed
      .locator("#private-editor")
      .evaluate((node) => getComputedStyle(node).display),
    "block",
  );
  await feed.waitForFunction(
    () => document.querySelector("#benign img").complete,
  );
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const messages = await worker.evaluate(() => globalThis.noogTestMessages);
  assert.ok(
    messages.some((message) => message.caption === "A calm cat photo"),
    "fresh install must analyze general websites",
  );
  assert.ok(
    messages.every(
      (message) => !message.images?.some((url) => url.includes("private-")),
    ),
    "forms and editable content must never reach inference",
  );
  assert.equal(
    await feed
      .locator("#benign")
      .evaluate((node) => getComputedStyle(node).display),
    "block",
  );
  await feed.evaluate(() => {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<article><p>Public story</p><form>Private form transcript<img src="/private-transcript.webp"></form></article><article><p>Public story</p><section role="textbox">Private textbox draft<img src="/private-textbox.webp"></section></article>',
    );
  });
  await new Promise((resolve) => setTimeout(resolve, 800));
  assert.equal(
    (await worker.evaluate(() => globalThis.noogTestMessages)).some(
      (message) =>
        message.caption.includes("Private form transcript") ||
        message.caption.includes("Private textbox draft"),
    ),
    false,
    "private descendant regions must be excluded before reading the whole card",
  );
  await feed.evaluate(
    () =>
      (document.querySelector("#benign").innerHTML =
        '<p>Private draft</p><textarea>Personal text</textarea><img src="/private-draft.webp">'),
  );
  await new Promise((resolve) => setTimeout(resolve, 800));
  assert.equal(
    (await worker.evaluate(() => globalThis.noogTestMessages)).some(
      (message) =>
        message.caption.includes("Private draft") ||
        message.images?.some((url) => url.includes("private-draft")),
    ),
    false,
    "public card turned into an editor must not leak its private draft",
  );
  await feed
    .locator(".noog-swap")
    .getByRole("button", { name: "Show once", exact: true })
    .click();
  assert.equal(
    await feed
      .locator("#promotion")
      .evaluate((node) => getComputedStyle(node).display),
    "block",
  );
  await feed.reload();
  await feed.evaluate(() => window.scrollTo(0, 0));
  await new Promise((resolve) => setTimeout(resolve, 500));
  await feed
    .locator(".noog-swap")
    .getByRole("button", { name: "Keep this post", exact: true })
    .click();
  await feed.waitForFunction(
    () =>
      getComputedStyle(document.querySelector("#promotion")).display !== "none",
  );
  await feed.reload();
  await feed.evaluate(() => window.scrollTo(0, 0));
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(
    await feed.locator(".noog-swap").count(),
    0,
    "kept post must stay revealed after reload",
  );
  for (const privateUrl of [
    `http://x.com:${port}/messages/123`,
    `http://app.slack.com:${port}/client/T/C`,
  ]) {
    const before = (await worker.evaluate(() => globalThis.noogTestMessages))
      .length;
    await feed.goto(privateUrl);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    assert.equal(
      (await worker.evaluate(() => globalThis.noogTestMessages)).length,
      before,
      "private page must not send captions or media",
    );
    assert.equal(await feed.locator(".noog-swap").count(), 0);
  }
  await feed.goto(`http://x.com:${port}/home`);
  await new Promise((resolve) => setTimeout(resolve, 800));
  await feed.evaluate(() => history.pushState({}, "", "/messages/123"));
  await new Promise((resolve) => setTimeout(resolve, 1200));
  assert.equal(
    await feed.locator(".noog-swap").count(),
    0,
    "SPA move to private messages must remove covers",
  );
  const before = (await worker.evaluate(() => globalThis.noogTestMessages))
    .length;
  await feed.evaluate(
    () =>
      (document.querySelector("#benign span").textContent =
        "Private conversation changed"),
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(
    (await worker.evaluate(() => globalThis.noogTestMessages)).length,
    before,
    "SPA private messages must not be analyzed",
  );
  await page.goto(`chrome-extension://${id}/popup.html`);
  await page.getByRole("checkbox", { name: "Pornographic images" }).waitFor();
  assert.ok(
    (await page.locator("body").innerText()).includes("Local model ready"),
  );
  assert.equal(
    await page
      .getByRole("button", { name: /Plus|API key|Enable across/ })
      .count(),
    0,
  );
  await page.getByRole("button", { name: "Pause NOOG", exact: true }).click();
  await page
    .getByRole("button", { name: "Resume NOOG", exact: true })
    .waitFor();
  await feed.goto(`http://fixture.noog.test:${port}/paused`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(
    await feed.locator(".noog-swap").count(),
    0,
    "global pause must restore content",
  );
  assert.deepEqual(
    errors,
    [],
    "extension pages and content scripts must be free of runtime errors",
  );
  const externalImageFetches = imageRequests.filter(
    (request) => !request.referer,
  );
  assert.ok(
    imageRequests.some(
      (request) =>
        request.referer && request.cookie === "private-token=test-value",
    ),
    "fixture page should have an authenticated cookie",
  );
  assert.ok(
    externalImageFetches.some((request) => request.path === "/benign.webp"),
    "local worker must fetch public images without page referrer",
  );
  assert.ok(
    externalImageFetches.every(
      (request) => !request.cookie && !request.path.includes("private-"),
    ),
  );
  console.log(
    "Automatic filtering, benign image, privacy, SPA, reversal, persistence, popup and pause: passed",
  );
} finally {
  await context.close();
  await fs.rm(profile, { recursive: true, force: true });
  await new Promise((resolve) => server.close(resolve));
}
