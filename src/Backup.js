import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import {
  exportPreferences,
  parsePreferences,
  applyPreferences,
} from "./preferences.js";
function Backup({ settings: settings, onChange: onChange }) {
  let inputRef = (0, React.useRef)(),
    [imported, setImported] = (0, React.useState)(),
    [status, setStatus] = (0, React.useState)(""),
    download = () => {
      let I = URL.createObjectURL(
          new Blob(
            [
              JSON.stringify(exportPreferences(settings), null, 2) +
                `
`,
            ],
            {
              type: "application/json",
            },
          ),
        ),
        g = document.createElement("a");
      ((g.href = I),
        (g.download = "NOOG-settings.json"),
        g.click(),
        setTimeout(() => URL.revokeObjectURL(I), 1e3),
        setStatus(
          "Settings exported. Keep the file private if your custom terms are personal.",
        ));
    },
    chooseFile = async (I) => {
      (setImported(void 0), setStatus(""));
      try {
        let g = I.target.files?.[0];
        if (!g) return;
        if (g.size > 65536) throw Error("Choose a settings file under 64 KB.");
        setImported(parsePreferences(await g.text()));
      } catch (g) {
        setStatus(g.message);
      } finally {
        I.target.value = "";
      }
    },
    apply = async () => {
      try {
        if ((await onChange((I) => applyPreferences(I, imported))) === !1)
          throw Error("Import could not be saved. Try again.");
        (setImported(void 0), setStatus("Settings imported."));
      } catch (I) {
        setStatus(I.message);
      }
    };
  return (0, jsxRuntime.jsx)("section", {
    className: "preferences-panel",
    children: (0, jsxRuntime.jsxs)("details", {
      children: [
        (0, jsxRuntime.jsx)("summary", {
          children: "Back up your settings",
        }),
        (0, jsxRuntime.jsx)("p", {
          className: "hint",
          children:
            "Take your free filters, keywords, site pauses and creator exceptions with you. Kept-post fingerprints are excluded.",
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "preferences-actions",
          children: [
            (0, jsxRuntime.jsx)("button", {
              className: "pill-button",
              onClick: download,
              children: "Export settings",
            }),
            (0, jsxRuntime.jsx)("button", {
              className: "text-button",
              onClick: () => inputRef.current.click(),
              children: "Import settings",
            }),
            (0, jsxRuntime.jsx)("input", {
              ref: inputRef,
              type: "file",
              accept: "application/json,.json",
              hidden: !0,
              onChange: chooseFile,
            }),
          ],
        }),
        imported &&
          (0, jsxRuntime.jsxs)("div", {
            className: "preferences-confirm",
            children: [
              (0, jsxRuntime.jsxs)("p", {
                children: [
                  imported.enabled ? "NOOG on" : "NOOG paused",
                  " \xB7 ",
                  imported.replacement,
                  " \xB7 ",
                  imported.sensitivity,
                  " sensitivity",
                  (0, jsxRuntime.jsx)("br", {}),
                  imported.literalTerms.length,
                  " keywords \xB7 ",
                  imported.blockedSites.length,
                  " site filters \xB7 ",
                  imported.allowedCreators.length,
                  " creator exceptions",
                ],
              }),
              (0, jsxRuntime.jsxs)("p", {
                className: "hint",
                children: [
                  imported.holdUncertain || imported.shieldWhileChecking
                    ? "This export includes optional strict covers on supported public feeds."
                    : "Unchecked media remains visible.",
                  " Applying replaces your current filter preferences.",
                ],
              }),
              (0, jsxRuntime.jsx)("button", {
                className: "pill-button",
                onClick: apply,
                children: "Apply imported settings",
              }),
              (0, jsxRuntime.jsx)("button", {
                className: "text-button",
                onClick: () => setImported(void 0),
                children: "Cancel import",
              }),
            ],
          }),
        (0, jsxRuntime.jsx)("p", {
          className: "hint",
          role: "status",
          children: status,
        }),
      ],
    }),
  });
}
export { Backup };
