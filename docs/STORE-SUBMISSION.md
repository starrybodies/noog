# NOOG Chrome Web Store release status

## Current status — October 16, 2026

**0.10.0 is published and public**, verified on the Store listing and authenticated publisher dashboard. The original October 14 pending-review record below is historical.

**0.11.0 was uploaded and submitted for review on October 16, 2026.** The authenticated dashboard confirms **Pending review**. Upload ZIP: `releases/NOOG-Chrome-Web-Store-0.11.0.zip` (9,562,571 bytes), SHA-256 `268042c0e69b86c138aa08cf48029a2d9c5439f5b20930ff65d7a822568040e8`. Ten unit tests, six browser suites and deterministic ZIP/permission checks pass. The uploaded package panel confirmed draft 0.11.0 alongside published 0.10.0. The Store description now explains whole-post replacement, original kitty captions and the local game. Homepage is https://noog.symbai.studio/ and the approved YouTube teaser URL is saved. No 0.11.0 approval is claimed.

Item ID remains `kfcbhdmmkipncdaajpbccefdkjjkihld`; publisher **Symbai Studios**, free/public/all regions. The new binary adds no permissions or remote service. [Public Store listing](https://chromewebstore.google.com/detail/noog/kfcbhdmmkipncdaajpbccefdkjjkihld).

Submission evidence: `docs/verification/0.11.0-store-package-uploaded.png`, `0.11.0-store-submitted-dialog.png`, and `0.11.0-store-pending-review.png`. The final confirmation appeared after user interaction during the screenshot-picker workflow; the release agent observed the accepted submission and did not submit it again. The exact final publication-mode selection was not independently observed.

A current 1280×800 RGB synthetic demonstration screenshot was prepared at `docs/verification/0.11.0-filtering.png`. Its inclusion in the submitted listing was not independently confirmed; the existing review was not withdrawn for an asset change.

---

# Historical NOOG 0.10.0 Chrome Web Store submission

Submitted October 14, 2026. The final dashboard status is **Pending review**.

| Field | Submitted value |
| --- | --- |
| Item | NOOG — Reverse the goon |
| Version | 0.10.0 |
| Item ID | kfcbhdmmkipncdaajpbccefdkjjkihld |
| Publisher | Symbai Studios |
| Verified public contact | hi@samu.quest |
| Pricing | Free of charge; no in-app purchases |
| Visibility | Public |
| Regions | All regions |
| Language and category | English; Productivity → Tools |
| Publication | Automatically after approval |

The submission includes the description, homepage/support/privacy links, 128×128 icon, 1280×800 filtering screenshot, 440×280 promotional tile, permission explanations, local data disclosures and no-account reviewer instructions. Executable code, WASM and model weights are bundled.

Google displayed an additional review notice for broad host permissions. The submission retained that access because automatic filtering across accessible websites is the requested behavior. Private exclusions run before analysis. The notice was acknowledged and Google accepted the submission.

Review timing and approval are controlled by Google. No live listing is claimed. The existing extension installed in the developer's Chrome was updated to 0.10.0; store users will receive the reviewed package after publication.

Upload ZIP: `releases/NOOG-Chrome-Web-Store-0.10.0.zip`. SHA-256: `954c41b83a0eca62d0891df0c1bc7df41b064b016ad3641c8475ffd3c2eaa0f1`.

[Publisher dashboard status](https://chrome.google.com/webstore/devconsole/b7c727d7-d554-4463-a98c-4b8204181c5a/kfcbhdmmkipncdaajpbccefdkjjkihld/edit/status) requires publisher access. Verification and limitations are in [release readiness](RELEASE-READINESS.md).
