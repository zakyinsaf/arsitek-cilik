/* ======================================
   GAME ENGINE — Logika, Render, Skor
   ====================================== */
const GameEngine = (() => {

  /* --- State --- */
  let state = {
    currentWorld: 0,
    currentLevel: 0,
    score: 0,
    attempts: 0,
    hintsUsed: 0,
    maxScore: 100,
    // Boss state
    bossQuestionIndex: 0,
    bossLives: 3,
    bossCorrect: 0,
    // Puzzle state
    puzzleMatches: {},
    // Slider state
    sliderValue: 1,
    // Formula Sort state
    formulaSortOrder: [],
    // Deep Learning state
    reasoningPassed: false,
    hintLevel: 0,
    // Debounce
    submitLocked: false
  };

  let progress = []; // [world][level] = { stars, score, completed }
  let totalScore = 0;

  /* --- Inisialisasi Progress --- */
  function initProgress() {
    progress = [];
    for (let w = 0; w < 5; w++) {
      progress[w] = [];
      for (let l = 0; l < 5; l++) {
        progress[w][l] = { stars: 0, score: 0, completed: false };
      }
    }
    totalScore = 0;
  }

  /* --- Save / Load (localStorage + try/catch) --- */
  function saveGame() {
    try {
      const data = {
        progress: progress,
        totalScore: totalScore,
        soundOn: GameAudio.isOn()
      };
      localStorage.setItem('arsitekCilik_save_v2', JSON.stringify(data));
    } catch (e) { /* silently fail */ }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('arsitekCilik_save_v2');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.progress && data.progress.length === 5) {
          progress = data.progress;
          totalScore = data.totalScore || 0;
          GameAudio.setSoundOn(data.soundOn !== false);
          return true;
        }
      }
    } catch (e) { /* silently fail */ }
    initProgress();
    return false;
  }

  /* --- Sistem Penilaian Berbasis Bintang (Pure Star System - Tanpa Skor 100) --- */
  function calcLevelStars(attempts = state.attempts, hintsCount = state.hintsUsed) {
    // 3 Bintang: Percobaan ke-1 tanpa bantuan atau maksimal 1 petunjuk konsep
    if (attempts === 0 && hintsCount <= 1) return 3;
    // 2 Bintang: Percobaan ke-2 atau menggunakan 2 petunjuk
    if (attempts <= 1 && hintsCount <= 2) return 2;
    // 1 Bintang: Percobaan ke-3+ atau menggunakan panduan langkah
    return 1;
  }

  function calcBossStars(correct = state.bossCorrect, lives = state.bossLives) {
    if (correct === 3 && lives === 3) return 3;
    if (correct === 3 && lives >= 1) return 2;
    if (lives > 0) return 1;
    return 0;
  }

  // Live Star Indicator berdasarkan jumlah percobaan & bantuan yang dibuka
  function getLiveStars(attempts = state.attempts, hintsCount = state.hintsUsed) {
    if (attempts === 0 && hintsCount <= 1) return 3;
    if (attempts <= 1 && hintsCount <= 2) return 2;
    return 1;
  }

  function getTotalStars() {
    let total = 0;
    for (let w = 0; w < 5; w++) {
      for (let l = 0; l < 5; l++) {
        total += progress[w][l].stars || 0;
      }
    }
    return total;
  }

  function getTotalCompleted() {
    let done = 0;
    for (let w = 0; w < 5; w++) {
      for (let l = 0; l < 5; l++) {
        if (progress[w][l].completed) done++;
      }
    }
    return done;
  }

  /* --- Validasi Input --- */
  function validateInput(raw) {
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      return { valid: false, error: 'Masukkan angka dulu!' };
    }
    let str = String(raw).trim().replace(',', '.');
    const num = parseFloat(str);
    if (isNaN(num)) {
      return { valid: false, error: 'Masukkan angka yang valid!' };
    }
    if (num < 0) {
      return { valid: false, error: 'Ukuran tidak boleh negatif!' };
    }
    return { valid: true, value: num };
  }

  function checkAnswer(input, answer) {
    return Math.abs(input - answer) <= 0.01;
  }

  /* --- Debounce Submit --- */
  function lockSubmit() {
    state.submitLocked = true;
    setTimeout(() => { state.submitLocked = false; }, 400);
  }
  function isSubmitLocked() {
    return state.submitLocked;
  }

  /* --- Level Management --- */
  function isLevelUnlocked(w, l) {
    return true; // Semua level tidak dikunci agar bisa langsung diakses
  }

  function isWorldUnlocked(w) {
    return true; // Semua dunia tidak dikunci agar bisa langsung diakses
  }

  function getWorldProgress(w) {
    let done = 0;
    for (let l = 0; l < 5; l++) {
      if (progress[w][l].completed) done++;
    }
    return done;
  }

  function getLevelData(w, l) {
    return GAME_DATA.levels[w * 5 + l];
  }

  function completeLevel(w, l, stars = 1) {
    if (stars > progress[w][l].stars) {
      progress[w][l].stars = stars;
    }
    progress[w][l].completed = true;
    saveGame();
    return { stars, totalStars: getTotalStars(), totalCompleted: getTotalCompleted() };
  }

  /* --- SVG Renderers --- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const COLORS = {
    fill: '#E8F8F0',
    stroke: '#1B6B4A',
    accent: '#E8A838',
    dim: '#D94F3B',
    label: '#2C2C2C',
    grid: '#ccc',
    highlight: 'rgba(27,107,74,0.15)',
    dimFill: 'rgba(217,79,59,0.12)',
    purple: '#9B59B6',
    blue: '#2980B9'
  };

  function svgWrap(inner, vw = 400, vh = 300) {
    return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="${SVG_NS}">${inner}</svg>`;
  }

  function svgText(x, y, text, size = 14, color = COLORS.label, anchor = 'middle', bold = false) {
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-weight="${bold ? 700 : 400}" font-family="system-ui, sans-serif">${text}</text>`;
  }

  function svgDashedLine(x1, y1, x2, y2, color = COLORS.dim) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" stroke-dasharray="6,4"/>`;
  }

  // --- Persegi ---
  function renderSquare(side, cx = 200, cy = 150, maxSize = 200) {
    const scale = Math.min(maxSize / 12, maxSize / side);
    const s = side * scale;
    const x = cx - s / 2, y = cy - s / 2;
    let svg = '';
    svg += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5" rx="2"/>`;
    // Label sisi bawah
    svg += svgText(cx, y + s + 20, `s = ${side}`, 14, COLORS.stroke, 'middle', true);
    // Tanda siku
    const sq = 12;
    svg += `<polyline points="${x + sq},${y} ${x + sq},${y + sq} ${x},${y + sq}" fill="none" stroke="${COLORS.stroke}" stroke-width="1.5"/>`;
    return svg;
  }

  // --- Persegi Panjang ---
  function renderRectangle(w, h, labels = {}, showPerimeter = false, showGrid = false) {
    const maxW = 300, maxH = 180;
    const scaleX = maxW / w, scaleY = maxH / h;
    const scale = Math.min(scaleX, scaleY) * 0.8;
    const rw = w * scale, rh = h * scale;
    const x = 200 - rw / 2, y = 150 - rh / 2;
    let svg = '';
    svg += `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5" rx="2"/>`;
    if (showGrid) {
      const cellW = rw / w, cellH = rh / h;
      for (let i = 1; i < w; i++) svg += `<line x1="${x + i * cellW}" y1="${y}" x2="${x + i * cellW}" y2="${y + rh}" stroke="${COLORS.grid}" stroke-width="0.5"/>`;
      for (let i = 1; i < h; i++) svg += `<line x1="${x}" y1="${y + i * cellH}" x2="${x + rw}" y2="${y + i * cellH}" stroke="${COLORS.grid}" stroke-width="0.5"/>`;
    }
    if (showPerimeter) {
      svg += `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="none" stroke="${COLORS.accent}" stroke-width="4" rx="2" stroke-dasharray="8,4"/>`;
    }
    // Label p (bawah)
    svg += svgText(200, y + rh + 22, labels.p || `${w}`, 14, COLORS.stroke, 'middle', true);
    // Label l (kanan)
    svg += `<text x="${x + rw + 12}" y="${150}" text-anchor="start" fill="${COLORS.stroke}" font-size="14" font-weight="700" font-family="system-ui">${labels.l || h}</text>`;
    // Tanda siku
    const sq = 10;
    svg += `<polyline points="${x + sq},${y} ${x + sq},${y + sq} ${x},${y + sq}" fill="none" stroke="${COLORS.stroke}" stroke-width="1.5"/>`;
    return svg;
  }

  // --- Segitiga ---
  function renderTriangle(base, height, cx = 200, cy = 150) {
    const maxW = 280, maxH = 180;
    const scale = Math.min(maxW / base, maxH / height) * 0.75;
    const bw = base * scale, bh = height * scale;
    const x1 = cx - bw / 2, y1 = cy + bh / 2;       // kiri bawah
    const x2 = cx + bw / 2, y2 = cy + bh / 2;       // kanan bawah
    const x3 = cx, y3 = cy - bh / 2;                  // puncak
    let svg = '';
    svg += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5"/>`;
    // Garis tinggi
    svg += svgDashedLine(x3, y3, x3, y1, COLORS.dim);
    // Label alas
    svg += svgText(cx, y1 + 20, `a = ${base}`, 13, COLORS.stroke, 'middle', true);
    // Label tinggi
    svg += svgText(x3 + 18, cy, `t = ${height}`, 13, COLORS.dim, 'start', true);
    // Tanda siku pada tinggi
    const sq = 8;
    svg += `<polyline points="${x3 + sq},${y1} ${x3 + sq},${y1 - sq} ${x3},${y1 - sq}" fill="none" stroke="${COLORS.dim}" stroke-width="1"/>`;
    return svg;
  }

  // --- Segitiga Siku-siku (Pythagoras) ---
  function renderRightTriangle(params) {
    const { a, b, c, unknown, labels } = params;
    const maxW = 260, maxH = 200;
    const scaleX = maxW / b, scaleY = maxH / a;
    const scale = Math.min(scaleX, scaleY) * 0.7;
    const tw = b * scale, th = a * scale;
    // siku-siku di kiri bawah
    const x1 = 140, y1 = 240;           // kiri bawah (sudut siku-siku)
    const x2 = x1 + tw, y2 = y1;        // kanan bawah
    const x3 = x1, y3 = y1 - th;        // kiri atas
    let svg = '';
    svg += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5"/>`;
    // Tanda siku-siku
    const sq = 12;
    svg += `<polyline points="${x1 + sq},${y1} ${x1 + sq},${y1 - sq} ${x1},${y1 - sq}" fill="none" stroke="${COLORS.stroke}" stroke-width="1.5"/>`;
    // Label sisi a (vertikal, kiri)
    const la = labels.a || a;
    svg += svgText(x1 - 18, (y1 + y3) / 2, `a = ${la}`, 13, unknown === 'a' ? COLORS.dim : COLORS.stroke, 'end', true);
    // Label sisi b (horizontal, bawah)
    const lb = labels.b || b;
    svg += svgText((x1 + x2) / 2, y1 + 22, `b = ${lb}`, 13, unknown === 'b' ? COLORS.dim : COLORS.stroke, 'middle', true);
    // Label sisi c (hipotenusa)
    const lc = labels.c || c;
    const mx = (x2 + x3) / 2 + 14, my = (y2 + y3) / 2;
    svg += svgText(mx, my, `c = ${lc}`, 13, unknown === 'c' ? COLORS.dim : COLORS.stroke, 'start', true);
    return svg;
  }

  // --- Trapesium ---
  function renderTrapezoid(topSide, bottomSide, height, labels = {}) {
    const maxW = 300, maxH = 180;
    const scale = Math.min(maxW / bottomSide, maxH / height) * 0.7;
    const bw = bottomSide * scale, tw = topSide * scale, h = height * scale;
    const cx = 200, cy = 150;
    const bx = cx - bw / 2, by = cy + h / 2;
    const tx = cx - tw / 2, ty = cy - h / 2;
    let svg = '';
    svg += `<polygon points="${bx},${by} ${bx + bw},${by} ${tx + tw},${ty} ${tx},${ty}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5"/>`;
    // Garis tinggi
    svg += svgDashedLine(tx + tw / 2, ty, tx + tw / 2, by, COLORS.dim);
    // Tanda siku
    const sq = 8;
    svg += `<polyline points="${tx + tw / 2 + sq},${by} ${tx + tw / 2 + sq},${by - sq} ${tx + tw / 2},${by - sq}" fill="none" stroke="${COLORS.dim}" stroke-width="1"/>`;
    // Labels
    svg += svgText(cx, ty - 10, labels.a || `${topSide}`, 13, COLORS.stroke, 'middle', true);
    svg += svgText(cx, by + 20, labels.b || `${bottomSide}`, 13, COLORS.stroke, 'middle', true);
    svg += svgText(tx + tw / 2 + 20, cy, labels.t || `t = ${height}`, 13, COLORS.dim, 'start', true);
    return svg;
  }

  // --- Jajargenjang ---
  function renderParallelogram(base, height, cx = 200, cy = 150) {
    const maxW = 300, maxH = 180;
    const scale = Math.min(maxW / (base + 3), maxH / height) * 0.7;
    const bw = base * scale, h = height * scale;
    const offset = h * 0.4;
    const x1 = cx - bw / 2, y1 = cy + h / 2;               // kiri bawah
    const x2 = cx + bw / 2, y2 = cy + h / 2;               // kanan bawah
    const x3 = cx + bw / 2 + offset, y3 = cy - h / 2;      // kanan atas
    const x4 = cx - bw / 2 + offset, y4 = cy - h / 2;      // kiri atas
    let svg = '';
    svg += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5"/>`;
    // Garis tinggi
    svg += svgDashedLine(x4, y4, x4 - offset, y1, COLORS.dim);
    const sq = 8;
    svg += `<polyline points="${x4 - offset + sq},${y1} ${x4 - offset + sq},${y1 - sq} ${x4 - offset},${y1 - sq}" fill="none" stroke="${COLORS.dim}" stroke-width="1"/>`;
    // Labels
    svg += svgText(cx, y1 + 20, `a = ${base}`, 13, COLORS.stroke, 'middle', true);
    svg += svgText(x4 - offset - 10, cy, `t = ${height}`, 13, COLORS.dim, 'end', true);
    return svg;
  }

  // --- Belah Ketupat ---
  function renderRhombus(d1, d2, labels = {}) {
    const maxD = 240;
    const scale = maxD / Math.max(d1, d2) * 0.7;
    const dw = d1 * scale / 2, dh = d2 * scale / 2;
    const cx = 200, cy = 150;
    let svg = '';
    svg += `<polygon points="${cx},${cy - dh} ${cx + dw},${cy} ${cx},${cy + dh} ${cx - dw},${cy}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5"/>`;
    // Diagonals
    svg += svgDashedLine(cx - dw, cy, cx + dw, cy, COLORS.dim);
    svg += svgDashedLine(cx, cy - dh, cx, cy + dh, COLORS.dim);
    // Labels
    svg += svgText(cx, cy + dh + 22, labels.d2 || `d₂ = ${d2}`, 13, COLORS.dim, 'middle', true);
    svg += svgText(cx + dw + 12, cy - 5, labels.d1 || `d₁ = ${d1}`, 13, COLORS.dim, 'start', true);
    return svg;
  }

  // --- Layang-layang ---
  function renderKite(d1, d2, labels = {}) {
    const maxD = 240;
    const scale = maxD / Math.max(d1, d2) * 0.7;
    const dw = d1 * scale / 2;
    const topH = d2 * scale * 0.35;
    const botH = d2 * scale * 0.65;
    const cx = 200, cy = 150;
    let svg = '';
    svg += `<polygon points="${cx},${cy - topH} ${cx + dw},${cy} ${cx},${cy + botH} ${cx - dw},${cy}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5"/>`;
    // Diagonals
    svg += svgDashedLine(cx - dw, cy, cx + dw, cy, COLORS.dim);
    svg += svgDashedLine(cx, cy - topH, cx, cy + botH, COLORS.dim);
    // Labels
    svg += svgText(cx, cy + botH + 22, labels.d2 || `d₂ = ${d2}`, 13, COLORS.dim, 'middle', true);
    svg += svgText(cx + dw + 12, cy - 5, labels.d1 || `d₁ = ${d1}`, 13, COLORS.dim, 'start', true);
    return svg;
  }

  // --- Persegi Panjang + Diagonal ---
  function renderRectDiagonal(w, h, labels = {}) {
    const maxW = 280, maxH = 170;
    const scale = Math.min(maxW / w, maxH / h) * 0.75;
    const rw = w * scale, rh = h * scale;
    const x = 200 - rw / 2, y = 150 - rh / 2;
    let svg = '';
    svg += `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2.5" rx="2"/>`;
    // Diagonal
    svg += `<line x1="${x}" y1="${y + rh}" x2="${x + rw}" y2="${y}" stroke="${COLORS.accent}" stroke-width="3" stroke-dasharray="8,4"/>`;
    // Labels
    svg += svgText(200, y + rh + 22, labels.p || `${w}`, 13, COLORS.stroke, 'middle', true);
    svg += svgText(x + rw + 15, 150, labels.l || `${h}`, 13, COLORS.stroke, 'start', true);
    svg += svgText(200 + 10, 150 - 8, labels.d || 'd = ?', 13, COLORS.accent, 'start', true);
    return svg;
  }

  // --- Bangun Gabungan: Persegi Panjang + Segitiga atas ---
  function renderCompositeRectTri(rectW, rectH, triBase, triH) {
    const maxW = 280, maxH = 220;
    const totalH = rectH + triH;
    const scale = Math.min(maxW / rectW, maxH / totalH) * 0.65;
    const rw = rectW * scale, rh = rectH * scale, th = triH * scale;
    const cx = 200, baseY = 230;
    const x = cx - rw / 2;
    let svg = '';
    // Rectangle
    svg += `<rect x="${x}" y="${baseY - rh}" width="${rw}" height="${rh}" fill="${COLORS.fill}" stroke="${COLORS.stroke}" stroke-width="2"/>`;
    // Triangle on top
    const triY = baseY - rh;
    svg += `<polygon points="${x},${triY} ${x + rw},${triY} ${cx},${triY - th}" fill="${COLORS.dimFill}" stroke="${COLORS.dim}" stroke-width="2"/>`;
    // Labels
    svg += svgText(cx, baseY + 18, `${rectW} m`, 12, COLORS.stroke, 'middle', true);
    svg += svgText(x - 10, baseY - rh / 2, `${rectH}`, 12, COLORS.stroke, 'end', true);
    svg += svgText(cx + 12, triY - th / 2 - 2, `${triH}`, 12, COLORS.dim, 'start', true);
    // Height line for triangle
    svg += svgDashedLine(cx, triY, cx, triY - th, COLORS.dim);
    return svg;
  }

  // --- Bangun Gabungan: Trapesium - Persegi ---
  function renderCompositeTrapSq(topSide, bottomSide, height, holeSide) {
    const trap = renderTrapezoid(topSide, bottomSide, height);
    // Small square in center
    const sqSize = holeSide * 12;
    const x = 200 - sqSize / 2, y = 150 - sqSize / 2;
    const sq = `<rect x="${x}" y="${y}" width="${sqSize}" height="${sqSize}" fill="white" stroke="${COLORS.dim}" stroke-width="2" stroke-dasharray="4,3"/>`;
    const label = svgText(200, 150 + 4, `${holeSide}×${holeSide}`, 11, COLORS.dim, 'middle', true);
    return trap + sq + label;
  }

  // --- Lingkaran ---
  function renderCircle(r, labels = {}) {
    const maxR = 100;
    const scale = maxR / Math.max(r, 7);
    const cr = r * scale;
    const cx = 200, cy = 150;
    let svg = '';
    svg += `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="rgba(155,89,182,0.1)" stroke="${COLORS.purple}" stroke-width="2.5"/>`;
    // Radius line
    svg += `<line x1="${cx}" y1="${cy}" x2="${cx + cr}" y2="${cy}" stroke="${COLORS.purple}" stroke-width="2"/>`;
    // Center dot
    svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="${COLORS.purple}"/>`;
    // Label r
    svg += svgText(cx + cr / 2, cy - 10, labels.r || `r = ${r}`, 13, COLORS.purple, 'middle', true);
    // Label d (if present)
    if (labels.d) {
      svg += svgDashedLine(cx - cr, cy, cx + cr, cy, COLORS.dim);
      svg += svgText(cx, cy + cr + 20, labels.d || '', 13, COLORS.dim, 'middle', true);
    }
    return svg;
  }

  // --- Setengah Lingkaran ---
  function renderSemicircle(d, labels = {}) {
    const maxR = 110;
    const r = d / 2;
    const scale = maxR / Math.max(r, 7);
    const cr = r * scale;
    const cx = 200, cy = 180;
    let svg = '';
    // Arc
    svg += `<path d="M ${cx - cr} ${cy} A ${cr} ${cr} 0 0 1 ${cx + cr} ${cy}" fill="rgba(155,89,182,0.1)" stroke="${COLORS.purple}" stroke-width="2.5"/>`;
    // Base line
    svg += `<line x1="${cx - cr}" y1="${cy}" x2="${cx + cr}" y2="${cy}" stroke="${COLORS.purple}" stroke-width="2"/>`;
    // Label
    svg += svgText(cx, cy + 22, labels.d || `d = ${d}`, 13, COLORS.purple, 'middle', true);
    return svg;
  }

  // --- Balok (3D isometric) ---
  function renderCuboid(p, l, t, labels = {}) {
    const scale = 12;
    const pw = p * scale, lw = l * scale * 0.5, th = t * scale;
    const cx = 200, cy = 150;
    const ox = lw * 0.7, oy = lw * 0.4;
    // Front face
    const fx = cx - pw / 2, fy = cy + th / 2;
    let svg = '';
    // Front face
    svg += `<polygon points="${fx},${fy} ${fx + pw},${fy} ${fx + pw},${fy - th} ${fx},${fy - th}" fill="rgba(41,128,185,0.15)" stroke="${COLORS.blue}" stroke-width="2"/>`;
    // Top face
    svg += `<polygon points="${fx},${fy - th} ${fx + pw},${fy - th} ${fx + pw + ox},${fy - th - oy} ${fx + ox},${fy - th - oy}" fill="rgba(41,128,185,0.08)" stroke="${COLORS.blue}" stroke-width="2"/>`;
    // Right face
    svg += `<polygon points="${fx + pw},${fy} ${fx + pw + ox},${fy - oy} ${fx + pw + ox},${fy - th - oy} ${fx + pw},${fy - th}" fill="rgba(41,128,185,0.2)" stroke="${COLORS.blue}" stroke-width="2"/>`;
    // Labels
    svg += svgText(cx, fy + 20, labels.p || `p = ${p}`, 12, COLORS.blue, 'middle', true);
    svg += svgText(fx + pw + ox + 12, cy, labels.t || `t = ${t}`, 12, COLORS.blue, 'start', true);
    svg += svgText(fx + pw + ox / 2 + 10, fy - 4, labels.l || `l = ${l}`, 11, COLORS.blue, 'start', true);
    return svg;
  }

  // --- Kubus (3D isometric) ---
  function renderCube(s, labels = {}) {
    return renderCuboid(s, s, s, { p: labels.s || `s = ${s}`, l: '', t: '', ...labels });
  }

  // --- Prisma Segitiga (3D) ---
  function renderTriangularPrism(base, height, cx = 200, cy = 150) {
    const scale = 10;
    const bw = base * scale, th = height * scale, depth = 40;
    const ox = depth * 0.7, oy = depth * 0.4;
    const fx = cx - bw / 2, fy = cy + th / 3;
    let svg = '';
    // Front triangle
    svg += `<polygon points="${fx},${fy} ${fx + bw},${fy} ${fx + bw / 2},${fy - th}" fill="rgba(41,128,185,0.12)" stroke="${COLORS.blue}" stroke-width="2"/>`;
    // Back triangle (offset)
    svg += `<polygon points="${fx + ox},${fy - oy} ${fx + bw + ox},${fy - oy} ${fx + bw / 2 + ox},${fy - th - oy}" fill="rgba(41,128,185,0.06)" stroke="${COLORS.blue}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    // Connecting edges
    svg += `<line x1="${fx}" y1="${fy}" x2="${fx + ox}" y2="${fy - oy}" stroke="${COLORS.blue}" stroke-width="1.5"/>`;
    svg += `<line x1="${fx + bw}" y1="${fy}" x2="${fx + bw + ox}" y2="${fy - oy}" stroke="${COLORS.blue}" stroke-width="1.5"/>`;
    svg += `<line x1="${fx + bw / 2}" y1="${fy - th}" x2="${fx + bw / 2 + ox}" y2="${fy - th - oy}" stroke="${COLORS.blue}" stroke-width="1.5"/>`;
    // Labels
    svg += svgText(cx, fy + 22, `a = ${base}`, 12, COLORS.blue, 'middle', true);
    svg += svgText(fx + bw / 2 + 14, fy - th / 2 - 4, `t = ${height}`, 12, COLORS.dim, 'start', true);
    // Height line
    svg += svgDashedLine(fx + bw / 2, fy - th, fx + bw / 2, fy, COLORS.dim);
    return svg;
  }

  // --- Limas (3D) ---
  function renderPyramid(base, height, cx = 200, cy = 150) {
    const b = base || 6;
    const h = height || 10;
    const scale = 10;
    const bw = b * scale * 0.6, bh = b * scale * 0.3;
    const py = cy + bh;
    const apex = cy - h * scale * 0.35;
    let svg = '';
    // Base (diamond shape for 3D effect)
    svg += `<polygon points="${cx},${py - bh} ${cx + bw},${py} ${cx},${py + bh} ${cx - bw},${py}" fill="rgba(41,128,185,0.1)" stroke="${COLORS.blue}" stroke-width="2"/>`;
    // Edges to apex
    svg += `<line x1="${cx}" y1="${py - bh}" x2="${cx}" y2="${apex}" stroke="${COLORS.blue}" stroke-width="2"/>`;
    svg += `<line x1="${cx + bw}" y1="${py}" x2="${cx}" y2="${apex}" stroke="${COLORS.blue}" stroke-width="2"/>`;
    svg += `<line x1="${cx - bw}" y1="${py}" x2="${cx}" y2="${apex}" stroke="${COLORS.blue}" stroke-width="2"/>`;
    svg += `<line x1="${cx}" y1="${py + bh}" x2="${cx}" y2="${apex}" stroke="${COLORS.blue}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    // Height dashed
    svg += svgDashedLine(cx, apex, cx, py, COLORS.dim);
    svg += svgText(cx + 14, (apex + py) / 2, `t = ${h}`, 12, COLORS.dim, 'start', true);
    return svg;
  }

  /** Render visual SVG berdasarkan data level */
  function renderShapeSVG(levelData, dynamicValue) {
    let inner = '';
    const shape = levelData.shape;
    const p = levelData.shapeParams || {};

    switch (shape) {
      case 'square':
        inner = renderSquare(dynamicValue || p.side || 6);
        break;
      case 'rectangle':
        inner = renderRectangle(p.width || 12, p.height || 8, p.labels || {}, p.showPerimeter, p.showGrid);
        break;
      case 'triangle':
        inner = renderTriangle(p.base || 10, dynamicValue || p.height || 6);
        break;
      case 'rightTriangle':
        inner = renderRightTriangle(p);
        break;
      case 'trapezoid':
        inner = renderTrapezoid(p.topSide, p.bottomSide, p.height, p.labels || {});
        break;
      case 'parallelogram':
        inner = renderParallelogram(p.base || 8, dynamicValue || 5);
        break;
      case 'rhombus':
        inner = renderRhombus(p.d1, p.d2, p.labels || {});
        break;
      case 'kite':
        inner = renderKite(p.d1, p.d2, p.labels || {});
        break;
      case 'rectangleDiagonal':
        inner = renderRectDiagonal(p.width, p.height, p.labels || {});
        break;
      case 'composite_rect_tri':
        inner = renderCompositeRectTri(p.rectW, p.rectH, p.triBase, p.triH);
        break;
      case 'composite_trap_sq':
        inner = renderCompositeTrapSq(p.topSide, p.bottomSide, p.height, p.holeSide);
        break;
      case 'circle':
        inner = renderCircle(dynamicValue || p.r || 7, p.labels || {});
        break;
      case 'semicircle':
        inner = renderSemicircle(p.d || 14, p.labels || {});
        break;
      case 'cuboid':
        inner = renderCuboid(p.p || 8, p.l || 5, p.t || 3, p.labels || {});
        break;
      case 'cube':
        inner = renderCube(p.s || 4, p.labels || {});
        break;
      case 'triangularPrism':
        inner = renderTriangularPrism(p.base || 6, p.height || 4);
        break;
      case 'pyramid':
        inner = renderPyramid(p.base, p.height);
        break;
      case 'none':
        inner = svgText(200, 150, '🤔', 60, COLORS.label);
        break;
      default:
        inner = svgText(200, 150, '📐', 48, COLORS.label);
    }
    return svgWrap(inner);
  }

  /* --- Confetti System --- */
  let confettiParticles = [];
  let confettiAnimId = null;

  function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    confettiParticles = [];
    const colors = ['#E8A838', '#D94F3B', '#1B6B4A', '#27AE60', '#3498DB', '#9B59B6', '#F1C40F', '#FF6B9D', '#00D2FF'];

    for (let i = 0; i < 80; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 5,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    function draw() {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      confettiParticles.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        p.vy += 0.1;
        if (p.y > canvas.height + 20) { p.life = 0; return; }

        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate((p.rot * Math.PI) / 180);
        ctx2d.fillStyle = p.color;
        ctx2d.globalAlpha = Math.min(1, p.life);
        if (p.shape === 'circle') {
          ctx2d.beginPath();
          ctx2d.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx2d.fill();
        } else {
          ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx2d.restore();
      });

      if (alive) {
        confettiAnimId = requestAnimationFrame(draw);
      } else {
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        confettiAnimId = null;
      }
    }
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    draw();
  }

  function stopConfetti() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      const ctx2d = canvas.getContext('2d');
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* --- Floating Particles Background --- */
  let bgParticles = [];
  let bgAnimId = null;

  function startBgParticles() {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    bgParticles = [];
    const shapes = ['⭐', '✦', '◆', '●', '▲', '♦'];
    const colors = ['rgba(232,168,56,0.3)', 'rgba(155,89,182,0.2)', 'rgba(41,128,185,0.2)', 'rgba(46,204,113,0.25)', 'rgba(231,76,60,0.2)'];

    for (let i = 0; i < 20; i++) {
      bgParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 8 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.3 - Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bgParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.shape, 0, 0);
        ctx.restore();
      });
      bgAnimId = requestAnimationFrame(animate);
    }
    if (bgAnimId) cancelAnimationFrame(bgAnimId);
    animate();
  }

  function stopBgParticles() {
    if (bgAnimId) {
      cancelAnimationFrame(bgAnimId);
      bgAnimId = null;
    }
  }

  /* --- Mascot SVG (Arsitek Adi) --- */
  function getMascotSVG(expression = 'normal', size = 100) {
    const h = Math.round(size * 1.15);
    let eyesSvg = '';
    let mouthSvg = '';

    if (expression === 'happy') {
      eyesSvg = `
        <path d="M43,48 Q49,41 55,48" stroke="#1C2833" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <path d="M65,48 Q71,41 77,48" stroke="#1C2833" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      `;
      mouthSvg = `
        <path d="M52,57 Q60,68 68,57 Z" fill="#E74C3C"/>
        <path d="M55,62 Q60,66 65,62" fill="#FF8EA3"/>
      `;
    } else if (expression === 'excited') {
      eyesSvg = `
        <ellipse cx="49" cy="48" rx="5.5" ry="6.5" fill="#1C2833"/>
        <polygon points="49,43 51,46.5 55,46.5 52,49 53,52.5 49,50.5 45,52.5 46,49 43,46.5 47,46.5" fill="#F1C40F"/>
        <ellipse cx="71" cy="48" rx="5.5" ry="6.5" fill="#1C2833"/>
        <polygon points="71,43 73,46.5 77,46.5 74,49 75,52.5 71,50.5 67,52.5 68,49 65,46.5 69,46.5" fill="#F1C40F"/>
      `;
      mouthSvg = `
        <path d="M51,56 Q60,69 69,56 Z" fill="#E74C3C"/>
        <path d="M54,62 Q60,67 66,62" fill="#FFA07A"/>
      `;
    } else if (expression === 'sad') {
      eyesSvg = `
        <circle cx="49" cy="48" r="4" fill="#1C2833"/>
        <circle cx="71" cy="48" r="4" fill="#1C2833"/>
        <path d="M41,54 Q44,57 44,60 Q41,57 41,54 Z" fill="#3498DB" opacity="0.8"/>
      `;
      mouthSvg = `
        <path d="M53,63 Q60,57 67,63" stroke="#1C2833" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      `;
    } else {
      // Normal / cheerful
      eyesSvg = `
        <ellipse cx="49" cy="48" rx="5" ry="6" fill="#1C2833" class="mascot-eyes"/>
        <circle cx="47.5" cy="45.5" r="2" fill="#FFFFFF"/>
        <circle cx="51" cy="49.5" r="1.1" fill="#FFFFFF"/>
        <ellipse cx="71" cy="48" rx="5" ry="6" fill="#1C2833" class="mascot-eyes"/>
        <circle cx="69.5" cy="45.5" r="2" fill="#FFFFFF"/>
        <circle cx="73" cy="49.5" r="1.1" fill="#FFFFFF"/>
      `;
      mouthSvg = `
        <path d="M54,58 Q60,65 66,58" stroke="#1C2833" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      `;
    }

    const svg = `<svg viewBox="0 0 120 132" width="${size}" height="${h}" style="width:100%;height:100%;display:block;" xmlns="${SVG_NS}" class="mascot-character-svg">
      <defs>
        <linearGradient id="m-helm-${expression}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFDD44"/>
          <stop offset="100%" stop-color="#F39C12"/>
        </linearGradient>
        <linearGradient id="m-vest-${expression}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1B6B4A"/>
          <stop offset="100%" stop-color="#0E4A31"/>
        </linearGradient>
        <linearGradient id="m-ruler-${expression}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F5D061"/>
          <stop offset="100%" stop-color="#D49A24"/>
        </linearGradient>
        <linearGradient id="m-bp-${expression}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3498DB"/>
          <stop offset="100%" stop-color="#1B4F72"/>
        </linearGradient>
      </defs>

      <!-- Shadow -->
      <ellipse cx="60" cy="126" rx="30" ry="5" fill="rgba(0,0,0,0.15)"/>

      <!-- Legs & Pants -->
      <rect x="45" y="98" width="13" height="24" rx="4" fill="#2C3E50"/>
      <rect x="62" y="98" width="13" height="24" rx="4" fill="#2C3E50"/>
      <!-- Shoes -->
      <ellipse cx="50" cy="122" rx="9" ry="4.5" fill="#D35400"/>
      <ellipse cx="70" cy="122" rx="9" ry="4.5" fill="#D35400"/>

      <!-- Body / Torso (Rompi Arsitek) -->
      <rect x="40" y="68" width="40" height="34" rx="8" fill="url(#m-vest-${expression})"/>
      <!-- Safety reflective stripes -->
      <rect x="40" y="78" width="40" height="5" fill="#F1C40F" opacity="0.95"/>
      <rect x="40" y="90" width="40" height="5" fill="#F1C40F" opacity="0.95"/>
      <!-- Collar & tie -->
      <polygon points="53,68 60,76 67,68" fill="#FFFFFF"/>
      <polygon points="58,68 60,73 62,68" fill="#E74C3C"/>

      <!-- Props: Ruler Pythagoras (Right hand side of viewer) -->
      <g class="mascot-prop-ruler">
        <polygon points="12,104 32,104 32,64" fill="url(#m-ruler-${expression})" stroke="#A06914" stroke-width="1.5"/>
        <polygon points="18,100 28,100 28,80" fill="#FFFFFF" opacity="0.6"/>
        <polyline points="28,94 24,94 24,100" fill="none" stroke="#A06914" stroke-width="1.2"/>
        <!-- Arm & Hand -->
        <rect x="25" y="72" width="16" height="10" rx="5" fill="url(#m-vest-${expression})" transform="rotate(20 25 72)"/>
        <circle cx="31" cy="86" r="6" fill="#FFE0BD"/>
      </g>

      <!-- Props: Rolled Blueprint (Left hand side of viewer) -->
      <g class="mascot-prop-blueprint">
        <rect x="88" y="70" width="13" height="36" rx="4" fill="url(#m-bp-${expression})" stroke="#1A5276" stroke-width="1.2" transform="rotate(-18 94 88)"/>
        <rect x="86" y="86" width="17" height="5" fill="#F1C40F" transform="rotate(-18 94 88)"/>
        <!-- Arm & Hand -->
        <rect x="79" y="72" width="16" height="10" rx="5" fill="url(#m-vest-${expression})" transform="rotate(-20 79 72)"/>
        <circle cx="89" cy="86" r="6" fill="#FFE0BD"/>
      </g>

      <!-- Neck -->
      <rect x="54" y="64" width="12" height="8" fill="#FAD7A0"/>

      <!-- Face -->
      <ellipse cx="60" cy="50" rx="26" ry="22" fill="#FFE0BD"/>
      <!-- Ears -->
      <circle cx="34" cy="50" r="5" fill="#FAD7A0"/>
      <circle cx="86" cy="50" r="5" fill="#FAD7A0"/>
      <!-- Hair sideburns -->
      <path d="M35,38 Q42,46 45,36" fill="#4A2E12"/>
      <path d="M85,38 Q78,46 75,36" fill="#4A2E12"/>

      <!-- Eyebrows -->
      <path d="M44,40 Q49,37 54,40" stroke="#4A2E12" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M66,40 Q71,37 76,40" stroke="#4A2E12" stroke-width="1.8" stroke-linecap="round" fill="none"/>

      <!-- Eyes & Mouth -->
      ${eyesSvg}
      ${mouthSvg}

      <!-- Blush -->
      <ellipse cx="43" cy="56" rx="5.5" ry="3.5" fill="#FF8EA3" opacity="0.6"/>
      <ellipse cx="77" cy="56" rx="5.5" ry="3.5" fill="#FF8EA3" opacity="0.6"/>

      <!-- Helmet (Arsitek Adi) -->
      <!-- Dome -->
      <path d="M30,34 C30,13 90,13 90,34 Z" fill="url(#m-helm-${expression})"/>
      <!-- Helmet rim -->
      <ellipse cx="60" cy="34" rx="35" ry="6.5" fill="#E67E22"/>
      <!-- Helmet top rib -->
      <path d="M57,15 C57,15 60,13 63,15 L62,34 L58,34 Z" fill="#F39C12"/>
      <!-- Emblem on helmet: triangle badge -->
      <polygon points="60,20 55,28 65,28" fill="#FFFFFF" stroke="#D35400" stroke-width="0.8"/>
      <polygon points="60,22 57,27 63,27" fill="#E67E22"/>

      <!-- Architect pencil behind ear -->
      <g transform="rotate(25 87 20)">
        <rect x="85" y="14" width="5.5" height="22" rx="1.5" fill="#E74C3C"/>
        <polygon points="85,36 87.75,42 90.5,36" fill="#FFE0BD"/>
        <polygon points="86.5,39.5 87.75,42 89,39.5" fill="#1C2833"/>
      </g>
    </svg>`;
    return svg;
  }

  /* --- Pythagoras Proof SVG Generator (Interactive Sandbox) --- */
  function renderPythagorasProofSVG(a, b) {
    const c = Math.sqrt(a * a + b * b);
    const cDisplay = Number.isInteger(c) ? c : c.toFixed(2);
    const sqA = a * a;
    const sqB = b * b;
    const sqC = Number.isInteger(c * c) ? Math.round(c * c) : (c * c).toFixed(1);

    const spanX = a + 2 * b;
    const spanY = 2 * a + b;
    const maxSpan = Math.max(spanX, spanY, 8);
    const scale = Math.min(220 / maxSpan, 24);

    const sa = a * scale;
    const sb = b * scale;

    const vw = 440;
    const vh = 320;
    const x0 = vw / 2 - (sa - sb) / 2 - 10;
    const y0 = vh / 2 + (sa - sb) / 2 + 10;

    const p1x = x0, p1y = y0 - sb;
    const p2x = x0 + sa, p2y = y0;
    const p3x = p2x + sb, p3y = p2y - sa;
    const p4x = p1x + sb, p4y = p1y - sa;

    const centerAx = x0 + sa / 2, centerAy = y0 + sa / 2;
    const centerBx = x0 - sb / 2, centerBy = y0 - sb / 2;
    const centerCx = (p1x + p3x) / 2, centerCy = (p1y + p3y) / 2;

    let svg = `<svg viewBox="0 0 ${vw} ${vh}" xmlns="${SVG_NS}" width="100%" height="100%">
      <defs>
        <linearGradient id="grad-sq-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2ECC71" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#27AE60" stop-opacity="0.55"/>
        </linearGradient>
        <linearGradient id="grad-sq-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F39C12" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#D35400" stop-opacity="0.55"/>
        </linearGradient>
        <linearGradient id="grad-sq-c" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3498DB" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#2980B9" stop-opacity="0.55"/>
        </linearGradient>
      </defs>

      <pattern id="lab-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E8E0D0" stroke-width="0.8"/>
      </pattern>
      <rect width="${vw}" height="${vh}" fill="url(#lab-grid)" rx="12"/>

      <!-- Square on Side a -->
      <rect x="${x0}" y="${y0}" width="${sa}" height="${sa}" fill="url(#grad-sq-a)" stroke="#27AE60" stroke-width="2.5" rx="3"/>
      <text x="${centerAx}" y="${centerAy - 4}" text-anchor="middle" fill="#145A32" font-size="12" font-weight="700" font-family="system-ui">a²</text>
      <text x="${centerAx}" y="${centerAy + 12}" text-anchor="middle" fill="#145A32" font-size="14" font-weight="800" font-family="system-ui">${sqA}</text>

      <!-- Square on Side b -->
      <rect x="${x0 - sb}" y="${y0 - sb}" width="${sb}" height="${sb}" fill="url(#grad-sq-b)" stroke="#D35400" stroke-width="2.5" rx="3"/>
      <text x="${centerBx}" y="${centerBy - 4}" text-anchor="middle" fill="#935116" font-size="12" font-weight="700" font-family="system-ui">b²</text>
      <text x="${centerBx}" y="${centerBy + 12}" text-anchor="middle" fill="#935116" font-size="14" font-weight="800" font-family="system-ui">${sqB}</text>

      <!-- Square on Hypotenuse c -->
      <polygon points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}" fill="url(#grad-sq-c)" stroke="#2980B9" stroke-width="2.5"/>
      <text x="${centerCx}" y="${centerCy - 4}" text-anchor="middle" fill="#1B4F72" font-size="12" font-weight="700" font-family="system-ui">c² = a² + b²</text>
      <text x="${centerCx}" y="${centerCy + 14}" text-anchor="middle" fill="#1B4F72" font-size="16" font-weight="800" font-family="system-ui">${sqC}</text>

      <!-- Right Triangle -->
      <polygon points="${x0},${y0} ${x0 + sa},${y0} ${x0},${y0 - sb}" fill="#FFFFFF" stroke="#1C2833" stroke-width="3"/>
      <rect x="${x0}" y="${y0 - 12}" width="12" height="12" fill="none" stroke="#1C2833" stroke-width="2"/>

      <!-- Labels -->
      <rect x="${x0 + sa/2 - 22}" y="${y0 - 18}" width="44" height="16" rx="4" fill="#FFFFFF" fill-opacity="0.9"/>
      <text x="${x0 + sa/2}" y="${y0 - 6}" text-anchor="middle" fill="#27AE60" font-size="12" font-weight="800" font-family="system-ui">a = ${a}</text>

      <rect x="${x0 + 4}" y="${y0 - sb/2 - 8}" width="44" height="16" rx="4" fill="#FFFFFF" fill-opacity="0.9"/>
      <text x="${x0 + 26}" y="${y0 - sb/2 + 4}" text-anchor="middle" fill="#D35400" font-size="12" font-weight="800" font-family="system-ui">b = ${b}</text>

      <rect x="${(p1x + p2x)/2 - 28}" y="${(p1y + p2y)/2 - 18}" width="56" height="16" rx="4" fill="#FFFFFF" fill-opacity="0.9"/>
      <text x="${(p1x + p2x)/2}" y="${(p1y + p2y)/2 - 6}" text-anchor="middle" fill="#2980B9" font-size="12" font-weight="800" font-family="system-ui">c = ${cDisplay}</text>
    </svg>`;
    return svg;
  }

  /* --- 2D Shapes Lab SVG Generator --- */
  function renderShapeLabSVG(shape, p = {}) {
    const vw = 400, vh = 240;
    let inner = '';
    const cx = vw / 2, cy = vh / 2;

    if (shape === 'square') {
      const s = p.side || 6;
      const px = Math.min(s * 15, 140);
      const x = cx - px / 2, y = cy - px / 2;
      inner = `
        <rect x="${x}" y="${y}" width="${px}" height="${px}" fill="#E8F8F5" stroke="#1B6B4A" stroke-width="2.5" rx="3"/>
        <text x="${cx}" y="${y + px + 18}" text-anchor="middle" fill="#1B6B4A" font-size="13" font-weight="700" font-family="system-ui">sisi = ${s} cm</text>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#14503A" font-size="15" font-weight="800" font-family="system-ui">L = ${s * s} cm²</text>
      `;
    } else if (shape === 'rectangle') {
      const w = p.width || 8, h = p.height || 5;
      const pw = Math.min(w * 16, 200), ph = Math.min(h * 16, 120);
      const x = cx - pw / 2, y = cy - ph / 2;
      inner = `
        <rect x="${x}" y="${y}" width="${pw}" height="${ph}" fill="#FEF9E7" stroke="#E8A838" stroke-width="2.5" rx="3"/>
        <text x="${cx}" y="${y + ph + 18}" text-anchor="middle" fill="#C08A20" font-size="13" font-weight="700" font-family="system-ui">panjang = ${w} cm</text>
        <text x="${x + pw + 12}" y="${cy + 5}" text-anchor="start" fill="#C08A20" font-size="13" font-weight="700" font-family="system-ui">lebar = ${h} cm</text>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#7D6608" font-size="15" font-weight="800" font-family="system-ui">L = ${w * h} cm²</text>
      `;
    } else if (shape === 'triangle') {
      const a = p.base || 8, t = p.height || 6;
      const pa = Math.min(a * 16, 180), pt = Math.min(t * 16, 120);
      const x1 = cx - pa / 2, y1 = cy + pt / 2;
      const x2 = cx + pa / 2, y2 = cy + pt / 2;
      const x3 = cx, y3 = cy - pt / 2;
      inner = `
        <polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="#EBF5FB" stroke="#2980B9" stroke-width="2.5"/>
        <line x1="${x3}" y1="${y3}" x2="${x3}" y2="${y1}" stroke="#D94F3B" stroke-width="1.5" stroke-dasharray="4,4"/>
        <text x="${cx}" y="${y1 + 18}" text-anchor="middle" fill="#2980B9" font-size="13" font-weight="700" font-family="system-ui">alas = ${a} cm</text>
        <text x="${x3 + 8}" y="${cy}" text-anchor="start" fill="#D94F3B" font-size="12" font-weight="700" font-family="system-ui">tinggi = ${t} cm</text>
        <text x="${cx}" y="${y1 - 18}" text-anchor="middle" fill="#1B4F72" font-size="14" font-weight="800" font-family="system-ui">L = ${(a * t) / 2} cm²</text>
      `;
    } else if (shape === 'trapezoid') {
      const a = p.top || 4, b = p.bottom || 8, t = p.height || 5;
      const pa = Math.min(a * 15, 120), pb = Math.min(b * 15, 200), pt = Math.min(t * 15, 100);
      const y1 = cy - pt / 2, y2 = cy + pt / 2;
      const x1 = cx - pa / 2, x2 = cx + pa / 2;
      const x3 = cx + pb / 2, x4 = cx - pb / 2;
      const area = ((a + b) * t) / 2;
      inner = `
        <polygon points="${x1},${y1} ${x2},${y1} ${x3},${y2} ${x4},${y2}" fill="#F4ECF7" stroke="#8E44AD" stroke-width="2.5"/>
        <line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" stroke="#D94F3B" stroke-width="1.5" stroke-dasharray="4,4"/>
        <text x="${cx}" y="${y1 - 8}" text-anchor="middle" fill="#8E44AD" font-size="12" font-weight="700" font-family="system-ui">sisi atas (a) = ${a} cm</text>
        <text x="${cx}" y="${y2 + 18}" text-anchor="middle" fill="#8E44AD" font-size="12" font-weight="700" font-family="system-ui">sisi bawah (b) = ${b} cm</text>
        <text x="${x1 - 8}" y="${cy}" text-anchor="end" fill="#D94F3B" font-size="11" font-weight="700" font-family="system-ui">t = ${t}</text>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#512E5F" font-size="14" font-weight="800" font-family="system-ui">L = ${area} cm²</text>
      `;
    } else if (shape === 'circle') {
      const r = p.radius || 4;
      const pr = Math.min(r * 12, 65);
      const area = (Math.PI * r * r).toFixed(1);
      inner = `
        <circle cx="${cx}" cy="${cy}" r="${pr}" fill="#FDEDEC" stroke="#E74C3C" stroke-width="2.5"/>
        <line x1="${cx}" y1="${cy}" x2="${cx + pr}" y2="${cy}" stroke="#1C2833" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy}" r="3" fill="#1C2833"/>
        <text x="${cx + pr / 2}" y="${cy - 8}" text-anchor="middle" fill="#1C2833" font-size="12" font-weight="700" font-family="system-ui">r = ${r} cm</text>
        <text x="${cx}" y="${cy + 24}" text-anchor="middle" fill="#922B21" font-size="14" font-weight="800" font-family="system-ui">L = πr² ≈ ${area} cm²</text>
      `;
    }
    return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="${SVG_NS}" width="100%" height="100%">${inner}</svg>`;
  }

  /* --- 3D Shapes Lab SVG Generator (Bangun Ruang) --- */
  function renderShape3DLabSVG(shape, p = {}) {
    const vw = 400, vh = 240;
    const cx = vw / 2, cy = 115;
    let inner = '';

    if (shape === 'cube') {
      const s = p.side || 6;
      const d = Math.min(s * 8 + 25, 68);
      const dx = d, dy = d * 0.52, dz = d * 1.05;

      const A = [cx, cy];
      const B = [cx + dx, cy - dy];
      const C = [cx, cy - 2 * dy];
      const D = [cx - dx, cy - dy];
      const A2 = [cx, cy + dz];
      const B2 = [cx + dx, cy - dy + dz];
      const D2 = [cx - dx, cy - dy + dz];
      const C2 = [cx, cy - 2 * dy + dz];

      const vol = s * s * s;
      const lp = 6 * s * s;

      inner = `
        <defs>
          <linearGradient id="cube-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E8F8F5"/>
            <stop offset="100%" stop-color="#D1F2EB"/>
          </linearGradient>
          <linearGradient id="cube-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#A3E4D7"/>
            <stop offset="100%" stop-color="#76D7C4"/>
          </linearGradient>
          <linearGradient id="cube-right" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#48C9B0"/>
            <stop offset="100%" stop-color="#1ABC9C"/>
          </linearGradient>
        </defs>
        <!-- Back hidden lines -->
        <line x1="${C[0]}" y1="${C[1]}" x2="${C2[0]}" y2="${C2[1]}" stroke="#A2D9CE" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="${C2[0]}" y1="${C2[1]}" x2="${D2[0]}" y2="${D2[1]}" stroke="#A2D9CE" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="${C2[0]}" y1="${C2[1]}" x2="${B2[0]}" y2="${B2[1]}" stroke="#A2D9CE" stroke-width="1.5" stroke-dasharray="4,4"/>

        <!-- Top Face -->
        <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]} ${D[0]},${D[1]}" fill="url(#cube-top)" stroke="#117864" stroke-width="2"/>
        <!-- Left Face -->
        <polygon points="${D[0]},${D[1]} ${A[0]},${A[1]} ${A2[0]},${A2[1]} ${D2[0]},${D2[1]}" fill="url(#cube-left)" stroke="#117864" stroke-width="2"/>
        <!-- Right Face -->
        <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${B2[0]},${B2[1]} ${A2[0]},${A2[1]}" fill="url(#cube-right)" stroke="#117864" stroke-width="2"/>

        <!-- Labels -->
        <text x="${(A[0] + D[0]) / 2 - 14}" y="${(A[1] + D[1]) / 2 + 10}" fill="#117864" font-size="11" font-weight="700" font-family="system-ui">s = ${s}</text>
        <text x="${A[0] - 8}" y="${A[1] + dz / 2}" text-anchor="end" fill="#117864" font-size="11" font-weight="700" font-family="system-ui">s = ${s}</text>
        <text x="${(A[0] + B[0]) / 2 + 12}" y="${(A[1] + B[1]) / 2 + 10}" fill="#117864" font-size="11" font-weight="700" font-family="system-ui">s = ${s}</text>
        <text x="${cx}" y="222" text-anchor="middle" fill="#0E6251" font-size="13" font-weight="800" font-family="system-ui">V = s³ = ${vol} cm³  •  Lp = 6s² = ${lp} cm²</text>
      `;
    } else if (shape === 'cuboid') {
      const pL = p.length || 8, w = p.width || 5, h = p.height || 6;
      const dx = Math.min(pL * 7 + 20, 85);
      const dy = Math.min(w * 5 + 15, 45);
      const dz = Math.min(h * 7 + 20, 75);

      const A = [cx - 15, cy - 5];
      const B = [A[0] + dx, A[1] - dy * 0.6];
      const C = [A[0] + dx - dy * 0.7, A[1] - dy * 1.6];
      const D = [A[0] - dy * 0.7, A[1] - dy];
      const A2 = [A[0], A[1] + dz];
      const B2 = [B[0], B[1] + dz];
      const D2 = [D[0], D[1] + dz];
      const C2 = [C[0], C[1] + dz];

      const vol = pL * w * h;
      const lp = 2 * (pL * w + pL * h + w * h);

      inner = `
        <defs>
          <linearGradient id="cuboid-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FEF9E7"/>
            <stop offset="100%" stop-color="#FCF3CF"/>
          </linearGradient>
          <linearGradient id="cuboid-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#F9E79F"/>
            <stop offset="100%" stop-color="#F7DC6F"/>
          </linearGradient>
          <linearGradient id="cuboid-right" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#F8C471"/>
            <stop offset="100%" stop-color="#E8A838"/>
          </linearGradient>
        </defs>
        <!-- Back hidden lines -->
        <line x1="${C[0]}" y1="${C[1]}" x2="${C2[0]}" y2="${C2[1]}" stroke="#E59866" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="${C2[0]}" y1="${C2[1]}" x2="${D2[0]}" y2="${D2[1]}" stroke="#E59866" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="${C2[0]}" y1="${C2[1]}" x2="${B2[0]}" y2="${B2[1]}" stroke="#E59866" stroke-width="1.5" stroke-dasharray="4,4"/>

        <!-- Top Face -->
        <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]} ${D[0]},${D[1]}" fill="url(#cuboid-top)" stroke="#B7791F" stroke-width="2"/>
        <!-- Left Face -->
        <polygon points="${D[0]},${D[1]} ${A[0]},${A[1]} ${A2[0]},${A2[1]} ${D2[0]},${D2[1]}" fill="url(#cuboid-left)" stroke="#B7791F" stroke-width="2"/>
        <!-- Right Face -->
        <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${B2[0]},${B2[1]} ${A2[0]},${A2[1]}" fill="url(#cuboid-right)" stroke="#B7791F" stroke-width="2"/>

        <!-- Labels -->
        <text x="${(A[0] + B[0]) / 2}" y="${A2[1] + 16}" text-anchor="middle" fill="#7D6608" font-size="11" font-weight="800" font-family="system-ui">p = ${pL} cm</text>
        <text x="${(D[0] + A[0]) / 2 - 12}" y="${(D[1] + A[1]) / 2 - 4}" fill="#7D6608" font-size="11" font-weight="700" font-family="system-ui">l = ${w}</text>
        <text x="${A[0] - 6}" y="${A[1] + dz / 2}" text-anchor="end" fill="#7D6608" font-size="11" font-weight="700" font-family="system-ui">t = ${h}</text>
        <text x="${cx}" y="222" text-anchor="middle" fill="#7D6608" font-size="13" font-weight="800" font-family="system-ui">V = p×l×t = ${vol} cm³  •  Lp = ${lp} cm²</text>
      `;
    } else if (shape === 'prism') {
      const a = p.base || 6, b = p.height || 8, len = p.length || 8;
      const c = Math.sqrt(a * a + b * b);
      const cDisp = Number.isInteger(c) ? c : c.toFixed(1);

      const pxA = Math.min(a * 8, 65);
      const pxB = Math.min(b * 7, 60);
      const pxL = Math.min(len * 8, 80);

      // Front right triangle
      const x0 = cx - pxL / 2 - 20;
      const y0 = cy + pxB / 2;
      const f1 = [x0, y0];
      const f2 = [x0 + pxA, y0];
      const f3 = [x0, y0 - pxB];

      // Back triangle
      const b1 = [f1[0] + pxL, f1[1] - pxL * 0.4];
      const b2 = [f2[0] + pxL, f2[1] - pxL * 0.4];
      const b3 = [f3[0] + pxL, f3[1] - pxL * 0.4];

      const la = 0.5 * a * b;
      const vol = la * len;
      const lp = (2 * la) + (a + b + c) * len;

      inner = `
        <defs>
          <linearGradient id="prism-side" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#D4E6F1"/>
            <stop offset="100%" stop-color="#A9CCE3"/>
          </linearGradient>
          <linearGradient id="prism-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#EBF5FB"/>
            <stop offset="100%" stop-color="#D4E6F1"/>
          </linearGradient>
        </defs>
        <!-- Hidden back edges -->
        <line x1="${f1[0]}" y1="${f1[1]}" x2="${b1[0]}" y2="${b1[1]}" stroke="#85929E" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="${b1[0]}" y1="${b1[1]}" x2="${b2[0]}" y2="${b2[1]}" stroke="#85929E" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="${b1[0]}" y1="${b1[1]}" x2="${b3[0]}" y2="${b3[1]}" stroke="#85929E" stroke-width="1.5" stroke-dasharray="4,4"/>

        <!-- Top / Slant Rect Face -->
        <polygon points="${f3[0]},${f3[1]} ${f2[0]},${f2[1]} ${b2[0]},${b2[1]} ${b3[0]},${b3[1]}" fill="url(#prism-side)" stroke="#2471A3" stroke-width="2"/>
        <!-- Front Triangle Face -->
        <polygon points="${f1[0]},${f1[1]} ${f2[0]},${f2[1]} ${f3[0]},${f3[1]}" fill="url(#prism-front)" stroke="#1B4F72" stroke-width="2.5"/>
        <!-- Right angle mark -->
        <rect x="${f1[0]}" y="${f1[1] - 10}" width="10" height="10" fill="none" stroke="#1B4F72" stroke-width="1.5"/>

        <!-- Back outer lines -->
        <line x1="${f2[0]}" y1="${f2[1]}" x2="${b2[0]}" y2="${b2[1]}" stroke="#2471A3" stroke-width="2"/>
        <line x1="${f3[0]}" y1="${f3[1]}" x2="${b3[0]}" y2="${b3[1]}" stroke="#2471A3" stroke-width="2"/>
        <line x1="${b3[0]}" y1="${b3[1]}" x2="${b2[0]}" y2="${b2[1]}" stroke="#2471A3" stroke-width="2"/>

        <!-- Labels -->
        <text x="${(f1[0] + f2[0]) / 2}" y="${f1[1] + 16}" text-anchor="middle" fill="#1B4F72" font-size="11" font-weight="700">a = ${a}</text>
        <text x="${f1[0] - 8}" y="${(f1[1] + f3[1]) / 2}" text-anchor="end" fill="#1B4F72" font-size="11" font-weight="700">t = ${b}</text>
        <text x="${(f2[0] + f3[0]) / 2 + 10}" y="${(f2[1] + f3[1]) / 2 - 4}" fill="#E74C3C" font-size="11" font-weight="800">c = ${cDisp}</text>
        <text x="${(f3[0] + b3[0]) / 2 + 6}" y="${(f3[1] + b3[1]) / 2 - 10}" fill="#2471A3" font-size="11" font-weight="700">T = ${len}</text>
        <text x="${cx}" y="222" text-anchor="middle" fill="#1B4F72" font-size="13" font-weight="800">V = La×T = ${vol} cm³  •  Lp = ${lp.toFixed(1)} cm²</text>
      `;
    } else if (shape === 'pyramid') {
      const s = p.side || 8, h = p.height || 7;
      const pxS = Math.min(s * 7 + 25, 80);
      const pxH = Math.min(h * 7 + 25, 85);

      const baseCenter = [cx, cy + 30];
      const apex = [cx, baseCenter[1] - pxH];

      const p1 = [baseCenter[0] - pxS, baseCenter[1]];
      const p2 = [baseCenter[0], baseCenter[1] + pxS * 0.45];
      const p3 = [baseCenter[0] + pxS, baseCenter[1]];
      const p4 = [baseCenter[0], baseCenter[1] - pxS * 0.45];

      // Slant height ts = sqrt(h^2 + (s/2)^2)
      const ts = Math.sqrt(h * h + (s / 2) * (s / 2));
      const vol = ((s * s * h) / 3).toFixed(1);
      const lp = (s * s + 4 * (0.5 * s * ts)).toFixed(1);

      inner = `
        <defs>
          <linearGradient id="pyr-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FADBD8"/>
            <stop offset="100%" stop-color="#F5B7B1"/>
          </linearGradient>
          <linearGradient id="pyr-right" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#EDBB99"/>
            <stop offset="100%" stop-color="#E59866"/>
          </linearGradient>
        </defs>
        <!-- Hidden base edges -->
        <line x1="${p1[0]}" y1="${p1[1]}" x2="${p4[0]}" y2="${p4[1]}" stroke="#BDC3C7" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="${p4[0]}" y1="${p4[1]}" x2="${p3[0]}" y2="${p3[1]}" stroke="#BDC3C7" stroke-width="1.5" stroke-dasharray="4,4"/>
        <!-- Height line -->
        <line x1="${baseCenter[0]}" y1="${baseCenter[1]}" x2="${apex[0]}" y2="${apex[1]}" stroke="#C0392B" stroke-width="2" stroke-dasharray="3,3"/>
        <circle cx="${baseCenter[0]}" cy="${baseCenter[1]}" r="3" fill="#C0392B"/>

        <!-- Left Triangular Face -->
        <polygon points="${apex[0]},${apex[1]} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}" fill="url(#pyr-left)" stroke="#922B21" stroke-width="2"/>
        <!-- Right Triangular Face -->
        <polygon points="${apex[0]},${apex[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}" fill="url(#pyr-right)" stroke="#922B21" stroke-width="2"/>

        <!-- Slant height line on right face -->
        <line x1="${apex[0]}" y1="${apex[1]}" x2="${(p2[0] + p3[0]) / 2}" y2="${(p2[1] + p3[1]) / 2}" stroke="#27AE60" stroke-width="1.8" stroke-dasharray="3,2"/>

        <!-- Labels -->
        <text x="${(p1[0] + p2[0]) / 2 - 10}" y="${(p1[1] + p2[1]) / 2 + 15}" fill="#922B21" font-size="11" font-weight="700">s = ${s}</text>
        <text x="${baseCenter[0] + 6}" y="${baseCenter[1] - pxH / 2}" fill="#C0392B" font-size="11" font-weight="800">t = ${h}</text>
        <text x="${(p2[0] + p3[0]) / 2 + 18}" y="${(apex[1] + p2[1]) / 2}" fill="#27AE60" font-size="11" font-weight="700">ts = ${ts.toFixed(1)}</text>
        <text x="${cx}" y="222" text-anchor="middle" fill="#922B21" font-size="13" font-weight="800">V = ⅓×La×t = ${vol} cm³  •  Lp = ${lp} cm²</text>
      `;
    } else if (shape === 'cylinder') {
      const r = p.radius || 4, h = p.height || 8;
      const rx = Math.min(r * 9 + 15, 60);
      const ry = rx * 0.38;
      const pxH = Math.min(h * 7 + 25, 90);

      const yTop = cy - pxH / 2;
      const yBot = cy + pxH / 2;

      const vol = (Math.PI * r * r * h).toFixed(1);
      const lp = (2 * Math.PI * r * (r + h)).toFixed(1);

      inner = `
        <defs>
          <linearGradient id="cyl-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#D7BDE2"/>
            <stop offset="30%" stop-color="#EBDEF0"/>
            <stop offset="70%" stop-color="#D7BDE2"/>
            <stop offset="100%" stop-color="#AF7AC5"/>
          </linearGradient>
          <linearGradient id="cyl-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#F5EEF8"/>
            <stop offset="100%" stop-color="#EBDEF0"/>
          </linearGradient>
        </defs>
        <!-- Bottom dashed back curve -->
        <path d="M ${cx - rx} ${yBot} A ${rx} ${ry} 0 0 1 ${cx + rx} ${yBot}" fill="none" stroke="#A569BD" stroke-width="1.5" stroke-dasharray="4,4"/>
        <!-- Bottom front curve & Body -->
        <path d="M ${cx - rx} ${yTop} L ${cx - rx} ${yBot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${yBot} L ${cx + rx} ${yTop} Z" fill="url(#cyl-body)" stroke="#6C3483" stroke-width="2"/>
        <!-- Top Full Ellipse -->
        <ellipse cx="${cx}" cy="${yTop}" rx="${rx}" ry="${ry}" fill="url(#cyl-top)" stroke="#6C3483" stroke-width="2"/>

        <!-- Radius line on top -->
        <line x1="${cx}" y1="${yTop}" x2="${cx + rx}" y2="${yTop}" stroke="#1C2833" stroke-width="2"/>
        <circle cx="${cx}" cy="${yTop}" r="2.5" fill="#1C2833"/>
        <text x="${cx + rx / 2}" y="${yTop - 6}" text-anchor="middle" fill="#512E5F" font-size="11" font-weight="800">r = ${r}</text>

        <!-- Height line on side -->
        <line x1="${cx + rx + 12}" y1="${yTop}" x2="${cx + rx + 12}" y2="${yBot}" stroke="#7D3C98" stroke-width="1.5"/>
        <text x="${cx + rx + 18}" y="${cy}" fill="#512E5F" font-size="11" font-weight="800">t = ${h}</text>

        <text x="${cx}" y="222" text-anchor="middle" fill="#512E5F" font-size="13" font-weight="800">V = πr²t ≈ ${vol} cm³  •  Lp = 2πr(r+t) ≈ ${lp} cm²</text>
      `;
    }

    return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="${SVG_NS}" width="100%" height="100%">${inner}</svg>`;
  }

  /* --- Public API --- */
  return {
    state,
    progress: () => progress,
    totalScore: () => getTotalStars(),
    getTotalStars,
    getTotalCompleted,
    initProgress,
    saveGame,
    loadGame,
    calcLevelStars,
    calcBossStars,
    getLiveStars,
    validateInput,
    checkAnswer,
    lockSubmit,
    isSubmitLocked,
    isLevelUnlocked,
    isWorldUnlocked,
    getWorldProgress,
    getLevelData,
    completeLevel,
    renderShapeSVG,
    renderPythagorasProofSVG,
    renderShapeLabSVG,
    renderShape3DLabSVG,
    startConfetti,
    stopConfetti,
    startBgParticles,
    stopBgParticles,
    getMascotSVG
  };
})();
