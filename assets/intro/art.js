/*
  Pom Tales intro: hand-drawn felt and yarn art, built as SVG.
  Everything here is original drawing code for Pom Tales (no traced or copied artwork).
  Pup pictures come from assets/intro/pups/*.webp (swap those files for the final art).
*/
(function () {
  var PUPS = "assets/intro/pups/";

  // shared <defs>: patterns and gradients used by several drawings
  var defs =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      '<pattern id="knit" width="16" height="13" patternUnits="userSpaceOnUse">' +
        '<path d="M1.5 1.5 L8 11 L14.5 1.5" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M2.5 3.5 L8 12.5 L13.5 3.5" fill="none" stroke="rgba(90,40,70,.13)" stroke-width="1.6" stroke-linecap="round"/>' +
      '</pattern>' +
      '<pattern id="knitS" width="9" height="7.5" patternUnits="userSpaceOnUse">' +
        '<path d="M1 1 L4.5 6.5 L8 1" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.3" stroke-linecap="round"/>' +
        '<path d="M1.5 2.4 L4.5 7.2 L7.5 2.4" fill="none" stroke="rgba(90,40,70,.13)" stroke-width="1" stroke-linecap="round"/>' +
      '</pattern>' +
      '<pattern id="weave" width="10" height="10" patternUnits="userSpaceOnUse">' +
        '<path d="M0 5h10M5 0v10" stroke="rgba(255,255,255,.05)" stroke-width="1"/>' +
      '</pattern>' +
      '<pattern id="wicker" width="28" height="18" patternUnits="userSpaceOnUse">' +
        '<rect x="1" y="2" width="12" height="6" rx="3" fill="rgba(255,240,220,.28)"/>' +
        '<rect x="15" y="11" width="12" height="6" rx="3" fill="rgba(255,240,220,.28)"/>' +
        '<rect x="15" y="2" width="12" height="6" rx="3" fill="rgba(90,50,20,.14)"/>' +
        '<rect x="1" y="11" width="12" height="6" rx="3" fill="rgba(90,50,20,.14)"/>' +
      '</pattern>' +
      '<linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ecc897"/><stop offset=".5" stop-color="#c99461"/><stop offset="1" stop-color="#e6bd88"/>' +
      '</linearGradient>' +
      '<radialGradient id="envShade" cx="38%" cy="26%" r="78%">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset=".78" stop-color="#5a3060" stop-opacity=".05"/><stop offset="1" stop-color="#5a3060" stop-opacity=".32"/>' +
      '</radialGradient>' +
      '<radialGradient id="ballShade" cx="36%" cy="30%" r="75%">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#6a2848" stop-opacity=".35"/>' +
      '</radialGradient>' +
      '<radialGradient id="glow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="cloudShade" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#b9a9d9" stop-opacity=".45"/>' +
      '</linearGradient>' +
      '<symbol id="feltHeart" viewBox="0 0 120 110">' +
        '<path d="M60 104C20 76 4 52 4 32 4 14 18 4 33 4c13 0 22 8 27 18C65 12 74 4 87 4c15 0 29 10 29 28 0 20-16 44-56 72z" fill="currentColor"/>' +
        '<path d="M60 92C28 69 15 50 15 34c0-12 9-19 19-19 11 0 19 8 23 17l3 6 3-6c4-9 12-17 23-17 10 0 19 7 19 19 0 16-13 35-45 58z" fill="none" stroke="#fff" stroke-width="2.6" stroke-dasharray="6 6" stroke-linecap="round" opacity=".9"/>' +
        '<ellipse cx="36" cy="30" rx="12" ry="7" fill="#fff" opacity=".28" transform="rotate(-30 36 30)"/>' +
      '</symbol>' +
      '<symbol id="feltStar" viewBox="0 0 100 100">' +
        '<path d="M50 4 61 36 96 37 68 57 79 92 50 71 21 92 32 57 4 37 39 36z" fill="#ffe08a" stroke="#f0b64a" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M50 18 57 41 81 42 62 55 69 79 50 65 31 79 38 55 19 42 43 41z" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray="4 4" opacity=".85"/>' +
      '</symbol>' +
      '<symbol id="cloudShape" viewBox="0 0 400 220">' +
        '<path d="M60 196C18 196 6 164 22 140 4 118 20 82 54 84c0-36 40-56 72-40 16-30 72-38 98-10 24-24 78-18 90 18 40-4 72 28 60 62 26 18 20 82-20 82z" fill="#fdfbff"/>' +
        '<path d="M60 196C18 196 6 164 22 140 4 118 20 82 54 84c0-36 40-56 72-40 16-30 72-38 98-10 24-24 78-18 90 18 40-4 72 28 60 62 26 18 20 82-20 82z" fill="url(#cloudShade)"/>' +
        '<path d="M66 182c-30 0-40-22-28-40-12-16-2-42 26-40 2-28 34-44 60-30 14-24 58-30 80-8 20-18 60-12 70 14 32-2 56 22 46 48 20 14 14 56-16 56z" fill="none" stroke="#c7b6e6" stroke-width="1.3" stroke-dasharray="4 5" stroke-linecap="round"/>' +
      '</symbol>' +
    '</defs></svg>';

  /* ---------- the knitted hot-air balloon (1000 x 1860) ---------- */
  var bN = 0;
  function balloon() {
    var id = "b" + (++bN);
    var env = "M500 22C800 22 985 235 985 505c0 265-185 460-335 613l-38 87H388l-38-87C200 965 15 770 15 505 15 235 200 22 500 22z";
    var cols = ["#f6a5b8", "#fbc6a4", "#fde29c", "#bfe4c6", "#b6d9f1", "#d3c1f0"];
    var fs = [], i, n = 10;
    for (i = 0; i <= n; i++) fs.push(-1 + (2 * i) / n);
    function mer(f) { return [[500, 22], [500 + f * 650, 30], [500 + f * 590, 820], [500 + f * 112, 1205]]; }
    var gores = "", seams = "";
    for (i = 0; i < n; i++) {
      var a = mer(fs[i]), b = mer(fs[i + 1]);
      gores += '<path fill="' + cols[i % cols.length] + '" d="M' + a[0] + "C" + a[1] + " " + a[2] + " " + a[3] + "L" + b[3] + "C" + b[2] + " " + b[1] + " " + b[0] + 'z"/>';
      if (i > 0) seams += '<path d="M' + a[0] + "C" + a[1] + " " + a[2] + " " + a[3] + '"/>';
    }
    var ropes = [[400, 1272, 372, 1572], [452, 1272, 432, 1572], [548, 1272, 568, 1572], [600, 1272, 628, 1572]]
      .map(function (r) { return '<line x1="' + r[0] + '" y1="' + r[1] + '" x2="' + r[2] + '" y2="' + r[3] + '"/>'; }).join("");
    return '<svg viewBox="0 0 1000 1860" aria-hidden="true">' +
      '<defs><clipPath id="envClip' + id + '"><path d="' + env + '"/></clipPath>' +
      '<clipPath id="basketClip' + id + '"><rect x="0" y="0" width="1000" height="1585"/></clipPath></defs>' +
      // envelope
      '<g clip-path="url(#envClip' + id + ')">' + gores +
        '<rect width="1000" height="1210" fill="url(#knit)"/>' +
        '<g fill="none" stroke="rgba(255,255,255,.8)" stroke-width="3.4" stroke-dasharray="11 10" stroke-linecap="round">' + seams + '</g>' +
        '<path d="M15 470C250 520 750 520 985 470" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-dasharray="10 9"/>' +
        '<path d="M60 760C300 820 700 820 940 760" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-dasharray="10 9"/>' +
        '<rect width="1000" height="1210" fill="url(#envShade)"/>' +
      '</g>' +
      '<path d="' + env + '" fill="none" stroke="rgba(120,60,100,.35)" stroke-width="4"/>' +
      // heart patch
      '<use href="#feltHeart" x="400" y="540" width="200" height="184" style="color:#ef6f8f"/>' +
      // skirt (ribbed knit cuff)
      '<path d="M388 1205h224l-12 70H400z" fill="#f3a983"/>' +
      '<g stroke="rgba(120,50,30,.25)" stroke-width="3">' +
        [404, 424, 444, 464, 484, 504, 524, 544, 564, 584].map(function (x) { return '<line x1="' + (x + 4) + '" y1="1210" x2="' + (x + 6) + '" y2="1270"/>'; }).join("") +
      '</g>' +
      // flame
      '<circle cx="500" cy="1345" r="70" fill="url(#glow)"/>' +
      '<g class="flame"><path d="M500 1288c34 40 34 86 0 96-34-10-34-56 0-96z" fill="#ffae4a"/><path d="M500 1320c18 24 18 50 0 56-18-6-18-32 0-56z" fill="#ffe28a"/></g>' +
      '<rect x="468" y="1384" width="64" height="16" rx="6" fill="#9b8aa8"/>' +
      // ropes
      '<g stroke="#8d6b52" stroke-width="5" stroke-linecap="round">' + ropes + '</g>' +
      '<g stroke="#e9d3b8" stroke-width="2" stroke-dasharray="4 7" stroke-linecap="round">' + ropes + '</g>' +
      // pups peeking out of the basket
      '<g clip-path="url(#basketClip' + id + ')">' +
        '<image href="' + PUPS + 'ninja.webp" x="336" y="1430" width="176" height="340" preserveAspectRatio="xMidYMin meet"/>' +
        '<image href="' + PUPS + 'zivi.webp" x="500" y="1440" width="170" height="320" preserveAspectRatio="xMidYMin meet"/>' +
        '<image href="' + PUPS + 'wookie.webp" x="406" y="1462" width="190" height="250" preserveAspectRatio="xMidYMin meet"/>' +
      '</g>' +
      // basket
      '<path d="M340 1580h320l-15 210q-2 16-18 16H373q-16 0-18-16z" fill="#c9965f"/>' +
      '<path d="M340 1580h320l-15 210q-2 16-18 16H373q-16 0-18-16z" fill="url(#wicker)"/>' +
      '<rect x="326" y="1556" width="348" height="36" rx="18" fill="#a8743f"/>' +
      '<rect x="336" y="1566" width="328" height="16" rx="8" fill="none" stroke="#f1d8b5" stroke-width="2.4" stroke-dasharray="7 6"/>' +
      // sandbags
      '<g><line x1="352" y1="1592" x2="346" y2="1640" stroke="#8d6b52" stroke-width="3"/><ellipse cx="344" cy="1664" rx="22" ry="26" fill="#e8b4c5"/><path d="M330 1650q14 6 28 0" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="4 4"/></g>' +
      '<g><line x1="648" y1="1592" x2="654" y2="1640" stroke="#8d6b52" stroke-width="3"/><ellipse cx="656" cy="1664" rx="22" ry="26" fill="#b9dcf0"/><path d="M642 1650q14 6 28 0" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="4 4"/></g>' +
      '</svg>';
  }

  /* ---------- embroidery hoop with a stitched night sky ---------- */
  function hoop() {
    var stars = [[190, 190, 1], [262, 136, 0.7], [392, 162, 1.2], [446, 252, 0.8], [168, 312, 0.7], [236, 400, 1.1], [330, 446, 0.8], [420, 380, 1], [360, 300, 0.6], [140, 236, 0.5], [300, 210, 0.9], [470, 330, 0.6]];
    var xs = stars.map(function (s, k) {
      var r = 9 * s[2];
      return '<g class="st" style="animation-delay:' + (k * 0.37).toFixed(2) + 's" transform="translate(' + s[0] + " " + s[1] + ')">' +
        '<path d="M' + -r + " " + -r + "L" + r + " " + r + "M" + -r + " " + r + "L" + r + " " + -r + '"/></g>';
    }).join("");
    return '<svg viewBox="0 0 600 600" aria-hidden="true">' +
      '<defs><clipPath id="fabClip"><circle id="fabClipC" cx="300" cy="300" r="262"/></clipPath></defs>' +
      '<g clip-path="url(#fabClip)">' +
        '<circle cx="300" cy="300" r="264" fill="#27224f"/>' +
        '<circle cx="300" cy="300" r="264" fill="url(#weave)"/>' +
        '<circle cx="230" cy="190" r="190" fill="#3b326f" opacity=".45"/>' +
        '<path d="M416 150a58 58 0 1 0 38 98 48 48 0 1 1-38-98z" fill="#f7e2a6"/>' +
        '<path d="M414 162a46 46 0 1 0 28 76 38 38 0 1 1-28-76z" fill="none" stroke="#c9a85e" stroke-width="2" stroke-dasharray="5 5"/>' +
        '<g fill="none" stroke="#fbe7b0" stroke-width="3.2" stroke-linecap="round">' + xs + '</g>' +
        '<path d="M168 312 236 400 330 446 420 380 470 330" fill="none" stroke="#fbe7b0" stroke-opacity=".55" stroke-width="2.4" stroke-dasharray="6 8" stroke-linecap="round"/>' +
        '<path d="M190 190 262 136 300 210 392 162" fill="none" stroke="#fbe7b0" stroke-opacity=".55" stroke-width="2.4" stroke-dasharray="6 8" stroke-linecap="round"/>' +
      '</g>' +
      '<g class="ring">' +
        '<circle cx="300" cy="300" r="273" fill="none" stroke="url(#wood)" stroke-width="28"/>' +
        '<circle cx="300" cy="300" r="273" fill="none" stroke="#8b5e3a" stroke-width="1.2" stroke-dasharray="60 18 120 30 40 22" opacity=".35"/>' +
        '<circle cx="300" cy="300" r="266" fill="none" stroke="#a57447" stroke-width="1" stroke-dasharray="20 40 80 16" opacity=".35"/>' +
        '<circle cx="300" cy="300" r="287.5" fill="none" stroke="#8b5e3a" stroke-width="2.5"/>' +
        '<circle cx="300" cy="300" r="258.5" fill="none" stroke="#8b5e3a" stroke-width="2"/>' +
        '<circle cx="300" cy="300" r="254" fill="none" stroke="#e7c79c" stroke-width="6" opacity=".8"/>' +
        '<g transform="translate(300 16)">' +
          '<rect x="-30" y="-16" width="60" height="34" rx="7" fill="#d7a955" stroke="#8b6326" stroke-width="2.4"/>' +
          '<rect x="-12" y="-46" width="24" height="34" rx="5" fill="#e6bf72" stroke="#8b6326" stroke-width="2.4"/>' +
          '<path d="M-12-38h24M-12-30h24M-12-22h24" stroke="#8b6326" stroke-width="2"/>' +
          '<circle cx="0" cy="-52" r="9" fill="#e6bf72" stroke="#8b6326" stroke-width="2.4"/>' +
        '</g>' +
        // a loose pink thread with a needle
        '<path d="M520 470c30 20 54 60 40 96-10 26-46 30-58 8" fill="none" stroke="#ef8fa8" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M500 574l-46 36" stroke="#b9b4c4" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="502" cy="572" rx="3" ry="6" fill="#fff" transform="rotate(52 502 572)"/>' +
      '</g>' +
      '</svg>';
  }

  /* ---------- crib-mobile basket (front piece; the pup sits behind it) ---------- */
  function basketFront(body, rim) {
    return '<svg class="front" viewBox="0 0 200 170" aria-hidden="true">' +
      '<path d="M16 46h168l-16 112q-2 10-12 10H44q-10 0-12-10z" fill="' + body + '"/>' +
      '<path d="M16 46h168l-16 112q-2 10-12 10H44q-10 0-12-10z" fill="url(#knitS)"/>' +
      '<path d="M26 92h148M30 124h140" stroke="#fff" stroke-opacity=".75" stroke-width="2.2" stroke-dasharray="6 6" stroke-linecap="round"/>' +
      '<rect x="6" y="30" width="188" height="26" rx="13" fill="' + rim + '"/>' +
      '<rect x="14" y="38" width="172" height="10" rx="5" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2" stroke-dasharray="5 5"/>' +
      '<circle cx="100" cy="168" r="9" fill="' + rim + '"/>' +
      '</svg>';
  }

  /* ---------- felt cloud ---------- */
  function cloud() { return '<svg viewBox="0 0 400 220" aria-hidden="true"><use href="#cloudShape"/></svg>'; }

  /* ---------- felt TV (1000 x 900; screen hole at 100,260 600x520) ---------- */
  function tv() {
    var holes = "";
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) holes += '<circle cx="' + (785 + c * 26) + '" cy="' + (300 + r * 24) + '" r="6"/>';
    return '<svg viewBox="0 0 1000 900" aria-hidden="true">' +
      // antennas
      '<g stroke="#8a7898" stroke-width="9" stroke-linecap="round"><line x1="455" y1="160" x2="300" y2="34"/><line x1="545" y1="160" x2="716" y2="44"/></g>' +
      '<circle cx="300" cy="34" r="24" fill="#f4a8bd"/><circle cx="300" cy="34" r="16" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<circle cx="716" cy="44" r="24" fill="#a9dcc4"/><circle cx="716" cy="44" r="16" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<path d="M432 172a68 52 0 0 1 136 0z" fill="#f3b4c4"/>' +
      // legs
      '<rect x="140" y="800" width="54" height="74" rx="14" fill="#c86f7d"/><rect x="806" y="800" width="54" height="74" rx="14" fill="#c86f7d"/>' +
      // body with a screen-shaped hole
      '<path fill-rule="evenodd" fill="#ee8f80" d="M120 168h760q80 0 80 80v500q0 80-80 80H120q-80 0-80-80V248q0-80 80-80z M164 260h472q64 0 64 64v392q0 64-64 64H164q-64 0-64-64V324q0-64 64-64z"/>' +
      '<path fill-rule="evenodd" fill="url(#knit)" d="M120 168h760q80 0 80 80v500q0 80-80 80H120q-80 0-80-80V248q0-80 80-80z M164 260h472q64 0 64 64v392q0 64-64 64H164q-64 0-64-64V324q0-64 64-64z"/>' +
      '<rect x="58" y="186" width="884" height="624" rx="66" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="3" stroke-dasharray="10 9"/>' +
      // screen bezel
      '<rect x="100" y="260" width="600" height="520" rx="64" fill="none" stroke="#3a2f52" stroke-width="22"/>' +
      '<rect x="84" y="244" width="632" height="552" rx="78" fill="none" stroke="#f7c9b8" stroke-width="6"/>' +
      // side panel
      '<rect x="742" y="250" width="166" height="530" rx="34" fill="#f8dcbc"/>' +
      '<rect x="754" y="262" width="142" height="506" rx="26" fill="none" stroke="#d6a77a" stroke-width="2.2" stroke-dasharray="7 6"/>' +
      '<g fill="#c99a75">' + holes + '</g>' +
      '<g transform="translate(825 520)"><circle r="42" fill="#7cc4b4"/><circle r="30" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="5 5"/><rect x="-5" y="-40" width="10" height="34" rx="5" fill="#3d6f66"/></g>' +
      '<g transform="translate(825 650)"><circle r="42" fill="#f4a8bd"/><circle r="30" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="5 5"/><rect x="-5" y="-40" width="10" height="34" rx="5" fill="#a24a66" transform="rotate(50)"/></g>' +
      '<circle cx="825" cy="728" r="7" fill="#e2504f"/>' +
      '<text x="118" y="826" font-family="Fraunces, Georgia, serif" font-size="30" font-weight="600" letter-spacing="4" fill="#fff" opacity=".9">POM TV</text>' +
      '</svg>';
  }

  /* ---------- felt hills ---------- */
  function hills() {
    var tufts = "";
    var pts = [[120, 520], [260, 548], [420, 510], [640, 540], [880, 530], [1040, 556], [1260, 520], [1460, 548], [330, 580], [760, 575], [1150, 580]];
    pts.forEach(function (p) { tufts += '<path d="M' + p[0] + " " + p[1] + "l6-14 4 12 5-16 4 18" + '"/>'; });
    var flowers = [[220, 470, "#f4a8bd"], [520, 500, "#fde29c"], [980, 488, "#d3c1f0"], [1340, 470, "#f4a8bd"], [700, 455, "#b6d9f1"]].map(function (f) {
      return '<g transform="translate(' + f[0] + " " + f[1] + ')"><circle r="9" cx="0" cy="-10" fill="' + f[2] + '"/><circle r="9" cx="10" cy="0" fill="' + f[2] + '"/><circle r="9" cx="0" cy="10" fill="' + f[2] + '"/><circle r="9" cx="-10" cy="0" fill="' + f[2] + '"/><circle r="6" fill="#fff6d6"/></g>';
    }).join("");
    return '<svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<path d="M0 300c200-80 380-120 600-60s400-70 640-50c180 15 280 60 360 50v360H0z" fill="#f6cdd6"/>' +
      '<path d="M0 316c200-80 380-120 600-60s400-70 640-50c180 15 280 60 360 50" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 9" opacity=".8"/>' +
      '<path d="M0 400c260-70 520-100 760-50s440-30 840-20v270H0z" fill="#cdbbea"/>' +
      '<path d="M0 416c260-70 520-100 760-50s440-30 840-20" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 9" opacity=".8"/>' +
      '<path d="M0 480c300-60 600-50 820-10s480-30 780-20v150H0z" fill="#a8dbbe"/>' +
      '<path d="M0 480c300-60 600-50 820-10s480-30 780-20v150H0z" fill="url(#knit)"/>' +
      '<path d="M0 496c300-60 600-50 820-10s480-30 780-20" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 9" opacity=".85"/>' +
      '<g fill="none" stroke="#6fb592" stroke-width="3" stroke-linecap="round">' + tufts + '</g>' + flowers +
      '</svg>';
  }

  /* ---------- small ink sketches for the newspapers ---------- */
  function sketchBalloon() {
    return '<svg class="sketch" viewBox="0 0 170 230" aria-hidden="true">' +
      '<path d="M85 10c45 0 73 30 73 70 0 38-28 66-52 88l-6 12H70l-6-12C40 146 12 118 12 80c0-40 28-70 73-70z"/>' +
      '<path d="M85 10c24 4 32 110 12 170M85 10c-24 4-32 110-12 170M85 10c50 10 60 100 21 158M85 10c-50 10-60 100-21 158"/>' +
      '<path d="M136 52l10 8M140 66l12 8M142 82l12 6M140 98l12 6M134 114l12 4M126 128l10 4"/>' +
      '<path d="M70 180l-3 22M100 180l3 22"/><path d="M64 202h42l-4 18H68z"/><path d="M68 208h34"/>' +
      '<path d="M2 222c4-10 18-12 24-4 4-12 24-12 28 0 6-4 16-2 18 6"/>' +
      '<path d="M110 226c3-8 14-9 18-3 3-8 18-8 20 1 5-3 12-1 13 4"/>' +
      '</svg>';
  }
  function sketchYarn() {
    return '<svg class="sketch" viewBox="0 0 150 150" aria-hidden="true">' +
      '<circle cx="75" cy="78" r="38"/>' +
      '<path d="M42 62c18-16 46-18 68-2M38 78c20-18 54-18 74 4M42 96c20-16 46-14 64 6M60 42c-12 20-10 52 6 72M80 40c-12 22-10 52 8 74"/>' +
      '<path d="M20 30l96 92M128 26L40 128"/><circle cx="20" cy="30" r="4"/><circle cx="128" cy="26" r="4"/>' +
      '<path d="M111 100c20 10 32 26 18 34-14 8-40-6-58 4-12 6-6 14 4 12"/>' +
      '<path d="M18 120l4 4M22 116l-4 12M132 60l3 3M135 57l-6 9"/>' +
      '</svg>';
  }

  window.PomArt = {
    defs: defs, balloon: balloon, hoop: hoop, basketFront: basketFront, cloud: cloud, tv: tv, hills: hills,
    sketchBalloon: sketchBalloon, sketchYarn: sketchYarn
  };
})();
