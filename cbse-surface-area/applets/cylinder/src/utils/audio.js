let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/** Short pleasant tap for interactions */
export function playTap() {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") void ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    const t0 = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
    o.start(t0);
    o.stop(t0 + 0.09);
  } catch {
    /* ignore */
  }
}

export function playChime() {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") void ctx.resume();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + i * 0.07;
      g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      o.start(t0);
      o.stop(t0 + 0.25);
    });
  } catch {
    /* ignore */
  }
}
