import { normalizeSettings as I } from "./settings.js";
var imageThresholds = (e) =>
  ({
    light: {
      adult: 0.92,
      sexy: 0.96,
    },
    balanced: {
      adult: 0.8,
      sexy: 0.9,
    },
    strong: {
      adult: 0.65,
      sexy: 0.75,
    },
  })[e] ?? {
    adult: 0.8,
    sexy: 0.9,
  };
var normalizeText = (e) => e.normalize("NFKC").toLowerCase(),
  GAMBLING_TERMS =
    /\b(casino|sportsbook|betting|gambl\w*|jackpot|wager\w*|parlay|roulette|slot (?:machine|game)s?|free spins|real.money poker)\b/i,
  GAMBLING_PROMPTS =
    /\b(sign up|signup|register|join|download|deposit|bonus|free spins|referral|code|place a bet|place your|make your|spin now|put money|collect your|stake.{0,25}(dollars|match)|enter now|try.{0,20}with us)\b/i,
  GAMBLING_CONTEXT =
    /\b(addiction|recovery|support group|closed my|block gambling|block.{0,15}ads|harms|workers|union|statistics lesson|probability|expected value|dictionary|do not wager|stop gambling)\b/i,
  ADULT_TERMS =
    /\b(nudes?|uncensored|explicit (content|videos)|adult (content|videos|show)|onlyfans|spicy photos|private (paid channel|adult show|show))\b/i,
  ADULT_PROMPTS =
    /\b(subscribe|subscription|unlock|pay|paid|join|half price|link in bio|link in my bio)\b/i,
  BENIGN_CONTEXT =
    /\b(health|clinic|testing|breastfeeding|museum|sculpture|figure drawing|drawing class|dermatologist|skin cancer|news report|investigation|journalism|research|documentary|policy debate|safety advice)\b/i,
  RECOVERY_CONTEXT =
    /\b(recovery|addiction|quit(?:ting)?|stop watching|avoid|block|support group|exploitation|trafficking|consent education|scam warning)\b/i,
  QUOTED_PROMPT =
    /[“"«][^“"»”]*\b(?:sign up|deposit|subscribe|unlock|join)\b[^“"»”]*[”"»]/i;
function captionDecision(post, settings) {
  let normalized = I(settings),
    caption = normalizeText(post.caption ?? ""),
    creator = normalizeText(post.creator ?? "");
  if (!normalized.enabled)
    return {
      action: "allow",
      reason: "paused",
    };
  if (normalized.allowedCreators.includes(creator))
    return {
      action: "allow",
      reason: "creator_exception",
    };
  let term = normalized.literalTerms.find((m) =>
    caption.includes(normalizeText(m)),
  );
  return term
    ? {
        action: "replace",
        reason: "your_keyword",
        category: "Your keyword",
        term: term,
      }
    : normalized.rageBait &&
        /\b(you should be furious|this will make your blood boil|everyone who disagrees is|rage in the comments)\b/.test(
          caption,
        )
      ? {
          action: "replace",
          reason: "caption_rule",
          category: "Rage bait",
        }
      : normalized.hype &&
          /\b(guaranteed (returns|profit)|get rich (quick|overnight)|100x (coin|gem)|buy now before it pumps|secret system.{0,40}(rich|profit))\b/.test(
            caption,
          )
        ? {
            action: "replace",
            reason: "caption_rule",
            category: "Get-rich-quick hype",
          }
        : normalized.gambling &&
            !GAMBLING_CONTEXT.test(caption) &&
            ((GAMBLING_TERMS.test(caption) && GAMBLING_PROMPTS.test(caption)) ||
              /\b(predict who wins.{0,80}(dollars|money).{0,30}enter now|stake.{0,30}dollars.{0,40}(match|game|referral))\b/i.test(
                caption,
              ))
          ? {
              action: "replace",
              reason: "promotion_rule",
              category: "Gambling promotions",
            }
          : normalized.sexual &&
              !BENIGN_CONTEXT.test(caption) &&
              !RECOVERY_CONTEXT.test(caption) &&
              !QUOTED_PROMPT.test(caption) &&
              ADULT_TERMS.test(caption) &&
              ADULT_PROMPTS.test(caption)
            ? {
                action: "replace",
                reason: "promotion_rule",
                category: "Adult-content promotions",
              }
            : {
                action: "continue",
                reason: "more_evidence",
                ambiguousText: !!(
                  (normalized.gambling &&
                    GAMBLING_TERMS.test(caption) &&
                    !GAMBLING_CONTEXT.test(caption)) ||
                  (normalized.sexual &&
                    ADULT_TERMS.test(caption) &&
                    !BENIGN_CONTEXT.test(caption))
                ),
              };
}
function imageDecision(scores, settings) {
  let normalized = I(settings),
    thresholds = imageThresholds(normalized.sensitivity);
  if (
    ["Porn", "Hentai", "Sexy", "Neutral", "Drawing"].some(
      (m) => !Number.isFinite(scores?.[m]) || scores[m] < 0 || scores[m] > 1,
    )
  )
    return {
      action: "unknown",
      reason: "image_failed",
    };
  let adult = scores.Porn + scores.Hentai >= thresholds.adult,
    suggestive = normalized.suggestive && scores.Sexy >= thresholds.sexy;
  return adult || suggestive
    ? {
        action: "replace",
        reason: "local_image_model",
        category: adult ? "Pornographic images" : "Suggestive images",
        scores: scores,
      }
    : {
        action: "allow",
        reason: "local_image_no_match",
        scores: scores,
      };
}
export { captionDecision, imageDecision };
