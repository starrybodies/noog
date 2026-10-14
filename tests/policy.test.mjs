import { test } from "node:test";
import assert from "node:assert/strict";
import { sitePolicy } from "../src/shared/policy.js";
import { normalizeSettings } from "../src/shared/settings.js";
import { captionDecision } from "../src/shared/filters.js";

test("private apps and conversations outrank user site covers", () => {
  for (const url of [
    "https://app.slack.com/client/T1/C1",
    "https://discord.com/channels/@me",
    "https://www.notion.so/workspace",
    "https://mail.google.com/mail/u/0",
    "https://x.com/messages/123",
    "https://chatgpt.com/c/example",
    "https://linkedin.com/messaging/thread/123",
    "https://facebook.com/messages/t/123",
    "https://chat.reddit.com/",
    "http://localhost:3000/private",
    "http://192.168.1.1/",
    "http://workspace.internal/",
  ]) {
    const result = sitePolicy(
      url,
      normalizeSettings({ blockedSites: [new URL(url).hostname] }),
    );
    assert.ok(
      ["private_conversation", "utility_app"].includes(result.kind),
      url + " was " + result.kind,
    );
  }
});
test("public feeds on same domains remain eligible", () => {
  for (const url of [
    "https://x.com/home",
    "https://instagram.com/p/123",
    "https://reddit.com/r/cats",
    "https://example.org/gallery",
  ])
    assert.equal(sitePolicy(url, normalizeSettings()).kind, "active");
});
test("settings reject obsolete cloud fields and unbounded text", () => {
  const settings = normalizeSettings({
    jevEnabled: true,
    cloudConsent: true,
    unexpected: "value",
    literalTerms: ["X".repeat(1000), " Fine "],
    blockedSites: [
      "EXAMPLE.COM",
      "http://localhost",
      "https://user:password@foo.com",
    ],
  });
  assert.equal(Object.hasOwn(settings, "jevEnabled"), false);
  assert.equal(Object.hasOwn(settings, "cloudConsent"), false);
  assert.equal(Object.hasOwn(settings, "unexpected"), false);
  assert.deepEqual(settings.literalTerms, ["fine"]);
  assert.deepEqual(settings.blockedSites, ["example.com"]);
});
test("local caption promotions filter while benign discussion remains", () => {
  const settings = normalizeSettings();
  assert.equal(
    captionDecision(
      { caption: "Join our casino and deposit now for a bonus" },
      settings,
    ).action,
    "replace",
  );
  for (const caption of [
    "Gambling addiction recovery support group",
    "Statistics lesson: probability of winning roulette",
    "News report investigates adult content policy",
    "Subscribe to our breastfeeding health clinic updates",
  ])
    assert.equal(captionDecision({ caption }, settings).action, "continue");
});
