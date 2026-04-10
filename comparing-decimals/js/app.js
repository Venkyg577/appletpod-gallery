/* global createElement, window, document */

let AppletButtonCmp;
let PlaceValueGridCmp;
let PairPickerCmp;
let DraggableChipCmp;
let NextChevronCmp;
let OperatorPickerCmp;
let HighlightedNumberCmp;

function initCmps() {
  const C = window.Components;
  AppletButtonCmp = C.AppletButton;
  PlaceValueGridCmp = C.PlaceValueGrid;
  PairPickerCmp = C.PairPicker;
  DraggableChipCmp = C.DraggableChip;
  NextChevronCmp = C.NextChevron;
  OperatorPickerCmp = C.OperatorPicker;
  HighlightedNumberCmp = C.HighlightedNumber;
}

const INTRO_A = '68.345';
const INTRO_B = '39.836';

const scheduledTimers = [];

function clearScheduled() {
  while (scheduledTimers.length) {
    const id = scheduledTimers.pop();
    clearTimeout(id);
  }
}

function schedule(fn, ms) {
  const id = setTimeout(function () {
    const idx = scheduledTimers.indexOf(id);
    if (idx >= 0) scheduledTimers.splice(idx, 1);
    fn();
  }, ms);
  scheduledTimers.push(id);
  return id;
}

function defaultProblemIndex() {
  return 0;
}

function t(path, params) {
  return window.utils.getText(path, params || {});
}

let appState = {
  phase: 'intro',
  introSubStep: 1,
  introRow1Placed: false,
  introRow2Placed: false,
  introRevealA: null,
  introRevealB: null,
  introStripOp: null,
  dragging: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  dragGhostPos: null,
  operatorTeeterNonce: 0,
  wrongSym: null,
  flyingOp: null,
  practiceIndex: defaultProblemIndex(),
  practiceSub: 'picker',
  workedPhase: 'pick',
  workedStepIndex: 0,
  isEqualComparison: false,
  completedByIndex: {},
  pickerPulseDecimals: false,
};

function currentProblem() {
  return window.PROBLEM_SET[appState.practiceIndex];
}

function setState(patch) {
  Object.assign(appState, patch);
  renderApp();
}

function introInstruction() {
  const s = appState.introSubStep;
  if (s === 1) return t('content-ui.instructions.intro_title');
  if (s === 2 || s === 3 || s === 4) return t('content-ui.instructions.align_decimals');
  if (s === 5 || s === 6) return t('content-ui.instructions.compare_from_left');
  if (s === 7) return t('content-ui.feedback.rule_greater_first_diff_alt');
  return t('content-ui.instructions.compare_from_left');
}

function placeLabels() {
  return {
    tens: t('content-ui.place_labels.tens'),
    ones: t('content-ui.place_labels.ones'),
    tenths: t('content-ui.place_labels.tenths'),
    hundredths: t('content-ui.place_labels.hundredths'),
    thousandths: t('content-ui.place_labels.thousandths'),
  };
}

function pointInRect(px, py, r) {
  return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
}

function revealRowDigits(which) {
  if (window.sound && window.sound.playDropSound) window.sound.playDropSound();
  var total = 5;
  var stateKey = which === 'first' ? 'introRevealA' : 'introRevealB';
  for (var d = 1; d <= total; d++) {
    (function (step) {
      schedule(function () {
        if (window.sound && window.sound.playDigitSound) window.sound.playDigitSound(step - 1);
        appState[stateKey] = step;
        renderApp();
      }, step * 350);
    })(d);
  }
  schedule(function () {
    appState[stateKey] = null;
    if (which === 'first') {
      appState.introRow1Placed = true;
      setState({ introSubStep: 3 });
    } else {
      appState.introRow2Placed = true;
      setState({ introSubStep: 4 });
      schedule(function () {
        setState({ introSubStep: 5, introStripOp: null, operatorTeeterNonce: 0 });
      }, 2000);
    }
  }, (total + 1) * 350);
}

