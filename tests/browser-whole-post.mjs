import { chromium } from "playwright";
import { build } from "esbuild";
import assert from "node:assert/strict";

// Exercise actual DOM, observers, caption rules and covers. Only replace the
// runtime/model boundary, so verdicts and lifecycle races stay deterministic.
const bundle = await build({
  entryPoints: ["src/content.js"],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "NoogTest",
  platform: "browser",
});
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
    : { channel: "chromium" }),
  headless: true,
});
const image = '<div data-testid="tweetPhoto"><img src="https://media.example.test/photo.webp" alt="A calm landscape"></div>';
const promotion = "Join our casino and deposit now for a bonus";
const tweet = (body) => `<article data-testid="tweet">${body}</article>`;
const checks = [];
const errors = [];
async function fixture(body, { host = "x.com", settings = {}, verdict = "image" } = {}) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  page.setDefaultTimeout(3500);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://media.example.test/**", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="green"/></svg>',
  }));
  await page.route(`https://${host}/**`, (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><style>body{margin:12px}article,shreddit-post{display:block;width:100%;max-width:350px}img,video{width:240px;height:160px}</style><body>${body}</body>`,
  }));
  await page.goto(`https://${host}/home`);
  await page.evaluate(async () => {
    // Isolate play-driven stream changes from a later metadata event.
    globalThis.delayMetadata = false;
    document.addEventListener("loadeddata", (event) => {
      if (globalThis.delayMetadata) event.stopImmediatePropagation();
    }, true);
    globalThis.testStreams = [];
    for (const video of document.querySelectorAll("video")) {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 160;
      canvas.getContext("2d").fillRect(0, 0, 240, 160);
      const stream = canvas.captureStream();
      globalThis.testStreams.push(stream);
      video.srcObject = stream;
      video.muted = true;
      await video.play();
    }
  });
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(async ({ settings, verdict }) => {
    let listener;
    let preferences = { shieldWhileChecking: false, ...settings };
    let exceptions = [];
    globalThis.messages = [];
    globalThis.verdict = verdict;
    globalThis.updateSettings = (patch) => {
      preferences = { ...preferences, ...patch };
      listener({ settings: { newValue: preferences } }, "local");
    };
    globalThis.testController = await NoogTest.startContent({
      document,
      storage: {
        local: { get: async () => ({ settings: preferences, mediaExceptions: exceptions }) },
        onChanged: { addListener(fn) { listener = fn; }, removeListener() {} },
      },
      runtime: {
        id: "whole-post-test",
        onMessage: { addListener() {}, removeListener() {} },
        sendMessage: async (message) => {
          if (message.type === "noog:allow-media") {
            exceptions.push(message.hash);
            listener({ mediaExceptions: { newValue: exceptions } }, "local");
            return { ok: true };
          }
          if (message.type === "noog:allow-creator") {
            globalThis.updateSettings({ allowedCreators: [message.creator] });
            return { ok: true };
          }
          globalThis.messages.push(message);
          if (globalThis.verdict === "allow") return { action: "allow", reason: "local_image_no_match" };
          return {
            action: "replace",
            reason: "local_image_model",
            category: "Pornographic images",
            mediaMatches: globalThis.verdict === "video"
              ? { images: [], videos: [0] }
              : { images: message.images.slice(0, 1), videos: [] },
          };
        },
      },
      asset: () => "https://media.example.test/replacement.webp",
    });
  }, { settings, verdict });
  return page;
}
async function cover(page) {
  await page.locator(".noog-swap").first().waitFor();
}
async function hidden(page, selector = "article") {
  assert.equal(await page.locator(selector).evaluate((node) => getComputedStyle(node).display), "none", "whole post must hide caption, CTA and every original media item");
}
async function visible(page, selector = "article") {
  assert.notEqual(await page.locator(selector).evaluate((node) => getComputedStyle(node).display), "none", "original post must be restored");
}
function check(name, run) { checks.push([name, run]); }

check("image verdict hides complete post and all media; Show once restores", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">Special offer details</p><a href="/buy">Buy now</a>${image}${image}<video></video><video></video>`));
  try {
    await cover(page);
    await hidden(page);
    assert.equal(await page.locator(".noog-swap").count(), 1);
    assert.deepEqual(await page.locator("video").evaluateAll((videos) => videos.map((video) => video.paused)), [true, true], "image verdict pauses every post video");
    await page.getByRole("button", { name: "Show once", exact: true }).click();
    await visible(page);
    assert.equal(await page.locator(".noog-swap").count(), 0);
  } finally { await page.close(); }
});
check("video verdict covers caption, CTA, images and every post video", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">Video offer</p><a href="/buy">Buy now</a>${image}<video></video><video></video>`), { verdict: "video" });
  try {
    await cover(page);
    await hidden(page);
    assert.deepEqual(await page.locator("video").evaluateAll((videos) => videos.map((video) => video.paused)), [true, true]);
    await page.evaluate(() => document.querySelectorAll("video")[1].play());
    assert.equal(await page.locator("video").nth(1).evaluate((video) => video.paused), true, "all covered videos reject resumed playback");
  } finally { await page.close(); }
});
check("text-only caption rule covers whole supported post", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">${promotion}</p><a href="/buy">Deposit</a>`), { settings: { sexual: false } });
  try { await cover(page); await hidden(page); assert.equal(await page.evaluate(() => messages.length), 0); }
  finally { await page.close(); }
});
check("standalone media retains sized tile and nearby public text", async () => {
  const page = await fixture(`<p id="neighbor">Independent nearby paragraph</p>${image}`, { host: "public.example.test" });
  try {
    await cover(page);
    assert.equal(await page.locator(".noog-swap").getAttribute("data-noog-tile"), "");
    assert.equal(await page.locator("img:not([data-noog-owned])").first().evaluate((node) => getComputedStyle(node).visibility), "hidden");
    assert.equal(await page.locator("#neighbor").isVisible(), true);
    await page.getByRole("button", { name: "Show once", exact: true }).click();
    assert.equal(await page.locator("body > div > img").evaluate((node) => getComputedStyle(node).visibility), "visible");
  } finally { await page.close(); }
});
check("Keep post persists exception across settings re-scan", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">Public image</p>${image}`));
  try {
    await cover(page);
    await page.getByRole("button", { name: "Keep this post", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector(".noog-swap"));
    await visible(page);
    await page.evaluate(() => updateSettings({ sensitivity: "strong" }));
    await page.waitForTimeout(400);
    await visible(page);
    assert.equal(await page.locator(".noog-swap").count(), 0);
  } finally { await page.close(); }
});
check("creator exception restores full post", async () => {
  const page = await fixture(tweet(`<a href="/publiccat/status/123">Public cat</a><p data-testid="tweetText">Public image</p>${image}`));
  try {
    await cover(page);
    await page.getByRole("button", { name: "This creator is fine", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector(".noog-swap"));
    await visible(page);
  } finally { await page.close(); }
});
check("pause restores complete post", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">Public image</p>${image}`));
  try {
    await cover(page);
    await page.evaluate(() => updateSettings({ enabled: false }));
    await visible(page);
    assert.equal(await page.locator(".noog-swap").count(), 0);
    assert.equal(await page.locator("article img").evaluate((node) => getComputedStyle(node).visibility), "visible");
  } finally { await page.close(); }
});
check("Instagram visible caption supplements benign image alt", async () => {
  const page = await fixture(`<article>${image}<ul><li><h3><a href="/publiccat/">publiccat</a></h3><span dir="auto">${promotion}</span></li></ul></article>`, { host: "www.instagram.com", settings: { sexual: false } });
  try { await cover(page); await hidden(page); }
  finally { await page.close(); }
});
check("Instagram username cannot suppress a promotional image alt", async () => {
  const page = await fixture(`<article><a href="/publiccat/"><span dir="auto">publiccat</span></a><img src="https://media.example.test/photo.webp" alt="${promotion}"></article>`, { host: "www.instagram.com", settings: { sexual: false } });
  try { await cover(page); await hidden(page); }
  finally { await page.close(); }
});
check("Instagram heading and data caption are combined", async () => {
  const page = await fixture(`<article><h1>Ordinary title</h1><div data-testid="post-caption">${promotion}</div>${image}</article>`, { host: "www.instagram.com", settings: { sexual: false } });
  try { await cover(page); await hidden(page); }
  finally { await page.close(); }
});
check("Reddit benign title cannot mask promotional post body", async () => {
  const page = await fixture(`<shreddit-post post-title="A normal day" author="publiccat"><h2 slot="title">A normal day</h2><div slot="text-body">${promotion}</div>${image}</shreddit-post>`, { host: "www.reddit.com", settings: { sexual: false } });
  try { await cover(page); await hidden(page, "shreddit-post"); }
  finally { await page.close(); }
});
check("private descendants and private routes are excluded before reading", async () => {
  const page = await fixture(`<article><h1>${promotion}</h1>${image}<div contenteditable="true">Secret draft</div></article>`, { host: "www.instagram.com" });
  try {
    const post = await page.evaluate(() => NoogTest.createAdapter(document).read(document.querySelector("article")));
    assert.equal(post.excluded, true, "read must refuse private/editor containers even when called directly");
    assert.equal(post.caption, "");
    assert.deepEqual(post.images, []);
    assert.equal(await page.evaluate(() => messages.length), 0);
    await page.evaluate(() => history.pushState({}, "", "/direct/inbox"));
    const privatePost = await page.evaluate(() => NoogTest.createAdapter(document).read(document.querySelector("article")));
    assert.equal(privatePost.excluded, true);
    assert.equal(privatePost.caption, "");
  } finally { await page.close(); }
});
check("editor transition restores previously hidden post", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">${promotion}</p>`), { settings: { sexual: false } });
  try {
    await cover(page); await hidden(page);
    await page.locator("article").evaluate((node) => node.setAttribute("contenteditable", "true"));
    await page.waitForFunction(() => !document.querySelector(".noog-swap"));
    await visible(page);
  } finally { await page.close(); }
});
check("removed overlay cannot strand hidden original", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">${promotion}</p>`), { settings: { sexual: false } });
  try {
    await cover(page); await hidden(page);
    await page.locator(".noog-swap").evaluate((node) => node.remove());
    await page.waitForFunction(() => getComputedStyle(document.querySelector("article")).display !== "none" || !!document.querySelector(".noog-swap"), null, { timeout: 2500 });
    assert.equal(await page.locator(".noog-swap").count(), 1, "still-matching post must regain a visible replacement");
  } finally { await page.close(); }
});
check("recycled hidden post restores when text no longer matches", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">${promotion}</p>`), { settings: { sexual: false } });
  try {
    await cover(page); await hidden(page);
    await page.locator("article p").evaluate((node) => { node.textContent = "An ordinary afternoon"; });
    await page.waitForFunction(() => !document.querySelector(".noog-swap"));
    await visible(page);
  } finally { await page.close(); }
});
check("play on changed covered stream rechecks fingerprint and restores benign post", async () => {
  const page = await fixture(tweet('<p data-testid="tweetText">A public video</p><video></video>'), { verdict: "video" });
  try {
    await cover(page);
    // Finish the cover's own queued style-mutation scan before recycling it.
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      globalThis.verdict = "allow";
      globalThis.delayMetadata = true;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 160;
      canvas.getContext("2d").fillRect(0, 0, 160, 160);
      const stream = canvas.captureStream();
      testStreams.push(stream);
      const video = document.querySelector("video");
      video.srcObject = stream;
      video.dispatchEvent(new Event("play", { bubbles: true }));
    });
    await page.waitForFunction(() => !document.querySelector(".noog-swap"), null, { timeout: 2500 });
    await visible(page);
    assert.ok(await page.evaluate(() => messages.length >= 2), "new stream must reach analysis");
  } finally { await page.close(); }
});
check("photo replacement caption stays readable at narrow width with credit", async () => {
  const page = await fixture(tweet(`<p data-testid="tweetText">${promotion}</p>`), { settings: { sexual: false } });
  try {
    await cover(page);
    const caption = page.locator(".noog-swap .photo-caption");
    assert.equal(await caption.count(), 1, "photo card must show original harmless caption");
    assert.ok((await caption.textContent()).length > 10);
    assert.equal(await caption.evaluate((node) => node.scrollWidth <= node.clientWidth), true);
    assert.equal(await page.locator(".noog-swap .photo-credit a").count(), 1);
  } finally { await page.close(); }
});

let failed = 0;
try {
  for (const [name, run] of checks) {
    try { await run(); console.log(`PASS ${name}`); }
    catch (error) { failed++; console.error(`FAIL ${name}\n${error.message}`); }
  }
  assert.deepEqual(errors, [], "browser runtime errors");
  assert.equal(failed, 0, `${failed} whole-post regression(s) failed`);
  console.log(`Whole-post filtering: ${checks.length} checks passed`);
} finally { await browser.close(); }
