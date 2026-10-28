/*
  The episode wall: an endless grid of glass episode cards you drag or
  scroll through, seen through a curved lens (bulge, colour fringing and
  vignette). Cards are drawn into an offscreen buffer, then a lens pass
  bends that buffer onto the screen.
*/
(function () {
  var VS_CARD = [
    "attribute vec2 aPos;",
    "uniform vec2 uView; uniform vec4 uRect; uniform vec4 uUv;",
    "varying vec2 vUv;",
    "void main(){",
    "  vec2 p = uRect.xy + aPos * uRect.zw;",
    "  vUv = uUv.xy + aPos * uUv.zw;",
    "  gl_Position = vec4(p / uView * 2.0 - 1.0, 0.0, 1.0); gl_Position.y *= -1.0;",
    "}"
  ].join("\n");
  var FS_CARD = [
    "precision mediump float;",
    "uniform sampler2D uTex; uniform float uAlpha; uniform float uLift;",
    "varying vec2 vUv;",
    "void main(){",
    "  vec4 c = texture2D(uTex, vUv);",
    "  c.rgb *= 0.86 + 0.14 * uLift;",
    "  gl_FragColor = c * uAlpha;",
    "}"
  ].join("\n");
  var VS_POST = [
    "attribute vec2 aPos; varying vec2 vUv;",
    "void main(){ vUv = aPos; gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0); }"
  ].join("\n");
  var FS_POST = [
    "precision mediump float;",
    "uniform sampler2D uScene; uniform float uAspect; uniform float uK; uniform float uSpan; uniform vec3 uBg; uniform float uCa;",
    "varying vec2 vUv;",
    "vec2 lens(vec2 uv, float k){",
    "  vec2 d = (uv - 0.5) * 2.0 * vec2(uAspect, 1.0);",
    "  float r2 = dot(d, d);",
    "  d *= mix(1.0, 0.84 + 0.085 * r2, k);",
    "  vec2 s = d / vec2(uAspect, 1.0) * 0.5;",
    "  return s / uSpan + 0.5;",
    "}",
    "vec4 tap(vec2 uv){",
    "  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);",
    "  return texture2D(uScene, uv);",
    "}",
    "void main(){",
    "  vec2 q = (vUv - 0.5) * 2.0;",
    "  float r2 = dot(q * vec2(uAspect, 1.0), q * vec2(uAspect, 1.0));",
    "  float ca = uCa * uK * (0.2 + r2);",
    "  vec4 cr = tap(lens(vUv + q * ca, uK));",
    "  vec4 cg = tap(lens(vUv, uK));",
    "  vec4 cb = tap(lens(vUv - q * ca, uK));",
    "  vec4 c = vec4(cr.r, cg.g, cb.b, max(cr.a, max(cg.a, cb.a)));",
    "  vec3 col = mix(uBg, c.rgb / max(c.a, 0.0001), c.a);",
    "  float v = smoothstep(0.55, 1.55, length(q * vec2(1.0, 1.05)));",
    "  col = mix(col, uBg, v * 0.9 * uK);",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function Wall(canvas, episodes, opts) {
    this.canvas = canvas;
    this.eps = episodes;
    this.opts = opts || {};
    this.cam = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 };
    this.cells = {};
    this.hover = null;
    this.zoom = null;
    this.k = 1;
    this.started = 0;
    this.running = false;
    this.bg = [0, 0, 0];
    this.gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: false });
    if (!this.gl) this.ctx2d = canvas.getContext("2d");
  }

  Wall.prototype.build = function (cardCanvases) {
    var n = cardCanvases.length;
    var cw = cardCanvases[0].width, ch = cardCanvases[0].height;
    var cols = Math.min(4, n), rows = Math.ceil(n / cols);
    var atlas = document.createElement("canvas");
    atlas.width = cols * cw; atlas.height = rows * ch;
    var a = atlas.getContext("2d");
    this.uv = cardCanvases.map(function (c, i) {
      var x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
      a.drawImage(c, x, y);
      return [x / atlas.width, y / atlas.height, cw / atlas.width, ch / atlas.height];
    });
    this.atlas = atlas;
    this.cardRatio = ch / cw;
    // repeating tile of the grid: 4 wide, enough rows to hold every episode
    this.tileCols = n >= 4 ? 4 : n;
    this.tileRows = Math.ceil(n / this.tileCols);
    if (this.gl) this.initGL();
    this.resize();
  };

  Wall.prototype.initGL = function () {
    var gl = this.gl;
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    function prog(vs, fs) {
      var p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      var u = {}, cnt = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < cnt; i++) { var nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
      return { p: p, u: u, a: gl.getAttribLocation(p, "aPos") };
    }
    this.card = prog(VS_CARD, FS_CARD);
    this.post = prog(VS_POST, FS_POST);
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.atlas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.fbo = gl.createFramebuffer();
    this.fboTex = gl.createTexture();
  };

  Wall.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.W = w; this.H = h; this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    var cw = w < 720 ? w * 0.74 : Math.max(280, Math.min(560, w * 0.3));
    this.cw = cw; this.ch = cw * (this.cardRatio || 0.58);
    this.gap = cw * 0.055;
    // the lens squeezes the edges, so the buffer covers a bit more than the screen
    this.span = 1.16;
    if (this.gl) {
      var gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.fboTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas.width, this.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.fboTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  };

  // Screen point -> point in the (flat) card buffer, mirroring the lens shader
  Wall.prototype.unlens = function (sx, sy) {
    if (!this.gl) return [sx, sy];
    var asp = this.W / this.H, k = this.k;
    var dx = (sx / this.W - 0.5) * 2 * asp, dy = (sy / this.H - 0.5) * 2;
    var f = 1 + (0.84 + 0.085 * (dx * dx + dy * dy) - 1) * k;
    dx *= f; dy *= f;
    var ux = dx / asp * 0.5 / this.span + 0.5, uy = dy * 0.5 / this.span + 0.5;
    return [ux * this.W, uy * this.H];
  };

  Wall.prototype.indexAt = function (col, row) {
    var tc = this.tileCols, tr = this.tileRows;
    var c = ((col % tc) + tc) % tc, r = ((row % tr) + tr) % tr;
    // shift each repeat of the tile so neighbours vary
    var shift = Math.floor(row / tr) * 2 + Math.floor(col / tc);
    return (((c + r * tc + shift) % this.eps.length) + this.eps.length) % this.eps.length;
  };

  Wall.prototype.layout = function (now) {
    var px = this.cw + this.gap, py = this.ch + this.gap;
    var cam = this.cam;
    // the buffer's top-left in world space
    var vw = this.W, vh = this.H;
    var left = cam.x - vw / 2, top = cam.y - vh / 2;
    var c0 = Math.floor(left / px) - 1, c1 = Math.ceil((left + vw) / px) + 1;
    var r0 = Math.floor(top / py) - 1, r1 = Math.ceil((top + vh) / py) + 1;
    var out = [], self = this;
    var t = (now - this.started) / 1000;
    for (var r = r0; r <= r1; r++) {
      for (var c = c0; c <= c1; c++) {
        var key = c + "," + r;
        var cell = self.cells[key] || (self.cells[key] = { lift: 0 });
        var hovered = self.hover === key;
        cell.lift += ((hovered ? 1 : 0) - cell.lift) * 0.14;
        var x = c * px - px / 2 + self.gap / 2 - left, y = r * py - py / 2 + self.gap / 2 - top;
        // intro: rows rise in from the centre outwards
        var ring = Math.max(Math.abs(c), Math.abs(r));
        var p = self.opts.reduced ? 1 : Math.max(0, Math.min(1, (t - ring * 0.12) / 0.9));
        var e = 1 - Math.pow(1 - p, 4);
        var s = (0.72 + 0.28 * e) * (1 + 0.075 * cell.lift);
        var w = self.cw * s, h = self.ch * s;
        out.push({
          key: key, i: self.indexAt(c, r), alpha: e, lift: cell.lift,
          x: x + (self.cw - w) / 2, y: y + (self.ch - h) / 2 + (1 - e) * 80, w: w, h: h
        });
      }
    }
    // hovered card on top
    out.sort(function (a, b) { return a.lift - b.lift; });
    return out;
  };

  Wall.prototype.frame = function (now) {
    var cam = this.cam;
    if (!this.dragging) {
      cam.tx += cam.vx; cam.ty += cam.vy;
      cam.vx *= 0.92; cam.vy *= 0.92;
    }
    cam.x += (cam.tx - cam.x) * 0.12;
    cam.y += (cam.ty - cam.y) * 0.12;

    var cards = this.layout(now);
    if (this.zoom) {
      var z = this.zoom, p = Math.min(1, (now - z.t0) / 900), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var from = z.from, cover = Math.max(this.W / from.w, this.H / from.h) * 1.02;
      var tw = from.w * cover, th = from.h * cover;
      cards.forEach(function (cd) { if (cd.key !== z.key) cd.alpha *= 1 - e; });
      var zc = cards.filter(function (cd) { return cd.key === z.key; })[0];
      if (zc) {
        zc.w = from.w + (tw - from.w) * e; zc.h = from.h + (th - from.h) * e;
        zc.x = from.x + ((this.W - tw) / 2 - from.x) * e; zc.y = from.y + ((this.H - th) / 2 - from.y) * e;
        cards.splice(cards.indexOf(zc), 1); cards.push(zc);
      }
      this.k = 1 - e;
      if (p >= 1 && !z.done) { z.done = true; z.cb(); }
    }
    this.last = cards;
    if (this.gl) this.drawGL(cards); else this.draw2D(cards);
  };

  Wall.prototype.drawGL = function (cards) {
    var gl = this.gl, self = this;
    var sw = this.canvas.width, sh = this.canvas.height, sc = this.dpr / this.span;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, sw, sh);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.card.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(this.card.a);
    gl.vertexAttribPointer(this.card.a, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.card.u.uTex, 0);
    gl.uniform2f(this.card.u.uView, sw, sh);
    // the buffer spans `span` times the screen around its centre
    var ox = sw / 2 - (this.W / 2) * sc, oy = sh / 2 - (this.H / 2) * sc;
    cards.forEach(function (c) {
      if (c.alpha <= 0.002) return;
      var uv = self.uv[c.i];
      gl.uniform4f(self.card.u.uRect, ox + c.x * sc, oy + c.y * sc, c.w * sc, c.h * sc);
      gl.uniform4f(self.card.u.uUv, uv[0], uv[1], uv[2], uv[3]);
      gl.uniform1f(self.card.u.uAlpha, c.alpha);
      gl.uniform1f(self.card.u.uLift, self.hover ? (c.lift > 0.01 ? 1 : 0.55) : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, sw, sh);
    gl.disable(gl.BLEND);
    gl.useProgram(this.post.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(this.post.a);
    gl.vertexAttribPointer(this.post.a, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.fboTex);
    gl.uniform1i(this.post.u.uScene, 0);
    gl.uniform1f(this.post.u.uAspect, this.W / this.H);
    gl.uniform1f(this.post.u.uK, this.opts.reduced ? 0.6 * this.k : this.k);
    gl.uniform1f(this.post.u.uSpan, this.span);
    gl.uniform1f(this.post.u.uCa, 0.0022);
    gl.uniform3f(this.post.u.uBg, this.bg[0], this.bg[1], this.bg[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  // Fallback without WebGL: flat cards, same layout
  Wall.prototype.draw2D = function (cards) {
    var ctx = this.ctx2d, self = this, d = this.dpr;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = "rgb(" + this.bg.map(function (v) { return Math.round(v * 255); }).join(",") + ")";
    ctx.fillRect(0, 0, this.W, this.H);
    var sc = 1 / this.span, ox = this.W / 2 * (1 - sc), oy = this.H / 2 * (1 - sc);
    cards.forEach(function (c) {
      var uv = self.uv[c.i], A = self.atlas;
      ctx.globalAlpha = c.alpha;
      ctx.drawImage(A, uv[0] * A.width, uv[1] * A.height, uv[2] * A.width, uv[3] * A.height, ox + c.x * sc, oy + c.y * sc, c.w * sc, c.h * sc);
    });
    ctx.globalAlpha = 1;
  };

  Wall.prototype.pick = function (sx, sy) {
    if (!this.last) return null;
    var p = this.unlens(sx, sy);
    var sc = this.gl ? 1 / this.span : 1 / this.span;
    var ox = this.W / 2 * (1 - sc), oy = this.H / 2 * (1 - sc);
    for (var i = this.last.length - 1; i >= 0; i--) {
      var c = this.last[i];
      var x = ox + c.x * sc, y = oy + c.y * sc, w = c.w * sc, h = c.h * sc;
      if (p[0] >= x && p[0] <= x + w && p[1] >= y && p[1] <= y + h && c.alpha > 0.5) return c;
    }
    return null;
  };

  Wall.prototype.bind = function () {
    var self = this, el = this.canvas, cam = this.cam;
    var down = null, moved = 0, lastT = 0;
    el.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (self.zoom) return;
      var dx = e.deltaX, dy = e.deltaY;
      if (e.deltaMode === 1) { dx *= 30; dy *= 30; }
      if (e.shiftKey && !dx) { dx = dy; dy = 0; }
      cam.tx += dx * 0.9; cam.ty += dy * 0.9;
    }, { passive: false });
    el.addEventListener("pointerdown", function (e) {
      if (self.zoom) return;
      down = { x: e.clientX, y: e.clientY, tx: cam.tx, ty: cam.ty };
      moved = 0; lastT = performance.now();
      self.dragging = true; cam.vx = cam.vy = 0;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (down) {
        var dx = e.clientX - down.x, dy = e.clientY - down.y;
        moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
        var ntx = down.tx - dx * 1.15, nty = down.ty - dy * 1.15;
        var now = performance.now(), dt = Math.max(8, now - lastT);
        cam.vx = (ntx - cam.tx) / dt * 16; cam.vy = (nty - cam.ty) / dt * 16;
        lastT = now;
        cam.tx = ntx; cam.ty = nty;
        if (moved > 6) self.hover = null;
      } else {
        var c = self.pick(e.clientX, e.clientY);
        self.hover = c ? c.key : null;
        el.style.cursor = c ? "pointer" : "grab";
      }
    });
    var up = function (e) {
      if (!down) return;
      self.dragging = false;
      el.classList.remove("is-dragging");
      if (performance.now() - lastT > 80) { cam.vx = cam.vy = 0; }
      if (moved < 6 && e.type === "pointerup") {
        var c = self.pick(e.clientX, e.clientY);
        if (c) self.open(c);
      }
      down = null;
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", function () { if (!down) self.hover = null; });
    window.addEventListener("resize", function () { self.resize(); });
  };

  Wall.prototype.open = function (c) {
    var self = this, ep = this.eps[c.i];
    this.hover = c.key;
    this.zoom = { key: c.key, t0: performance.now(), from: { x: c.x, y: c.y, w: c.w, h: c.h }, cb: function () {
      if (self.opts.onOpen) self.opts.onOpen(ep);
    } };
  };

  Wall.prototype.start = function () {
    var self = this;
    if (!this.started) this.started = performance.now();
    if (this.running) return;
    this.running = true;
    (function loop(now) {
      if (!self.running) return;
      self.frame(now);
      requestAnimationFrame(loop);
    })(performance.now());
  };
  Wall.prototype.stop = function () { this.running = false; };
  Wall.prototype.reset = function () { this.zoom = null; this.k = 1; this.hover = null; };

  window.PomWall = Wall;
})();