function screenToLocal(clientX, clientY) {
  var wrapper = document.querySelector('.responsive-wrapper');
  if (!wrapper) return { x: clientX, y: clientY };
  var rect = wrapper.getBoundingClientRect();
  var scaleX = 1920 / rect.width;
  var scaleY = 1080 / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function attachNumberBoxDrag(which, ev) {
  var e = ev;
  e.preventDefault();
  if (window.sound) window.sound.playClickSound();
  var local = screenToLocal(e.clientX, e.clientY);
  appState.dragging = which;
  appState.dragGhostPos = { x: local.x, y: local.y };
  renderApp();

  function onMove(pe) {
    var pos = screenToLocal(pe.clientX, pe.clientY);
    appState.dragGhostPos = { x: pos.x, y: pos.y };
    renderApp();
  }

  function onUp(pe) {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);

    var targetRow = which === 'first' ? '0' : '1';
    var rowEl = document.querySelector('.place-grid .grid-row[data-row="' + targetRow + '"]');
    var gridEl = document.querySelector('.place-grid');
    var rRow = rowEl ? rowEl.getBoundingClientRect() : null;
    var rGrid = gridEl ? gridEl.getBoundingClientRect() : null;
    var hit = (rRow && pointInRect(pe.clientX, pe.clientY, rRow)) ||
              (rGrid && pointInRect(pe.clientX, pe.clientY, rGrid));

    appState.dragging = null;
    appState.dragGhostPos = null;

    if (hit) {
      revealRowDigits(which);
    } else {
      renderApp();
    }
  }

  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
}

function introStripDisplay() {
  const s = appState.introSubStep;
  if (s >= 6 && appState.introStripOp) return appState.introStripOp;
  return '?';
}

function animateFlyingOp(sym, onDone) {
  // Find the clicked button and the target operator slot
  var btns = document.querySelectorAll('.operator-choice');
  var sourceBtn = null;
  btns.forEach(function (b) { if (b.textContent.trim() === sym) sourceBtn = b; });
  var slot = document.querySelector('.pair-item-op--active') || document.querySelector('.operator-slot');
  if (!sourceBtn || !slot) { if (onDone) onDone(); return; }

  var srcRect = sourceBtn.getBoundingClientRect();
  var dstRect = slot.getBoundingClientRect();

  var ghost = document.createElement('div');
  ghost.className = 'flying-op-ghost';
  ghost.textContent = sym;
  ghost.style.left = srcRect.left + srcRect.width / 2 + 'px';
  ghost.style.top = srcRect.top + srcRect.height / 2 + 'px';
  document.body.appendChild(ghost);

  var dx = (dstRect.left + dstRect.width / 2) - (srcRect.left + srcRect.width / 2);
  var dy = (dstRect.top + dstRect.height / 2) - (srcRect.top + srcRect.height / 2);
  ghost.style.setProperty('--fly-dx', dx + 'px');
  ghost.style.setProperty('--fly-dy', dy + 'px');
  ghost.classList.add('flying-op-ghost--go');

  ghost.addEventListener('animationend', function () {
    ghost.remove();
    if (onDone) onDone();
  });
  setTimeout(function () { ghost.remove(); if (onDone) onDone(); }, 800);
}

function handleIntroOperatorPick(sym) {
  const DPV = window.DecimalPlaceValue;
  const da = DPV.digitsAtPlaceIndex(INTRO_A, INTRO_B, 0);
  const expected = DPV.expectedOperatorForDigits(da.valueA, da.valueB);
  if (sym !== expected) {
    if (window.sound && window.sound.playWrongSound) window.sound.playWrongSound();
    setState({ wrongSym: sym, operatorTeeterNonce: appState.operatorTeeterNonce + 1 });
    schedule(function () { setState({ wrongSym: null }); }, 600);
    return;
  }
  if (window.sound && window.sound.playCorrectSound) window.sound.playCorrectSound();
  setState({ wrongSym: null, operatorTeeterNonce: 0 });
  animateFlyingOp(sym, function () {
    setState({ introSubStep: 6, introStripOp: expected });
  });
}

