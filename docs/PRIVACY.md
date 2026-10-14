# NOOG privacy policy

NOOG 0.10.0 · October 14, 2026

## Content processing

On eligible pages, NOOG reads visible media, nearby captions, creator identifiers and page addresses to apply the user's filters. Images and sampled video frames are checked by a model bundled with the extension. Captions use local phrase rules. Content is not sent to NOOG, an AI provider or an analytics service.

## Network requests

NOOG may fetch a displayed image from its original public HTTP(S) image host for local classification. Requests omit cookies and the referring page, reject redirects, and limit image size. The host still receives the request and IP address. Model code, weights, replacements and fonts are bundled. There is no external model download or classification endpoint.

## Private pages

Known mail, document, chat and workspace apps, supported private-message routes, forms and editable content are excluded before analysis. NOOG cannot identify every private website. Pause unfamiliar private sites in the toolbar or restrict website access in Chrome's extension settings. Embedded frames are skipped.

## Local storage

Preferences, custom keywords, domain pauses and creator exceptions stay in Chrome's local extension storage. Kept-post corrections store up to 200 SHA-256 fingerprints rather than original captions or media. Image results are cached in memory for up to five minutes and 128 entries. Temporary model-readiness metrics contain no page content. Removing NOOG clears its extension storage. Preferences can be exported or replaced through the toolbar.

## Permissions

- HTTP(S) website access: automatic filtering and retrieval of displayed public images.
- Storage: local filter preferences and corrections.
- Offscreen: run local classification in a worker.
- Active tab: show page status and pause the current site from the toolbar.

NOOG does not collect browsing history, credentials, payment information or analytics.

## Limits and support

NOOG is experimental. It can miss unwanted material or cover ordinary content. Strict modes are optional and swaps remain reversible. Report problems through [GitHub issues](https://github.com/starrybodies/noog/issues); avoid including private content in public reports.
