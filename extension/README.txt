NOOG Chrome Alpha 0.9.0 — Reverse the goon.
Built on momo’s 0.3.0.

Pornography, gambling, rage bait, hype and your own triggers. Your feed, your choice. A pause between the impulse and your next choice, without shame, streaks or forced lockout.

INSTALL / UPDATE
Unzip, open chrome://extensions, enable Developer mode, choose Load unpacked and select noog-extension. To update, replace the existing folder’s contents, reload NOOG, and refresh open websites. Other filter preferences are preserved. Upgrading older version 1–2 settings turns legacy checking/unchecked-media covers off once; re-enable those strict options only if you want them. Turn on Pornographic images if your earlier version had them off. Desktop Chrome only; the website is a demo.

SITE ACCESS
X retains its existing access. Choose Enable on this site or Enable across websites for other websites. The latter also permits fetching images from separate CDN origins. Chrome asks before granting optional access. Broad access is not granted by the download. Withdraw access through Chrome’s extension settings. Protected browser and store pages cannot be modified.

IMAGE PROTECTION
New installations enable local pornographic-image filtering and only swap content matches by default. Failed inspections leave media visible; checking shields and persistent unchecked-media covers are explicit opt-ins limited to supported public feeds on X/Twitter, Instagram, Reddit and YouTube. Generic web media requires a filter match. Suggestive-image filtering is a separate optional choice. NSFWJS MobileNetV2, TensorFlow.js and the WASM backend are bundled; image checks spend no API tokens. The model is experimental and can miss pornography or misclassify wanted images. Some content can appear before NOOG discovers it.

SITES AND FEEDS
Adapters cover X, browser-based Instagram, modern/old Reddit, YouTube, generic articles and figures, individual images, inline/card background thumbnails and video posters. Granted HTTP(S) frames are included. Infinite-scroll additions, recycled cards, lazy images and URL navigation are rechecked. Four image/background/poster URLs per card are checked. Readable video frames are sampled locally at 224px about every three seconds while visible and playing, up to two videos per card. Sampling can miss content between frames; protected or cross-origin streams may be unreadable. Unchecked media stays visible by default. Opt into strict unchecked-media covering for supported public feeds, or Cover all videos for detected videos. Find My/iCloud and known map/mail/document apps are skipped. Canvas pixels, stylesheet-only descendant backgrounds, closed shadow roots, frames without access and native apps are not inspected. Show once reveals them for this visit.

SITE FILTERS
Cover known adult sites uses a bundled list of 19 domains, including subdomains. It is not an exhaustive list of adult websites. Add other domains in Sites to cover. The site guard is a reversible local cover, not a network firewall: Continue this visit reveals the page with image filtering still active; Take a breather opens a bundled calm page. Pause on this site lets other enabled sites keep filtering. Global Pause restores all enabled sites. Covered videos are paused. Show once does not resume them automatically. Videos NOOG paused temporarily for their initial check may resume when allowed.

PRIVACY
Settings, domain filters and creator exceptions stay in Chrome local extension storage. Image/caption score caches stay in memory for up to five minutes, at most 128 entries. Image requests to their original public HTTP(S) source omit cookies and referrers and require that origin’s Chrome permission. Image servers can see a normal download request and network address. Redirects, literal IP/local addresses, unsupported formats and downloads over 6 MB are rejected. Signed-in/CDN images can be uncheckable. No image uploads, analytics, advertising, browsing-history log or developer account is required. Current page origins are used only for site access and filters.

OPTIONAL JEV
The X-only caption fallback is off by default and runs after local image checks. It requires your TypeSafe key, affirmative caption-sharing consent and API host access. Only ambiguous captions, at most 1,200 characters, are sent. The key is session-only. Disconnect clears it and stops sharing. The 50-attempt daily cap is not a spending cap. Broad access may still cover the API host. Already-sent captions cannot be recalled. Generic websites never share captions with Jev.

CHECK PROTECTION SETUP
Open Check protection setup from the toolbar. Run setup check verifies the background/offscreen/WASM model path using a bundled cat photo, reads settings and checks broad access. It does not read a feed, change filters, call Jev or spend API tokens. If the model check fails, reload NOOG and retry. Complete a real-page trial separately.

