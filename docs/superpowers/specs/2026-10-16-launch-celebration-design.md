# Noog launch celebration and whole-post filtering

## Intent

Celebrate Noog's Chrome Web Store launch while fixing the gap where a filtered image or video leaves its promotional caption readable. Keep the product local, reversible, free and playful.

## Release scope

1. **Whole-post replacement.** A positive caption, image or sampled-video verdict replaces the entire supported public post, including caption, links and media. Standalone media keeps its existing sized replacement. Show once, Keep post, creator exceptions, pause controls, private-page exclusions and restoration remain functional. Improve Instagram caption and Reddit title/body extraction. Existing filter settings and local phrase rules continue to govern matching; no claim of understanding every scam or rage-bait post.
2. **Replacement captions.** Original absurd, deadpan internet jokes about kitties, cat unions, cardboard-box revolutions and harmless global liberation. Bundled text, no remote generation. No copied posts, violent instructions, targeted abuse or political targeting. A small reusable catalog supplies varied captions on replacement cards without exposing the original caption beneath them. Builder chooses the precise wording and sampling strategy.
3. **Kitty identity.** Restore the existing black-and-lime campaign kitty prominently beside the website hero. Reuse that identity in the extension and add small lime-accented kitty variants with restrained blink, peek and scurry interactions. Respect reduced motion, avoid motion across reading controls, and keep decorative art out of keyboard focus. Builder chooses implementation details and final visual composition.
4. **Hidden kitty game.** One tiny local game, shared as a portable static asset with the website and bundled in the extension. A discoverable kitty interaction opens it; a keyboard-accessible route exists too. A short catch-the-kitty session with restart, close and no network, payment, analytics, permissions or persistent rewards. Builder chooses exact mechanics and trigger. Keep it visually subordinate to installation and filtering.
5. **Website launch.** Primary CTA becomes Add to Chrome using the verified existing Store listing. Remove pending-review/coming-soon claims from launch copy, keep truthful experimental/privacy limits, existing demo/library/launch-list data, required media credits and approved film. Label the film as the pre-launch teaser where it says Coming soon; do not misrepresent version 0.11.0 as Store-approved while it is pending. Existing website audience/domain and source ownership stay intact.
6. **Release and announcement.** Build/test/package 0.11.0, update release docs, push reviewed source, and submit the update to the existing Store item when publisher access allows. Draft a LinkedIn launch announcement for Samuel to post; do not publish LinkedIn content.

## Existing state and constraints

- Repository: `/Users/samu/noog`, clean `main` at discovery, package version 0.10.0.
- Store: NOOG — Reverse the goon, item `kfcbhdmmkipncdaajpbccefdkjjkihld`, live 0.10.0 on October 16, 2026.
- Site: `https://noog.symbai.studio/`, existing Sites project `appgprj_6ac5ce895b8081918ee69055c39e2f00`. Current account lacks source/edit access. Prepare a concrete handoff kit; messaging the original Develop NOOG Product chat requires Samuel's explicit authorization under the app's thread-messaging rule. Never create a duplicate site or bypass account access.
- Existing settings, pinned dependencies and build flow are sufficient. No new caption AI service or compatibility layers.

## Completion checks

- Deterministic browser tests prove image/video matches hide complete post text and all matched post media, text-only rules cover supported cards, and standalone media still works.
- Instagram and Reddit extraction regressions covered, including benign title/alt with harmful body text.
- Reveal, keep, pause, editor/private transitions and recycled posts restore content correctly.
- Existing unit/browser checks and production packaging pass; verify ZIP contents/version and record checksum.
- Kitty visuals and game work with keyboard, narrow layouts and reduced motion; no unexpected network or permission additions.
- Website publication checked on the public domain after an authorized owner-account deployment. Store submission status reported accurately, with no promise of Google's approval timing.

## Builder decisions

Whole-card replacement is preferred over fragile per-caption overlays. Existing local phrase filters remain the detection mechanism. Release number 0.11.0 and catch-the-kitty mechanics are proposed builder choices, subject to Samuel's design approval.
