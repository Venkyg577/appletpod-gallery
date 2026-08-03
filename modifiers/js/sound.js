// Offline sound: optional MP3 in assets/audio; Web Audio fallback

const sound = {
  enabled: true,
  cache: {},
};

function getAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!getAudioContext._ctx) {
    getAudioContext._ctx = new AC();
  }
  return getAudioContext._ctx;
}

function playTone(freq, durationSec, type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationSec);
  } catch (e) {
    /* ignore */
  }
}

function loadSound(key, src) {
  try {
    const audio = new Audio(src);
    audio.preload = 'auto';
    sound.cache[key] = audio;
  } catch (e) {
    console.warn('Failed to load sound', key, e);
  }
}

// Avoid file:// MP3 fetches (404 + browser security noise); use Web Audio only.
// When served over http(s) and assets exist, HTMLAudio still plays if loaded.
const baseAudioPath = 'assets/audio';
if (typeof location !== 'undefined' && location.protocol !== 'file:') {
  loadSound('click', baseAudioPath + '/click.mp3');
  loadSound('correct', baseAudioPath + '/correct.mp3');
  loadSound('wrong', baseAudioPath + '/wrong.mp3');
}

function play(name) {
  if (!sound.enabled) return;
  const audio = sound.cache[name];
  if (audio) {
    try {
      audio.currentTime = 0;
      audio.play().catch(function () {
        playFallback(name);
      });
      return;
    } catch (e) {
      /* fall through */
    }
  }
  playFallback(name);
}

function playFallback(name) {
  if (name === 'click') playTone(660, 0.06, 'square');
  else if (name === 'correct') {
    playTone(523, 0.08);
    setTimeout(function () {
      playTone(784, 0.12);
    }, 70);
  } else if (name === 'wrong') playTone(180, 0.15, 'sawtooth');
}

sound.playClickSound = function () {
  play('click');
};
sound.playCorrectSound = function () {
  play('correct');
};
sound.playWrongSound = function () {
  play('wrong');
};
sound.playDropSound = function () {
  playTone(440, 0.1, 'sine');
  setTimeout(function () { playTone(580, 0.08, 'sine'); }, 60);
};
sound.playDigitSound = function (index) {
  var freq = 500 + (index || 0) * 60;
  playTone(freq, 0.07, 'sine');
};

window.sound = sound;
