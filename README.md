# NOOG — Reverse the goon

NOOG is a free desktop Chrome extension that reversibly covers unwanted images and promotional captions with cats, nature, wisdom or quiet cards.

Version **0.10.0** works automatically on accessible HTTP(S) pages. Pornographic-image checks and gambling-promotion rules start enabled. Image classification runs on the user's device with bundled model weights and WASM. Captions use local phrase rules. No account, API key, separate AI installation or hosted inference service is required.

Known private apps and supported private-message routes are excluded before analysis. Forms, editable regions and embedded frames are skipped. Unrecognized private websites can be paused in the toolbar. Chrome's protected pages remain inaccessible. Detection and layout coverage are imperfect; media remains visible when a check fails unless the user selects optional strict feed covers.

## Chrome Web Store status

The [NOOG website](https://noog.symbai.studio/) is live as **Free alpha · 0.10.0**, with the approved launch film and a verified manual-install download. See [website publication and verification](docs/SITE-ALPHA-PUBLICATION.md).

NOOG 0.10.0 was submitted for review on October 14, 2026 under **Symbai Studios**, with verified public contact **hi@samu.quest**. Distribution is free, public and all regions. Automatic publication after approval is enabled. The dashboard shows **Pending review**; a live store listing is not yet claimed. See [submission record](docs/STORE-SUBMISSION.md).

## Build and test

Use Node 22.13.0 (matching NSFWJS's published engine declaration), npm 10 or 11, and Python 3 for ZIP packaging.

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:browser
npm run package
```

Load `dist/extension` using Chrome's **Load unpacked** button on `chrome://extensions`. The optional **Check protection setup** link exercises the bundled model with a cat photo. A passing setup check does not establish detection accuracy.

Browser tests use isolated profiles without personal browser data. They exercise fresh-install filtering, privacy exclusions, a card becoming an editor, SPA private routes, reveals, saved corrections, pause controls, cookie-free image fetching and actual missing-model failure. `node tests/model-eval.mjs` measures inference on 24 bundled cat/nature photographs and writes `dist/model-evaluation.json`. Set `CHROMIUM_EXECUTABLE` when using a separately installed compatible test Chromium.

## Repository structure

| Path | Contents |
| --- | --- |
| `src/` | Editable extension modules, shared privacy/settings/filter logic and recovered replacement catalogs |
| `public/` | Manifest, static pages, fonts, licensed photos and notices |
| `scripts/` | Dependency-based build and deterministic ZIP packaging |
| `tests/` | Behavior tests, real-browser integration and a limited benign-image evaluation |
| `releases/NOOG-Chrome-Web-Store-0.10.0.zip` | Current Web Store upload package |
| `releases/NOOG-Chrome-Web-Store-0.9.0.zip` | Immutable original release baseline |
| `docs/RELEASE-READINESS.md` | Verification evidence and remaining publication work |
| `docs/PRIVACY.md` | Current extension privacy policy |

The original editable Sites project was inaccessible from this account. Application logic and catalogs were recovered from the preserved 0.9.0 distribution; vendor code was replaced with pinned npm dependencies and a normal build. This is reconstructed editable source, not an export of the original project. The original archive and its provenance remain unchanged.

The 0.9.0 worker attempted threaded WASM blob scripts prohibited by its MV3 security policy. The rebuilt worker explicitly uses single-worker WASM, with no CPU or remote inference fallback. Unfinished Plus, cloud caption sharing, key-entry, schedule and optional site-activation paths have been removed.

## Privacy and support

[Privacy policy](docs/PRIVACY.md) · [Report a problem](https://github.com/starrybodies/noog/issues)

NOOG fetches eligible displayed images from their original public hosts without cookies or a referring page. Those hosts receive the request and IP address. It does not upload images/captions to NOOG or an AI provider, collect analytics, or store a browsing-history log.

Third-party notices and photo credits are preserved in `public/licenses`, generated `*.LEGAL.txt` files and `public/licenses-photo-credits.json`. No project-wide license is granted by this repository.
