import { normalizeDomain } from "./policy.js";

export const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  sexual: true,
  suggestive: false,
  blockAdultSites: true,
  shieldWhileChecking: false,
  gambling: true,
  rageBait: false,
  hype: false,
  videoMode: "sample",
  replacement: "cats",
  sensitivity: "balanced",
  literalTerms: [],
  blockedSites: [],
  pausedSites: [],
  allowedCreators: [],
  holdUncertain: false,
});

export function normalizeSettings(input = {}) {
  input = input && typeof input === "object" ? input : {};
  const settings = { ...DEFAULT_SETTINGS };
  for (const [key, initial] of Object.entries(DEFAULT_SETTINGS)) {
    if (typeof initial === "boolean")
      settings[key] = input[key] === undefined ? initial : input[key] === true;
  }
  for (const [key, choices] of Object.entries({
    replacement: ["cats", "wisdom", "nature", "quiet"],
    videoMode: ["sample", "cover", "off"],
    sensitivity: ["light", "balanced", "strong"],
  })) {
    if (choices.includes(input[key])) settings[key] = input[key];
  }
  for (const key of ["literalTerms", "allowedCreators"]) {
    settings[key] = [
      ...new Set(
        (Array.isArray(input[key]) ? input[key] : [])
          .filter(
            (value) =>
              typeof value === "string" && value.trim() && value.length <= 512,
          )
          .map((value) => value.trim().toLowerCase()),
      ),
    ].slice(0, 100);
  }
  for (const key of ["blockedSites", "pausedSites"])
    settings[key] = [
      ...new Set(
        (Array.isArray(input[key]) ? input[key] : [])
          .map(normalizeDomain)
          .filter(Boolean),
      ),
    ].slice(0, 100);
  return settings;
}
