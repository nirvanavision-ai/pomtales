/*
  Episode and season pages: full-bleed hero, details, video, more cards,
  footer. Smooth scrolling via Lenis when it's available.
*/
(function () {
  var D = window.POM, A = window.PomArt;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var link = function (e) { return "episode.html?id=" + encodeURIComponent(e.id); };
  var fmtDate = function (d) {
    var t = new Date(d + "T00:00:00");
    return isNaN(t) ? "" : t.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  var words = function (text) {
    return String(text).split(" ").map(function (w, i) {
      return '<span class="word"><span style="animation-delay:' + (150 + i * 70) + 'ms">' + esc(w) + "</span></span>";
    }).join(" ");
  };
  var params = new URLSearchParams(location.search);
  var eps = D.episodes;
  var main = $("#main");
  var arrow = '<svg class="row-arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';

  function footer() {
    var ic = {
      mail: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 2v.5l7 4.5 7-4.5V7zm14 2.9-7 4.5-7-4.5V17h14z"/></svg>',
      play: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 5h18v14H3zm7 3.5v7l6-3.5z"/></svg>',
      grid: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>',
      list: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h10v2H4z"/></svg>',
      tv: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 5h18v12h-8v2h3v2H8v-2h3v-2H3z"/></svg>',
      doc: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 2h8l5 5v15H6zm7 1.5V8h4.5z"/></svg>'
    };
    var rows = [
      [ic.mail, "Send a message", "mailto:" + D.site.email],
      [ic.play, "Watch on YouTube", D.site.youtube],
      [ic.grid, "All episodes", "./"],
      [ic.list, "Episode guide", "./#guide"],
      [ic.doc, "Press kit", D.site.pressKit],
      [ic.tv, "Seasons", "./#seasons"]
    ];
    return '<footer class="foot reveal"><ul class="foot-links">' + rows.map(function (r) {
      return '<li><a href="' + esc(r[2]) + '">' + r[0] + "<span>" + esc(r[1]) + "</span>" + arrow + "</a></li>";
    }).join("") + '</ul><div class="foot-bar"><span>© ' + new Date().getFullYear() + " Pom Tales</span><ul>" +
      D.site.socials.map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a></li>"; }).join("") +
      "</ul></div></footer>";
  }

  // Fill <img data-art> placeholders with the generated or real art
  function fillArt(scope) {
    $$("img[data-ep]", scope).forEach(function (im) {
      var e = eps.filter(function (x) { return x.id === im.dataset.ep; })[0];
      if (!e) return;
      var card = im.hasAttribute("data-card");
      A.episodeArt(e, 720, 418).then(function (art) {
        var c = card ? A.glassCard(e, art, 720, 418) : art;
        im.src = c.toDataURL(card ? "image/png" : "image/jpeg", 0.88);
      });
    });
  }
  function cardList(list, cls) {
    return '<ul class="cards ' + (cls || "") + '">' + list.map(function (e) {
      return '<li class="reveal"><a class="gcard" href="' + link(e) + '"><img data-ep="' + esc(e.id) + '" data-card alt="' + esc(e.title + ": " + e.logline) + '"></a></li>';
    }).join("") + "</ul>";
  }

  function heroArt(canvasPromise) {
    canvasPromise.then(function (c) { var im = $(".hero-art"); if (im) im.src = c.toDataURL("image/jpeg", 0.9); });
  }

  /* ---------- Episode page ---------- */
  function episodePage() {
    var idx = Math.max(0, eps.findIndex(function (x) { return x.id === params.get("id"); }));
    var e = eps[idx];
    if (!e) { main.innerHTML = '<div class="notfound"><div><h1>No episodes yet</h1><a href="./">Back home</a></div></div>'; return; }
    document.title = e.title + " | Pom Tales";
    var siblings = eps.filter(function (x) { return x.season === e.season; });
    var more = eps.filter(function (x) { return x.id !== e.id; });
    // next few episodes after this one, wrapping around
    more = more.slice(idx).concat(more.slice(0, idx)).slice(0, 6);
    var player = e.youtube
      ? '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(e.youtube) + '?rel=0" title="' + esc(e.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>'
      : '<img data-ep="' + esc(e.id) + '" alt=""><div class="player-ph"><div><div class="play"></div><span>Video coming soon</span></div></div>';

    main.innerHTML =
      '<section class="hero"><img class="hero-art" alt=""><h1 class="hero-title"><span class="hero-kicker">Season ' + e.season + " · Episode " + e.number + "</span>" + words(e.title) + "</h1></section>" +
      '<article class="content">' +
        '<dl class="meta reveal"><div><dt>Season</dt><dd>' + e.season + "</dd></div><div><dt>Episode</dt><dd>" + e.number + "</dd></div><div><dt>Runtime</dt><dd>" + esc(e.runtime) + "</dd></div><div><dt>Released</dt><dd>" + esc(fmtDate(e.date)) + "</dd></div></dl>" +
        '<p class="label reveal">In this episode</p><ul class="tags reveal">' + (e.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
        '<p class="reveal" style="font-size:1.15rem;color:var(--ink)">' + esc(e.logline) + "</p>" +
        '<p class="reveal">' + esc(e.description) + "</p>" +
      "</article>" +
      '<section class="wide"><h2 class="reveal">Watch</h2><div class="player reveal">' + player + "</div>" +
        '<div class="strip reveal" aria-label="Season ' + e.season + ' episodes">' + siblings.map(function (s) {
          return '<a href="' + link(s) + '"' + (s.id === e.id ? ' aria-current="page"' : "") + ' aria-label="' + esc(s.title) + '"><img data-ep="' + esc(s.id) + '" alt=""></a>';
        }).join("") + "</div></section>" +
      '<section class="wide"><h2 class="reveal">More episodes</h2>' + cardList(more) + "</section>" +
      footer();
    heroArt(A.episodeArt(e, 1920, 1080));
  }

  /* ---------- Season page ---------- */
  function seasonPage() {
    var n = Number(params.get("s")) || (D.seasons.filter(function (s) { return s.status !== "soon"; })[0] || D.seasons[0]).number;
    var s = D.seasons.filter(function (x) { return x.number === n; })[0] || { number: n, title: "Season " + n, blurb: "" };
    document.title = s.title + " | Pom Tales";
    var list = eps.filter(function (e) { return e.season === n; });
    var dates = list.map(function (e) { return e.date; }).sort();
    var others = D.seasons.filter(function (x) { return x.number !== n; });
    main.innerHTML =
      '<section class="hero"><img class="hero-art" alt=""><h1 class="hero-title"><span class="hero-kicker">Pom Tales</span>' + words(s.title) + "</h1></section>" +
      '<article class="content">' +
        '<dl class="meta reveal"><div><dt>Episodes</dt><dd>' + (list.length || "—") + "</dd></div><div><dt>Premiere</dt><dd>" + esc(dates[0] ? fmtDate(dates[0]) : "Coming soon") +
        "</dd></div><div><dt>Finale</dt><dd>" + esc(dates.length ? fmtDate(dates[dates.length - 1]) : "—") + "</dd></div><div><dt>Status</dt><dd>" + (s.status === "soon" ? "Coming soon" : "Out now") + "</dd></div></dl>" +
        '<p class="reveal" style="font-size:1.15rem;color:var(--ink)">' + esc(s.blurb) + "</p>" +
      "</article>" +
      (list.length ? '<section class="wide"><h2 class="reveal">Episodes</h2>' + cardList(list.slice().sort(function (a, b) { return a.number - b.number; }), "three") + "</section>" : "") +
      (others.length ? '<section class="wide"><h2 class="reveal">Other seasons</h2><ul class="cards three">' + others.map(function (o) {
        return '<li class="reveal"><a class="gcard" href="season.html?s=' + o.number + '"><img data-season="' + o.number + '" alt="' + esc(o.title) + '"></a></li>';
      }).join("") + "</ul></section>" : "") +
      footer();
    heroArt(Promise.resolve(A.seasonArt(n, 1920, 1080)));
    $$("img[data-season]").forEach(function (im) {
      var sn = Number(im.dataset.season), so = D.seasons.filter(function (x) { return x.number === sn; })[0];
      var fake = { id: "season-" + sn, season: sn, number: "", title: so.title, logline: so.status === "soon" ? "Coming soon" : eps.filter(function (e) { return e.season === sn; }).length + " episodes" };
      var card = A.glassCard(fake, A.seasonArt(sn, 720, 418), 720, 418);
      im.src = card.toDataURL("image/png");
    });
  }

  if (document.body.dataset.page === "season") seasonPage(); else episodePage();
  A.fontsReady().then(function () { fillArt(document); });

  /* ---------- Scroll: Lenis, hero parallax, reveals ---------- */
  var lenis = null;
  if (window.Lenis && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  var hero = $(".hero");
  var onScroll = function () {
    var y = window.scrollY, h = window.innerHeight;
    if (hero) hero.style.setProperty("--hp", Math.min(1, y / h).toFixed(3));
    document.body.classList.toggle("is-scrolled", y > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".reveal").forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 70 + "ms";
    if (io) io.observe(el); else el.classList.add("is-in");
  });
  $(".scroll-cue") && $(".scroll-cue").addEventListener("click", function (ev) {
    ev.preventDefault();
    var t = $(".content");
    if (lenis) lenis.scrollTo(t, { offset: -20 }); else t.scrollIntoView({ behavior: "smooth" });
  });
})();
