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
    if (currentScreen === 'speed' && name !== 'speed') {
      if (speedTimerInterval) {
        clearInterval(speedTimerInterval);
        speedTimerInterval = null;
      }
      if (speedQuestionTimeout) {
        clearTimeout(speedQuestionTimeout);
        speedQuestionTimeout = null;
      }
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
        if (speedQuestionTimeout) {
          clearTimeout(speedQuestionTimeout);
          speedQuestionTimeout = null;
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
  let activeLabShape3D = 'cube';
  const labShape3DParams = {
    cube: { side: 6 },
    cuboid: { length: 8, width: 5, height: 6 },
    prism: { base: 6, height: 8, length: 8 },
    pyramid: { side: 8, height: 7 },
    cylinder: { radius: 4, height: 8 }
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

  function updateShape3DLab() {
    const p = labShape3DParams[activeLabShape3D];
    const svgWrap = $('lab-3d-svg');
    if (svgWrap) {
      svgWrap.innerHTML = GameEngine.renderShape3DLabSVG(activeLabShape3D, p);
    }

    const calcBox = $('lab-3d-calc');
    if (!calcBox) return;

    if (activeLabShape3D === 'cube') {
      const s = p.side;
      const vol = s * s * s;
      const lp = 6 * s * s;
      calcBox.innerHTML = `
        <div class="formula-row">Kubus (panjang rusuk s = ${s} cm)</div>
        <div class="calc-row">Volume = s³ = ${s} × ${s} × ${s} = <strong>${vol} cm³</strong></div>
        <div class="calc-row">Luas Permukaan = 6 × s² = 6 × ${s * s} = <strong>${lp} cm²</strong></div>
      `;
    } else if (activeLabShape3D === 'cuboid') {
      const pL = p.length, l = p.width, t = p.height;
      const vol = pL * l * t;
      const lp = 2 * (pL * l + pL * t + l * t);
      calcBox.innerHTML = `
        <div class="formula-row">Balok (panjang p = ${pL} cm, lebar l = ${l} cm, tinggi t = ${t} cm)</div>
        <div class="calc-row">Volume = p × l × t = ${pL} × ${l} × ${t} = <strong>${vol} cm³</strong></div>
        <div class="calc-row">Luas Permukaan = 2 × (pl + pt + lt) = 2 × (${pL*l} + ${pL*t} + ${l*t}) = <strong>${lp} cm²</strong></div>
      `;
    } else if (activeLabShape3D === 'prism') {
      const a = p.base, b = p.height, T = p.length;
      const c = Math.sqrt(a * a + b * b);
      const cDisp = Number.isInteger(c) ? c : c.toFixed(1);
      const la = 0.5 * a * b;
      const vol = Math.round(la * T);
      const lp = (2 * la) + (a + b + c) * T;
      calcBox.innerHTML = `
        <div class="formula-row">Prisma Segitiga Siku-Siku (alas a = ${a} cm, b = ${b} cm, Tinggi Prisma T = ${T} cm)</div>
        <div class="calc-row">Sisi miring segitiga alas (Pythagoras): c = √(a² + b²) = √(${a*a} + ${b*b}) = <strong>${cDisp} cm</strong></div>
        <div class="calc-row">Luas Alas (La) = ½ × a × b = ½ × ${a} × ${b} = <strong>${la} cm²</strong></div>
        <div class="calc-row">Volume = La × T = ${la} × ${T} = <strong>${vol} cm³</strong></div>
        <div class="calc-row">Luas Permukaan = 2×La + (a + b + c)×T = ${2 * la} + ${((a + b + c) * T).toFixed(1)} = <strong>${lp.toFixed(1)} cm²</strong></div>
      `;
    } else if (activeLabShape3D === 'pyramid') {
      const s = p.side, t = p.height;
      const halfS = s / 2;
      const ts = Math.sqrt(t * t + halfS * halfS);
      const vol = ((s * s * t) / 3).toFixed(1);
      const lp = (s * s + 4 * (0.5 * s * ts)).toFixed(1);
      calcBox.innerHTML = `
        <div class="formula-row">Limas Persegi (rusuk alas s = ${s} cm, tinggi limas t = ${t} cm)</div>
        <div class="calc-row">Tinggi sisi tegak (Pythagoras): ts = √(t² + (s/2)²) = √(${t*t} + ${(halfS*halfS).toFixed(1)}) ≈ <strong>${ts.toFixed(1)} cm</strong></div>
        <div class="calc-row">Volume = ⅓ × s² × t = ⅓ × ${s*s} × ${t} ≈ <strong>${vol} cm³</strong></div>
        <div class="calc-row">Luas Permukaan = s² + 4 × (½ × s × ts) ≈ <strong>${lp} cm²</strong></div>
      `;
    } else if (activeLabShape3D === 'cylinder') {
      const r = p.radius, t = p.height;
      const vol = (Math.PI * r * r * t).toFixed(1);
      const lp = (2 * Math.PI * r * (r + t)).toFixed(1);
      calcBox.innerHTML = `
        <div class="formula-row">Tabung (jari-jari r = ${r} cm, tinggi t = ${t} cm)</div>
        <div class="calc-row">Volume = π × r² × t ≈ 3.14 × ${r*r} × ${t} ≈ <strong>${vol} cm³</strong></div>
        <div class="calc-row">Luas Permukaan = 2 × π × r × (r + t) ≈ 2 × 3.14 × ${r} × (${r + t}) ≈ <strong>${lp} cm²</strong></div>
      `;
    }
  }

  function renderShape3DControls() {
    const controls = $('lab-3d-controls');
    if (!controls) return;
    controls.innerHTML = '';

    const p = labShape3DParams[activeLabShape3D];

    if (activeLabShape3D === 'cube') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Panjang Rusuk (s): <strong id="lbl-3d-s">${p.side}</strong> cm</span>
            <span class="badge-sq">Vol: <span id="lbl-3d-cube-vol">${p.side * p.side * p.side}</span> cm³</span>
          </div>
          <input type="range" id="slider-3d-s" min="2" max="12" value="${p.side}" class="custom-slider">
        </div>
      `;
      $('slider-3d-s').addEventListener('input', (e) => {
        p.side = parseInt(e.target.value, 10);
        const lS = $('lbl-3d-s'); if (lS) lS.textContent = p.side;
        const lV = $('lbl-3d-cube-vol'); if (lV) lV.textContent = p.side * p.side * p.side;
        updateShape3DLab();
      });
    } else if (activeLabShape3D === 'cuboid') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Panjang (p): <strong id="lbl-3d-len">${p.length}</strong> cm</span>
          </div>
          <input type="range" id="slider-3d-len" min="3" max="15" value="${p.length}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Lebar (l): <strong id="lbl-3d-w">${p.width}</strong> cm</span>
          </div>
          <input type="range" id="slider-3d-w" min="2" max="10" value="${p.width}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Tinggi (t): <strong id="lbl-3d-h">${p.height}</strong> cm</span>
            <span class="badge-sq">Vol: <span id="lbl-3d-cuboid-vol">${p.length * p.width * p.height}</span> cm³</span>
          </div>
          <input type="range" id="slider-3d-h" min="2" max="12" value="${p.height}" class="custom-slider">
        </div>
      `;
      $('slider-3d-len').addEventListener('input', (e) => {
        p.length = parseInt(e.target.value, 10);
        const el = $('lbl-3d-len'); if (el) el.textContent = p.length;
        const lV = $('lbl-3d-cuboid-vol'); if (lV) lV.textContent = p.length * p.width * p.height;
        updateShape3DLab();
      });
      $('slider-3d-w').addEventListener('input', (e) => {
        p.width = parseInt(e.target.value, 10);
        const el = $('lbl-3d-w'); if (el) el.textContent = p.width;
        const lV = $('lbl-3d-cuboid-vol'); if (lV) lV.textContent = p.length * p.width * p.height;
        updateShape3DLab();
      });
      $('slider-3d-h').addEventListener('input', (e) => {
        p.height = parseInt(e.target.value, 10);
        const el = $('lbl-3d-h'); if (el) el.textContent = p.height;
        const lV = $('lbl-3d-cuboid-vol'); if (lV) lV.textContent = p.length * p.width * p.height;
        updateShape3DLab();
      });
    } else if (activeLabShape3D === 'prism') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Sisi Alas Segitiga (a): <strong id="lbl-3d-pa">${p.base}</strong> cm</span>
          </div>
          <input type="range" id="slider-3d-pa" min="3" max="12" value="${p.base}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Tinggi Alas Segitiga (b): <strong id="lbl-3d-pb">${p.height}</strong> cm</span>
          </div>
          <input type="range" id="slider-3d-pb" min="4" max="12" value="${p.height}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Tinggi Prisma (T): <strong id="lbl-3d-pt">${p.length}</strong> cm</span>
            <span class="badge-sq">Vol: <span id="lbl-3d-prism-vol">${Math.round(0.5 * p.base * p.height * p.length)}</span> cm³</span>
          </div>
          <input type="range" id="slider-3d-pt" min="3" max="15" value="${p.length}" class="custom-slider">
        </div>
      `;
      $('slider-3d-pa').addEventListener('input', (e) => {
        p.base = parseInt(e.target.value, 10);
        const el = $('lbl-3d-pa'); if (el) el.textContent = p.base;
        const lV = $('lbl-3d-prism-vol'); if (lV) lV.textContent = Math.round(0.5 * p.base * p.height * p.length);
        updateShape3DLab();
      });
      $('slider-3d-pb').addEventListener('input', (e) => {
        p.height = parseInt(e.target.value, 10);
        const el = $('lbl-3d-pb'); if (el) el.textContent = p.height;
        const lV = $('lbl-3d-prism-vol'); if (lV) lV.textContent = Math.round(0.5 * p.base * p.height * p.length);
        updateShape3DLab();
      });
      $('slider-3d-pt').addEventListener('input', (e) => {
        p.length = parseInt(e.target.value, 10);
        const el = $('lbl-3d-pt'); if (el) el.textContent = p.length;
        const lV = $('lbl-3d-prism-vol'); if (lV) lV.textContent = Math.round(0.5 * p.base * p.height * p.length);
        updateShape3DLab();
      });
    } else if (activeLabShape3D === 'pyramid') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Sisi Alas Persegi (s): <strong id="lbl-3d-pys">${p.side}</strong> cm</span>
          </div>
          <input type="range" id="slider-3d-pys" min="4" max="14" value="${p.side}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Tinggi Limas (t): <strong id="lbl-3d-pyh">${p.height}</strong> cm</span>
            <span class="badge-sq">Vol: <span id="lbl-3d-pyr-vol">${((p.side * p.side * p.height) / 3).toFixed(1)}</span> cm³</span>
          </div>
          <input type="range" id="slider-3d-pyh" min="3" max="14" value="${p.height}" class="custom-slider">
        </div>
      `;
      $('slider-3d-pys').addEventListener('input', (e) => {
        p.side = parseInt(e.target.value, 10);
        const el = $('lbl-3d-pys'); if (el) el.textContent = p.side;
        const lV = $('lbl-3d-pyr-vol'); if (lV) lV.textContent = ((p.side * p.side * p.height) / 3).toFixed(1);
        updateShape3DLab();
      });
      $('slider-3d-pyh').addEventListener('input', (e) => {
        p.height = parseInt(e.target.value, 10);
        const el = $('lbl-3d-pyh'); if (el) el.textContent = p.height;
        const lV = $('lbl-3d-pyr-vol'); if (lV) lV.textContent = ((p.side * p.side * p.height) / 3).toFixed(1);
        updateShape3DLab();
      });
    } else if (activeLabShape3D === 'cylinder') {
      controls.innerHTML = `
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Jari-jari (r): <strong id="lbl-3d-cylr">${p.radius}</strong> cm</span>
          </div>
          <input type="range" id="slider-3d-cylr" min="2" max="10" value="${p.radius}" class="custom-slider">
        </div>
        <div class="lab-slider-group">
          <div class="lab-slider-label">
            <span>Tinggi Tabung (t): <strong id="lbl-3d-cylh">${p.height}</strong> cm</span>
            <span class="badge-sq">Vol: ≈<span id="lbl-3d-cyl-vol">${(Math.PI * p.radius * p.radius * p.height).toFixed(1)}</span> cm³</span>
          </div>
          <input type="range" id="slider-3d-cylh" min="3" max="14" value="${p.height}" class="custom-slider">
        </div>
      `;
      $('slider-3d-cylr').addEventListener('input', (e) => {
        p.radius = parseInt(e.target.value, 10);
        const el = $('lbl-3d-cylr'); if (el) el.textContent = p.radius;
        const lV = $('lbl-3d-cyl-vol'); if (lV) lV.textContent = (Math.PI * p.radius * p.radius * p.height).toFixed(1);
        updateShape3DLab();
      });
      $('slider-3d-cylh').addEventListener('input', (e) => {
        p.height = parseInt(e.target.value, 10);
        const el = $('lbl-3d-cylh'); if (el) el.textContent = p.height;
        const lV = $('lbl-3d-cyl-vol'); if (lV) lV.textContent = (Math.PI * p.radius * p.radius * p.height).toFixed(1);
        updateShape3DLab();
      });
    }
    updateShape3DLab();
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
      const tab3D = $('tab-lab-3d');
      const contentPyth = $('lab-content-pythagoras');
      const contentShapes = $('lab-content-shapes');
      const content3D = $('lab-content-3d');

      function switchLabTab(tabName) {
        activeLabTab = tabName;
        if (tabPyth) tabPyth.classList.toggle('active', tabName === 'pythagoras');
        if (tabShapes) tabShapes.classList.toggle('active', tabName === 'shapes');
        if (tab3D) tab3D.classList.toggle('active', tabName === '3d');

        if (contentPyth) contentPyth.classList.toggle('hidden', tabName !== 'pythagoras');
        if (contentShapes) contentShapes.classList.toggle('hidden', tabName !== 'shapes');
        if (content3D) content3D.classList.toggle('hidden', tabName !== '3d');

        if (tabName === 'pythagoras') {
          updatePythagorasLab();
        } else if (tabName === 'shapes') {
          renderShapeControls();
        } else if (tabName === '3d') {
          renderShape3DControls();
        }
      }

      if (tabPyth) tabPyth.addEventListener('click', () => { GameAudio.click(); switchLabTab('pythagoras'); });
      if (tabShapes) tabShapes.addEventListener('click', () => { GameAudio.click(); switchLabTab('shapes'); });
      if (tab3D) tab3D.addEventListener('click', () => { GameAudio.click(); switchLabTab('3d'); });

      document.querySelectorAll('#shape-selector-pills .shape-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          GameAudio.click();
          document.querySelectorAll('#shape-selector-pills .shape-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          activeLabShape = pill.getAttribute('data-shape');
          renderShapeControls();
        });
      });

      document.querySelectorAll('#shape-3d-selector-pills .shape-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          GameAudio.click();
          document.querySelectorAll('#shape-3d-selector-pills .shape-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          activeLabShape3D = pill.getAttribute('data-shape-3d');
          renderShape3DControls();
        });
      });
    }

    if (activeLabTab === 'pythagoras') {
      updatePythagorasLab();
    } else if (activeLabTab === 'shapes') {
      renderShapeControls();
    } else if (activeLabTab === '3d') {
      renderShape3DControls();
    }
  }

  /* ========================================================
     UJIAN KILAT PYTHAGORAS (TIME-ATTACK 60 DETIK & 25 SOAL)
     Tingkat Kesulitan Progresif (SMP Kelas VII - VIII):
       - Level 1 (Soal 1-5): Pemanasan & Konsep Dasar Kuadrat & Tripel 3-4-5
       - Level 2 (Soal 6-10): Mencari Sisi Siku-Siku & Tripel 5-12-13
       - Level 3 (Soal 11-15): Tripel Lanjutan (8-15-17, 7-24-25) & Uji Jenis Segitiga
       - Level 4 (Soal 16-20): Aplikasi Arsitektur & Soal Cerita Nyata (Target Utama: 20 Soal)
       - Level 5 (Soal 21-25): SUPER SPEED BONUS Menuju Rekor Waktu 25 Soal!
     ======================================================== */
  let speedTimeRemaining = 60;
  let speedCombo = 1;
  let speedMaxCombo = 1;
  let speedCorrectCount = 0;
  let speedQuestionIndex = 0;
  let speedTimerInterval = null;
  let speedQuestionTimeout = null;
  let speedAnsweringLocked = false;
  let speedInitialized = false;

  const SPEED_TOTAL_QUESTIONS = 25;
  const SPEED_REGULAR_QUESTIONS = 20;

  /* ========================================================
     SISTEM REKOR TERBAIK UJIAN KILAT (KONSISTEN & ADIL):
     1. Prioritas Utama: Jumlah Soal Benar terbanyak (0 - 25)
     2. Prioritas Kedua: Waktu tempuh tercepat (Detik)
     (Tidak memakai arbitrary point multiplier)
     ======================================================== */
  function getSpeedBestRecord() {
    try {
      const raw = localStorage.getItem('arsitekCilik_speed_record_v2');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function setSpeedBestRecord(rec) {
    try {
      localStorage.setItem('arsitekCilik_speed_record_v2', JSON.stringify(rec));
    } catch (e) {}
  }

  function isBetterRecord(newCorrect, newTime, oldRec) {
    if (!oldRec || oldRec.correct === undefined || oldRec.correct === null) {
      return newCorrect > 0;
    }
    // 1. Kriteria Pertama: Jumlah Soal yang Benar
    if (newCorrect > oldRec.correct) return true;
    // 2. Kriteria Kedua: Jika jumlah benar sama, yang tercepat (detik lebih sedikit)
    if (newCorrect === oldRec.correct && newCorrect > 0) {
      return newTime < oldRec.time;
    }
    return false;
  }

  function makeSpeedOptions(correct, distractors) {
    const set = new Set([correct]);
    for (let d of distractors) {
      if (d !== correct) set.add(d);
      if (set.size === 4) break;
    }
    // Fallback if less than 4
    let dummy = 1;
    while (set.size < 4) {
      set.add(`${dummy++}`);
    }
    return Array.from(set).sort(() => Math.random() - 0.5);
  }

  function renderSpeedScreen() {
    if (speedTimerInterval) {
      clearInterval(speedTimerInterval);
      speedTimerInterval = null;
    }
    if (speedQuestionTimeout) {
      clearTimeout(speedQuestionTimeout);
      speedQuestionTimeout = null;
    }

    const startCard = $('speed-start-card');
    const gameCard = $('speed-game-card');
    const resultCard = $('speed-result-card');
    if (startCard) startCard.classList.remove('hidden');
    if (gameCard) gameCard.classList.add('hidden');
    if (resultCard) resultCard.classList.add('hidden');

    // Tampilkan rekor terbaik (Berdasarkan Soal Benar & Waktu Tercepat)
    const rec = getSpeedBestRecord();
    const recCorrectEl = $('speed-record-correct');
    const recTimeEl = $('speed-record-time');
    const recStatusEl = $('speed-record-status');

    if (rec && rec.correct > 0) {
      if (recCorrectEl) recCorrectEl.textContent = rec.correct;
      if (recTimeEl) recTimeEl.textContent = `${rec.time}s`;
      if (recStatusEl) {
        if (rec.correct >= SPEED_TOTAL_QUESTIONS) {
          recStatusEl.textContent = `🌟 Juara Sempurna: 25/25 Soal dalam ${rec.time} Detik! ⚡`;
          recStatusEl.style.color = '#F59E0B';
        } else {
          recStatusEl.textContent = `🎯 Rekor: Berhasil ${rec.correct} Soal Benar (${rec.time} Detik)`;
          recStatusEl.style.color = 'var(--color-primary-green)';
        }
      }
    } else {
      if (recCorrectEl) recCorrectEl.textContent = '0';
      if (recTimeEl) recTimeEl.textContent = '-- s';
      if (recStatusEl) {
        recStatusEl.textContent = 'Belum ada rekor tersimpan. Ayo cetak rekor pertamamu!';
        recStatusEl.style.color = 'var(--color-gray-500)';
      }
    }

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
    speedCombo = 1;
    speedMaxCombo = 1;
    speedCorrectCount = 0;
    speedQuestionIndex = 0;
    speedAnsweringLocked = false;

    if (speedTimerInterval) {
      clearInterval(speedTimerInterval);
      speedTimerInterval = null;
    }
    if (speedQuestionTimeout) {
      clearTimeout(speedQuestionTimeout);
      speedQuestionTimeout = null;
    }

    const startCard = $('speed-start-card');
    const gameCard = $('speed-game-card');
    const resultCard = $('speed-result-card');
    if (startCard) startCard.classList.add('hidden');
    if (gameCard) gameCard.classList.remove('hidden');
    if (resultCard) resultCard.classList.add('hidden');

    updateSpeedStatus();
    loadSpeedQuestion(speedQuestionIndex);

    speedTimerInterval = setInterval(() => {
      speedTimeRemaining--;
      updateSpeedStatus();
      if (speedTimeRemaining <= 0) {
        endSpeedGame(false);
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

    const liveCorrect = $('speed-live-correct');
    if (liveCorrect) liveCorrect.textContent = speedCorrectCount;

    const comboText = $('speed-combo-text');
    if (comboText) comboText.textContent = `Combo x${speedCombo}`;

    const comboBadge = $('speed-combo-badge');
    if (comboBadge) {
      comboBadge.style.transform = speedCombo > 1 ? 'scale(1.08)' : 'scale(1)';
    }
  }

  function getSpeedQuestion(index) {
    let category = '';
    let text = '';
    let correctAnswer = '';
    let distractors = [];
    let svg = '';

    switch (index) {
      // ===== LEVEL 1: PEMANASAN & TRIPEL 3-4-5 (SOAL 1 - 5) =====
      case 0:
        category = 'Tingkat 1: Pemanasan Kuadrat';
        text = 'Berapakah hasil penjumlahan kuadrat: 3² + 4² ?';
        correctAnswer = '25';
        distractors = ['14', '49', '12', '7'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <rect x="25" y="45" width="30" height="30" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <text x="40" y="65" text-anchor="middle" font-size="11" font-weight="700" fill="#1B6B4A">3²=9</text>
          <rect x="60" y="35" width="40" height="40" fill="#FEF9E7" stroke="#E8A838" stroke-width="2"/>
          <text x="80" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#B7791F">4²=16</text>
          <text x="120" y="60" text-anchor="middle" font-size="14" font-weight="800" fill="#D94F3B">?²</text>
        </svg>`;
        break;

      case 1:
        category = 'Tingkat 1: Tripel Dasar 3 - 4 - 5';
        text = 'Segitiga siku-siku memiliki alas 3 cm dan tinggi 4 cm. Berapakah sisi miringnya (c)?';
        correctAnswer = '5 cm';
        distractors = ['7 cm', '6 cm', '25 cm', '8 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 125,80 25,20" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2.5"/>
          <rect x="25" y="68" width="12" height="12" fill="none" stroke="#1B6B4A" stroke-width="1.5"/>
          <text x="14" y="55" font-size="12" font-weight="700" fill="#1B6B4A">4</text>
          <text x="75" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#1B6B4A">3</text>
          <text x="85" y="45" font-size="13" font-weight="800" fill="#D94F3B">c = ?</text>
        </svg>`;
        break;

      case 2:
        category = 'Tingkat 1: Akar Kuadrat Dasar';
        text = 'Berapakah nilai dari √100 ?';
        correctAnswer = '10';
        distractors = ['20', '50', '5', '25'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <rect x="50" y="15" width="60" height="60" fill="#EBF5FB" stroke="#2980B9" stroke-width="2.5" rx="3"/>
          <text x="80" y="50" text-anchor="middle" font-size="13" font-weight="800" fill="#1B4F72">Luas = 100</text>
          <text x="80" y="90" text-anchor="middle" font-size="12" font-weight="700" fill="#2980B9">sisi (√100) = ?</text>
        </svg>`;
        break;

      case 3:
        category = 'Tingkat 1: Tripel Pythagoras Dasar';
        text = 'Manakah dari tiga bilangan berikut yang membentuk Tripel Pythagoras siku-siku?';
        correctAnswer = '3, 4, 5';
        distractors = ['2, 3, 4', '4, 5, 6', '1, 2, 3', '5, 6, 7'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <circle cx="45" cy="50" r="18" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <text x="45" y="55" text-anchor="middle" font-size="14" font-weight="800" fill="#1B6B4A">3</text>
          <circle cx="80" cy="50" r="18" fill="#FEF9E7" stroke="#E8A838" stroke-width="2"/>
          <text x="80" y="55" text-anchor="middle" font-size="14" font-weight="800" fill="#B7791F">4</text>
          <circle cx="115" cy="50" r="18" fill="#FADBD8" stroke="#D94F3B" stroke-width="2"/>
          <text x="115" y="55" text-anchor="middle" font-size="14" font-weight="800" fill="#D94F3B">5</text>
        </svg>`;
        break;

      case 4:
        category = 'Tingkat 1: Kelipatan Tripel 3 - 4 - 5';
        text = 'Sisi siku-siku segitiga adalah 6 cm dan 8 cm (kelipatan 2). Berapakah sisi miringnya?';
        correctAnswer = '10 cm';
        distractors = ['14 cm', '12 cm', '48 cm', '9 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 135,80 25,20" fill="#FEF9E7" stroke="#E8A838" stroke-width="2.5"/>
          <rect x="25" y="68" width="12" height="12" fill="none" stroke="#E8A838" stroke-width="1.5"/>
          <text x="14" y="55" font-size="12" font-weight="700" fill="#7D6608">8</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#7D6608">6</text>
          <text x="90" y="45" font-size="13" font-weight="800" fill="#2980B9">c = ?</text>
        </svg>`;
        break;

      // ===== LEVEL 2: SISI SIKU-SIKU & TRIPEL 5-12-13 (SOAL 6 - 10) =====
      case 5:
        category = 'Tingkat 2: Mencari Sisi Siku-Siku';
        text = 'Sisi miring segitiga adalah 10 cm dan alasnya 6 cm. Berapakah panjang sisi tegaknya?';
        correctAnswer = '8 cm';
        distractors = ['4 cm', '16 cm', '7 cm', '14 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 135,80 25,20" fill="#EBF5FB" stroke="#2980B9" stroke-width="2.5"/>
          <text x="12" y="55" font-size="13" font-weight="800" fill="#D94F3B">? cm</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#1B4F72">6 cm</text>
          <text x="90" y="45" font-size="12" font-weight="700" fill="#2980B9">10 cm</text>
        </svg>`;
        break;

      case 6:
        category = 'Tingkat 2: Tripel Populer 5 - 12 - 13';
        text = 'Jika panjang dua sisi siku-siku adalah 5 cm dan 12 cm, berapakah sisi miringnya?';
        correctAnswer = '13 cm';
        distractors = ['17 cm', '15 cm', '60 cm', '14 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="20,80 140,80 20,35" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2.5"/>
          <text x="12" y="60" font-size="11" font-weight="700" fill="#1B6B4A">5</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#1B6B4A">12</text>
          <text x="88" y="50" font-size="13" font-weight="800" fill="#D94F3B">c = ?</text>
        </svg>`;
        break;

      case 7:
        category = 'Tingkat 2: Luas Segitiga Siku-Siku';
        text = 'Berapakah luas segitiga siku-siku dengan alas 6 cm dan tinggi 8 cm?';
        correctAnswer = '24 cm²';
        distractors = ['48 cm²', '14 cm²', '28 cm²', '30 cm²'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 135,80 25,20" fill="#FEF9E7" stroke="#E8A838" stroke-width="2.5"/>
          <text x="80" y="55" text-anchor="middle" font-size="12" font-weight="800" fill="#7D6608">Luas = ½ × a × t</text>
          <text x="80" y="95" text-anchor="middle" font-size="11" font-weight="700" fill="#7D6608">a = 6</text>
          <text x="14" y="55" font-size="11" font-weight="700" fill="#7D6608">t = 8</text>
        </svg>`;
        break;

      case 8:
        category = 'Tingkat 2: Keliling Segitiga';
        text = 'Berapakah keliling segitiga siku-siku dengan sisi 3 cm, 4 cm, dan 5 cm?';
        correctAnswer = '12 cm';
        distractors = ['60 cm', '7 cm', '20 cm', '15 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 125,80 25,25" fill="#FDEDEC" stroke="#E74C3C" stroke-width="2.5"/>
          <text x="75" y="95" text-anchor="middle" font-size="11" font-weight="700" fill="#922B21">3</text>
          <text x="14" y="55" font-size="11" font-weight="700" fill="#922B21">4</text>
          <text x="85" y="45" font-size="11" font-weight="700" fill="#922B21">5</text>
        </svg>`;
        break;

      case 9:
        category = 'Tingkat 2: Teori Geometri SMP';
        text = 'Pada segitiga siku-siku, sisi terpanjang (hipotenusa) selalu menghadap sudut apa?';
        correctAnswer = 'Sudut Siku-siku (90°)';
        distractors = ['Sudut Lancip (<90°)', 'Sudut Tumpul (>90°)', 'Sudut Lurus (180°)', 'Sudut Refleks'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="30,80 130,80 30,25" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2.5"/>
          <rect x="30" y="68" width="12" height="12" fill="#F1C40F" stroke="#1B6B4A" stroke-width="1.5"/>
          <path d="M 36 74 L 100 45" stroke="#D94F3B" stroke-width="1.5" stroke-dasharray="3,3"/>
          <text x="95" y="40" font-size="11" font-weight="800" fill="#D94F3B">Hipotenusa</text>
        </svg>`;
        break;

      // ===== LEVEL 3: TRIPEL LANJUTAN & UJI SEGITIGA (SOAL 11 - 15) =====
      case 10:
        category = 'Tingkat 3: Tripel 8 - 15 - 17';
        text = 'Berapakah sisi miring segitiga siku-siku dengan sisi siku-siku 8 cm dan 15 cm?';
        correctAnswer = '17 cm';
        distractors = ['23 cm', '19 cm', '16 cm', '21 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="20,80 140,80 20,30" fill="#F4ECF7" stroke="#8E44AD" stroke-width="2.5"/>
          <text x="12" y="58" font-size="11" font-weight="700" fill="#8E44AD">8</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#8E44AD">15</text>
          <text x="88" y="48" font-size="13" font-weight="800" fill="#D94F3B">c = ?</text>
        </svg>`;
        break;

      case 11:
        category = 'Tingkat 3: Pengurangan Kuadrat';
        text = 'Sisi miring adalah 13 cm dan sisi tegak 12 cm. Berapakah panjang sisi alasnya?';
        correctAnswer = '5 cm';
        distractors = ['1 cm', '25 cm', '7 cm', '6 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 135,80 25,20" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2.5"/>
          <text x="14" y="55" font-size="12" font-weight="700" fill="#1B6B4A">12</text>
          <text x="90" y="45" font-size="12" font-weight="700" fill="#1B6B4A">13</text>
          <text x="80" y="95" text-anchor="middle" font-size="13" font-weight="800" fill="#D94F3B">alas = ?</text>
        </svg>`;
        break;

      case 12:
        category = 'Tingkat 3: Kebalikan Teorema';
        text = 'Segitiga dengan sisi 5 cm, 6 cm, 7 cm. Karena 5² + 6² = 61 > 7² (49), segitiga ini berjenis:';
        correctAnswer = 'Segitiga Lancip';
        distractors = ['Segitiga Siku-siku', 'Segitiga Tumpul', 'Bukan Segitiga', 'Segitiga Sama Sisi'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="30,80 130,80 75,25" fill="#FEF9E7" stroke="#E8A838" stroke-width="2.5"/>
          <text x="80" y="55" text-anchor="middle" font-size="11" font-weight="800" fill="#7D6608">a² + b² > c²</text>
          <text x="80" y="95" text-anchor="middle" font-size="10" font-weight="700" fill="#7D6608">5, 6, 7</text>
        </svg>`;
        break;

      case 13:
        category = 'Tingkat 3: Tripel 7 - 24 - 25';
        text = 'Sisi miring segitiga adalah 25 cm dan sisi tegak 24 cm. Berapakah panjang alasnya?';
        correctAnswer = '7 cm';
        distractors = ['1 cm', '9 cm', '11 cm', '8 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="20,80 140,80 20,25" fill="#EBF5FB" stroke="#2980B9" stroke-width="2.5"/>
          <text x="12" y="55" font-size="11" font-weight="700" fill="#1B4F72">24</text>
          <text x="85" y="45" font-size="12" font-weight="700" fill="#1B4F72">25</text>
          <text x="80" y="95" text-anchor="middle" font-size="13" font-weight="800" fill="#D94F3B">alas = ?</text>
        </svg>`;
        break;

      case 14:
        category = 'Tingkat 3: Kelipatan 3 dari 3-4-5';
        text = 'Sisi siku-siku segitiga adalah 9 cm dan 12 cm. Berapakah sisi miringnya?';
        correctAnswer = '15 cm';
        distractors = ['21 cm', '18 cm', '13 cm', '16 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 135,80 25,20" fill="#FEF9E7" stroke="#E8A838" stroke-width="2.5"/>
          <text x="14" y="55" font-size="12" font-weight="700" fill="#7D6608">12</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#7D6608">9</text>
          <text x="90" y="45" font-size="13" font-weight="800" fill="#D94F3B">c = ?</text>
        </svg>`;
        break;

      // ===== LEVEL 4: APLIKASI ARSITEKTUR & SOAL CERITA SMP (SOAL 16 - 20) =====
      case 15:
        category = 'Tingkat 4: Soal Cerita Tangga Gedung';
        text = 'Tangga sepanjang 5 m bersandar di dinding. Jarak kaki tangga ke dinding 3 m. Tinggi dinding yang dicapai tangga?';
        correctAnswer = '4 meter';
        distractors = ['2 meter', '8 meter', '3.5 meter', '4.5 meter'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <rect x="25" y="10" width="15" height="75" fill="#BDC3C7" stroke="#7F8C8D" stroke-width="1.5"/>
          <line x1="25" y1="85" x2="140" y2="85" stroke="#795548" stroke-width="2"/>
          <line x1="40" y1="25" x2="105" y2="85" stroke="#E67E22" stroke-width="4"/>
          <text x="80" y="50" font-size="11" font-weight="800" fill="#D35400">5 m</text>
          <text x="70" y="98" font-size="11" font-weight="700" fill="#333">3 m</text>
          <text x="8" y="55" font-size="12" font-weight="800" fill="#C0392B">t = ?</text>
        </svg>`;
        break;

      case 16:
        category = 'Tingkat 4: Diagonal Lantai Ruangan';
        text = 'Lantai aula arsitek berukuran 6 m × 8 m. Berapakah panjang diagonal lantai tersebut?';
        correctAnswer = '10 meter';
        distractors = ['14 meter', '48 meter', '12 meter', '9 meter'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <rect x="25" y="25" width="110" height="50" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <line x1="25" y1="25" x2="135" y2="75" stroke="#E74C3C" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="80" y="20" text-anchor="middle" font-size="11" font-weight="700" fill="#1B6B4A">8 m</text>
          <text x="145" y="55" font-size="11" font-weight="700" fill="#1B6B4A">6 m</text>
          <text x="75" y="55" text-anchor="middle" font-size="12" font-weight="800" fill="#C0392B">d = ?</text>
        </svg>`;
        break;

      case 17:
        category = 'Tingkat 4: Kawat Tiang Antena';
        text = 'Tiang antena setinggi 12 m dipasangi kawat pancang ke tanah berjarak 5 m dari tiang. Panjang kawat penopang?';
        correctAnswer = '13 meter';
        distractors = ['17 meter', '60 meter', '15 meter', '11 meter'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <line x1="40" y1="15" x2="40" y2="85" stroke="#34495E" stroke-width="3"/>
          <line x1="30" y1="85" x2="130" y2="85" stroke="#795548" stroke-width="2"/>
          <line x1="40" y1="15" x2="110" y2="85" stroke="#2980B9" stroke-width="2.5"/>
          <text x="18" y="50" font-size="11" font-weight="700" fill="#34495E">12 m</text>
          <text x="75" y="98" font-size="11" font-weight="700" fill="#333">5 m</text>
          <text x="85" y="45" font-size="12" font-weight="800" fill="#2980B9">kawat = ?</text>
        </svg>`;
        break;

      case 18:
        category = 'Tingkat 4: Jarak Jalur Kapal';
        text = 'Kapal pengangkut semen berlayar ke utara sejauh 12 km, lalu ke timur 9 km. Jarak terdekat kapal dari pelabuhan?';
        correctAnswer = '15 km';
        distractors = ['21 km', '16 km', '18 km', '14 km'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <circle cx="35" cy="80" r="5" fill="#27AE60"/>
          <line x1="35" y1="80" x2="35" y2="25" stroke="#333" stroke-width="2" stroke-dasharray="3,3"/>
          <line x1="35" y1="25" x2="120" y2="25" stroke="#333" stroke-width="2" stroke-dasharray="3,3"/>
          <line x1="35" y1="80" x2="120" y2="25" stroke="#E74C3C" stroke-width="2.5"/>
          <text x="16" y="55" font-size="11" font-weight="700" fill="#333">12 km</text>
          <text x="78" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="#333">9 km</text>
          <text x="85" y="60" font-size="12" font-weight="800" fill="#C0392B">jarak = ?</text>
        </svg>`;
        break;

      case 19:
        category = 'Tingkat 4: Rangka Atap Kasau';
        text = 'Rangka atap rumah memiliki tinggi 8 m dan alas miring 15 m. Berapakah panjang balok kayu kasau miringnya?';
        correctAnswer = '17 meter';
        distractors = ['23 meter', '19 meter', '25 meter', '12 meter'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="20,80 140,80 80,25" fill="#FEF9E7" stroke="#E8A838" stroke-width="2"/>
          <line x1="80" y1="25" x2="80" y2="80" stroke="#D94F3B" stroke-width="2" stroke-dasharray="3,3"/>
          <text x="88" y="55" font-size="11" font-weight="700" fill="#D94F3B">t = 8 m</text>
          <text x="110" y="95" font-size="11" font-weight="700" fill="#7D6608">15 m</text>
          <text x="120" y="50" font-size="12" font-weight="800" fill="#27AE60">kasau = ?</text>
        </svg>`;
        break;

      // ===== LEVEL 5: SUPER SPEED BONUS (SOAL 21 - 25 MENUJU REKOR WAKTU!) =====
      case 20:
        category = '⚡ BONUS 1: Kelipatan 5-12-13 (x2)';
        text = 'Sisi siku-siku segitiga adalah 10 cm dan 24 cm. Berapakah panjang sisi miringnya?';
        correctAnswer = '26 cm';
        distractors = ['34 cm', '28 cm', '25 cm', '30 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="20,80 140,80 20,30" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2.5"/>
          <text x="12" y="58" font-size="11" font-weight="700" fill="#1B6B4A">10</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#1B6B4A">24</text>
          <text x="88" y="48" font-size="13" font-weight="800" fill="#D94F3B">c = ?</text>
        </svg>`;
        break;

      case 21:
        category = '⚡ BONUS 2: Kabel Menara 9 - 40 - 41';
        text = 'Menara pengawas setinggi 40 m ditopang kabel baja ke tanah sejauh 9 m. Berapa panjang kabel penopang?';
        correctAnswer = '41 meter';
        distractors = ['49 meter', '31 meter', '45 meter', '50 meter'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <line x1="30" y1="15" x2="30" y2="85" stroke="#34495E" stroke-width="3"/>
          <line x1="30" y1="15" x2="130" y2="85" stroke="#F39C12" stroke-width="2.5"/>
          <text x="12" y="55" font-size="11" font-weight="700" fill="#34495E">40 m</text>
          <text x="80" y="98" font-size="11" font-weight="700" fill="#333">9 m</text>
          <text x="85" y="45" font-size="12" font-weight="800" fill="#E67E22">kabel = ?</text>
        </svg>`;
        break;

      case 22:
        category = '⚡ BONUS 3: Kelipatan 3-4-5 (x5)';
        text = 'Sisi siku-siku segitiga adalah 15 cm dan 20 cm (kelipatan 5). Berapakah sisi miringnya?';
        correctAnswer = '25 cm';
        distractors = ['35 cm', '30 cm', '28 cm', '22 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 135,80 25,20" fill="#FEF9E7" stroke="#E8A838" stroke-width="2.5"/>
          <text x="12" y="55" font-size="11" font-weight="700" fill="#7D6608">15</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#7D6608">20</text>
          <text x="90" y="45" font-size="13" font-weight="800" fill="#2980B9">c = ?</text>
        </svg>`;
        break;

      case 23:
        category = '⚡ BONUS 4: Kuadrat Diagonal Persegi';
        text = 'Taman persegi memiliki panjang sisi 7 m. Berapakah nilai kuadrat diagonalnya (d² = 7² + 7²)?';
        correctAnswer = '98 m²';
        distractors = ['49 m²', '14 m²', '196 m²', '100 m²'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <rect x="50" y="20" width="55" height="55" fill="#E8F8F0" stroke="#1B6B4A" stroke-width="2"/>
          <line x1="50" y1="20" x2="105" y2="75" stroke="#E74C3C" stroke-width="2" stroke-dasharray="3,3"/>
          <text x="77" y="15" text-anchor="middle" font-size="11" font-weight="700" fill="#1B6B4A">7 m</text>
          <text x="77" y="52" text-anchor="middle" font-size="11" font-weight="800" fill="#C0392B">d² = ?</text>
        </svg>`;
        break;

      case 24:
      default:
        category = '🏆 SOAL PAMUNGKAS KE-25: REKOR WAKTU!';
        text = 'Sisi miring segitiga adalah 20 cm dan alasnya 16 cm. Berapakah panjang sisi tegaknya?';
        correctAnswer = '12 cm';
        distractors = ['4 cm', '36 cm', '14 cm', '8 cm'];
        svg = `<svg viewBox="0 0 160 100" width="140" height="90">
          <polygon points="25,80 135,80 25,20" fill="#FDEDEC" stroke="#E74C3C" stroke-width="3"/>
          <text x="90" y="45" font-size="12" font-weight="800" fill="#E74C3C">c = 20 cm</text>
          <text x="80" y="95" text-anchor="middle" font-size="12" font-weight="700" fill="#1B4F72">16 cm</text>
          <text x="12" y="55" font-size="13" font-weight="800" fill="#27AE60">t = ?</text>
        </svg>`;
        break;
    }

    const options = makeSpeedOptions(correctAnswer, distractors);
    return { category, text, correctAnswer, options, svg };
  }

  function loadSpeedQuestion(idx) {
    if (speedTimeRemaining <= 0) return;
    speedAnsweringLocked = false;

    const q = getSpeedQuestion(idx);

    const catEl = $('speed-q-category');
    if (catEl) catEl.textContent = q.category;

    const progEl = $('speed-q-progress');
    if (progEl) {
      if (idx < SPEED_REGULAR_QUESTIONS) {
        progEl.textContent = `Soal ${idx + 1} / ${SPEED_REGULAR_QUESTIONS}`;
        progEl.classList.remove('bonus');
      } else {
        progEl.textContent = `Soal ${idx + 1} / ${SPEED_TOTAL_QUESTIONS} ⚡ BONUS SPEED RUN!`;
        progEl.classList.add('bonus');
      }
    }

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
        if (speedAnsweringLocked || speedTimeRemaining <= 0) return;
        speedAnsweringLocked = true;

        const isCorrect = (opt === q.correctAnswer);
        if (isCorrect) {
          btn.classList.add('correct');
          GameAudio.correct();
          speedCorrectCount++;
          speedCombo++;
          if (speedCombo > speedMaxCombo) speedMaxCombo = speedCombo;
          updateSpeedStatus();
        } else {
          btn.classList.add('wrong');
          grid.querySelectorAll('.speed-btn-option').forEach(b => {
            if (b.textContent === q.correctAnswer) b.classList.add('correct');
          });
          GameAudio.wrong();
          speedCombo = 1;
          updateSpeedStatus();
        }

        speedQuestionIndex++;

        // Cek jika sudah menjawab hingga soal ke-25 (Selesai sebelum 60 detik!)
        if (speedQuestionIndex >= SPEED_TOTAL_QUESTIONS) {
          speedQuestionTimeout = setTimeout(() => {
            endSpeedGame(true);
          }, 250);
          return;
        }

        // Lanjut ke soal berikutnya
        const delay = isCorrect ? 200 : 450;
        speedQuestionTimeout = setTimeout(() => {
          if (speedTimeRemaining > 0) {
            loadSpeedQuestion(speedQuestionIndex);
          }
        }, delay);
      });
      grid.appendChild(btn);
    });
  }

  function endSpeedGame(completedAll25 = false) {
    if (speedTimerInterval) {
      clearInterval(speedTimerInterval);
      speedTimerInterval = null;
    }
    if (speedQuestionTimeout) {
      clearTimeout(speedQuestionTimeout);
      speedQuestionTimeout = null;
    }

    const gameCard = $('speed-game-card');
    const resultCard = $('speed-result-card');
    if (gameCard) gameCard.classList.add('hidden');
    if (resultCard) resultCard.classList.remove('hidden');

    GameAudio.fanfare();

    // Waktu tempuh (detik): jika tamat 25 soal dihitung waktu pemakaiannya, jika waktu habis = 60 detik
    const finishTime = completedAll25 ? Math.max(1, 60 - speedTimeRemaining) : (60 - speedTimeRemaining);

    const titleEl = $('speed-result-title');
    const bannerEl = $('speed-time-record-banner');
    const finishTimeEl = $('speed-finish-time');
    const newHighNotice = $('speed-new-high');

    const statCorrect = $('speed-stat-correct');
    if (statCorrect) statCorrect.textContent = `${speedCorrectCount} / 25`;

    const statTime = $('speed-stat-time');
    if (statTime) statTime.textContent = `${finishTime}s`;

    const statCombo = $('speed-stat-combo');
    if (statCombo) statCombo.textContent = `x${speedMaxCombo}`;

    const tierBadge = $('speed-tier-badge');
    const mascotEl = $('speed-result-mascot');

    if (tierBadge) {
      if (completedAll25) tierBadge.textContent = '🌟 Legenda Kilat Geometri';
      else if (speedCorrectCount >= 20) tierBadge.textContent = '🏆 Insinyur Ahli Pythagoras';
      else if (speedCorrectCount >= 15) tierBadge.textContent = '📐 Arsitek Mahir';
      else if (speedCorrectCount >= 10) tierBadge.textContent = '🔨 Arsitek Muda';
      else if (speedCorrectCount >= 5) tierBadge.textContent = '👷 Asisten Arsitek';
      else tierBadge.textContent = '🌱 Murid Magang';
    }

    if (mascotEl) {
      mascotEl.innerHTML = GameEngine.getMascotSVG(speedCorrectCount >= 15 ? 'excited' : (speedCorrectCount >= 8 ? 'happy' : 'normal'), 80);
    }

    // Rekor: Kriteria 1 = Jumlah Soal Benar, Kriteria 2 = Waktu Tercepat
    const oldRec = getSpeedBestRecord();
    const isNew = isBetterRecord(speedCorrectCount, finishTime, oldRec);

    if (completedAll25) {
      if (titleEl) titleEl.textContent = '🎉 TAMAT 25 SOAL! ⚡';
      if (bannerEl) bannerEl.classList.remove('hidden');
      if (finishTimeEl) finishTimeEl.textContent = `${finishTime} Detik`;

      if (isNew) {
        setSpeedBestRecord({ correct: 25, time: finishTime, date: new Date().toLocaleDateString('id-ID') });
        if (newHighNotice) {
          newHighNotice.classList.remove('hidden');
          newHighNotice.innerHTML = `⚡ <strong>REKOR WAKTU TERCEPAT BARU!</strong><br>Selesai 25 soal sempurna dalam <strong>${finishTime} Detik</strong>! 🏆`;
        }
        GameEngine.startConfetti();
        setTimeout(() => GameEngine.stopConfetti(), 4000);
      } else {
        if (newHighNotice) {
          newHighNotice.classList.remove('hidden');
          newHighNotice.innerHTML = `Hebat! Waktu tempuh: <strong>${finishTime}s</strong> (Rekor Terbaikmu: <strong>${oldRec.time}s</strong>)`;
        }
      }
    } else {
      if (titleEl) titleEl.textContent = 'Waktu Habis! 🔔';
      if (bannerEl) bannerEl.classList.add('hidden');

      if (isNew) {
        setSpeedBestRecord({ correct: speedCorrectCount, time: finishTime, date: new Date().toLocaleDateString('id-ID') });
        if (newHighNotice) {
          newHighNotice.classList.remove('hidden');
          newHighNotice.innerHTML = `🎉 <strong>REKOR TERBAIK BARU!</strong><br>Berhasil <strong>${speedCorrectCount} Soal Benar</strong> dalam waktu <strong>${finishTime} Detik</strong>!`;
        }
        GameEngine.startConfetti();
        setTimeout(() => GameEngine.stopConfetti(), 3500);
      } else {
        if (newHighNotice) {
          if (oldRec && oldRec.correct > 0) {
            newHighNotice.classList.remove('hidden');
            newHighNotice.innerHTML = `Rekor Terbaikmu: <strong>${oldRec.correct} Soal Benar (${oldRec.time}s)</strong>`;
          } else {
            newHighNotice.classList.add('hidden');
          }
        }
      }
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