function introNext() {
  window.sound && window.sound.playClickSound();
  const s = appState.introSubStep;
  if (s === 1) {
    setState({ introSubStep: 2 });
    return;
  }
  if (s === 6) {
    setState({ introSubStep: 7 });
    return;
  }
  if (s === 7) {
    clearScheduled();
    setState({
      phase: 'practice',
      practiceSub: 'picker',
      workedPhase: 'pick',
      workedStepIndex: 0,
      introSubStep: 1,
      introRow1Placed: false,
      introRow2Placed: false,
      introRevealA: null,
      introRevealB: null,
      introStripOp: null,
    });
    return;
  }
}

function triggerPickerDecimalPulse() {
  setState({ pickerPulseDecimals: true });
  schedule(function () {
    appState.pickerPulseDecimals = false;
    renderApp();
  }, 700);
}

function changePracticeIndex(idx) {
  clearScheduled();
  window.sound && window.sound.playClickSound();
  triggerPickerDecimalPulse();
  setState({
    practiceIndex: idx,
    practiceSub: 'picker',
    workedPhase: 'pick',
    workedStepIndex: 0,
    isEqualComparison: false,
    operatorTeeterNonce: 0,
  });
}

function comparisonStepsForCurrent() {
  const prob = currentProblem();
  return window.DecimalPlaceValue.comparisonStepsUntilDiff(prob.a, prob.b);
}

function beginComparePractice() {
  const prob = currentProblem();
  clearScheduled();
  window.sound && window.sound.playClickSound();
  if (prob.extended_only) {
    setState({ phase: 'extended' });
    return;
  }
  const steps = window.DecimalPlaceValue.comparisonStepsUntilDiff(prob.a, prob.b);
  if (!steps.length) {
    setState({
      practiceSub: 'worked',
      workedPhase: 'final',
      workedStepIndex: 0,
      isEqualComparison: true,
      operatorTeeterNonce: 0,
    });
    return;
  }
  setState({
    practiceSub: 'worked',
    workedPhase: 'pick',
    workedStepIndex: 0,
    isEqualComparison: false,
    operatorTeeterNonce: 0,
  });
}

function handleWorkedOperatorPick(sym) {
  const DPV = window.DecimalPlaceValue;
  const steps = comparisonStepsForCurrent();
  if (!steps.length) return;
  const st = steps[appState.workedStepIndex];
  const expected = DPV.expectedOperatorForDigits(st.valueA, st.valueB);
  if (sym !== expected) {
    if (window.sound && window.sound.playWrongSound) window.sound.playWrongSound();
    setState({ wrongSym: sym, operatorTeeterNonce: appState.operatorTeeterNonce + 1 });
    schedule(function () { setState({ wrongSym: null }); }, 600);
    return;
  }
  if (window.sound && window.sound.playCorrectSound) window.sound.playCorrectSound();
  const isLast = appState.workedStepIndex >= steps.length - 1;
  setState({ wrongSym: null, operatorTeeterNonce: 0 });
  if (expected === '=' && !isLast) {
    // Intermediate equal — no flying, move to next step
    schedule(function () { setState({ workedPhase: 'equality_rule' }); }, 400);
  } else {
    // Final deciding digit — fly the symbol to the input box
    animateFlyingOp(sym, function () {
      setState({ workedPhase: 'digit_line' });
    });
  }
}

function workedContinueEquality() {
  window.sound && window.sound.playClickSound();
  setState({
    workedPhase: 'pick',
    workedStepIndex: appState.workedStepIndex + 1,
  });
}

function workedContinueDigitLine() {
  window.sound && window.sound.playClickSound();
  setState({ workedPhase: 'final' });
}

function backToPickerFromWorked() {
  const idx = appState.practiceIndex;
  const next = Object.assign({}, appState.completedByIndex);
  next[String(idx)] = true;
  clearScheduled();
  window.sound && window.sound.playClickSound();

  // Check if all non-extended problems are done
  var ps = window.PROBLEM_SET;
  var allDone = true;
  for (var i = 0; i < ps.length; i++) {
    if (!ps[i].extended_only && !next[String(i)]) {
      allDone = false;
      break;
    }
  }

  if (allDone) {
    setState({ completedByIndex: next, phase: 'summary' });
    return;
  }

  setState({
    practiceSub: 'picker',
    workedPhase: 'pick',
    workedStepIndex: 0,
    isEqualComparison: false,
    completedByIndex: next,
    operatorTeeterNonce: 0,
  });
}

