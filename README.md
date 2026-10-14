# NOOG — Reverse the goon

NOOG is an experimental desktop Chrome extension for reducing exposure to unwanted web content. It provides local image checks, promotional-caption filters, custom keywords and reversible content covers with cats, nature, wisdom or quiet replacements.

Website: [noog.symbai.studio](https://noog.symbai.studio/)

## Repository status

This first commit preserves the downloaded **0.9.0 Chrome Web Store package**, its included licenses and the initial release findings. The JavaScript files are already bundled and minified. The original editable application source, dependency lockfile, build configuration and test suite have not yet been recovered from the earlier Sites project.

This is a release baseline, not a successful source rebuild. The installed extension's local-image-model setup check failed twice, including after reload. Its underlying cause remains unresolved. No Chrome Web Store submission has been made.

The intended public launch is free. The baseline still contains optional TypeSafe caption sharing and unfinished Plus controls. The launch plan defers Plus; the first commit does not remove those features or change the extension's behavior.

## Contents

| Path | Contents |
| --- | --- |
| `extension/` | Exact unpacked 0.9.0 Web Store package, including assets and third-party licenses |
| `releases/NOOG-Chrome-Web-Store-0.9.0.zip` | Original downloaded upload archive, preserved unchanged |
| `releases/0.9.0-provenance.json` | Package digest and verification record |
| `docs/RELEASE-READINESS.md` | Observed release blocker and remaining launch work |
| `docs/STORE-LISTING-DRAFT.md` | Draft listing and permission explanations for final-package review |
| `docs/INSTALL-AND-USE-RECOMMENDATION.md` | Research comparing model deployment options for a free launch without user API keys |

## Try the baseline

Requires desktop Chrome 116 or later.

1. Open `chrome://extensions` and enable Developer mode.
2. Choose **Load unpacked** and select this repository's `extension` folder.
3. Open NOOG's toolbar and choose **Check protection setup**.
4. Run the setup check before enabling protection on a real feed.

NOOG is experimental. It can miss unwanted content or cover wanted images. The setup check exercises execution with a benign bundled image; even a passing result does not establish detection accuracy.

## Package verification

All 114 unpacked files match the original ZIP byte for byte. All seven JavaScript entry bundles passed syntax checks. These checks do not establish runtime behavior or security.

Original archive SHA-256:

```text
d89428ddaec4663e6f1a4997d7b8f6956d25fcd9b56576e34969d26f87d6e819
```

Run basic syntax checks from the repository root:

```sh
for file in extension/*.js; do
  node --check "$file" || exit 1
done
```

## Licenses

The package's third-party license notices and photograph credits are preserved in `extension/licenses`, the `*.LEGAL.txt` files and `extension/licenses-photo-credits.json`. No new project-wide license is granted by this repository.
