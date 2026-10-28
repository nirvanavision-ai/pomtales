/*
  Pom Tales placeholder artwork.
  Until real episode stills exist, every episode gets a generated scene
  (sky, bokeh, a fluffy Pom) so the site has something to show.
  An episode's `thumb` in data.js always wins over this art.
*/
(function () {
  var D = window.POM;

  // Small seeded random so each episode always gets the same picture
  function rng(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6d2b79f5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Season moods: 1 = warm daytime, 2 = dreamy night, 3+ = mint morning
  var MOODS = {
    1: { sky: [[28, 90, 78], [12, 85, 68], [340, 60, 58]], fur: [[30, 85, 60], [38, 70, 82], [22, 75, 48]], prop: "cloud" },
    2: { sky: [[250, 55, 26], [270, 50, 40], [215, 65, 52]], fur: [[30, 80, 62], [40, 30, 92], [25, 50, 38]], prop: "star" },
    3: { sky: [[170, 50, 70], [195, 60, 60], [150, 45, 80]], fur: [[32, 80, 64], [40, 45, 90], [20, 60, 44]], prop: "bubble" }
  };
  var hsl = function (c, dl, a) {
    return "hsla(" + c[0] + "," + c[1] + "%," + Math.max(0, Math.min(100, c[2] + (dl || 0))) + "%," + (a == null ? 1 : a) + ")";
  };
  var moodFor = function (season) { return MOODS[season] || MOODS[3]; };

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function cloud(ctx, x, y, s, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    [[0, 0, 1], [0.9, -0.35, 0.8], [1.7, 0, 0.9], [0.8, 0.25, 0.85]].forEach(function (b) {
      ctx.moveTo(x + b[0] * s + b[2] * s, y + b[1] * s);
      ctx.arc(x + b[0] * s, y + b[1] * s, b[2] * s, 0, Math.PI * 2);
    });
    ctx.fill();
  }

  function star(ctx, x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  // An original fluffy Pom: round fur ball, fox ears, button eyes
  function pom(ctx, cx, cy, s, fur, R, sleepy) {
    var light = hsl(fur, 18), dark = hsl(fur, -18);
    // shadow
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath(); ctx.ellipse(cx, cy + s * 1.02, s * 0.95, s * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    // ears
    [-1, 1].forEach(function (d) {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(cx + d * s * 0.28, cy - s * 0.62);
      ctx.lineTo(cx + d * s * 0.62, cy - s * 1.12);
      ctx.lineTo(cx + d * s * 0.78, cy - s * 0.42);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "hsl(350,70%,78%)";
      ctx.beginPath();
      ctx.moveTo(cx + d * s * 0.38, cy - s * 0.6);
      ctx.lineTo(cx + d * s * 0.6, cy - s * 0.95);
      ctx.lineTo(cx + d * s * 0.68, cy - s * 0.5);
      ctx.closePath(); ctx.fill();
    });
    // fur tufts around the body
    var g = ctx.createRadialGradient(cx - s * 0.3, cy - s * 0.4, s * 0.1, cx, cy, s * 1.1);
    g.addColorStop(0, light); g.addColorStop(0.7, hsl(fur)); g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    var n = 22;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, rad = s * (0.86 + R() * 0.12);
      ctx.moveTo(cx + Math.cos(a) * rad + s * 0.2, cy + Math.sin(a) * rad * 0.92);
      ctx.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.92, s * 0.2, 0, Math.PI * 2);
    }
    ctx.moveTo(cx + s * 0.9, cy);
    ctx.arc(cx, cy, s * 0.9, 0, Math.PI * 2);
    ctx.fill();
    // muzzle
    ctx.fillStyle = hsl([fur[0], fur[1] * 0.5, 92]);
    ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.12, s * 0.42, s * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    // eyes
    [-1, 1].forEach(function (d) {
      if (sleepy) {
        ctx.strokeStyle = "#1b1420"; ctx.lineWidth = s * 0.05; ctx.lineCap = "round";
        ctx.beginPath(); ctx.arc(cx + d * s * 0.3, cy - s * 0.16, s * 0.09, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      } else {
        ctx.fillStyle = "#1b1420";
        ctx.beginPath(); ctx.arc(cx + d * s * 0.3, cy - s * 0.16, s * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(cx + d * s * 0.3 - s * 0.03, cy - s * 0.2, s * 0.035, 0, Math.PI * 2); ctx.fill();
      }
    });
    // nose + smile
    ctx.fillStyle = "#1b1420";
    ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.04, s * 0.08, s * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1b1420"; ctx.lineWidth = s * 0.03; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx - s * 0.07, cy + s * 0.12, s * 0.07, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + s * 0.07, cy + s * 0.12, s * 0.07, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    // cheeks
    ctx.fillStyle = "hsla(350,80%,70%,.45)";
    [-1, 1].forEach(function (d) { ctx.beginPath(); ctx.arc(cx + d * s * 0.5, cy + s * 0.08, s * 0.09, 0, Math.PI * 2); ctx.fill(); });
  }

  // Paint a scene for an episode (or a season, with key = "season-N")
  function paint(ctx, w, h, key, season) {
    var R = rng(String(key));
    var m = moodFor(season);
    var sky = m.sky.map(function (c) { return [c[0] + (R() - 0.5) * 30, c[1], c[2]]; });
    var g = ctx.createLinearGradient(0, 0, w * 0.3, h);
    g.addColorStop(0, hsl(sky[0], 8)); g.addColorStop(0.55, hsl(sky[1])); g.addColorStop(1, hsl(sky[2], -8));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // soft bokeh
    for (var i = 0; i < 14; i++) {
      var bx = R() * w, by = R() * h * 0.8, br = (0.03 + R() * 0.12) * w;
      var bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bg.addColorStop(0, hsl(sky[i % 3], 30, 0.35)); bg.addColorStop(1, hsl(sky[i % 3], 30, 0));
      ctx.fillStyle = bg; ctx.fillRect(bx - br, by - br, br * 2, br * 2);
    }

    // props
    for (var j = 0; j < 7; j++) {
      var px = R() * w, py = R() * h * 0.55, ps = (0.02 + R() * 0.05) * w;
      if (m.prop === "cloud") cloud(ctx, px, py, ps, "rgba(255,255,255," + (0.55 + R() * 0.35) + ")");
      else if (m.prop === "star") star(ctx, px, py, ps * 0.5, "hsla(48,100%,80%," + (0.6 + R() * 0.4) + ")");
      else { ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, ps * 0.6, 0, Math.PI * 2); ctx.stroke(); }
    }
    if (m.prop === "star") {
      ctx.fillStyle = "hsla(50,100%,92%,.95)";
      ctx.beginPath(); ctx.arc(w * (0.75 + R() * 0.15), h * 0.2, h * 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = hsl(sky[0], 8);
      ctx.beginPath(); ctx.arc(w * 0.83 + h * 0.04, h * 0.18, h * 0.075, 0, Math.PI * 2); ctx.fill();
    }

    // rolling hills
    for (var k = 0; k < 2; k++) {
      ctx.fillStyle = hsl([sky[2][0] + 40 + k * 20, 40, 30 + k * 12 + (season === 2 ? -12 : 10)], 0, 0.9);
      ctx.beginPath();
      ctx.moveTo(0, h);
      var base = h * (0.72 + k * 0.1);
      for (var x = 0; x <= w; x += w / 8) ctx.lineTo(x, base - Math.sin(x / w * Math.PI * (1.5 + k) + R()) * h * 0.06);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }

    // the Pom(s)
    var count = 1 + Math.floor(R() * 3);
    for (var q = 0; q < count; q++) {
      var fur = m.fur[Math.floor(R() * m.fur.length)];
      var s = h * (q === 0 ? 0.26 : 0.16 + R() * 0.05);
      var cx = q === 0 ? w * (0.52 + (R() - 0.5) * 0.25) : w * (q === 1 ? 0.18 + R() * 0.1 : 0.82 - R() * 0.08);
      pom(ctx, cx, h * 0.62 - (q === 0 ? 0 : -h * 0.08), s, fur, R, season === 2 && R() > 0.4);
    }

    // film grain
    ctx.fillStyle = "rgba(255,255,255,.035)";
    for (var n = 0; n < (w * h) / 300; n++) ctx.fillRect(R() * w, R() * h, 1, 1);
  }

  var cache = {};
  function loadImg(src) {
    return new Promise(function (res) {
      var im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = function () { res(im); };
      im.onerror = function () { res(null); };
      im.src = src;
    });
  }
  function drawCover(ctx, im, w, h) {
    var r = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    var iw = im.naturalWidth * r, ih = im.naturalHeight * r;
    ctx.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih);
  }
  function thumbSrc(e) {
    return e.thumb || (e.youtube ? "https://i.ytimg.com/vi/" + e.youtube + "/hqdefault.jpg" : "");
  }

  // Episode art as a canvas, at any size. Uses the real thumbnail when there is one.
  function episodeArt(e, w, h) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    paint(ctx, w, h, e.id, e.season);
    var src = thumbSrc(e);
    if (!src) return Promise.resolve(c);
    if (!cache[src]) cache[src] = loadImg(src);
    return cache[src].then(function (im) {
      if (im) { try { drawCover(ctx, im, w, h); c.getContext("2d").getImageData(0, 0, 1, 1); } catch (err) { paint(ctx, w, h, e.id, e.season); } }
      return c;
    });
  }

  function seasonArt(season, w, h) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    paint(c.getContext("2d"), w, h, "season-" + season, season);
    return c;
  }

  // Wrap text to a width; returns lines
  function wrap(ctx, text, maxW, maxLines) {
    var words = String(text).split(/\s+/), lines = [], line = "";
    words.forEach(function (wd) {
      var t = line ? line + " " + wd : wd;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = wd; } else line = t;
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] += "…"; }
    return lines;
  }

  /*
    The glass card used on the episode wall: art, title, logline,
    a mirrored reflection of the text and a glassy rim.
  */
  function glassCard(e, art, W, H) {
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    var r = H * 0.16;

    ctx.save();
    rr(ctx, 0, 0, W, H, r); ctx.clip();
    ctx.drawImage(art, 0, 0, W, H);

    // legibility wash
    var wash = ctx.createLinearGradient(0, H * 0.35, 0, H);
    wash.addColorStop(0, "rgba(6,8,20,0)"); wash.addColorStop(1, "rgba(6,8,20,.62)");
    ctx.fillStyle = wash; ctx.fillRect(0, 0, W, H);

    // edge darkening (gives the pillow / glass depth)
    var edge = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
    edge.addColorStop(0, "rgba(0,0,0,0)"); edge.addColorStop(1, "rgba(0,0,0,.42)");
    ctx.fillStyle = edge; ctx.fillRect(0, 0, W, H);

    // top sheen
    var sheen = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    sheen.addColorStop(0, "rgba(255,255,255,.28)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen; rr(ctx, W * 0.03, H * 0.02, W * 0.94, H * 0.4, r * 0.8); ctx.fill();

    // text
    var pad = W * 0.075, ty = H * 0.68;
    ctx.fillStyle = "#fff";
    ctx.font = "740 " + Math.round(H * 0.13) + "px Inter, system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = H * 0.03;
    var title = wrap(ctx, e.title, W - pad * 2, 1)[0];
    ctx.fillText(title, pad, ty);
    ctx.shadowBlur = 0;
    ctx.font = "400 " + Math.round(H * 0.045) + "px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.86)";
    var sub = wrap(ctx, e.logline || "", W - pad * 2, 1)[0] || "";
    ctx.fillText(sub, pad + 2, ty + H * 0.075);

    // reflection of the text, flipped and fading out
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.translate(0, (ty + H * 0.11) * 2);
    ctx.scale(1, -0.55);
    ctx.font = "400 " + Math.round(H * 0.045) + "px Inter, system-ui, sans-serif";
    ctx.fillText(sub, pad + 2, ty + H * 0.075 + H * 0.1);
    ctx.restore();

    // code chip
    ctx.font = "500 " + Math.round(H * 0.038) + "px 'Fira Code', ui-monospace, monospace";
    var code = "S" + e.season + " · E" + e.number;
    var cw = ctx.measureText(code).width + H * 0.06;
    ctx.fillStyle = "rgba(10,12,24,.35)";
    rr(ctx, pad, H * 0.09, cw, H * 0.075, H * 0.0375); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.fillText(code, pad + H * 0.03, H * 0.09 + H * 0.052);
    ctx.restore();

    // glass rim: bright top-left, iridescent fringe, soft inner line
    ctx.lineWidth = Math.max(2, H * 0.008);
    var rim = ctx.createLinearGradient(0, 0, W, H);
    rim.addColorStop(0, "rgba(255,255,255,.85)"); rim.addColorStop(0.45, "rgba(255,255,255,.15)"); rim.addColorStop(1, "rgba(255,255,255,.55)");
    ctx.strokeStyle = rim;
    rr(ctx, ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth, r); ctx.stroke();
    var iri = ctx.createLinearGradient(0, 0, W, 0);
    ["#ff5e8a", "#ffd25e", "#5effc8", "#5ec8ff", "#b05eff"].forEach(function (col, i, a) { iri.addColorStop(i / (a.length - 1), col); });
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = Math.max(2, H * 0.012);
    ctx.strokeStyle = iri;
    rr(ctx, H * 0.012, H * 0.012, W - H * 0.024, H - H * 0.024, r * 0.92); ctx.stroke();
    ctx.globalAlpha = 1;
    return c;
  }

  window.PomArt = {
    paint: paint, episodeArt: episodeArt, seasonArt: seasonArt, glassCard: glassCard, thumbSrc: thumbSrc,
    color: function (e) { var m = moodFor(e.season), R = rng(e.id); var c = m.sky[Math.floor(R() * 3)]; return hsl([c[0], Math.min(90, c[1] + 15), Math.max(55, c[2] + 5)]); },
    fontsReady: function () {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      return Promise.all([
        document.fonts.load("740 40px Inter"), document.fonts.load("400 20px Inter"), document.fonts.load("500 16px 'Fira Code'")
      ]).catch(function () {});
    }
  };
  window.POM = D;
})();
