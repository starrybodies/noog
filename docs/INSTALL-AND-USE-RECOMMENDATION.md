# NOOG: install-and-use recommendation

Date: October 14, 2026

## Question

How can a free NOOG installation work immediately, without accounts, API keys, separately installed AI software or a central inference service?

## Current facts

The 0.9.0 package already bundles MobileNetV2 model definitions and weights with TensorFlow.js 4.22.0 and local WASM binaries. Its image classifier runs in a worker at 224×224 resolution. It does not call a user's local LLM server. Processing is distributed across users' devices; increasing installations does not create a central image-inference bill.

Optional Jev caption classification calls TypeSafe's remote API using a user-supplied key. It is disabled by default. Fresh installations enable pornography and gambling filters, but automatic website access currently covers only X/Twitter; other sites require permission.

The worker can switch from WASM to CPU, while the background and setup page require a WASM result. This is a confirmed diagnostic mismatch, not a confirmed explanation of the observed installed failure. Runtime diagnosis remains necessary.

## Options

| Approach | Advantages | Costs and limits |
| --- | --- | --- |
| **Bundled image classifier plus local caption rules** | No account, keys, additional model download or paid inference; images remain on the device; supports a free product | Device performance and detection quality require measurement; local phrase rules have limited understanding |
| **NOOG-hosted classification API** | Users need no provider key; central model updates and potentially stronger models | NOOG pays per-user processing, operates abuse controls and depends on connectivity; shared content requires disclosure and consent |
| **Chrome's built-in Gemini Nano** | On-device language understanding without provider keys | Separate initial model download, hardware/storage requirements and availability checks prevent universal immediate use |

NSFWJS supports bundled browser models; TensorFlow documents WASM CPU inference. [NSFWJS](https://github.com/infinitered/nsfwjs/blob/v4.2.1/README.md), [TensorFlow](https://www.tensorflow.org/js/guide/platform_environment).

Chrome's Prompt API requires an initial download and qualifying hardware/storage. Cloud processing requires appropriate privacy disclosures and protected provider credentials. [Prompt API](https://developer.chrome.com/docs/ai/prompt-api), [Extension AI guidance](https://developer.chrome.com/docs/extensions/ai).

## Recommendation

Ship the first option. Repair the bundled model path and its diagnostics; remove Jev/key-entry and unfinished Plus paths from the free release. Preserve modest, clearly described local caption rules rather than promise general language understanding.

Start protection automatically with safe defaults and initialize the bundled model on demand. Process visible media through a bounded worker queue and cache; avoid repeated checks and full-feed uploads. Display actual readiness or an actionable failure instead of a successful protection state when checks cannot run. Covers stay reversible; no complete-blocking claim.

The user selected automatic protection across accessible HTTP(S) websites, with private apps and conversations excluded before analysis. Declare necessary page/image-host access at installation; no separate enable-per-site setup. Chrome consent and protected-page restrictions still apply. [Permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions).

Recover editable source before product changes. Release acceptance: clean installation without saved settings or keys, working inference and reversals, private-page exclusions, accurate failure status, and measured latency/memory/false-cover rates on representative desktop devices. Broader site compatibility and classification accuracy require separate live-page evaluation.