function goToSummary() {
  window.sound && window.sound.playClickSound();
  setState({ phase: 'summary' });
}

function exitExtended() {
  window.sound && window.sound.playClickSound();
  setState({ phase: 'practice', practiceSub: 'picker' });
}

function restartFromSummary() {
  window.sound && window.sound.playClickSound();
  setState({
    phase: 'practice',
    practiceSub: 'picker',
    practiceIndex: 0,
    workedPhase: 'pick',
    workedStepIndex: 0,
    completedByIndex: {},
    isEqualComparison: false,
  });
}

function buildComparisonStrip(opts) {
  var numA = opts.numA || INTRO_A;
  var numB = opts.numB || INTRO_B;
  var hero = opts.hero || false;
  var dragFirst = opts.dragFirst || false;
  var dragSecond = opts.dragSecond || false;
  var stripOpChar = opts.stripOpChar || '?';
  var slotAnim = opts.slotAnim || false;
  var highlightPlace = opts.highlightPlace != null ? opts.highlightPlace : null;

  const stripClass = 'comparison-strip' + (hero ? ' comparison-strip--hero' : '');
  var boxAClass = 'number-box' + (dragFirst ? ' number-box--draggable' : '');
  var boxBClass = 'number-box' + (dragSecond ? ' number-box--draggable' : '');
  const slotClass =
    'operator-slot' + (stripOpChar !== '?' ? ' operator-slot--result' : '') + (slotAnim ? ' operator-slot--filled' : '');

  var numAContent = HighlightedNumberCmp({ value: numA, highlightPlaceIndex: highlightPlace });
  var numBContent = HighlightedNumberCmp({ value: numB, highlightPlaceIndex: highlightPlace });

  var slotContent = createElement('span', { className: 'interactive-text' }, stripOpChar);

  return createElement(
    'div',
    { className: stripClass },
    createElement('div', {
      className: boxAClass,
      onPointerDown: dragFirst ? function (e) { attachNumberBoxDrag('first', e); } : null,
    }, numAContent),
    createElement('div', { className: slotClass }, slotContent),
    createElement('div', {
      className: boxBClass,
      onPointerDown: dragSecond ? function (e) { attachNumberBoxDrag('second', e); } : null,
    }, numBContent)
  );
}

