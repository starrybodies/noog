# NOOG 0.10.0 store listing

Publication status: not submitted. This text describes the rebuilt free extension.

**Title:** NOOG — Reverse the goon

**Short description:** Filter unwanted images, gambling promotions and custom triggers. Local image checks. Your feed, your choice.

**Language:** English · **Category:** Productivity · **Distribution:** Free, public

**Homepage:** https://github.com/starrybodies/noog

**Privacy policy:** https://github.com/starrybodies/noog/blob/main/docs/PRIVACY.md

**Support:** https://github.com/starrybodies/noog/issues

## Detailed description

NOOG helps you choose what gets through. Cover unwanted images and promotional posts, then replace them with cats, nature, wisdom or quiet cards.

Install and start: pornographic-image checks and gambling-promotion rules are enabled automatically on accessible websites. No account, API key or separate AI installation is required.

Choose your filters:

- Pornographic-image estimates performed on your device.
- Gambling-promotion caption rules.
- Optional rage-bait and get-rich-quick promotional phrase rules.
- Your own keywords and covered sites.
- Creator exceptions and locally saved corrections for posts you want to keep.

Swaps stay reversible. Show an item once, keep a post, pause a site or pause NOOG. Image matches cover the matched media slot while preserving the surrounding post. Caption matches can cover a whole supported card.

Known private apps, supported private-message routes, forms and editable content are skipped. Embedded frames and Chrome's protected pages are outside automatic coverage. Layout compatibility is best effort.

Images and readable sampled video frames are checked locally. NOOG does not upload content to an AI provider. Public image hosts may receive cookie-free image retrieval requests. Preferences stay in Chrome's local extension storage. No analytics or browsing-history log is collected.

NOOG is experimental. It can miss unwanted content or cover wanted images. Media may appear before a check finishes; protected streams and some layouts may be unreadable. Unchecked media stays visible by default. Optional strict covers apply only to supported public feeds. Video sampling can miss content between frames. NOOG does not guarantee complete blocking.

Desktop Chrome only. Free core filtering.

## Single purpose

Help users reduce exposure to self-selected unwanted web content by locally detecting and reversibly covering matched images, promotional captions, keywords and websites.

## Permission explanations

- **storage:** Save local filter settings, custom terms, paused sites, creator exceptions and kept-post fingerprints; temporary model-readiness metrics contain no page content.
- **offscreen:** Run the bundled local image model in a worker using APIs unavailable to the background service worker.
- **activeTab:** Identify and control the current page after the user opens the toolbar.
- **HTTP(S) host access:** Apply filtering automatically on accessible pages and fetch displayed public images from separate image hosts for local checks. Private exclusions run before analysis; retrieval omits cookies/referrers and rejects redirects.

Executable JavaScript, WASM and model weights are packaged. No remotely hosted executable code, caption API, billing endpoint or telemetry endpoint is used.

## Remaining publisher decisions

The user completed the non-trader declaration. Review dashboard privacy-category wording against actual local page processing and cookie-free image fetching. Select mature-content designation accurately without including explicit material in listing assets. Use docs/verification/0.10.0-filtering.png (1280×800) as the store screenshot. The narrow controls capture is supplemental evidence. Use docs/store/small-promo-440x280.png for the required small promotional tile and public/assets/icon128.png for the store icon. Verify all public links.
