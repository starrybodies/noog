import {
  DEFAULT_SETTINGS as or,
  normalizeSettings as Ie,
} from "./shared/settings.js";
var PREFERENCE_KEYS = Object.keys(or).filter((a) => !["version"].includes(a)),
  preferenceFields = (a) =>
    Object.fromEntries(PREFERENCE_KEYS.map((e) => [e, a[e]]));
function exportPreferences(a) {
  return {
    format: "noog-preferences",
    version: 1,
    settings: preferenceFields(Ie(a)),
  };
}
function parsePreferences(a) {
  if (typeof a != "string" || a.length > 65536)
    throw Error("Choose a NOOG settings file under 64 KB.");
  let e;
  try {
    e = JSON.parse(a);
  } catch {
    throw Error("This file is not valid JSON.");
  }
  if (
    e?.format !== "noog-preferences" ||
    e.version !== 1 ||
    !e.settings ||
    Array.isArray(e.settings) ||
    typeof e.settings != "object"
  )
    throw Error("Choose a NOOG settings export (version 1).");
  for (let o of Object.keys(e.settings))
    if (!PREFERENCE_KEYS.includes(o))
      throw Error("This export contains unsupported settings.");
  for (let o of PREFERENCE_KEYS) {
    let t = e.settings[o],
      n = or[o];
    if (t === void 0) throw Error("This export is missing " + o + ".");
    if (
      Array.isArray(n)
        ? !Array.isArray(t) ||
          t.length > 100 ||
          t.some((s) => typeof s != "string" || s.length > 512)
        : typeof t != typeof n
    )
      throw Error("Invalid setting: " + o + ".");
  }
  return preferenceFields(Ie(e.settings));
}
function applyPreferences(current, imported) {
  return Ie({ ...current, ...preferenceFields(imported) });
}
export { exportPreferences, parsePreferences, applyPreferences };