TESTING AND STORE STATUS
Automated and rendered fixture checks validate mechanics, not universal compatibility or pornography-detection accuracy. Installed-Chrome/live-site smoke tests remain a launch gate. No live Jev key/request has been tested. A separate Chrome Web Store ZIP places manifest.json at its root. This package has not been submitted to or approved by the Chrome Web Store. Licenses are included.

NEW IN 0.6.0
Keep this post creates a permanent correction on this device using a local hashed fingerprint. Clear kept posts in the popup. Changed content may need a new correction. First installation opens a setup guide; upgrades do not repeatedly open it.

OPTIONAL PLUS
Core filters, custom keywords, replacements and corrections remain free. Plus adds up to 12 saved profiles and local weekly schedules. Pricing/account/cancellation: https://noog.symbai.studio/plus. Activate in the collapsed Plus section using the private key issued after checkout; NOOG contacts its own billing site for subscription status only, never your feed or filter settings. Profiles do not sync. Optional alarms permission is requested when adding a schedule. First matching schedule wins; local clock and overnight windows apply. Prior filters return after the window and manual changes are preserved. Global pause and privacy choices are never changed by profiles.

Signed activation remains available offline for at most 48 hours, bounded by the paid period. Expiry stops schedules and restores previous filters; free protection continues. Disconnecting/uninstalling does not cancel billing. Cancel on the Plus page. Payments are disabled until the seller's actual Stripe configuration and live checks are complete.

QUALITY EVALUATION
https://noog.symbai.studio/evaluate provides a local labelled-image check with confusion counts, false-cover rates and unknown-media counts. Selected files are not uploaded. Benign samples do not establish pornography recall; real representative testing remains required.

NEW IN 0.6.1
Temporary video-check pauses are undone when filters change or NOOG stops. Only the same clip that NOOG paused is resumed; matched covers still stay paused. Newly loaded or sought frames are rechecked promptly, including when a previous check is still pending. One-site setup can activate on the main page even when an embedded frame is inaccessible.

NEW IN 0.6.2
ChatGPT conversations and their attachments are excluded from automatic caption/image filtering, even with unchecked-media covering enabled. The popup says Private conversation · skipped. Small background thumbnails and figures without content-sized media do not become replacement cards. Explicit whole-site filters you add still work as local pause screens. Reload the extension and refresh existing webpages to remove covers left by an older installed version.


## 0.6.3 utility and unchecked-media safeguard

A user screenshot shows NOOG covering iCloud Find My with “Media not checked — covered by your setting.” Failed inspection is not a filter match. Temporary checking shields and persistent unchecked covers now apply only to supported public feed hosts on X/Twitter, Instagram, Reddit and YouTube. Generic web media stays visible unless an enabled filter matches. iCloud/Find My, common map, mail and document workspaces, ChatGPT and supported social private-message routes are excluded before DOM selection and background analysis. Explicit user-added whole-site guards remain available. Generic selectors skip map containers, controls, standalone canvases and canvas-only figures.

Node fixtures cover strict settings on Find My, zero background inference, private-route navigation, generic unknown visibility, map/control selection and popup status. Browser evidence remains the 0.6.0 baseline; installed 0.6.3 Chrome and live Find My/feed behavior are unverified. Replace the installed unpacked folder, reload NOOG and refresh open pages to receive this change.

REPLACEMENT LIBRARY
32 cat and 40 nature photos are bundled for offline replacements with creator/licence/source links. Wisdom has 16 short sourced excerpts and 84 clearly labelled NOOG reflections across Buddhist, Taoist, Indigenous writers, Essene accounts, Kabbalistic, Marxist and post-structuralist reading shelves. Quiet cards vary by seed. The website /library offers optional Commons browsing; the extension makes no online-photo requests for replacements. See licenses-photo-credits.json for resized/recompressed photo originals and licences.

NEW IN 0.9.0
Visual matches cover the matched image or video slot instead of hiding the entire post. Captions and wanted neighbouring media remain visible. Multiple detected matches each get a cover. Narrower gambling/adult-promotion rules avoid ordinary winning/stake/appointment language and support/reporting. X private dialogs/forms are skipped. Free settings backup/import excludes API keys, consent, paid state and correction hashes; review the summary before applying. Save setup report shares only version/time/results. Plus now uses the branded noog.symbai.studio domain; payments remain closed until provider checks pass.
