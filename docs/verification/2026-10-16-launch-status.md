# NOOG public launch status — October 16, 2026

Public launch evidence retrieved on October 16, 2026, using HTTPS GET requests with `curl -sSL`. The checks read public HTML and the website's referenced JavaScript bundle; no installation, publisher-dashboard changes, website changes or deployment was performed.

## Chrome Web Store

The public listing returned:

| Field | Observed value |
| --- | --- |
| Page title | NOOG — Reverse the goon - Chrome Web Store |
| Installation control | Add to Chrome |
| Version | 0.10.0 |
| Updated | October 16, 2026 |
| Offered by | Symbai Studios |
| Item ID | kfcbhdmmkipncdaajpbccefdkjjkihld |

The HTML canonical URL is `https://chromewebstore.google.com/detail/noog-—-reverse-the-goon/kfcbhdmmkipncdaajpbccefdkjjkihld`.

[Open the public Chrome Web Store listing](https://chromewebstore.google.com/detail/noog-%E2%80%94-reverse-the-goon/kfcbhdmmkipncdaajpbccefdkjjkihld).

The listing was retrieved through `https://chromewebstore.google.com/detail/noog-reverse-the-goon/kfcbhdmmkipncdaajpbccefdkjjkihld`. The returned listing identity, canonical URL and installation control establish that version 0.10.0 is publicly listed; installation itself was not exercised.

## Existing website

The public page at [noog.symbai.studio](https://noog.symbai.studio/) still advertises the pre-approval release state. Its HTML metadata says “Free alpha”; the page references `/assets/index-Ck6cd_QZ.js` and `/assets/index-BhtB0K_7.css`.

The referenced JavaScript bundle contains these rendered copy strings:

- “Free alpha · 0.10.0”
- “Try it now. Chrome Store review is underway.”
- “NOOG 0.10.0 was submitted for Chrome Web Store review on October 14, 2026. Store installation is coming after approval.”
- “Free alpha. Store installation follows approval.”

The primary installation links in that bundle target `/download/alpha`, and launch-list links remain prominent. These observations identify stale launch copy and calls to action; they do not establish that every website interaction was exercised.

Browser-based visual verification was unavailable in this pass: the Playwright connector reported an existing browser session in use. That session was left untouched. The web reader could not open the public URLs, so this record relies on the direct HTTPS responses described above.
