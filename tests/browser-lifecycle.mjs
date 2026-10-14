import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createServer } from "node:http";
const image = await fs.readFile("public/assets/cats.webp");
const imageRequests = [],
  slowResponses = [];
const server = createServer((request, response) => {
  if (request.url.endsWith(".webp")) {
    if (!request.headers.referer) {
      imageRequests.push(request.url);
      setTimeout(
        () => {
          response.writeHead(200, { "Content-Type": "image/webp" });
          response.end(image);
        },
        request.url.startsWith("/queue") ? 4500 : 1600,
      );
    } else {
      response.writeHead(200, { "Content-Type": "image/webp" });
      response.end(image);
    }
    return;
  }
  response.writeHead(200, { "Content-Type": "text/html" });
  const style =
    "<style>article{width:400px;padding:10px}img{width:150px;height:100px}</style>";
  const article = (caption, images = []) =>
    `<article data-testid="tweet"><p data-testid="tweetText">${caption}</p>${images.map((url) => `<div data-testid="tweetPhoto"><img src="${url}"></div>`).join("")}</article>`;
  if (request.url === "/slow-start") {
    response.write("<!doctype html><html><head>" + style);
    slowResponses.push(() =>
      response.end(
        "</head><body>" +
          article("Join our casino and deposit now for a bonus") +
          "</body></html>",
      ),
    );
  } else if (request.url.startsWith("/queue-page")) {
    const index = request.url.split("/").at(-1);
    response.end(
      "<!doctype html><body>" +
        style +
        article("Photo " + index, [
          ...(index === "4" ? ["data:image/png;base64,YWJj"] : []),
          "/queue-" + index + ".webp",
        ]) +
        "</body>",
    );
  } else if (request.url === "/startup-race")
    response.end(
      "<!doctype html><body>" +
        style +
        article("Public race photo", ["/startup-race.webp"]) +
        "</body>",
    );
  else if (request.url === "/home")
    response.end(
      "<!doctype html><body>" +
        style +
        article("Public photos", [
          "/spa-1.webp",
          "/spa-2.webp",
          "/spa-3.webp",
          "/spa-4.webp",
        ]) +
        "</body>",
    );
  else
    response.end("<!doctype html><body>" + style + "Private messages</body>");
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port,
  profile = await fs.mkdtemp("/tmp/noog-lifecycle-"),
  extension = path.resolve(process.env.NOOG_EXTENSION_DIR ?? "dist/extension");
const context = await chromium.launchPersistentContext(profile, {
  ...(process.env.CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
    : { channel: "chromium" }),
  headless: true,
  args: [
    "--host-resolver-rules=MAP x.com 127.0.0.1",
    `--disable-extensions-except=${extension}`,
    `--load-extension=${extension}`,
  ],
});
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
async function until(predicate, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (!(await predicate())) {
    assert.ok(
      Date.now() < deadline,
      "condition did not settle before deadline",
    );
    await sleep(100);
  }
}
try {
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const id = new URL(worker.url()).hostname,
    control = await context.newPage();
  await control.goto(`chrome-extension://${id}/self-test.html`);
  const update = (patch) =>
    control.evaluate(
      (patch) => chrome.runtime.sendMessage({ type: "noog:settings", patch }),
      patch,
    );
  const slow = await context.newPage(),
    navigation = slow.goto(`http://x.com:${port}/slow-start`, {
      waitUntil: "load",
    });
  await until(() => slowResponses.length > 0);
  await slow.waitForFunction(() => !document.body);
  // Allow content initialization to begin while DOMContentLoaded remains pending.
  await sleep(250);
  assert.equal((await update({ enabled: false })).ok, true);
  slowResponses.shift()();
  await navigation;
  await sleep(600);
  assert.equal(
    await slow.locator(".noog-swap").count(),
    0,
    "pause during startup must be respected by the first scan",
  );
  assert.notEqual(
    await slow
      .locator("article")
      .evaluate((node) => getComputedStyle(node).display),
    "none",
  );
  await slow.close();
  await update({ enabled: true });
  const feeds = await Promise.all(
    [1, 2, 3].map(async (index) => {
      const page = await context.newPage();
      await page.goto(`http://x.com:${port}/queue-page/${index}`);
      return page;
    }),
  );
  await until(
    () =>
      new Set(imageRequests.filter((url) => url.startsWith("/queue"))).size ===
      3,
  );
  const fourth = await context.newPage();
  await fourth.goto(`http://x.com:${port}/queue-page/4`);
  feeds.push(fourth);
  await until(
    () =>
      new Set(imageRequests.filter((url) => url.startsWith("/queue"))).size ===
      4,
  );
  for (const feed of feeds) await feed.close();
  await until(async () => {
    const contexts = await worker.evaluate(() =>
      chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] }),
    );
    return contexts.length > 0;
  });
  await sleep(4700); // Finish outstanding slow reads before the SPA case.
  const feed = await context.newPage();
  await feed.goto(`http://x.com:${port}/home`);
  await until(() => imageRequests.includes("/spa-1.webp"));
  await feed.evaluate(() => history.pushState({}, "", "/messages/123"));
  await sleep(2300);
  assert.deepEqual(
    imageRequests.filter((url) => url.startsWith("/spa")),
    ["/spa-1.webp"],
    "private SPA transition must cancel queued image fetches",
  );
  assert.equal(await feed.locator(".noog-swap").count(), 0);
  await feed.close();
  await worker.evaluate(() => {
    globalThis.originalSessionGet = chrome.storage.session.get.bind(
      chrome.storage.session,
    );
    globalThis.storageReadBlocked = false;
    const gate = new Promise((resolve) => {
      globalThis.releaseStorageRead = resolve;
    });
    chrome.storage.session.get = async (...args) => {
      if (args[0] === "modelStatus") {
        globalThis.storageReadBlocked = true;
        await gate;
      }
      return globalThis.originalSessionGet(...args);
    };
  });
  const before = imageRequests.length,
    startupRace = await context.newPage();
  await startupRace.goto(`http://x.com:${port}/startup-race`);
  await until(() => worker.evaluate(() => globalThis.storageReadBlocked));
  await startupRace.evaluate(() => history.pushState({}, "", "/messages/456"));
  await sleep(300);
  await worker.evaluate(() => {
    globalThis.releaseStorageRead();
    chrome.storage.session.get = globalThis.originalSessionGet;
  });
  await sleep(800);
  assert.deepEqual(
    imageRequests.slice(before),
    [],
    "cancelled startup must not begin image fetch after storage resumes",
  );
  await startupRace.close();
  console.log(
    "Startup preferences, queue pressure and in-flight private SPA cancellation: passed",
  );
} finally {
  for (const end of slowResponses) end();
  await context.close();
  await fs.rm(profile, { recursive: true, force: true });
  await new Promise((resolve) => server.close(resolve));
}
