/*
  Home page: intro loader, the dock, cube turns between the four views,
  and the Episode guide, Seasons and More views.
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
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement, body = document.body;
  var eps = D.episodes;

  /* ---------- Episodes wall ---------- */
  $("#ep-links").innerHTML = eps.map(function (e) {
    return '<li><a href="' + link(e) + '">' + esc(e.title) + ": " + esc(e.logline) + "</a></li>";
  }).join("");

  var wall = new window.PomWall($(".wall"), eps, {
    reduced: reduced,
    onOpen: function (e) {
      body.classList.add("is-leaving");
      try { sessionStorage.setItem("pom-seen", "1"); } catch (err) {}
      setTimeout(function () { location.href = link(e); }, 120);
    }
  });
  var setWallBg = function () {
    wall.bg = root.dataset.theme === "light" ? [0.945, 0.941, 0.925] : [0, 0, 0];
  };
  setWallBg();

  var wallReady = A.fontsReady().then(function () {
    var CW = 720, CH = 418;
    return Promise.all(eps.map(function (e) { return A.episodeArt(e, CW, CH); })).then(function (arts) {
      wall.build(arts.map(function (art, i) { return A.glassCard(eps[i], art, CW, CH); }));
      wall.bind();
    });
  });

  // Coming back (Back button, browser history) restores a clean wall
  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted) { body.classList.remove("is-leaving"); wall.reset(); }
  });

  /* ---------- Intro: meter pill -> hint -> dock ---------- */
  var dock = $("#dock");
  var setDock = function (state) {
    dock.className = "dock is-" + state;
  };
  var seen = false;
  try { seen = sessionStorage.getItem("pom-seen") === "1"; } catch (err) {}

  function intro() {
    var p = 0, target = 0.15;
    body.classList.add("is-booting");
    var meter = function () {
      p += (target - p) * 0.08;
      dock.style.setProperty("--boot", p.toFixed(4));
      if (p < 0.998) requestAnimationFrame(meter);
    };
    if (!reduced && !seen) requestAnimationFrame(meter);
    var tick = setInterval(function () { target = Math.min(0.9, target + 0.06); }, 120);
    var minTime = new Promise(function (r) { setTimeout(r, seen || reduced ? 0 : 1300); });

    Promise.all([wallReady, minTime]).then(function () {
      clearInterval(tick); target = 1;
      var wait = function (ms) { return new Promise(function (r) { setTimeout(r, seen || reduced ? 0 : ms); }); };
      return wait(500).then(function () {
        setDock("clear");
        return wait(650);
      }).then(function () {
        setDock("shape");
        body.classList.add("is-hinting");
        return wait(1100);
      }).then(function () {
        body.classList.remove("is-booting", "is-hinting");
        body.classList.add("is-live");
        setDock("drop");
        wall.start();
        return wait(700);
      }).then(function () {
        setDock("expand");
        return wait(650);
      }).then(function () {
        setDock("live");
        try { sessionStorage.setItem("pom-seen", "1"); } catch (err) {}
      });
    });
  }

  /* ---------- Cube turns between views ---------- */
  var order = ["episodes", "guide", "seasons", "more"];
  var current = "episodes", turning = false;

  function show(name, instant) {
    if (order.indexOf(name) < 0) name = "episodes";
    if (name === current || turning) return;
    var from = $('.face[data-face="' + current + '"]'), to = $('.face[data-face="' + name + '"]');
    var dir = order.indexOf(name) > order.indexOf(current) ? 1 : -1;
    $$(".dock-item").forEach(function (b) {
      if (b.dataset.go === name) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    body.dataset.view = name;
    if (history.replaceState) history.replaceState(null, "", name === "episodes" ? location.pathname : "#" + name);
    if (name === "episodes") wall.start();
    var done = function () {
      from.classList.remove("is-on", "turn-out"); to.classList.remove("turn-in");
      to.classList.add("is-on");
      $(".cube").classList.remove("is-turning");
      from.style.cssText = to.style.cssText = "";
      turning = false;
      if (current !== "episodes") wall.stop();
      onShown(name);
    };
    var prev = current; current = name;
    if (instant || reduced) { done(); return; }
    turning = true;
    var cube = $(".cube");
    cube.style.setProperty("--dir", dir);
    to.classList.add("turn-in");
    from.classList.add("turn-out");
    cube.classList.add("is-turning");
    void cube.offsetWidth;
    cube.classList.add("go");
    setTimeout(function () { cube.classList.remove("go"); done(); }, 1150);
    void prev;
  }

  $$(".dock-item").forEach(function (b) {
    b.addEventListener("click", function () { show(b.dataset.go); });
  });
  window.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input,textarea")) return;
    if (current === "guide" && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault(); guideGo(guideIdx + (e.key === "ArrowDown" ? 1 : -1));
    }
    if (current === "seasons" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      shelfGo(shelfIdx + (e.key === "ArrowRight" ? 1 : -1));
    }
  });

  function onShown(name) {
    if (name === "guide") guideRender(true);
  }

  /* ---------- Episode guide ---------- */
  var guideIdx = 0;
  var numEl = $("#guide-num"), postEl = $("#guide-post"), rulerEl = $("#ruler");
  var total = eps.length;
  var absNum = function (i) { return String(total - i).padStart(2, "0"); };

  // flip digits: each digit has a leaf that turns over when it changes
  function setDigits(str, animate) {
    var cur = numEl.children;
    if (cur.length !== str.length) {
      numEl.innerHTML = str.split("").map(function (ch) {
        return '<span class="digit"><span class="digit-size">0</span><span class="leaf">' + ch + "</span></span>";
      }).join("");
      return;
    }
    str.split("").forEach(function (ch, i) {
      var d = cur[i], leaf = d.querySelector(".leaf:last-child");
      if (leaf.textContent === ch) return;
      if (!animate || reduced) { leaf.textContent = ch; return; }
      var nl = document.createElement("span");
      nl.className = "leaf leaf-in"; nl.textContent = ch;
      leaf.classList.add("leaf-out");
      d.appendChild(nl);
      setTimeout(function () { if (leaf.parentNode) leaf.parentNode.removeChild(leaf); nl.classList.remove("leaf-in"); }, 600);
    });
  }

  function words(text, cls) {
    return String(text).split(" ").map(function (w, i) {
      return '<span class="word"><span style="animation-delay:' + (i * 40) + 'ms">' + esc(w) + "</span></span>";
    }).join(" ");
  }

  function guideRender(animate) {
    var e = eps[guideIdx];
    setDigits(absNum(guideIdx), animate);
    postEl.innerHTML =
      '<p class="guide-when">Season ' + e.season + " · Episode " + e.number + ' <span>· ' + esc(fmtDate(e.date)) + " · " + esc(e.runtime) + "</span></p>" +
      '<h3 class="guide-title">' + words(e.title) + "</h3>" +
      '<p class="guide-log">' + esc(e.logline) + "</p>" +
      '<p class="guide-note">' + esc(e.description) + "</p>" +
      '<ul class="chips">' + (e.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<a class="guide-watch" href="' + link(e) + '">Watch episode <span aria-hidden="true">→</span></a>';
    $$(".rbar", rulerEl).forEach(function (b, i) { b.classList.toggle("is-on", i === guideIdx); });
    var t = total > 1 ? guideIdx / (total - 1) : 0;
    rulerEl.style.setProperty("--t", t);
    $$(".round-btn[data-step]").forEach(function (b) {
      b.disabled = (b.dataset.step === "-1" && guideIdx === 0) || (b.dataset.step === "1" && guideIdx === total - 1);
    });
  }
  function guideGo(i) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === guideIdx) return;
    guideIdx = i; guideRender(true);
  }

  (function buildRuler() {
    var seasons = [];
    eps.forEach(function (e) { if (seasons.indexOf(e.season) < 0) seasons.push(e.season); });
    var ticks = "";
    for (var i = 0; i <= total * 2; i++) ticks += '<span class="rtick" style="left:' + (i / (total * 2) * 100) + '%"></span>';
    var labels = seasons.map(function (s) {
      var first = eps.findIndex(function (e) { return e.season === s; });
      return '<span class="rlabel" style="left:' + (first / total * 100) + '%">Season ' + s + "</span>";
    }).join("");
    rulerEl.innerHTML =
      '<div class="rticks">' + ticks + labels + "</div>" +
      '<div class="rline"><span class="rlit"></span></div>' +
      '<span class="rhead" aria-hidden="true"></span>' +
      '<ol class="rbars">' + eps.map(function (e, i) {
        return '<li style="--c:' + A.color(e) + '"><button type="button" class="rbar" data-i="' + i + '" aria-label="' +
          esc("Season " + e.season + " episode " + e.number + ": " + e.title) + '"><span class="rfill"></span><span class="rname">S' + e.season + "E" + e.number + "</span></button></li>";
      }).join("") + "</ol>";
    $$(".rbar", rulerEl).forEach(function (b) {
      b.addEventListener("click", function () { guideGo(Number(b.dataset.i)); });
    });
  })();
  $$(".round-btn[data-step]").forEach(function (b) {
    b.addEventListener("click", function () { guideGo(guideIdx + Number(b.dataset.step)); });
  });
  var wheelLock = 0;
  $(".face-guide").addEventListener("wheel", function (e) {
    e.preventDefault();
    var now = Date.now();
    if (now - wheelLock < 450 || Math.abs(e.deltaY) < 8) return;
    wheelLock = now;
    guideGo(guideIdx + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });
  guideRender(false);

  /* ---------- Seasons shelf ---------- */
  var shelfIdx = 0, shelfX = 0, shelfTX = 0;
  var track = $("#shelf-track");
  var devices = ["laptop", "monitor", "tv", "tablet"];
  var items = [{ kind: "all", label: "All episodes" }].concat(D.seasons.slice().sort(function (a, b) {
    // released seasons first (newest first), coming soon last
    if ((a.status === "soon") !== (b.status === "soon")) return a.status === "soon" ? 1 : -1;
    return b.number - a.number;
  }).map(function (s) { return { kind: "season", season: s, label: s.status === "soon" ? s.title + " · soon" : s.title }; }));

  track.innerHTML = items.map(function (it, i) {
    var dev = devices[i % devices.length];
    var href = it.kind === "all" ? "#episodes" : "season.html?s=" + it.season.number;
    var screen = it.kind === "all"
      ? '<div class="mini-wall">' + eps.slice(0, 9).map(function (e) { return '<span data-ep="' + esc(e.id) + '"></span>'; }).join("") + "</div>"
      : '<canvas data-season="' + it.season.number + '"></canvas><div class="screen-text"><strong>' + esc(it.season.title) + "</strong><span>" +
        (it.season.status === "soon" ? "Coming soon" : eps.filter(function (e) { return e.season === it.season.number; }).length + " episodes") + "</span></div>";
    return '<div class="shelf-item" data-i="' + i + '"><span class="pill-label">' + esc(it.label) + "</span>" +
      '<a class="device device-' + dev + '" href="' + href + '"' + (it.kind === "all" ? ' data-go="episodes"' : "") + ' aria-label="' + esc(it.label) + '">' +
      '<span class="device-body"><span class="device-screen">' + screen + "</span></span><span class=\"device-base\"></span></a></div>";
  }).join("");

  $$("canvas[data-season]", track).forEach(function (c) {
    var s = Number(c.dataset.season), art = A.seasonArt(s, 640, 400);
    c.width = 640; c.height = 400; c.getContext("2d").drawImage(art, 0, 0);
  });
  $$(".mini-wall span", track).forEach(function (sp) {
    var e = eps.filter(function (x) { return x.id === sp.dataset.ep; })[0];
    A.episodeArt(e, 160, 94).then(function (c) { sp.style.backgroundImage = "url(" + c.toDataURL("image/jpeg", 0.8) + ")"; });
  });
  $$("[data-go]", track).forEach(function (a) {
    a.addEventListener("click", function (ev) { ev.preventDefault(); show(a.dataset.go); });
  });

  var itemW = function () { var it = $(".shelf-item", track); return it ? it.getBoundingClientRect().width : 400; };
  function shelfGo(i) {
    shelfIdx = Math.max(0, Math.min(items.length - 1, i));
    shelfTX = -shelfIdx * itemW();
    $(".shelf-prev").disabled = shelfIdx === 0;
    $(".shelf-next").disabled = shelfIdx === items.length - 1;
  }
  (function shelfLoop() {
    shelfX += (shelfTX - shelfX) * 0.1;
    track.style.transform = "translate3d(" + shelfX.toFixed(2) + "px,0,0)";
    $$(".shelf-item", track).forEach(function (el, i) {
      var d = (i * itemW() + shelfX) / itemW();
      el.style.setProperty("--d", Math.max(-2, Math.min(2, d)).toFixed(3));
    });
    requestAnimationFrame(shelfLoop);
  })();
  $(".shelf-prev").addEventListener("click", function () { shelfGo(shelfIdx - 1); });
  $(".shelf-next").addEventListener("click", function () { shelfGo(shelfIdx + 1); });
  var sw = 0;
  $(".face-seasons").addEventListener("wheel", function (e) {
    e.preventDefault();
    var now = Date.now();
    var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (now - sw < 400 || Math.abs(d) < 8) return;
    sw = now; shelfGo(shelfIdx + (d > 0 ? 1 : -1));
  }, { passive: false });
  (function shelfDrag() {
    var el = $("#shelf"), sx = null, base = 0, moved = 0;
    el.addEventListener("pointerdown", function (e) { sx = e.clientX; base = shelfTX; moved = 0; });
    window.addEventListener("pointermove", function (e) {
      if (sx == null) return;
      moved = Math.max(moved, Math.abs(e.clientX - sx));
      shelfTX = base + (e.clientX - sx);
    });
    window.addEventListener("pointerup", function () {
      if (sx == null) return;
      sx = null;
      shelfGo(Math.round(-shelfTX / itemW()));
    });
    el.addEventListener("click", function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();
  shelfGo(0);

  /* ---------- More ---------- */
  var arrow = '<svg class="row-arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  var corners = '<i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>';
  $("#contact-panel").innerHTML = corners +
    '<p class="panel-label">Get in touch</p>' +
    '<p class="panel-sub">Send a message</p>' +
    '<a class="panel-email" href="mailto:' + esc(D.site.email) + '">' + esc(D.site.email) + "</a>" +
    '<ul class="rows">' +
      [["Watch on YouTube", "Channel", D.site.youtube], ["Latest episode", eps[0] ? "S" + eps[0].season + " · E" + eps[0].number : "", eps[0] ? link(eps[0]) : "#"],
       ["Press kit", "PDF / Images", D.site.pressKit], ["Partnerships & licensing", "Email", "mailto:" + D.site.email]].map(function (r) {
        return '<li><a href="' + esc(r[2]) + '"><span><strong>' + esc(r[0]) + "</strong><small>" + esc(r[1]) + "</small></span>" + arrow + "</a></li>";
      }).join("") +
    "</ul>";
  $("#side-panel").innerHTML = corners +
    '<p class="panel-label">Meet the Poms</p>' +
    '<ul class="tiles">' + D.characters.map(function (c) {
      return '<li><span class="tile-dot" aria-hidden="true"></span><span><strong>' + esc(c.name) + "</strong><small>" + esc(c.role) + "</small></span></li>";
    }).join("") + "</ul>" +
    '<p class="panel-label">Social</p>' +
    '<ul class="socials">' + D.site.socials.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a></li>";
    }).join("") + "</ul>" +
    '<div class="appearance"><p class="panel-label">Appearance</p>' +
    '<div class="seg" role="group" aria-label="Appearance"><button type="button" data-theme-set="light">☀ Light</button><button type="button" data-theme-set="dark">☾ Dark</button></div></div>';
  var syncTheme = function () {
    $$("[data-theme-set]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.themeSet === (root.dataset.theme || "dark"))); });
    setWallBg();
  };
  $$("[data-theme-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      root.dataset.theme = b.dataset.themeSet;
      try { localStorage.setItem("pom-theme", root.dataset.theme); } catch (err) {}
      syncTheme();
    });
  });
  syncTheme();

  /* ---------- Go ---------- */
  var start = (location.hash || "").replace("#", "");
  intro();
  if (start && start !== "episodes") {
    wallReady.then(function () { show(start, true); });
  }
  window.addEventListener("hashchange", function () { show((location.hash || "").replace("#", "") || "episodes"); });
})();
