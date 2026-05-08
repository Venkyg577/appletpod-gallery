/* Comparing Fractions Visually – main app.
   State machine + screen builders for all 32 screens. */

(function () {
  const h = window.createElement;
  const OVERLAP_ANIMATION_DURATION = '6.8s';
  const OVERLAP_ANIMATION_MS = 6800;
  const SYMBOL_COLLAPSE_MS = 1000;
  const CORRECT_OPTION_FEEDBACK_MS = 1300;
  const {
    CharacterPanel,
    FooterNav,
    AppletButton,
    OptionRow,
    SymbolStrip,
    FractionLabel,
    HalfCallout,
    Confetti,
    FeedbackBanner,
    visibleTextLength,
    formatFractionsInHtml,
  } = window.Components;
  const { ChocolateBar, FractionChip, PlainSymbol } = window.ChocolateBarComponent;
  const { getText } = window.utils;

  /* ---------------- State ---------------- */
  let appState = {
    phase: 'splash',           /* 'splash' | 'flow' | 'final' */
    step: 1,                   /* 1..32 */
    pickedParts: null,         /* null | 2 | 3 | 5 — S3 small bar */
    pickedPartsBig: null,      /* null | 2 | 3 | 5 — S6 big bar */
    pickedHalfSmall: null,     /* null | 0 | 1 — S4 */
    pickedHalfLarge: null,     /* null | 0 | 1 — S7/S8 */
    sameSizeAns: null,         /* null | 'Yes' | 'No' — S10 */
    sameSizeAns2: null,        /* null | 'Yes' | 'No' — S28 */
    comparedSymbol: null,      /* '>' | '=' | '<' — S23 */
    comparedSymbol2: null,     /* '>' | '=' | '<' — S30 */
    selectedBarForResize: null,/* null | 'small' | 'large' — S22 */
    resizingNow: false,        /* S22 active animation */
    wholesNormalized: false,   /* after S22 succeeds */
    equalizedSize: null,       /* null | 'small' | 'large' — final common whole size after S22 */
    overlapPhase: 'idle',      /* 'idle' | 'animating' | 'done' — S15/S16/S24/S29 */
    s15SlideDelta: null,       /* { dx, dy } measured top-left → top-left for S15 overlap */
    s29SlideDelta: null,       /* { dx, dy } measured top-left → top-left for S29 overlap */
    /* S24 / S30: after picking a comparison symbol, align shaded halves in screen space */
    s23OverlapPhase: 'idle',   /* idle | pending | animating | done */
    s23OverlapDelta: null,
    s23OverlapVariant: null,   /* 'correct' | 'wrong' — animation style after measure */
    symbolStripCollapsed: false,
    s30OverlapPhase: 'idle',
    s30OverlapDelta: null,
    s30OverlapVariant: null,
    navBackMode: false,        /* true when user entered current step using Prev */
    feedback: null,            /* null | 'correct' | 'wrong' */
    wrongValue: null,          /* last wrong answer for teeter highlight */
    typewriterStep: null,
    typewriterKey: '',
    typewriterChars: null,
    typewriterDoneKey: '',
    language: 'en',
  };

  /* ---------------- Auto-advance timer management ---------------- */
  let autoTimer = null;
  let symbolCollapseTimer = null;
  let typewriterTimer = null;
  let pendingTypewriterKey = '';
  let lastShownDialogueKey = '';
  function clearAutoTimer() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }
  function clearSymbolCollapseTimer() {
    if (symbolCollapseTimer) {
      clearTimeout(symbolCollapseTimer);
      symbolCollapseTimer = null;
    }
  }
  function clearTypewriterTimer() {
    if (typewriterTimer) {
      clearTimeout(typewriterTimer);
      typewriterTimer = null;
    }
  }
  function scheduleAuto(ms, fn) {
    clearAutoTimer();
    autoTimer = setTimeout(() => {
      autoTimer = null;
      fn();
    }, ms);
  }
  function scheduleSymbolCollapse() {
    clearSymbolCollapseTimer();
    symbolCollapseTimer = setTimeout(() => {
      symbolCollapseTimer = null;
      const cur = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
      if (!cur || cur.step !== 24 || cur.comparedSymbol !== '=') return;
      const strip = document.querySelector('.symbol-strip-slot .symbol-strip');
      if (!strip) return;
      strip.classList.add('symbol-strip--single');
      strip.querySelectorAll('.symbol-button').forEach((button) => {
        if (button.getAttribute('data-symbol-value') !== '=') {
          button.classList.add('symbol-button--collapsed');
          button.setAttribute('aria-hidden', 'true');
        }
      });
      appState.symbolStripCollapsed = true;
    }, SYMBOL_COLLAPSE_MS);
  }

  function dialogueKey(lines) {
    return (lines || []).join('|');
  }

  function dialogueLength(lines) {
    return (lines || []).reduce((sum, line) => {
      const formatted = formatFractionsInHtml ? formatFractionsInHtml(line) : line;
      return sum + visibleTextLength(formatted);
    }, 0);
  }

  function ensureTypewriter(lines) {
    const key = dialogueKey(lines);
    if (appState.typewriterDoneKey === key) return true;
    if (lastShownDialogueKey === key) {
      setState({ typewriterDoneKey: key });
      return true;
    }

    const total = dialogueLength(lines);
    if (
      appState.typewriterStep !== appState.step
      || appState.typewriterKey !== key
      || appState.typewriterChars == null
    ) {
      clearTypewriterTimer();
      setState({
        typewriterStep: appState.step,
        typewriterKey: key,
        typewriterChars: 0,
        typewriterDoneKey: '',
      });
      pendingTypewriterKey = key;
      return false;
    }

    if (appState.typewriterChars >= total) {
      clearTypewriterTimer();
      pendingTypewriterKey = '';
      setState({
        typewriterChars: total,
        typewriterDoneKey: key,
      });
      return false;
    }

    if (!typewriterTimer) {
      typewriterTimer = setTimeout(() => {
        typewriterTimer = null;
        const cur = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
        if (!cur || cur.step !== appState.step || cur.typewriterKey !== key) return;
        setState({ typewriterChars: Math.min(total, (cur.typewriterChars || 0) + 2) });
      }, 34);
    }
    return false;
  }

  /* ---------------- State plumbing ---------------- */
  let renderInProgress = false;
  let pendingPatches = [];

  function flushPendingPatches() {
    if (pendingPatches.length === 0) return;
    const prevStep = appState.step;
    const merged = Object.assign({}, appState, ...pendingPatches);
    pendingPatches = [];
    let next = merged;
    if (merged.step != null && merged.step !== prevStep) {
      if (prevStep === 24 && merged.step !== 24) {
        next = Object.assign({}, next, {
          s23OverlapPhase: 'idle',
          s23OverlapDelta: null,
          s23OverlapVariant: null,
          symbolStripCollapsed: false,
        });
      }
      if (merged.step !== prevStep) {
        clearTypewriterTimer();
        pendingTypewriterKey = '';
        next = Object.assign({}, next, {
          typewriterStep: null,
          typewriterKey: '',
          typewriterChars: null,
        });
      }
      if (prevStep === 32 && merged.step !== 32) {
        next = Object.assign({}, next, {
          s30OverlapPhase: 'idle',
          s30OverlapDelta: null,
          s30OverlapVariant: null,
        });
      }
    }
    appState = next;
    renderApp();
  }

  function setState(patch) {
    const applyMerge = () => {
      const prevStep = appState.step;
      let merged = Object.assign({}, appState, patch);
      if (patch.step != null && patch.step !== prevStep) {
        if (prevStep === 24 && patch.step !== 24) {
          merged.s23OverlapPhase = 'idle';
          merged.s23OverlapDelta = null;
          merged.s23OverlapVariant = null;
          merged.symbolStripCollapsed = false;
        }
        clearTypewriterTimer();
        pendingTypewriterKey = '';
        merged.typewriterStep = null;
        merged.typewriterKey = '';
        merged.typewriterChars = null;
        if (prevStep === 32 && patch.step !== 32) {
          merged.s30OverlapPhase = 'idle';
          merged.s30OverlapDelta = null;
          merged.s30OverlapVariant = null;
        }
      }
      appState = merged;
      renderApp();
    };

    if (renderInProgress) {
      pendingPatches.push(patch);
      Promise.resolve().then(flushPendingPatches);
      return;
    }
    applyMerge();
  }

  function goToStep(step, extraPatch) {
    clearAutoTimer();
    clearSymbolCollapseTimer();
    clearTypewriterTimer();
    pendingTypewriterKey = '';
    const patch = Object.assign(
      {
        feedback: null,
        wrongValue: null,
        overlapPhase: 'idle',
        s15SlideDelta: null,
        s29SlideDelta: null,
        s23OverlapPhase: 'idle',
        s23OverlapDelta: null,
        s23OverlapVariant: null,
        symbolStripCollapsed: false,
        typewriterStep: null,
        typewriterKey: '',
        typewriterChars: null,
        s30OverlapPhase: 'idle',
        s30OverlapDelta: null,
        s30OverlapVariant: null,
        navBackMode: false,
        resizingNow: false,
      },
      extraPatch || {}
    );
    patch.step = step;
    setState(patch);
  }

  /* ---------------- Navigation gating ---------------- */
  function canGoPrev(state) {
    return false;
  }

  function canGoNext(state) {
    const s = state.step;
    if (state.phase !== 'flow') return false;

    if (s === 1) return true;
    if (s === 2) return true;
    if (s === 3) return state.pickedParts === 2;
    if (s === 4) return state.pickedHalfSmall != null;
    if (s === 5) return true;
    if (s === 6) return state.pickedPartsBig === 2;
    if (s === 7) return state.pickedHalfLarge != null;
    if (s === 8) return state.pickedHalfLarge != null;
    if (s === 9) return true;
    if (s === 10) return state.sameSizeAns === 'No';
    if (s === 11) return state.sameSizeAns === 'No';
    if (s === 12) return true;
    if (s === 13) return true;
    if (s === 14) return true;
    if (s === 15) return state.overlapPhase === 'done';
    if (s === 16) return true;
    if (s === 17) return true;
    if (s === 18) return true;
    if (s === 19) return true;
    if (s === 20) return true;
    if (s === 21) return true;
    if (s === 22) return state.wholesNormalized;
    if (s === 23) return true;
    if (s === 24) return state.comparedSymbol === '=';
    if (s === 25) return true;
    if (s === 26) return true;
    if (s === 27) return true;
    if (s === 28) return true;
    if (s === 29) return true;
    if (s === 30) return state.sameSizeAns2 === 'Yes';
    if (s === 31) return state.overlapPhase === 'done';
    if (s === 32) return state.comparedSymbol2 === '>';
    if (s === 33) return true;
    if (s === 34) return true;
    if (s === 35) return true;
    if (s === 36) return true;
    if (s === 37) return true;
    if (s === 38) return false;
    return false;
  }

  function goNext() {
    if (!canGoNext(appState)) return;
    if (window.sound) window.sound.playClickSound();
    const s = appState.step;
    /* S2 → S3: choose how many equal parts (2 / 3 / 5). */
    if (s === 2) {
      goToStep(3, {
        pickedParts: null,
        pickedHalfSmall: null,
        feedback: null,
        wrongValue: null,
        navBackMode: false,
      });
      return;
    }
    /* S3 → S4: after correct “2”, show divided bar + choose-a-half dialogue. */
    if (s === 3 && appState.pickedParts === 2) {
      goToStep(4, { pickedHalfSmall: null, navBackMode: false });
      return;
    }
    /* S4 → S6: ask how many equal parts for the bigger bar. */
    if (s === 4 && appState.pickedHalfSmall != null) {
      goToStep(6, {
        pickedPartsBig: null,
        pickedHalfLarge: null,
        navBackMode: false,
      });
      return;
    }
    /* S6 → S7: after correct “2”, show divided bigger bar + choose-a-half dialogue. */
    if (s === 6 && appState.pickedPartsBig === 2) {
      goToStep(7, { pickedHalfLarge: null, navBackMode: false });
      return;
    }
    /* S7/S8: after choosing a half on the large bar, jump to side-by-side compare (S9). */
    if ((s === 7 || s === 8) && appState.pickedHalfLarge != null) {
      goToStep(9, { navBackMode: false });
      return;
    }
    goToStep(s + 1, { navBackMode: false });
  }

  function completedPatchForStep(step) {
    const patch = {};
    if (step >= 3 && appState.pickedParts == null) patch.pickedParts = 2;
    if (step >= 4 && appState.pickedHalfSmall == null) patch.pickedHalfSmall = 0;
    if (step >= 6 && appState.pickedPartsBig == null) patch.pickedPartsBig = 2;
    if (step >= 7 && appState.pickedHalfLarge == null) patch.pickedHalfLarge = 0;
    if ((step === 10 || step === 11) && appState.sameSizeAns !== 'No') patch.sameSizeAns = 'No';
    if (step === 15) patch.overlapPhase = 'done';
    if (step >= 22 && appState.wholesNormalized !== true) patch.wholesNormalized = true;
    if (step >= 22 && !appState.equalizedSize) patch.equalizedSize = 'large';
    if (step === 24 && appState.comparedSymbol !== '=') patch.comparedSymbol = '=';
    if (step === 24) {
      patch.s23OverlapPhase = 'done';
      patch.s23OverlapDelta = null;
      patch.s23OverlapVariant = null;
    }
    if (step === 30 && appState.sameSizeAns2 !== 'Yes') patch.sameSizeAns2 = 'Yes';
    if (step === 31) patch.overlapPhase = 'done';
    if (step === 32 && appState.comparedSymbol2 !== '>') patch.comparedSymbol2 = '>';
    if (step === 32) {
      patch.s30OverlapPhase = 'done';
      patch.s30OverlapDelta = null;
      patch.s30OverlapVariant = null;
    }
    return patch;
  }

  function goPrev() {
    if (!canGoPrev(appState)) return;
    if (window.sound) window.sound.playClickSound();
    if (appState.phase === 'final') {
      goToStep(37, Object.assign({ navBackMode: true }, completedPatchForStep(37)));
      return;
    }
    if (appState.step <= 2) {
      goToStep(1, { phase: 'splash', navBackMode: true });
      return;
    }
    const prevStep = appState.step - 1;
    goToStep(prevStep, Object.assign({ navBackMode: true }, completedPatchForStep(prevStep)));
  }

  function schedulePassiveAdvance(nextStep, ms, lines) {
    if (appState.navBackMode || autoTimer != null) return;
    if (lines && lines.length && !ensureTypewriter(lines)) return;
    const baseMs = ms || 2600;
    scheduleAuto(baseMs + 1800, () => goToStep(
      nextStep,
      { navBackMode: false }
    ));
  }

  /* ---------------- Screen builders ---------------- */

  /* =========================================================
   * Group A: Splash + small-bar narration (S1-S9)
   * ========================================================= */

  function buildSplashScreen() {
    const title = getText('content-ui.dialogs.s1_title', {}, appState.language);
    const line1 = getText('content-ui.dialogs.s1_line_1', {}, appState.language);
    const line2 = getText('content-ui.dialogs.s1_line_2', {}, appState.language);
    const startLabel = getText('standard-ui.buttons.start', {}, appState.language);

    const handleStart = () => {
      if (window.sound) window.sound.playClickSound();
      goToStep(2, { phase: 'flow' });
    };

    return h(
      'div',
      { className: 'intro-screen' },
      h(
        'div',
        { className: 'intro-header' },
        h('h1', { className: 'header-title interactive-text' }, title)
      ),
      h(
        'div',
        { className: 'intro-body' },
        h(
          'div',
          { className: 'intro-center' },
          h(
            'div',
            { className: 'intro-message' },
            h('p', { className: 'intro-text interactive-text', dangerouslySetInnerHTML: { __html: line1 } }),
            h('p', { className: 'intro-text interactive-text', dangerouslySetInnerHTML: { __html: line2 } }),
            h(
              'div',
              { className: 'intro-characters' },
              h('img', { src: 'assets/images/boojho.png', alt: 'Boojho', className: 'intro-character-image', draggable: false }),
              h('img', { src: 'assets/images/Paheli.png', alt: 'Paheli', className: 'intro-character-image', draggable: false })
            )
          )
        )
      ),
      h(
        'div',
        { className: 'intro-footer' },
        AppletButton({
          label: startLabel,
          variant: 'active',
          impending: 'clickNext',
          disabled: false,
          onClick: handleStart,
        })
      )
    );
  }

  function buildActivityShell(opts) {
    const {
      character = 'boojho',
      lines = [],
      activityArea,
      footerCenter = '',
      canPrev,
      canNext,
      onPrev,
      onNext,
      glowNext = true,
      allowOverlapOverflow = false,
    } = opts;

    const overlapVis = allowOverlapOverflow ? ' activity-overlap-visible' : '';
    const key = dialogueKey(lines);
    const typewriterChars =
      appState.typewriterStep === appState.step
      && appState.typewriterKey === key
      && appState.typewriterDoneKey !== key
        ? appState.typewriterChars
        : pendingTypewriterKey === key
          ? 0
        : null;
    if (lines && lines.length && typewriterChars == null) {
      lastShownDialogueKey = key;
    }

    return h(
      'div',
      { className: 'activity-screen' },
      h(
        'div',
        { className: 'activity-body' + overlapVis },
        CharacterPanel({ lines, character, typewriterChars }),
        h(
          'div',
          { className: 'right-activity-section' + overlapVis },
          h('div', { className: 'activity-area' + overlapVis }, activityArea),
          FooterNav({
            centerText: footerCenter,
            onPrev: onPrev,
            onNext: onNext,
            canPrev: canPrev,
            canNext: canNext,
            glowNext: glowNext,
          })
        )
      )
    );
  }

  /* Renders text lines in the activity area with big centered font (no speech bubble). */
  function buildNarrativeStage(lines) {
    return h(
      'div',
      { className: 'narrative-text-box' },
      h(
        'div',
        { className: 'narrative-text-card' },
        ...lines.map((line) =>
          h('p', { dangerouslySetInnerHTML: { __html: line } })
        )
      )
    );
  }

  /* S2 – Boojho intro: "Here is my chocolate bar. Tap next to divide." */
  function buildScreen2() {
    const lines = [
      getText('content-ui.dialogs.s2_line_1', {}, appState.language),
      getText('content-ui.dialogs.s2_line_2', {}, appState.language),
    ];
    const hint = getText('content-ui.dialogs.s2_hint', {}, appState.language);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({ id: 'small-s2', size: 'small', parts: 0 })
      )
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: hint,
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S3 – choose 2/3/5 for small bar; correct answer 2 leads to choose-a-half (S4). */
  function buildScreen3() {
    const lines = [
      getText('content-ui.dialogs.s3_line_1', {}, appState.language),
      getText('content-ui.dialogs.s3_line_2', {}, appState.language),
    ];
    const prompt = getText('standard-ui.instructions.tap_choose_parts', {}, appState.language);

    const onSelect = (val) => {
      if (window.sound) window.sound.playClickSound();
      if (val === 2) {
        if (window.sound) window.sound.playCorrectSound();
        setState({ pickedParts: 2, feedback: 'correct', wrongValue: null });
        scheduleAuto(CORRECT_OPTION_FEEDBACK_MS, () => {
          const cur = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
          if (!cur || cur.step !== 3 || cur.pickedParts !== 2) return;
          goToStep(4, {
            pickedParts: 2,
            pickedHalfSmall: null,
            navBackMode: false,
          });
        });
      } else {
        if (window.sound) window.sound.playWrongSound();
        setState({ feedback: 'wrong', wrongValue: val });
        scheduleAuto(3000, () => setState({ feedback: null, wrongValue: null }));
      }
    };

    const optionRow = OptionRow({
      options: [
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 5, label: '5' },
      ],
      selectedValue: appState.pickedParts,
      correctValue: appState.pickedParts === 2 ? 2 : null,
      wrongValue: appState.wrongValue,
      pulsate: appState.pickedParts !== 2,
      disabled: appState.pickedParts === 2,
      onSelect: onSelect,
    });

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s3',
          size: 'small',
          parts: appState.pickedParts === 2 ? 2 : 0,
          splitAnimate: appState.pickedParts === 2,
          barControls: optionRow,
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: appState.pickedParts === 2 ? '' : prompt,
      canPrev: canGoPrev(appState),
      canNext: false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: appState.pickedParts === 2,
    });
  }

  /* S4 – tap a half on small bar (after S3 chose 2 equal parts) */
  function buildScreen4() {
    const picked = appState.pickedHalfSmall != null;
    const lines = picked
      ? [
          getText('content-ui.dialogs.s5_line_1', {}, appState.language),
          getText('content-ui.dialogs.s5_line_2', {}, appState.language),
        ]
      : [
          getText('content-ui.dialogs.s4_line_1', {}, appState.language),
          getText('content-ui.dialogs.s4_line_2', {}, appState.language),
        ];
    const hint = picked
      ? getText('content-ui.dialogs.s5_hint', {}, appState.language)
      : getText('standard-ui.instructions.tap_a_half', {}, appState.language);

    const onTapSegment = (i) => {
      if (picked) return;
      if (window.sound) window.sound.playClickSound();
      if (window.sound) window.sound.playCorrectSound();
      setState({ pickedHalfSmall: i, feedback: 'correct', wrongValue: null });
    };

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s4',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall,
          dimUnshaded: picked,
          pulsateHalves: !picked,
          tapHint: !picked,
          onTapSegment: picked ? null : onTapSegment,
          fractionLabel: picked ? { num: '1', den: '2' } : null,
        })
      )
    );

    return buildActivityShell({
      character: picked ? 'paheli' : 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: hint,
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: picked,
    });
  }

  /* S5 – "This is 1/2" label */
  function buildScreen5() {
    const lines = [
      getText('content-ui.dialogs.s5_line_1', {}, appState.language),
      getText('content-ui.dialogs.s5_line_2', {}, appState.language),
    ];
    const hint = getText('content-ui.dialogs.s5_hint', {}, appState.language);

    const shaded = appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0;

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s5',
          size: 'small',
          parts: 2,
          shadedIndex: shaded,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: hint,
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S6 – choose 2/3/5 for bigger bar; correct answer 2 leads to choose-a-half (S7). */
  function buildScreen6() {
    const lines = [
      getText('content-ui.dialogs.s6_line_1', {}, appState.language),
      getText('content-ui.dialogs.s6_line_2', {}, appState.language),
    ];
    const prompt = getText('standard-ui.instructions.tap_choose_parts', {}, appState.language);

    const onSelect = (val) => {
      if (window.sound) window.sound.playClickSound();
      if (val === 2) {
        if (window.sound) window.sound.playCorrectSound();
        setState({ pickedPartsBig: 2, feedback: 'correct', wrongValue: null });
        scheduleAuto(CORRECT_OPTION_FEEDBACK_MS, () => {
          const cur = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
          if (!cur || cur.step !== 6 || cur.pickedPartsBig !== 2) return;
          goToStep(7, {
            pickedPartsBig: 2,
            pickedHalfLarge: null,
            navBackMode: false,
          });
        });
      } else {
        if (window.sound) window.sound.playWrongSound();
        setState({ feedback: 'wrong', wrongValue: val });
        scheduleAuto(3000, () => setState({ feedback: null, wrongValue: null }));
      }
    };

    const optionRow = OptionRow({
      options: [
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 5, label: '5' },
      ],
      selectedValue: appState.pickedPartsBig,
      correctValue: appState.pickedPartsBig === 2 ? 2 : null,
      wrongValue: appState.wrongValue,
      pulsate: appState.pickedPartsBig !== 2,
      disabled: appState.pickedPartsBig === 2,
      onSelect: onSelect,
    });

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-ghost-s6',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          faded: true,
          dimLabels: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'large-s6',
          size: 'large',
          parts: appState.pickedPartsBig === 2 ? 2 : 0,
          splitAnimate: appState.pickedPartsBig === 2,
          barControls: optionRow,
        })
      )
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: appState.pickedPartsBig === 2 ? '' : prompt,
      canPrev: canGoPrev(appState),
      canNext: false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: appState.pickedPartsBig === 2,
    });
  }

  /* S7 – tap a half on bigger bar (after S6 chose 2 equal parts). */
  function buildBigChooseHalfScreen() {
    const pickedLarge = appState.pickedHalfLarge != null;
    const lines = pickedLarge
      ? [
          getText('content-ui.dialogs.s9_line_1', {}, appState.language),
          getText('content-ui.dialogs.s9_line_2', {}, appState.language),
        ]
      : [
          getText('content-ui.dialogs.s7_line_1', {}, appState.language),
          getText('content-ui.dialogs.s7_line_2', {}, appState.language),
        ];
    const hintChoose = getText('standard-ui.instructions.tap_a_half', {}, appState.language);
    const compareHint = getText('content-ui.dialogs.s9_hint', {}, appState.language);

    const onTapLargeHalf = (i) => {
      if (pickedLarge) return;
      if (window.sound) window.sound.playClickSound();
      if (window.sound) window.sound.playCorrectSound();
      setState({ pickedHalfLarge: i, feedback: 'correct', wrongValue: null });
    };

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-ghost-s7',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          faded: true,
          dimLabels: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'large-s7',
          size: 'large',
          parts: 2,
          shadedIndex: appState.pickedHalfLarge,
          dimUnshaded: pickedLarge,
          pulsateHalves: !pickedLarge,
          tapHint: !pickedLarge,
          onTapSegment: pickedLarge ? null : onTapLargeHalf,
          fractionLabel: pickedLarge ? { num: '1', den: '2' } : null,
        })
      )
    );

    return buildActivityShell({
      character: pickedLarge ? 'paheli' : 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: pickedLarge ? compareHint : hintChoose,
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: pickedLarge,
    });
  }

  /* Legacy step indices 7–8: same choose-a-half UI. */
  function buildScreen7or8() {
    return buildBigChooseHalfScreen();
  }

  /* S9 – "This is also one-half" + show both bars side by side (vertical stack). */
  function buildScreen9() {
    const lines = [
      getText('content-ui.dialogs.s9_line_1', {}, appState.language),
      getText('content-ui.dialogs.s9_line_2', {}, appState.language),
    ];
    const hint = getText('content-ui.dialogs.s9_hint', {}, appState.language);

    const smallShaded = appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0;
    const largeShaded = appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0;

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s9',
          size: 'small',
          parts: 2,
          shadedIndex: smallShaded,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'large-s9',
          size: 'large',
          parts: 2,
          shadedIndex: largeShaded,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: hint,
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* =========================================================
   * Group B: Same-size investigation (S10-S21)
   * ========================================================= */

  function bothBarsStack(opts) {
    const {
      shadedSmall = 0,
      shadedLarge = 0,
      outlinePulse = false,
      pulseLargeHalf = false,
      pulseSmallHalf = false,
      showSmallerBiggerLabels = false,
      smallFraction = { num: '1', den: '2' },
      largeFraction = { num: '1', den: '2' },
      pulseFractions = false,
    } = opts || {};

    return h(
      'div',
      { className: 'bars-stack' },
      ChocolateBar({
        id: 'small-pair',
        size: 'small',
        parts: 2,
        shadedIndex: shadedSmall,
        dimUnshaded: true,
        outlinePulse: outlinePulse,
        pulseSegment: pulseSmallHalf ? shadedSmall : null,
        fractionLabel: smallFraction,
        pulseFraction: pulseFractions,
        segmentLabels: showSmallerBiggerLabels
          ? { [shadedSmall]: getText('standard-ui.labels.smaller_half', {}, appState.language) }
          : null,
      }),
      ChocolateBar({
        id: 'large-pair',
        size: 'large',
        parts: 2,
        shadedIndex: shadedLarge,
        dimUnshaded: true,
        outlinePulse: outlinePulse,
        pulseSegment: pulseLargeHalf ? shadedLarge : null,
        fractionLabel: largeFraction,
        pulseFraction: pulseFractions,
        segmentLabels: showSmallerBiggerLabels
          ? { [shadedLarge]: getText('standard-ui.labels.bigger_half', {}, appState.language) }
          : null,
      })
    );
  }

  /* S10/S11 – "Are wholes the same size?" with retry inline. */
  function buildScreen10() {
    const isWrongRetry = appState.feedback === 'wrong';
    const lines = isWrongRetry
      ? [getText('content-ui.dialogs.s11_line_1', {}, appState.language)]
      : [
          getText('content-ui.dialogs.s10_line_1', {}, appState.language),
          getText('content-ui.dialogs.s10_line_2', {}, appState.language),
          getText('content-ui.dialogs.s10_line_3', {}, appState.language),
        ];

    const onSelect = (val) => {
      if (window.sound) window.sound.playClickSound();
      if (val === 'No') {
        if (window.sound) window.sound.playCorrectSound();
        setState({ sameSizeAns: 'No', feedback: 'correct', wrongValue: null });
        scheduleAuto(2000, () => goToStep(12, { sameSizeAns: 'No' }));
      } else {
        if (window.sound) window.sound.playWrongSound();
        setState({ sameSizeAns: null, feedback: 'wrong', wrongValue: 'Yes' });
        scheduleAuto(3000, () => setState({ feedback: null, wrongValue: null }));
      }
    };

    const optionRow = OptionRow({
      yesNo: true,
      options: [
        { value: 'Yes', label: getText('standard-ui.buttons.yes', {}, appState.language) },
        { value: 'No', label: getText('standard-ui.buttons.no', {}, appState.language) },
      ],
      selectedValue: appState.sameSizeAns,
      correctValue: appState.sameSizeAns === 'No' ? 'No' : null,
      wrongValue: appState.wrongValue,
      pulsate: appState.sameSizeAns !== 'No',
      disabled: appState.sameSizeAns === 'No',
      onSelect: onSelect,
    });

    const stage = h(
      'div',
      { className: 'activity-stage' },
      bothBarsStack({
        shadedSmall: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
        shadedLarge: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
        outlinePulse: isWrongRetry,
      }),
      h('div', { className: 'activity-controls' }, optionRow)
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: getText('standard-ui.instructions.tap_correct', {}, appState.language),
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S12 – Nice! Different sizes (auto pulse outlines, then enable Next). */
  function buildScreen12() {
    const lines = [
      getText('content-ui.dialogs.s12_line_1', {}, appState.language),
      getText('content-ui.dialogs.s12_line_2', {}, appState.language),
    ];
    schedulePassiveAdvance(13, 4000, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      bothBarsStack({
        shadedSmall: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
        shadedLarge: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
        outlinePulse: true,
      })
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S13 – Why different amounts? (pulse both bars) */
  function buildScreen13() {
    const lines = [
      getText('content-ui.dialogs.s13_line_1', {}, appState.language),
      getText('content-ui.dialogs.s13_line_2', {}, appState.language),
    ];
    const hint = getText('content-ui.dialogs.s13_hint', {}, appState.language);
    schedulePassiveAdvance(14, 4000, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      bothBarsStack({
        shadedSmall: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
        shadedLarge: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
        outlinePulse: true,
      })
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: hint,
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S14 – Compare 1/2 of both. */
  function buildScreen14() {
    const lines = [getText('content-ui.dialogs.s14_line_1', {}, appState.language)];
    const compareLabel = getText('standard-ui.buttons.compare', {}, appState.language);

    const onCompare = () => {
      if (window.sound) window.sound.playClickSound();
      goToStep(15, { navBackMode: false });
    };

    const stage = h(
      'div',
      { className: 'activity-stage' },
      bothBarsStack({
        shadedSmall: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
        shadedLarge: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
      }),
      h(
        'div',
        { className: 'activity-controls' },
        AppletButton({
          label: compareLabel,
          variant: 'active',
          impending: 'clickNext',
          disabled: false,
          onClick: onCompare,
        })
      )
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: getText('content-ui.dialogs.s14_hint', {}, appState.language),
      canPrev: canGoPrev(appState),
      canNext: false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S15 – Slide animation: small bar moves so its top-left meets the large bar's top-left. */
  function buildScreen15() {
    if (!appState.navBackMode && appState.overlapPhase === 'done' && autoTimer == null) {
      scheduleAuto(700, () => goToStep(16));
    }

    const lines = [getText('content-ui.dialogs.s15_line_1', {}, appState.language)];
    const delta = appState.s15SlideDelta;
    const slideActive = delta != null && appState.overlapPhase === 'animating';
    const smallHalf = appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0;
    const largeHalf = appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0;

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s15',
          size: 'small',
          parts: 2,
          shadedIndex: smallHalf,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
          pulseSegment: slideActive ? smallHalf : null,
          outlinePulse: slideActive,
          staggerPulse: slideActive,
          sliding: slideActive ? { dx: delta.dx, dy: delta.dy, scale: 1, keyframes: true, origin: 'top left', duration: OVERLAP_ANIMATION_DURATION } : null,
          faded: appState.overlapPhase === 'animating',
        }),
        ChocolateBar({
          id: 'large-s15',
          size: 'large',
          parts: 2,
          shadedIndex: largeHalf,
          dimUnshaded: true,
          pulseSegment: slideActive ? largeHalf : null,
          outlinePulse: slideActive,
          staggerPulse: slideActive,
          fractionLabel: { num: '1', den: '2' },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: getText('standard-ui.instructions.watch', {}, appState.language),
      canPrev: canGoPrev(appState),
      canNext: appState.overlapPhase === 'done',
      onPrev: goPrev,
      onNext: goNext,
    });
  }

  /* S16 – Compare 1/2 of both bars (overlapped state). */
  function buildScreen16() {
    const lines = [getText('content-ui.dialogs.s16_line_1', {}, appState.language)];
    const smallerLabel = getText('standard-ui.labels.smaller_half', {}, appState.language);
    const biggerLabel = getText('standard-ui.labels.bigger_half', {}, appState.language);
    const smallHalf = appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0;
    const largeHalf = appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0;
    schedulePassiveAdvance(17, 4000, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s16',
          size: 'small',
          parts: 2,
          shadedIndex: smallHalf,
          dimUnshaded: true,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
          segmentLabels: { [smallHalf]: smallerLabel },
        }),
        ChocolateBar({
          id: 'large-s16',
          size: 'large',
          parts: 2,
          shadedIndex: largeHalf,
          dimUnshaded: true,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
          segmentLabels: { [largeHalf]: biggerLabel },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S17 – Smaller half / Bigger half labels appear, bigger half pulses. */
  function buildScreen17() {
    const lines = [getText('content-ui.dialogs.s17_line_1', {}, appState.language)];
    const smallerLabel = getText('standard-ui.labels.smaller_half', {}, appState.language);
    const biggerLabel = getText('standard-ui.labels.bigger_half', {}, appState.language);
    const smallHalf = appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0;
    const largeHalf = appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0;
    schedulePassiveAdvance(18, 5200, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        h(
          'div',
          { className: 'bar-with-callout' },
          ChocolateBar({
            id: 'small-s17',
            size: 'small',
            parts: 2,
            shadedIndex: smallHalf,
            dimUnshaded: true,
            pulseSegment: smallHalf,
            outlinePulse: true,
            outlinePulseDelay: '2s',
            fractionLabel: { num: '1', den: '2' },
            segmentLabels: { [smallHalf]: smallerLabel },
          })
        ),
        h(
          'div',
          { className: 'bar-with-callout' },
          ChocolateBar({
            id: 'large-s17',
            size: 'large',
            parts: 2,
            shadedIndex: largeHalf,
            dimUnshaded: true,
            pulseSegment: largeHalf,
            outlinePulse: true,
            outlinePulseDelay: '2s',
            fractionLabel: { num: '1', den: '2' },
            segmentLabels: { [largeHalf]: biggerLabel },
          })
        )
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S18 – "1/2 of bigger > 1/2 of smaller". Highlight bigger half + label. */
  function buildScreen18() {
    const lines = [getText('content-ui.dialogs.s18_line_1', {}, appState.language)];
    schedulePassiveAdvance(19, 4000, lines);
    const smallerLabel = getText('standard-ui.labels.smaller_half', {}, appState.language);
    const biggerLabel = getText('standard-ui.labels.bigger_half', {}, appState.language);
    const smallHalf = appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0;
    const largeHalf = appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0;

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s18',
          size: 'small',
          parts: 2,
          shadedIndex: smallHalf,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
          pulseFraction: false,
          segmentLabels: { [smallHalf]: smallerLabel },
        }),
        ChocolateBar({
          id: 'large-s18',
          size: 'large',
          parts: 2,
          shadedIndex: largeHalf,
          dimUnshaded: true,
          pulseSegment: largeHalf,
          fractionLabel: { num: '1', den: '2' },
          pulseFraction: true,
          segmentLabels: { [largeHalf]: biggerLabel },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S19 – "Same fraction can show different amounts if wholes differ" */
  function buildScreen19() {
    const lines = [getText('content-ui.dialogs.s19_line_1', {}, appState.language)];
    schedulePassiveAdvance(20, 4000, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      bothBarsStack({
        shadedSmall: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
        shadedLarge: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
        pulseLargeHalf: true,
        pulseSmallHalf: true,
        pulseFractions: true,
        showSmallerBiggerLabels: true,
      })
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S20 – "Not fair to compare these fractions" */
  function buildScreen20() {
    const lines = [getText('content-ui.dialogs.s20_line_1', {}, appState.language)];
    schedulePassiveAdvance(21, 4000, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      bothBarsStack({
        shadedSmall: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
        shadedLarge: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
        showSmallerBiggerLabels: true,
      })
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S21 – Rule: "Fractions can be compared fairly only when…" */
  function buildScreen21() {
    const lines = [getText('content-ui.dialogs.s21_line_1', {}, appState.language)];
    schedulePassiveAdvance(22, 4000, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      bothBarsStack({
        shadedSmall: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
        shadedLarge: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
        showSmallerBiggerLabels: true,
      })
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* =========================================================
   * Group C: Make-same-size + 1/2 vs 1/3 + closure (S22-S32)
   * ========================================================= */

  /* S22 – Make Same Size: tap a bar to select, then tap CTA to resize. */
  function buildScreen22() {
    const lines = [getText('content-ui.dialogs.s22_line_1', {}, appState.language)];
    const hint = getText('content-ui.dialogs.s22_hint', {}, appState.language);
    const ctaLabel = getText('standard-ui.buttons.make_same_size', {}, appState.language);
    if (appState.wholesNormalized && !appState.resizingNow) {
      schedulePassiveAdvance(23, 4000, lines);
    }

    const onSelectBar = (which) => {
      if (appState.wholesNormalized) return;
      if (window.sound) window.sound.playClickSound();
      setState({ selectedBarForResize: which });
    };

    const onResize = () => {
      if (!appState.selectedBarForResize || appState.wholesNormalized) return;
      const selectedBar = appState.selectedBarForResize;
      if (window.sound) window.sound.playClickSound();
      setState({
        resizingNow: true,
        wholesNormalized: true,
        equalizedSize: selectedBar === 'large' ? 'small' : 'large',
      });
      scheduleAuto(1200, () => {
        if (window.sound) window.sound.playCorrectSound();
        setState({ resizingNow: false });
      });
    };

    const targetSize = appState.equalizedSize || (appState.selectedBarForResize === 'large' ? 'small' : 'large');
    const smallIsLarge = appState.wholesNormalized && targetSize === 'large';
    const largeIsSmall = appState.wholesNormalized && targetSize === 'small';

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s22',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: !appState.selectedBarForResize,
          outlinePulse: appState.selectedBarForResize === 'small' && !appState.wholesNormalized,
          selected: appState.selectedBarForResize === 'small' && !appState.wholesNormalized,
          normalized: smallIsLarge,
          resizeAnimation: appState.resizingNow && appState.selectedBarForResize === 'small'
            ? { fromSize: 300, toSize: 460, duration: '1.2s' }
            : null,
          onTapBar: !appState.wholesNormalized ? () => onSelectBar('small') : null,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'large-s22',
          size: largeIsSmall ? 'small' : 'large',
          parts: 2,
          shadedIndex: appState.pickedHalfLarge != null ? appState.pickedHalfLarge : 0,
          dimUnshaded: !appState.selectedBarForResize,
          outlinePulse: appState.selectedBarForResize === 'large' && !appState.wholesNormalized,
          selected: appState.selectedBarForResize === 'large' && !appState.wholesNormalized,
          resizeAnimation: appState.resizingNow && appState.selectedBarForResize === 'large'
            ? { fromSize: 460, toSize: 300, duration: '1.2s' }
            : null,
          onTapBar: !appState.wholesNormalized ? () => onSelectBar('large') : null,
          fractionLabel: { num: '1', den: '2' },
        })
      ),
      h(
        'div',
        { className: 'activity-controls' },
        AppletButton({
          label: ctaLabel,
          variant: 'active',
          impending: appState.selectedBarForResize && !appState.wholesNormalized ? 'clickNext' : '',
          disabled: !appState.selectedBarForResize || appState.wholesNormalized || appState.resizingNow,
          onClick: onResize,
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: appState.wholesNormalized ? '' : hint,
      canPrev: canGoPrev(appState),
      canNext: appState.resizingNow
        ? false
        : (appState.wholesNormalized
          ? (appState.navBackMode ? canGoNext(appState) : false)
          : canGoNext(appState)),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: !appState.wholesNormalized,
    });
  }

  /* S23 – both bars equalized; tap next to compare halves. */
  function buildScreen23() {
    const lines = [
      getText('content-ui.dialogs.s23_line_1', {}, appState.language),
      getText('content-ui.dialogs.s23_line_2', {}, appState.language),
    ];
    const hint = getText('content-ui.dialogs.s23_hint', {}, appState.language);
    const equalizedSmall = appState.equalizedSize === 'small';
    const li = appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0;

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'small-s23-intro',
          size: 'small',
          parts: 2,
          shadedIndex: li,
          dimUnshaded: true,
          normalized: !equalizedSmall,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'large-s23-intro',
          size: equalizedSmall ? 'small' : 'large',
          parts: 2,
          shadedIndex: li,
          dimUnshaded: true,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: hint,
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S24 – choose '=' on equal-size bars. */
  function buildScreen24() {
    const isCorrectChoice =
      appState.comparedSymbol === '=' || appState.s23OverlapVariant === 'correct';
    /* only show corrective hint for actual wrong-answer animation, not correct */
    const showWrongHint = !isCorrectChoice
      && appState.s23OverlapVariant === 'wrong'
      && (appState.s23OverlapPhase === 'animating' || appState.s23OverlapPhase === 'pending');
    const showCorrectResult = isCorrectChoice;
    const lines = showCorrectResult
      ? [getText('content-ui.dialogs.s25_line_1', {}, appState.language)]
      : showWrongHint
      ? [
          getText('content-ui.dialogs.s24_line_1', {}, appState.language),
          getText('content-ui.dialogs.s24_line_2', {}, appState.language),
        ]
      : [
          getText('content-ui.dialogs.s24_compare_line_1', {}, appState.language),
        ];
    const hint = getText('standard-ui.instructions.choose_symbol', {}, appState.language);

    const onSelect = (val) => {
      if (window.sound) window.sound.playClickSound();
      if (
        appState.s23OverlapPhase === 'pending'
        || appState.s23OverlapPhase === 'animating'
      ) {
        return;
      }
      if (val === '=') {
        if (window.sound) window.sound.playCorrectSound();
        setState({
          comparedSymbol: '=',
          feedback: 'correct',
          wrongValue: null,
          s23OverlapPhase: 'pending',
          s23OverlapDelta: null,
          s23OverlapVariant: 'correct',
          symbolStripCollapsed: false,
        });
      } else {
        if (window.sound) window.sound.playWrongSound();
        setState({
          feedback: 'wrong',
          wrongValue: val,
          s23OverlapPhase: 'pending',
          s23OverlapDelta: null,
          s23OverlapVariant: 'wrong',
        });
        /* reset clears after the full overlap animation finishes, not immediately */
      }
    };

    const overlapAnimating =
      appState.s23OverlapPhase === 'pending' || appState.s23OverlapPhase === 'animating';
    const d = appState.s23OverlapDelta;
    /* always use the same full-reach animation regardless of correct/wrong */
    const slideOpts =
      d != null && appState.s23OverlapPhase === 'animating'
        ? { dx: d.dx, dy: d.dy, misalign: false, duration: OVERLAP_ANIMATION_DURATION }
        : null;
    /* segment index to glow on both bars while they're overlapping */
    const glowSeg = appState.s23OverlapPhase === 'animating'
      ? (appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0)
      : null;

    const strip = SymbolStrip({
      selectedValue: isCorrectChoice ? '=' : appState.comparedSymbol,
      correctValue: isCorrectChoice ? '=' : null,
      wrongValue: appState.wrongValue,
      pulsate: !isCorrectChoice,
      disabled: isCorrectChoice,
      interactionLocked: overlapAnimating,
      collapseToSelected: appState.symbolStripCollapsed,
      onSelect: onSelect,
    });

    const equalizedSmall = appState.equalizedSize === 'small';

    /* both bars are now the same size chosen by the resize interaction */
    const stage = h(
      'div',
      { className: 'activity-stage activity-overlap-visible' },
      h(
        'div',
        { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({
          id: 'small-s23',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          normalized: !equalizedSmall,
          fractionLabel: { num: '1', den: '2' },
          pulseSegment: glowSeg,
          segmentSlide: slideOpts
            ? {
              index: glowSeg != null ? glowSeg : (appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0),
              dx: slideOpts.dx,
              dy: slideOpts.dy,
              duration: slideOpts.duration,
              misalign: false,
            }
            : null,
        }),
        h('div', { className: 'symbol-strip-slot' }, strip),
        ChocolateBar({
          id: 'large-s23',
          size: equalizedSmall ? 'small' : 'large',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
          pulseSegment: glowSeg,
        })
      )
    );

    return buildActivityShell({
      character: showCorrectResult ? 'paheli' : 'boojho',
      lines: lines,
      allowOverlapOverflow: true,
      activityArea: stage,
      footerCenter: isCorrectChoice ? '' : hint,
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode || appState.s23OverlapPhase === 'done'
        ? canGoNext(appState)
        : (isCorrectChoice ? false : canGoNext(appState)),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: !isCorrectChoice,
    });
  }

  /* S25 – overlap check */
  function buildScreen25() {
    const lines = [getText('content-ui.dialogs.s25_line_1', {}, appState.language)];
    schedulePassiveAdvance(26, 5200, lines);
    const equalizedSmall = appState.equalizedSize === 'small';

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({
          id: 'small-s24',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          normalized: !equalizedSmall,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        h('div', { className: 'symbol-strip-slot' }, SymbolStrip({
          selectedValue: '=',
          correctValue: '=',
          disabled: true,
          collapseToSelected: true,
        })),
        ChocolateBar({
          id: 'large-s24',
          size: equalizedSmall ? 'small' : 'large',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S26 – Result "=" auto-transition with a longer reading pause. */
  function buildScreen26() {
    const lines = [getText('content-ui.dialogs.s25_line_1', {}, appState.language)];

    if (!appState.navBackMode && autoTimer == null && ensureTypewriter(lines)) {
      scheduleAuto(4200, () => goToStep(27));
    }
    const equalizedSmall = appState.equalizedSize === 'small';

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({
          id: 'small-s25',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          normalized: !equalizedSmall,
          fractionLabel: { num: '1', den: '2' },
        }),
        h('div', { className: 'symbol-strip-slot' }, SymbolStrip({
          selectedValue: '=',
          correctValue: '=',
          disabled: true,
          collapseToSelected: true,
        })),
        ChocolateBar({
          id: 'large-s25',
          size: equalizedSmall ? 'small' : 'large',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
        })
      ),
      FeedbackBanner({ variant: 'correct', text: getText('content-ui.feedback.well_done', {}, appState.language) })
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S27 – Reinforce rule */
  function buildScreen27() {
    const lines = [getText('content-ui.dialogs.s26_line_1', {}, appState.language)];
    const equalizedSmall = appState.equalizedSize === 'small';

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({
          id: 'small-s26',
          size: 'small',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          normalized: !equalizedSmall,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        h('div', { className: 'symbol-strip-slot' }, SymbolStrip({
          selectedValue: '=',
          correctValue: '=',
          disabled: true,
          collapseToSelected: true,
        })),
        ChocolateBar({
          id: 'large-s26',
          size: equalizedSmall ? 'small' : 'large',
          parts: 2,
          shadedIndex: appState.pickedHalfSmall != null ? appState.pickedHalfSmall : 0,
          dimUnshaded: true,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: getText('content-ui.dialogs.s26_hint', {}, appState.language),
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S28 – Bridge: "Now we know fractions need same-sized wholes. Let's look at two different fractions." */
  function buildScreen28() {
    const lines = [
      getText('content-ui.dialogs.s27_bridge_line_1', {}, appState.language),
      getText('content-ui.dialogs.s27_bridge_line_2', {}, appState.language),
    ];
    return buildActivityShell({
      character: 'boojho',
      lines: [],
      activityArea: buildNarrativeStage(lines),
      footerCenter: 'Tap » to continue.',
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S29 – New case 1/2 vs 1/3, two equally sized bars */
  function buildScreen29() {
    const lines = [
      getText('content-ui.dialogs.s27_line_1', {}, appState.language),
      getText('content-ui.dialogs.s27_line_2', {}, appState.language),
    ];
    const hint = getText('content-ui.dialogs.s27_hint', {}, appState.language);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'oneHalf-s27',
          size: 'large',
          parts: 2,
          shadedIndex: 0,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'oneThird-s27',
          size: 'large',
          parts: 3,
          shadedIndex: 0,
          dimUnshaded: true,
          fractionLabel: { num: '1', den: '3' },
        })
      )
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      activityArea: stage,
      footerCenter: hint,
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S30 – "Same size?" yes/no, expectedValue='Yes' */
  function buildScreen30() {
    const isWrongRetry = appState.feedback === 'wrong';
    const lines = isWrongRetry
      ? [getText('content-ui.dialogs.s11_line_1', {}, appState.language)]
      : [
          getText('content-ui.dialogs.s28_line_1', {}, appState.language),
          getText('content-ui.dialogs.s28_line_2', {}, appState.language),
        ];
    if (appState.sameSizeAns2 === 'Yes') {
      schedulePassiveAdvance(31, 2000, lines);
    }

    const onSelect = (val) => {
      if (window.sound) window.sound.playClickSound();
      if (val === 'Yes') {
        if (window.sound) window.sound.playCorrectSound();
        setState({ sameSizeAns2: 'Yes', feedback: 'correct', wrongValue: null });
      } else {
        if (window.sound) window.sound.playWrongSound();
        setState({ feedback: 'wrong', wrongValue: 'No' });
        scheduleAuto(3000, () => setState({ feedback: null, wrongValue: null }));
      }
    };

    const optionRow = OptionRow({
      yesNo: true,
      options: [
        { value: 'Yes', label: getText('standard-ui.buttons.yes', {}, appState.language) },
        { value: 'No', label: getText('standard-ui.buttons.no', {}, appState.language) },
      ],
      selectedValue: appState.sameSizeAns2,
      correctValue: appState.sameSizeAns2 === 'Yes' ? 'Yes' : null,
      wrongValue: appState.wrongValue,
      pulsate: appState.sameSizeAns2 !== 'Yes',
      disabled: appState.sameSizeAns2 === 'Yes',
      onSelect: onSelect,
    });

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'oneHalf-s28',
          size: 'large',
          parts: 2,
          shadedIndex: 0,
          dimUnshaded: true,
          outlinePulse: isWrongRetry,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'oneThird-s28',
          size: 'large',
          parts: 3,
          shadedIndex: 0,
          dimUnshaded: true,
          outlinePulse: isWrongRetry,
          fractionLabel: { num: '1', den: '3' },
        })
      ),
      h('div', { className: 'activity-controls' }, optionRow)
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: getText('standard-ui.instructions.tap_correct', {}, appState.language),
      canPrev: canGoPrev(appState),
      canNext: false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: appState.sameSizeAns2 !== 'Yes',
    });
  }

  /* S31 – overlap whole confirms equality, auto-advance */
  function buildScreen31() {
    const lines = [
      getText('content-ui.dialogs.s29_line_1', {}, appState.language),
      getText('content-ui.dialogs.s29_line_2', {}, appState.language),
    ];
    const delta = appState.s29SlideDelta;
    const slideActive = delta != null && appState.overlapPhase === 'animating';

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack' },
        ChocolateBar({
          id: 'oneHalf-s29',
          size: 'large',
          parts: 2,
          shadedIndex: 0,
          dimUnshaded: true,
          outlinePulse: appState.overlapPhase !== 'idle',
          pulseSegment: slideActive ? 0 : null,
          fractionLabel: { num: '1', den: '2' },
        }),
        ChocolateBar({
          id: 'oneThird-s29',
          size: 'large',
          parts: 3,
          shadedIndex: 0,
          dimUnshaded: true,
          outlinePulse: appState.overlapPhase !== 'idle',
          fractionLabel: { num: '1', den: '3' },
          pulseSegment: slideActive ? 0 : null,
          sliding: slideActive
            ? { dx: delta.dx, dy: delta.dy, scale: 1, keyframes: true, origin: 'top left', duration: OVERLAP_ANIMATION_DURATION }
            : null,
          faded: appState.overlapPhase === 'animating',
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: getText('content-ui.dialogs.s26_hint', {}, appState.language),
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S32 – choose '>' between 1/2 and 1/3 */
  function buildScreen32() {
    const lines = [
      getText('content-ui.dialogs.s30_line_1', {}, appState.language),
      getText('content-ui.dialogs.s30_line_2', {}, appState.language),
    ];
    const hint = getText('standard-ui.instructions.choose_symbol', {}, appState.language);

    const onSelect = (val) => {
      if (window.sound) window.sound.playClickSound();
      if (
        appState.s30OverlapPhase === 'pending'
        || appState.s30OverlapPhase === 'animating'
      ) {
        return;
      }
      if (val === '>') {
        if (window.sound) window.sound.playCorrectSound();
        setState({
          comparedSymbol2: '>',
          feedback: 'correct',
          wrongValue: null,
          s30OverlapPhase: 'pending',
          s30OverlapDelta: null,
          s30OverlapVariant: 'correct',
        });
      } else {
        if (window.sound) window.sound.playWrongSound();
        setState({
          feedback: 'wrong',
          wrongValue: val,
          s30OverlapPhase: 'pending',
          s30OverlapDelta: null,
          s30OverlapVariant: 'wrong',
        });
        /* reset clears after the full overlap animation finishes, not immediately */
      }
    };

    const overlapAnimating =
      appState.s30OverlapPhase === 'pending' || appState.s30OverlapPhase === 'animating';
    const d30 = appState.s30OverlapDelta;
    /* always full-reach animation regardless of correct/wrong */
    const slide30 =
      d30 != null && appState.s30OverlapPhase === 'animating'
        ? { dx: d30.dx, dy: d30.dy, misalign: false, duration: OVERLAP_ANIMATION_DURATION }
        : null;
    /* segment to glow on both bars while overlapping */
    const glowSeg30 = appState.s30OverlapPhase === 'animating' ? 0 : null;

    const strip30 = SymbolStrip({
      selectedValue: appState.comparedSymbol2,
      correctValue: appState.comparedSymbol2 === '>' ? '>' : null,
      wrongValue: appState.wrongValue,
      pulsate: appState.comparedSymbol2 !== '>',
      disabled: appState.comparedSymbol2 === '>',
      interactionLocked: overlapAnimating,
      collapseToSelected: appState.comparedSymbol2 === '>',
      onSelect: onSelect,
    });

    const stage = h(
      'div',
      { className: 'activity-stage activity-overlap-visible' },
      h(
        'div',
        { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({
          id: 'oneHalf-s30',
          size: 'large',
          parts: 2,
          shadedIndex: 0,
          dimUnshaded: true,
          pulsateHalves: appState.comparedSymbol2 !== '>'
            && appState.s30OverlapPhase === 'idle',
          fractionLabel: { num: '1', den: '2' },
          pulseSegment: glowSeg30,
          outlinePulse: appState.s30OverlapPhase === 'animating',
        }),
        h('div', { className: 'symbol-strip-slot' }, strip30),
        ChocolateBar({
          id: 'oneThird-s30',
          size: 'large',
          parts: 3,
          shadedIndex: 0,
          dimUnshaded: true,
          pulsateHalves: appState.comparedSymbol2 !== '>'
            && appState.s30OverlapPhase === 'idle',
          fractionLabel: { num: '1', den: '3' },
          pulseSegment: glowSeg30,
          outlinePulse: appState.s30OverlapPhase === 'animating',
          segmentSlide: slide30
            ? { index: 0, dx: slide30.dx, dy: slide30.dy, duration: slide30.duration, misalign: false }
            : null,
        })
      )
    );

    return buildActivityShell({
      character: 'boojho',
      lines: lines,
      allowOverlapOverflow: true,
      activityArea: stage,
      footerCenter: appState.comparedSymbol2 === '>' ? '' : hint,
      canPrev: canGoPrev(appState),
      canNext: appState.comparedSymbol2 === '>' ? false : canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: appState.comparedSymbol2 !== '>',
    });
  }

  /* S33 – "One-half covers more area than one-third" */
  function buildScreen33() {
    const lines = [
      getText('content-ui.dialogs.s31_line_1', {}, appState.language),
    ];
    schedulePassiveAdvance(34, 4000, lines);

    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({
          id: 'oneHalf-s31',
          size: 'large',
          parts: 2,
          shadedIndex: 0,
          dimUnshaded: true,
          pulseSegment: 0,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
        }),
        h('div', { className: 'symbol-strip-slot' }, SymbolStrip({
          selectedValue: '>',
          correctValue: '>',
          disabled: true,
          collapseToSelected: true,
          onSelect: () => {},
        })),
        ChocolateBar({
          id: 'oneThird-s31',
          size: 'large',
          parts: 3,
          shadedIndex: 0,
          dimUnshaded: true,
          pulseSegment: 0,
          fractionLabel: { num: '1', den: '3' },
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: appState.navBackMode ? canGoNext(appState) : false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* S34 – "1/2 is bigger than 1/3" (with bars) */
  function buildScreen34() {
    const lines = [
      getText('content-ui.dialogs.s31_line_2', {}, appState.language),
    ];
    const stage = h(
      'div',
      { className: 'activity-stage' },
      h(
        'div',
        { className: 'bars-stack bars-stack--with-symbol' },
        ChocolateBar({
          id: 'oneHalf-s33',
          size: 'large',
          parts: 2,
          shadedIndex: 0,
          dimUnshaded: true,
          pulseSegment: 0,
          outlinePulse: true,
          fractionLabel: { num: '1', den: '2' },
          pulseFraction: true,
        }),
        h('div', { className: 'symbol-strip-slot' }, SymbolStrip({
          selectedValue: '>',
          correctValue: '>',
          disabled: true,
          collapseToSelected: true,
          onSelect: () => {},
        })),
        ChocolateBar({
          id: 'oneThird-s33',
          size: 'large',
          parts: 3,
          shadedIndex: 0,
          dimUnshaded: true,
          pulseSegment: 0,
          fractionLabel: { num: '1', den: '3' },
        })
      )
    );
    return buildActivityShell({
      character: 'paheli',
      lines: lines,
      activityArea: stage,
      footerCenter: 'Tap » to continue.',
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S35 – Boojho: "Now I understand! Before comparing fractions..." */
  function buildScreen35() {
    const lines = [
      getText('content-ui.dialogs.s32_line_1', {}, appState.language),
      getText('content-ui.dialogs.s32_line_2', {}, appState.language),
    ];
    return buildActivityShell({
      character: 'boojho',
      lines: [],
      activityArea: buildNarrativeStage(lines),
      footerCenter: 'Tap » to continue.',
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S36 – Paheli: "That's right! Fractions can be compared fairly..." */
  function buildScreen36() {
    const lines = [
      getText('content-ui.dialogs.s32_line_3', {}, appState.language),
    ];
    return buildActivityShell({
      character: 'paheli',
      lines: [],
      activityArea: buildNarrativeStage(lines),
      footerCenter: 'Tap » to continue.',
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S37 – Boojho: "Now, can different fractions of the same whole be equal?" */
  function buildScreen37() {
    const lines = [
      getText('content-ui.dialogs.s36_line_1', {}, appState.language),
    ];
    return buildActivityShell({
      character: 'boojho',
      lines: [],
      activityArea: buildNarrativeStage(lines),
      footerCenter: 'Tap » to continue.',
      canPrev: canGoPrev(appState),
      canNext: canGoNext(appState),
      onPrev: goPrev,
      onNext: goNext,
      glowNext: true,
    });
  }

  /* S38 – Paheli: "That's an interesting question! Let's explore it next." + Start Over */
  function buildScreen38() {
    const lines = [
      getText('content-ui.dialogs.s37_line_1', {}, appState.language),
    ];
    const restartLabel = getText('standard-ui.buttons.restart', {}, appState.language);

    const handleRestart = () => {
      if (window.sound) window.sound.playClickSound();
      goToStep(1, {
        phase: 'splash',
        pickedParts: null, pickedPartsBig: null,
        pickedHalfSmall: null, pickedHalfLarge: null,
        sameSizeAns: null, sameSizeAns2: null,
        comparedSymbol: null, comparedSymbol2: null,
        selectedBarForResize: null, resizingNow: false,
        wholesNormalized: false, equalizedSize: null,
        overlapPhase: 'idle',
        s15SlideDelta: null, s29SlideDelta: null,
        s23OverlapPhase: 'idle', s23OverlapDelta: null, s23OverlapVariant: null,
        symbolStripCollapsed: false,
        s30OverlapPhase: 'idle', s30OverlapDelta: null, s30OverlapVariant: null,
        navBackMode: false, feedback: null, wrongValue: null,
      });
    };

    const tryAgainLabel = getText('content-ui.dialogs.s37_try_again', {}, appState.language);
    const activityArea = h(
      'div',
      { className: 'activity-stage' },
      buildNarrativeStage(lines),
      h(
        'div',
        { className: 'activity-controls activity-controls--try-again' },
        h('div', { className: 'try-again-label' }, tryAgainLabel),
        AppletButton({
          label: restartLabel,
          variant: 'active',
          impending: 'clickNext',
          disabled: false,
          onClick: handleRestart,
        })
      )
    );

    return buildActivityShell({
      character: 'paheli',
      lines: [],
      activityArea: activityArea,
      footerCenter: '',
      canPrev: canGoPrev(appState),
      canNext: false,
      onPrev: goPrev,
      onNext: goNext,
      glowNext: false,
    });
  }

  /* Match S15/S29 overlap: convert viewport pixel delta to pre-scale CSS pixels.
     getBoundingClientRect() returns screen px (post-scale), but CSS translate on elements
     inside the scaled container operates in pre-scale CSS px, so we must divide by scaleFactor. */
  function getScaleFactor() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scaleFactor')) || 1;
  }
  function segmentOverlapDeltaClientPx(sourceAnchorEl, targetAnchorEl) {
    const sf = getScaleFactor();
    const sr = sourceAnchorEl.getBoundingClientRect();
    const tr = targetAnchorEl.getBoundingClientRect();
    return { dx: (tr.left - sr.left) / sf, dy: (tr.top - sr.top) / sf };
  }

  /* ---------------- App switch ---------------- */
  function App() {
    if (appState.phase === 'splash') return buildSplashScreen();
    if (appState.phase === 'final') return buildScreen37();
    switch (appState.step) {
      case 2: return buildScreen2();
      case 3: return buildScreen3();
      case 4: return buildScreen4();
      case 5: return buildScreen5();
      case 6: return buildScreen6();
      case 7: return buildScreen7or8();
      case 8: return buildScreen7or8();
      case 9: return buildScreen9();
      case 10: return buildScreen10();
      case 11: return buildScreen10();
      case 12: return buildScreen12();
      case 13: return buildScreen13();
      case 14: return buildScreen14();
      case 15: return buildScreen15();
      case 16: return buildScreen16();
      case 17: return buildScreen17();
      case 18: return buildScreen18();
      case 19: return buildScreen19();
      case 20: return buildScreen20();
      case 21: return buildScreen21();
      case 22: return buildScreen22();
      case 23: return buildScreen23();
      case 24: return buildScreen24();
      case 25: return buildScreen25();
      case 26: return buildScreen26();
      case 27: return buildScreen27();
      case 28: return buildScreen28();
      case 29: return buildScreen29();
      case 30: return buildScreen30();
      case 31: return buildScreen31();
      case 32: return buildScreen32();
      case 33: return buildScreen33();
      case 34: return buildScreen34();
      case 35: return buildScreen35();
      case 36: return buildScreen36();
      case 37: return buildScreen37();
      case 38: return buildScreen38();
      default: return buildSplashScreen();
    }
  }

  function renderApp() {
    const root = document.getElementById('app');
    if (!root) return;
    renderInProgress = true;
    let tree = null;
    try {
      tree = App();
    } finally {
      renderInProgress = false;
    }
    root.innerHTML = '';
    if (tree) root.appendChild(tree);

    /* S15/S29: measure source vs target top-left delta, then run keyframe overlap slide. */
    if (
      appState.step === 15 &&
      appState.overlapPhase === 'idle' &&
      appState.s15SlideDelta == null
    ) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const st = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
          if (!st || st.step !== 15 || st.overlapPhase !== 'idle' || st.s15SlideDelta != null) return;
          const small = document.querySelector('[data-bar-id="small-s15"]');
          const large = document.querySelector('[data-bar-id="large-s15"]');
          if (!small || !large) return;
          const sf15 = getScaleFactor();
          const sr = small.getBoundingClientRect();
          const lr = large.getBoundingClientRect();
          setState({
            s15SlideDelta: { dx: (lr.left - sr.left) / sf15, dy: (lr.top - sr.top) / sf15 },
            overlapPhase: 'animating',
          });
          scheduleAuto(OVERLAP_ANIMATION_MS, () => setState({ overlapPhase: 'done' }));
        });
      });
    }
    if (
      appState.step === 31 &&
      appState.overlapPhase === 'idle' &&
      appState.s29SlideDelta == null
    ) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const st = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
          if (!st || st.step !== 31 || st.overlapPhase !== 'idle' || st.s29SlideDelta != null) return;
          const source = document.querySelector('[data-bar-id="oneThird-s29"]');
          const target = document.querySelector('[data-bar-id="oneHalf-s29"]');
          if (!source || !target) return;
          const sf29 = getScaleFactor();
          const sr = source.getBoundingClientRect();
          const tr = target.getBoundingClientRect();
          setState({
            s29SlideDelta: { dx: (tr.left - sr.left) / sf29, dy: (tr.top - sr.top) / sf29 },
            overlapPhase: 'animating',
          });
          scheduleAuto(OVERLAP_ANIMATION_MS, () => setState({ overlapPhase: 'done' }));
        });
      });
    }

    /* S23 — measure shaded halves, then animate overlap or mis-aligned preview */
    if (
      appState.step === 24
      && appState.s23OverlapPhase === 'pending'
      && appState.s23OverlapDelta == null
    ) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const st = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
          if (!st || st.step !== 24 || st.s23OverlapPhase !== 'pending' || st.s23OverlapDelta != null) return;
          const leftWrap = document.querySelector('[data-bar-id="small-s23"]');
          const rightWrap = document.querySelector('[data-bar-id="large-s23"]');
          if (!leftWrap || !rightWrap) return;
          const li = st.pickedHalfSmall != null ? st.pickedHalfSmall : 0;
          const ri = st.pickedHalfLarge != null ? st.pickedHalfLarge : 0;
          const leftG = leftWrap.querySelector('g[data-segment-index="' + li + '"]');
          const rightG = rightWrap.querySelector('g[data-segment-index="' + li + '"]');
          if (!leftG || !rightG) return;
          const leftInner = leftG.querySelector('.chocolate-segment-body');
          if (!leftInner) return;
          const rightInner = rightG.querySelector('.chocolate-segment-body');
          const leftAnchor = (leftInner.querySelector && leftInner.querySelector('rect'))
            ? leftInner.querySelector('rect')
            : leftG.querySelector('rect') || leftG;
          const rightAnchor = rightInner && rightInner.querySelector
            ? (rightInner.querySelector('rect') || rightG.querySelector('rect') || rightG)
            : (rightG.querySelector('rect') || rightG);
          const delta = segmentOverlapDeltaClientPx(leftAnchor, rightAnchor);
          const dx = delta.dx;
          const dy = delta.dy;
          const variant = st.s23OverlapVariant;
          setState(Object.assign({
              s23OverlapDelta: { dx: dx, dy: dy },
              s23OverlapPhase: 'animating',
            },
            variant === 'correct' ? { comparedSymbol: '=', wrongValue: null, feedback: 'correct' } : {}
          ));
          if (variant === 'correct') scheduleSymbolCollapse();
          /* Same full animation for any symbol choice. */
          scheduleAuto(OVERLAP_ANIMATION_MS, () => {
            const cur = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
            if (!cur || cur.step !== 24 || cur.navBackMode) return;
            if (variant === 'correct') {
              setState({ s23OverlapPhase: 'done' });
              scheduleAuto(1000, () => {
                const c2 = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
                if (!c2 || c2.step !== 24 || c2.navBackMode) return;
                goToStep(25, { navBackMode: false });
              });
            } else {
              /* wrong answer: full animation has played, now reset for retry */
              setState({
                s23OverlapPhase: 'idle',
                s23OverlapDelta: null,
                s23OverlapVariant: null,
                feedback: null,
                wrongValue: null,
              });
            }
          });
        });
      });
    }

    /* S30 — same idea: left 1/2 vs right 1/3 shaded slice */
    if (
      appState.step === 32
      && appState.s30OverlapPhase === 'pending'
      && appState.s30OverlapDelta == null
    ) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const st = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
          if (!st || st.step !== 32 || st.s30OverlapPhase !== 'pending' || st.s30OverlapDelta != null) return;
          const leftWrap = document.querySelector('[data-bar-id="oneHalf-s30"]');
          const rightWrap = document.querySelector('[data-bar-id="oneThird-s30"]');
          if (!leftWrap || !rightWrap) return;
          const leftG = leftWrap.querySelector('g[data-segment-index="0"]');
          const rightG = rightWrap.querySelector('g[data-segment-index="0"]');
          if (!leftG || !rightG) return;
          const leftInner = leftG.querySelector('.chocolate-segment-body');
          if (!leftInner) return;
          const rightInner = rightG.querySelector('.chocolate-segment-body');
          const leftAnchor = leftInner.querySelector('rect') || leftG.querySelector('rect') || leftG;
          const rightAnchor = rightInner && rightInner.querySelector
            ? (rightInner.querySelector('rect') || rightG.querySelector('rect') || rightG)
            : (rightG.querySelector('rect') || rightG);
          /* source = 1/3 (right), target = 1/2 (left) — smaller slides onto larger */
          const delta30 = segmentOverlapDeltaClientPx(rightAnchor, leftAnchor);
          const dx = delta30.dx;
          const dy = delta30.dy;
          const variant30 = st.s30OverlapVariant;
          setState({
            s30OverlapDelta: { dx: dx, dy: dy },
            s30OverlapPhase: 'animating',
          });
          /* Same full animation for any symbol choice. */
          scheduleAuto(OVERLAP_ANIMATION_MS, () => {
            const cur30 = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
            if (!cur30 || cur30.step !== 32 || cur30.navBackMode) return;
            if (variant30 === 'correct' && cur30.comparedSymbol2 === '>') {
              setState({ s30OverlapPhase: 'done' });
              scheduleAuto(1000, () => {
                const cx = typeof window.__getAppState === 'function' ? window.__getAppState() : null;
                if (!cx || cx.step !== 32 || cx.navBackMode) return;
                goToStep(33, { navBackMode: false });
              });
            } else {
              /* wrong answer: full animation has played, now reset for retry */
              setState({
                s30OverlapPhase: 'idle',
                s30OverlapDelta: null,
                s30OverlapVariant: null,
                feedback: null,
                wrongValue: null,
              });
            }
          });
        });
      });
    }

    if (pendingPatches.length > 0) {
      Promise.resolve().then(flushPendingPatches);
    }
  }

  function initializeApp() {
    appState.language = window.utils.getCurrentLanguage();

    /* Debug-only: ?step=N jumps directly to a specific step with sensible
       defaults filled in for prior interactions. Useful for QA. */
    try {
      const qs = new URL(window.location.href).searchParams;
      const stepParam = qs.get('step');
      if (stepParam) {
        const target = Math.max(1, Math.min(32, parseInt(stepParam, 10)));
        /* Let ?step=3 and ?step=6 open their 2/3/5 MCQs with no prior selection. */
        appState.pickedParts = target === 3 ? null : 2;
        appState.pickedPartsBig = target === 6 ? null : 2;
        appState.pickedHalfSmall = 1;
        appState.pickedHalfLarge = target === 7 || target === 8 ? null : 0;
        appState.sameSizeAns = 'No';
        appState.sameSizeAns2 = 'Yes';
        appState.comparedSymbol = target >= 24 ? '=' : null;
        appState.comparedSymbol2 = target >= 31 ? '>' : null;
        appState.wholesNormalized = target >= 23;
        appState.equalizedSize = target >= 23 ? 'large' : null;
        appState.s23OverlapPhase = target > 23 ? 'done' : 'idle';
        appState.s23OverlapDelta = null;
        appState.s23OverlapVariant = null;
        appState.symbolStripCollapsed = target > 24;
        appState.s30OverlapPhase = target > 31 ? 'done' : 'idle';
        appState.s30OverlapDelta = null;
        appState.s30OverlapVariant = null;
        appState.overlapPhase = 'idle';
        appState.s15SlideDelta = null;
        appState.s29SlideDelta = null;
        appState.navBackMode = false;
        appState.step = target;
        appState.phase = target === 1 ? 'splash' : 'flow';
      }
    } catch (e) {
      /* no-op */
    }

    renderApp();
  }

  window.renderApp = renderApp;
  window.initializeApp = initializeApp;
  window.__getAppState = () => appState; /* exposed for debugging only */
})();
