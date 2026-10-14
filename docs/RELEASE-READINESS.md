# NOOG 0.10.0 release readiness

October 14, 2026 · Implementation verified; Chrome Web Store submission pending publisher setup.

## Implemented

- Automatic filtering on accessible top-level HTTP(S) pages, with private-page, local/intranet, form and editor exclusions before analysis.
- Bundled MobileNetV2 image inference with TensorFlow WASM; local caption rules. No account, API key, remote inference, Plus, billing, scheduling or per-site activation flow.
- Reversible covers, persistent kept-post fingerprints, site/global pause and validated settings backup.
- Actual model readiness and actionable failure status; current onboarding and privacy disclosures.
- Recovered editable application modules, pinned dependencies, build, lockfile, CI and deterministic upload ZIP. Original Sites source was inaccessible; this is reconstructed source from the distribution, not an original project export.

## Failure diagnosis

The original 0.9.0 setup check returned `image_worker_failed` in an isolated Chromium profile. Direct worker diagnostics showed threaded WASM blob scripts failing `importScripts` under the release security policy. Disabling threaded WASM in a temporary diagnostic copy made the same bundled model succeed. The production worker now explicitly selects non-threaded WASM without relaxing the policy or introducing CPU/remote fallback.

## Verification

Seven unit tests pass. Four browser suites pass using clean profiles and the actual generated extension:

- Fresh-install model execution, general-page filtering, benign image preservation, cookie/referrer-free retrieval, private routes, forms/editors, dynamic card editability, SPA transitions, reveal, saved correction and pause.
- Missing WASM files produce an honest unavailable status; no remote fallback. Caption filtering and reveal still work.
- Pause during slow DOM startup is respected. Four competing pages eventually receive image checks after queue pressure, including a placeholder followed by a real image.
- Private navigation cancels pending and subsequent image retrieval, including navigation while model startup waits on storage.
- Independent per-key startup reconciliation test prevents a correction event from discarding a refreshed pause setting.

Independent adversarial review reproduced five defects plus cancellation/queue/reconciliation edge cases. All confirmed findings were fixed and rechecked; final verdict: ready to merge, no confirmed unresolved findings.

## Limited performance and benign-image evidence

macOS ARM64 · test Chromium 145.0.7632.6 · 24 bundled, licensed photos: 12 cats and 12 nature scenes.

- Cold inference: 277 ms.
- Warm p50: 28 ms; p95: 31 ms.
- False covers: 0/24 using default sensitivity.
- Retained TensorFlow tensor bytes: 10,477,848 throughout evaluation.

The memory figure counts tensors, not total browser/worker RAM. This small dataset does not establish human-content classification accuracy, recall, live-site compatibility or performance on other hardware. Raw fixture results: `docs/verification/0.10.0-model-evaluation.json`.

`npm audit` reports four moderate transitive warnings arising from TensorFlow's CLI argument formatting dependency. Build metadata confirms neither `argparse` nor `sprintf-js` is included in the shipped browser bundles. No safe patch is available from the package's currently published versions; downgrading TensorFlow would not be an appropriate fix.

## Package provenance

Original 0.9.0 ZIP remains unchanged:
`d89428ddaec4663e6f1a4997d7b8f6956d25fcd9b56576e34969d26f87d6e819`.

Current upload ZIP: `releases/NOOG-Chrome-Web-Store-0.10.0.zip`.
SHA-256: `954c41b83a0eca62d0891df0c1bc7df41b064b016ad3641c8475ffd3c2eaa0f1`.

## Remaining publication work

The user completed the publisher non-trader declaration. Store submission still needs dashboard listing/privacy fields and final upload. A 1280×800 screenshot of real filtering on a labeled synthetic demo page is included in docs/verification/0.10.0-filtering.png; the controls capture is supplemental evidence. Publication is subject to Google's review; no live listing is claimed.
