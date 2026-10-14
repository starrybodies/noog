# NOOG store listing draft

This draft describes the intended free release. Verify every statement against the rebuilt final package before submission. No Chrome Web Store listing has been created or submitted.

## Product details

**Title:** NOOG — Reverse the goon

**Short description:** Filter unwanted images, gambling promotions and custom triggers. Local image checks. Your feed, your choice.

**Language:** English

**Category:** Productivity

**Distribution:** Free, public

**Homepage:** https://noog.symbai.studio/

**Privacy policy:** https://noog.symbai.studio/privacy.html

## Detailed description

NOOG helps you choose what gets through your feed. Cover unwanted images and promotional posts, then replace them with cats, nature, wisdom or quiet cards.

Choose the filters that matter to you:

- Pornographic-image checks performed on your device.
- Gambling-promotion caption rules.
- Optional rage-bait and get-rich-quick promotional caption rules.
- Your own keywords, phrases and covered sites.
- Creator exceptions and local corrections for posts you want to keep.

You stay in control. Show an item once, pause a site, or pause NOOG. Local image matches cover the matched media slot while preserving the surrounding post. Caption matches may replace a whole supported card.

NOOG supports X by default. Enable other websites through its toolbar controls and Chrome's permission prompts. Supported layouts include browser-based Instagram, Reddit, YouTube and generic cards and images. Website compatibility is best effort.

Images and readable sampled video frames are checked locally. NOOG does not upload images to an AI service. Settings stay in Chrome's local extension storage. The extension does not send usage analytics or keep a browsing-history log.

Important limitations: NOOG is experimental. It can miss unwanted content or cover wanted images. Some media may appear before a check completes, and protected or cross-origin video may be unreadable. Unchecked media remains visible by default. Strict covers are optional on supported public feeds. NOOG is not a network firewall and does not guarantee complete blocking.

Desktop Chrome only. Core filtering is free; no payment or developer account is needed.

## Single purpose

Help users reduce exposure to self-selected unwanted web content by locally detecting and reversibly covering matched images, promotional captions, keywords and websites.

## Permission explanations for review

- **storage:** Save the user's local filter settings, site preferences, creator exceptions and post corrections. Verify the final release's exact stored data before submission.
- **offscreen:** Run the bundled image-classification worker using browser APIs unavailable to the background service worker.
- **scripting:** Activate the bundled content script on websites the user explicitly enables.
- **activeTab:** Read the current tab's origin after the user opens NOOG's toolbar so site access and site controls can be offered.
- **X/Twitter and X image CDN hosts:** Apply the supported X feed adapter and inspect permitted public images locally. Additional image downloads omit cookies and referrers.
- **Optional HTTP(S) host access:** Filter other websites and inspect images hosted on separate CDN origins only after Chrome grants the user's requested access.

If optional TypeSafe caption sharing is retained, disclose it in the listing and privacy fields and justify its host permission. If removed, remove its code, consent controls and permission. Do not claim that all accessed content always stays local while caption sharing remains available.

If Plus is removed, remove the alarms permission and revise the published privacy page to distinguish historical/website billing from the actual free extension's data practices. Do not provide an alarms justification for a release that has no scheduling feature.

## Fields still requiring final-package review

Data categories, remote-code declaration, permission list, support URL, screenshot assets and mature-content designation must be based on the final package and publisher facts. Do not select "no data collection" solely because most processing is local while optional caption sharing or billing activation remains present.
