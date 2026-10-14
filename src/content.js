import {
  normalizeDomain,
  hostMatches,
  excludedContext,
  sitePolicy,
} from "./shared/policy.js";
import { normalizeSettings } from "./shared/settings.js";
import { captionDecision } from "./shared/filters.js";
import { chooseReplacement } from "./catalog.js";
import { sha256 } from "@noble/hashes/sha256";
function isPublicFeed(e) {
  let t = normalizeDomain(e);
  return (
    !excludedContext(e) &&
    [
      "x.com",
      "twitter.com",
      "instagram.com",
      "reddit.com",
      "old.reddit.com",
      "new.reddit.com",
      "sh.reddit.com",
      "youtube.com",
      "m.youtube.com",
    ].includes(t)
  );
}
var FEED_CARDS =
    'article[data-testid="tweet"],shreddit-post,[data-testid="post-container"],.thing.link,ytd-rich-item-renderer,ytd-video-renderer,ytd-grid-video-renderer,ytd-reel-video-renderer,ytd-shorts-video-renderer',
  GENERAL_CARDS = 'article,[role="article"],figure',
  BACKGROUND_SELECTOR = '[style*="background"]',
  PRIVATE_CONTENT =
    'form,input,textarea,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="log"],[data-testid="DMDrawer"],[aria-label="Chat" i],[aria-label="Chats" i],[aria-label="Messages" i],[aria-label="Direct messages" i]',
  PRIVATE_ELEMENTS = PRIVATE_CONTENT + ",nav,header,footer",
  MAP_ELEMENTS =
    ".gm-style,.leaflet-container,.mapboxgl-map,.maplibregl-map,[data-map-container]",
  GENERAL_CONTROLS =
    'button,[role="button"],[role="toolbar"],[role="menu"],[role="slider"],[role="tablist"],[role="tree"]',
  isNoogElement = (e) => e.closest?.("[data-noog-owned]"),
  imagesIn = (e) =>
    [...e.querySelectorAll("img")].filter((t) => !isNoogElement(t)),
  sizeCache = new WeakMap(),
  largeEnough = (e) => {
    let t = e.getBoundingClientRect?.();
    if (t && t.width && t.height) {
      let i = t.width >= 120 && t.height >= 80;
      return (sizeCache.set(e, i), i);
    }
    return t
      ? (sizeCache.get(e) ?? !1)
      : (e.width || e.naturalWidth || 0) >= 120 &&
          (e.height || e.naturalHeight || 80) >= 80;
  };
