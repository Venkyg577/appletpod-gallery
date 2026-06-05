/* Equivalent Fractions – main app state machine (34 screens).
   Components are called as plain functions, not h(Fn, props). */

(function () {
  const h = window.createElement;
  const OVERLAP_ANIMATION_MS = 4000;
  const S15_OVERLAP_RETURN_BUFFER_MS = 1400;
  const CORRECT_FEEDBACK_MS = 900;

  const {
    CharacterPanel,
    FooterNav,
    AppletButton,
    Confetti,
    visibleTextLength,
    formatFractionsInHtml,
  } = window.Components;
  const { ChocolateBar, FractionChip } = window.ChocolateBarComponent;
  const { getText } = window.utils;

  /* ─────────────── State ─────────────── */
  let appState = {
    phase: 'splash',
    step: 1,
    pickedParts: null,
    selectedColor: null,
    shadedLeft: false,
    shadedRight: false,
    shadedLeftIdx: 0,   /* which segment index was tapped on left bar */
    shadedRightIdx: 0,  /* which segment index was tapped on right bar */
    wholeSplit: null,
    s8Phase: 'intro',   /* S8: 'intro' (What happens?) → 'choose' (tap either whole) */
    pickedSplitParts: null,
    splitsDone: 0,
    splitComplete: false,
    fractionAns: null,
    symbolAns: null,
    overlapPhase: 'idle',
    s16SlideDelta: null,
    barsPartitioned: false,
    s2Split: false,        /* true when Next on S2 is tapped → bars split visually before advancing */
    autoAdvancing: false,  /* true during a timed auto-advance pause — blocks manual Next */
    ex2SplitsDone: 0,
    ex2SplitComplete: false,
    ex2FractionAns: null,
    equivAns: null,
    s7YesNo: null,
    s11PulsePhase: null,   /* null | 'shaded' | 'all' — count-pulse sequence on S11/S12/S13 */
    s17PulsePhase: null,   /* null | 'all' | 'shaded' — two-stage pulse on S17 */
    s15OverlapPhase: 'idle', /* null | 'idle' | 'animating' | 'done' — S15 overlap animation state */
    s15OverlapChoice: null,
    s15SlideDelta: null,
    s19PulsePhase: null,   /* null | 'shaded' | 'fraction' — S19 pulse shaded then fraction chips */
    s24PulsePhase: null,   /* null | 'shaded' | 'all' | 'done' — count-pulse on S24 fraction pick */
    s25PulsePhase: null,   /* null | 'shaded' | 'all' | 'done' — count-pulse on S25/S26 */
    s27PulsePhase: null,   /* null | 'shaded' | 'all' — count-pulse on S27 enter */
    s28PulsePhase: null,   /* null | 'group' — pulse the 2 shaded segments on S28/S29 wrong */
    s30SymPhase: 'question', /* 'question' | 'equal' — animate ?→= swap on S30 */
    feedback: null,
    wrongValue: null,
    typewriterStep: null,
    typewriterKey: '',
    typewriterChars: null,
    typewriterDoneKey: '',
    showConfetti: false,
    language: 'en',
  };

  /* ─────────────── Timers ─────────────── */
  let autoTimer = null;
  let typewriterTimer = null;
  let pendingTypewriterKey = '';
  let lastShownDialogueKey = '';

  function clearAutoTimer() { if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; } }
  function clearTypewriterTimer() { if (typewriterTimer) { clearTimeout(typewriterTimer); typewriterTimer = null; } }

  function scheduleAuto(ms, fn) {
    clearAutoTimer();
    autoTimer = setTimeout(function () { autoTimer = null; fn(); }, ms);
  }

  /* ─────────────── Core ─────────────── */
  let rendering = false;
  let pendingPatch = null;

  function setState(patch) {
    if (rendering) { pendingPatch = Object.assign(pendingPatch || {}, patch); return; }
    Object.assign(appState, patch);
    renderApp();
    if (pendingPatch) { var p = pendingPatch; pendingPatch = null; setState(p); }
  }

  function td(key) { return getText('content-ui.dialogs.' + key, {}, appState.language); }
  function tb(key) { return getText('standard-ui.buttons.' + key, {}, appState.language); }
  function tl(key) { return getText('standard-ui.labels.' + key, {}, appState.language); }

  /* ─────────────── Text helpers ─────────────── */
  function fmtLine(raw) {
    if (!raw) return null;
    return h('span', { dangerouslySetInnerHTML: { __html: formatFractionsInHtml(raw) } });
  }

  /* ─────────────── Typewriter (disabled — dialogue shows instantly) ─────────────── */
  function ensureTypewriter(lines) {
    var key = (lines || []).join('|');
    if (appState.typewriterDoneKey === key) return;
    lastShownDialogueKey = key;
    setState({ typewriterDoneKey: key });
  }

/* ─────────────── Navigation gating ─────────────── */
  function canGoNext(s) {
    switch (s.step) {
      case 1:  return false;
      case 3:  return s.pickedParts === 2 && s.shadedLeft && s.shadedRight;
      case 4:  return s.pickedParts === 2;
      case 5:  return s.shadedLeft && s.shadedRight;
      case 8:  return s.s8Phase === 'choose' ? s.wholeSplit !== null : true;
      case 9:  return s.pickedSplitParts !== null;
      case 11: return s.s11PulsePhase === 'done';
      case 12: return s.s11PulsePhase === 'done';
      case 15: return s.symbolAns === '=';
      case 16: return s.overlapPhase === 'done';
      case 24: return s.ex2SplitComplete && s.s24PulsePhase === 'done';
      case 25: return s.s25PulsePhase === 'done';
      case 26: return s.s25PulsePhase === 'done';
      case 28: return s.equivAns === 'Yes';
      case 33: return false;
      default: return true;
    }
  }

  function goNext() {
    var s = appState;
    if (s.step === 1) return;
    if (s.autoAdvancing) return;
    if (!canGoNext(s)) return;
    clearAutoTimer();
    /* S8 is two-phase: intro ("What happens?") → choose ("tap either whole"). First Next advances the phase, not the step. */
    if (s.step === 8 && s.s8Phase === 'intro') {
      window.sound && window.sound.playClickSound();
      return setState({ s8Phase: 'choose', typewriterDoneKey: '' });
    }
    var next = s.step + 1;
    /* Skip steps */
    if (s.step === 3  && s.pickedParts === 2) next = 7;   /* S3 now handles colour+shading; skip S4/S5/S6 → S7 */
    if (s.step === 9) next = 11;   /* S10 removed as redundant; S9 already shows the split result */
    if (s.step === 15) next = 17;  /* S16 removed as irrelevant */
    if ((s.step === 11 || s.step === 12) && s.fractionAns === (((s.pickedSplitParts || 4) / 2) + '/' + (s.pickedSplitParts || 4))) next = 14;
    if (s.step === 24 && s.ex2FractionAns === '2/6') next = 28;
    if ((s.step === 25 || s.step === 26) && s.ex2FractionAns === '2/6') next = 28;
    if (s.step === 28 && s.equivAns === 'Yes') next = 30;  /* S29 is retry-only; skip on correct */
    if (next > 33) return;
    window.sound && window.sound.playClickSound();
    var patch = { step: next, feedback: null, wrongValue: null, typewriterDoneKey: '', s11PulsePhase: null, s17PulsePhase: null, s19PulsePhase: null, s15OverlapPhase: 'idle', s15OverlapChoice: null, s15SlideDelta: null, s24PulsePhase: null, s25PulsePhase: null, s27PulsePhase: null, s28PulsePhase: null };
    if (next === 16) { patch.overlapPhase = 'idle'; patch.s16SlideDelta = null; }
    setState(patch);
    if (next === 13) startS13Pulse();
    if (next === 27) startS27Pulse();
    /* S30: start with '?' symbol, swap to '=' after 1.2s */
    if (next === 30) { setState({ s30SymPhase: 'equal' }); }
    /* S19: pulse shaded → then fraction chips on enter */
    if (next === 19) {
      setState({ s19PulsePhase: 'shaded' });
      scheduleAuto(2000, function () {
        setState({ s19PulsePhase: 'fraction' });
        scheduleAuto(2000, function () { setState({ s19PulsePhase: null }); });
      });
    }
    /* S17: two-stage pulse all-parts → shaded-only on enter */
    if (next === 17) {
      setState({ s17PulsePhase: 'all' });
      scheduleAuto(2000, function () {
        setState({ s17PulsePhase: 'shaded' });
        scheduleAuto(2000, function () { setState({ s17PulsePhase: null }); });
      });
    }
    if (next === 33) { setState({ showConfetti: true }); scheduleAuto(3000, function () { setState({ showConfetti: false }); }); }
  }

  function goPrev() {
    if (appState.step <= 2) return;
    var prev = appState.step - 1;
    /* S5 prev → skip S4, go back to S3 and reset picked answer */
    if (appState.step === 5) { prev = 3; return setState({ step: 3, pickedParts: null, feedback: null, wrongValue: null, selectedColor: null, shadedLeft: false, shadedRight: false }); }
    /* S8 prev: if in 'choose' phase go back to 'intro'; else back to S7 */
    if (appState.step === 8) {
      if (appState.s8Phase === 'choose') { return setState({ s8Phase: 'intro', wholeSplit: null, feedback: null, wrongValue: null }); }
      return setState({ step: 7, wholeSplit: null, s8Phase: 'intro', feedback: null, wrongValue: null });
    }
    /* S9 prev → back to S8 choose phase, reset split choice */
    if (appState.step === 9) { return setState({ step: 8, s8Phase: 'choose', pickedSplitParts: null, splitComplete: false, feedback: null, wrongValue: null }); }
    /* S11 prev → skip removed S10, go back to S9 */
    if (appState.step === 11) { return setState({ step: 9, feedback: null, wrongValue: null }); }
    setState(completedStepPatch(prev, { step: prev, feedback: null, wrongValue: null }));
  }

  function doRestart() {
    clearAutoTimer(); clearTypewriterTimer();
    pendingTypewriterKey = ''; lastShownDialogueKey = '';
    setState({
      phase: 'splash', step: 1,
      pickedParts: null, selectedColor: null, shadedLeft: false, shadedRight: false, shadedLeftIdx: 0, shadedRightIdx: 0,
      wholeSplit: null, s8Phase: 'intro', pickedSplitParts: null, splitsDone: 0, splitComplete: false,
      barsPartitioned: false, s2Split: false, autoAdvancing: false, fractionAns: null, symbolAns: null, overlapPhase: 'idle', s16SlideDelta: null, s7YesNo: null,
      s11PulsePhase: null, s17PulsePhase: null, s15OverlapPhase: 'idle', s15OverlapChoice: null, s15SlideDelta: null, s19PulsePhase: null,
      s24PulsePhase: null, s25PulsePhase: null, s27PulsePhase: null, s28PulsePhase: null, s30SymPhase: 'question',
      ex2SplitsDone: 0, ex2SplitComplete: false, ex2FractionAns: null, equivAns: null,
      feedback: null, wrongValue: null,
      typewriterStep: null, typewriterKey: '', typewriterChars: null, typewriterDoneKey: '',
      showConfetti: false,
    });
  }

  /* ─────────────── Scale helper (for DOM-measured overlap animations) ─────────────── */
  function getScaleFactor() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scaleFactor')) || 1;
  }

  function startS13Pulse() {
    setState({ s11PulsePhase: 'shaded' });
    scheduleAuto(1400, function () {
      setState({ s11PulsePhase: 'all' });
      scheduleAuto(1400, function () { setState({ s11PulsePhase: null }); });
    });
  }

  function startS27Pulse() {
    setState({ s27PulsePhase: 'shaded' });
    scheduleAuto(1400, function () {
      setState({ s27PulsePhase: 'all' });
      scheduleAuto(1400, function () { setState({ s27PulsePhase: null }); });
    });
  }

  function completedStepPatch(step, patch) {
    var p = Object.assign({}, patch || {});
    p.s11PulsePhase = null;
    p.s17PulsePhase = null;
    p.s19PulsePhase = null;
    p.s24PulsePhase = null;
    p.s25PulsePhase = null;
    p.s27PulsePhase = null;
    p.s28PulsePhase = null;
    if (step < 11) p.fractionAns = null;
    if (step < 15) p.symbolAns = null;
    if (step < 16) p.overlapPhase = 'idle';
    if (step < 24) p.ex2FractionAns = null;
    if (step < 28) p.equivAns = null;
    if (step >= 3) p.pickedParts = 2;
    if (step >= 7) {
      p.selectedColor = p.selectedColor || appState.selectedColor || 'pink';
      p.shadedLeft = true;
      p.shadedRight = true;
    }
    if (step >= 9) {
      p.wholeSplit = appState.wholeSplit || 'left';
    }
    if (step >= 10) {
      p.pickedSplitParts = appState.pickedSplitParts || 4;
      p.splitComplete = true;
    }
    if (step === 11 || step === 12) {
      p.fractionAns = ((p.pickedSplitParts || appState.pickedSplitParts || 4) / 2) + '/' + (p.pickedSplitParts || appState.pickedSplitParts || 4);
      p.s11PulsePhase = 'done';
    }
    if (step >= 13) {
      p.fractionAns = ((p.pickedSplitParts || appState.pickedSplitParts || 4) / 2) + '/' + (p.pickedSplitParts || appState.pickedSplitParts || 4);
    }
    if (step >= 15) p.symbolAns = '=';
    if (step >= 16) p.overlapPhase = 'done';
    if (step >= 24) {
      p.ex2SplitsDone = 3;
      p.ex2SplitComplete = true;
    }
    if (step >= 25) { p.ex2FractionAns = '2/6'; p.s24PulsePhase = 'done'; }
    if (step === 25 || step === 26) { p.s25PulsePhase = 'done'; }
    if (step >= 27) p.ex2FractionAns = '2/6';
    if (step >= 28) p.equivAns = 'Yes';
    return p;
  }

  /* ─────────────── Color helpers ─────────────── */
  var COLORS = [
    { id: 'pink',  hex: '#C2185B' },
    { id: 'green', hex: '#219150' },
    { id: 'blue',  hex: '#2563EB' },
  ];
  function shadeHex(id) {
    var c = COLORS.filter(function (x) { return x.id === id; })[0];
    return c ? c.hex : '#FF9F1A';
  }

  /* ─────────────── Color palette ─────────────── */
  function buildColorPalette(selectedColor) {
    return h('div', { className: 'color-palette' },
      COLORS.map(function (c) {
        return h('div', {
          key: c.id,
          className: 'color-swatch' + (selectedColor === c.id ? ' color-swatch--selected' : ''),
          style: { background: c.hex },
          onClick: function () {
            window.soundManager && window.soundManager.playClickSound();
            setState({ selectedColor: c.id, feedback: null });
          },
        });
      })
    );
  }

  /* ─────────────── Split guide overlay ─────────────── */
  /* Returns a guide SVG node to pass as guideOverlay prop to ChocolateBar.
     The guide SVG uses the same 460×460 viewBox as the bar SVG, so lines align pixel-perfect.
     numGuides=2 → lines at 25%/75% (halves→quarters); numGuides=3 → 1/6,1/2,5/6 (thirds→sixths) */
  function makeSplitGuide(numGuides, tappedCount, onTap) {
    var W = 460, H = 460;
    var xPositions = numGuides === 2
      ? [W * 0.25, W * 0.75]
      : numGuides === 3
        ? [W / 6, W / 2, W * 5 / 6]
        : Array.from({ length: numGuides }, function(_, i) { return (W / (numGuides + 1)) * (i + 1); });
    var lines = [];
    xPositions.forEach(function(x, idx) {
      var tapped = (idx + 1) <= tappedCount;
      (function (xi, ti, i) {
        lines.push(h('line', {
          key: 'g' + i,
          x1: xi, y1: 2, x2: xi, y2: H - 2,
          stroke: ti ? '#ffffff' : 'rgba(255,255,255,0.85)',
          strokeWidth: ti ? 4 : 3,
          strokeDasharray: ti ? 'none' : '12 7',
          className: ti ? 'split-guide-tapped' : 'split-guide-dotted',
          style: { cursor: ti ? 'default' : 'pointer' },
          onClick: ti ? null : function (e) { if (e && e.stopPropagation) e.stopPropagation(); onTap(i); },
        }));
        /* Wide invisible hit-area rect so tap/click is easy */
        if (!ti) {
          lines.push(h('rect', {
            key: 'hit' + i,
            x: xi - 24, y: 0, width: 48, height: H,
            fill: 'transparent',
            style: { cursor: 'pointer' },
            onClick: function (e) { if (e && e.stopPropagation) e.stopPropagation(); onTap(i); },
          }));
        }
      })(x, tapped, idx + 1);
    });
    return h('svg', {
      className: 'split-guide-svg',
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'none',
    }, lines);
  }

  /* withSplitGuides: accepts barProps (plain object) + guide params, returns ChocolateBar with guide */
  function withSplitGuides(barProps, numGuides, tappedCount, onTap) {
    var guide = makeSplitGuide(numGuides, tappedCount, onTap);
    return ChocolateBar(Object.assign({}, barProps, { guideOverlay: guide }));
  }

  /* ─────────────── Two-bar layout helper ─────────────── */
  /* Returns a .bars-stack div — use inside .activity-stage */
  function twoBars(leftProps, rightProps) {
    return h('div', { className: 'bars-stack' },
      ChocolateBar(leftProps),
      ChocolateBar(rightProps)
    );
  }

  /* ─────────────── Standard activity wrapper ─────────────── */
  /* Mirrors reference buildActivityShell exactly:
     - charLines/character → CharacterPanel (left 30%)
     - stageNode           → single node placed in .activity-area (right 70%, top flex-1)
     - footerOpts          → { canNext, canPrev, centerText, glowNext } → FooterNav (right 70%, bottom 120px)
  */
  function activity(charLines, character, stageNode, footerOpts) {
    var freezeTypewriter = appState.step === 15 && appState.s15OverlapPhase === 'animating';
    if (freezeTypewriter) clearTypewriterTimer();
    if (!freezeTypewriter && charLines && charLines.length) { ensureTypewriter(charLines); }
    var key = (charLines || []).join('|');
    var typewriterChars =
      !freezeTypewriter && appState.typewriterStep === appState.step && appState.typewriterKey === key && appState.typewriterDoneKey !== key
        ? appState.typewriterChars
        : !freezeTypewriter && pendingTypewriterKey === key ? 0 : null;
    if (charLines && charLines.length && typewriterChars == null) {
      lastShownDialogueKey = key;
    }
    var fo = footerOpts || {};
    return h('div', { className: 'activity-screen' },
      h('div', { className: 'activity-body' },
        CharacterPanel({ lines: charLines, character: character || 'boojho', typewriterChars: typewriterChars }),
        h('div', { className: 'right-activity-section' },
          h('div', { className: 'activity-area' }, stageNode),
          FooterNav({
            centerText: fo.centerText || '',
            onNext: goNext,
            onPrev: goPrev,
            canNext: !!fo.canNext,
            canPrev: fo.canPrev !== false && appState.step > 2,
            glowNext: fo.glowNext !== false && !!fo.canNext,
          })
        )
      )
    );
  }

  /* Shorthand: stage with bars + optional controls at bottom */
  function stage(barsNode, controlsNode, extraClass) {
    return h('div', { className: 'activity-stage' + (extraClass ? ' ' + extraClass : '') },
      barsNode,
      controlsNode ? h('div', { className: 'activity-controls' }, controlsNode) : null
    );
  }

  /* ─────────────── Screen builders ─────────────── */

  function buildS1() {
    return h('div', { className: 's1-screen' },
      h('div', { className: 's1-topbar' },
        h('span', { className: 's1-topbar-title' }, td('s1_title'))
      ),
      h('div', { className: 's1-body' },
        h('div', { className: 's1-left' },
          h('img', { src: 'assets/images/boojho.png', alt: 'Boojho', className: 's1-character', draggable: false })
        ),
        h('div', { className: 's1-right' },
          h('div', { className: 's1-card' },
            h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s1_line1')) } }),
            h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s1_line2')) } }),
            h('p', { className: 's1-card-line s1-card-line--explore', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s1_line3')) } })
          )
        )
      ),
      h('div', { className: 's1-footer' },
        h('div', { className: 'start-button-container' },
          AppletButton({
            label: tb('start'),
            variant: 'active',
            impending: 'clickNext',
            onClick: function () { setState({ phase: 'flow', step: 2 }); },
          })
        )
      )
    );
  }

  /* ── helpers ── */
  function numOptRow(opts, correctVal, s, onPick) {
    return h('div', { className: 'option-row' },
      opts.map(function (n) {
        var isCorrect = s.pickedParts === n && n === correctVal;
        var isWrong   = s.wrongValue === n;
        return h('button', {
          key: n,
          className: 'option-button' + (isCorrect ? ' is-correct' : isWrong ? ' is-wrong' : ' is-pulsate'),
          disabled: s.pickedParts === correctVal,
          onClick: function () { onPick(n); },
        }, h('span', {}, String(n)));
      })
    );
  }

  function fracOptRow(opts, correctVal, s, field, onPick) {
    return h('div', { className: 'option-row' },
      opts.map(function (f) {
        var isCorrect = s[field] === f && f === correctVal;
        var isWrong   = s.wrongValue === f;
        var parts = f.split('/');
        var num = parts[0], den = parts[1];
        return h('button', {
          key: f,
          className: 'option-button option-button--frac' + (isCorrect ? ' is-correct' : isWrong ? ' is-wrong' : ' is-pulsate'),
          disabled: s[field] === correctVal,
          onClick: function () { onPick(f); },
        },
          h('span', { className: 'frac-num' }, num),
          h('span', { className: 'frac-den' }, den)
        );
      })
    );
  }

  function yesNoRow(s, onPick, answerKey) {
    var key = answerKey || 'equivAns';
    var chosen = s[key];
    return h('div', { className: 'option-row' },
      ['Yes', 'No'].map(function (opt) {
        var isCorrect = chosen === 'Yes' && opt === 'Yes';
        var isWrong   = s.wrongValue === opt;
        return h('button', {
          key: opt,
          className: 'option-button option-button--yes-no' + (isCorrect ? ' is-correct' : isWrong ? ' is-wrong' : ''),
          disabled: chosen === 'Yes',
          onClick: onPick ? function () { onPick(opt); } : null,
        }, h('span', {}, opt));
      })
    );
  }

  function symRow(s, onPick) {
    return h('div', { className: 'symbol-strip' },
      ['>', '=', '<'].map(function (sym) {
        var isCorrect = s.symbolAns === sym && sym === '=';
        var isWrong   = s.wrongValue === sym;
        return h('button', {
          key: sym,
          className: 'symbol-button' + (isCorrect ? ' is-correct' : isWrong ? ' is-wrong' : ''),
          disabled: s.symbolAns === '=',
          onClick: function () { onPick(sym); },
        }, h('span', {}, sym));
      })
    );
  }

  function pickNum(n, correctVal) {
    window.sound && window.sound.playClickSound();
    if (n === correctVal) {
      window.sound && window.sound.playCorrectSound();
      setState({ pickedParts: n, feedback: 'correct', wrongValue: null });
      /* S3: colour swatches appear immediately in-place; no auto-advance needed */
    } else {
      window.sound && window.sound.playWrongSound();
      setState({ wrongValue: n, feedback: 'wrong' });
      /* wrong dialogue stays visible until the correct answer is picked */
    }
  }

  function pickFrac(f, correctVal, field) {
    window.sound && window.sound.playClickSound();
    var patch = { wrongValue: null };
    if (f === correctVal) {
      clearAutoTimer();
      window.sound && window.sound.playCorrectSound();
      patch[field] = f; patch.feedback = 'correct';
      /* S24 correct: count-pulse shaded → all → done (own phase field) */
      if (appState.step === 24) {
        patch.s24PulsePhase = 'shaded';
        setState(patch);
        scheduleAuto(1400, function () {
          setState({ s24PulsePhase: 'all' });
          scheduleAuto(1400, function () {
            setState({ s24PulsePhase: 'done' });
          });
        });
        return;
      }
      /* S25/S26 correct: count-pulse shaded → all → done */
      if (appState.step === 25 || appState.step === 26) {
        patch.s25PulsePhase = 'shaded';
        setState(patch);
        scheduleAuto(1400, function () {
          setState({ s25PulsePhase: 'all' });
          scheduleAuto(1400, function () {
            setState({ s25PulsePhase: 'done' });
          });
        });
        return;
      }
      /* S11/S12 correct: immediately show explanation + shaded glow; Next unlocks */
      if (appState.step === 11 || appState.step === 12) {
        patch.s11PulsePhase = 'done';
        setState(patch);
        return;
      }
      setState(patch);
    } else {
      window.sound && window.sound.playWrongSound();
      patch.wrongValue = f; patch.feedback = 'wrong'; patch[field] = null;
      /* S11 wrong: run count-pulse then advance to S12 (retry) */
      if (appState.step === 11 || appState.step === 12) {
        patch.s11PulsePhase = 'shaded';
        setState(patch);
        scheduleAuto(1400, function () {
          setState({ s11PulsePhase: 'all' });
          scheduleAuto(1400, function () {
            var nextStep = (appState.step === 11) ? 12 : null;
            if (nextStep) setState({ step: nextStep, wrongValue: null, feedback: null, s11PulsePhase: null });
            else setState({ wrongValue: null, s11PulsePhase: null });
          });
        });
        return;
      }
      /* S24 wrong: count-pulse; keep wrong button red until user picks correct */
      if (appState.step === 24) {
        patch.s24PulsePhase = 'shaded';
        setState(patch);
        scheduleAuto(1400, function () {
          setState({ s24PulsePhase: 'all' });
          scheduleAuto(1400, function () {
            setState({ s24PulsePhase: null, ex2FractionAns: null });
          });
        });
        return;
      }
      /* S25/S26 wrong: count-pulse; keep wrong button red until user picks correct */
      if (appState.step === 25 || appState.step === 26) {
        patch.s25PulsePhase = 'shaded';
        setState(patch);
        scheduleAuto(1400, function () {
          setState({ s25PulsePhase: 'all' });
          scheduleAuto(1400, function () {
            var nextStep = (appState.step === 25) ? 26 : null;
            if (nextStep) setState({ step: nextStep, s25PulsePhase: null });
            else setState({ s25PulsePhase: null });
          });
        });
        return;
      }
      setState(patch);
      scheduleAuto(900, function () { setState({ wrongValue: null }); });
    }
  }

  function stdBarsProps(s) {
    var side = s.wholeSplit || 'left';
    var splitParts = s.pickedSplitParts || 4;
    var shadedCount = splitParts / 2;
    var fill = s.selectedColor ? shadeHex(s.selectedColor) : null;
    /* The split bar's shaded region must align with which half the user originally shaded.
       shadedLeftIdx / shadedRightIdx is 0 or 1; multiply by shadedCount to get the correct
       segment range after splitting (e.g. idx=1, split=4 → segments [2,3]). */
    var splitShadedIdx = side === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
    var splitStart = splitShadedIdx * shadedCount;
    var splitShaded = Array.from({ length: shadedCount }, function(_, i) { return splitStart + i; });
    var leftShaded  = side === 'left'  ? splitShaded : [s.shadedLeftIdx];
    var rightShaded = side === 'right' ? splitShaded : [s.shadedRightIdx];
    return {
      left:  { id: 'left',  size: 'large', parts: side === 'left'  ? splitParts : 2, shadedIndices: leftShaded,  fractionLabel: side === 'left'  ? {num:shadedCount,den:splitParts} : {num:1,den:2}, shadeFill: fill },
      right: { id: 'right', size: 'large', parts: side === 'right' ? splitParts : 2, shadedIndices: rightShaded, fractionLabel: side === 'right' ? {num:shadedCount,den:splitParts} : {num:1,den:2}, shadeFill: fill },
    };
  }

  function firstSplitShadedIndex(s) {
    var splitParts = s.pickedSplitParts || 4;
    var shadedCount = splitParts / 2;
    var side = s.wholeSplit || 'left';
    var splitShadedIdx = side === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
    return splitShadedIdx * shadedCount;
  }

  function fo(canNext, centerText) { return { canNext: canNext, canPrev: true, centerText: centerText || '', glowNext: !!canNext }; }

  /* ── S2: two whole bars — Next navigates to S3 which shows them already split ── */
  function buildS2() {
    return activity([td('s2_line1')], 'paheli',
      stage(twoBars(
        { id: 'left',  size: 'large', parts: 0, outlinePulse: true },
        { id: 'right', size: 'large', parts: 0, outlinePulse: true, outlinePulseDelay: '0.3s' }
      )),
      fo(true, td('s2_line2'))
    );
  }

  /* ── S3: whole bars shown; bars split to 2 only after learner taps the correct answer ── */
  function buildS3() {
    var s = appState;
    var answered = s.pickedParts === 2;
    if (!answered) {
      /* Pre-correct: number options only */
      var wrongLines = s.feedback === 'wrong' ? [td('s3_wrong')] : [td('s3_line1')];
      return activity(wrongLines, 'paheli',
        stage(
          twoBars({ id: 'left', size: 'large', parts: 0 }, { id: 'right', size: 'large', parts: 0 }),
          numOptRow([2,3,5], 2, s, function(n){ pickNum(n,2); })
        ),
        fo(false, td('s3_line2'))
      );
    }

    /* Post-correct: full S5 shading experience in-place */
    var hasColor = !!s.selectedColor;
    var bothShaded = s.shadedLeft && s.shadedRight;
    var fill = hasColor ? shadeHex(s.selectedColor) : null;
    var dialogueLines = bothShaded ? [td('s6_line1')] : [td('s5_line1'), td('s5_line2')];
    var hint = bothShaded ? tl('tap_next') : td('s5_hint');

    var colorRow = h('div', { className: 'option-row' },
      COLORS.map(function (c) {
        var chosen = s.selectedColor === c.id;
        var swatchClass = 'color-option-btn'
          + (chosen ? ' color-option-btn--chosen' : '')
          + (hasColor ? ' color-option-btn--disabled' : '')
          + (!hasColor ? ' color-option-btn--pulse' : '');
        return h('button', {
          key: c.id,
          className: swatchClass,
          style: { background: c.hex },
          disabled: hasColor,
          onClick: function () {
            if (hasColor) return;
            window.sound && window.sound.playClickSound();
            setState({ selectedColor: c.id, shadedLeft: false, shadedRight: false, shadedLeftIdx: 0, shadedRightIdx: 0 });
          },
        });
      })
    );

    function tapLeft3(segIdx) {
      if (!hasColor) return;
      if (s.shadedLeft) return;
      window.sound && window.sound.playCorrectSound();
      setState({ shadedLeft: true, shadedLeftIdx: segIdx });
    }
    function tapRight3(segIdx) {
      if (!hasColor) return;
      if (s.shadedRight) return;
      window.sound && window.sound.playCorrectSound();
      setState({ shadedRight: true, shadedRightIdx: segIdx });
    }

    var barsNode = bothShaded
      ? h('div', { className: 'bars-stack bars-stack--with-symbol' },
          ChocolateBar({ id: 'left',  size: 'large', parts: 2, shadedIndex: s.shadedLeftIdx,  shadeFill: fill, fractionLabel: {num:1,den:2}, pulseFraction: true }),
          h('div', { className: 'symbol-strip-slot' }, h('div', { className: 'plain-symbol interactive-text' }, '=')),
          ChocolateBar({ id: 'right', size: 'large', parts: 2, shadedIndex: s.shadedRightIdx, shadeFill: fill, fractionLabel: {num:1,den:2}, pulseFraction: true })
        )
      : h('div', { className: 'bars-stack' },
          ChocolateBar({ id: 'left',  size: 'large', parts: 2, shadedIndex: s.shadedLeft  ? s.shadedLeftIdx  : null, shadeFill: fill, pulsateHalves: hasColor && !s.shadedLeft,  onTapSegment: tapLeft3  }),
          ChocolateBar({ id: 'right', size: 'large', parts: 2, shadedIndex: s.shadedRight ? s.shadedRightIdx : null, shadeFill: fill, pulsateHalves: hasColor && !s.shadedRight, onTapSegment: tapRight3 })
        );

    return activity(dialogueLines, 'paheli',
      stage(barsNode, colorRow),
      fo(bothShaded, hint)
    );
  }

  /* ── S4: denominator confirm ── */
  function buildS4() {
    var s = appState;
    var correct = s.pickedParts === 2;
    var lines = s.feedback === 'wrong' ? [td('s4_wrong')] : [td('s4_line1'), td('s4_line2')];
    return activity(lines, 'paheli',
      stage(
        twoBars(
          { id: 'left',  size: 'large', parts: 2, fractionLabel: {num:1,den:2} },
          { id: 'right', size: 'large', parts: 2, fractionLabel: {num:1,den:2} }
        ),
        !correct ? numOptRow([2,3,5], 2, s, function(n){ pickNum(n,2); }) : null
      ),
      fo(canGoNext(s), td('s4_line3'))
    );
  }

  /* ── S5: tap colour → tap one segment per bar → both shaded → show = and 1/2 ── */
  function buildS5() {
    var s = appState;
    var hasColor = !!s.selectedColor;
    var bothShaded = s.shadedLeft && s.shadedRight;
    var fill = hasColor ? shadeHex(s.selectedColor) : null;

    /* Footer hint: always show the static instruction; Next enables once both bars are shaded */
    var hint = !hasColor ? td('s5_hint')
      : !s.shadedLeft || !s.shadedRight ? td('s5_hint')
      : tl('tap_next');

    var colorRow = h('div', { className: 'option-row' },
      COLORS.map(function (c) {
        var chosen = s.selectedColor === c.id;
        return h('button', {
          key: c.id,
          className: 'color-option-btn' + (chosen ? ' color-option-btn--chosen' : '') + (hasColor ? ' color-option-btn--disabled' : ''),
          style: { background: c.hex },
          disabled: hasColor,
          onClick: function () {
            if (hasColor) return;
            window.sound && window.sound.playClickSound();
            /* Selecting a different colour resets shading */
            setState({ selectedColor: c.id, shadedLeft: false, shadedRight: false, shadedLeftIdx: 0, shadedRightIdx: 0, feedback: null });
          },
        });
      })
    );

    function tapLeft(segIdx) {
      if (!hasColor) { setState({ feedback: 'wrong', wrongValue: 'no_color' }); scheduleAuto(900, function(){ setState({ wrongValue: null, feedback: null }); }); return; }
      if (s.shadedLeft) return;
      window.sound && window.sound.playCorrectSound();
      setState({ shadedLeft: true, shadedLeftIdx: segIdx });
    }
    function tapRight(segIdx) {
      if (!hasColor) { setState({ feedback: 'wrong', wrongValue: 'no_color' }); scheduleAuto(900, function(){ setState({ wrongValue: null, feedback: null }); }); return; }
      if (s.shadedRight) return;
      window.sound && window.sound.playCorrectSound();
      setState({ shadedRight: true, shadedRightIdx: segIdx });
    }

    /* After both shaded: show = between bars and 1/2 fraction chips */
    var barsNode = bothShaded
      ? h('div', { className: 'bars-stack bars-stack--with-symbol' },
          ChocolateBar({ id: 'left',  size: 'large', parts: 2, shadedIndex: s.shadedLeftIdx,  shadeFill: fill, fractionLabel: {num:1,den:2}, pulseFraction: true }),
          h('div', { className: 'symbol-strip-slot' }, h('div', { className: 'plain-symbol interactive-text' }, '=')),
          ChocolateBar({ id: 'right', size: 'large', parts: 2, shadedIndex: s.shadedRightIdx, shadeFill: fill, fractionLabel: {num:1,den:2}, pulseFraction: true })
        )
      : h('div', { className: 'bars-stack' },
          ChocolateBar({ id: 'left',  size: 'large', parts: 2, shadedIndex: s.shadedLeft  ? s.shadedLeftIdx  : null, shadeFill: fill, pulsateHalves: !s.shadedLeft,  onTapSegment: tapLeft  }),
          ChocolateBar({ id: 'right', size: 'large', parts: 2, shadedIndex: s.shadedRight ? s.shadedRightIdx : null, shadeFill: fill, pulsateHalves: !s.shadedRight, onTapSegment: tapRight })
        );

    var dialogueLines = bothShaded ? [td('s6_line1')] : [td('s5_line1'), td('s5_line2')];
    return activity(dialogueLines, 'paheli',
      stage(barsNode, colorRow),
      fo(canGoNext(s), hint)
    );
  }

  /* ── S6: "So, both wholes show the fraction 1/2" — Paheli, pulse shaded parts + = then 1/2 chips + = ── */
  function buildS6() {
    var s = appState;
    var fill = s.selectedColor ? shadeHex(s.selectedColor) : null;
    return activity([td('s6_line1')], 'paheli',
      stage(
        h('div', { className: 'bars-stack bars-stack--with-symbol' },
          ChocolateBar({ id: 'left',  size: 'large', parts: 2, shadedIndex: s.shadedLeftIdx,  shadeFill: fill, pulseSegment: s.shadedLeftIdx, fractionLabel: {num:1,den:2}, pulseFraction: true }),
          h('div', { className: 'symbol-strip-slot' }, h('div', { className: 'plain-symbol interactive-text plain-symbol--pulse' }, '=')),
          ChocolateBar({ id: 'right', size: 'large', parts: 2, shadedIndex: s.shadedRightIdx, shadeFill: fill, pulseSegment: s.shadedRightIdx, pulseSegmentDelay: '0.3s', fractionLabel: {num:1,den:2}, pulseFraction: true })
        )
      ),
      fo(true, td('s6_line3'))
    );
  }
  /* ── S7: wholes same size, divided into equal parts, same amount shaded in both — Boojho, tap Next ── */
  function buildS7() {
    var s = appState;
    var fill = s.selectedColor ? shadeHex(s.selectedColor) : null;
    var barsNode = h('div', { className: 'bars-stack bars-stack--with-symbol' },
      ChocolateBar({ id: 'left',  size: 'large', parts: 2, shadedIndex: s.shadedLeftIdx,  shadeFill: fill, fractionLabel: {num:1,den:2} }),
      h('div', { className: 'symbol-strip-slot' }, h('div', { className: 'plain-symbol interactive-text' }, '=')),
      ChocolateBar({ id: 'right', size: 'large', parts: 2, shadedIndex: s.shadedRightIdx, shadeFill: fill, fractionLabel: {num:1,den:2} })
    );
    return activity([td('s7_line1'), td('s7_line2')], 'boojho',
      stage(barsNode),
      fo(true, tl('tap_next'))
    );
  }
  /* ── S8: two-phase. intro = "What happens if we divide one whole?" (Boojho, Tap Next);
     choose = "Let's divide one whole into smaller equal parts" (Paheli, pulse both, tap either, dehighlight unselected) ── */
  function buildS8() {
    var s = appState;
    var fill = s.selectedColor ? shadeHex(s.selectedColor) : null;
    var isChoose = s.s8Phase === 'choose';
    var chosen = s.wholeSplit;

    if (!isChoose) {
      /* Phase A — informational, both bars static, character Boojho */
      var introBars = h('div', { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({ id: 'left',  size: 'large', parts: 2, shadedIndex: s.shadedLeftIdx,  shadeFill: fill, fractionLabel: {num:1,den:2} }),
        h('div', { className: 'symbol-strip-slot' }, h('div', { className: 'plain-symbol interactive-text' }, '=')),
        ChocolateBar({ id: 'right', size: 'large', parts: 2, shadedIndex: s.shadedRightIdx, shadeFill: fill, fractionLabel: {num:1,den:2} })
      );
      return activity([td('s8_line1')], 'boojho',
        stage(introBars),
        fo(true, td('s8_line2'))
      );
    }

    /* Phase B — choose a whole; auto-advance to S9 immediately on tap */
    function chooseWhole(side) {
      if (!chosen) {
        window.sound && window.sound.playClickSound();
        setState({ wholeSplit: side, step: 9, feedback: null, wrongValue: null, typewriterDoneKey: '', s11PulsePhase: null, s17PulsePhase: null, s19PulsePhase: null, s15OverlapPhase: 'idle', s15OverlapChoice: null, s15SlideDelta: null, s24PulsePhase: null, s25PulsePhase: null, s27PulsePhase: null, s28PulsePhase: null });
      }
    }
    var hint = td('s8b_line2');
    return activity([td('s8b_line1')], 'paheli',
      stage(
        h('div', { className: 'bars-stack bars-stack--with-symbol' },
          h('div', {
            className: 'bar-slot' + (!chosen ? ' bar-slot--interactive' : '') + (chosen === 'left' ? ' bar-slot--chosen' : ''),
            onClick: function () { chooseWhole('left'); },
          },
            ChocolateBar({
              id: 'left', size: 'large', parts: 2,
              shadedIndex: s.shadedLeftIdx, shadeFill: fill,
              fractionLabel: {num:1,den:2},
              outlinePulse: !chosen || chosen === 'left',
              greyed: chosen === 'right',
              selected: chosen === 'left',
            })
          ),
          h('div', { className: 'symbol-strip-slot' },
            h('div', { className: 'plain-symbol interactive-text' }, '=')
          ),
          h('div', {
            className: 'bar-slot' + (!chosen ? ' bar-slot--interactive' : '') + (chosen === 'right' ? ' bar-slot--chosen' : ''),
            onClick: function () { chooseWhole('right'); },
          },
            ChocolateBar({
              id: 'right', size: 'large', parts: 2,
              shadedIndex: s.shadedRightIdx, shadeFill: fill,
              fractionLabel: {num:1,den:2},
              outlinePulse: !chosen || chosen === 'right',
              outlinePulseDelay: '0.3s',
              greyed: chosen === 'left',
              selected: chosen === 'right',
            })
          )
        )
      ),
      fo(canGoNext(s), hint)
    );
  }

  /* ── S9: pick 4 or 6 to split the chosen whole ── */
  function buildS9() {
    var s = appState;
    var side = s.wholeSplit || 'left';
    var fill = s.selectedColor ? shadeHex(s.selectedColor) : null;
    var picked = s.pickedSplitParts;
    var hint = !picked ? td('s9_tap_guides') : 'Tap Next to write the fraction.';

    /* unchosen bar: greyed out (storyboard de-highlight), 2-part, original shaded segment */
    var otherSide = side === 'left' ? 'right' : 'left';
    var unchosenShadedIdx = side === 'left' ? s.shadedRightIdx : s.shadedLeftIdx;
    var unchosenBar = ChocolateBar({
      id: otherSide, size: 'large', parts: 2,
      shadedIndex: unchosenShadedIdx,
      shadeFill: fill, greyed: true,
      fractionLabel: {num:1,den:2},
    });

    /* chosen bar: splits to pickedSplitParts once picked, 2 parts until then */
    var chosenShadedIdx = side === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
    var pickedShadedCount = picked ? picked / 2 : 1;
    var pickedStart = picked ? chosenShadedIdx * pickedShadedCount : chosenShadedIdx;
    var pickedShadedIndices = picked ? Array.from({ length: pickedShadedCount }, function(_, i) { return pickedStart + i; }) : [chosenShadedIdx];
    var chosenBar = ChocolateBar({
      id: side, size: 'large',
      parts: picked ? picked : 2,
      shadedIndices: pickedShadedIndices,
      shadeFill: fill,
      fractionLabel: picked ? {num:pickedShadedCount,den:picked} : {num:1,den:2},
      outlinePulse: !picked,
    });

    var leftBar  = side === 'left'  ? chosenBar : unchosenBar;
    var rightBar = side === 'right' ? chosenBar : unchosenBar;

    /* options: 4 or 6 */
    var splitOptsRow = h('div', { className: 'option-row' },
      [4, 6].map(function (n) {
        var isCorrect = picked === n;
        var isWrong   = s.wrongValue === n;
        return h('button', {
          key: n,
          className: 'option-button' + (isCorrect ? ' is-correct' : isWrong ? ' is-wrong' : !picked ? ' is-pulsate' : ''),
          disabled: !!picked,
          onClick: function () {
            window.sound && window.sound.playClickSound();
            window.sound && window.sound.playCorrectSound();
            setState({ pickedSplitParts: n, splitComplete: true, feedback: 'correct', wrongValue: null });
          },
        }, h('span', {}, String(n)));
      })
    );

    var partsPerHalf9 = picked ? picked / 2 : null;
    var s9dialogueLines = picked
      ? [
          'Now, the <span class="w-orange">whole</span> has <span class="w-green">' + picked + ' equal parts</span>.',
          'Each half is split into <strong>' + partsPerHalf9 + ' smaller equal parts</strong>.',
        ]
      : [td('s9_line1')];
    return activity(s9dialogueLines, 'paheli',
      stage(
        h('div', { className: 'bars-stack' }, leftBar, rightBar),
        splitOptsRow
      ),
      fo(canGoNext(s), hint)
    );
  }

  /* ── S10: 4-part vs 2-part reveal ── */
  function buildS10() {
    var s = appState; var b = stdBarsProps(s);
    var splitN = s.pickedSplitParts || 4;
    var partsPerHalf = splitN / 2;
    var s10l1 = 'The <span class="w-orange">whole</span> has <span class="w-green">' + splitN + ' equal parts</span>.';
    var s10l2 = 'Each half is split into <strong>' + partsPerHalf + ' smaller parts</strong>.';
    return activity([s10l1, s10l2], 'paheli',
      stage(twoBars(b.left, b.right)), fo(true, td('s10_line3'))
    );
  }

  /* ── S11/S12: what fraction? ── */
  function buildS11or12(isRetry) {
    var s = appState; var b = stdBarsProps(s);
    var splitN = s.pickedSplitParts || 4;
    var shadedN = splitN / 2;
    var correctFrac = shadedN + '/' + splitN;
    var opts = ['1/' + splitN, shadedN + '/' + splitN, splitN + '/' + shadedN];
    /* Correct answer shows the explanation here; Next skips the duplicate S13. */
    var pp = s.s11PulsePhase;
    var hasCorrectAnswer = s.fractionAns === correctFrac;
    var answered = hasCorrectAnswer || pp === 'done';
    var showCountAgain = !answered && (s.feedback === 'wrong' || isRetry);
    var explainLines = [
      'The <strong>denominator ' + splitN + '</strong> tells us the whole has <span class="w-green">' + splitN + ' equal parts</span>.',
      'The <strong>numerator ' + shadedN + '</strong> tells us <span class="w-pink">' + shadedN + ' parts</span> are shaded.',
      'So, the <span class="w-blue">fraction</span> is <span class="w-blue">' + shadedN + '/' + splitN + '</span>.',
    ];
    var lines = answered ? explainLines
              : showCountAgain ? [td('s12_line1'), td('s12_line2'), td('s12_line3')]
              : [td('s11_line1'), td('s11_line2')];
    /* count-pulse: 'shaded' → pulse shaded segs; 'all' → all segs; 'done' → keep shaded glow */
    var splitSide = s.wholeSplit || 'left';
    var splitShaded = pp === 'shaded' ? { staggerPulse: true, outlinePulse: true, pulseShaded: true }
                    : pp === 'all'    ? { pulsateHalves: true }
                    : pp === 'done'   ? { pulseShaded: true } : {};
    var halfShaded  = pp === 'all' ? { pulsateHalves: true } : { greyed: true };
    var leftExtra   = splitSide === 'left'  ? splitShaded : halfShaded;
    var rightExtra  = splitSide === 'right' ? splitShaded : halfShaded;
    var footerText = answered ? tl('tap_next') : td('s11_line3');
    return activity(lines, 'paheli',
      stage(
        twoBars(
          Object.assign({}, b.left,  leftExtra),
          Object.assign({}, b.right, rightExtra)
        ),
        fracOptRow(opts, correctFrac, s, 'fractionAns', function(f){ pickFrac(f, correctFrac, 'fractionAns'); })
      ),
      fo(canGoNext(s), footerText)
    );
  }

  /* ── S13: denominator/numerator explain — count-pulse shaded → all on enter ── */
  function buildS13() {
    var s = appState; var b = stdBarsProps(s);
    var splitN = s.pickedSplitParts || 4;
    var shadedN = splitN / 2;
    var s13l1 = 'The <strong>denominator ' + splitN + '</strong> tells us the whole has <span class="w-green">' + splitN + ' equal parts</span>.';
    var s13l2 = 'The <strong>numerator ' + shadedN + '</strong> tells us <span class="w-pink">' + shadedN + ' parts</span> are shaded.';
    var s13l3 = 'So, the <span class="w-blue">fraction</span> is <span class="w-blue">' + shadedN + '/' + splitN + '</span>.';
    var pp = s.s11PulsePhase;
    var splitSide = s.wholeSplit || 'left';
    var halfSide13 = splitSide === 'left' ? 'right' : 'left';
    var halfPulseSeg13 = halfSide13 === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
    var splitShaded = pp === 'shaded' ? { staggerPulse: true, outlinePulse: true, pulseShaded: true }
                    : pp === 'all'    ? { pulsateHalves: true }
                    : { pulseFraction: true };
    var halfShaded  = pp === 'shaded' ? { pulseSegment: halfPulseSeg13 }
                    : pp === 'all'    ? { pulsateHalves: true }
                    : { pulseFraction: true };
    var leftExtra   = splitSide === 'left'  ? splitShaded : halfShaded;
    var rightExtra  = splitSide === 'right' ? splitShaded : halfShaded;
    return activity([s13l1, s13l2, s13l3], 'paheli',
      stage(twoBars(
        Object.assign({}, b.left,  leftExtra),
        Object.assign({}, b.right, rightExtra)
      )),
      fo(true, td('s13_line4'))
    );
  }

  /* ── S14: fractions look different ── */
  function buildS14() {
    var s = appState; var b = stdBarsProps(s);
    var splitN = s.pickedSplitParts || 4;
    var shadedN = splitN / 2;
    var s14l2 = '<span class="w-blue">' + shadedN + '/' + splitN + '</span> has <span class="w-pink">' + shadedN + ' shaded parts</span>, but <span class="w-blue">1/2</span> has only <span class="w-pink">1 shaded part</span>.';
    var s14l3 = 'Is <span class="w-blue">' + shadedN + '/' + splitN + '</span> greater than <span class="w-blue">1/2</span>?';
    return activity([td('s14_line1'), s14l2, s14l3], 'boojho',
      stage(twoBars(
        Object.assign({}, b.left,  { pulseShaded: true }),
        Object.assign({}, b.right, { pulseShaded: true })
      )), fo(true, td('s14_line4'))
    );
  }

  /* ── S15: symbol comparison — any pick triggers overlap slide; correct unlocks Next after return ── */
  function buildS15() {
    var s = appState; var b = stdBarsProps(s);
    var isDone = s.s15OverlapPhase === 'done';
    var isCorrect15 = s.symbolAns === '=';
    var isAnimating = s.s15OverlapPhase === 'animating';
    var lines = isCorrect15
      ? [td('s15_done_line1')]
      : s.feedback === 'wrong'
        ? [td('s15_wrong')]
        : [td('s15_line1'), td('s15_line2')];
    var sp = s.pickedSplitParts || 4;
    var spShaded = sp / 2;
    var side = s.wholeSplit || 'left';
    var splitSide = side;
    var halfSide  = side === 'left' ? 'right' : 'left';
    var delta = s.s15SlideDelta;
    var slideActive = delta != null && (isAnimating || isDone);
    var splitStart15 = firstSplitShadedIndex(s);
    var splitShadedArr15 = Array.from({ length: spShaded }, function(_, i) { return splitStart15 + i; });
    var shouldPulseShaded = isCorrect15 || s.feedback !== 'wrong' && !isAnimating;
    var splitBarProps = Object.assign({}, b[splitSide], {
      segmentSlide: slideActive
        ? { indices: splitShadedArr15, dx: delta.dx, dy: delta.dy, duration: (OVERLAP_ANIMATION_MS / 1000) + 's' }
        : null,
      pulseShaded: shouldPulseShaded,
    });
    var halfBarProps = Object.assign({}, b[halfSide], {
      pulseShaded: shouldPulseShaded,
    });
    var leftProps  = splitSide === 'left'  ? splitBarProps : halfBarProps;
    var rightProps = splitSide === 'right' ? splitBarProps : halfBarProps;
    return activity(lines, 'paheli',
      h('div', { className: 'activity-stage' },
        h('div', { className: 'bars-stack' + (slideActive ? ' bars-stack--slide-overflow' : '') + ' bars-stack--with-symbol' },
          ChocolateBar(Object.assign({}, leftProps,  { id: splitSide === 'left'  ? 's15-split' : 's15-half' })),
          h('div', { className: 'symbol-strip-slot' },
            h('div', { className: 'symbol-strip' },
              isCorrect15 ? h('div', { className: 'symbol-eq-display' }, '=')
                          : symRow(s, function(sym){
                         if (isAnimating) return;
                         window.sound && window.sound.playClickSound();
                         if (sym==='=') {
                           window.sound && window.sound.playCorrectSound();
                           /* immediately show done state — dialogue updates right away */
                           setState({ symbolAns:'=', feedback:'correct', wrongValue:null, s15OverlapChoice:sym, s15OverlapPhase:'animating', s15SlideDelta:null });
                           scheduleAuto(OVERLAP_ANIMATION_MS + S15_OVERLAP_RETURN_BUFFER_MS, function(){
                             setState({ s15OverlapPhase:'done', s15OverlapChoice:null, s15SlideDelta:null });
                           });
                         } else {
                           window.sound && window.sound.playWrongSound();
                           setState({ wrongValue:sym, feedback:'wrong', s15OverlapChoice:sym, s15OverlapPhase:'animating', s15SlideDelta:null });
                           scheduleAuto(OVERLAP_ANIMATION_MS + S15_OVERLAP_RETURN_BUFFER_MS, function(){ setState({ wrongValue:null, feedback:null, s15OverlapPhase:'idle', s15OverlapChoice:null, s15SlideDelta:null }); });
                         }
                       })
            )
          ),
          ChocolateBar(Object.assign({}, rightProps, { id: splitSide === 'right' ? 's15-split' : 's15-half' }))
        )
      ),
      fo(canGoNext(s), isCorrect15 ? tl('tap_next') : td('s15_line3'))
    );
  }

  /* ── S16: whole-bar overlap animation — split bar slides on top of 1/2 bar ── */
  function buildS16() {
    var s = appState;
    var sp = s.pickedSplitParts || 4;
    var spShaded = sp / 2;
    var animating = s.overlapPhase === 'animating';
    var done = s.overlapPhase === 'done';
    var fill = s.selectedColor ? shadeHex(s.selectedColor) : null;
    var side = s.wholeSplit || 'left';
    var splitSide = side;
    var halfSide  = side === 'left' ? 'right' : 'left';

    var delta = s.s16SlideDelta;
    var slideActive = delta != null && animating;

    var splitShadedIdx = splitSide === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
    var splitStart16 = splitShadedIdx * spShaded;
    var splitShadedArr = Array.from({ length: spShaded }, function(_, i) { return splitStart16 + i; });
    var splitBarProps = {
      id: splitSide, size: 'large', parts: sp,
      shadedIndices: splitShadedArr,
      shadeFill: fill,
      fractionLabel: {num: spShaded, den: sp},
      pulseFraction: done,
      outlinePulse: !done,
      /* slide all shaded segments together to align with the half-bar's shaded segment */
      segmentSlide: slideActive
        ? { indices: splitShadedArr, dx: delta.dx, dy: delta.dy, duration: (OVERLAP_ANIMATION_MS / 1000) + 's' }
        : null,
    };

    var halfBarProps = {
      id: halfSide, size: 'large', parts: 2,
      shadedIndices: [halfSide === 'left' ? s.shadedLeftIdx : s.shadedRightIdx],
      shadeFill: fill,
      fractionLabel: {num: 1, den: 2},
      pulseFraction: done,
      outlinePulse: !done,
    };

    var leftProps  = splitSide === 'left'  ? splitBarProps : halfBarProps;
    var rightProps = splitSide === 'right' ? splitBarProps : halfBarProps;

    return activity([td('s16_line1'),td('s16_line2')], 'paheli',
      stage(
        h('div', { className: 'bars-stack' + (slideActive ? ' bars-stack--slide-overflow' : '') },
          ChocolateBar(leftProps),
          ChocolateBar(rightProps)
        ),
        done ? h('div',{className:'eq-badge eq-badge--result'},fmtLine('1/2 = ' + spShaded + '/' + sp)) : null
      ),
      fo(canGoNext(s), done ? td('tap_next') : null)
    );
  }

  /* shared helper for S17–S20: two bars with central = badge */
  function twoBarEq(leftProps, rightProps, eqBadge, controls) {
    return stage(
      h('div', { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar(leftProps),
        h('div', { className: 'symbol-strip-slot' },
          h('div', { className: 'plain-symbol interactive-text', style: {fontSize:'72px',fontWeight:'900',color:'#58D98B'} }, '=')
        ),
        ChocolateBar(rightProps)
      ),
      eqBadge || null
    );
  }

  function ex1BarPair(s, opts) {
    var sp = s.pickedSplitParts || 4;
    var spShaded = sp / 2;
    var fill = s.selectedColor ? shadeHex(s.selectedColor) : null;
    var side = s.wholeSplit || 'left';
    var halfSide = side === 'left' ? 'right' : 'left';
    var halfShadedIdx = halfSide === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
    /* Align split-bar shading with which half the user originally shaded */
    var splitShadedIdx = side === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
    var splitStart = splitShadedIdx * spShaded;
    var splitShaded = Array.from({ length: spShaded }, function(_, i) { return splitStart + i; });
    var o = opts || {};
    var halfProps  = { id: 'ex1-half',  size: 'large', parts: 2,  shadedIndices: [halfShadedIdx], shadeFill: fill, fractionLabel: {num:1,den:2}, pulseFraction: !!o.pulseFraction, pulsateHalves: !!o.pulseHalf,  pulseShaded: !!o.pulseShaded };
    var splitProps = { id: 'ex1-split', size: 'large', parts: sp, shadedIndices: splitShaded, shadeFill: fill, fractionLabel: {num:spShaded,den:sp}, pulseFraction: !!o.pulseFraction, pulsateHalves: !!o.pulseSplit, pulseShaded: !!o.pulseShaded };
    var leftProps  = side === 'left'  ? splitProps : halfProps;
    var rightProps = side === 'right' ? splitProps : halfProps;
    return { leftProps: leftProps, rightProps: rightProps, sp: sp, spShaded: spShaded };
  }

  /* ── S17: shaded amounts are equal — two-stage pulse: all parts → shaded only ── */
  function buildS17() {
    var s = appState; var pp = s.s17PulsePhase;
    /* Phase 'all': pulsate every segment on both bars; phase 'shaded': pulsate only shaded segs */
    var p = ex1BarPair(s, {
      pulseHalf:  pp === 'all',
      pulseSplit: pp === 'all',
      pulsateHalves: false,
    });
    if (pp === 'shaded') {
      var splitSide17 = s.wholeSplit || 'left';
      var halfSide17  = splitSide17 === 'left' ? 'right' : 'left';
      var halfIdx17   = halfSide17 === 'left' ? s.shadedLeftIdx : s.shadedRightIdx;
      if (splitSide17 === 'left') { p.leftProps  = Object.assign({}, p.leftProps,  { staggerPulse: true, outlinePulse: true, pulseShaded: true }); }
      else                        { p.rightProps = Object.assign({}, p.rightProps, { staggerPulse: true, outlinePulse: true, pulseShaded: true }); }
      if (halfSide17 === 'left')  { p.leftProps  = Object.assign({}, p.leftProps,  { pulseSegment: halfIdx17 }); }
      else                        { p.rightProps = Object.assign({}, p.rightProps, { pulseSegment: halfIdx17 }); }
    }
    var l1 = 'Even though the <span class="w-orange">wholes</span> are divided into <strong>different numbers of</strong> equal parts, the <span class="w-pink">shaded amount</span> <strong>did not change</strong>. Only the number of <span class="w-green">equal parts</span> changed.';
    return activity([l1], 'paheli',
      twoBarEq(p.leftProps, p.rightProps, null),
      fo(true, td('s18_line3'))
    );
  }

  /* ── S18: fractions are equal ── */
  function buildS18_eq() {
    var s = appState; var p = ex1BarPair(s, { pulseFraction: true, pulseShaded: true });
    var l1 = 'So the two different looking <span class="w-blue">fractions</span> 1/2 and ' + p.spShaded + '/' + p.sp + ' represent the <strong>same amount</strong> of <span class="w-orange">whole</span>, so the <span class="w-blue">fractions</span> are <strong>equal</strong>.';
    return activity([l1], 'paheli',
      twoBarEq(p.leftProps, p.rightProps, h('div',{className:'eq-badge'},fmtLine('1/2 = ' + p.spShaded + '/' + p.sp))),
      fo(true, tl('tap_next'))
    );
  }

  /* ── S19: named as equivalent fractions — pulse shaded → fraction chips ── */
  function buildS19_named() {
    var s = appState; var pp = s.s19PulsePhase;
    var pulseFrac = pp === 'fraction' || pp === null;
    var p = ex1BarPair(s, { pulseFraction: pulseFrac, pulseShaded: true });
    if (pp === 'shaded') {
      var splitSide19 = s.wholeSplit || 'left';
      if (splitSide19 === 'left') p.leftProps  = Object.assign({}, p.leftProps,  { staggerPulse: true, outlinePulse: true });
      else                        p.rightProps = Object.assign({}, p.rightProps, { staggerPulse: true, outlinePulse: true });
    }
    var l1 = 'The <span class="w-blue">fractions</span> 1/2 and ' + p.spShaded + '/' + p.sp + ' are called <span class="w-blue">equivalent fractions</span>.';
    return activity([l1], 'paheli',
      twoBarEq(p.leftProps, p.rightProps, h('div',{className:'eq-badge'},fmtLine('1/2 = ' + p.spShaded + '/' + p.sp))),
      fo(true, tl('tap_next'))
    );
  }

  /* ── S20: definition + bridge to Example 2 ── */
  function buildS20_def() {
    var s = appState; var p = ex1BarPair(s, { pulseFraction: true, pulseShaded: true });
    var l1 = '<span class="w-blue">Fractions</span> that look different but show the same amount are called <span class="w-blue">equivalent fractions</span>.';
    return activity([l1], 'paheli',
      twoBarEq(p.leftProps, p.rightProps, h('div',{className:'eq-badge'},fmtLine('1/2 = ' + p.spShaded + '/' + p.sp))),
      fo(true, td('s21_line2'))
    );
  }

  /* ── S21: three-bar grand summary — 1/2 = 2/4 = 3/6 ── */
  function buildS21() {
    var fill = appState.selectedColor ? shadeHex(appState.selectedColor) : '#E91E8C';
    return h('div', { className: 'activity-screen s18-screen' },
      h('div', { className: 's18-bars-zone' },
        ChocolateBar({ id: 'tri-half',    size: 'small', parts: 2, shadedIndices: [0],     shadeFill: fill, fractionLabel: {num:1,den:2}, pulseFraction: true }),
        h('div', { className: 's18-eq-symbol' }, '='),
        ChocolateBar({ id: 'tri-fourths', size: 'small', parts: 4, shadedIndices: [0,1],   shadeFill: fill, fractionLabel: {num:2,den:4}, pulseFraction: true }),
        h('div', { className: 's18-eq-symbol' }, '='),
        ChocolateBar({ id: 'tri-sixths',  size: 'small', parts: 6, shadedIndices: [0,1,2], shadeFill: fill, fractionLabel: {num:3,den:6}, pulseFraction: true })
      ),
      h('div', { className: 's18-bottom-zone' },
        h('div', { className: 's18-bottom-left' },
          h('img', { src: 'assets/images/boojho.png', alt: 'Boojho', className: 's18-character', draggable: false })
        ),
        h('div', { className: 's18-bottom-right' },
          h('div', { className: 's18-dialogue' },
            fmtLine('<strong>Fractions</strong> that look different but show the same<br>amount are called <strong>equivalent fractions</strong>.')
          ),
          h('div', { className: 's18-next-zone' },
            AppletButton({ label: tb('next'), variant: 'active', impending: 'clickNext', onClick: goNext })
          )
        )
      )
    );
  }

  /* ── S22: transition to Example 2 ── */
  function buildS22() {
    return h('div', { className: 's1-screen s22-screen' },
      h('div', { className: 's1-topbar' }, h('span', { className: 's1-topbar-title' }, td('s22_title'))),
      h('div', { className: 's1-body' },
        h('div', { className: 's1-left' },
          h('img', { src: 'assets/images/Boojho.png', alt: 'Boojho', className: 's1-character', draggable: false })
        ),
        h('div', { className: 's1-right' },
          h('div', { className: 's1-card' },
            h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s22_line1')) } }),
            h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s22_line2')) } })
          )
        )
      ),
      h('div', { className: 's1-footer' },
        h('div', { className: 'start-button-container' },
          AppletButton({ label: tb('next'), variant: 'active', impending: 'clickNext', onClick: goNext })
        )
      )
    );
  }

  /* ── S23: show 1/3 bar ── */
  var EX2_CYAN = '#4DBBF0';

  function ex2Bar3() {
    return ChocolateBar({id:'ex2',size:'large',parts:3,shadedIndex:0,shadeFill:EX2_CYAN,showSegmentNumbers:true});
  }

  function ex2Bar6(opts) {
    return ChocolateBar(Object.assign({id:'ex2',size:'large',parts:6,shadedIndices:[0,1],shadeFill:EX2_CYAN,showSegmentNumbers:true}, opts||{}));
  }

  /* Fraction chip row: [1/3] [sym] [2/6]. dim13=false makes 1/3 full brightness */
  function ex2FracRow(sym, dim13) {
    var d = dim13 === false ? '' : ' fraction-floating--dim';
    var chip13 = FractionChip(1, 3, 'fraction-floating--md' + d);
    var symEl  = sym
      ? h('div', { className: 'ex2-sym-chip' + (sym === '?' ? ' ex2-sym-chip--qmark' : '') }, sym)
      : null;
    var chip26 = FractionChip(2, 6, 'fraction-floating--md');
    return h('div', { className: 'ex2-frac-row' }, chip13, symEl, chip26);
  }

  /* 60/20/20 layout for all Ex2 single-bar screens */
  function ex2Layout(barNode, fracRowNode, controlsNode) {
    return h('div', { className: 'ex2-layout' },
      h('div', { className: 'ex2-bar-zone' }, barNode),
      h('div', { className: 'ex2-frac-zone' }, fracRowNode || null),
      h('div', { className: 'ex2-ctrl-zone' }, controlsNode || null)
    );
  }

  function buildS23() {
    return activity([td('s23_line1')], 'paheli',
      ex2Layout(ex2Bar3(), FractionChip(1, 3, 'fraction-floating--md')),
      fo(true, td('s23_line2'))
    );
  }

  /* ── S24: tap split guides (thirds → sixths) ── */
  function buildS24() {
    var s = appState;
    var complete = s.ex2SplitComplete;
    var pp24 = s.s24PulsePhase;
    var isDone24 = pp24 === 'done';
    var isPulsing24 = pp24 === 'shaded' || pp24 === 'all';
    var showCountAgain24 = complete && !isDone24 && (s.feedback === 'wrong' || isPulsing24);
    var lines = isDone24       ? [td('s27_line1')]
              : showCountAgain24 ? [td('s26_line1'), td('s26_line2'), td('s26_line3')]
              : complete       ? [td('s24_done_line1')]
              :                  [td('s24_line1')];
    var hint   = complete ? td('s24_done_hint') : fmtLine(td('s24_tap_guides'));
    /* Bar: 3-part while splitting, 6-part when done */
    var barP = { id:'ex2', size:'large', parts: complete?6:3, shadedIndices: complete?[0,1]:[0], shadeFill: EX2_CYAN, showSegmentNumbers: true };
    /* Fraction chip: always show 1/3 dimmed so learner keeps reference during splits */
    var persistChip = FractionChip(1, 3, 'fraction-floating--md fraction-floating--dim');
    var barNode = !complete
      ? withSplitGuides(barP, 3, s.ex2SplitsDone, function(){
          window.sound && window.sound.playClickSound();
          var next = s.ex2SplitsDone + 1;
          var allDone = next >= 3;
          if (allDone) window.sound && window.sound.playCorrectSound();
          setState({ ex2SplitsDone: next, ex2SplitComplete: allDone });
        })
      : ChocolateBar(barP);
    var fracZone24 = isDone24
      ? ex2FracRow('?')
      : persistChip;
    var controls = complete && !isDone24
      ? h('div', { className: 'option-row' },
          ['2/6','1/6','3/6'].map(function(f) {
            var isCorrect = s.ex2FractionAns === f && f === '2/6';
            var isWrong   = s.wrongValue === f;
            var parts = f.split('/');
            return h('button', {
              key: f,
              className: 'option-button option-button--frac' + (isCorrect ? ' is-correct' : isWrong ? ' is-wrong' : !isPulsing24 ? ' is-pulsate' : ''),
              disabled: isPulsing24,
              onClick: function() { if (!isPulsing24) pickFrac(f, '2/6', 'ex2FractionAns'); },
            },
              h('span', { className: 'frac-num' }, parts[0]),
              h('span', { className: 'frac-den' }, parts[1])
            );
          })
        )
      : null;
    var barExtra24 = pp24 === 'shaded' ? { staggerPulse: true, outlinePulse: true, pulseShaded: true }
                   : pp24 === 'all'    ? { staggerPulse: true, outlinePulse: true, pulsateHalves: true }
                   : pp24 === 'done'   ? { pulseShaded: true }
                   : {};
    var finalBarNode = complete ? ChocolateBar(Object.assign({}, barP, barExtra24)) : barNode;
    return activity(lines, 'paheli',
      ex2Layout(finalBarNode, fracZone24, controls),
      fo(canGoNext(s), isDone24 ? tl('tap_next') : hint)
    );
  }

  /* ── S25/S26: what fraction? (2/6) — count-pulse on answer ── */
  function buildS25or26(isRetry) {
    var s = appState;
    var pp = s.s25PulsePhase;
    var isDone25 = pp === 'done';
    var isPulsing25 = pp === 'shaded' || pp === 'all';
    var showCountAgain25 = !isDone25 && (s.feedback === 'wrong' || isRetry || isPulsing25);
    var lines = isDone25 ? [td('s27_line1')]
              : showCountAgain25 ? [td('s26_line1'), td('s26_line2'), td('s26_line3')]
              : [td('s25_line1')];
    /* count-pulse: 'shaded' → pulse 2 shaded segs; 'all' → all 6 with badge stagger; 'done' → keep shaded glow */
    var barExtra = pp === 'shaded' ? { staggerPulse: true, outlinePulse: true, pulseShaded: true }
                 : pp === 'all'    ? { staggerPulse: true, outlinePulse: true, pulsateHalves: true }
                 : pp === 'done'   ? { pulseShaded: true }
                 : {};
    /* done state: dimmed 1/3 chip + bright 2/6 chip with = ; options hidden */
    var fracZone = isDone25
      ? ex2FracRow('=')
      : FractionChip(1, 3, 'fraction-floating--md fraction-floating--dim');
    var ctrlZone = isDone25
      ? null
      : h('div', { className: 'option-row' },
          ['2/6','1/6','3/6'].map(function(f) {
            var isCorrect = s.ex2FractionAns === f && f === '2/6';
            var isWrong   = s.wrongValue === f;
            var parts = f.split('/');
            return h('button', {
              key: f,
              className: 'option-button option-button--frac' + (isCorrect ? ' is-correct' : isWrong ? ' is-wrong' : !isPulsing25 ? ' is-pulsate' : ''),
              disabled: isDone25 || isPulsing25,
              onClick: function() { if (!isPulsing25) pickFrac(f, '2/6', 'ex2FractionAns'); },
            },
              h('span', { className: 'frac-num' }, parts[0]),
              h('span', { className: 'frac-den' }, parts[1])
            );
          })
        );
    return activity(lines, 'paheli',
      ex2Layout(ex2Bar6(barExtra), fracZone, ctrlZone),
      fo(canGoNext(s), isDone25 ? tl('tap_next') : td('s25_line2'))
    );
  }

  /* ── S27: confirm 2/6 — count-pulse shaded → all on enter ── */
  function buildS27() {
    var s = appState; var pp = s.s27PulsePhase;
    var barExtra = pp === 'shaded' ? { staggerPulse: true, outlinePulse: true, pulseShaded: true }
                 : pp === 'all'    ? { pulsateHalves: true }
                 : { pulseFraction: true };
    return activity([td('s27_denom'), td('s27_numer')], 'paheli',
      ex2Layout(ex2Bar6(barExtra), ex2FracRow('=')),
      fo(true)
    );
  }

  /* ── S28/S29: are 1/3 and 2/6 equivalent? — wrong → group-of-two pulse ── */
  function buildS28or29(isRetry) {
    var s = appState;
    var answered = s.equivAns === 'Yes';
    var pp = s.s28PulsePhase;
    var lines = answered
      ? [td('s30_line1'), td('s30_line2')]
      : s.feedback === 'wrong'
        ? (isRetry ? [td('s29_line1'),td('s29_line2')] : [td('s28_wrong')])
        : isRetry ? [td('s29_line1'),td('s29_line2')] : [td('s28_line1')];
    /* group-of-two pulse: pulse the 2 shaded segments using staggerPulse when wrong */
    var barExtra = pp === 'group' ? { staggerPulse: true, outlinePulse: true, pulseShaded: true } : {};
    var ctrlZone28 = yesNoRow(s, answered ? null : function(opt){
      window.sound && window.sound.playClickSound();
      if (opt==='Yes') {
        window.sound && window.sound.playCorrectSound();
        setState({ equivAns:'Yes', feedback:'correct', wrongValue:null, s28PulsePhase:null });
      } else {
        window.sound && window.sound.playWrongSound();
        setState({ wrongValue:opt, feedback:'wrong', s28PulsePhase:'group' });
        scheduleAuto(2800, function(){
          if (appState.step === 28) {
            setState({ step: 29, wrongValue: null, feedback: null, s28PulsePhase: null });
          } else {
            setState({ s28PulsePhase: null });
          }
        });
      }
    });
    return activity(lines, 'paheli',
      ex2Layout(ex2Bar6(barExtra), ex2FracRow(answered ? '=' : '?', answered ? false : true), ctrlZone28),
      fo(canGoNext(s), answered ? tl('tap_next') : td('s28_line2'))
    );
  }

  /* ── S30: ?→= swap, group pulse, then definition box ── */
  function buildS30() {
    var s = appState;
    var sym = s.s30SymPhase === 'equal' ? '=' : '?';
    /* pulse group of 2 shaded segments */
    var barExtra = { staggerPulse: true, outlinePulse: true, pulseShaded: true, pulseFraction: s.s30SymPhase === 'equal' };
    return activity([td('s30_equiv')], 'paheli',
      ex2Layout(
        ex2Bar6(barExtra),
        ex2FracRow(sym, false),
        h('div', { className: 'ex2-def-box' }, fmtLine(td('s30_def')))
      ),
      fo(true, tl('tap_next'))
    );
  }

  /* Helper: one bar column — bar in top 80%, fraction chip in bottom 20% */
  function sumBarCol(barProps, num, den, pulse) {
    var bar = ChocolateBar(Object.assign({}, barProps, { fractionLabel: null, showSegmentNumbers: false }));
    var chip = FractionChip(num, den, 'fraction-floating--md' + (pulse ? ' fraction-floating--pulse' : ''));
    return h('div', { className: 'sum-bar-col' },
      h('div', { className: 'sum-bar-top' }, bar),
      h('div', { className: 'sum-bar-bot' }, chip)
    );
  }

  /* Helper: one full-width pair row */
  function sumPairRow(leftProps, leftNum, leftDen, rightProps, rightNum, rightDen, pulse) {
    return h('div', { className: 'summary-pair' },
      sumBarCol(leftProps,  leftNum,  leftDen,  pulse),
      h('div', { className: 'sum-eq-sym' }),
      sumBarCol(rightProps, rightNum, rightDen, pulse)
    );
  }

  /* Helper: triplet row — bar = bar = bar */
  function sumTripleRow(aProps, aNum, aDen, bProps, bNum, bDen, cProps, cNum, cDen, pulse) {
    return h('div', { className: 'summary-pair' },
      sumBarCol(aProps, aNum, aDen, pulse),
      h('div', { className: 'sum-eq-sym' }),
      sumBarCol(bProps, bNum, bDen, pulse),
      h('div', { className: 'sum-eq-sym' }),
      sumBarCol(cProps, cNum, cDen, pulse)
    );
  }

  /* ── S31: summary — both equivalent pairs using selected colours ── */
  function buildS31() {
    var fillEx1 = appState.selectedColor ? shadeHex(appState.selectedColor) : '#E91E8C';
    var fillEx2 = EX2_CYAN;
    return activity([td('s32_line2')], 'boojho',
      stage(h('div', { className: 'summary-pairs' },
        sumTripleRow(
          {id:'sum1a',size:'small',parts:2,shadedIndex:0,shadeFill:fillEx1}, 1, 2,
          {id:'sum1b',size:'small',parts:4,shadedIndices:[0,1],shadeFill:fillEx1}, 2, 4,
          {id:'sum1c',size:'small',parts:6,shadedIndices:[0,1,2],shadeFill:fillEx1}, 3, 6, true
        ),
        sumPairRow(
          {id:'sum2a',size:'small',parts:3,shadedIndex:0,shadeFill:fillEx2}, 1, 3,
          {id:'sum2b',size:'small',parts:6,shadedIndices:[0,1],shadeFill:fillEx2}, 2, 6, true
        )
      )),
      fo(true, tl('tap_next'))
    );
  }

  /* Inline fraction chip for title-card rows */
  function tChip(num, den) { return FractionChip(num, den, 'fraction-floating--md'); }
  function tEq() { return h('span', { className: 'tcard-eq' }, '='); }

  /* ── S32: "can we generate equivalent fractions?" bridge screen ── */
  function buildS32() {
    return h('div', { className: 's1-screen' },
      h('div', { className: 's1-topbar' }, h('span', { className: 's1-topbar-title' }, 'Equivalent Fractions')),
      h('div', { className: 's1-body' },
        h('div', { className: 's1-left' },
          h('img', { src: 'assets/images/boojho.png', alt: 'Boojho', className: 's1-character', draggable: false })
        ),
        h('div', { className: 's1-right' },
          h('div', { className: 's1-card' },
            h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s33_line1')) } }),
            h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s33_line2')) } })
          )
        )
      ),
      h('div', { className: 's1-footer' },
        h('div', { className: 'start-button-container' },
          AppletButton({ label: tb('next'), variant: 'active', impending: 'clickNext', onClick: goNext })
        )
      )
    );
  }

  /* ── S33: end / restart title card ── */
  function buildS33() {
    return h('div', { className: 's1-screen s33-screen' },
      appState.showConfetti ? Confetti({}) : null,
      h('div', { className: 's1-topbar' }, h('span', { className: 's1-topbar-title' }, td('s34_title'))),
      h('div', { className: 's1-body' },
        h('div', { className: 's1-left' },
          h('img', { src: 'assets/images/Paheli.png', alt: 'Paheli', className: 's1-character', draggable: false })
        ),
        h('div', { className: 's1-right' },
          h('div', { className: 's33-right-col' },
            h('div', { className: 's1-card' },
              h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s34_line1')) } }),
              h('p', { className: 's1-card-line', dangerouslySetInnerHTML: { __html: formatFractionsInHtml(td('s34_line2')) } })
            ),
            h('div', { className: 's33-try-again' },
              h('p', { className: 's33-try-label' }, td('s34_line3')),
              AppletButton({ label: tb('restart'), variant: 'active', impending: 'clickNext', onClick: doRestart })
            )
          )
        )
      ),
      h('div', { className: 's1-footer' })
    );
  }

  /* ─────────────── Router ─────────────── */
  function buildScreen(s) {
    switch (s.step) {
      case 1:  return buildS1();
      case 2:  return buildS2();
      case 3:  return buildS3();
      case 4:  return buildS4();
      case 5:  return buildS5();
      case 6:  return buildS6();
      case 7:  return buildS7();
      case 8:  return buildS8();
      case 9:  return buildS9();
      case 10: return buildS10();
      case 11: return buildS11or12(false);
      case 12: return buildS11or12(true);
      case 13: return buildS13();
      case 14: return buildS14();
      case 15: return buildS15();
      case 16: return buildS16();
      case 17: return buildS17();
      case 18: return buildS18_eq();
      case 19: return buildS19_named();
      case 20: return buildS20_def();
      case 21: return buildS21();
      case 22: return buildS22();
      case 23: return buildS23();
      case 24: return buildS24();
      case 25: return buildS25or26(false);
      case 26: return buildS25or26(true);
      case 27: return buildS27();
      case 28: return buildS28or29(false);
      case 29: return buildS28or29(true);
      case 30: return buildS30();
      case 31: return buildS31();
      case 32: return buildS32();
      case 33: return buildS33();
      default: return buildS1();
    }
  }

  /* ─────────────── Render ─────────────── */
  var container = document.getElementById('app');

  function renderApp() {
    rendering = true;
    try {
      while (container.firstChild) container.removeChild(container.firstChild);
      var vdom = buildScreen(appState);
      window.render(vdom, container);
    } finally {
      rendering = false;
    }

    /* S15: measure bar positions when a symbol pick kicks off overlap slide */
    if (
      appState.step === 15 &&
      appState.s15OverlapPhase === 'animating' &&
      appState.s15SlideDelta == null
    ) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var st = appState;
          if (st.step !== 15 || st.s15OverlapPhase !== 'animating' || st.s15SlideDelta != null) return;
          var splitBarEl = document.querySelector('[data-bar-id="s15-split"]');
          var halfBarEl  = document.querySelector('[data-bar-id="s15-half"]');
          if (!splitBarEl || !halfBarEl) return;
          var sf = getScaleFactor();
          var halfShadedIdx = (st.wholeSplit || 'left') === 'left' ? st.shadedRightIdx : st.shadedLeftIdx;
          var splitShadedStart = firstSplitShadedIndex(st);
          var splitSegStart = splitBarEl.querySelector('[data-segment-index="' + splitShadedStart + '"]');
          var halfSegTarget = halfBarEl.querySelector('[data-segment-index="' + halfShadedIdx + '"]');
          if (!splitSegStart || !halfSegTarget) return;
          var sr = splitSegStart.getBoundingClientRect();
          var tr = halfSegTarget.getBoundingClientRect();
          var dx = (tr.left - sr.left) / sf;
          var dy = (tr.top  - sr.top)  / sf;
          /* Mutate directly so we don't clear the reset timer set by scheduleAuto above */
          appState.s15SlideDelta = { dx: dx, dy: dy };
          renderApp();
        });
      });
    }

    /* S16: after first render, measure bar positions and kick off overlap slide */
    if (
      appState.step === 16 &&
      appState.overlapPhase === 'idle' &&
      appState.s16SlideDelta == null
    ) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var st = appState;
          if (st.step !== 16 || st.overlapPhase !== 'idle' || st.s16SlideDelta != null) return;
          var side = st.wholeSplit || 'left';
          var halfSide = side === 'left' ? 'right' : 'left';
          var splitBarEl = document.querySelector('[data-bar-id="' + side + '"]');
          var halfBarEl  = document.querySelector('[data-bar-id="' + halfSide + '"]');
          if (!splitBarEl || !halfBarEl) return;
          var sf = getScaleFactor();
          /* Measure the first shaded split segment → shaded segment on the half bar */
          var halfShadedIdx = halfSide === 'left' ? st.shadedLeftIdx : st.shadedRightIdx;
          var splitShadedStart = firstSplitShadedIndex(st);
          var splitSegStart = splitBarEl.querySelector('[data-segment-index="' + splitShadedStart + '"]');
          var halfSegTarget = halfBarEl.querySelector('[data-segment-index="' + halfShadedIdx + '"]');
          if (!splitSegStart || !halfSegTarget) return;
          var sr = splitSegStart.getBoundingClientRect();
          var tr = halfSegTarget.getBoundingClientRect();
          var dx = (tr.left - sr.left) / sf;
          var dy = (tr.top  - sr.top)  / sf;
          setState({ s16SlideDelta: { dx: dx, dy: dy }, overlapPhase: 'animating' });
          scheduleAuto(OVERLAP_ANIMATION_MS, function () { setState({ overlapPhase: 'done' }); });
        });
      });
    }
  }

  /* ─────────────── Init ─────────────── */
  window.initializeApp = function () {
    /* ?step=N dev shortcut */
    var qs = new URLSearchParams(window.location.search);
    var devStep = parseInt(qs.get('step'), 10);
    if (devStep >= 2 && devStep <= 33) {
      appState.step = devStep;
      appState.phase = 'flow';
      /* pre-fill gates so screens render sensibly */
      appState.pickedParts = 2;
      appState.shadedLeft = true; appState.shadedRight = true; appState.selectedColor = 'pink';
      appState.wholeSplit = 'left'; appState.splitsDone = 1; appState.splitComplete = true;
      appState.fractionAns = '2/4';
      appState.symbolAns = '='; appState.overlapPhase = 'done';
      appState.ex2SplitsDone = 2; appState.ex2SplitComplete = true;
      appState.ex2FractionAns = '2/6';
      appState.equivAns = 'Yes';
    }
    renderApp();
  };
  window.__getAppState = function () { return appState; };
  window.__setState = function (patch) { setState(patch); };
  window.renderApp = renderApp;
})();