function buildIntro() {
  const sub = appState.introSubStep;
  const labels = placeLabels();
  const emptyB = !appState.introRow2Placed && appState.introRevealB == null;
  const pulsateRow = (sub === 2 && !appState.introRow1Placed) ? 0 : (sub === 3 && !appState.introRow2Placed) ? 1 : null;
  const pulsateDec = sub === 4;
  const highlightCol = sub >= 5 && sub <= 7 ? 0 : null;
  const pulsateCellsIntro = sub === 5 ? [{ row: 0, col: 0 }, { row: 1, col: 0 }] : null;

  const drag1 = sub === 2 && !appState.introRow1Placed;
  const drag2 = sub === 3 && !appState.introRow2Placed;
  const emptyA = !appState.introRow1Placed && appState.introRevealA == null;

  const header = createElement(
    'header',
    { className: 'intro-header' },
    createElement('div', { className: 'intro-header-text interactive-text', 'aria-live': 'polite' }, introInstruction())
  );

  const footer = createElement('footer', { className: 'intro-footer' });

  if (sub === 1) {
    const stripZone = createElement(
      'div',
      { className: 'intro-mid-main' },
      createElement(
        'div',
        { className: 'intro-stage-card intro-stage-card--hero' },
        buildComparisonStrip({ hero: true })
      ),
      createElement(
        'div',
        { className: 'rule-bubble' },
        createElement('span', { className: 'interactive-text' }, t('content-ui.instructions.intro_hint'))
      )
    );
    const beginCol = createElement(
      'div',
      { className: 'intro-begin-wrap' },
      createElement('div', { className: 'tap-begin-label interactive-text' }, t('content-ui.instructions.tap_to_begin')),
      NextChevronCmp({ pulsate: true, onClick: introNext })
    );
    const mid = createElement(
      'div',
      { className: 'intro-mid' },
      createElement('div', { className: 'intro-mid-inner intro-mid-inner--step1' }, stripZone, beginCol)
    );
    return createElement('div', { className: 'intro-shell' }, header, mid, footer);
  }

  const gridEl = createElement(
    'div',
    { className: 'grid-wrap intro-grid-wrap' },
    PlaceValueGridCmp({
      rowA: INTRO_A,
      rowB: INTRO_B,
      labels: labels,
      highlightGridColumn: highlightCol,
      pulsateRow: pulsateRow,
      pulsateDecimals: pulsateDec,
      pulsateCells: pulsateCellsIntro,
      emptyRowA: emptyA,
      emptyRowB: emptyB,
      revealA: appState.introRevealA,
      revealB: appState.introRevealB,
    })
  );

  const dragGhost = appState.dragging && appState.dragGhostPos
    ? createElement('div', {
        className: 'drag-ghost',
        style: {
          left: appState.dragGhostPos.x + 'px',
          top: appState.dragGhostPos.y + 'px',
        },
      }, appState.dragging === 'first' ? INTRO_A : INTRO_B)
    : null;

  const stripOp = introStripDisplay();
  var introHighlightPlace = (sub >= 5 && sub <= 7) ? 0 : null;

  var leftRuleBubble = null;
  if (sub === 7) {
    leftRuleBubble = createElement(
      'div',
      { className: 'rule-bubble' },
      createElement('span', { className: 'interactive-text' }, t('content-ui.feedback.rule_greater_first_diff'))
    );
  }

  const stripColumn = createElement(
    'div',
    { className: 'intro-strip-column panel' },
    buildComparisonStrip({
      dragFirst: drag1,
      dragSecond: drag2,
      stripOpChar: stripOp,
      slotAnim: sub === 6,
      highlightPlace: introHighlightPlace,
    }),
    leftRuleBubble
  );

  var introBelowGrid = null;
  if (sub === 5) {
    introBelowGrid = createElement(
      'div',
      { className: 'intro-compare-zone' },
      OperatorPickerCmp({
        onPick: handleIntroOperatorPick,
        disabled: false,
        wrongSym: appState.wrongSym,
        wrongKey: appState.operatorTeeterNonce,
      })
    );
  } else if (sub === 6 || sub === 7) {
    introBelowGrid = createElement(
      'div',
      { className: 'intro-compare-zone' },
      createElement(
        'div',
        { className: 'digit-compare-strip' },
        createElement('div', { className: 'digit-compare-cell grid-cell--tens' },
          createElement('span', { className: 'interactive-text' }, '6')),
        createElement('div', { className: 'digit-compare-op' },
          createElement('span', { className: 'interactive-text' }, '>')),
        createElement('div', { className: 'digit-compare-cell grid-cell--tens' },
          createElement('span', { className: 'interactive-text' }, '3'))
      )
    );
  }

  const gridPanel = createElement(
    'div',
    { className: 'intro-split-grid panel' },
    gridEl,
    introBelowGrid
  );

  const arrowOverlay =
    sub === 6 || sub === 7
      ? createElement(
          'div',
          { className: 'intro-arrow-overlay' },
          NextChevronCmp({ pulsate: true, onClick: introNext })
        )
      : null;

  const rightZone = createElement(
    'div',
    { className: 'intro-right-zone' },
    gridPanel,
    arrowOverlay
  );

  const midInner = createElement('div', { className: 'intro-mid-inner intro-mid-inner--split' }, stripColumn, rightZone);

  const mid = createElement('div', { className: 'intro-mid' }, midInner);

  return createElement('div', { className: 'intro-shell' }, header, mid, footer, dragGhost);
}

function compareSummary(prob) {
  const DPV = window.DecimalPlaceValue;
  const op = DPV.comparisonOperator(prob.a, prob.b);
  const diff = DPV.firstDifferingPlace(prob.a, prob.b);
  return { op: op, diff: diff };
}

