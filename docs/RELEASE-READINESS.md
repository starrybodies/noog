# NOOG release readiness

Date: October 14, 2026

Status: **Not submitted to the Chrome Web Store. The installed local-model setup check fails.**

## Observed results

- Manifest V3, version 0.9.0, minimum Chrome 116.
- The ZIP has `manifest.json` at its root and contains 114 files.
- Every unpacked file matches the original archive byte for byte.
- Manifest-referenced entry scripts, popup and icons exist.
- All seven JavaScript entry bundles pass syntax checks.
- Local WASM binaries, replacement images and license notices are included. Attribution validity has not been independently audited.
- The public privacy page responds at https://noog.symbai.studio/privacy.html.
- Installed Chrome reports version 0.9.0.
- Website access passes the setup check.
- The local-image-model setup check fails twice, including after a fresh extension reload and fresh setup page.

The UI reports:

> The local model could not complete a check. Reload NOOG in Chrome’s extensions page and retry.

The existing settings also report that NOOG and/or pornographic-image filtering needs enabling. The documented setup check exercises the model independently without changing those choices. The underlying failure is hidden by the current generic UI and has not been established.

No real-feed accuracy, video behavior, private-page exclusions, settings import/export or live optional TypeSafe request was verified during this pass. Syntax and package integrity checks do not prove browser behavior or security.

## Source provenance

The initial GitHub commit preserves a built distribution, not the original editable application source. The earlier development chat, **Develop NOOG Product**, identifies a Sites project and a separate 0.9.0 launch kit. The current desktop Sites connection cannot access that project. The launch-kit download attempt timed out.

The next source-recovery step is to export the original project from its owning Sites account and commit its source, build configuration, lockfile and existing tests into this repository. Preserve the original 0.9.0 archive as a provenance record.

## Launch scope

The user authorized the quickest reliable **free extension** launch. Plus can return in a future edition. The baseline still contains Plus and optional TypeSafe caption sharing; those features have not been removed in this first commit.

## Remaining release gates

1. Recover the editable source and original build/test tooling.
2. Trace and fix the demonstrated local-model setup failure. Verify the original symptom and add an appropriate regression check.
3. Remove unfinished Plus controls and unnecessary paid-feature permissions from the free release. Align welcome text, documentation and privacy disclosures with the final behavior.
4. Rebuild and verify the final package in installed Chrome. Check fresh install, local model execution, matched content, pause/show-once, private-page exclusions and settings backup/import. Verify expected external requests and retained optional integrations.
5. Capture authentic final-extension screenshots and prepare store assets.
6. Complete accurate listing, single-purpose, permission and privacy fields with free/public distribution.
7. Finish publisher setup. Developer registration completed during this pass; the dashboard then requested the user's trader/non-trader declaration. The agent did not make that declaration.
8. Submit for Chrome Web Store review and verify the result. Submission does not mean approval or a live listing.

## Official references

- [Publish an extension](https://developer.chrome.com/docs/webstore/publish)
- [Listing information](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
- [Privacy practices](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Program policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
