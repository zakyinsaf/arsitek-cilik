/* ======================================
   AUDIO ENGINE — Web Audio API
   Semua suara prosedural, tanpa file eksternal
   ====================================== */
const GameAudio = (() => {
  let ctx = null;
  let soundOn = true;
  let bgmInterval = null;
  let masterGain = null;

  /** Inisialisasi AudioContext (harus dipanggil setelah gesture user) */
  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);
    } catch (e) { /* browser tidak mendukung */ }
  }

  /** Resume context jika suspended (kebijakan autoplay) */
  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /** Mainkan satu nada */
  function playNote(freq, duration, type = 'sine', vol = 0.3, delay = 0) {
    if (!soundOn || !ctx || !masterGain) return;
    resume();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  /** Mainkan noise burst */
  function playNoise(duration, vol = 0.1) {
    if (!soundOn || !ctx || !masterGain) return;
    resume();
    const bufSize = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * vol;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(gain);
    gain.connect(masterGain);
    src.start();
  }

  /* --- Sound Effects --- */

  function click() {
    playNote(800, 0.06, 'sine', 0.2);
  }

  function correct() {
    // Ascending C5-E5-G5
    playNote(523, 0.15, 'sine', 0.25, 0);
    playNote(659, 0.15, 'sine', 0.25, 0.12);
    playNote(784, 0.25, 'sine', 0.3, 0.24);
  }

  function wrong() {
    // Descending buzz
    playNote(300, 0.12, 'sawtooth', 0.15, 0);
    playNote(200, 0.25, 'sawtooth', 0.12, 0.1);
  }

  function star() {
    playNote(1200, 0.1, 'sine', 0.2, 0);
    playNote(1500, 0.15, 'sine', 0.15, 0.08);
  }

  function fanfare() {
    // C-E-G-C5 arpeggio
    playNote(523, 0.2, 'sine', 0.25, 0);
    playNote(659, 0.2, 'sine', 0.25, 0.15);
    playNote(784, 0.2, 'sine', 0.25, 0.3);
    playNote(1047, 0.4, 'sine', 0.3, 0.45);
  }

  function bossStart() {
    // Dramatic low sweep
    if (!soundOn || !ctx || !masterGain) return;
    resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }

  function confettiSound() {
    playNoise(0.2, 0.08);
    playNote(900, 0.08, 'sine', 0.15, 0);
    playNote(1100, 0.08, 'sine', 0.12, 0.06);
  }

  function hintSound() {
    playNote(600, 0.1, 'triangle', 0.15, 0);
    playNote(700, 0.15, 'triangle', 0.12, 0.08);
  }

  function loseLife() {
    playNote(400, 0.15, 'sawtooth', 0.15, 0);
    playNote(300, 0.2, 'sawtooth', 0.12, 0.12);
    playNote(200, 0.3, 'sawtooth', 0.1, 0.25);
  }

  function levelComplete() {
    fanfare();
    setTimeout(() => confettiSound(), 500);
  }

  /* --- Toggle --- */
  function toggle() {
    soundOn = !soundOn;
    if (!soundOn) stopBGM();
    return soundOn;
  }

  function isOn() { return soundOn; }
  function setSoundOn(val) { soundOn = val; }

  /* --- BGM (simple ambient loop) --- */
  function startBGM() {
    if (bgmInterval || !soundOn) return;
    const chords = [
      [261, 329, 392],  // C major
      [293, 370, 440],  // D major
      [261, 329, 392],  // C major
      [246, 311, 370],  // B dim (soft)
    ];
    let idx = 0;
    const playChord = () => {
      if (!soundOn) return;
      const chord = chords[idx % chords.length];
      chord.forEach(f => playNote(f, 1.8, 'sine', 0.04));
      idx++;
    };
    playChord();
    bgmInterval = setInterval(playChord, 2000);
  }

  function stopBGM() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }

  return {
    init, resume, click, correct, wrong, star, fanfare,
    bossStart, confettiSound, hintSound, loseLife, levelComplete,
    toggle, isOn, setSoundOn, startBGM, stopBGM
  };
})();
