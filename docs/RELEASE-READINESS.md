# NOOG 0.11.0 release readiness

October 16, 2026 · Implementation and package verified; Chrome Web Store update submitted and Pending review. Current live Store version: 0.10.0.

## Delivered

- Positive caption, image and sampled-video matches replace complete supported public posts, including captions, links and media. Standalone media retains sized replacement tiles. Every video in a replaced post pauses.
- Twenty-four original bundled kitty/cardboard-revolution captions appear on photo replacements. Deterministic selection preserves photo credits and sourced wisdom.
- Instagram caption/alt and Reddit title/body extraction improved. Hidden recycled posts, removed overlays and changed video streams restore/recheck correctly.
- Lime kitty campaign art and keyboard-accessible three-pet game reveals in popup/onboarding. Portable Catch the Kitty: 15 seconds/eight catches, explicit start/pause/resume/restart/close, hidden-tab pause and reduced-motion stationary target. No game network, storage, rewards or extra permissions.
- Existing local checks, privacy exclusions and reversible controls retained. No dependency, remote service, permission, CSP or web-accessible-resource expansion.

## Verification

Production build passed. Ten unit tests and all six browser suites passed with clean profiles and the actual built extension under Chrome for Testing 145.0.7632.6.

- Existing model startup, benign-image preservation, cookie/referrer-free fetch, private forms/editors/routes, SPA cancellation, settings/corrections, pause/reveal/keep and queue tests passed.
- Missing-model failure remains honest and makes no remote fallback request.
- Seventeen whole-post regressions passed, including image/video/text decisions, mixed-video pause, full caption/CTA hiding, standalone tiles, Instagram username with harmful alt, Reddit body, private/editor transitions, removed overlays, hidden recycled posts and changed streams.
- Game suite passed keyboard scoring, timeout/eight-catch completion, restart, hidden/manual pause, close/reopen, reduced motion, bounds, 320px layout and actual extension popup game route.
- Independent task reviews passed after fixing the Instagram username/alt regression. Whole-branch review passed with no upheld findings; three extra delayed-verdict probes also passed. See `docs/verification/0.11.0-final-review.md`.
- Cold/warm model setup checks: 316/43 ms on this machine. These are setup timing samples, not detection-accuracy measurements. Prior limited benign-image evaluation remains historical 0.10.0 evidence; this release makes no new accuracy claim.

The test-browser installer stalled extracting its complete official download; the same official archive was extracted with macOS's native archive utility. Tests then used the expected 145.0.7632.6 executable. No production code, security setting or browser profile was changed for that repair.

## Package

`releases/NOOG-Chrome-Web-Store-0.11.0.zip` · 9,562,571 bytes. SHA-256: `268042c0e69b86c138aa08cf48029a2d9c5439f5b20930ff65d7a822568040e8`.

ZIP integrity passed; two consecutive packages are byte-for-byte identical. Version is 0.11.0. Manifest permissions, host access, CSP and web-accessible resources equal 0.10.0. Bundled game files match the website kit's per-file hashes. [Machine-readable verification](verification/0.11.0-package.json).

Immutable prior archives preserve release provenance. They are not active compatibility code.

## Website and publication

The current Store listing is live 0.10.0, verified October 16. Samuel approved the complete update and authorized the original **Develop NOOG Product** chat to update/publish the existing website. The owner reports publishing version 22, and independent public Chrome checks confirm the refreshed hero, campaign kitties, Store CTA, mobile layout, hidden game, reduced motion and preserved film captions/credits. See [website publication evidence](verification/0.11.0-website-publication.md). The authenticated publisher dashboard confirms the 0.11.0 upload and accepted review submission; status is Pending review. See `docs/STORE-SUBMISSION.md`.

Existing project/domain/audience/subscriber data and approved film credits remain requirements. The game kit is `releases/NOOG-Kitty-Kit-0.11.0.zip`; checksum/provenance: `docs/store/KITTY-KIT-0.11.0.json`.

Google controls review and publication timing. Do not describe 0.11.0 as Store-approved until the actual public listing changes.
