var ADULT_DOMAINS = Object.freeze([
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "chaturbate.com",
  "stripchat.com",
  "cam4.com",
  "livejasmin.com",
  "motherless.com",
  "eporner.com",
  "erome.com",
  "beeg.com",
  "sex.com",
  "rule34.xxx",
  "hanime.tv",
]);
function normalizeDomain(e) {
  if (typeof e != "string" || !e.trim()) return "";
  try {
    let t = new URL(e.includes("://") ? e.trim() : "https://" + e.trim());
    if (!["https:", "http:"].includes(t.protocol) || t.username || t.password)
      return "";
    let o = t.hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(
      o,
    )
      ? o
      : "";
  } catch {
    return "";
  }
}
var hostMatches = (e, t) => e === t || e.endsWith("." + t),
  isPrivateChat = (e) => {
    let t = normalizeDomain(e);
    return ["chatgpt.com", "chat.openai.com"].some((o) => hostMatches(t, o));
  },
  PRIVATE_APPS = Object.freeze([
    "icloud.com",
    "icloud.com.cn",
    "mail.google.com",
    "calendar.google.com",
    "drive.google.com",
    "docs.google.com",
    "outlook.live.com",
    "outlook.office.com",
    "outlook.office365.com",
    "onedrive.live.com",
    "maps.apple.com",
    "maps.google.com",
    "slack.com",
    "discord.com",
    "discordapp.com",
    "notion.so",
    "notion.site",
    "teams.microsoft.com",
    "web.whatsapp.com",
    "web.telegram.org",
    "messenger.com",
    "mail.yahoo.com",
    "mail.proton.me",
    "account.proton.me",
    "app.fastmail.com",
    "meet.google.com",
    "app.zoom.us",
    "claude.ai",
    "gemini.google.com",
    "copilot.microsoft.com",
    "chat.google.com",
    "chat.reddit.com",
    "app.microsoft365.com",
  ]);
function excludedContext(e) {
  let t = normalizeDomain(e);
  if (
    /^https?:\/\//.test(e) &&
    (!t || /\.(?:localhost|local|internal|lan|home|intranet|corp)$/.test(t))
  )
    return {
      kind: "utility_app",
      title: "Private local app · skipped",
      detail:
        "NOOG skips localhost, IP-address pages and local intranet names.",
    };
  if (isPrivateChat(t))
    return {
      kind: "private_conversation",
      title: "Private conversation \xB7 skipped",
      detail: "NOOG does not analyse ChatGPT messages or attachments.",
    };
  let o = "";
  try {
    o = new URL(e.includes("://") ? e : "https://" + e).pathname;
  } catch {}
  let r =
      (["x.com", "twitter.com"].some((s) => hostMatches(t, s)) &&
        /^\/(?:messages|i\/chat)(?:\/|$)/.test(o)) ||
      (hostMatches(t, "instagram.com") && /^\/direct(?:\/|$)/.test(o)) ||
      (hostMatches(t, "reddit.com") && /^\/(?:message|chat)(?:\/|$)/.test(o)),
    privateSocial =
      (hostMatches(t, "facebook.com") &&
        /^\/(?:messages|messenger)(?:\/|$)/.test(o)) ||
      (hostMatches(t, "linkedin.com") && /^\/messaging(?:\/|$)/.test(o)) ||
      (hostMatches(t, "tiktok.com") &&
        /^\/(?:messages|inbox)(?:\/|$)/.test(o)) ||
      (hostMatches(t, "bsky.app") && /^\/(?:messages|chat)(?:\/|$)/.test(o)),
    l =
      ["google.com", "bing.com"].some((s) => hostMatches(t, s)) &&
      /^\/maps(?:\/|$)/.test(o);
  return r || privateSocial || l || PRIVATE_APPS.some((s) => hostMatches(t, s))
    ? {
        kind: "utility_app",
        title: "Private app or utility \xB7 skipped",
        detail:
          "NOOG skips Find My, maps, private messages, mail and document workspaces.",
      }
    : null;
}
function sitePolicy(e, t) {
  let o = normalizeDomain(e);
  let privateContext = excludedContext(e);
  if (privateContext) return { host: o, ...privateContext };
  if (!t.enabled)
    return {
      host: o,
      kind: "paused",
    };
  if ((t.pausedSites ?? []).some((l) => hostMatches(o, l)))
    return {
      host: o,
      kind: "site_paused",
    };
  if ((t.blockedSites ?? []).some((l) => hostMatches(o, l)))
    return {
      host: o,
      kind: "blocked",
      reason: "Your site filter",
    };
  return t.sexual &&
    t.blockAdultSites &&
    ADULT_DOMAINS.some((l) => hostMatches(o, l))
    ? {
        host: o,
        kind: "blocked",
        reason: "Adult-site filter",
      }
    : {
        host: o,
        kind: "active",
      };
}
export { normalizeDomain, hostMatches, excludedContext, sitePolicy };
