# Chrome Web Store assets

The listing uses the existing NOOG identity. `promo.html` is the editable source for the 440×280 small promotional tile; `small-promo-440x280.png` is its rendered export.

| Store field            | File                                     | Dimensions |
| ---------------------- | ---------------------------------------- | ---------- |
| Store icon             | `public/assets/icon128.png`              | 128×128    |
| Screenshot             | `docs/verification/0.10.0-filtering.png` | 1280×800   |
| Small promotional tile | `docs/store/small-promo-440x280.png`     | 440×280    |

The screenshot captures the actual built extension on a clearly labeled synthetic demonstration page. It does not claim a live site's layout or human-content classification accuracy. `docs/verification/0.10.0-controls.png` records the real controls for verification; its narrow dimensions are not intended for the store screenshot field.

Listing text and permission explanations are in `docs/STORE-LISTING-DRAFT.md`. Public privacy policy: https://github.com/starrybodies/noog/blob/main/docs/PRIVACY.md.

## Approved promotional video

`video/NOOG-Launch-Teaser.mp4` is the approved 30-second, 1080×1920 H.264/AAC teaser. NOOG is pronounced **Nuu-g**, `/nuːɡ/`, with a hard g. It ends with Coming soon and states that the extension was submitted for Chrome Web Store review.

The folder includes a poster, English WebVTT captions, accessible standalone player (`video/index.html`), publication credits and a ready YouTube description. Music credit must remain visible beside the website player and in the YouTube description. Video SHA-256: `9b58a467021a112c75e989ed749c643a7e4003d98ba68d10a046ca7ee9e03d83`.

Published October 14, 2026 as an **unlisted, embeddable video** on the existing Samuel Barnes channel: https://www.youtube.com/watch?v=OtbgUlEtpaE. The saved upload includes the approved poster, English captions, music/photo credits, AI disclosure, not-made-for-kids audience and Science & Technology category. YouTube reported no copyright issues at publication. Details are in `video/publication.json`; the exact Chrome Store promo field value is in `video/chrome-store-promo-url.txt`.

The Chrome Store dashboard was checked after publication. It still shows **Pending review**, and the Global promo video field and Save draft button are disabled. The promo URL has not been added to that listing. Add it when editing becomes available; the current review has not been withdrawn or resubmitted.

The [Chrome Web Store listing documentation](https://developer.chrome.com/docs/webstore/cws-dashboard-listing#graphic_assets) specifies a YouTube URL for the promotional video field. The MP4 belongs in the promotional release materials; the installed extension upload ZIP remains unchanged. This avoids an extra 14 MB in every installation and preserves the already submitted binary.

The existing public site at https://noog.symbai.studio/ was updated through the original Sites account with Samuel's explicit authorization. Saved version **20** publishes Free alpha · 0.10.0 and the approved film with native playback, poster, English captions and visible credits. Its editable project remains `appgprj_6ac5ce895b8081918ee69055c39e2f00`; no replacement site was created. Independent live verification is recorded in `docs/SITE-ALPHA-PUBLICATION.md`.
