import * as tf from "@tensorflow/tfjs";
import { setWasmPaths, setThreadsCount } from "@tensorflow/tfjs-backend-wasm";
import { load } from "nsfwjs/core";
import { MobileNetV2Model } from "nsfwjs/models/mobilenet_v2";

let modelPromise;
async function model() {
  if (!modelPromise)
    modelPromise = (async () => {
      tf.enableProdMode();
      // MV3 prohibits the blob scripts created by the threaded WASM backend.
      // One SIMD worker keeps executable code packaged and respects the release CSP.
      tf.env().set("WASM_HAS_MULTITHREAD_SUPPORT", false);
      setThreadsCount(1);
      setWasmPaths(new URL("./wasm/", self.location.href).href);
      if (!(await tf.setBackend("wasm"))) throw new Error("wasm_unavailable");
      await tf.ready();
      return load("MobileNetV2", {
        size: 224,
        modelDefinitions: [MobileNetV2Model],
      });
    })().catch((error) => {
      modelPromise = undefined;
      throw error;
    });
  return modelPromise;
}

let queue = Promise.resolve();
self.onmessage = ({ data: { id, bytes, mime } }) => {
  queue = queue.then(async () => {
    let bitmap,
      tensor,
      stage = "model_load_failed";
    try {
      const start = performance.now();
      const classifier = await model();
      stage = "image_unreadable";
      bitmap = await createImageBitmap(new Blob([bytes], { type: mime }), {
        resizeWidth: 224,
        resizeHeight: 224,
        resizeQuality: "medium",
      });
      const canvas = new OffscreenCanvas(224, 224);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(bitmap, 0, 0, 224, 224);
      tensor = tf.browser.fromPixels(context.getImageData(0, 0, 224, 224));
      stage = "inference_failed";
      const predictions = await classifier.classify(tensor, 5);
      tensor.dispose();
      tensor = undefined;
      self.postMessage({
        id,
        ok: true,
        scores: Object.fromEntries(
          predictions.map((p) => [p.className, p.probability]),
        ),
        elapsedMs: Math.round(performance.now() - start),
        backend: tf.getBackend(),
        tensorBytes: tf.memory().numBytes,
      });
    } catch {
      self.postMessage({ id, ok: false, error: stage });
    } finally {
      bitmap?.close();
      tensor?.dispose();
    }
  });
};