function createAdapter(document) {
  let host = document.location?.hostname ?? "x.com",
    privatePage = () => excludedContext(document.location?.href ?? host),
    isX = /^(www\.)?(x|twitter)\.com$/.test(host),
    isInstagram = /(^|\.)instagram\.com$/.test(host),
    adapterName = isX
      ? "X"
      : isInstagram
        ? "Instagram"
        : /(^|\.)reddit\.com$/.test(host)
          ? "Reddit"
          : /(^|\.)youtube\.com$/.test(host)
            ? "YouTube"
            : "General web",
    excludedNode = (n) =>
      n.closest?.(PRIVATE_ELEMENTS) ||
      n.closest?.(MAP_ELEMENTS) ||
      (adapterName === "General web" && n.closest?.(GENERAL_CONTROLS)) ||
      !!(
        n.closest?.('[role="dialog"]') &&
        (!isInstagram ||
          !n
            .closest?.('[role="dialog"]')
            .querySelector(
              'a[href*="/reel/"],a[href*="/reels/"],a[href*="/p/"]',
            ))
      ),
    eligible = (node) => {
      if (privatePage() || isNoogElement(node) || excludedNode(node))
        return false;
      const card = node.closest?.(FEED_CARDS + "," + GENERAL_CARDS) ?? node;
      return !card.querySelector(PRIVATE_CONTENT);
    },
    knownBackgrounds = new WeakSet(),
    streamIds = new WeakMap(),
    streamSequence = 0,
    videoSource = (n) => {
      let p = n.srcObject,
        k = "";
      return (
        p &&
          typeof p == "object" &&
          (streamIds.has(p) || streamIds.set(p, ++streamSequence),
          (k = streamIds.get(p))),
        [n.currentSrc || n.src || n.querySelector?.("source")?.src || "", k]
      );
    },
    backgroundImages = (n) =>
      [
        ...(
          document.defaultView?.getComputedStyle?.(n)?.backgroundImage ??
          n.style?.backgroundImage ??
          ""
        ).matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g),
      ]
        .map((k) => {
          try {
            return new URL(k[1] ?? k[2] ?? k[3].trim(), document.location?.href)
              .href;
          } catch {
            return "";
          }
        })
        .filter(Boolean),
    backgroundNodes = (n) =>
      [n, ...n.querySelectorAll(BACKGROUND_SELECTOR)].filter(
        (p) => eligible(p) && backgroundImages(p).length && largeEnough(p),
      ),
    mediaNodes = (n) =>
      [
        ...new Set([
          ...(n.matches("img,video,canvas") ? [n] : []),
          ...n.querySelectorAll("img,video,canvas"),
          ...backgroundNodes(n),
        ]),
      ].filter((p) => !isNoogElement(p) && !excludedNode(p));
  function candidates() {
    if (privatePage()) return [];
    if (["noog.symbai.studio", "noog.gaiaai.chatgpt.site"].includes(host))
      return [];
    if (isX)
      return [
        ...document.querySelectorAll('article[data-testid="tweet"]'),
      ].filter(eligible);
    let n = [],
      p = new Set(),
      k = (f) => {
        for (let A = f.parentElement; A; A = A.parentElement)
          if (p.has(A)) return !0;
        return !1;
      };
    for (let f of document.querySelectorAll(FEED_CARDS + "," + GENERAL_CARDS))
      !eligible(f) ||
        f.textContent.length > 8e3 ||
        f.querySelectorAll('article,[role="article"],shreddit-post').length >
          1 ||
        k(f) ||
        (f.matches("figure") &&
          !mediaNodes(f).some((A) => !A.matches("canvas") && largeEnough(A))) ||
        (n.push(f), p.add(f));
    for (let f of document.querySelectorAll("img,video," + BACKGROUND_SELECTOR))
      if (
        !(!eligible(f) || f.closest("button") || k(f)) &&
        !(["IMG", "VIDEO"].includes(f.tagName) && !largeEnough(f))
      ) {
        if (!["IMG", "VIDEO"].includes(f.tagName)) {
          if (
            f === document.body ||
            f === document.documentElement ||
            f.matches('main,[role="main"]') ||
            f.querySelectorAll('article,[role="article"],shreddit-post')
              .length ||
            !backgroundImages(f).length
          )
            continue;
          let A = f.getBoundingClientRect();
          if (!knownBackgrounds.has(f) && (A.width < 120 || A.height < 80))
            continue;
          knownBackgrounds.add(f);
        }
        n.push(f);
      }
    return n;
  }
  function read(n) {
    let p =
      privatePage() ??
      (!eligible(n)
        ? {
            kind: "private_container",
            title: "Private content · skipped",
          }
        : null);
    if (p)
      return {
        excluded: true,
        caption: "",
        creator: "",
        images: [],
        image: "",
        hasVideo: !1,
        uninspectedMedia: !1,
        adapter: p.title,
        fingerprint: JSON.stringify([document.location?.href ?? host, p.kind]),
      };
    let k = isX ? n.querySelector('[data-testid="tweetText"]') : null,
      f =
        (isInstagram &&
          (n.querySelector('h1,[data-testid="post-caption"]')?.textContent ||
            imagesIn(n)
              .find((B) => Math.max(B.width || 0, B.naturalWidth || 0) >= 120)
              ?.getAttribute?.("alt") ||
            n.getAttribute("alt"))) ||
        "",
      A = (
        isX
          ? (k?.textContent ?? "")
          : isInstagram
            ? f
            : n.getAttribute("post-title") ||
              n.getAttribute("aria-label") ||
              n.textContent?.trim() ||
              n.getAttribute("alt") ||
              ""
      )
        .trim()
        .slice(0, 1200),
      x = [...n.querySelectorAll("a[href]")],
      K = x
        .map((B) => B.getAttribute("href"))
        .find((B) => /^\/[\w]+\/status\/\d+/.test(B ?? ""))
        ?.match(/^\/([^/]+)\/status\/(\d+)/),
      U = isX ? (K?.[1]?.toLowerCase() ?? "") : "";
    if (!isX) {
      let B =
        n.getAttribute("author") ||
        x
          .find((X) =>
            isInstagram
              ? /^\/(?!p\/|reels?\/|explore\/|accounts\/|direct\/|stories\/)[a-zA-Z0-9._]+\/?$/.test(
                  X.getAttribute("href") ?? "",
                )
              : /^\/(?:user|u|@|channel\/)/.test(X.getAttribute("href") ?? ""),
          )
          ?.getAttribute("href");
      B &&
        (U =
          host + ":" + B.toLowerCase().replace(/^\//, "").replace(/\/$/, ""));
    }
    let $ = (
        isX
          ? [...n.querySelectorAll('[data-testid="tweetPhoto"] img')]
          : n.matches("img")
            ? [n]
            : imagesIn(n).filter(largeEnough)
      ).filter((B) => !excludedNode(B)),
      D = $.map((B) => B.currentSrc || B.src).filter(Boolean);
    for (let B of backgroundNodes(n)) D.push(...backgroundImages(B));
    let j = videos(n);
    for (let B of j) B.poster && D.push(B.poster);
    let P = [...new Set(D)].slice(0, 4),
      W = !!(j.length || n.querySelector('[data-testid="videoPlayer"]')),
      Z =
        new Set(D).size > 4 ||
        !!(
          n.matches("canvas") ||
          [...n.querySelectorAll("canvas,svg image")].some(largeEnough)
        ) ||
        $.some((B) => !(B.currentSrc || B.src)) ||
        !!(isX && n.querySelector('[data-testid="tweetPhoto"]') && !P.length);
    return {
      caption: A,
      creator: U,
      images: P,
      image: P[0] ?? "",
      hasVideo: W,
      uninspectedMedia: Z,
      adapter: adapterName,
      fingerprint: JSON.stringify([
        document.location?.href,
        K?.[2],
        U,
        A,
        D,
        W,
        Z,
        j.map(videoSource),
      ]),
    };
  }
  function videos(n) {
    return [
      ...(n.matches("video") ? [n] : []),
      ...n.querySelectorAll("video"),
    ].filter((p) => !isNoogElement(p) && !excludedNode(p));
  }
  function matchedMedia(n, p) {
    let k = new Set(p?.images ?? []),
      f = videos(n),
      A = [];
    for (let x of mediaNodes(n))
      ((x.matches("img") && k.has(x.currentSrc || x.src)) ||
        (x.matches("video") &&
          (k.has(x.poster) || (p?.videos ?? []).includes(f.indexOf(x)))) ||
        (!x.matches("img,video,canvas") &&
          backgroundImages(x).some((I) => k.has(I)))) &&
        A.push(x);
    return [...new Set(A)].filter(
      (x) => !A.some((I) => I !== x && x.contains?.(I)),
    );
  }
  return {
    name: adapterName,
    candidates: candidates,
    eligible,
    read: read,
    mediaNodes: mediaNodes,
    matchedMedia: matchedMedia,
    videos: videos,
  };
}
function isJpegFrame(e) {
  return (
    typeof e == "string" &&
    e.length <= 1e5 &&
    /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(e)
  );
}
function sampleVideoFrame(video, document) {
  if (video.mediaKeys)
    return {
      ok: !1,
      reason: "video_unreadable",
    };
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight)
    return {
      ok: !1,
      reason: "video_not_ready",
    };
  try {
    let i = document.createElement("canvas");
    i.width = i.height = 224;
    let s = i.getContext("2d");
    if (!s)
      return {
        ok: !1,
        reason: "video_unreadable",
      };
    s.drawImage(video, 0, 0, 224, 224);
    let a = i.toDataURL("image/jpeg", 0.72);
    return isJpegFrame(a)
      ? {
          ok: !0,
          frame: a,
        }
      : {
          ok: !1,
          reason: "video_unreadable",
        };
  } catch {
    return {
      ok: !1,
      reason: "video_unreadable",
    };
  }
}
function createSiteCover(e, t, i) {
  let s,
    a,
    d = new Map(),
    l = () => {
      if (s) {
        for (let g of e.body.children)
          g === s ||
            ["SCRIPT", "STYLE", "LINK"].includes(g.tagName) ||
            (d.has(g) ||
              d.set(g, {
                value: g.style.getPropertyValue("visibility"),
                priority: g.style.getPropertyPriority("visibility"),
                inert: g.inert,
              }),
            g.style.setProperty("visibility", "hidden", "important"),
            (g.inert = !0));
        for (let g of e.querySelectorAll("video")) g.pause();
      }
    },
    m = (g) => {
      s && g.target?.tagName === "VIDEO" && g.target.pause();
    };
  e.addEventListener("play", m, !0);
  let h = () => {
    (s?.remove(), (s = null));
    for (let [g, u] of d)
      (u.value
        ? g.style.setProperty("visibility", u.value, u.priority)
        : g.style.removeProperty("visibility"),
        (g.inert = u.inert));
    (d.clear(), a?.focus?.(), (a = null));
  };
  return {
    show: () => {
      if (!s) {
        ((a = e.activeElement),
          (s = e.createElement("div")),
          s.setAttribute("data-noog-owned", ""),
          (s.style.cssText =
            "position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important;visibility:visible!important;"));
        let g = s.attachShadow({
            mode: "open",
          }),
          u = e.createElement("style");
        ((u.textContent =
          "*{box-sizing:border-box}.screen{height:100dvh;overflow:auto;display:grid;place-items:center;padding:28px;background:#101413;color:#edf2e8;font:16px/1.5 Arial,sans-serif}.card{max-width:540px;width:100%;padding:30px;border:1px solid #39463a;border-radius:24px;background:#1a211b}.logo{width:150px;height:auto}h1{font-size:48px;line-height:1.05;letter-spacing:-2px;margin:28px 0 16px}p{color:#b7c0b5}.photo{width:100%;height:150px;object-fit:cover;border-radius:12px}button,a{font:inherit;display:inline-block;padding:12px 18px;border-radius:30px;cursor:pointer;margin:12px 8px 0 0;text-decoration:none}a{background:#cdf66b;color:#162015}button{border:1px solid #56604e;background:none;color:#d7dfd2}button:focus-visible,a:focus-visible{outline:3px solid #cdf66b;outline-offset:4px}.note{font-size:12px}"),
          g.append(u));
        let w = e.createElement("section");
        ((w.className = "screen"),
          w.setAttribute("role", "dialog"),
          w.setAttribute("aria-modal", "true"),
          w.setAttribute("aria-label", "NOOG site filter"));
        let _ = e.createElement("div");
        _.className = "card";
        let y = e.createElement("img");
        ((y.src = t("assets/noog-wordmark.png")),
          (y.alt = "NOOG"),
          (y.className = "logo"));
        let v = e.createElement("h1");
        v.textContent = "Reverse the goon.";
        let E = e.createElement("p");
        E.textContent =
          "A pause between the impulse and your next choice. This site is covered by your NOOG filters.";
        let S = e.createElement("img");
        ((S.src = t("assets/nature.webp")),
          (S.alt = "A calm mountain lake"),
          (S.className = "photo"));
        let F = e.createElement("a");
        ((F.href = t("reset.html")), (F.textContent = "Take a breather"));
        let n = e.createElement("button");
        ((n.type = "button"),
          (n.textContent = "Continue this visit"),
          (n.onclick = () => {
            (h(), i());
          }));
        let p = e.createElement("p");
        ((p.className = "note"),
          (p.textContent =
            "You stay in charge. Change site filters or pause this site from the NOOG toolbar."),
          _.append(y, v, E, S, F, n, p),
          w.append(_),
          g.append(w),
          e.body.append(s),
          F.focus());
        let k = (f) => {
          if (f.key === "Tab") {
            let A = g.activeElement;
            f.shiftKey && A === F
              ? (f.preventDefault(), n.focus())
              : !f.shiftKey && A === n && (f.preventDefault(), F.focus());
          }
        };
        g.addEventListener("keydown", k);
      }
      l();
    },
    clear: h,
    active: () => !!s,
    stop() {
      (h(), e.removeEventListener("play", m, !0));
    },
  };
}
function createPostCover(
  e,
  {
    replacement: t,
    decision: i,
    asset: s,
    onShow: a,
    onAllow: d,
    onKeep: l,
    creator: m,
  },
) {
  let h = (n, p, k) => {
      let f = e.createElement(n);
      return (p && (f.textContent = p), k && (f.className = k), f);
    },
    C = h("div", null, "noog-swap");
  C.setAttribute("data-noog-owned", "");
  let g = C.attachShadow({
      mode: "open",
    }),
    u = h("style");
  ((u.textContent = `
    :host{all:initial;display:block;box-sizing:border-box;min-width:0;max-width:100%;margin:0;color:#f4f5f5;font:14px/1.4 Arial,sans-serif;container-type:inline-size}
    :host([data-noog-tile]){position:absolute;z-index:2;overflow:hidden}
    *{box-sizing:border-box}.card{display:flex;flex-direction:column;min-width:0;border:1px solid #38403b;border-radius:14px;overflow:hidden;background:#1b211e}
    :host([data-noog-tile]) .card{height:100%;border-radius:8px}
    .head{flex:none;padding:14px 16px}.head strong{display:block;font-size:14px;color:#cdf66b}.head span{display:block;font-size:11px;line-height:1.4;color:#a6b2aa;margin-top:4px;overflow-wrap:anywhere}
    .visual{min-height:0}.photo{display:block;width:100%;height:190px;object-fit:cover;object-position:center}
    :host([data-noog-tile]) .visual{flex:1;overflow:hidden}:host([data-noog-tile]) .photo{height:100%}
    .wisdom{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px;padding:26px 24px;text-align:center;background:radial-gradient(ellipse at top,#263025,#1b211e 80%)}
    blockquote{margin:0;max-width:32ch;font:22px/1.45 Georgia,'Times New Roman',serif;color:#e8f0dd;text-wrap:pretty;overflow-wrap:anywhere}
    .credit{display:block;font:10px/1.4 Arial,sans-serif;letter-spacing:.04em;color:#a7b69f}.source{font:10px/1.4 Arial,sans-serif;color:#b9d295;text-decoration:underline}.photo-credit{padding:5px 12px;display:flex;gap:8px;flex-wrap:wrap;background:#1b211e}
    .quiet{padding:24px 18px;text-align:center;color:#d6e2ce;font-size:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;min-height:180px}.quiet-orb{width:70px;height:70px;border:1px solid #abc79a88;border-radius:50%;box-shadow:0 0 0 14px #abc79a12,0 0 0 28px #abc79a08}.tone-dusk{background:linear-gradient(145deg,#3b354f,#202431)}.tone-sand{background:linear-gradient(145deg,#534933,#262921)}.tone-lake{background:linear-gradient(145deg,#254944,#1b282a)}.tone-clay{background:linear-gradient(145deg,#513831,#29231f)}
    .actions{display:flex;flex:none;align-items:center;gap:12px;padding:10px 14px;flex-wrap:wrap}
    button{border:1px solid #424d45;background:#252d27;border-radius:22px;color:#f2f6ef;padding:8px 12px;font:12px/1.2 Arial,sans-serif;cursor:pointer}
    button:focus-visible{outline:2px solid #cdf66b;outline-offset:2px}.secondary{background:none;border:0;padding:6px 0;color:#abb7ad}
    :host([data-noog-short]) .head{padding:8px 10px}:host([data-noog-short]) .head span{display:none}
    :host([data-noog-short]) .wisdom{padding:8px 12px;gap:6px}:host([data-noog-short]) blockquote{font-size:15px;line-height:1.25}
    :host([data-noog-short]) .photo-credit,:host([data-noog-short]) .source,:host([data-noog-short]) .credit,:host([data-noog-short]) .secondary:not(.keep){display:none}:host([data-noog-short]) .actions{padding:5px 8px;gap:4px;flex-wrap:nowrap}
    :host([data-noog-short]) button{padding:5px 6px;font-size:10px}:host([data-noog-short]) .keep{font-size:0}:host([data-noog-short]) .keep::after{content:'Keep';font:10px/1.2 Arial,sans-serif}
    :host([data-noog-short]) .keep[data-failed]::after{content:'Retry'}:host([data-noog-tiny]) .visual{display:none}:host([data-noog-tiny]) .actions{margin-top:auto}
    @container(max-width:320px){.head{padding:10px 12px}.head strong{font-size:12px}.head span{font-size:10px}.wisdom{padding:14px 14px;gap:10px}blockquote{font-size:18px;line-height:1.35}.actions{padding:8px 10px;gap:6px}.secondary{font-size:10px}}
    :host([data-noog-tiny]) .card{display:grid;grid-template-rows:minmax(0,1fr) 26px}
    :host([data-noog-tiny]) .head{padding:6px 8px;min-height:0;overflow:hidden}:host([data-noog-tiny]) .head strong{font:10px/1.2 Arial,sans-serif;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
    :host([data-noog-tiny]) .actions{height:26px;min-height:0;margin:0;padding:2px 6px;gap:3px;overflow:hidden}:host([data-noog-tiny]) button{font-size:10px;line-height:1.1;padding:4px 3px;min-height:0}:host([data-noog-tiny]) .keep{font-size:0}
  `),
    g.append(u));
  let w = h("section", null, "card"),
    _ = h("div", null, "head");
  (_.append(
    h("strong", "Swapped by NOOG"),
    h(
      "span",
      i.action === "unknown"
        ? "Unchecked media \xB7 strict cover enabled"
        : "Matched: " + i.category,
    ),
  ),
    w.append(_));
  let y = () => {
    let n = h(
      "a",
      t.license ?? (t.type === "quote" ? "Source \u2197" : "Reading \u2197"),
      "source",
    );
    return (
      (n.href = t.source),
      (n.target = "_blank"),
      (n.rel = "noopener noreferrer"),
      (n.referrerPolicy = "no-referrer"),
      n
    );
  };
  if (t.image) {
    let n = h("div", null, "visual"),
      p = h("img", null, "photo");
    if (
      ((p.src = s(t.image)),
      (p.alt = t.alt),
      (p.loading = "lazy"),
      (p.decoding = "async"),
      n.append(p),
      w.append(n),
      t.source)
    ) {
      let k = h("div", null, "photo-credit");
      (k.append(h("span", t.credit, "credit"), y()), w.append(k));
    }
  } else if (t.kind === "wisdom") {
    let n = h("div", null, "visual wisdom");
    (n.append(
      h(
        "span",
        t.type === "quote"
          ? "Sourced excerpt"
          : "NOOG \xB7 original reflection",
        "credit",
      ),
      h("blockquote", t.text),
      h("span", t.credit, "credit"),
    ),
      t.source && n.append(y()),
      w.append(n));
  } else {
    let n = h("div", null, "visual quiet tone-" + t.theme);
    (n.append(h("span", null, "quiet-orb"), h("span", t.text)), w.append(n));
  }
  let v = h("div", null, "actions"),
    E = h("button", "Show once"),
    S = h("button", "This creator is fine", "secondary");
  E.type = S.type = "button";
  let F = (n) => (p) => {
    (p.preventDefault(), p.stopPropagation(), n());
  };
  if (
    (E.addEventListener("click", F(a)),
    S.addEventListener(
      "click",
      F(async () => {
        try {
          await d();
        } catch {
          S.textContent = "Could not save \u2014 try again";
        }
      }),
    ),
    (S.hidden = !m),
    v.append(E, S),
    l)
  ) {
    let n = h("button", "Keep this post", "secondary keep");
    ((n.type = "button"),
      (n.title = "Keep this post visible on this device"),
      n.addEventListener(
        "click",
        F(async () => {
          try {
            await l();
          } catch {
            (n.setAttribute("data-failed", ""),
              (n.textContent = "Could not save \u2014 try again"),
              (n.title = "Could not save. Try again."));
          }
        }),
      ),
      v.append(n));
  }
  return (w.append(v), g.append(w), C);
}
function createMediaCover(e) {
  let t = new Map(),
    i = (a) => e.defaultView.getComputedStyle(a);
  function s(a, d) {
    let l = a.parentElement;
    for (; l && i(l).display === "contents"; ) l = l.parentElement;
    if (!l) return () => {};
    if (["absolute", "fixed"].includes(i(a).position))
      for (
        ;
        l.parentElement &&
        i(l).position === "static" &&
        i(l).transform === "none";
      )
        l = l.parentElement;
    let m = t.get(l);
    (m ||
      ((m = {
        count: 0,
        changed: i(l).position === "static",
        value: l.style.getPropertyValue("position"),
        priority: l.style.getPropertyPriority("position"),
      }),
      t.set(l, m),
      m.changed && l.style.setProperty("position", "relative")),
      m.count++);
    let h = {
      value: a.style.getPropertyValue("visibility"),
      priority: a.style.getPropertyPriority("visibility"),
    };
    (d.setAttribute("data-noog-tile", ""),
      a.after(d),
      a.style.setProperty("visibility", "hidden", "important"));
    let C = () => {
        if (!a.isConnected || !d.isConnected) return;
        let _ = a.getBoundingClientRect(),
          y = l.getBoundingClientRect(),
          v = l.offsetWidth ? y.width / l.offsetWidth : 1,
          E = l.offsetHeight ? y.height / l.offsetHeight : 1,
          S = _.width / (v || 1),
          F = _.height / (E || 1),
          n = {
            left: (_.left - y.left) / (v || 1) - l.clientLeft + l.scrollLeft,
            top: (_.top - y.top) / (E || 1) - l.clientTop + l.scrollTop,
            width: S,
            height: F,
          };
        for (let [p, k] of Object.entries(n)) {
          let f =
            Math.max(p === "width" || p === "height" ? 0 : -1 / 0, k) + "px";
          d.style.getPropertyValue(p) !== f &&
            d.style.setProperty(p, f, "important");
        }
        (d.toggleAttribute("data-noog-short", F < 230),
          d.toggleAttribute("data-noog-tiny", F < 120));
      },
      g,
      u = () => {
        g ||
          (g = e.defaultView.requestAnimationFrame(() => {
            ((g = null), C());
          }));
      },
      w = new ResizeObserver(u);
    return (
      w.observe(a),
      w.observe(l),
      e.defaultView.addEventListener("resize", u),
      e.addEventListener("scroll", u, !0),
      C(),
      () => {
        (w.disconnect(),
          e.defaultView.cancelAnimationFrame(g),
          e.defaultView.removeEventListener("resize", u),
          e.removeEventListener("scroll", u, !0),
          h.value
            ? a.style.setProperty("visibility", h.value, h.priority)
            : a.style.removeProperty("visibility"),
          m.count--,
          m.count ||
            (m.changed &&
              (m.value
                ? l.style.setProperty("position", m.value, m.priority)
                : l.style.removeProperty("position")),
            t.delete(l)));
      }
    );
  }
  return {
    mount: s,
  };
}
var textEncoder = new TextEncoder();
async function fingerprintHash(fingerprint) {
  return [...sha256(textEncoder.encode(fingerprint))]
    .map((t) => t.toString(16).padStart(2, "0"))
    .join("");
}
var normalizeExceptions = (e) =>
  [
    ...new Set(
      (Array.isArray(e) ? e : []).filter(
        (t) => typeof t == "string" && /^[a-f0-9]{64}$/.test(t),
      ),
    ),
  ].slice(-200);
