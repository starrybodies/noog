import { test } from "node:test";
import assert from "node:assert/strict";
import { publicImageUrl, isJpegFrame } from "../src/shared/media.js";
import { imageDecision } from "../src/shared/filters.js";
import { normalizeSettings } from "../src/shared/settings.js";
import { exportPreferences, parsePreferences } from "../src/preferences.js";
test("worker refuses credentials, local networks, private hosts and non-image schemes", () => {
  for (const value of [
    "http://127.0.0.1/image.jpg",
    "http://[::1]/x",
    "https://printer.local/x",
    "https://localhost/x",
    "https://user:password@example.com/x",
    "https://mail.google.com/attachment",
    "data:image/png;base64,abcd",
    "file:///tmp/image.jpg",
  ])
    assert.equal(publicImageUrl(new URL(value)), false, value);
  assert.equal(
    publicImageUrl(new URL("https://images.example.com/public.jpg")),
    true,
  );
  assert.equal(isJpegFrame("data:image/png;base64,YWJj"), false);
  assert.equal(
    isJpegFrame("data:image/jpeg;base64," + "A".repeat(100000)),
    false,
  );
});
test("invalid scores stay unknown, adult matches cover, benign photos remain", () => {
  assert.equal(imageDecision({ Porn: NaN }, {}).action, "unknown");
  assert.equal(
    imageDecision(
      { Porn: 0.86, Hentai: 0.01, Sexy: 0.02, Neutral: 0.1, Drawing: 0.01 },
      {},
    ).action,
    "replace",
  );
  assert.equal(
    imageDecision(
      { Porn: 0.01, Hentai: 0.01, Sexy: 0.01, Neutral: 0.96, Drawing: 0.01 },
      {},
    ).action,
    "allow",
  );
  assert.equal(
    imageDecision(
      { Porn: 0.01, Hentai: 0.01, Sexy: 0.96, Neutral: 0.01, Drawing: 0.01 },
      {},
    ).action,
    "allow",
  );
});
test("backup round trips current preferences and rejects hidden credential fields", () => {
  const settings = normalizeSettings({
    pausedSites: ["example.com"],
    literalTerms: ["secret phrase"],
  });
  const serialized = JSON.stringify(exportPreferences(settings));
  assert.deepEqual(parsePreferences(serialized), settings);
  const poisoned = JSON.parse(serialized);
  poisoned.settings.jevKey = "secret";
  assert.throws(
    () => parsePreferences(JSON.stringify(poisoned)),
    /unsupported settings/,
  );
});
