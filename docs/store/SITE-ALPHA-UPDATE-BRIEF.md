# NOOG website alpha update — prepared for the existing Sites project

Target: https://noog.symbai.studio/ (existing public Sites project `appgprj_6ac5ce895b8081918ee69055c39e2f00`).

The user approved the refined launch teaser, requested that it be integrated into the website and Chrome Store materials, and asked to take the site to alpha. Preserve the existing identity, domain, demo, library and launch-list data. Publish the updated existing site; do not create a duplicate site or change its audience.

## Approved assets

All assets are public in https://github.com/starrybodies/noog/tree/main/docs/store/video and committed at `75a4183`.

- Film: https://raw.githubusercontent.com/starrybodies/noog/75a4183/docs/store/video/NOOG-Launch-Teaser.mp4
- Poster: https://raw.githubusercontent.com/starrybodies/noog/75a4183/docs/store/video/poster.jpg
- English captions: https://raw.githubusercontent.com/starrybodies/noog/75a4183/docs/store/video/captions.vtt
- Credits: https://github.com/starrybodies/noog/blob/75a4183/docs/store/video/NOOG-Video-Credits.md
- Complete accessible player reference: https://github.com/starrybodies/noog/blob/75a4183/docs/store/video/index.html

Film SHA-256: `9b58a467021a112c75e989ed749c643a7e4003d98ba68d10a046ca7ee9e03d83`. It is the approved Refined v2 cut: 30 seconds, 1080×1920, H.264/AAC. Do not substitute the rejected earlier A/B cuts or alter the approved film. NOOG is pronounced **Nuu-g**, `/nuːɡ/`, with a hard g. Tagline: **Reverse the Goon.**

## Website changes

1. Add the approved film as a prominent, responsive portrait video section near the hero, without replacing the existing interactive demo. Use native controls, playsinline, preload=metadata, the supplied poster and English caption track. Require visitor action to start audio; avoid autoplay and third-party tracking embeds. Download the film into the site's own supported static assets rather than hotlinking raw GitHub in the finished player.
2. Place the required music attribution visibly beside the player: **'Catalyst' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au**. Link the composer at https://www.scottbuckley.com.au/library/catalyst/ and license at https://creativecommons.org/licenses/by/4.0/. State that the music is an edited excerpt with fades and voice ducking. Include the cat photo credit supplied in the credits file. Describe the real demonstration as staged at 1.25× speed and the cinematic scenes/narration as AI generated.
3. Update all release badges and manual download text to **Free alpha · 0.10.0**. Use the actual rebuilt package: https://raw.githubusercontent.com/starrybodies/noog/75a4183/releases/NOOG-Chrome-Web-Store-0.10.0.zip (9,431,357 bytes; SHA-256 `954c41b83a0eca62d0891df0c1bc7df41b064b016ad3641c8475ffd3c2eaa0f1`). Replace obsolete 0.9 download routes/assets. Keep a clear manual installation guide: download, unzip, desktop Chrome → chrome://extensions → Developer mode → Load unpacked → select folder containing manifest.json. Site visitors can try this alpha while store review proceeds.
4. Keep the Chrome Store status explicit: **NOOG 0.10.0 was submitted for Chrome Web Store review on October 14, 2026. Store installation is coming after approval.** Do not show an active Store install button or claim approval. Do not cancel or resubmit the existing review. If store approval is independently confirmed, use its verified public listing URL and update copy accordingly.
5. Align extension claims and installation FAQ with https://github.com/starrybodies/noog/blob/main/README.md and https://github.com/starrybodies/noog/blob/main/docs/PRIVACY.md. It works automatically on accessible top-level HTTP(S) pages, using bundled on-device image checks and local caption rules; no account, API key, local LLM server or hosted inference is required. Known private apps, supported private routes, forms/editors and embedded frames are excluded. Unrecognized private sites can be paused. Avoid perfect filtering or universal private-site recognition claims. Keep the website demo clearly scoped to its page rather than claiming that it installs browser-wide protection.
6. Remove unfinished Plus, payment, schedule and API-key sales paths from this free alpha's navigation and public calls to action. Billing is disabled. Future editions can add a completed Plus offering. Keep existing launch-list consent and stored subscribers intact; do not send email. Publisher: **Symbai Studios**. Public contact: **hi@samu.quest**. Preserve accurate website-specific privacy disclosures for launch-list data; don't replace them with the extension policy wholesale.

## Verification and completion

Build and run checks appropriate to the site. Verify desktop and mobile layout, keyboard-accessible video controls, poster/caption loading, complete playback, visible attribution, working manual ZIP download/version/hash, installation instructions, no stale 0.9/Plus links, and the truthful Store review status. Publish through the existing project's supported Sites workflow. Report deployed URL, saved version number, actual checks and any remaining blocker; include a screenshot of the published video section.

The approved MP4 is part of promotional release materials, not the installed extension ZIP. The extension's already submitted binary stays unchanged. The video was published unlisted with embedding enabled on October 14, 2026: https://www.youtube.com/watch?v=OtbgUlEtpaE. Its approved poster, English captions, music/photo credits and AI disclosure are saved. Do not perform a second upload. The Chrome Store's Global promo video field is currently disabled while the extension is Pending review; its URL is prepared for a later listing update.
