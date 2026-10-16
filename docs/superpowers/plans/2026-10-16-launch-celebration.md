# Noog 0.11.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship reversible whole-post filtering, playful kitty replacements and a local Easter egg; celebrate the live Store listing on the existing website.

**Architecture:** Reuse current supported-card replacement and local classification/rules. A bundled caption catalog supplies original harmless jokes. Keep the portable kitty game and visual assets separate from content filtering; the original website account imports those assets and publishes its existing project.

**Tech Stack:** Existing JavaScript/React, esbuild, Node tests, Playwright, MV3; no added runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-16-launch-celebration-design.md`, explicitly approved October 16, 2026.

## Global Constraints

- Release 0.11.0; live Store version is 0.10.0 until Google publishes the update.
- Existing permissions/privacy boundaries and local processing remain.
- Use original absurd kitty/union/cardboard revolution copy; no copied posts.
- Respect reduced motion and keyboard access; no game network/storage/rewards.
- Preserve website domain/audience, demo/library/subscriber data and film credits.
- User approved full implementation and original-chat handoff/publication; no repeated approval gate.

## Review Focus

- Framework removes cover sibling: restore/requeue original so it never remains stranded hidden.
- Multiple videos in blocked post: pause every video, including unmatched media.
- Benign Instagram alt/Reddit title: caption/body still considered; private editors skipped.
- Recycled card changes source/caption while hidden: stale decision must not persist.
- Game closes, finishes, loses visibility or restarts: timer stops correctly and focus remains usable.

---

### Task 1: Whole-post filtering and harmless captions

**Files:** modify `src/content.js`, `src/catalog.js`; create `src/shared/kitty-captions.js` if useful; add `tests/browser-whole-post.mjs` and catalog unit tests. Root owns package scripts and build files. UI worker owns Switchboard.

**Interfaces:** preserve `chooseReplacement(kind, fingerprint)` and `startContent(options)`; image replacements gain a deterministic `caption` string. Preserve sourced wisdom attribution. Export caption picker only if catalog needs it.

- [ ] Write deterministic browser assertions for media verdict hiding caption/CTA/all media, text-only rules, standalone media, reveal/keep/pause, mixed-video pause, Instagram/Reddit extraction, removed overlay and recycled hidden posts. Inject controlled model verdict through existing runtime boundary.
- [ ] Run new browser test and capture expected failure on current media-only cover.
- [ ] Reuse whole supported-card path for every positive verdict; standalone media keeps existing tile path. Pause all post videos. Extend extraction without reading private/editor content. Repair only lifecycle defects demonstrated by regression tests.
- [ ] Add bundled varied original harmless captions to photo replacement cards, deterministic for fingerprint, readable at narrow sizes.
- [ ] Run targeted tests and existing unit/browser suite; report actual output and commit only owned files.

### Task 2: Kitty visuals and portable game

**Files:** modify `src/Switchboard.js`, `src/popup.jsx`, `public/popup.css`, `public/welcome.html` and `src/welcome.js` as needed; create `public/kitty-game.html`, `public/kitty-game.css`, `src/kitty-game.js`, shared kitty visual assets, `tests/browser-kitty-game.mjs`. Do not modify content/catalog, scripts/build, manifest, package files.

**Interfaces:** game uses relative `kitty-game.css`, `kitty-game.js` and `assets/` references so built files serve both extension and website. Root adds the esbuild entry. Mascot opens `chrome.runtime.getURL('kitty-game.html')` from extension UI. CSS/SVG or provided campaign art may supply blink/peek/scurry variants without remote calls.

- [ ] Write functional browser assertions for game start, keyboard interaction, score, completion, restart, close, hidden-page pause and reduced-motion layout.
- [ ] Run to observe missing game behavior before implementing.
- [ ] Build one short catch-the-kitty session; explicit start/restart/close; keyboard instructions and accessible status. No network, storage or new permissions. Motion stays within bounded game/decoration; three mascot activations reveal entry, with labeled keyboard access.
- [ ] Restore campaign identity near extension title/onboarding, add matching lime kitty variants and restrained motion. Update filter descriptions for entire matched posts without claiming universal scam detection.
- [ ] Run game tests and existing units; capture screenshot at desktop and narrow size; commit owned files.

### Task 3: Integrate and verify 0.11.0

**Files:** `scripts/build.mjs`, `package.json`, `package-lock.json`, `public/manifest.json`, `.github/workflows/verify.yml`, `CHANGELOG.md`, `README.md`, current privacy/listing/release docs, `releases/NOOG-Chrome-Web-Store-0.11.0.zip`.

**Interfaces:** consume Tasks 1/2 tests and portable assets; build entry `src/kitty-game.js`; browser script runs existing four suites plus both new suites. Set package/lock/manifest version consistently. CI uploads only current package by version-aware path.

- [ ] Add build/test entries, version and accurate release docs. Preserve immutable old archives as provenance, remove obsolete current behavior claims.
- [ ] Run build, unit tests, all browser checks and deterministic packaging. Inspect manifest, archive contents, checksum, size, permissions and absence of remote executable code.
- [ ] Independently review changed code with Bug Hunter → Defender → Referee; fix actionable findings, repeat only affected checks.
- [ ] Push reviewed branch and create/attach PR if main is not directly integrated; obtain existing publisher status and submit exact tested ZIP where authorized UI allows. Record actual outcome accurately.

### Task 4: Existing website launch and publication

**Files:** `docs/store/SITE-LAUNCH-UPDATE-BRIEF.md`, portable game/asset kit, `docs/verification/0.11.0-website-publication.md`, existing LinkedIn draft.

**Interfaces:** verified Store URL and GitHub commit-pinned portable assets from Task 3. No new site. Source owner chat: `https://chatgpt.com/c/6ac5bab5-e474-83e8-a616-e54f7f077137`.

- [ ] Send concrete launch brief to original owner chat immediately for independent site work: Add to Chrome, hero kitty first, matching lime variants/motion, truthfully label pre-launch film. Provide tested game kit once pushed; never claim 0.11.0 approved prematurely.
- [ ] Owner preserves existing source/data/privacy/credits, verifies desktop/narrow/keyboard, then publishes existing project.
- [ ] Check public domain, Store CTA, above-fold cats, reduced motion, game and accurate version claims. Capture published screenshot and record saved version/checks.
- [ ] Deliver concise status, tested ZIP/PR links and LinkedIn draft; report any concrete Store access or owner-chat blocker.
