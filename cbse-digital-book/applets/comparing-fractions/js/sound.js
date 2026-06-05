/* Lightweight offline sound helper. Audio files live in assets/. */

const sound = {
  enabled: true,
  cache: {},
};

function loadSound(key, src) {
  try {
    const audio = new Audio(src);
    audio.preload = 'auto';
    sound.cache[key] = audio;
  } catch (e) {
    console.warn('Failed to load sound', key, e);
  }
}

const baseAudioPath = 'assets';

loadSound('click', baseAudioPath + '/click.mp3');
loadSound('correct', baseAudioPath + '/correct.mp3');
loadSound('wrong', baseAudioPath + '/wrong.mp3');
loadSound('confetti', baseAudioPath + '/confetti.mp3');

function play(name) {
  if (!sound.enabled) return;
  const audio = sound.cache[name];
  if (!audio) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (e) {
    /* ignore autoplay/locked errors */
  }
}

sound.playClickSound = function () { play('click'); };
sound.playCorrectSound = function () { play('correct'); };
sound.playWrongSound = function () { play('wrong'); };
sound.playConfettiSound = function () { play('confetti'); };

window.sound = sound;