function correctionFingerprint(fingerprint) {
  try {
    let t = JSON.parse(fingerprint);
    return ((t[0] = new URL(t[0]).hostname), JSON.stringify(t));
  } catch {
    return fingerprint;
  }
}
function pauseVideos(e) {
  let t = [];
  for (let i of e)
    !i.paused &&
      !i.ended &&
      (t.push({
        video: i,
        source: i.currentSrc || i.src || "",
        stream: i.srcObject,
      }),
      i.pause());
  return t;
}
function resumeVideos(e) {
  for (let { video: t, source: i, stream: s } of e ?? [])
    if (
      !(
        !t.isConnected ||
        !t.paused ||
        t.ended ||
        (t.currentSrc || t.src || "") !== i ||
        t.srcObject !== s
      )
    )
      try {
        t.play()?.catch(() => {});
      } catch {}
}
async function startContent({
  document: pageDocument = document,
  storage = chrome.storage,
  runtime = chrome.runtime,
  asset = (a) => chrome.runtime.getURL(a),
} = {}) {
  let settings = normalizeSettings(
      (await storage.local.get("settings")).settings,
    ),
    revision = 0,
    settingsRevision = 0,
    exceptionsRevision = 0,
    initialized = false,
    draining = !1,
    stopped = !1,
    exceptions = new Set(
      normalizeExceptions(
        (await storage.local.get("mediaExceptions")).mediaExceptions,
      ),
    );
  pageDocument.body ||
    (await new Promise((r) =>
      pageDocument.addEventListener("DOMContentLoaded", r, {
        once: !0,
      }),
    ));
  let siteCoverDismissed = !1,
    pageUrl = () =>
      pageDocument.location?.href ?? pageDocument.location?.hostname,
    policy = () => sitePolicy(pageUrl(), settings),
    isFeed = () => isPublicFeed(pageUrl()),
    siteCover = createSiteCover(pageDocument, asset, () => {
      ((siteCoverDismissed = !0), scan());
    }),
    posts = new Map(),
    pendingPosts = new Set(),
    settingsSignature = () => JSON.stringify(settings),
    adapter = createAdapter(pageDocument),
    readPost = adapter.read,
    coverOwners = new Map(),
    mediaCover = createMediaCover(pageDocument),
    unshield = (r) => {
      for (let { node: c, value: o, priority: b } of r.shielded ?? [])
        o
          ? c.style.setProperty("visibility", o, b)
          : c.style.removeProperty("visibility");
      r.shielded = [];
    },
    shield = (r, c) => {
      c.shielded = adapter.mediaNodes(r).map((o) => ({
        node: o,
        value: o.style.getPropertyValue("visibility"),
        priority: o.style.getPropertyPriority("visibility"),
      }));
      for (let { node: o } of c.shielded)
        o.style.setProperty("visibility", "hidden", "important");
    },
    resume = (r) => {
      let c = r.resume;
      ((r.resume = []), resumeVideos(c));
    },
    restore = (r, { resume: c = !0 } = {}) => {
      (unshield(r), c ? resume(r) : (r.resume = []));
      for (let o of r.overlays ?? [])
        (intersectionObserver.unobserve(o), coverOwners.delete(o), o.remove());
      ((r.overlays = []), (r.overlay = null), (r.coveredVideos = new Set()));
      for (let o of r.restoreFootprints ?? []) o();
      if (((r.restoreFootprints = []), r.hidden)) {
        let { node: o, value: b, priority: R } = r.hidden;
        (b
          ? o.style.setProperty("display", b, R)
          : o.style.removeProperty("display"),
          (r.hidden = null));
      }
    },
    cover = (r, c, o) => {
      let b = o.mediaMatches ? adapter.matchedMedia(r, o.mediaMatches) : [];
      if (o.mediaMatches && !b.length) {
        restore(c);
        return;
      }
      let R = c.resume ?? [];
      restore(c, {
        resume: !1,
      });
      let Y = adapter.videos(r);
      ((c.coveredVideos = new Set(
        o.mediaMatches
          ? Y.filter((L) => b.includes(L) || b.some((T) => T.contains?.(L)))
          : Y,
      )),
        resumeVideos(R.filter((L) => !c.coveredVideos.has(L.video))));
      for (let L of c.coveredVideos) L.pause();
      let Q = () =>
          createPostCover(pageDocument, {
            replacement: chooseReplacement(settings.replacement, c.fingerprint),
            decision: o,
            asset: asset,
            creator: c.post.creator,
            onShow: () => {
              ((c.shown = c.fingerprint), restore(c));
            },
            onAllow: async () => {
              if (c.post.creator) {
                if (
                  !(
                    await runtime.sendMessage({
                      type: "noog:allow-creator",
                      creator: c.post.creator,
                    })
                  )?.ok
                )
                  throw new Error("Save failed");
              }
            },
            onKeep: async () => {
              let L = c.fingerprint,
                T = await fingerprintHash(correctionFingerprint(L));
              if (
                !(
                  await runtime.sendMessage({
                    type: "noog:allow-media",
                    hash: T,
                  })
                )?.ok
              )
                throw Error("Save failed");
              c.fingerprint === L && ((c.shown = L), restore(c));
            },
          }),
        N =
          r.matches("img,video,canvas") ||
          (!r.matches(
            'article,[role="article"],figure,shreddit-post,[data-testid="post-container"],.thing.link,ytd-rich-item-renderer,ytd-video-renderer,ytd-grid-video-renderer,ytd-reel-video-renderer,ytd-shorts-video-renderer',
          ) &&
            adapter.mediaNodes(r).includes(r));
      for (let L of b.length ? b : [r]) {
        let T = Q();
        (o.mediaMatches || N
          ? c.restoreFootprints.push(mediaCover.mount(L, T))
          : ((c.hidden = {
              node: r,
              value: r.style.getPropertyValue("display"),
              priority: r.style.getPropertyPriority("display"),
            }),
            r.after(T),
            r.style.setProperty("display", "none", "important")),
          c.overlays.push(T),
          coverOwners.set(T, r),
          c.hidden && intersectionObserver.observe(T));
      }
      c.overlay = c.overlays[0] ?? null;
    },
    drain = () => {
      draining || ((draining = !0), $());
    },
    enqueue = (r) => {
      !stopped &&
        posts.has(r) &&
        r.isConnected &&
        pendingPosts.size < 12 &&
        (pendingPosts.add(r), drain());
    };
  async function $() {
    let r = Date.now();
    for (; pendingPosts.size; ) {
      Date.now() - r > 8 &&
        (await new Promise((T) => setTimeout(T, 0)), (r = Date.now()));
      let c = pendingPosts.values().next().value;
      if ((pendingPosts.delete(c), !c.isConnected)) continue;
      let o = posts.get(c);
      if (!o?.visible) continue;
      let b = readPost(c),
        R = b.fingerprint;
      if (b.excluded) {
        restore(o);
        pendingPosts.delete(c);
        continue;
      }
      (o.fingerprint !== R &&
        (restore(o, {
          resume: !1,
        }),
        clearTimeout(o.retryTimer),
        (o.retryTimer = null),
        (o.retries = 0),
        (o.shown = null),
        (o.fingerprint = R),
        (o.done = null),
        (o.lastVideoCheck = 0)),
        (o.post = b));
      let Y = revision,
        Q = o.mediaRevision ?? 0,
        N = settingsSignature();
      if (o.shown === R || o.done === N) continue;
      if (exceptions.size) {
        let T = await fingerprintHash(correctionFingerprint(R));
        if (stopped || Y !== revision || readPost(c).fingerprint !== R) {
          enqueue(c);
          continue;
        }
        if (exceptions.has(T)) {
          (restore(o),
            (o.done = N),
            (o.decision = {
              action: "allow",
              reason: "post_exception",
            }));
          continue;
        }
      }
      if (
        (o.overlay || restore(o),
        !settings.enabled ||
          [
            "paused",
            "site_paused",
            "private_conversation",
            "utility_app",
          ].includes(policy().kind) ||
          siteCover.active())
      ) {
        (restore(o), (o.done = N));
        continue;
      }
      let L = captionDecision(b, settings);
      if (
        (L.action === "continue" &&
          b.hasVideo &&
          settings.videoMode === "cover" &&
          (L = {
            action: "replace",
            reason: "video_cover_setting",
            category: "Videos \xB7 your cover setting",
          }),
        L.action === "continue")
      )
        if (!settings.sexual)
          L = {
            action: "allow",
            reason: "text_rules_no_match",
          };
        else {
          let T = adapter.videos(c),
            de = [],
            ve = !1;
          if (settings.sexual && settings.videoMode === "sample")
            for (let $e of T.slice(0, 2)) {
              let me = sampleVideoFrame($e, pageDocument);
              me.ok
                ? de.push(me.frame)
                : me.reason === "video_not_ready" && (ve = !0);
            }
          let Je = !!o.lastVideoCheck;
          isFeed() &&
            settings.sexual &&
            settings.shieldWhileChecking &&
            !Je &&
            (b.images.length || b.hasVideo || b.uninspectedMedia) &&
            (shield(c, o), (o.resume = pauseVideos(T)));
          try {
            L = await runtime.sendMessage({
              type: "noog:analyse",
              ...b,
              frames: de,
              videoCount: T.length,
              videoPending: ve,
            });
          } catch {
            L = {
              action: "unknown",
              reason: "extension_unavailable",
            };
          }
          Y === revision &&
            Q === (o.mediaRevision ?? 0) &&
            (o.lastVideoCheck = Date.now());
        }
      if (
        stopped ||
        posts.get(c) !== o ||
        !c.isConnected ||
        Y !== revision ||
        Q !== (o.mediaRevision ?? 0) ||
        !o.visible ||
        readPost(c).fingerprint !== R
      ) {
        (unshield(o), resume(o), enqueue(c));
        continue;
      }
      (unshield(o),
        (o.decision = L),
        L?.action === "replace" ||
        (L?.action === "unknown" && settings.holdUncertain && isFeed())
          ? cover(c, o, L)
          : (restore(o), resume(o)),
        (o.done = N),
        L?.retryable &&
          (L.reason === "image_queue_full" || (o.retries ?? 0) < 2) &&
          ((o.retries = (o.retries ?? 0) + 1),
          (o.retryTimer = setTimeout(
            () => {
              ((o.retryTimer = null),
                !stopped &&
                  Y === revision &&
                  o.fingerprint === R &&
                  o.shown !== R &&
                  ((o.done = null), enqueue(c)));
            },
            Math.min(5000, 1000 * 2 ** Math.min(o.retries - 1, 3)),
          ))));
    }
    draining = !1;
    for (let [c, o] of posts) {
      if (pendingPosts.size >= 12) break;
      !stopped &&
        c.isConnected &&
        o.visible &&
        !o.retryTimer &&
        o.done !== settingsSignature() &&
        o.shown !== o.fingerprint &&
        pendingPosts.add(c);
    }
    pendingPosts.size && !stopped && setTimeout(drain, 0);
  }
  let intersectionObserver = new IntersectionObserver(
    (r) => {
      for (let c of r) {
        let o = coverOwners.get(c.target) ?? c.target,
          b = posts.get(o);
        (b?.hidden && c.target === o) ||
          (b &&
            ((b.visible = c.isIntersecting),
            b.visible ? enqueue(o) : pendingPosts.delete(o)));
      }
    },
    {
      rootMargin: "100px 0px",
    },
  );
  function scan() {
    if (!initialized) return;
    let r = policy();
    if (r.kind === "blocked" && !siteCoverDismissed) {
      siteCover.show();
      return;
    }
    siteCover.clear();
    for (let [c, o] of posts)
      (!c.isConnected ||
        !adapter.eligible(c) ||
        [
          "paused",
          "site_paused",
          "private_conversation",
          "utility_app",
        ].includes(r.kind)) &&
        (restore(o),
        clearTimeout(o.retryTimer),
        intersectionObserver.unobserve(c),
        posts.delete(c),
        pendingPosts.delete(c));
    if (
      ![
        "paused",
        "site_paused",
        "private_conversation",
        "utility_app",
      ].includes(r.kind)
    )
      for (let c of adapter.candidates())
        posts.has(c)
          ? enqueue(c)
          : (posts.set(c, {
              visible: !1,
              fingerprint: null,
              overlay: null,
              hidden: null,
            }),
            intersectionObserver.observe(c));
  }
  let scanTimer,
    lastUrl = pageDocument.location?.href,
    routeTimer = setInterval(() => {
      if (lastUrl !== pageDocument.location?.href) {
        lastUrl = pageDocument.location?.href;
        for (let r of posts.values()) ((r.done = null), (r.shown = null));
        scan();
      }
    }, 1e3),
    mutationObserver = new MutationObserver((r) => {
      r.every((c) => c.target?.closest?.("[data-noog-owned]")) ||
        scanTimer ||
        (scanTimer = setTimeout(() => {
          ((scanTimer = null), scan());
        }, 250));
    }),
    videoTimer = setInterval(() => {
      if (
        !(
          !settings.enabled ||
          !settings.sexual ||
          settings.videoMode !== "sample"
        )
      )
        for (let [r, c] of posts)
          c.visible &&
            !c.hidden &&
            c.shown !== c.fingerprint &&
            Date.now() - (c.lastVideoCheck ?? 0) >= 3e3 &&
            adapter
              .videos(r)
              .some((o) => !c.coveredVideos?.has(o) && !o.paused && !o.ended) &&
            ((c.done = null), enqueue(r));
    }, 1e3),
    videoEvent = (r) => {
      if (r.target?.matches?.("video")) {
        for (let [c, o] of posts)
          if (c === r.target || c.contains(r.target)) {
            if (o.coveredVideos?.has(r.target) && r.type === "play") {
              r.target.pause();
              return;
            }
            (r.type !== "play" ||
              Date.now() - (o.lastVideoCheck ?? 0) >= 3e3) &&
              (r.type !== "play" &&
                (o.mediaRevision = (o.mediaRevision ?? 0) + 1),
              clearTimeout(o.retryTimer),
              (o.retryTimer = null),
              (o.retries = 0),
              (o.done = null),
              enqueue(c));
          }
      }
    };
  for (let r of ["loadeddata", "play", "seeked"])
    pageDocument.addEventListener(r, videoEvent, !0);
  let mediaLoaded = (r) => {
    r.target?.matches?.("img,video") &&
      !r.target.closest("[data-noog-owned]") &&
      (scanTimer ||
        (scanTimer = setTimeout(() => {
          ((scanTimer = null), scan());
        }, 250)));
  };
  (pageDocument.addEventListener("load", mediaLoaded, !0),
    mutationObserver.observe(pageDocument.body, {
      subtree: !0,
      childList: !0,
      characterData: !0,
      attributes: !0,
      attributeFilter: [
        "src",
        "contenteditable",
        "role",
        "data-testid",
        "href",
        "srcset",
        "sizes",
        "poster",
        "alt",
        "aria-label",
        "post-title",
        "author",
        "style",
        "class",
      ],
    }));
  let storageChanged = (r, c) => {
      if (!stopped && c === "local" && (r.settings || r.mediaExceptions)) {
        (r.settings &&
          (settingsRevision++,
          (settings = normalizeSettings(r.settings.newValue))),
          r.mediaExceptions &&
            (exceptionsRevision++,
            (exceptions = new Set(
              normalizeExceptions(r.mediaExceptions.newValue),
            ))),
          revision++);
        for (let [o, b] of posts)
          (restore(b),
            clearTimeout(b.retryTimer),
            (b.retryTimer = null),
            (b.retries = 0),
            (b.done = null),
            (b.decision = null),
            (b.shown = null),
            (b.lastVideoCheck = 0));
        scan();
        for (let o of posts.keys()) enqueue(o);
      }
    },
    statusMessage = (r, c, o) => {
      if (
        !stopped &&
        r?.type === "noog:context-check" &&
        c?.id === runtime.id
      ) {
        o({
          url: pageUrl(),
          allowed: initialized && policy().kind === "active",
        });
        return;
      }

      if (!stopped && r?.type === "noog:page-status" && c?.id === runtime.id) {
        let b = [...posts].filter(([R]) => R.isConnected);
        o({
          version: 1,
          adapter: adapter.name,
          enabled:
            settings.enabled &&
            !["site_paused", "private_conversation", "utility_app"].includes(
              policy().kind,
            ),
          privatePage: policy().kind === "private_conversation",
          utilityPage: policy().kind === "utility_app",
          sitePaused: policy().kind === "site_paused",
          siteBlocked: siteCover.active(),
          cards: b.length,
          swaps: b.filter(([, R]) => !!R.overlay).length,
          unchecked: b.filter(([, R]) => R.decision?.action === "unknown")
            .length,
        });
      }
    };
  runtime.onMessage?.addListener(statusMessage);
  storage.onChanged.addListener(storageChanged);
  const observedSettingsRevision = settingsRevision,
    observedExceptionsRevision = exceptionsRevision;
  const initial = await storage.local.get(["settings", "mediaExceptions"]);
  if (settingsRevision === observedSettingsRevision)
    settings = normalizeSettings(initial.settings);
  if (exceptionsRevision === observedExceptionsRevision)
    exceptions = new Set(normalizeExceptions(initial.mediaExceptions));
  initialized = true;
  scan();
  let controller = {
    stop() {
      ((stopped = !0),
        revision++,
        siteCover.stop(),
        mutationObserver.disconnect(),
        pageDocument.removeEventListener("load", mediaLoaded, !0),
        intersectionObserver.disconnect(),
        runtime.onMessage?.removeListener(statusMessage),
        storage.onChanged.removeListener?.(storageChanged),
        clearTimeout(scanTimer),
        clearInterval(routeTimer),
        clearInterval(videoTimer));
      for (let r of ["loadeddata", "play", "seeked"])
        pageDocument.removeEventListener(r, videoEvent, !0);
      for (let r of posts.values()) (clearTimeout(r.retryTimer), restore(r));
      (posts.clear(),
        pendingPosts.clear(),
        (globalThis.__noogController = null));
    },
  };
  return controller;
}
typeof chrome < "u" &&
  chrome.runtime?.id &&
  typeof document < "u" &&
  !globalThis.__noogController &&
  (globalThis.__noogController = startContent());
export { createAdapter, sampleVideoFrame, startContent };
