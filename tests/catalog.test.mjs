import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseReplacement } from "../src/catalog.js";

test("photo cards provide deterministic varied original captions and preserve attribution", () => {
  for (const kind of ["cats", "nature"]) {
    const captions = new Set();
    for (let index = 0; index < 240; index++) {
      const fingerprint = `public-post-${index}`;
      const card = chooseReplacement(kind, fingerprint);
      assert.equal(card.kind, kind);
      assert.equal(typeof card.caption, "string", "photo card must carry harmless original caption");
      assert.ok(card.caption.length >= 15 && card.caption.length <= 160);
      assert.deepEqual(chooseReplacement(kind, fingerprint), card);
      assert.ok(card.image && card.alt && card.credit && card.license);
      assert.match(card.source, /^https:\/\//);
      if (card.licenseURL) assert.match(card.licenseURL, /^https:\/\//);
      captions.add(card.caption);
    }
    assert.ok(captions.size >= 12, "fingerprints must yield varied bundled captions");
  }
});

test("caption selection never interpolates original post content", () => {
  const card = chooseReplacement("cats", "PRIVATE ORIGINAL CAPTION\nBuy my product now");
  assert.equal(typeof card.caption, "string");
  assert.doesNotMatch(card.caption, /PRIVATE ORIGINAL|Buy my product/);
});

test("sourced wisdom preserves text, author and source without photo captions", () => {
  const cards = Array.from({ length: 240 }, (_, index) => chooseReplacement("wisdom", `public-post-${index}`));
  for (const card of cards) {
    assert.equal(card.kind, "wisdom");
    assert.ok(card.text && card.credit && card.work);
    assert.match(card.source, /^https:\/\//);
    assert.equal(card.caption, undefined);
  }
  assert.ok(cards.some((card) => card.type === "quote" && card.credit !== "NOOG · original reflection"));
  assert.ok(cards.some((card) => card.type === "reflection"));
});
