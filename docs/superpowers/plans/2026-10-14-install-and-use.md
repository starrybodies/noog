# NOOG install-and-use implementation

The approved release runs the bundled image model and caption rules on the user's device, automatically on accessible HTTP(S) pages. Known private applications, private routes, forms, and editable content are excluded before reading content. No account, API key, external inference service, or Plus flow is included.

## Source and build

Recover application logic and licensed replacement catalogs from the preserved 0.9.0 distribution. Use editable ES modules in `src/`, static assets in `public/`, pinned dependencies and a reproducible build in `scripts/build.mjs`. Generated extension output goes to ignored `dist/extension/`. Keep the original release ZIP and provenance unchanged.

## Behavior and regression tests

1. Reproduce model failure in an isolated Chromium profile. Diagnose the actual failing boundary. Rebuild the worker using local NSFWJS MobileNetV2 definitions and TensorFlow WASM assets; record readiness and actionable errors.
2. Share one settings schema and privacy policy across the background, content controller and popup. Test private-route precedence, sanitized preferences and benign caption examples before fixes.
3. Declare HTTP(S) access and static content scripts at installation. Remove dynamic site activation, remote caption calls, key entry, billing and schedule code. Keep bounded local processing, reversible covers and corrections.
4. Preserve adapters and replacements. Test automatic protection on a fresh unrelated website, form/private-route exclusions, SPA transitions, settings changes and reversal in a real extension browser.
5. Make popup and setup check show actual model readiness. Update onboarding, privacy and release documentation; build a new 0.10.0 ZIP. Run unit tests, browser integration, package checks and adversarial review before committing.

## Acceptance evidence

A clean browser profile needs no credentials or setup action to filter. The bundled model completes inference with WASM without remote model downloads. Private pages produce no analysis messages or image fetches. Disabled filters and revealed posts remain usable. Model failure is visible and does not claim successful protection. Record measured cold/warm latency and memory on this Mac; broader hardware and live-site accuracy remain release limitations.
