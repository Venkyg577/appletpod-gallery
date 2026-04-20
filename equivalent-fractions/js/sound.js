// Offline sound: Web Audio tones (works on file://)

const sound = {
  enabled: true,
};

function getAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!getAudioContext._ctx) {
    getAudioContext._ctx = new AC();
  }
  return getAudioContext._ctx;
}

function playTone(freq, durationSec, type, gainVal) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal != null ? gainVal : 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationSec);
  } catch (e) {
    /* ignore */
  }
}

sound.playClickSound = function () {
  playTone(660, 0.06, 'square', 0.08);
};
sound.playCorrectSound = function () {
  playTone(523, 0.08, 'sine', 0.1);
  setTimeout(function () {
    playTone(784, 0.12, 'sine', 0.1);
  }, 70);
};
sound.playWrongSound = function () {
  playTone(180, 0.18, 'sawtooth', 0.12);
};
sound.playCutSound = function () {
  playTone(320, 0.05, 'triangle', 0.09);
  setTimeout(function () {
    playTone(180, 0.08, 'square', 0.07);
  }, 40);
};
sound.playWhoosh = function () {
  playTone(440, 0.12, 'sine', 0.06);
};

window.sound = sound;
