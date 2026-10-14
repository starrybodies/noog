import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import {
  ArrowCounterClockwiseIcon,
  BookOpenIcon,
  CatIcon,
  CheckIcon,
  DiceFiveIcon,
  FireIcon,
  LeafIcon,
  LockSimpleIcon,
  MinusSquareIcon,
  PauseIcon,
  PlayIcon,
  SlidersHorizontalIcon,
  TrendUpIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";
function Brand({ compact: a = !1 }) {
  return (0, jsxRuntime.jsxs)("div", {
    className: "brand " + (a ? "compact" : ""),
    children: [
      (0, jsxRuntime.jsx)("img", {
        className: "brand-mark",
        src: "/assets/noog-mark.png",
        alt: "",
      }),
      (0, jsxRuntime.jsx)("img", {
        className: "brand-word",
        src: "/assets/noog-wordmark.png",
        alt: "NOOG",
      }),
    ],
  });
}
function FilterRow({
  label: label,
  checked: checked,
  onChange: onChange,
  icon: Icon,
  note: note,
}) {
  return (0, jsxRuntime.jsxs)("label", {
    className: "filter-row",
    children: [
      (0, jsxRuntime.jsx)(Icon, {
        size: 28,
      }),
      (0, jsxRuntime.jsxs)("span", {
        children: [
          label,
          note &&
            (0, jsxRuntime.jsx)("small", {
              children: note,
            }),
        ],
      }),
      (0, jsxRuntime.jsx)("input", {
        type: "checkbox",
        checked: checked,
        onChange: (s) => onChange(s.target.checked),
      }),
      (0, jsxRuntime.jsx)("span", {
        className: "toggle-track",
        "aria-hidden": "true",
      }),
    ],
  });
}
function Switchboard({
  settings: settings,
  onChange: onChange,
  status = "Changes saved",
  onClose: onClose,
  readiness = "Preparing image checks",
}) {
  let [expanded, setExpanded] = (0, React.useState)(!1),
    [keywords, setKeywords] = (0, React.useState)(
      settings.literalTerms.join(", "),
    ),
    [domains, setDomains] = (0, React.useState)(
      settings.blockedSites.join(", "),
    );
  ((0, React.useEffect)(
    () => setKeywords(settings.literalTerms.join(", ")),
    [settings.literalTerms.join(", ")],
  ),
    (0, React.useEffect)(
      () => setDomains(settings.blockedSites.join(", ")),
      [settings.blockedSites.join(", ")],
    ));
  let setPreference = (h, b) =>
    onChange((H) => ({
      ...H,
      [h]: b,
    }));
  return (0, jsxRuntime.jsxs)("aside", {
    className: "switchboard",
    "aria-label": "NOOG controls",
    children: [
      (0, jsxRuntime.jsxs)("div", {
        className: "panel-top",
        children: [
          (0, jsxRuntime.jsx)(Brand, {}),
          (0, jsxRuntime.jsxs)("button", {
            className: "status-pill " + (settings.enabled ? "" : "paused"),
            onClick: () => setPreference("enabled", !settings.enabled),
            children: [
              (0, jsxRuntime.jsx)("span", {}),
              settings.enabled ? readiness : "Paused",
            ],
          }),
          onClose &&
            (0, jsxRuntime.jsx)("button", {
              className: "icon-button",
              "aria-label": "Close settings",
              onClick: onClose,
              children: (0, jsxRuntime.jsx)(XIcon, {}),
            }),
        ],
      }),
      (0, jsxRuntime.jsxs)("h1", {
        children: ["Reverse", (0, jsxRuntime.jsx)("br", {}), "the goon."],
      }),
      (0, jsxRuntime.jsx)("p", {
        className: "panel-subtitle",
        children: "Less compulsion. More choice.",
      }),
      (0, jsxRuntime.jsxs)("section", {
        className: "control-section",
        children: [
          (0, jsxRuntime.jsx)("h2", {
            children: "What to interrupt",
          }),
          (0, jsxRuntime.jsx)(FilterRow, {
            label: "Pornographic images",
            note: "Checked locally on your device",
            checked: settings.sexual,
            onChange: (h) => setPreference("sexual", h),
            icon: UserIcon,
          }),
          (0, jsxRuntime.jsx)(FilterRow, {
            label: "Gambling promotions",
            checked: settings.gambling,
            onChange: (h) => setPreference("gambling", h),
            icon: DiceFiveIcon,
          }),
          (0, jsxRuntime.jsx)(FilterRow, {
            label: "Rage bait",
            note: "Explicit outrage prompts in captions",
            checked: settings.rageBait,
            onChange: (h) => setPreference("rageBait", h),
            icon: FireIcon,
          }),
          (0, jsxRuntime.jsx)(FilterRow, {
            label: "Get-rich-quick hype",
            note: "Promotional phrases in captions",
            checked: settings.hype,
            onChange: (h) => setPreference("hype", h),
            icon: TrendUpIcon,
          }),
        ],
      }),
      (0, jsxRuntime.jsxs)("section", {
        className: "control-section",
        children: [
          (0, jsxRuntime.jsx)("h2", {
            children: "Swap with",
          }),
          (0, jsxRuntime.jsx)("div", {
            className: "replacement-choices",
            children: [
              ["cats", "Cats", CatIcon],
              ["wisdom", "Wisdom", BookOpenIcon],
              ["nature", "Nature", LeafIcon],
              ["quiet", "Quiet", MinusSquareIcon],
            ].map(([h, b, H]) =>
              (0, jsxRuntime.jsxs)(
                "button",
                {
                  className: settings.replacement === h ? "selected" : "",
                  "aria-pressed": settings.replacement === h,
                  onClick: () => setPreference("replacement", h),
                  children: [
                    (0, jsxRuntime.jsx)(H, {
                      size: 32,
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: b,
                    }),
                  ],
                },
                h,
              ),
            ),
          }),
        ],
      }),
      (0, jsxRuntime.jsxs)("section", {
        className: "control-section",
        children: [
          (0, jsxRuntime.jsx)("h2", {
            children: "Image sensitivity",
          }),
          (0, jsxRuntime.jsx)("div", {
            className: "segments",
            "aria-label": "Image sensitivity",
            children: ["light", "balanced", "strong"].map((h) =>
              (0, jsxRuntime.jsx)(
                "button",
                {
                  className: settings.sensitivity === h ? "selected" : "",
                  "aria-pressed": settings.sensitivity === h,
                  onClick: () => setPreference("sensitivity", h),
                  children: h[0].toUpperCase() + h.slice(1),
                },
                h,
              ),
            ),
          }),
          (0, jsxRuntime.jsx)("p", {
            className: "hint",
            children: "Stronger filtering may hide more wanted posts.",
          }),
        ],
      }),
      (0, jsxRuntime.jsxs)("section", {
        className: "control-section video-controls",
        children: [
          (0, jsxRuntime.jsx)("h2", {
            children: "Videos & reels",
          }),
          (0, jsxRuntime.jsx)("div", {
            className: "segments",
            "aria-label": "Video protection",
            children: [
              ["sample", "Sample"],
              ["cover", "Cover all"],
              ["off", "Off"],
            ].map(([h, b]) =>
              (0, jsxRuntime.jsx)(
                "button",
                {
                  className: settings.videoMode === h ? "selected" : "",
                  "aria-pressed": settings.videoMode === h,
                  onClick: () => setPreference("videoMode", h),
                  children: b,
                },
                h,
              ),
            ),
          }),
          (0, jsxRuntime.jsx)("p", {
            className: "hint",
            children:
              settings.videoMode === "sample"
                ? "Checks readable frames locally about every 3 seconds while visible and playing. Only matches are swapped. Unreadable media stays visible. Optional strict covers apply only to supported public feeds."
                : settings.videoMode === "cover"
                  ? "Cover detected videos and reels until you choose Show once. Works even when frames cannot be read."
                  : "Video frame checks are off. Caption and image filters still apply.",
          }),
        ],
      }),
      (0, jsxRuntime.jsxs)("div", {
        className: "save-row",
        children: [
          (0, jsxRuntime.jsxs)("span", {
            children: [
              (0, jsxRuntime.jsx)(CheckIcon, {
                weight: "bold",
              }),
              status,
            ],
          }),
          (0, jsxRuntime.jsxs)("button", {
            className: "pill-button",
            onClick: () => setPreference("enabled", !settings.enabled),
            children: [
              settings.enabled
                ? (0, jsxRuntime.jsx)(PauseIcon, {
                    weight: "fill",
                  })
                : (0, jsxRuntime.jsx)(PlayIcon, {
                    weight: "fill",
                  }),
              settings.enabled ? "Pause NOOG" : "Resume NOOG",
            ],
          }),
        ],
      }),
      (0, jsxRuntime.jsxs)("p", {
        className: "privacy",
        children: [
          (0, jsxRuntime.jsx)(LockSimpleIcon, {}),
          "Your feed stays on your device.",
        ],
      }),
      (0, jsxRuntime.jsxs)("div", {
        className: "panel-utility",
        children: [
          (0, jsxRuntime.jsxs)("button", {
            onClick: () => setExpanded(!expanded),
            "aria-expanded": expanded,
            children: [
              (0, jsxRuntime.jsx)(SlidersHorizontalIcon, {}),
              "More controls",
            ],
          }),
        ],
      }),
      expanded &&
        (0, jsxRuntime.jsxs)("div", {
          className: "advanced",
          children: [
            (0, jsxRuntime.jsx)("h2", {
              children: "Image protection",
            }),
            (0, jsxRuntime.jsxs)("label", {
              className: "check-row",
              children: [
                (0, jsxRuntime.jsx)("input", {
                  type: "checkbox",
                  checked: settings.suggestive,
                  onChange: (h) =>
                    setPreference("suggestive", h.target.checked),
                }),
                "Also filter suggestive images",
              ],
            }),
            (0, jsxRuntime.jsxs)("label", {
              className: "check-row",
              children: [
                (0, jsxRuntime.jsx)("input", {
                  type: "checkbox",
                  checked: settings.blockAdultSites,
                  onChange: (h) =>
                    setPreference("blockAdultSites", h.target.checked),
                }),
                "Cover known adult sites",
              ],
            }),
            (0, jsxRuntime.jsx)("p", {
              className: "hint",
              children:
                "A local domain list creates a pause on known adult sites. Add other sites below. Chrome site access is required.",
            }),
            (0, jsxRuntime.jsxs)("label", {
              className: "check-row",
              children: [
                (0, jsxRuntime.jsx)("input", {
                  type: "checkbox",
                  checked: settings.shieldWhileChecking,
                  onChange: (h) =>
                    setPreference("shieldWhileChecking", h.target.checked),
                }),
                "Cover feed media while checking",
              ],
            }),
            (0, jsxRuntime.jsx)("p", {
              className: "hint",
              children:
                "Off by default. Hides media while checking public feeds on X, Instagram, Reddit and YouTube. General web pages and private utility apps stay visible.",
            }),
            (0, jsxRuntime.jsx)("h2", {
              children: "Your custom filters",
            }),
            (0, jsxRuntime.jsxs)("label", {
              className: "field-label",
              children: [
                "Keywords to swap",
                (0, jsxRuntime.jsx)("input", {
                  value: keywords,
                  onChange: (h) => setKeywords(h.target.value),
                  onBlur: () =>
                    setPreference(
                      "literalTerms",
                      keywords
                        .split(",")
                        .map((h) => h.trim())
                        .filter(Boolean),
                    ),
                  onKeyDown: (h) => {
                    h.key === "Enter" &&
                      (h.preventDefault(), h.currentTarget.blur());
                  },
                  placeholder: "Separate with commas",
                }),
              ],
            }),
            (0, jsxRuntime.jsx)("p", {
              className: "hint",
              children:
                "Your terms match as phrases. Press Enter or Tab to save.",
            }),
            (0, jsxRuntime.jsxs)("label", {
              className: "field-label",
              children: [
                "Sites to cover",
                (0, jsxRuntime.jsx)("input", {
                  value: domains,
                  onChange: (h) => setDomains(h.target.value),
                  onBlur: () =>
                    setPreference(
                      "blockedSites",
                      domains
                        .split(",")
                        .map((h) => h.trim())
                        .filter(Boolean),
                    ),
                  onKeyDown: (h) => {
                    h.key === "Enter" &&
                      (h.preventDefault(), h.currentTarget.blur());
                  },
                  placeholder: "example.com, another.com",
                }),
              ],
            }),
            (0, jsxRuntime.jsx)("p", {
              className: "hint",
              children:
                "Domains include their subdomains. Invalid entries are removed on save.",
            }),
            (0, jsxRuntime.jsxs)("label", {
              className: "check-row",
              children: [
                (0, jsxRuntime.jsx)("input", {
                  type: "checkbox",
                  checked: settings.holdUncertain,
                  onChange: (h) =>
                    setPreference("holdUncertain", h.target.checked),
                }),
                "Strict mode: cover unchecked feed media",
              ],
            }),
            (0, jsxRuntime.jsx)("p", {
              className: "hint",
              children:
                "Off by default. Applies to public feeds on X, Instagram, Reddit and YouTube. Failed checks can cover ordinary feed media; that is not a content match. General web pages require a filter match. Find My, known map/mail/document apps and supported private messages are skipped. Sampling can miss content between frames. The local model estimates pornography, including explicit drawings. Suggestive filtering is optional. Art, health and fitness can still be misclassified.",
            }),
            settings.allowedCreators.length > 0 &&
              (0, jsxRuntime.jsxs)("div", {
                className: "exceptions",
                children: [
                  (0, jsxRuntime.jsx)("strong", {
                    children: "Always show",
                  }),
                  settings.allowedCreators.map((h) =>
                    (0, jsxRuntime.jsxs)(
                      "button",
                      {
                        onClick: () =>
                          onChange((b) => ({
                            ...b,
                            allowedCreators: b.allowedCreators.filter(
                              (H) => H !== h,
                            ),
                          })),
                        children: [
                          (0, jsxRuntime.jsx)(ArrowCounterClockwiseIcon, {}),
                          "@",
                          h,
                          (0, jsxRuntime.jsx)("span", {
                            children: "Remove",
                          }),
                        ],
                      },
                      h,
                    ),
                  ),
                ],
              }),
          ],
        }),
    ],
  });
}
export { Switchboard };