function practiceBannerText() {
  if (appState.phase !== 'practice') return t('content-ui.instructions.practice_header');
  if (appState.practiceSub === 'picker') return t('content-ui.instructions.practice_header');
  if (appState.workedPhase === 'equality_rule') return t('content-ui.feedback.rule_equal_next_place');
  return t('content-ui.instructions.compare_from_left');
}

function buildPractice() {
  const labels = placeLabels();
  const prob = currentProblem();
  const DPV = window.DecimalPlaceValue;
  const { op, diff } = compareSummary(prob);
  const steps = comparisonStepsForCurrent();
  const wp = appState.workedPhase;
  const widx = appState.workedStepIndex;

  var highlightCol = null;
  var pulsateCells = null;
  var stripOpChar = '?';
  var slotFilled = false;
  var practiceHighlightPlace = null;

  if (appState.practiceSub === 'worked' && !appState.isEqualComparison && steps.length) {
    if (wp === 'pick') {
      const st = steps[widx];
      highlightCol = DPV.placeIndexToGridColumn(st.placeIndex);
      practiceHighlightPlace = st.placeIndex;
      pulsateCells = [
        { row: 0, col: highlightCol },
        { row: 1, col: highlightCol },
      ];
    } else if (wp === 'equality_rule') {
      const st = steps[widx];
      highlightCol = DPV.placeIndexToGridColumn(st.placeIndex);
      practiceHighlightPlace = st.placeIndex;
    } else if (wp === 'digit_line' || wp === 'final') {
      const last = steps[steps.length - 1];
      highlightCol = DPV.placeIndexToGridColumn(last.placeIndex);
      practiceHighlightPlace = last.placeIndex;
      const sym = DPV.expectedOperatorForDigits(last.valueA, last.valueB);
      stripOpChar = sym;
      slotFilled = true;
    }
  }

  if (appState.isEqualComparison && wp === 'final') {
    stripOpChar = '=';
    slotFilled = true;
  }

  const digitLine = (function () {
    if (appState.isEqualComparison) return t('content-ui.feedback.equal_numbers');
    if (!steps.length) return '';
    const last = steps[steps.length - 1];
    const sym = DPV.expectedOperatorForDigits(last.valueA, last.valueB);
    return last.valueA + ' ' + sym + ' ' + last.valueB;
  })();

  const completed = !!appState.completedByIndex[String(appState.practiceIndex)];
  const picker = PairPickerCmp({
    problems: window.PROBLEM_SET,
    selectedIndex: appState.practiceIndex,
    onChangeIndex: changePracticeIndex,
    showOperator: completed,
    operator: DPV.comparisonOperator(prob.a, prob.b),
    pulseDecimalsActive: appState.pickerPulseDecimals,
    highlightPlace: practiceHighlightPlace,
    stripOpChar: stripOpChar,
    completedByIndex: appState.completedByIndex,
  });

  const compareDisabled = appState.practiceSub !== 'picker';
  const showCompareImpending = !compareDisabled && appState.practiceSub === 'picker';

  // Left: just the picker
  const leftColumn = createElement(
    'div',
    { className: 'intro-strip-column panel' },
    picker
  );

  // Right: grid (60%) + compare/worked zone (40%)
  const workedZone = buildWorkedInteractive(prob, steps, digitLine, op, diff);

  var belowGrid = null;
  if (appState.practiceSub === 'picker' && !completed) {
    belowGrid = createElement(
      'div',
      { className: 'intro-compare-zone' },
      createElement(
        'div',
        { className: 'footer-actions' },
        AppletButtonCmp({
          label: t('standard-ui.buttons.compare'),
          disabled: compareDisabled,
          impending: showCompareImpending ? 'clickNext' : '',
          onClick: function () {
            if (!compareDisabled) beginComparePractice();
          },
        })
      )
    );
  } else if (workedZone) {
    belowGrid = createElement('div', { className: 'intro-compare-zone' }, workedZone);
  }

  const gridPanel = createElement(
    'div',
    { className: 'intro-split-grid panel' },
    createElement(
      'div',
      { className: 'grid-wrap' },
      PlaceValueGridCmp({
        rowA: prob.a,
        rowB: prob.b,
        labels: labels,
        highlightGridColumn: highlightCol,
        pulsateRow: null,
        pulsateDecimals: false,
        pulsateCells: pulsateCells,
        emptyRowA: false,
        emptyRowB: false,
      })
    ),
    belowGrid,
    createElement(
      'div',
      { className: 'aria-live-region', 'aria-live': 'assertive' },
      wp === 'final' ? prob.a + ' ' + op + ' ' + prob.b : ''
    )
  );

  const header = createElement(
    'header',
    { className: 'intro-header' },
    createElement('div', { className: 'intro-header-text interactive-text' }, practiceBannerText())
  );

  const footer = createElement('footer', { className: 'intro-footer' });

  // Overlay next arrow for final states
  var practiceArrowOverlay = null;
  if (wp === 'final' || (appState.isEqualComparison && wp === 'final')) {
    practiceArrowOverlay = createElement(
      'div',
      { className: 'intro-arrow-overlay' },
      NextChevronCmp({ pulsate: true, onClick: backToPickerFromWorked })
    );
  }

  const rightZone = createElement('div', { className: 'intro-right-zone' }, gridPanel, practiceArrowOverlay);

  const midInner = createElement(
    'div',
    { className: 'intro-mid-inner intro-mid-inner--split' },
    leftColumn,
    rightZone
  );

  const mid = createElement('div', { className: 'intro-mid' }, midInner);

  return createElement('div', { className: 'intro-shell' }, header, mid, footer);
}

