/* ======================================
   MAIN — Entry Point, Router, UI
   ====================================== */
(() => {
  'use strict';

  /* --- Elemen DOM --- */
  const $ = (id) => document.getElementById(id);
  const app = $('app');

  // Screens
  const screens = {
    splash: $('screen-splash'),
    menu: $('screen-menu'),
    world: $('screen-world'),
    level: $('screen-level'),
    story: $('screen-story'),
    challenge: $('screen-challenge'),
    result: $('screen-result'),
    formula: $('screen-formula'),
    about: $('screen-about'),
    lab: $('screen-lab'),
    speed: $('screen-speed')
  };

  // Header
  const headerTitle = $('header-title');
  const headerBack = $('btn-back');
  const headerScore = $('header-score');
  const btnSound = $('btn-sound');

  // State
  let currentScreen = 'splash';
  let selectedWorld = 0;
  let selectedLevel = 0;
  let currentLevelData = null;

  // Challenge state
  let challengeAttempts = 0;
  let challengeHintsUsed = 0;
  let reasoningPassed = false;
  let bossIndex = 0;
  let bossLives = 3;
  let bossCorrect = 0;
  let formulaSlots = [];
  let formulaPieces = [];

  /* --- Web Speech API (Text-to-Speech Offline) --- */
  const SpeechHelper = {
    speaking: false,
    currentBtn: null,
    speak(text, buttonEl) {
      if (!('speechSynthesis' in window)) {
        alert('Fitur pembaca suara (Speech Synthesis) tidak didukung di browser ini.');
        return;
      }
      if (this.speaking) {
        this.stop();
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/<[^>]*>/g, ' ')
        .replace(/²/g, ' kuadrat ')
        .replace(/cm²/g, ' sentimeter kuadrat ')
        .replace(/m²/g, ' meter kuadrat ')
        .replace(/√/g, ' akar ')
        .replace(/\+/g, ' tambah ')
        .replace(/×/g, ' kali ')
        .replace(/=/g, ' sama dengan ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => (v.lang && (v.lang.startsWith('id') || v.lang.includes('ID'))));
      if (idVoice) utterance.voice = idVoice;

      this.speaking = true;
      this.currentBtn = buttonEl;
      if (buttonEl) {
        buttonEl.classList.add('speaking');
        buttonEl.innerHTML = '⏹️ Berhenti';
      }

      utterance.onend = () => {
        this.stop();
      };
      utterance.onerror = () => {
        this.stop();
      };

      window.speechSynthesis.speak(utterance);
    },
    stop() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.speaking = false;
      if (this.currentBtn) {
        this.currentBtn.classList.remove('speaking');
        this.currentBtn.innerHTML = '🗣️ Bacakan Soal';
        this.currentBtn = null;
      }
    }
  };

  /* --- Live Star Indicator Helper --- */
  function renderLiveStarsHtml() {
    const stars = GameEngine.getLiveStars(challengeAttempts, challengeHintsUsed);
    let label = '';
    if (stars === 3) {
      label = 'Peluang 3 Bintang ⭐⭐⭐ (Sempurna)';
    } else if (stars === 2) {
      label = 'Peluang 2 Bintang ⭐⭐☆ (Hebat)';
    } else {
      label = 'Peluang 1 Bintang ⭐☆☆ (Tetap Semangat)';
    }

    return `
      <div class="stars-row">
        <span class="star-icon ${stars >= 1 ? '' : 'lost'}">★</span>
        <span class="star-icon ${stars >= 2 ? '' : 'lost'}">★</span>
        <span class="star-icon ${stars >= 3 ? '' : 'lost'}">★</span>
      </div>
      <span class="star-label">${label}</span>
    `;
  }

  function updateLiveStars() {
    const el = $('live-star-meter');
    if (el) {
      el.innerHTML = renderLiveStarsHtml();
    }
  }

  /* --- Screen Router --- */
  function showScreen(name, options = {}) {
    SpeechHelper.stop();
    if (currentScreen === 'speed' && name !== 'speed' && speedTimerInterval) {
      clearInterval(speedTimerInterval);
      speedTimerInterval = null;
    }
    // Hide all screens
    Object.values(screens).forEach(s => { if (s) s.classList.remove('active'); });
    const target = screens[name];
    if (target) {
      target.classList.add('active');
      // Re-trigger animation
      target.style.animation = 'none';
      target.offsetHeight; // force reflow
      target.style.animation = '';
    }
    currentScreen = name;

    // Header adjustments
    const showBack = !['splash', 'menu'].includes(name);
    headerBack.classList.toggle('hidden', !showBack);

    // Update header title
    const titles = {
      splash: '', menu: 'Menu Utama', world: 'Pilih Dunia', level: 'Pilih Level',
      story: 'Cerita', challenge: '', result: 'Hasil', formula: 'Pelajari Rumus', about: 'Tentang',
      lab: 'Studio Lab Geometri', speed: 'Ujian Kilat Pythagoras'
    };
    headerTitle.textContent = options.title || titles[name] || '';

    // Always keep header score in sync with total stars
    if (headerScore) {
      headerScore.textContent = `⭐ ${GameEngine.getTotalStars()}/75`;
    }

    // Render screen content
    switch (name) {
      case 'menu': renderMenu(); break;
      case 'world': renderWorldSelect(); break;
      case 'level': renderLevelSelect(); break;
      case 'story': renderStory(); break;
      case 'challenge': renderChallenge(); break;
      case 'result': renderResult(options); break;
      case 'formula': renderFormula(); break;
      case 'about': renderAbout(); break;
      case 'lab': renderLab(); break;
      case 'speed': renderSpeedScreen(); break;
    }
  }

  /* --- Back Navigation --- */
  function goBack() {
    SpeechHelper.stop();
    GameAudio.click();
    switch (currentScreen) {
      case 'world': showScreen('menu'); break;
      case 'level': showScreen('world'); break;
      case 'story': showScreen('level'); break;
      case 'challenge': showScreen('level'); break;
      case 'result': showScreen('level'); break;
      case 'formula': showScreen('menu'); break;
      case 'about': showScreen('menu'); break;
      case 'lab': showScreen('menu'); break;
      case 'speed':
        if (speedTimerInterval) {
          clearInterval(speedTimerInterval);
          speedTimerInterval = null;
        }
        showScreen('menu');
        break;
      default: showScreen('menu');
    }
  }

  /* --- Splash Screen --- */
  function initSplash() {
    const mascotEl = $('splash-mascot');
    if (mascotEl) mascotEl.innerHTML = GameEngine.getMascotSVG('happy', 100);

    $('btn-start').addEventListener('click', () => {
      GameAudio.init();
      GameAudio.resume();
      GameAudio.click();
      showScreen('menu');
    });
  }

  /* --- Menu Screen & Mascot --- */
  const mascotQuotes = [
    'Halo! Aku <b>Adi si Arsitek Cilik</b> 👷‍♂️📐<br>Ayo jelajahi 5 dunia & taklukkan 25 tantangan geometri!',
    'Tahukah kamu? Pada segitiga siku-siku berlaku rumus <b>a² + b² = c²</b>!',
    'Arsitektur dan struktur bangunan sarat dengan keindahan konsep geometri!',
    'Keliling adalah garis batas luar, sedangkan luas adalah bidang di dalamnya!',
    'Pahami konsepnya, pecahkan tantangannya! Ayo mulai berpetualang! 🚀'
  ];
  let quoteIndex = 0;

  function renderMenu() {
    const mascotEl = $('menu-mascot');
    if (mascotEl) {
      mascotEl.innerHTML = GameEngine.getMascotSVG('normal', 125);
      mascotEl.onclick = () => {
        GameAudio.click();
        mascotEl.innerHTML = GameEngine.getMascotSVG('excited', 125);
        quoteIndex = (quoteIndex + 1) % mascotQuotes.length;
        const speechEl = $('menu-mascot-speech');
        if (speechEl) speechEl.innerHTML = mascotQuotes[quoteIndex];
        setTimeout(() => {
          if (currentScreen === 'menu') mascotEl.innerHTML = GameEngine.getMascotSVG('normal', 125);
        }, 1200);
      };
    }

    // Update stars and missions completed pills
    const starEl = $('menu-stars-count');
    if (starEl) starEl.textContent = GameEngine.getTotalStars();
    const levelEl = $('menu-level-count');
    if (levelEl) levelEl.textContent = GameEngine.getTotalCompleted();
  }

  /* --- World Select Screen (Dashboard Petualangan) --- */
  function renderWorldSelect() {
    // Dashboard Mascot & Stats
    const dashMascotEl = $('dashboard-mascot');
    if (dashMascotEl) {
      dashMascotEl.innerHTML = GameEngine.getMascotSVG('happy', 80);
      dashMascotEl.onclick = () => {
        GameAudio.click();
        dashMascotEl.innerHTML = GameEngine.getMascotSVG('excited', 80);
        const speech = $('dashboard-speech');
        if (speech) speech.textContent = 'Semua 5 dunia terbuka! Pilih dunia mana saja untuk memulai tantangan!';
        setTimeout(() => {
          if (currentScreen === 'world') dashMascotEl.innerHTML = GameEngine.getMascotSVG('happy', 80);
        }, 1400);
      };
    }

    const starEl = $('dash-total-stars');
    if (starEl) starEl.textContent = `${GameEngine.getTotalStars()}/75`;

    const missionsEl = $('dash-total-missions');
    if (missionsEl) missionsEl.textContent = `${GameEngine.getTotalCompleted()}/25`;

    const prog = GameEngine.progress();
    let completedWorlds = 0;
    for (let w = 0; w < 5; w++) {
      let isWorldDone = true;
      for (let l = 0; l < 5; l++) {
        if (!prog[w][l].completed) isWorldDone = false;
      }
      if (isWorldDone) completedWorlds++;
    }

    const worldEl = $('dash-worlds-done');
    if (worldEl) worldEl.textContent = `${completedWorlds}/5`;

    const grid = $('world-grid');
    grid.innerHTML = '';
    GAME_DATA.worldStories.forEach((w, i) => {
      const unlocked = GameEngine.isWorldUnlocked(i);
      const done = GameEngine.getWorldProgress(i);
      const card = document.createElement('div');
      card.className = `world-card${unlocked ? '' : ' locked'}`;
      card.innerHTML = `
        <div class="world-card-icon w${i + 1}">${w.icon}</div>
        <div class="world-card-info">
          <h3>${w.title}</h3>
          <p>${w.subtitle}</p>
          <div class="world-progress"><div class="world-progress-fill" style="width:${(done / 5) * 100}%"></div></div>
        </div>
      `;
      if (unlocked) {
        card.addEventListener('click', () => {
          GameAudio.click();
          selectedWorld = i;
          showScreen('level');
        });
      }
      grid.appendChild(card);
    });
  }

  /* --- Level Select --- */
  function renderLevelSelect() {
    const grid = $('level-grid');
    const worldLabel = $('level-world-label');
    grid.innerHTML = '';
    const ws = GAME_DATA.worldStories[selectedWorld];
    worldLabel.textContent = ws.title;
    headerTitle.textContent = ws.title;

    const firstUncompleted = [0, 1, 2, 3, 4].find(idx => !GameEngine.progress()[selectedWorld][idx].completed);

    for (let l = 0; l < 5; l++) {
      const unlocked = GameEngine.isLevelUnlocked(selectedWorld, l);
      const prog = GameEngine.progress()[selectedWorld][l];
      const levelData = GameEngine.getLevelData(selectedWorld, l);
      const card = document.createElement('div');
      const isBoss = levelData.isBoss;
      let cls = 'level-card';
      if (isBoss) cls += ' boss';
      if (!unlocked) cls += ' locked';
      else if (l === firstUncompleted) cls += ' current';
      card.className = cls;

      if (!unlocked) {
        card.innerHTML = `<span class="lock-icon">🔒</span><div class="level-stars"><span class="star">☆</span><span class="star">☆</span><span class="star">☆</span></div>`;
      } else {
        const stars = prog.stars;
        const starHtml = [0, 1, 2].map(i =>
          `<span class="star${i < stars ? ' filled' : ''}">${i < stars ? '★' : '☆'}</span>`
        ).join('');
        card.innerHTML = `<span class="level-number">${isBoss ? '👑' : (l + 1)}</span><div class="level-stars">${starHtml}</div>`;
        card.addEventListener('click', () => {
          GameAudio.click();
          selectedLevel = l;
          currentLevelData = levelData;
          // Show story if first time entering this world's first level
          if (l === 0 && !prog.completed) {
            showScreen('story');
          } else {
            startChallenge();
          }
        });
      }
      grid.appendChild(card);
    }
  }

  /* --- Story --- */
  function renderStory() {
    const ws = GAME_DATA.worldStories[selectedWorld];
    $('story-world-title').textContent = ws.title;
    $('story-text-content').textContent = ws.story;
    const illust = $('story-illustration');
    // SVG scene based on world
    const scenes = [
      // World 1: Struktur bangunan
      `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="150" width="300" height="50" fill="#8B7355"/>
        <rect x="80" y="80" width="140" height="70" fill="#E8D5B7" stroke="#8B6914" stroke-width="2"/>
        <polygon points="70,80 230,80 150,30" fill="#D94F3B" stroke="#A0352A" stroke-width="2"/>
        <rect x="130" y="110" width="30" height="40" fill="#8B6914"/>
        <rect x="95" y="95" width="25" height="20" fill="#87CEEB" stroke="#5B9BD5" stroke-width="1"/>
        <rect x="180" y="95" width="25" height="20" fill="#87CEEB" stroke="#5B9BD5" stroke-width="1"/>
        <line x1="90" y1="150" x2="90" y2="190" stroke="#8B6914" stroke-width="6"/>
        <line x1="210" y1="150" x2="210" y2="190" stroke="#8B6914" stroke-width="6"/>
        <line x1="130" y1="150" x2="130" y2="190" stroke="#8B6914" stroke-width="4"/>
        <line x1="170" y1="150" x2="170" y2="190" stroke="#8B6914" stroke-width="4"/>
      </svg>`,
      // World 2: Atap detail
      `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="160" width="300" height="40" fill="#90EE90" opacity="0.3"/>
        <polygon points="30,120 270,120 240,50 60,50" fill="#E8A838" stroke="#C08A20" stroke-width="2"/>
        <polygon points="60,50 240,50 150,10" fill="#D94F3B" stroke="#A0352A" stroke-width="2"/>
        <rect x="60" y="120" width="180" height="40" fill="#E8D5B7" stroke="#8B6914" stroke-width="2"/>
        <rect x="125" y="130" width="28" height="30" fill="#8B6914" rx="2"/>
        <rect x="78" y="125" width="20" height="16" fill="#87CEEB" stroke="#5B9BD5"/>
        <rect x="190" y="125" width="20" height="16" fill="#87CEEB" stroke="#5B9BD5"/>
        <polygon points="150,10 145,18 155,18" fill="#E8A838"/>
      </svg>`,
      // World 3: Jembatan
      `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="160" width="300" height="40" fill="#87CEEB" opacity="0.3"/>
        <rect x="0" y="100" width="70" height="100" fill="#8B7355"/>
        <rect x="230" y="100" width="70" height="100" fill="#8B7355"/>
        <rect x="70" y="110" width="160" height="12" fill="#A0522D" stroke="#8B4513" stroke-width="2"/>
        <line x1="100" y1="110" x2="150" y2="70" stroke="#333" stroke-width="2"/>
        <line x1="150" y1="70" x2="200" y2="110" stroke="#333" stroke-width="2"/>
        <line x1="130" y1="110" x2="150" y2="70" stroke="#333" stroke-width="1.5"/>
        <line x1="170" y1="110" x2="150" y2="70" stroke="#333" stroke-width="1.5"/>
        <line x1="70" y1="122" x2="230" y2="122" stroke="#8B4513" stroke-width="3"/>
        <line x1="70" y1="110" x2="70" y2="130" stroke="#8B4513" stroke-width="4"/>
        <line x1="230" y1="110" x2="230" y2="130" stroke="#8B4513" stroke-width="4"/>
      </svg>`,
      // World 4: Taman & Kolam (Lingkaran & Busur)
      `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="300" height="200" fill="#E8F8F5"/>
        <rect x="0" y="140" width="300" height="60" fill="#2ECC71" opacity="0.3"/>
        <circle cx="150" cy="115" r="65" fill="#E8F6F3" stroke="#1ABC9C" stroke-width="4"/>
        <circle cx="150" cy="115" r="45" fill="#D4EFDF" stroke="#27AE60" stroke-width="2" stroke-dasharray="6,4"/>
        <circle cx="150" cy="115" r="25" fill="#5DADE2" stroke="#2980B9" stroke-width="3"/>
        <path d="M 150 115 Q 140 80 130 90" fill="none" stroke="#AED6F1" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 150 115 Q 160 80 170 90" fill="none" stroke="#AED6F1" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 150 115 Q 150 70 150 80" fill="none" stroke="#AED6F1" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="45" cy="110" r="22" fill="#27AE60" opacity="0.85"/>
        <rect x="42" y="132" width="6" height="20" fill="#795548"/>
        <circle cx="255" cy="110" r="22" fill="#27AE60" opacity="0.85"/>
        <rect x="252" y="132" width="6" height="20" fill="#795548"/>
        <circle cx="95" cy="155" r="8" fill="#BDC3C7"/>
        <circle cx="115" cy="165" r="7" fill="#BDC3C7"/>
        <circle cx="185" cy="165" r="7" fill="#BDC3C7"/>
        <circle cx="205" cy="155" r="8" fill="#BDC3C7"/>
        <circle cx="65" cy="160" r="4" fill="#E74C3C"/>
        <circle cx="75" cy="168" r="4" fill="#F39C12"/>
        <circle cx="225" cy="168" r="4" fill="#9B59B6"/>
        <circle cx="235" cy="160" r="4" fill="#E91E63"/>
      </svg>`,
      // World 5: Gudang & Menara (Bangun Ruang)
      `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="300" height="200" fill="#EBF5FB"/>
        <rect x="0" y="155" width="300" height="45" fill="#95A5A6" opacity="0.4"/>
        <rect x="45" y="60" width="45" height="100" fill="#D5DBDB" stroke="#34495E" stroke-width="2"/>
        <polygon points="45,60 90,60 67.5,20" fill="#E74C3C" stroke="#C0392B" stroke-width="2"/>
        <polygon points="67.5,20 90,60 80,60" fill="#922B21" opacity="0.3"/>
        <rect x="58" y="75" width="18" height="15" fill="#34495E" rx="2"/>
        <rect x="58" y="105" width="18" height="15" fill="#34495E" rx="2"/>
        <rect x="58" y="135" width="18" height="25" fill="#2C3E50"/>
        <rect x="115" y="90" width="155" height="70" fill="#EAEDED" stroke="#2980B9" stroke-width="2"/>
        <polygon points="110,90 275,90 195,45" fill="#3498DB" stroke="#2471A3" stroke-width="2"/>
        <rect x="160" y="115" width="65" height="45" fill="#BDC3C7" stroke="#7F8C8D" stroke-width="1.5"/>
        <line x1="160" y1="126" x2="225" y2="126" stroke="#95A5A6" stroke-width="1"/>
        <line x1="160" y1="137" x2="225" y2="137" stroke="#95A5A6" stroke-width="1"/>
        <line x1="160" y1="148" x2="225" y2="148" stroke="#95A5A6" stroke-width="1"/>
        <circle cx="195" cy="70" r="10" fill="#F39C12" stroke="#D68910" stroke-width="1.5"/>
        <rect x="125" y="105" width="18" height="18" fill="#AED6F1" stroke="#3498DB"/>
        <rect x="242" y="105" width="18" height="18" fill="#AED6F1" stroke="#3498DB"/>
      </svg>`
    ];
    illust.innerHTML = scenes[selectedWorld] || scenes[0];
  }

  /* --- Start Challenge --- */
  function startChallenge() {
    currentLevelData = GameEngine.getLevelData(selectedWorld, selectedLevel);
    challengeAttempts = 0;
    challengeHintsUsed = 0;
    reasoningPassed = false;
    bossIndex = 0;
    bossLives = 3;
    bossCorrect = 0;
    GameEngine.state.sliderValue = currentLevelData.sliderConfig ? currentLevelData.sliderConfig.min : 1;
    GameEngine.state.puzzleMatches = {};
    if (currentLevelData.type === 'formulaSort' && currentLevelData.formulaSortConfig) {
      const cfg = currentLevelData.formulaSortConfig;
      formulaSlots = new Array(cfg.correctOrder.length).fill(null);
      formulaPieces = cfg.pieces.map((text, idx) => ({
        id: `fp_${idx}`,
        text: text
      }));
    } else {
      formulaSlots = [];
      formulaPieces = [];
    }
    showScreen('challenge', { title: currentLevelData.title });
  }

  /* --- Challenge Renderer --- */
  function renderChallenge() {
    const ld = currentLevelData;
    if (!ld) return;
    const area = $('challenge-area');
    headerTitle.textContent = ld.title;

    if (ld.type === 'boss') {
      renderBossChallenge(area);
    } else {
      renderSingleChallenge(area, ld);
    }
  }

  function renderSingleChallenge(area, ld) {
    let html = '';
    const hasReasoning = !!(ld.reasoningQuestion && !reasoningPassed);

    // Header: Learning goal & Live Star Indicator
    html += `<div class="challenge-header">
      <span class="challenge-goal">🎯 ${ld.learningGoal}</span>
      <div class="live-star-meter" id="live-star-meter">
        ${renderLiveStarsHtml()}
      </div>
    </div>`;

    // Step banner if reasoning question exists
    if (ld.reasoningQuestion) {
      html += `<div style="text-align:center;margin-bottom:8px">
        <span class="step-banner">${hasReasoning ? 'Langkah 1/2: Analisis & Penalaran Konsep' : 'Langkah 2/2: Perhitungan Matematis Presisi'}</span>
      </div>`;
    }

    // Visual Shape (always visible so students can inspect the geometric structure)
    if (ld.shape && ld.shape !== 'none') {
      const svgContent = GameEngine.renderShapeSVG(ld, ld.type === 'slider' ? GameEngine.state.sliderValue : undefined);
      html += `<div class="challenge-visual" id="challenge-visual">${svgContent}</div>`;
    }

    // IF in Reasoning Phase (Step 1): show conceptual inquiry card
    if (hasReasoning) {
      const rq = ld.reasoningQuestion;
      html += `
        <div class="reasoning-card" id="reasoning-card">
          <div class="reasoning-header">
            <span>🧠</span> Tahap Penalaran: Analisis Komponen & Formula
          </div>
          <div class="reasoning-prompt">${rq.prompt}</div>
          <div class="reasoning-options" id="reasoning-options">
            ${rq.options.map((opt, i) => `
              <button class="reasoning-btn" data-index="${i}">
                <span class="reasoning-badge">${String.fromCharCode(65 + i)}</span>
                <span class="reasoning-text">${opt.text}</span>
              </button>
            `).join('')}
          </div>
          <div class="reasoning-feedback" id="reasoning-feedback"></div>
          <button class="btn btn-primary btn-proceed-step hidden" id="btn-proceed-step">
            Lanjut ke Perhitungan Presisi →
          </button>
        </div>
      `;
      area.innerHTML = html;
      bindReasoningEvents(ld);
      return;
    }

    // Question
    html += `<div class="challenge-question">${ld.question}</div>`;

    // Type-specific input
    switch (ld.type) {
      case 'input':
        html += renderInputType(ld);
        break;
      case 'slider':
        html += renderSliderType(ld);
        break;
      case 'mcq':
        html += renderMCQType(ld);
        break;
      case 'puzzle':
        html += renderPuzzleType(ld);
        break;
      case 'formulaSort':
        html += renderFormulaSortType(ld);
        break;
    }

    // Hint area
    html += `<div id="hint-area"></div>`;

    // Actions with 3-Tier Scaffolding label
    const hints = ld.hints || [];
    const tierNum = Math.min(challengeHintsUsed + 1, 3);
    const currHint = hints[challengeHintsUsed];
    const tierLabel = currHint && currHint.tier ? ` (${currHint.tier})` : '';

    html += `<div class="challenge-actions">
      <button class="btn btn-sm btn-hint" id="btn-hint">💡 Bantuan Tier ${tierNum}/3${tierLabel}</button>
    </div>`;

    area.innerHTML = html;
    bindChallengeEvents(ld);
  }

  /* --- Event Handler: Reasoning Step --- */
  function bindReasoningEvents(ld) {
    const btns = document.querySelectorAll('.reasoning-btn');
    const fbEl = $('reasoning-feedback');
    const proceedBtn = $('btn-proceed-step');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const opt = ld.reasoningQuestion.options[idx];

        if (opt.correct) {
          GameAudio.correct();
          btns.forEach(b => {
            b.disabled = true;
            b.classList.remove('selected-wrong');
          });
          btn.classList.add('selected-correct');
          fbEl.className = 'reasoning-feedback success';
          fbEl.innerHTML = `<strong>Tepat Sekali!</strong> ${opt.explanation}`;
          proceedBtn.classList.remove('hidden');
        } else {
          GameAudio.wrong();
          btn.classList.add('selected-wrong');
          fbEl.className = 'reasoning-feedback error';
          fbEl.innerHTML = `<strong>Pikirkan Kembali:</strong> ${opt.explanation}`;
          setTimeout(() => btn.classList.remove('selected-wrong'), 700);
        }
      });
    });

    proceedBtn.addEventListener('click', () => {
      GameAudio.click();
      reasoningPassed = true;
      renderSingleChallenge($('challenge-area'), ld);
    });
  }

  function renderInputType(ld) {
    return `<div class="challenge-input-area">
      <div class="input-group">
        <input type="text" class="input-answer" id="input-answer" inputmode="decimal" placeholder="Jawaban..." autocomplete="off">
        <span class="input-unit">${ld.unit || ''}</span>
      </div>
      <button class="btn btn-primary" id="btn-submit">Periksa Jawaban</button>
    </div>`;
  }

  function renderSliderType(ld) {
    const cfg = ld.sliderConfig;
    const val = GameEngine.state.sliderValue;
    return `<div class="challenge-input-area">
      <div class="slider-container">
        <input type="range" class="slider-track" id="slider-input" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${val}">
        <div class="slider-labels"><span>${cfg.min} ${cfg.unit}</span><span>${cfg.max} ${cfg.unit}</span></div>
        <div class="slider-value" id="slider-value">${val} ${cfg.unit}</div>
      </div>
      <div class="challenge-question" id="slider-target" style="margin-top:8px;font-weight:700;color:#1B6B4A">🎯 Target: ${ld.targetLabel}</div>
      <button class="btn btn-primary" id="btn-submit">Periksa Jawaban</button>
    </div>`;
  }

  function renderFormulaSortType(ld) {
    const cfg = ld.formulaSortConfig;
    const numSlots = cfg.correctOrder.length;

    let html = '<div class="formula-sort-area" id="formula-sort-area">';

    // 1. Kolom Jawaban
    html += `
      <div class="formula-zone">
        <div class="formula-zone-label">📥 Kolom Jawaban (Ketuk slot untuk melepas):</div>
        <div class="formula-slots-row" id="formula-slots-row">`;
    for (let i = 0; i < numSlots; i++) {
      const placed = formulaSlots[i];
      if (placed) {
        html += `<div class="formula-slot filled" data-slot-index="${i}" title="Ketuk untuk melepas">
          <span>${placed.text}</span>
        </div>`;
      } else {
        html += `<div class="formula-slot" data-slot-index="${i}">
          <span class="slot-placeholder">${i + 1}</span>
        </div>`;
      }
    }
    html += `</div>
      </div>`;

    // 2. Potongan Rumus
    html += `
      <div class="formula-zone">
        <div class="formula-zone-label">🧩 Potongan Rumus (Ketuk untuk memasukkan ke kolom):</div>
        <div class="formula-pieces-row" id="formula-pieces-row">`;
    formulaPieces.forEach((p) => {
      const isPlaced = formulaSlots.some(s => s && s.id === p.id);
      html += `<div class="formula-piece${isPlaced ? ' placed' : ''}" draggable="${!isPlaced}" data-piece-id="${p.id}" data-piece-text="${p.text}">
        ${p.text}
      </div>`;
    });
    html += `</div>
      </div>`;

    // 3. Tombol Aksi
    html += `
      <div class="formula-actions">
        <button class="btn btn-sm btn-outline" id="btn-formula-reset">↺ Atur Ulang</button>
        <button class="btn btn-primary" id="btn-submit">Periksa Jawaban</button>
      </div>
    </div>`;

    return html;
  }

  function renderMCQType(ld) {
    let html = '<div class="mcq-grid">';
    const labels = ['A', 'B', 'C', 'D'];
    ld.options.forEach((opt, i) => {
      html += `<button class="mcq-option" data-index="${i}" data-value="${opt.value}">
        <span class="mcq-option-label">${labels[i]}</span> ${opt.text}
      </button>`;
    });
    html += '</div>';
    return html;
  }

  function renderPuzzleType(ld) {
    const cfg = ld.puzzleConfig;
    let html = '<div class="puzzle-area" id="puzzle-area">';

    // Triangle visual
    html += `<div class="challenge-visual" style="aspect-ratio:4/3;max-width:350px;margin:0 auto 12px">
      ${GameEngine.renderShapeSVG({ shape: 'rightTriangle', shapeParams: { a: cfg.triangle.a, b: cfg.triangle.b, c: cfg.triangle.c, unknown: '', labels: { a: 'a=3', b: 'b=4', c: 'c=5' } } })}
    </div>`;

    // Drop zones
    html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px">';
    cfg.dropzones.forEach(dz => {
      html += `<div class="puzzle-dropzone" id="dz-${dz.id}" data-correct="${dz.correctValue}" style="width:100px;min-height:70px;flex-direction:column;gap:4px">
        <small style="color:#777;font-size:11px">${dz.label}</small>
        <span style="font-weight:700;color:#1B6B4A" id="dz-label-${dz.id}">?²</span>
      </div>`;
    });
    html += '</div>';

    // Draggable squares
    html += '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap" id="draggables-container">';
    // Shuffle draggables
    const shuffled = [...cfg.draggables].sort(() => Math.random() - 0.5);
    shuffled.forEach(d => {
      html += `<div class="puzzle-draggable" draggable="true" id="drag-${d.id}" data-value="${d.value}" data-label="${d.areaLabel}">${d.areaLabel}</div>`;
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  /* --- Boss Challenge --- */
  function renderBossChallenge(area) {
    const ld = currentLevelData;
    const bq = ld.bossQuestions[bossIndex];
    if (!bq) return;

    let html = '';
    // Boss header
    html += `<div class="boss-header">
      <div class="boss-lives" id="boss-lives">${renderLives()}</div>
      <div class="boss-progress">${renderBossDots()}</div>
    </div>`;

    // Learning goal
    html += `<div class="challenge-header"><span class="challenge-goal">🎯 ${ld.learningGoal}</span></div>`;

    // Visual
    if (bq.shape && bq.shape !== 'none') {
      const svgContent = GameEngine.renderShapeSVG(bq);
      html += `<div class="challenge-visual">${svgContent}</div>`;
    }

    // Question
    html += `<div class="challenge-question">${bq.question}</div>`;

    // Type
    if (bq.type === 'input') {
      html += `<div class="challenge-input-area">
        <div class="input-group">
          <input type="text" class="input-answer" id="input-answer" inputmode="decimal" placeholder="Jawaban..." autocomplete="off">
          <span class="input-unit">${bq.unit || ''}</span>
        </div>
        <button class="btn btn-primary" id="btn-submit">Periksa Jawaban</button>
      </div>`;
    } else if (bq.type === 'mcq') {
      let mcqHtml = '<div class="mcq-grid">';
      const labels = ['A', 'B', 'C', 'D'];
      bq.options.forEach((opt, i) => {
        mcqHtml += `<button class="mcq-option" data-index="${i}" data-value="${opt.value}">
          <span class="mcq-option-label">${labels[i]}</span> ${opt.text}
        </button>`;
      });
      mcqHtml += '</div>';
      html += mcqHtml;
    }

    // Hint area
    html += `<div id="hint-area"></div>`;
    html += `<div class="challenge-actions">
      <button class="btn btn-sm btn-hint" id="btn-hint">💡 Petunjuk</button>
    </div>`;

    area.innerHTML = html;
    bindBossEvents(bq);
  }

  function renderLives() {
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += `<span class="heart${i >= bossLives ? ' lost' : ''}">❤️</span>`;
    }
    return html;
  }

  function renderBossDots() {
    let html = '';
    for (let i = 0; i < 3; i++) {
      let cls = 'boss-dot';
      if (i < bossIndex) cls += ' done';
      else if (i === bossIndex) cls += ' current';
      html += `<span class="${cls}"></span>`;
    }
    return html;
  }

  /* --- Event Binding --- */
  function bindChallengeEvents(ld) {
    // Submit button
    const btnSubmit = $('btn-submit');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => handleSubmit(ld));
    }

    // Enter key on input
    const input = $('input-answer');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit(ld);
      });
      // Focus input
      setTimeout(() => input.focus(), 400);
    }

    // Slider
    const slider = $('slider-input');
    if (slider) {
      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        GameEngine.state.sliderValue = val;
        const display = $('slider-value');
        if (display) display.textContent = `${val} ${ld.sliderConfig.unit}`;
        // Update visual
        const visual = $('challenge-visual');
        if (visual) visual.innerHTML = GameEngine.renderShapeSVG(ld, val);
      });
    }

    // MCQ options
    document.querySelectorAll('.mcq-option').forEach(btn => {
      btn.addEventListener('click', () => handleMCQ(ld, btn));
    });

    // Puzzle drag & drop
    if (ld.type === 'puzzle') {
      bindPuzzleEvents(ld);
    }

    // Formula sort
    if (ld.type === 'formulaSort') {
      bindFormulaSortEvents(ld);
    }

    // Hint button (3-Tier Scaffolding Hints)
    const btnHint = $('btn-hint');
    if (btnHint) {
      btnHint.addEventListener('click', () => {
        const hints = ld.hints || [];
        if (challengeHintsUsed < hints.length) {
          GameAudio.hintSound();
          const hintArea = $('hint-area');
          const hintObj = hints[challengeHintsUsed];

          const tierLabel = typeof hintObj === 'object' && hintObj.tier ? hintObj.tier : `Tahap ${challengeHintsUsed + 1}`;
          const tierText = typeof hintObj === 'object' && hintObj.text ? hintObj.text : hintObj;
          const tierClass = typeof hintObj === 'object' && hintObj.tier ? `tier-${hintObj.tier.toLowerCase()}` : 'tier-konsep';

          hintArea.innerHTML = `
            <div class="hint-popup">
              <div style="display:flex;align-items:center;margin-bottom:6px">
                <span class="hint-tier-tag ${tierClass}">Tier ${challengeHintsUsed + 1}: ${tierLabel}</span>
                <span class="hint-penalty-badge" style="background:rgba(232,168,56,0.2);color:#B87700">Panduan Belajar</span>
              </div>
              <div class="hint-text" style="font-size:13px;line-height:1.5">${tierText}</div>
            </div>
          `;

          // Scaffolding visual highlight on shape
          const visualEl = $('challenge-visual');
          if (visualEl) {
            visualEl.style.boxShadow = '0 0 16px rgba(232, 168, 56, 0.7)';
            visualEl.style.borderColor = 'var(--c-secondary)';
            setTimeout(() => {
              if (visualEl) {
                visualEl.style.boxShadow = '';
                visualEl.style.borderColor = '';
              }
            }, 2500);
          }

          challengeHintsUsed++;
          updateLiveStars();

          // Update button state
          const nextTierNum = Math.min(challengeHintsUsed + 1, 3);
          if (challengeHintsUsed < hints.length) {
            const nextHint = hints[challengeHintsUsed];
            const nextTierName = nextHint && nextHint.tier ? ` (${nextHint.tier})` : '';
            btnHint.textContent = `💡 Bantuan Tier ${nextTierNum}/3${nextTierName}`;
          } else {
            btnHint.textContent = '💡 Semua Bantuan Terbuka';
            btnHint.disabled = true;
            btnHint.style.opacity = '0.6';
          }
        } else {
          const hintArea = $('hint-area');
          hintArea.innerHTML = `<div class="hint-popup"><div class="hint-label">💡 Bantuan Terbuka</div>Semua panduan bertahap telah dibuka. Silakan coba langkah kalkulasinya!</div>`;
        }
      });
    }
  }

  function bindBossEvents(bq) {
    const btnSubmit = $('btn-submit');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => handleBossSubmit(bq));
    }
    const input = $('input-answer');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleBossSubmit(bq);
      });
      setTimeout(() => input.focus(), 400);
    }
    // MCQ
    document.querySelectorAll('.mcq-option').forEach(btn => {
      btn.addEventListener('click', () => handleBossMCQ(bq, btn));
    });
    // Hint
    const btnHint = $('btn-hint');
    if (btnHint) {
      btnHint.addEventListener('click', () => {
        const hints = bq.hints || [];
        if (challengeHintsUsed < hints.length) {
          GameAudio.hintSound();
          const hintArea = $('hint-area');
          const hintObj = hints[challengeHintsUsed];
          const hintText = typeof hintObj === 'object' && hintObj.text ? hintObj.text : hintObj;
          const hintTier = typeof hintObj === 'object' && hintObj.tier ? hintObj.tier : `Tahap ${challengeHintsUsed + 1}`;
          hintArea.innerHTML = `<div class="hint-popup"><div class="hint-label">💡 Petunjuk: ${hintTier}</div>${hintText}</div>`;
          challengeHintsUsed++;
        }
      });
    }
  }

  /* --- Puzzle Drag & Drop --- */
  function bindPuzzleEvents(ld) {
    const draggables = document.querySelectorAll('.puzzle-draggable');
    const dropzones = document.querySelectorAll('.puzzle-dropzone');
    let draggedEl = null;

    // Touch & mouse drag
    draggables.forEach(el => {
      // Drag start
      el.addEventListener('dragstart', (e) => {
        draggedEl = el;
        el.style.opacity = '0.5';
        e.dataTransfer.setData('text/plain', el.dataset.value);
      });
      el.addEventListener('dragend', () => {
        el.style.opacity = '';
      });

      // Touch support
      let touchStartX, touchStartY, clone;
      el.addEventListener('touchstart', (e) => {
        draggedEl = el;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        clone = el.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '999';
        clone.style.opacity = '0.8';
        clone.style.transform = 'scale(1.1)';
        document.body.appendChild(clone);
        updateClonePos(touch);
      }, { passive: true });
      el.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (clone) updateClonePos(e.touches[0]);
      }, { passive: false });
      el.addEventListener('touchend', (e) => {
        if (clone) {
          clone.remove();
          clone = null;
        }
        // Find drop target
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const dz = target ? target.closest('.puzzle-dropzone') : null;
        if (dz && draggedEl) {
          handlePuzzleDrop(ld, dz, draggedEl);
        }
        draggedEl = null;
      });

      function updateClonePos(touch) {
        if (!clone) return;
        clone.style.left = (touch.clientX - 30) + 'px';
        clone.style.top = (touch.clientY - 20) + 'px';
      }
    });

    dropzones.forEach(dz => {
      dz.addEventListener('dragover', (e) => {
        e.preventDefault();
        dz.classList.add('active');
      });
      dz.addEventListener('dragleave', () => {
        dz.classList.remove('active');
      });
      dz.addEventListener('drop', (e) => {
        e.preventDefault();
        dz.classList.remove('active');
        if (draggedEl) handlePuzzleDrop(ld, dz, draggedEl);
      });
    });
  }

  function handlePuzzleDrop(ld, dropzone, dragEl) {
    const dragVal = parseInt(dragEl.dataset.value);
    const correctVal = parseInt(dropzone.dataset.correct);
    const dzId = dropzone.id.replace('dz-', '');

    if (dragVal === correctVal) {
      // Correct match
      GameAudio.correct();
      dropzone.classList.add('correct');
      const label = $(`dz-label-${dzId}`);
      if (label) label.textContent = dragEl.dataset.label;
      dragEl.classList.add('placed');
      GameEngine.state.puzzleMatches[dzId] = dragVal;

      // Check if all matched
      const cfg = ld.puzzleConfig;
      const allDone = cfg.dropzones.every(dz => GameEngine.state.puzzleMatches[dz.id] === dz.correctValue);
      if (allDone) {
        const earnedStars = GameEngine.calcLevelStars(challengeAttempts, challengeHintsUsed);
        setTimeout(() => {
          showFeedback(true, '🎉 Terbukti! a² + b² = c²\n9 + 16 = 25 ✓', () => {
            finishLevel(earnedStars);
          });
        }, 500);
      }
    } else {
      // Wrong match
      GameAudio.wrong();
      challengeAttempts++;
      updateLiveStars();
      dropzone.style.animation = 'shake 0.4s';
      setTimeout(() => { dropzone.style.animation = ''; }, 400);
      showFeedback(false, ld.feedbackWrong ? ld.feedbackWrong() : 'Coba pasangkan ke sisi yang benar!');
    }
  }

  /* --- Formula Sort Events & Logic --- */
  function bindFormulaSortEvents(ld) {
    const btnReset = $('btn-formula-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        GameAudio.click();
        formulaSlots = new Array(ld.formulaSortConfig.correctOrder.length).fill(null);
        updateFormulaSortUI(ld);
      });
    }

    attachFormulaItemListeners(ld);
  }

  function attachFormulaItemListeners(ld) {
    // Click piece -> fill first empty slot
    document.querySelectorAll('.formula-piece:not(.placed)').forEach(pieceEl => {
      pieceEl.addEventListener('click', () => {
        const pId = pieceEl.dataset.pieceId;
        const pText = pieceEl.dataset.pieceText;
        const emptyIdx = formulaSlots.findIndex(s => s === null);
        if (emptyIdx !== -1) {
          GameAudio.click();
          formulaSlots[emptyIdx] = { id: pId, text: pText };
          updateFormulaSortUI(ld);
        }
      });
    });

    // Click filled slot -> remove piece
    document.querySelectorAll('.formula-slot.filled').forEach(slotEl => {
      slotEl.addEventListener('click', () => {
        const slotIdx = parseInt(slotEl.dataset.slotIndex);
        if (formulaSlots[slotIdx]) {
          GameAudio.click();
          formulaSlots[slotIdx] = null;
          updateFormulaSortUI(ld);
        }
      });
    });

    // Desktop Drag & Drop
    let draggedPieceId = null;
    document.querySelectorAll('.formula-piece:not(.placed)').forEach(pieceEl => {
      pieceEl.addEventListener('dragstart', (e) => {
        draggedPieceId = pieceEl.dataset.pieceId;
        e.dataTransfer.setData('text/plain', pieceEl.dataset.pieceId);
      });
    });

    document.querySelectorAll('.formula-slot').forEach(slotEl => {
      slotEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        slotEl.classList.add('active');
      });
      slotEl.addEventListener('dragleave', () => {
        slotEl.classList.remove('active');
      });
      slotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        slotEl.classList.remove('active');
        const pId = e.dataTransfer.getData('text/plain') || draggedPieceId;
        const piece = formulaPieces.find(p => p.id === pId);
        if (piece) {
          const slotIdx = parseInt(slotEl.dataset.slotIndex);
          const prevIdx = formulaSlots.findIndex(s => s && s.id === pId);
          if (prevIdx !== -1) formulaSlots[prevIdx] = null;

          formulaSlots[slotIdx] = { id: piece.id, text: piece.text };
          GameAudio.click();
          updateFormulaSortUI(ld);
        }
        draggedPieceId = null;
      });
    });

    // Touch Drag Support for Pieces
    document.querySelectorAll('.formula-piece:not(.placed)').forEach(pieceEl => {
      let clone = null;
      pieceEl.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        clone = pieceEl.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '999';
        clone.style.opacity = '0.85';
        clone.style.transform = 'scale(1.1)';
        clone.style.left = (touch.clientX - 25) + 'px';
        clone.style.top = (touch.clientY - 25) + 'px';
        document.body.appendChild(clone);
      }, { passive: true });

      pieceEl.addEventListener('touchmove', (e) => {
        if (!clone) return;
        e.preventDefault();
        const touch = e.touches[0];
        clone.style.left = (touch.clientX - 25) + 'px';
        clone.style.top = (touch.clientY - 25) + 'px';
      }, { passive: false });

      pieceEl.addEventListener('touchend', (e) => {
        if (clone) {
          clone.remove();
          clone = null;
        }
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const slotEl = target ? target.closest('.formula-slot') : null;
        if (slotEl) {
          const pId = pieceEl.dataset.pieceId;
          const piece = formulaPieces.find(p => p.id === pId);
          if (piece) {
            const slotIdx = parseInt(slotEl.dataset.slotIndex);
            const prevIdx = formulaSlots.findIndex(s => s && s.id === pId);
            if (prevIdx !== -1) formulaSlots[prevIdx] = null;
            formulaSlots[slotIdx] = { id: piece.id, text: piece.text };
            GameAudio.click();
            updateFormulaSortUI(ld);
          }
        }
      });
    });
  }

  function updateFormulaSortUI(ld) {
    const slotsRow = $('formula-slots-row');
    const piecesRow = $('formula-pieces-row');
    if (!slotsRow || !piecesRow) return;

    const numSlots = ld.formulaSortConfig.correctOrder.length;
    let slotsHtml = '';
    for (let i = 0; i < numSlots; i++) {
      const placed = formulaSlots[i];
      if (placed) {
        slotsHtml += `<div class="formula-slot filled" data-slot-index="${i}" title="Ketuk untuk melepas">
          <span>${placed.text}</span>
        </div>`;
      } else {
        slotsHtml += `<div class="formula-slot" data-slot-index="${i}">
          <span class="slot-placeholder">${i + 1}</span>
        </div>`;
      }
    }
    slotsRow.innerHTML = slotsHtml;

    let piecesHtml = '';
    formulaPieces.forEach((p) => {
      const isPlaced = formulaSlots.some(s => s && s.id === p.id);
      piecesHtml += `<div class="formula-piece${isPlaced ? ' placed' : ''}" draggable="${!isPlaced}" data-piece-id="${p.id}" data-piece-text="${p.text}">
        ${p.text}
      </div>`;
    });
    piecesRow.innerHTML = piecesHtml;

    attachFormulaItemListeners(ld);
  }

  function handleFormulaSortSubmit(ld) {
    const hasEmpty = formulaSlots.some(s => s === null);
    if (hasEmpty) {
      showFeedback(false, 'Lengkapi semua kolom jawaban terlebih dahulu!');
      return;
    }

    const userFormula = formulaSlots.map(s => s.text).join('');
    const targetFormula = ld.formulaSortConfig.correctOrder.join('');

    let isCorrect = (userFormula === targetFormula);
    if (!isCorrect) {
      if (ld.id === '4-4') {
        isCorrect = (userFormula === 'L=π×r²' || userFormula === 'L=r²×π');
      } else if (ld.id === '5-4') {
        isCorrect = (userFormula === 'V=⅓×Lalas×t' || userFormula === 'V=⅓×t×Lalas' || userFormula === 'V=Lalas×t×⅓');
      }
    }

    if (isCorrect) {
      GameAudio.correct();
      const earnedStars = GameEngine.calcLevelStars(challengeAttempts, challengeHintsUsed);

      const slotsRow = $('formula-slots-row');
      if (slotsRow) slotsRow.classList.add('correct');

      showFeedback(true, '🎉 Hebat! Rumus tersusun dengan benar!', () => {
        finishLevel(earnedStars);
      });
    } else {
      GameAudio.wrong();
      challengeAttempts++;
      updateLiveStars();

      const slotsRow = $('formula-slots-row');
      if (slotsRow) {
        slotsRow.style.animation = 'shake 0.4s';
        setTimeout(() => { slotsRow.style.animation = ''; }, 400);
      }
      const fb = typeof ld.feedbackWrong === 'function' ? ld.feedbackWrong() : 'Susunan rumus belum tepat, coba periksa urutannya!';
      showFeedback(false, fb);
    }
  }

  /* --- Handle Submit (Input, Slider, FormulaSort) --- */
  function handleSubmit(ld) {
    if (GameEngine.isSubmitLocked()) return;
    GameEngine.lockSubmit();

    if (ld.type === 'formulaSort') {
      handleFormulaSortSubmit(ld);
      return;
    }

    let userVal;
    if (ld.type === 'slider') {
      userVal = GameEngine.state.sliderValue;
    } else {
      const input = $('input-answer');
      const result = GameEngine.validateInput(input.value);
      if (!result.valid) {
        showInlineError(input, result.error);
        return;
      }
      userVal = result.value;
    }

    // Check answer
    let isCorrect;
    if (ld.answerCheck) {
      isCorrect = ld.answerCheck(userVal);
    } else {
      isCorrect = GameEngine.checkAnswer(userVal, ld.answer);
    }

    if (isCorrect) {
      GameAudio.correct();
      const earnedStars = GameEngine.calcLevelStars(challengeAttempts, challengeHintsUsed);

      const inputEl = $('input-answer') || $('slider-input');
      if (inputEl) inputEl.classList.add('success');

      showFeedback(true, '🎉 Jawaban Tepat! Analisis dan perhitunganmu sangat presisi!', () => {
        finishLevel(earnedStars);
      });
    } else {
      GameAudio.wrong();
      challengeAttempts++;
      updateLiveStars();

      const inputEl = $('input-answer');
      if (inputEl) {
        inputEl.classList.add('error');
        // KOSONGKAN INPUT & SHAKE (Inquiry-Based: siswa harus menghitung ulang mandiri)
        inputEl.value = '';
        setTimeout(() => inputEl.classList.remove('error'), 600);
        setTimeout(() => inputEl.focus(), 250);
      }

      const visualEl = $('challenge-visual');
      if (visualEl) {
        visualEl.style.animation = 'shake 0.4s';
        setTimeout(() => { if (visualEl) visualEl.style.animation = ''; }, 450);
      }

      const fb = typeof ld.feedbackWrong === 'function' ? ld.feedbackWrong(userVal) : 'Jawaban belum tepat, silakan coba hitung kembali!';
      showFeedback(false, fb);
    }
  }

  /* --- Handle MCQ --- */
  function handleMCQ(ld, btn) {
    if (GameEngine.isSubmitLocked()) return;
    GameEngine.lockSubmit();

    const idx = parseInt(btn.dataset.index);
    const isCorrect = idx === ld.correctIndex;

    // Disable all options
    document.querySelectorAll('.mcq-option').forEach(b => b.disabled = true);

    if (isCorrect) {
      GameAudio.correct();
      btn.classList.add('correct');
      const earnedStars = GameEngine.calcLevelStars(challengeAttempts, challengeHintsUsed);

      setTimeout(() => {
        showFeedback(true, '🎉 Pilihan Tepat! Pemahaman konsepmu sangat baik!', () => finishLevel(earnedStars));
      }, 400);
    } else {
      GameAudio.wrong();
      btn.classList.add('wrong');
      challengeAttempts++;
      updateLiveStars();

      const fb = ld.feedbackByOption ? ld.feedbackByOption[idx] : 'Jawaban kurang tepat, coba lagi!';
      setTimeout(() => {
        showFeedback(false, fb || 'Jawaban kurang tepat, coba periksa kembali sifat bangunnya!', () => {
          // Re-enable and reset options
          document.querySelectorAll('.mcq-option').forEach(b => {
            b.disabled = false;
            b.classList.remove('wrong', 'selected');
          });
        });
      }, 500);
    }
  }

  /* --- Boss Submit --- */
  function handleBossSubmit(bq) {
    if (GameEngine.isSubmitLocked()) return;
    GameEngine.lockSubmit();

    const input = $('input-answer');
    const result = GameEngine.validateInput(input.value);
    if (!result.valid) {
      showInlineError(input, result.error);
      return;
    }
    const userVal = result.value;
    const isCorrect = GameEngine.checkAnswer(userVal, bq.answer);

    if (isCorrect) {
      GameAudio.correct();
      bossCorrect++;
      input.classList.add('success');
      showFeedback(true, '✅ Benar!', () => nextBossQuestion());
    } else {
      GameAudio.loseLife();
      bossLives--;
      challengeAttempts++;

      // Update hearts immediately
      const livesEl = $('boss-lives');
      if (livesEl) livesEl.innerHTML = renderLives();

      input.classList.add('error');
      // Kosongkan input dan shake (Inquiry-based feedback)
      input.value = '';
      setTimeout(() => input.classList.remove('error'), 500);
      setTimeout(() => input.focus(), 250);

      if (bossLives <= 0) {
        showFeedback(false, '💔 Nyawa habis! Jangan menyerah, seorang arsitek sejati belajar dari kesalahan.', () => {
          finishBoss();
        });
      } else {
        const fb = typeof bq.feedbackWrong === 'function' ? bq.feedbackWrong(userVal) : 'Jawaban belum tepat!';
        showFeedback(false, fb + `\n\n❤️ Sisa nyawa: ${bossLives}`);
      }
    }
  }

  function handleBossMCQ(bq, btn) {
    if (GameEngine.isSubmitLocked()) return;
    GameEngine.lockSubmit();

    const idx = parseInt(btn.dataset.index);
    const isCorrect = idx === bq.correctIndex;

    document.querySelectorAll('.mcq-option').forEach(b => b.disabled = true);

    if (isCorrect) {
      GameAudio.correct();
      bossCorrect++;
      btn.classList.add('correct');
      setTimeout(() => showFeedback(true, '✅ Benar!', () => nextBossQuestion()), 400);
    } else {
      GameAudio.loseLife();
      bossLives--;
      btn.classList.add('wrong');

      // Update hearts immediately
      const livesEl = $('boss-lives');
      if (livesEl) livesEl.innerHTML = renderLives();

      if (bossLives <= 0) {
        const fb = bq.feedbackByOption ? bq.feedbackByOption[idx] : '';
        setTimeout(() => showFeedback(false, '💔 Nyawa habis! ' + fb, () => finishBoss()), 500);
      } else {
        const fb = bq.feedbackByOption ? bq.feedbackByOption[idx] : 'Coba lagi!';
        setTimeout(() => showFeedback(false, (fb || 'Jawaban kurang tepat!') + `\n\n❤️ Sisa nyawa: ${bossLives}`, () => {
          document.querySelectorAll('.mcq-option').forEach(b => { b.disabled = false; b.classList.remove('wrong'); });
        }), 500);
      }
    }
  }

  function nextBossQuestion() {
    bossIndex++;
    challengeHintsUsed = 0;
    if (bossIndex >= currentLevelData.bossQuestions.length || bossLives <= 0) {
      finishBoss();
    } else {
      renderBossChallenge($('challenge-area'));
    }
  }

  function finishBoss() {
    if (bossLives <= 0) {
      showBossGameOver();
      return;
    }
    const earnedStars = GameEngine.calcBossStars(bossCorrect, bossLives);
    finishLevel(earnedStars);
  }

  function showBossGameOver() {
    GameAudio.wrong();
    showFeedback(false, '💔 Kamu kehabisan nyawa saat menghadapi Boss!\n\nJangan berkecil hati! Pelajari kembali rumus dan strategi geometrimu, lalu coba lagi.', () => {
      startChallenge();
    });
  }

  /* --- Finish Level with Post-Level Reflection (Deep Learning) --- */
  function finishLevel(earnedStars = 3) {
    const ld = currentLevelData;
    if (ld && ld.reflectionCard) {
      showReflectionModal(ld, () => {
        finalizeLevelComplete(earnedStars);
      });
    } else {
      finalizeLevelComplete(earnedStars);
    }
  }

  function finalizeLevelComplete(earnedStars = 3) {
    const result = GameEngine.completeLevel(selectedWorld, selectedLevel, earnedStars, challengeAttempts);
    GameAudio.levelComplete();
    GameEngine.startConfetti();
    setTimeout(() => GameEngine.stopConfetti(), 3000);
    showScreen('result', result);
  }

  /* --- Post-Level Reflection Modal (Metacognition & Arsitektur Bangunan) --- */
  function showReflectionModal(ld, onDone) {
    const rc = ld.reflectionCard;
    if (!rc) {
      if (onDone) onDone();
      return;
    }

    const existing = document.querySelector('.reflection-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'reflection-overlay';

    let choicesHtml = '';
    if (rc.options && rc.options.length) {
      choicesHtml = `
        <div class="reflection-choices" id="reflection-choices">
          ${rc.options.map((opt, i) => `
            <button class="reflection-opt-btn" data-index="${i}">
              <span style="font-weight:700;margin-right:6px">${String.fromCharCode(65 + i)}.</span> ${opt.text}
            </button>
          `).join('')}
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="reflection-modal">
        <div class="reflection-top">
          <div class="reflection-top-icon">🪞</div>
          <div>
            <div class="reflection-title">Jurnal Refleksi Arsitek</div>
            <div class="reflection-subtitle">Makna Konsep dalam Arsitektur Bangunan</div>
          </div>
        </div>

        <div class="reflection-question-box">
          <div class="reflection-question-label">Pertanyaan Reflektif:</div>
          <div class="reflection-question-text">${rc.question}</div>
        </div>

        ${choicesHtml}

        <div class="reflection-conclusion-card ${rc.options && rc.options.length ? '' : 'show'}" id="reflection-conclusion">
          <div class="reflection-conclusion-header">
            <span>🏛️</span> Nilai Arsitektur & Makna Matematis:
          </div>
          <div class="reflection-conclusion-text">${rc.conclusion}</div>
        </div>

        <button class="btn btn-primary btn-reflection-done ${rc.options && rc.options.length ? 'hidden' : ''}" id="btn-reflection-done">
          Lihat Blueprint & Skor Akhir 🏆
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    const doneBtn = $('btn-reflection-done');
    const conclusionCard = $('reflection-conclusion');

    if (rc.options && rc.options.length) {
      const optBtns = overlay.querySelectorAll('.reflection-opt-btn');
      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          const opt = rc.options[idx];

          if (opt.correct) {
            GameAudio.correct();
            btn.classList.add('correct');
            optBtns.forEach(b => b.disabled = true);
            conclusionCard.classList.add('show');
            doneBtn.classList.remove('hidden');
          } else {
            GameAudio.wrong();
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 700);
          }
        });
      });
    }

    doneBtn.addEventListener('click', () => {
      GameAudio.click();
      overlay.remove();
      if (onDone) onDone();
    });
  }

  /* --- Inline Error --- */
  function showInlineError(inputEl, msg) {
    inputEl.classList.add('error');
    setTimeout(() => inputEl.classList.remove('error'), 600);
    // Show error msg briefly
    const hintArea = $('hint-area');
    if (hintArea) {
      hintArea.innerHTML = `<div class="hint-popup" style="border-color:#E74C3C;background:linear-gradient(135deg,#FFF0F0,#FFE0E0)"><div class="hint-label" style="color:#E74C3C">⚠️ ${msg}</div></div>`;
      setTimeout(() => { if (hintArea.firstChild) hintArea.innerHTML = ''; }, 2500);
    }
  }

  /* --- Feedback Overlay --- */
  function showFeedback(success, message, onClose) {
    // Remove existing
    const existing = document.querySelector('.feedback-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';

    const mascotExpr = success ? 'happy' : 'sad';
    const lines = message.split('\n').filter(l => l.trim());

    overlay.innerHTML = `
      <div class="feedback-card ${success ? 'success' : 'error'}">
        <div style="width:80px;height:100px;margin:0 auto 8px">${GameEngine.getMascotSVG(mascotExpr, 80)}</div>
        <div class="feedback-title">${success ? 'Benar! 🎉' : 'Belum Tepat 🤔'}</div>
        <div class="feedback-text">${lines.map(l => `<p style="margin-bottom:6px">${l}</p>`).join('')}</div>
        <button class="btn ${success ? 'btn-primary' : 'btn-accent'}" id="btn-feedback-close">${success ? 'Lanjut →' : 'Coba Lagi'}</button>
      </div>
    `;

    document.body.appendChild(overlay);

    $('btn-feedback-close').addEventListener('click', () => {
      GameAudio.click();
      overlay.remove();
      if (onClose) onClose();
    });

    // Close on overlay click (outside card)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        GameAudio.click();
        overlay.remove();
        if (onClose) onClose();
      }
    });
  }

  /* --- Result Screen --- */
  function renderResult(opts = {}) {
    const stars = opts.stars || 1;

    const starsContainer = $('result-stars');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const span = document.createElement('span');
        span.className = `star-result${i < stars ? '' : ' empty'}`;
        span.textContent = i < stars ? '★' : '☆';
        starsContainer.appendChild(span);
        // Trigger star sound
        if (i < stars) {
          setTimeout(() => GameAudio.star(), 200 + i * 300);
        }
      }
    }

    const badgeTierEl = $('result-badge-tier');
    if (badgeTierEl) {
      if (stars === 3) {
        badgeTierEl.textContent = '⭐⭐⭐ Arsitek Sempurna';
      } else if (stars === 2) {
        badgeTierEl.textContent = '⭐⭐☆ Arsitek Hebat';
      } else {
        badgeTierEl.textContent = '⭐☆☆ Arsitek Berbakat';
      }
    }

    const messages = [
      'Coba lagi, kamu pasti bisa!',
      'Kerja bagus! Terus asah pemahaman geometrimu! ⭐',
      'Hebat! Struktur bangunan berdiri kokoh dan presisi! ⭐⭐',
      'Luar biasa sempurna! Kamu Master Arsitek Bangunan! ⭐⭐⭐'
    ];
    const msgEl = $('result-message');
    if (msgEl) msgEl.textContent = messages[stars] || messages[1];

    const mascot = $('result-mascot');
    if (mascot) mascot.innerHTML = GameEngine.getMascotSVG(stars >= 2 ? 'happy' : 'normal', 80);

    // Update header score display
    if (headerScore) headerScore.textContent = `⭐ ${GameEngine.getTotalStars()}/75`;

    // Check if all levels done
    const allDone = GameEngine.progress().every(w => w.every(l => l.completed));
    const nextBtn = $('btn-next-level');
    const retryBtn = $('btn-retry');
    const victoryMsg = $('victory-message');

    if (allDone) {
      if (nextBtn) nextBtn.classList.add('hidden');
      if (victoryMsg) {
        victoryMsg.classList.remove('hidden');
        victoryMsg.textContent = '🏆 Selamat! Kamu telah menyelesaikan semua level! Seluruh kompleks bangunan megah selesai dibangun!';
      }
    } else {
      if (nextBtn) nextBtn.classList.remove('hidden');
      if (victoryMsg) victoryMsg.classList.add('hidden');
    }
  }

  /* --- Formula Reference --- */
  function renderFormula() {
    const container = $('formula-list');
    container.innerHTML = '';

    GAME_DATA.formulas.forEach((f, i) => {
      const section = document.createElement('div');
      section.className = 'formula-section';
      let bodyHtml = '<div class="formula-content">';
      f.items.forEach(item => {
        bodyHtml += `<div class="formula-eq">${item.label}: ${item.formula}</div>`;
      });
      bodyHtml += `<p class="text-muted text-sm mt-sm">Keterangan: ${f.note}</p>`;

      // Simple SVG illustration
      bodyHtml += renderFormulaIllustration(f.title);
      bodyHtml += '</div>';

      section.innerHTML = `
        <div class="formula-header" data-index="${i}">${f.title} <span class="arrow">▼</span></div>
        <div class="formula-body">${bodyHtml}</div>
      `;
      container.appendChild(section);

      // Toggle accordion
      section.querySelector('.formula-header').addEventListener('click', () => {
        GameAudio.click();
        section.classList.toggle('open');
      });
    });
  }

  function renderFormulaIllustration(title) {
    let svg = '';
    switch (title) {
      case 'Persegi':
        svg = `<svg viewBox="0 0 120 120" class="formula-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="80" height="80" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <text x="60" y="115" text-anchor="middle" font-size="12" fill="#1B6B4A" font-weight="700">s</text>
        </svg>`;
        break;
      case 'Persegi Panjang':
        svg = `<svg viewBox="0 0 140 100" class="formula-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="15" width="120" height="60" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <text x="70" y="90" text-anchor="middle" font-size="12" fill="#1B6B4A" font-weight="700">p</text>
          <text x="137" y="48" text-anchor="end" font-size="12" fill="#1B6B4A" font-weight="700">l</text>
        </svg>`;
        break;
      case 'Segitiga':
        svg = `<svg viewBox="0 0 120 110" class="formula-svg" xmlns="http://www.w3.org/2000/svg">
          <polygon points="10,90 110,90 60,15" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <line x1="60" y1="15" x2="60" y2="90" stroke="#D94F3B" stroke-width="1.5" stroke-dasharray="4"/>
          <text x="60" y="105" text-anchor="middle" font-size="11" fill="#1B6B4A" font-weight="700">a</text>
          <text x="68" y="55" font-size="11" fill="#D94F3B" font-weight="700">t</text>
        </svg>`;
        break;
      case 'Teorema Pythagoras':
        svg = `<svg viewBox="0 0 140 120" class="formula-svg" xmlns="http://www.w3.org/2000/svg">
          <polygon points="20,100 120,100 20,25" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <rect x="20" y="85" width="15" height="15" fill="none" stroke="#1B6B4A" stroke-width="1"/>
          <text x="10" y="65" font-size="12" fill="#1B6B4A" font-weight="700">a</text>
          <text x="70" y="115" text-anchor="middle" font-size="12" fill="#1B6B4A" font-weight="700">b</text>
          <text x="78" y="58" font-size="12" fill="#D94F3B" font-weight="700">c</text>
        </svg>`;
        break;
      default:
        svg = '';
    }
    return svg;
  }

  /* --- About Screen --- */
  function renderAbout() {
    const aboutMascotEl = $('about-mascot');
    if (aboutMascotEl) aboutMascotEl.innerHTML = GameEngine.getMascotSVG('happy', 85);
  }

  /* ========================================================
     STUDIO LABORATORIUM GEOMETRI (INTERACTIVE SANDBOX)
     ======================================================== */
  let labSideA = 3;
  let labSideB = 4;
  let activeLabTab = 'pythagoras';
  let activeLabShape = 'square';
  const labShapeParams = {
    square: { side: 6 },
    rectangle: { width: 8, height: 5 },
    triangle: { base: 8, height: 6 },
    trapezoid: { top: 4, bottom: 8, height: 5 },
    circle: { radius: 4 }
  };
  let labInitialized = false;

  function updatePythagorasLab() {
    const a = labSideA;
    const b = labSideB;
    const c = Math.sqrt(a * a + b * b);
    const isTriple = Number.isInteger(c);
    const cDisplay = isTriple ? c : c.toFixed(2);
    const sqA = a * a;
    const sqB = b * b;
    const sqC = a * a + b * b;

    const lblA = $('lbl-side-a'); if (lblA) lblA.textContent = a;
    const lblSqA = $('lbl-sq-a'); if (lblSqA) lblSqA.textContent = sqA;
    const lblB = $('lbl-side-b'); if (lblB) lblB.textContent = b;
    const lblSqB = $('lbl-sq-b'); if (lblSqB) lblSqB.textContent = sqB;

    const sliderA = $('slider-side-a'); if (sliderA) sliderA.value = a;
    const sliderB = $('slider-side-b'); if (sliderB) sliderB.value = b;

    const lblCalcAb = $('lbl-calc-ab');
    if (lblCalcAb) lblCalcAb.textContent = `${a}² + ${b}² = ${sqA} + ${sqB} = ${sqC}`;
    const lblCalcSum = $('lbl-calc-sum');
    if (lblCalcSum) lblCalcSum.textContent = sqC;
    const lblSideC = $('lbl-side-c');
    if (lblSideC) lblSideC.textContent = cDisplay;
    const lblSqC = $('lbl-sq-c');
    if (lblSqC) lblSqC.textContent = sqC;

    const svgWrap = $('lab-pythagoras-svg');
    if (svgWrap) {
      svgWrap.innerHTML = GameEngine.renderPythagorasProofSVG(a, b);
    }

    const badge = $('lab-triple-badge');
    const badgeText = $('lab-triple-text');
    if (badge && badgeText) {
      if (isTriple) {
        badge.classList.remove('hidden');
        badgeText.textContent = `${a} - ${b} - ${c}`;
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  function updateShapeLab() {
    const p = labShapeParams[activeLabShape];
    const svgWrap = $('lab-shape-svg');
    if (svgWrap) {
      svgWrap.innerHTML = GameEngine.renderShapeLabSVG(activeLabShape, p);
    }

    const calcBox = $('lab-shape-calc');
    if (!calcBox) return;

    if (activeLabShape === 'square') {
      const s = p.side;
      calcBox.innerHTML = `
        <div class="formula-row">Persegi (sisi s = ${s} cm)</div>
        <div class="calc-row">Luas = s × s = ${s} × ${s} = <strong>${s * s} cm²</strong></div>
        <div class="calc-row">Keliling = 4 × s = 4 × ${s} = <strong>${4 * s} cm</strong></div>
      `;
    } else if (activeLabShape === 'rectangle') {
      const w = p.width, h = p.height;
      calcBox.innerHTML = `
        <div class="formula-row">Persegi Panjang (p = ${w} cm, l = ${h} cm)</div>
        <div class="calc-row">Luas = p × l = ${w} × ${h} = <strong>${w * h} cm²</strong></div>
        <div class="calc-row">Keliling = 2 × (p + l) = 2 × (${w} + ${h}) = <strong>${2 * (w + h)} cm</strong></div>
      `;
    } else if (activeLabShape === 'triangle') {
      const b = p.base, h = p.height;
      calcBox.innerHTML = `
        <div class="formula-row">Segitiga (alas a = ${b} cm, tinggi t = ${h} cm)</div>
        <div class="calc-row">Luas = ½ × a × t = ½ × ${b} × ${h} = <strong>${(b * h) / 2} cm²</strong></div>
      `;
    } else if (activeLabShape === 'trapezoid') {
      const a = p.top, b = p.bottom, t = p.height;
      const area = ((a + b) * t) / 2;
      calcBox.innerHTML = `
        <div class="formula-row">Trapesium (sisi atas a = ${a} cm, sisi bawah b = ${b} cm, tinggi t = ${t} cm)</div>
        <div class="calc-row">Luas = ½ × (a + b) × t = ½ × (${a} + ${b}) × ${t} = <strong>${area} cm²</strong></div>
      `;
    } else if (activeLabShape === 'circle') {
      const r = p.radius;
      const area = (Math.PI * r * r).toFixed(1);
      const kel = (2 * Math.PI * r).toFixed(1);
      calcBox.innerHTML = `
        <div class="formula-row">Lingkaran (jari-jari r = ${r} cm, diameter d = ${2 * r} cm)</div>
        <div class="calc-row">Luas = π × r² ≈ 3.14 × ${r}² ≈ <strong>${area} cm²</strong></div>
        <div class="calc-row">Keliling = 2 × π × r ≈ 2 × 3.14 × ${r} ≈ <strong>${kel} cm</strong></div>
      `;
    }
  }

  function renderShapeControls() {
    const controls = $('lab-shape-controls');
    if (!controls) return;
    controls.innerHTML = '';

    const p = labShapeParams[activeLabShape];

    if (activeLabShape === 'square') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Panjang Sisi (s): <strong id="lbl-shape-s">${p.side}</strong> cm</span>
            <span class="badge-sq">Luas: <span id="lbl-shape-sq">${p.side * p.side}</span> cm²</span>
          </div>
          <input type="range" id="slider-shape-s" min="1" max="15" value="${p.side}" class="custom-slider">
        </div>
      `;
      $('slider-shape-s').addEventListener('input', (e) => {
        p.side = parseInt(e.target.value, 10);
        const lS = $('lbl-shape-s'); if (lS) lS.textContent = p.side;
        const lSq = $('lbl-shape-sq'); if (lSq) lSq.textContent = p.side * p.side;
        updateShapeLab();
      });
    } else if (activeLabShape === 'rectangle') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Panjang (p): <strong id="lbl-shape-w">${p.width}</strong> cm</span>
          </div>
          <input type="range" id="slider-shape-w" min="2" max="15" value="${p.width}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Lebar (l): <strong id="lbl-shape-h">${p.height}</strong> cm</span>
            <span class="badge-sq">Luas: <span id="lbl-shape-rect-sq">${p.width * p.height}</span> cm²</span>
          </div>
          <input type="range" id="slider-shape-h" min="1" max="12" value="${p.height}" class="custom-slider">
        </div>
      `;
      $('slider-shape-w').addEventListener('input', (e) => {
        p.width = parseInt(e.target.value, 10);
        const lW = $('lbl-shape-w'); if (lW) lW.textContent = p.width;
        const lRSq = $('lbl-shape-rect-sq'); if (lRSq) lRSq.textContent = p.width * p.height;
        updateShapeLab();
      });
      $('slider-shape-h').addEventListener('input', (e) => {
        p.height = parseInt(e.target.value, 10);
        const lH = $('lbl-shape-h'); if (lH) lH.textContent = p.height;
        const lRSq = $('lbl-shape-rect-sq'); if (lRSq) lRSq.textContent = p.width * p.height;
        updateShapeLab();
      });
    } else if (activeLabShape === 'triangle') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Alas Segitiga (a): <strong id="lbl-shape-base">${p.base}</strong> cm</span>
          </div>
          <input type="range" id="slider-shape-base" min="2" max="15" value="${p.base}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Tinggi Segitiga (t): <strong id="lbl-shape-th">${p.height}</strong> cm</span>
            <span class="badge-sq">Luas: <span id="lbl-shape-tri-sq">${(p.base * p.height) / 2}</span> cm²</span>
          </div>
          <input type="range" id="slider-shape-th" min="2" max="12" value="${p.height}" class="custom-slider">
        </div>
      `;
      $('slider-shape-base').addEventListener('input', (e) => {
        p.base = parseInt(e.target.value, 10);
        const lB = $('lbl-shape-base'); if (lB) lB.textContent = p.base;
        const lTSq = $('lbl-shape-tri-sq'); if (lTSq) lTSq.textContent = (p.base * p.height) / 2;
        updateShapeLab();
      });
      $('slider-shape-th').addEventListener('input', (e) => {
        p.height = parseInt(e.target.value, 10);
        const lH = $('lbl-shape-th'); if (lH) lH.textContent = p.height;
        const lTSq = $('lbl-shape-tri-sq'); if (lTSq) lTSq.textContent = (p.base * p.height) / 2;
        updateShapeLab();
      });
    } else if (activeLabShape === 'trapezoid') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Sisi Atas (a): <strong id="lbl-shape-top">${p.top}</strong> cm</span>
          </div>
          <input type="range" id="slider-shape-top" min="2" max="10" value="${p.top}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Sisi Bawah (b): <strong id="lbl-shape-bot">${p.bottom}</strong> cm</span>
          </div>
          <input type="range" id="slider-shape-bot" min="4" max="14" value="${p.bottom}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Tinggi (t): <strong id="lbl-shape-trap-t">${p.height}</strong> cm</span>
            <span class="badge-sq">Luas: <span id="lbl-shape-trap-sq">${((p.top + p.bottom) * p.height) / 2}</span> cm²</span>
          </div>
          <input type="range" id="slider-shape-trap-t" min="2" max="10" value="${p.height}" class="custom-slider">
        </div>
      `;
      $('slider-shape-top').addEventListener('input', (e) => {
        p.top = parseInt(e.target.value, 10);
        const lTop = $('lbl-shape-top'); if (lTop) lTop.textContent = p.top;
        const lTrSq = $('lbl-shape-trap-sq'); if (lTrSq) lTrSq.textContent = ((p.top + p.bottom) * p.height) / 2;
        updateShapeLab();
      });
      $('slider-shape-bot').addEventListener('input', (e) => {
        p.bottom = parseInt(e.target.value, 10);
        const lBot = $('lbl-shape-bot'); if (lBot) lBot.textContent = p.bottom;
        const lTrSq = $('lbl-shape-trap-sq'); if (lTrSq) lTrSq.textContent = ((p.top + p.bottom) * p.height) / 2;
        updateShapeLab();
      });
      $('slider-shape-trap-t').addEventListener('input', (e) => {
        p.height = parseInt(e.target.value, 10);
        const lT = $('lbl-shape-trap-t'); if (lT) lT.textContent = p.height;
        const lTrSq = $('lbl-shape-trap-sq'); if (lTrSq) lTrSq.textContent = ((p.top + p.bottom) * p.height) / 2;
        updateShapeLab();
      });
    } else if (activeLabShape === 'circle') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Jari-jari (r): <strong id="lbl-shape-r">${p.radius}</strong> cm</span>
            <span class="badge-sq">Luas: ≈<span id="lbl-shape-cir-sq">${(Math.PI * p.radius * p.radius).toFixed(1)}</span> cm²</span>
          </div>
          <input type="range" id="slider-shape-r" min="1" max="10" value="${p.radius}" class="custom-slider">
        </div>
      `;
      $('slider-shape-r').addEventListener('input', (e) => {
        p.radius = parseInt(e.target.value, 10);
        const lR = $('lbl-shape-r'); if (lR) lR.textContent = p.radius;
        const lCSq = $('lbl-shape-cir-sq'); if (lCSq) lCSq.textContent = (Math.PI * p.radius * p.radius).toFixed(1);
        updateShapeLab();
      });
    }
    updateShapeLab();
  }

  function renderLab() {
    if (!labInitialized) {
      labInitialized = true;
      const sA = $('slider-side-a');
      const sB = $('slider-side-b');
      if (sA) {
        sA.addEventListener('input', (e) => {
          labSideA = parseInt(e.target.value, 10);
          updatePythagorasLab();
        });
      }
      if (sB) {
        sB.addEventListener('input', (e) => {
          labSideB = parseInt(e.target.value, 10);
          updatePythagorasLab();
        });
      }

      document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          GameAudio.click();
          labSideA = parseInt(btn.getAttribute('data-a'), 10);
          labSideB = parseInt(btn.getAttribute('data-b'), 10);
          updatePythagorasLab();
        });
      });

      const tabPyth = $('tab-lab-pythagoras');
      const tabShapes = $('tab-lab-shapes');
      const contentPyth = $('lab-content-pythagoras');
      const contentShapes = $('lab-content-shapes');

      if (tabPyth && tabShapes) {
        tabPyth.addEventListener('click', () => {
          GameAudio.click();
          activeLabTab = 'pythagoras';
          tabPyth.classList.add('active');
          tabShapes.classList.remove('active');
          if (contentPyth) contentPyth.classList.remove('hidden');
          if (contentShapes) contentShapes.classList.add('hidden');
          updatePythagorasLab();
        });
        tabShapes.addEventListener('click', () => {
          GameAudio.click();
          activeLabTab = 'shapes';
          tabShapes.classList.add('active');
          tabPyth.classList.remove('active');
          if (contentPyth) contentPyth.classList.add('hidden');
          if (contentShapes) contentShapes.classList.remove('hidden');
          renderShapeControls();
        });
      }

      document.querySelectorAll('.shape-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          GameAudio.click();
          document.querySelectorAll('.shape-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          activeLabShape = pill.getAttribute('data-shape');
          renderShapeControls();
        });
      });
    }

    if (activeLabTab === 'pythagoras') {
      updatePythagorasLab();
    } else {
      renderShapeControls();
    }
  }

  /* ========================================================
     UJIAN KILAT PYTHAGORAS (TIME-ATTACK 60 DETIK)
     ======================================================== */
  let speedTimeRemaining = 60;
  let speedScore = 0;
  let speedCombo = 1;
  let speedMaxCombo = 1;
  let speedCorrectCount = 0;
  let speedTimerInterval = null;
  let speedAnsweringLocked = false;
  let speedInitialized = false;

  const SPEED_TRIPLES = [
    [3, 4, 5],
    [5, 12, 13],
    [6, 8, 10],
    [7, 24, 25],
    [8, 15, 17],
    [9, 12, 15],
    [10, 24, 26],
    [12, 16, 20],
    [15, 20, 25],
    [9, 40, 41]
  ];

  function getSpeedHighScore() {
    return parseInt(localStorage.getItem('arsitekCilik_speed_highscore') || '0', 10);
  }

  function setSpeedHighScore(val) {
    localStorage.setItem('arsitekCilik_speed_highscore', val.toString());
  }

  function renderSpeedScreen() {
    if (speedTimerInterval) {
      clearInterval(speedTimerInterval);
      speedTimerInterval = null;
    }
    const startCard = $('speed-start-card');
    const gameCard = $('speed-game-card');
    const resultCard = $('speed-result-card');
    if (startCard) startCard.classList.remove('hidden');
    if (gameCard) gameCard.classList.add('hidden');
    if (resultCard) resultCard.classList.add('hidden');

    const highScoreEl = $('speed-high-score');
    if (highScoreEl) highScoreEl.textContent = `${getSpeedHighScore()} Poin`;

    if (!speedInitialized) {
      speedInitialized = true;
      const startBtn = $('btn-speed-start');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          GameAudio.click();
          startSpeedGame();
        });
      }
      const retryBtn = $('btn-speed-retry');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          GameAudio.click();
          startSpeedGame();
        });
      }
      const menuBtn = $('btn-speed-menu');
      if (menuBtn) {
        menuBtn.addEventListener('click', () => {
          GameAudio.click();
          showScreen('menu');
        });
      }
    }
  }

  function startSpeedGame() {
    speedTimeRemaining = 60;
    speedScore = 0;
    speedCombo = 1;
    speedMaxCombo = 1;
    speedCorrectCount = 0;
    speedAnsweringLocked = false;

    const startCard = $('speed-start-card');
    const gameCard = $('speed-game-card');
    const resultCard = $('speed-result-card');
    if (startCard) startCard.classList.add('hidden');
    if (gameCard) gameCard.classList.remove('hidden');
    if (resultCard) resultCard.classList.add('hidden');

    updateSpeedStatus();
    loadNextSpeedQuestion();

    if (speedTimerInterval) clearInterval(speedTimerInterval);
    speedTimerInterval = setInterval(() => {
      speedTimeRemaining--;
      updateSpeedStatus();
      if (speedTimeRemaining <= 0) {
        endSpeedGame();
      }
    }, 1000);
  }

  function updateSpeedStatus() {
    const timerText = $('speed-timer-text');
    if (timerText) timerText.textContent = `${speedTimeRemaining}s`;

    const timerFill = $('speed-timer-fill');
    if (timerFill) {
      const pct = Math.max(0, Math.min(100, (speedTimeRemaining / 60) * 100));
      timerFill.style.width = `${pct}%`;
    }

    const scoreVal = $('speed-current-score');
    if (scoreVal) scoreVal.textContent = speedScore;

    const comboText = $('speed-combo-text');
    if (comboText) comboText.textContent = `Combo x${speedCombo}`;

    const comboBadge = $('speed-combo-badge');
    if (comboBadge) {
      comboBadge.style.transform = speedCombo > 1 ? 'scale(1.08)' : 'scale(1)';
    }
  }

  function generateSpeedQuestion() {
    const triple = SPEED_TRIPLES[Math.floor(Math.random() * SPEED_TRIPLES.length)];
    const [a, b, c] = triple;
    const qTypes = ['hypotenuse', 'leg', 'square', 'verify'];
    const type = qTypes[Math.floor(Math.random() * qTypes.length)];

    let category = 'Tripel Pythagoras';
    let text = '';
    let correctAnswer = '';
    let options = [];
    let svg = '';

    if (type === 'hypotenuse') {
      category = 'Mencari Sisi Miring (c)';
      text = `Segitiga siku-siku memiliki sisi tegak ${a} cm dan alas ${b} cm. Berapa sisi miringnya?`;
      correctAnswer = `${c} cm`;
      const wrong1 = `${c + 1} cm`;
      const wrong2 = `${c - 1 > 0 ? c - 1 : c + 2} cm`;
      const wrong3 = `${a + b} cm`;
      options = [correctAnswer, wrong1, wrong2, wrong3];
      svg = `<svg viewBox="0 0 160 110" width="140" height="95">
        <polygon points="25,90 135,90 25,20" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2.5"/>
        <rect x="25" y="78" width="12" height="12" fill="none" stroke="#1B6B4A" stroke-width="1.5"/>
        <text x="14" y="60" font-size="12" font-weight="700" fill="#1B6B4A">${a}</text>
        <text x="80" y="105" text-anchor="middle" font-size="12" font-weight="700" fill="#1B6B4A">${b}</text>
        <text x="88" y="50" font-size="14" font-weight="800" fill="#D94F3B">c = ?</text>
      </svg>`;
    } else if (type === 'leg') {
      category = 'Mencari Sisi Tegak';
      text = `Sisi miring segitiga siku-siku adalah ${c} cm dan alasnya ${b} cm. Berapa panjang sisi tegaknya?`;
      correctAnswer = `${a} cm`;
      const wrong1 = `${a + 2} cm`;
      const wrong2 = `${a - 1 > 0 ? a - 1 : a + 3} cm`;
      const wrong3 = `${Math.abs(c - b)} cm`;
      options = [correctAnswer, wrong1, wrong2, wrong3];
      svg = `<svg viewBox="0 0 160 110" width="140" height="95">
        <polygon points="25,90 135,90 25,20" fill="#FEF9E7" stroke="#E8A838" stroke-width="2.5"/>
        <rect x="25" y="78" width="12" height="12" fill="none" stroke="#E8A838" stroke-width="1.5"/>
        <text x="12" y="60" font-size="13" font-weight="800" fill="#D94F3B">? cm</text>
        <text x="80" y="105" text-anchor="middle" font-size="12" font-weight="700" fill="#7D6608">${b}</text>
        <text x="88" y="50" font-size="13" font-weight="700" fill="#2980B9">${c}</text>
      </svg>`;
    } else if (type === 'square') {
      category = 'Kuadrat Sisi Miring (c²)';
      text = `Jika alas ${a} cm dan sisi tegak ${b} cm, berapa nilai dari c² (a² + b²)?`;
      correctAnswer = `${c * c}`;
      const wrong1 = `${c * c + 10}`;
      const wrong2 = `${a * a + b}`;
      const wrong3 = `${c * 2}`;
      options = [correctAnswer, wrong1, wrong2, wrong3];
      svg = `<svg viewBox="0 0 160 110" width="140" height="95">
        <polygon points="25,90 135,90 25,20" fill="#EBF5FB" stroke="#2980B9" stroke-width="2.5"/>
        <text x="80" y="60" text-anchor="middle" font-size="14" font-weight="800" fill="#1B4F72">c² = ?</text>
        <text x="14" y="60" font-size="12" font-weight="700" fill="#2980B9">${a}</text>
        <text x="80" y="105" text-anchor="middle" font-size="12" font-weight="700" fill="#2980B9">${b}</text>
      </svg>`;
    } else {
      category = 'Verifikasi Tripel';
      const isRight = Math.random() > 0.5;
      const fakeC = isRight ? c : c + 2;
      text = `Apakah kelompok bilangan [${a}, ${b}, ${fakeC}] merupakan Tripel Pythagoras?`;
      correctAnswer = isRight ? 'Ya, Tripel Pythagoras' : 'Bukan Tripel';
      const wrong1 = isRight ? 'Bukan Tripel' : 'Ya, Tripel Pythagoras';
      const wrong2 = 'Segitiga Tumpul';
      const wrong3 = 'Segitiga Sama Sisi';
      options = [correctAnswer, wrong1, wrong2, wrong3];
      svg = `<svg viewBox="0 0 160 110" width="140" height="95">
        <polygon points="30,85 130,85 45,25" fill="#FDEDEC" stroke="#E74C3C" stroke-width="2.5"/>
        <text x="80" y="60" text-anchor="middle" font-size="13" font-weight="800" fill="#922B21">${a}, ${b}, ${fakeC}</text>
      </svg>`;
    }

    options = options.sort(() => Math.random() - 0.5);

    return { category, text, correctAnswer, options, svg };
  }

  function loadNextSpeedQuestion() {
    if (speedTimeRemaining <= 0) return;
    speedAnsweringLocked = false;
    const q = generateSpeedQuestion();

    const catEl = $('speed-q-category');
    if (catEl) catEl.textContent = q.category;

    const textEl = $('speed-question-text');
    if (textEl) textEl.textContent = q.text;

    const visualEl = $('speed-question-visual');
    if (visualEl) visualEl.innerHTML = q.svg;

    const grid = $('speed-options-grid');
    if (!grid) return;
    grid.innerHTML = '';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'speed-btn-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (speedAnsweringLocked) return;
        speedAnsweringLocked = true;

        if (opt === q.correctAnswer) {
          btn.classList.add('correct');
          GameAudio.correct();
          const gained = 100 * speedCombo;
          speedScore += gained;
          speedCorrectCount++;
          speedCombo++;
          if (speedCombo > speedMaxCombo) speedMaxCombo = speedCombo;
          updateSpeedStatus();
          setTimeout(() => {
            loadNextSpeedQuestion();
          }, 200);
        } else {
          btn.classList.add('wrong');
          grid.querySelectorAll('.speed-btn-option').forEach(b => {
            if (b.textContent === q.correctAnswer) b.classList.add('correct');
          });
          GameAudio.wrong();
          speedCombo = 1;
          updateSpeedStatus();
          setTimeout(() => {
            loadNextSpeedQuestion();
          }, 450);
        }
      });
      grid.appendChild(btn);
    });
  }

  function endSpeedGame() {
    if (speedTimerInterval) {
      clearInterval(speedTimerInterval);
      speedTimerInterval = null;
    }

    const gameCard = $('speed-game-card');
    const resultCard = $('speed-result-card');
    if (gameCard) gameCard.classList.add('hidden');
    if (resultCard) resultCard.classList.remove('hidden');

    GameAudio.fanfare();

    const statScore = $('speed-stat-score'); if (statScore) statScore.textContent = speedScore;
    const statCorrect = $('speed-stat-correct'); if (statCorrect) statCorrect.textContent = speedCorrectCount;
    const statCombo = $('speed-stat-combo'); if (statCombo) statCombo.textContent = `x${speedMaxCombo}`;

    const tierBadge = $('speed-tier-badge');
    if (tierBadge) {
      if (speedScore >= 1000) tierBadge.textContent = '🌟 Grand Master Pythagoras';
      else if (speedScore >= 600) tierBadge.textContent = '🏆 Insinyur Legendaris';
      else if (speedScore >= 350) tierBadge.textContent = '📐 Arsitek Mahir';
      else if (speedScore >= 150) tierBadge.textContent = '🔨 Arsitek Muda';
      else tierBadge.textContent = '👷 Calon Arsitek';
    }

    const mascotEl = $('speed-result-mascot');
    if (mascotEl) mascotEl.innerHTML = GameEngine.getMascotSVG(speedScore >= 350 ? 'happy' : 'normal', 80);

    const prevHigh = getSpeedHighScore();
    const newHighNotice = $('speed-new-high');
    if (speedScore > prevHigh) {
      setSpeedHighScore(speedScore);
      if (newHighNotice) newHighNotice.classList.remove('hidden');
      GameEngine.startConfetti();
      setTimeout(() => GameEngine.stopConfetti(), 3500);
    } else {
      if (newHighNotice) newHighNotice.classList.add('hidden');
    }
  }

  /* --- Sound Toggle --- */
  function toggleSound() {
    GameAudio.init();
    const isOn = GameAudio.toggle();
    btnSound.textContent = isOn ? '🔊' : '🔇';
    GameEngine.saveGame();
  }

  /* --- Initialization --- */
  function init() {
    // Load saved progress
    GameEngine.loadGame();

    // Keep header score in sync
    if (headerScore) {
      headerScore.textContent = `⭐ ${GameEngine.getTotalStars()}/75`;
    }

    // Sound button state
    btnSound.textContent = GameAudio.isOn() ? '🔊' : '🔇';

    // Global audio unlock on first user gesture (Safari & mobile best practice)
    window.addEventListener('pointerdown', () => {
      GameAudio.init();
      GameAudio.resume();
    }, { once: true });

    // Event listeners
    headerBack.addEventListener('click', goBack);
    btnSound.addEventListener('click', () => { GameAudio.init(); toggleSound(); });

    // Menu buttons
    $('btn-play').addEventListener('click', () => { GameAudio.click(); showScreen('world'); });
    $('btn-lab').addEventListener('click', () => { GameAudio.click(); showScreen('lab'); });
    $('btn-speed').addEventListener('click', () => { GameAudio.click(); showScreen('speed'); });
    $('btn-formula').addEventListener('click', () => { GameAudio.click(); showScreen('formula'); });
    $('btn-about').addEventListener('click', () => { GameAudio.click(); showScreen('about'); });

    // Story continue
    $('btn-story-continue').addEventListener('click', () => { GameAudio.click(); startChallenge(); });

    // Result buttons
    $('btn-retry').addEventListener('click', () => { GameAudio.click(); startChallenge(); });
    $('btn-next-level').addEventListener('click', () => {
      GameAudio.click();
      // Move to next level
      if (selectedLevel < 4) {
        selectedLevel++;
      } else if (selectedWorld < GAME_DATA.worldStories.length - 1) {
        selectedWorld++;
        selectedLevel = 0;
      } else {
        // Last level of the entire game reached!
        showScreen('world');
        return;
      }
      // Check if unlocked
      if (GameEngine.isLevelUnlocked(selectedWorld, selectedLevel)) {
        currentLevelData = GameEngine.getLevelData(selectedWorld, selectedLevel);
        if (selectedLevel === 0) {
          showScreen('story');
        } else {
          startChallenge();
        }
      } else {
        showScreen('level');
      }
    });
    $('btn-result-menu').addEventListener('click', () => { GameAudio.click(); showScreen('level'); });

    // Init splash
    initSplash();

    // Handle resize for confetti canvas
    window.addEventListener('resize', () => {
      const canvas = $('confetti-canvas');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
