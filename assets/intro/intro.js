/*
  Pom Tales intro: scroll choreography.
  One pinned stage is driven by a single scrubbed GSAP timeline. Its length is measured in
  "screens": 1 unit of timeline = 1 viewport height of scrolling. The finale newspaper is a
  normal section after it, with its own short zoom-out.
*/
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = function () { return window.innerWidth; };
  var H = function () { return window.innerHeight; };
  var phone = function () { return W() <= 640; };

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------------- art ---------------- */
  document.body.insertAdjacentHTML("afterbegin", PomArt.defs);
  $$("[data-art]").forEach(function (el) {
    var fn = PomArt[el.getAttribute("data-art")];
    if (fn) el.innerHTML = fn();
  });

  // crib-mobile baskets (pup peeks out of each)
  var BASKETS = [
    { pup: "taz", body: "#a9dcbf", rim: "#7cc4a2" },
    { pup: "skye", body: "#f6c1cf", rim: "#ef97ae" },
    { pup: "ninja", body: "#b6d9f1", rim: "#86bde3" },
    { pup: "wookie", body: "#fde29c", rim: "#f4c25f" },
    { pup: "zivi", body: "#d3c1f0", rim: "#b29ae2" }
  ];
  var basketWrap = $(".baskets");
  basketWrap.innerHTML = BASKETS.map(function (b) {
    return '<div class="basket"><div class="cord"></div><div class="box">' +
      '<div class="peek"><img src="assets/intro/pups/' + b.pup + '.webp" alt=""></div>' +
      PomArt.basketFront(b.body, b.rim) + "</div></div>";
  }).join("");
  var baskets = $$(".basket");

  // clouds for the ascent
  var CLOUDS = [
    { x: -12, w: 70, d: 0.00, s: 1.00 }, { x: 46, w: 76, d: 0.04, s: 1.10 }, { x: 14, w: 64, d: 0.10, s: 0.95 },
    { x: -20, w: 88, d: 0.16, s: 1.20 }, { x: 40, w: 90, d: 0.20, s: 1.15 }, { x: 6, w: 96, d: 0.26, s: 1.25 },
    { x: 60, w: 60, d: 0.30, s: 1.05 }, { x: -24, w: 70, d: 0.34, s: 1.10 }
  ];
  var cloudsLayer = $("#clouds");
  cloudsLayer.innerHTML = CLOUDS.map(function (c) {
    return '<div class="cloud" style="left:' + c.x + "vw;width:" + c.w + 'vw">' + PomArt.cloud() + "</div>";
  }).join("");
  var cloudEls = $$(".cloud", cloudsLayer);

  // stitched stars in the night sky
  (function () {
    var svg = $("#stars"), out = "", rnd = mulberry(7);
    for (var i = 0; i < 70; i++) {
      var x = (rnd() * 100).toFixed(2), y = (rnd() * 100).toFixed(2), r = (2 + rnd() * 4).toFixed(1);
      var big = rnd() > 0.86;
      out += '<g class="st" style="animation-delay:' + (rnd() * 3).toFixed(2) + 's"><svg x="' + x + '%" y="' + y + '%" overflow="visible">' +
        (big
          ? '<path d="M0-' + r * 2.4 + "V" + r * 2.4 + "M-" + r * 2.4 + " 0H" + r * 2.4 + '" stroke="#fff6dc" stroke-width="1.6" stroke-linecap="round"/><circle r="' + r * 0.6 + '" fill="#fff6dc"/>'
          : '<path d="M-' + r + "-" + r + "L" + r + " " + r + "M-" + r + " " + r + "L" + r + "-" + r + '" stroke="#e9ddff" stroke-opacity=".8" stroke-width="1.4" stroke-linecap="round"/>') +
        "</svg></g>";
    }
    svg.innerHTML = out;
    svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%");
  })();
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // split the front-page columns into words so they can fade one by one
  $$(".split").forEach(function (p) {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
  });

  /* ---------------- smooth scroll ---------------- */
  var smoother = reduce ? null : ScrollSmoother.create({
    wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.15, smoothTouch: false, effects: false
  });
  if (smoother) smoother.paused(true);

  /* ---------------- helpers ---------------- */
  var stage = $(".stage");
  var news = $(".s-news .news"), photo = $(".s-news .photo");
  var hoop = $(".hoop"), fabC = $("#fabClipC");
  var hoopPups = $$(".hoop-pups .pup");
  var heart = $(".heart");
  var mobile = $(".s-mobile .mobile"), ring = $(".mobile .ring"), ringSvg = $("#ringSvg");
  var snaps = $(".snaps"), snapEls = $$(".snap");
  var bigBalloon = $(".balloon-big"), sky = $(".sky"), night = $(".night");
  var planet = $(".planet"), smallBalloon = $(".balloon-small");
  var tvScene = $(".s-tv"), tvbox = $(".tvbox"), tvPaper = $(".tvpaper"), screenImgs = $$(".tv .screen img"),
      stat = $(".tv .static"), wash = $(".tv .wash"), screen = $(".tv .screen"), meter = $(".meter");
  var homeScene = $(".s-home"), homeBalloon = $(".balloon-home"), hills = $(".hills"), homePups = $$(".home-pups .pup"), sparks = $$(".spark");
  var flash = $(".flash");
  var card = function (k) { return $('.card[data-card="' + k + '"]'); };

  function offsetIn(el, ancestor) { // layout position, ignores transforms
    var x = 0, y = 0;
    while (el && el !== ancestor) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    return { x: x, y: y };
  }
  function hoopCenter() { return { x: hoop.offsetLeft, y: hoop.offsetTop }; } // hoop is centred with -50%/-50%
  function diag(c, keepTopLeft) {
    // c in 0..200 on the x+y diagonal; returns a 5-point polygon
    var p;
    if (keepTopLeft) {
      p = c >= 100 ? [[0, 0], [100, 0], [100, c - 100], [c - 100, 100], [0, 100]] : [[0, 0], [c, 0], [c, 0], [0, c], [0, c]];
    } else {
      p = c >= 100 ? [[100, c - 100], [100, c - 100], [100, 100], [c - 100, 100], [c - 100, 100]] : [[c, 0], [100, 0], [100, 100], [0, 100], [0, c]];
    }
    return "polygon(" + p.map(function (q) { return q[0] + "% " + q[1] + "%"; }).join(",") + ")";
  }
  function card2(tl, key, tin, tout) {
    var el = card(key);
    tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, tin);
    tl.to(el, { autoAlpha: 0, y: -12, duration: 0.12, ease: "power2.in" }, tout);
  }

  // crib-mobile placement
  var mob = { a: 0.35, R: 200 };
  function placeBaskets() {
    var n = baskets.length, ry = mob.R * 0.16;
    baskets.forEach(function (b, i) {
      var t = mob.a + (i / n) * Math.PI * 2, z = Math.cos(t);
      var s = 0.74 + 0.26 * (z + 1) / 2;
      b.style.transform = "translate(" + (Math.sin(t) * mob.R - b.offsetWidth / 2) + "px," + (z * ry) + "px) scale(" + s.toFixed(3) + ")";
      b.style.zIndex = String(Math.round((z + 1) * 10));
      b.style.filter = "brightness(" + (0.86 + 0.14 * (z + 1) / 2).toFixed(3) + ")";
    });
  }
  function sizeMobile() {
    mob.R = Math.min(W() * (phone() ? 0.34 : 0.27), H() * 0.42);
    ringSvg.style.width = mob.R * 2 + "px";
    ringSvg.style.height = mob.R * 0.4 + "px";
    placeBaskets();
  }

  /* ---------------- the master timeline ---------------- */
  var CH = [0, 0.95, 2.45, 3.85, 4.95, 14.15]; // chapter start times (chapter 7 is the finale section)
  var tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });

  // initial states
  gsap.set([".s-hoop", ".s-mobile", ".s-snaps", ".s-balloon", ".s-world", ".s-tv", ".s-home", cloudsLayer], { autoAlpha: 0 });
  gsap.set(hoopPups, { autoAlpha: 0 });
  gsap.set(heart, { autoAlpha: 0 });
  gsap.set(snaps, { yPercent: -50 });
  gsap.set([hoop, tvbox], { xPercent: -50, yPercent: -50 });
  gsap.set([bigBalloon, planet], { xPercent: -50 });
  var finale = $(".finale");

  // 01 → 02: zoom into the photo, then a stitched night sky opens inside it
  tl.fromTo(news, { x: 0, y: 0, scale: 1 }, {
    x: function () { var o = offsetIn(photo, news); return hoopCenter().x - (news.offsetLeft + o.x + photo.offsetWidth / 2); },
    y: function () { var o = offsetIn(photo, news); return hoopCenter().y - (news.offsetTop + o.y + photo.offsetHeight / 2); },
    scale: function () { return Math.max(W() / photo.offsetWidth, H() / photo.offsetHeight) * 1.08; },
    transformOrigin: function () { var o = offsetIn(photo, news); return (o.x + photo.offsetWidth / 2) + "px " + (o.y + photo.offsetHeight / 2) + "px"; },
    duration: 0.9, ease: "power1.inOut"
  }, 0);
  tl.to($$(".s-news .w"), { opacity: 0, duration: 0.18, stagger: { each: 0.0045, from: "random" } }, 0.06);
  tl.set(".s-hoop", { autoAlpha: 1 }, 0.55);
  tl.set(".hoop .ring", { opacity: 0 }, 0.55);
  tl.fromTo(hoop, { scale: 2.3 }, { scale: 2.3, duration: 0.01 }, 0.55);
  tl.fromTo(fabC, { attr: { r: 0 } }, { attr: { r: 262 }, duration: 0.25, ease: "power2.out" }, 0.56);
  tl.to(".hoop .ring", { opacity: 1, duration: 0.1 }, 0.7);
  tl.to(".s-news", { autoAlpha: 0, duration: 0.08 }, 0.74);
  tl.to(hoop, { scale: 1, duration: 0.45, ease: "power2.inOut" }, 0.72);

  // 02 rescued: the five pups gather round the hoop
  card2(tl, "rescued", 0.98, 1.82);
  hoopPups.forEach(function (p, i) {
    tl.fromTo(p, { autoAlpha: 0, y: "18%", scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: "back.out(1.6)" }, 1.08 + i * 0.13);
  });
  card2(tl, "foster", 1.88, 2.42);
  tl.fromTo(heart, { autoAlpha: 0, x: "40%", y: "-60%", rotation: 25 }, { autoAlpha: 1, x: 0, y: 0, rotation: -8, duration: 0.3, ease: "power2.out" }, 1.85);
  // the twins hop into the hoop, the others step aside
  [2, 3].forEach(function (k, j) {
    var p = hoopPups[k];
    tl.to(p, {
      x: function () { return hoopCenter().x - (p.offsetLeft + p.offsetWidth / 2) + (j ? 30 : -30); },
      y: function () { return hoopCenter().y - (p.offsetTop + p.offsetHeight * 0.6); },
      scale: 0.42, duration: 0.32, ease: "power2.inOut"
    }, 2.0 + j * 0.05);
    tl.to(p, { autoAlpha: 0, duration: 0.08 }, 2.28 + j * 0.05);
  });
  [0, 1].forEach(function (k) { tl.to(hoopPups[k], { x: "-=" + 0.25 * 1440, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 2.05); });
  [4].forEach(function (k) { tl.to(hoopPups[k], { x: "+=" + 0.25 * 1440, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 2.05); });
  tl.to(heart, { autoAlpha: 0, x: "60%", y: "-40%", duration: 0.25 }, 2.15);
  tl.to(hoop, { scale: 2.4, rotation: 18, duration: 0.5, ease: "power2.in" }, 2.2);

  // 02 → 03: the hoop peels away on a diagonal, revealing the crib mobile
  tl.set(".hooppaper", { opacity: 1 }, 2.29);
  tl.set(".s-mobile", { autoAlpha: 1 }, 2.3);
  var peel = { c: 200 };
  tl.fromTo(peel, { c: 200 }, { c: 0, duration: 0.5, ease: "power1.in", onUpdate: function () { $(".s-hoop").style.clipPath = diag(peel.c, true); } }, 2.35);
  tl.set(".s-hoop", { autoAlpha: 0 }, 2.86);

  // 03 growing up: the mobile turns
  card2(tl, "growing", 2.5, 3.2);
  card2(tl, "growing2", 3.25, 3.88);
  tl.fromTo(mob, { a: 0.35 }, { a: 0.35 + Math.PI * 2.6, duration: 2.0, onUpdate: placeBaskets }, 2.3);
  tl.fromTo(mobile, { y: 0 }, { y: function () { return -H() * 1.05; }, duration: 0.6, ease: "power2.in" }, 3.75);
  tl.set(".s-mobile", { autoAlpha: 0 }, 4.4);

  // 04 meet the pups: polaroids rise
  tl.set(".s-snaps", { autoAlpha: 1 }, 3.8);
  snapEls.forEach(function (s, i) {
    var rot = [-4, 3, -2, 4, -3][i];
    tl.fromTo(s, { y: function () { return H() * 0.95; }, rotation: rot * 2 }, { y: 0, rotation: rot, duration: 0.55, ease: "power3.out" }, 3.85 + i * 0.07);
  });
  // on phones the row of polaroids pans sideways
  tl.fromTo(snaps, { x: 0 }, { x: function () { return phone() ? -(snaps.scrollWidth - W()) : 0; }, duration: 0.75, ease: "power1.inOut" }, 4.3);

  // 05 into the Pomverse: the knitted balloon rises through the frame
  tl.set(".s-balloon", { autoAlpha: 1 }, 4.9);
  tl.fromTo(bigBalloon, { y: function () { return H(); } }, { y: function () { return -bigBalloon.offsetHeight - H() * 0.05; }, duration: 1.55 }, 4.95);
  tl.to(sky, { opacity: 1, duration: 0.7 }, 5.05);
  snapEls.forEach(function (s, i) {
    var dir = i - 2 || (i < 2 ? -1 : 1);
    tl.to(s, { x: function () { return dir * W() * 0.22; }, y: function () { return -H() * (0.35 + Math.abs(dir) * 0.08); }, rotation: dir * 16, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 5.12 + Math.abs(i - 2) * 0.03);
  });
  tl.set(".s-snaps", { autoAlpha: 0 }, 5.7);
  card2(tl, "voyage", 5.05, 5.85);
  card2(tl, "voyage2", 5.9, 6.55);

  // cotton clouds rush past, the sky turns to night
  tl.set(cloudsLayer, { autoAlpha: 1 }, 5.95);
  cloudEls.forEach(function (c, i) {
    var cfg = CLOUDS[i];
    tl.fromTo(c, { y: function () { return H() * 1.05; }, scale: cfg.s }, { y: function () { return -H() * 1.2 - c.offsetHeight; }, duration: 1.2, ease: "power1.inOut" }, 5.95 + cfg.d);
  });
  tl.to(night, { opacity: 1, duration: 0.25 }, 6.32);
  tl.set(".s-balloon", { autoAlpha: 0 }, 6.55);
  tl.set(sky, { opacity: 0 }, 6.6);
  tl.set(cloudsLayer, { autoAlpha: 0 }, 7.6);

  // 05 over the Pomverse: the planet turns as you scroll
  tl.set(".s-world", { autoAlpha: 1 }, 6.3);
  tl.fromTo(planet, { y: function () { return H() * 0.45; } }, { y: 0, duration: 1.0, ease: "power2.out" }, 6.45);
  tl.fromTo(planet, { backgroundPosition: "0px 50%" }, { backgroundPosition: function () { return -planet.offsetHeight * (1380 / 661) * 2.2 + "px 50%"; }, duration: 5.2 }, 6.45);
  tl.fromTo(smallBalloon, { x: function () { return -W() * 0.4; }, y: function () { return H() * 0.6; }, rotation: 16, scale: 0.7 },
    { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.0, ease: "power2.out" }, 6.55);
  card2(tl, "stat1", 7.25, 8.65);
  card2(tl, "stat2", 8.75, 10.15);

  // 05 → the felt TV wipes in on a diagonal
  tl.set(".s-tv", { autoAlpha: 1 }, 10.6);
  var wipe = { c: 200 };
  tl.fromTo(wipe, { c: 200 }, { c: 0, duration: 1.1, ease: "power1.inOut", onUpdate: function () { tvScene.style.clipPath = diag(wipe.c, false); } }, 10.65);
  tl.to(smallBalloon, { x: function () { return W() * 0.7; }, y: function () { return -H() * 0.2; }, rotation: -8, duration: 0.9, ease: "power1.in" }, 10.5);
  tl.set([".s-world", night], { autoAlpha: 0 }, 11.8);
  tl.set(tvPaper, { autoAlpha: 0 }, 11.8);
  tl.set(tvScene, { clipPath: "none" }, 11.8);
  card2(tl, "tv", 10.95, 13.35);
  tl.fromTo(meter, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, 11.9);
  tl.to(meter, { autoAlpha: 0, duration: 0.15 }, 13.7);
  // channel flips
  [[12.45, 1], [13.15, 2]].forEach(function (c) {
    tl.fromTo(stat, { opacity: 0.95 }, { opacity: 0, duration: 0.14 }, c[0]);
    tl.set(screenImgs, { opacity: 0 }, c[0]);
    tl.set(screenImgs[c[1]], { opacity: 1 }, c[0]);
  });

  // zoom right through the TV screen
  tl.to(tvbox, {
    x: function () { return tvbox.offsetWidth * 0.1; },
    y: function () { return H() * 0.5 - (tvbox.offsetTop - tvbox.offsetHeight / 2 + tvbox.offsetHeight * 0.578); },
    scale: function () { return Math.max(W() / (tvbox.offsetWidth * 0.6), H() / (tvbox.offsetHeight * 0.578)) * 1.35; },
    transformOrigin: "40% 57.8%", duration: 1.15, ease: "power2.in"
  }, 13.8);
  tl.to(wash, { opacity: 1, duration: 0.22 }, 13.85);
  tl.set(".s-home", { autoAlpha: 1 }, 14.08);
  tl.set(screen, { autoAlpha: 0 }, 14.1);
  tl.set(".s-tv", { autoAlpha: 0 }, 14.98);

  // 06 home at last: the balloon lands on Cuddle Hill, the pups bound in
  tl.fromTo(homeBalloon, { x: function () { return -W() * 0.08; }, y: function () { return -H() * 0.85; }, rotation: -10 },
    { x: 0, y: function () { return W() > 640 ? H() * 0.7 - (homeBalloon.offsetTop + homeBalloon.offsetHeight) : H() * 0.08; }, rotation: 4, duration: 1.3, ease: "power1.out" }, 14.15);
  tl.to(homeBalloon, { rotation: 0, duration: 0.3, ease: "sine.inOut" }, 15.45);
  tl.fromTo(hills, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power2.out" }, 14.75);
  card2(tl, "home", 14.3, 15.85);
  card2(tl, "home2", 15.9, 16.8);
  homePups.forEach(function (p, i) {
    var t = 15.2 + i * 0.12;
    tl.fromTo(p, { x: function () { return W() * 0.7; }, autoAlpha: 1 }, { x: 0, duration: 0.75, ease: "power2.out" }, t);
    tl.fromTo(p, { y: 0 }, { keyframes: [{ y: -H() * 0.06, duration: 0.14, ease: "power1.out" }, { y: 0, duration: 0.14, ease: "power1.in" }, { y: -H() * 0.035, duration: 0.11, ease: "power1.out" }, { y: 0, duration: 0.11, ease: "power1.in" }] }, t + 0.05);
  });
  sparks.forEach(function (s, i) {
    var t = 16.05 + i * 0.12;
    tl.fromTo(s, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.15, ease: "back.out(2)" }, t);
    tl.to(s, { scale: 0, rotation: 30, duration: 0.15, ease: "power2.in" }, t + 0.32);
  });
  // whiteout into the finale
  tl.fromTo(homeScene, { filter: "brightness(1) saturate(1) blur(0px)" }, { filter: "brightness(1.5) saturate(0.5) blur(3px)", duration: 0.6 }, 16.8);
  tl.to(flash, { opacity: 1, duration: 0.55 }, 17.0);
  tl.to({}, { duration: 0.25 }, 17.55); // hold on white

  var TOTAL = tl.duration();

  var storyST = ScrollTrigger.create({
    trigger: ".story", start: "top top",
    end: function () { return "+=" + Math.round(TOTAL * H()); },
    pin: ".stage", scrub: reduce ? true : 0.6, animation: tl, invalidateOnRefresh: true,
    onRefresh: sizeMobile,
    onLeave: function () { finale.style.visibility = "visible"; },
    onEnterBack: function () { finale.style.visibility = "hidden"; }
  });

  /* ---------------- finale: zoom out of the second front page ---------------- */
  var fNews = $(".finale .news"), fPhoto = $(".finale .photo");
  var ftl = gsap.timeline({ defaults: { ease: "none" } });
  ftl.fromTo(".finale .whiteout", { opacity: 1 }, { opacity: 0, duration: 0.35 }, 0);
  ftl.fromTo(fNews, {
    scale: 2.6,
    transformOrigin: function () { var o = offsetIn(fPhoto, fNews); return (o.x + fPhoto.offsetWidth / 2) + "px " + (o.y + fPhoto.offsetHeight / 2) + "px"; }
  }, { scale: 1, duration: 1, ease: "power2.out" }, 0);
  var finaleST = ScrollTrigger.create({
    trigger: ".finale", start: "top top", end: function () { return "+=" + Math.round(H() * 1.1); },
    pin: true, scrub: reduce ? true : 0.6, animation: ftl, invalidateOnRefresh: true
  });

  /* ---------------- chrome: chapters, trail, yarn ball, dark mode ---------------- */
  var tocItems = $$(".toc li"), curCh = -1;
  function setChapter(i) {
    if (i === curCh) return; curCh = i;
    tocItems.forEach(function (li, k) { li.classList.toggle("is-on", k === i); });
  }
  var walked = $(".trail .walked"), trailPath = $(".trail .path"), paws = $(".trail .paws"), trailSvg = $(".trail svg");
  var trailLen = trailPath.getTotalLength();
  walked.style.strokeDasharray = "3 5";
  function setTrail(p) {
    var pt = trailPath.getPointAtLength(p * trailLen), pt2 = trailPath.getPointAtLength(Math.min(trailLen, p * trailLen + 2));
    var box = trailSvg.getBoundingClientRect(), sx = box.width / 90, sy = box.height / 600;
    var ang = Math.atan2((pt2.y - pt.y) * sy, (pt2.x - pt.x) * sx) * 180 / Math.PI + 90;
    paws.style.transform = "translate(" + (pt.x * sx - 11) + "px," + (pt.y * sy - 11) + "px) rotate(" + ang + "deg)";
    walked.style.clipPath = "inset(0 0 " + ((1 - p) * 100).toFixed(2) + "% 0)";
  }
  var yarnSpin = $(".yarn-spin");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      var p = self.progress;
      setTrail(p);
      yarnSpin.style.transform = "rotate(" + (p * 1440).toFixed(1) + "deg)";
      // chapter + dark chrome
      var t = tl.time(), ch = 0;
      for (var i = 0; i < CH.length; i++) if (t >= CH[i] - 0.001) ch = i;
      if (finaleST.progress > 0 || self.scroll() >= finaleST.start - 2) ch = 6;
      setChapter(ch);
      document.body.classList.toggle("is-dark", t > 6.35 && t < 11.3 && ch < 6);
    }
  });
  setTrail(0);

  function scrollToY(y) { if (smoother) smoother.scrollTo(y, true); else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); }
  $$(".toc a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var i = +a.getAttribute("data-ch");
      if (i === 6) return scrollToY(finaleST.start + 2);
      var t = CH[i] + (i ? 0.18 : 0);
      scrollToY(storyST.start + (t / TOTAL) * (storyST.end - storyST.start));
    });
  });

  /* ---------------- feelings meter on the TV ---------------- */
  var METER = [[12, 3, 8], [9, 5, 11], [14, 2, 6], [7, 18, 12], [8, 21, 15]];
  var vals = METER.map(function (r) { return r.slice(); }), pupI = 0;
  var tabs = $$(".meter-tabs button"), cells = $$(".meter-row b");
  function showPup(i) {
    pupI = i;
    tabs.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
    cells.forEach(function (c, k) { c.textContent = vals[i][k]; });
  }
  tabs.forEach(function (b, k) { b.addEventListener("click", function () { showPup(k); }); });
  setInterval(function () {
    if (gsap.getProperty(meter, "autoAlpha") < 0.5) return;
    var k = Math.floor(Math.random() * 3), base = METER[pupI][k];
    var v = vals[pupI][k] + (Math.random() > 0.5 ? 1 : -1);
    vals[pupI][k] = Math.max(base - 2, Math.min(base + 3, v));
    cells[k].textContent = vals[pupI][k];
    cells[k].classList.add("ping");
    setTimeout(function () { cells[k].classList.remove("ping"); }, 700);
  }, 900);
  // cycle the pups on their own while the meter is showing
  setInterval(function () { if (gsap.getProperty(meter, "autoAlpha") > 0.5) showPup((pupI + 1) % 5); }, 3600);

  /* ---------------- loader ---------------- */
  var countEl = $(".loader-count");
  var srcs = $$("img").map(function (i) { return i.currentSrc || i.src; })
    .concat(["taz", "skye", "ninja", "wookie", "zivi"].map(function (n) { return "assets/intro/pups/" + n + ".webp"; }))
    .concat(["assets/intro/img/world-strip.webp"]);
  srcs = srcs.filter(function (s, i) { return s && srcs.indexOf(s) === i; });
  var loaded = 0, shown = { v: 0 }, done = false;
  srcs.forEach(function (s) {
    var im = new Image();
    im.onload = im.onerror = function () { loaded++; };
    im.src = s;
  });
  var fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  var t0 = performance.now();
  (function tick() {
    var target = Math.min(1, loaded / srcs.length) * 100;
    shown.v += (target - shown.v) * 0.08 + 0.25;
    if (shown.v > target) shown.v = target;
    countEl.textContent = String(Math.round(shown.v)).padStart(2, "0");
    var minTime = performance.now() - t0 > 1500;
    if ((shown.v >= 99.5 && minTime) || performance.now() - t0 > 9000) { if (!done) { done = true; fontsReady.then(start); } return; }
    requestAnimationFrame(tick);
  })();

  function start() {
    countEl.textContent = "100";
    ScrollTrigger.refresh();
    sizeMobile();
    var fly = $(".newsfly");
    var intro = gsap.timeline();
    intro.to(".loader", { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.15);
    intro.from(fly, { xPercent: 45, yPercent: 85, rotationX: 50, rotationY: -12, rotationZ: -24, scale: 0.85, duration: 1.5, ease: "power3.out" }, 0.25);
    intro.add(function () {
      document.body.classList.remove("is-loading");
      if (smoother) smoother.paused(false);
    }, 1.1);
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
