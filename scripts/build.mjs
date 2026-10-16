import { build } from "esbuild";
import fs from "node:fs/promises";
const out = "dist/extension";
await fs.rm("dist", { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
await fs.cp("public", out, { recursive: true });
await fs.mkdir(out + "/wasm", { recursive: true });
for (const name of ["tfjs-backend-wasm.wasm", "tfjs-backend-wasm-simd.wasm"])
  await fs.copyFile(
    "node_modules/@tensorflow/tfjs-backend-wasm/dist/" + name,
    out + "/wasm/" + name,
  );
await build({
  entryPoints: [
    "src/background.js",
    "src/content.js",
    "src/offscreen.js",
    "src/image-worker.js",
    "src/popup.jsx",
    "src/self-test.js",
    "src/welcome.js",
    "src/kitty-game.js",
  ],
  outdir: out,
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "chrome116",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "external",
  metafile: true,
}).then(async (result) =>
  fs.writeFile(
    "dist/build-meta.json",
    JSON.stringify(result.metafile, null, 2),
  ),
);
console.log("Built NOOG extension in " + out);
