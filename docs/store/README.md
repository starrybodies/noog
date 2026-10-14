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

The [Chrome Web Store listing documentation](https://developer.chrome.com/docs/webstore/cws-dashboard-listing#graphic_assets) specifies a YouTube URL for the promotional video field. The MP4 belongs in the promotional release materials; the installed extension upload ZIP remains unchanged. This avoids an extra 14 MB in every installation and preserves the already submitted binary.

The current site at https://noog.symbai.studio/ is owned by the previous Sites account. Its editable project is `appgprj_6ac5ce895b8081918ee69055c39e2f00`, observed in that account's site settings. The connector in this account returns `Sites project not found`; no replacement site has been created.