function placeClassForDigitCompare(placeIndex) {
  var classes = ['grid-cell--tens', 'grid-cell--ones', 'grid-cell--tenths', 'grid-cell--hundredths', 'grid-cell--thousandths'];
  return classes[placeIndex] || 'grid-cell--tens';
}

function buildDigitCompareStrip(digitA, opSym, digitB, placeClass) {
  return createElement(
    'div',
    { className: 'digit-compare-strip' },
    createElement('div', { className: 'digit-compare-cell ' + placeClass },
      createElement('span', { className: 'interactive-text' }, digitA)),
    createElement('div', { className: 'digit-compare-op' },
      createElement('span', { className: 'interactive-text' }, opSym)),
    createElement('div', { className: 'digit-compare-cell ' + placeClass },
      createElement('span', { className: 'interactive-text' }, digitB))
  );
}

function buildWorkedInteractive(prob, steps, digitLine, op, diff) {
  const wp = appState.workedPhase;
  const sub = appState.practiceSub;

  if (sub !== 'worked') return null;

  if (appState.isEqualComparison && wp === 'final') {
    return createElement(
      'div',
      { className: 'compare-results', 'aria-live': 'polite' },
      createElement(
        'div',
        { className: 'result-chip' },
        createElement('span', { className: 'interactive-text' }, t('content-ui.feedback.equal_numbers'))
      ),
      createElement(
        'div',
        { className: 'result-chip' },
        createElement(
          'span',
          { className: 'interactive-text' },
          prob.a + ' ',
          createElement('span', { className: 'op' }, '='),
          ' ' + prob.b
        )
      ),
      createElement(
        'div',
        { className: 'worked-continue-actions' },
        AppletButtonCmp({
          label: t('standard-ui.buttons.continue'),
          onClick: backToPickerFromWorked,
        })
      )
    );
  }

  if (wp === 'pick' && steps.length) {
    return createElement(
      'div',
      { className: 'practice-operator-zone' },
      OperatorPickerCmp({
        onPick: handleWorkedOperatorPick,
        disabled: false,
        wrongSym: appState.wrongSym,
        wrongKey: appState.operatorTeeterNonce,
      })
    );
  }

  if (wp === 'equality_rule') {
    return createElement(
      'div',
      { className: 'compare-results', 'aria-live': 'polite' },
      createElement(
        'div',
        { className: 'rule-bubble' },
        createElement('span', { className: 'interactive-text' }, t('content-ui.feedback.rule_equal_next_place'))
      ),
      createElement(
        'div',
        { className: 'worked-continue-actions' },
        AppletButtonCmp({
          label: t('standard-ui.buttons.continue'),
          impending: 'clickNext',
          onClick: workedContinueEquality,
        })
      )
    );
  }

  if (wp === 'digit_line') {
    var dlSteps = steps;
    var dlLast = dlSteps[dlSteps.length - 1];
    var dlSym = window.DecimalPlaceValue.expectedOperatorForDigits(dlLast.valueA, dlLast.valueB);
    var dlPlaceClass = placeClassForDigitCompare(dlLast.placeIndex);
    return createElement(
      'div',
      { className: 'compare-results', 'aria-live': 'polite' },
      buildDigitCompareStrip(String(dlLast.valueA), dlSym, String(dlLast.valueB), dlPlaceClass),
      createElement(
        'div',
        { className: 'worked-continue-actions' },
        AppletButtonCmp({
          label: t('standard-ui.buttons.continue'),
          impending: 'clickNext',
          onClick: workedContinueDigitLine,
        })
      )
    );
  }

  if (wp === 'final' && steps.length) {
    var fLast = steps[steps.length - 1];
    var fSym = window.DecimalPlaceValue.expectedOperatorForDigits(fLast.valueA, fLast.valueB);
    var fPlaceClass = placeClassForDigitCompare(fLast.placeIndex);
    return createElement(
      'div',
      { className: 'compare-results', 'aria-live': 'polite' },
      buildDigitCompareStrip(String(fLast.valueA), fSym, String(fLast.valueB), fPlaceClass),
      createElement(
        'div',
        { className: 'rule-bubble' },
        createElement('span', { className: 'interactive-text' }, t('content-ui.feedback.rule_first_diff_decides'))

      )
    );
  }

  return null;
}

