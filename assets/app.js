(function () {
  var D = window.POM;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var code = function (e) { return "S" + e.season + " · E" + e.number; };
  var link = function (e) { return "episode.html?id=" + encodeURIComponent(e.id); };
  var fmtDate = function (d) {
    var t = new Date(d + "T00:00:00");
    return isNaN(t) ? "" : t.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  var thumb = function (e) {
    var src = e.thumb || (e.youtube ? "https://i.ytimg.com/vi/" + e.youtube + "/hqdefault.jpg" : "");
    return '<div class="thumb">' +
      (src ? '<img src="' + esc(src) + '" alt="" loading="lazy">' : '<div class="ph">' + esc(code(e)) + "</div>") +
      '<span class="play" aria-hidden="true">▶</span></div>';
  };

  // Theme toggle (remembers the choice when storage is available)
  var root = document.documentElement;
  try { var saved = localStorage.getItem("pom-theme"); if (saved) root.dataset.theme = saved; } catch (e) {}
  var btn = $(".theme-toggle");
  if (btn) btn.addEventListener("click", function () {
    var dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("pom-theme", root.dataset.theme); } catch (e) {}
  });

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Home page
  if ($("#episode-list")) {
    document.querySelectorAll("[data-bind]").forEach(function (el) {
      el.textContent = D.site[el.dataset.bind] || "";
    });
    if (D.episodes[0]) $("#latest-link").href = link(D.episodes[0]);

    $("#facts").innerHTML = D.facts.map(function (f) {
      return "<div><dt>" + esc(f.label) + "</dt><dd>" + esc(f.value) + "</dd></div>";
    }).join("");

    $("#featured-list").innerHTML = D.episodes.filter(function (e) { return e.featured; }).slice(0, 4).map(function (e) {
      return '<a class="feature" href="' + link(e) + '">' + thumb(e) +
        "<h3>" + esc(e.title) + "</h3><p>" + esc(e.logline) + "</p>" +
        '<div class="meta">' + esc(code(e)) + " · " + esc(e.runtime) + " · " + esc((e.tags || []).join(", ")) + "</div></a>";
    }).join("");

    var seasons = Array.from(new Set(D.episodes.map(function (e) { return e.season; }))).sort(function (a, b) { return b - a; });
    var renderList = function (season) {
      $("#episode-list").innerHTML = D.episodes.filter(function (e) { return !season || e.season === season; }).map(function (e) {
        return '<li><a href="' + link(e) + '"><span class="code">' + esc(code(e)) + '</span>' +
          '<span class="title">' + esc(e.title) + " <span>— " + esc(e.logline) + "</span></span>" +
          '<span class="rt">' + esc(e.runtime) + "</span></a></li>";
      }).join("");
      document.querySelectorAll("#season-filters button").forEach(function (b) {
        b.setAttribute("aria-selected", String(Number(b.dataset.season) === (season || 0)));
      });
    };
    $("#season-filters").innerHTML = '<button role="tab" data-season="0">All</button>' + seasons.map(function (s) {
      return '<button role="tab" data-season="' + s + '">Season ' + s + "</button>";
    }).join("");
    $("#season-filters").addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (b) renderList(Number(b.dataset.season));
    });
    var hashSeason = (location.hash.match(/^#season-(\d+)$/) || [])[1];
    renderList(hashSeason ? Number(hashSeason) : 0);

    $("#archive-list").innerHTML = seasons.map(function (s) {
      var n = D.episodes.filter(function (e) { return e.season === s; }).length;
      return '<li><a href="#season-' + s + '">Season ' + s + " <span class=\"muted\">(" + n + ")</span></a></li>";
    }).join("");
    $("#archive-list").addEventListener("click", function (ev) {
      var a = ev.target.closest("a"); if (!a) return;
      ev.preventDefault();
      renderList(Number(a.getAttribute("href").split("-")[1]));
      $("#episodes").scrollIntoView();
    });

    $("#cast-list").innerHTML = D.characters.map(function (c) {
      return '<div><div class="avatar">' + (c.img ? '<img src="' + esc(c.img) + '" alt="' + esc(c.name) + '">' : esc(c.name.charAt(0))) +
        "</div><h3>" + esc(c.name) + "</h3><p>" + esc(c.role) + "</p></div>";
    }).join("");

    $("#faq-list").innerHTML = D.faq.map(function (f) {
      return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>";
    }).join("");

    var mail = $("#email-link"); mail.href = "mailto:" + D.site.email; mail.textContent = D.site.email;
    $("#socials").innerHTML = D.site.socials.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + " ↗</a></li>";
    }).join("");
  }

  // Episode page
  if ($("#episode")) {
    var id = new URLSearchParams(location.search).get("id");
    var i = D.episodes.findIndex(function (e) { return e.id === id; });
    var e = D.episodes[i];
    if (!e) {
      $("#episode").innerHTML = '<h1>Episode not found</h1><p class="lede">Try the <a href="./#episodes">full episode list</a>.</p>';
    } else {
      document.title = e.title + " | Pom Tales";
      $("#episode").innerHTML =
        '<p class="eyebrow">' + esc(code(e)) + "</p><h1>" + esc(e.title) + "</h1>" +
        '<p class="lede">' + esc(e.logline) + "</p>" +
        (e.youtube
          ? '<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(e.youtube) + '" title="' + esc(e.title) + '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
          : '<div class="player">' + thumb(e) + "</div>") +
        "<p>" + esc(e.description) + "</p>" +
        '<div class="meta">' + esc(fmtDate(e.date)) + " · " + esc(e.runtime) + "</div>" +
        '<div class="tags">' + (e.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>";
      var newer = D.episodes[i - 1], older = D.episodes[i + 1];
      $("#ep-nav").innerHTML =
        (older ? '<a href="' + link(older) + '"><small>← Previous</small>' + esc(older.title) + "</a>" : "") +
        (newer ? '<a class="next" href="' + link(newer) + '"><small>Next →</small>' + esc(newer.title) + "</a>" : "");
    }
  }

  // Fade sections in as they scroll into view
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }
})();
