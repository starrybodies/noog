import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { imageDecision } from "../src/shared/filters.js";
const extension = path.resolve("dist/extension"),
  directory = await fs.mkdtemp("/tmp/noog-model-eval-");
const credits = JSON.parse(
  await fs.readFile("public/licenses-photo-credits.json", "utf8"),
);
const files = ["cats", "nature"].flatMap((kind) =>
  credits
    .filter((photo) => photo.kind === kind)
    .slice(0, 12)
    .map((photo) => photo.image),
);
const context = await chromium.launchPersistentContext(directory, {
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
  const serviceWorker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const page = await context.newPage();
  await page.goto(
    `chrome-extension://${new URL(serviceWorker.url()).hostname}/self-test.html`,
  );
  const results = await page.evaluate(async (files) => {
    const worker = new Worker("image-worker.js"),
      results = [];
    let id = 0;
    try {
      for (const file of files) {
        const blob = await (await fetch(file)).blob(),
          bytes = await blob.arrayBuffer();
        const result = await new Promise((resolve, reject) => {
          const timer = setTimeout(
            () => reject(new Error("model_timeout")),
            30000,
          );
          worker.onmessage = ({ data }) => {
            clearTimeout(timer);
            resolve(data);
          };
          worker.onerror = () => {
            clearTimeout(timer);
            reject(new Error("worker_failed"));
          };
          worker.postMessage({ id: ++id, bytes, mime: blob.type }, [bytes]);
        });
        results.push({ file, ...result });
      }
    } finally {
      worker.terminate();
    }
    return results;
  }, files);
  assert.ok(results.every((result) => result.ok && result.backend === "wasm"));
  const falseCovers = results.filter(
    (result) => imageDecision(result.scores, {}).action === "replace",
  );
  const timings = results
    .slice(1)
    .map((result) => result.elapsedMs)
    .sort((a, b) => a - b);
  const summary = {
    date: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    chrome: context.browser().version(),
    dataset:
      "12 licensed cat and 12 licensed nature photos bundled with NOOG; no human/explicit-image accuracy evaluation",
    samples: results.length,
    falseCovers: falseCovers.length,
    coldMs: results[0].elapsedMs,
    warmP50Ms: timings[Math.floor(timings.length * 0.5)],
    warmP95Ms: timings[Math.floor(timings.length * 0.95)],
    tensorBytesMin: Math.min(...results.map((result) => result.tensorBytes)),
    tensorBytesMax: Math.max(...results.map((result) => result.tensorBytes)),
    results,
  };
  assert.equal(
    summary.tensorBytesMin,
    summary.tensorBytesMax,
    "inference should not leak retained tensors",
  );
  await fs.writeFile(
    "dist/model-evaluation.json",
    JSON.stringify(summary, null, 2) + "\n",
  );
  console.log(JSON.stringify({ ...summary, results: undefined }, null, 2));
} finally {
  await context.close();
  await fs.rm(directory, { recursive: true, force: true });
}
