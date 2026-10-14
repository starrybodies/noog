import { chromium } from "playwright";
import { build } from "esbuild";
import assert from "node:assert/strict";
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
try {
  const page = await browser.newPage();
  await page.route("https://public.example.test/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><body><article style="width:400px;padding:20px">Join our casino and deposit now for a bonus</article>',
    }),
  );
  await page.goto("https://public.example.test/");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(async () => {
    let listener;
    // Control an actual storage-get boundary to deliver an unrelated correction
    // event while the newer paused-settings snapshot is being reconciled.
    globalThis.testController = await NoogTest.startContent({
      document,
      storage: {
        local: {
          get: async (key) => {
            if (Array.isArray(key)) {
              listener(
                { mediaExceptions: { newValue: ["a".repeat(64)] } },
                "local",
              );
              return {
                settings: { enabled: false, sexual: false },
                mediaExceptions: [],
              };
            }
            return key === "settings"
              ? { settings: { sexual: false } }
              : { mediaExceptions: [] };
          },
        },
        onChanged: {
          addListener(fn) {
            listener = fn;
          },
          removeListener() {},
        },
      },
      runtime: {
        id: "test",
        onMessage: { addListener() {}, removeListener() {} },
        sendMessage: async () => ({ action: "allow" }),
      },
      asset: () => "",
    });
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(
    await page.locator(".noog-swap").count(),
    0,
    "unrelated correction update must not discard refreshed pause preferences",
  );
  assert.notEqual(
    await page
      .locator("article")
      .evaluate((node) => getComputedStyle(node).display),
    "none",
  );
  await page.evaluate(() => globalThis.testController.stop());
  console.log("Concurrent initialization preferences/corrections: passed");
} finally {
  await browser.close();
}