function buildExtended() {
  return createElement(
    'div',
    { className: 'extended-slide' },
    createElement('h1', { className: 'interactive-text' }, t('content-ui.feedback.rule_keep_comparing')),
    createElement(
      'div',
      { className: 'extended-digit-rows' },
      createElement('div', { className: 'row-line interactive-text' }, t('content-ui.extended.row_a')),
      createElement('div', { className: 'row-line interactive-text' }, t('content-ui.extended.row_b'))
    ),
    createElement(
      'div',
      { className: 'rule-bubble' },
      createElement('span', { className: 'interactive-text' }, t('content-ui.instructions.extended_try_comparing'))
    ),
    AppletButtonCmp({
      label: t('standard-ui.buttons.continue'),
      impending: 'clickNext',
      onClick: exitExtended,
    })
  );
}

function buildSummary() {
  var header = createElement(
    'header',
    { className: 'intro-header' },
    createElement('div', { className: 'intro-header-text interactive-text' }, t('content-ui.summary.title'))
  );

  var content = createElement(
    'div',
    { className: 'intro-mid-main' },
    createElement(
      'div',
      { className: 'rule-bubble', style: { marginBottom: '32px' } },
      createElement('span', { className: 'interactive-text' }, t('content-ui.summary.subtitle'))
    ),
    createElement(
      'div',
      { className: 'summary-card panel' },
      createElement(
        'ul',
        { className: 'summary-list' },
        createElement('li', { className: 'interactive-text' }, t('content-ui.summary.align_decimals')),
        createElement('li', { className: 'interactive-text' }, t('content-ui.summary.step_compare')),
        createElement('li', { className: 'interactive-text' }, t('content-ui.summary.step_first_diff'))
      )
    ),
    createElement(
      'div',
      { className: 'summary-actions' },
      AppletButtonCmp({
        label: t('standard-ui.buttons.try_again'),
        impending: 'clickNext',
        onClick: restartFromSummary,
      })
    )
  );

  var mid = createElement('div', { className: 'intro-mid' }, content);
  var footer = createElement('footer', { className: 'intro-footer' });

  return createElement('div', { className: 'intro-shell' }, header, mid, footer);
}

function App() {
  if (appState.phase === 'intro') return buildIntro();
  if (appState.phase === 'extended') return buildExtended();
  if (appState.phase === 'summary') return buildSummary();
  return buildPractice();
}

function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;
  root.innerHTML = '';
  const tree = App();
  if (tree) root.appendChild(tree);
}

function initializeApp() {
  initCmps();
  renderApp();
}

window.initializeApp = initializeApp;
window.renderApp = renderApp;
