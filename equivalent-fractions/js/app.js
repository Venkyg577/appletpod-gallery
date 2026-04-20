/* global window, document, sound */
(function () {
  const el = window.createElement;
  const UI = window.EquivUI;
  const Lesson = window.FractionLesson;

  const SL_TOP = 24;
  const SL_MID = 181;
  const SL_BOT = 339;
  const SL_ZERO = 496;

  const scheduledTimers = [];
  function clearScheduled() {
    while (scheduledTimers.length) {
      clearTimeout(scheduledTimers.pop());
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

  function t(path) {
    return window.utils.getText(path);
  }

  function appendInlineFractions(targetEl, text) {
    if (!targetEl) return;
    targetEl.textContent = '';
    const src = String(text || '');
    const re = /(\d+)\s*\/\s*(\d+)/g;
    let last = 0;
    let m = re.exec(src);
    while (m) {
      if (m.index > last) {
        targetEl.appendChild(document.createTextNode(src.slice(last, m.index)));
      }
      const frac = el(
        'span',
        { className: 'equiv-inline-frac' },
        el('span', { className: 'equiv-inline-frac-num' }, m[1]),
        el('span', { className: 'equiv-inline-frac-bar' }),
        el('span', { className: 'equiv-inline-frac-den' }, m[2])
      );
      targetEl.appendChild(frac);
      last = re.lastIndex;
      m = re.exec(src);
    }
    if (last < src.length) {
      targetEl.appendChild(document.createTextNode(src.slice(last)));
    }
  }

  let introPulseInterval = null;

  /** @type {{
   * phase: string,
   * lessonIndex: number,
   * headerKey: string,
   * sliderValue: 0|2|4|6,
   * sliderSnapBeforeDrag: 0|2|4|6,
   * knifeLocked: boolean,
   * knifeHidden: boolean,
   * sliderHighlighted: boolean,
   * introPulseSlot: number,
   * teeterNonce: number,
   * wrongPreviewParts: number|null,
   * selected: number[],
   * showHand: boolean,
   * flyingKnife: boolean,
   * pulseTick: boolean,
   * dimCols: boolean[],
   * completed: (null|{num:number,den:number,parts:number})[],
   * equivActive: boolean,
   * finalActive: boolean,
   * cutAnimStarted: boolean,
   * }} */
  let appState = {
    phase: 'intro',
    lessonIndex: 0,
    headerKey: 'content-ui.instructions.intro_title',
    sliderValue: 0,
    sliderSnapBeforeDrag: 0,
    knifeLocked: false,
    knifeHidden: true,
    sliderHighlighted: false,
    introPulseSlot: 0,
    teeterNonce: 0,
    wrongPreviewParts: null,
    selected: [],
    showHand: false,
    flyingKnife: false,
    pulseTick: false,
    dimCols: [false, false, false],
    completed: [null, null, null],
    equivActive: false,
    finalActive: false,
    cutAnimStarted: false,
  };

  function setState(patch) {
    Object.assign(appState, patch);
    renderApp();
  }

  function currentLesson() {
    return Lesson.config(appState.lessonIndex);
  }

  function expectedParts() {
    return currentLesson().expectedParts;
  }

  function requiredSel() {
    return Lesson.requiredSelections(expectedParts());
  }

  function snapSliderFromY(localInsideY, stops) {
    const points = [
      { value: 6, y: stops[6] },
      { value: 4, y: stops[4] },
      { value: 2, y: stops[2] },
      { value: 0, y: stops[0] },
    ];
    let nearest = points[0];
    let nearestDist = Math.abs(localInsideY - nearest.y);
    let i = 1;
    for (; i < points.length; i++) {
      const d = Math.abs(localInsideY - points[i].y);
      if (d < nearestDist) {
        nearest = points[i];
        nearestDist = d;
      }
    }
    return nearest.value;
  }

  function readClientPoint(evt) {
    if (!evt) return null;
    if (typeof evt.clientX === 'number') return { x: evt.clientX, y: evt.clientY };
    const touch = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]);
    if (touch) return { x: touch.clientX, y: touch.clientY };
    return null;
  }

  function screenToLocal(clientX, clientY) {
    const wrapper = document.querySelector('.responsive-wrapper');
    if (!wrapper) return { x: clientX, y: clientY };
    const rect = wrapper.getBoundingClientRect();
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function attachSliderInteractions(sidebarEl) {
    const wrap = sidebarEl.querySelector('.equiv-slider-wrap');
    const knife = sidebarEl.querySelector('[data-role="knife"]');
    if (!wrap || !knife) return;
    const tickEls = Array.prototype.slice.call(wrap.querySelectorAll('.equiv-slider-tick'));

    let dragActive = false;

    function currentStops() {
      const h = wrap.clientHeight || 560;
      return UI.sliderStopMap(h);
    }

    function applyTickAndKnifeLayout() {
      const stops = currentStops();
      tickEls.forEach(function (tickEl) {
        const value = Number(tickEl.dataset.value);
        if (!isNaN(value) && typeof stops[value] === 'number') {
          tickEl.style.top = stops[value] + 'px';
        }
      });
      const knifeTop = UI.knifeTopForValue(appState.sliderValue, stops[6], stops[4], stops[2], stops[0]);
      knife.style.top = knifeTop + 'px';
    }

    applyTickAndKnifeLayout();

    function canInteract() {
      return (
        appState.phase === 'divide' &&
        !appState.knifeLocked &&
        !appState.knifeHidden &&
        !appState.flyingKnife
      );
    }

    function snapFromEventPosition(evt) {
      const p = readClientPoint(evt);
      if (!p) return;
      const local = screenToLocal(p.x, p.y);
      const r = wrap.getBoundingClientRect();
      const wRect = document.querySelector('.responsive-wrapper').getBoundingClientRect();
      const scaleY = 1080 / wRect.height;
      const wrapTop = (r.top - wRect.top) * scaleY;
      const localInsideY = local.y - wrapTop;
      const stops = currentStops();
      const v = snapSliderFromY(localInsideY, stops);
      if (v !== appState.sliderValue) {
        appState.sliderValue = v;
        knife.style.top = UI.knifeTopForValue(v, stops[6], stops[4], stops[2], stops[0]) + 'px';
      }
    }

    function onPointerDown(e) {
      if (!canInteract()) return;
      if (e.cancelable) e.preventDefault();
      dragActive = true;
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
      appState.sliderSnapBeforeDrag = appState.sliderValue;
      snapFromEventPosition(e);
      if (window.sound && window.sound.playClickSound) window.sound.playClickSound();
    }

    function onPointerMove(e) {
      if (!dragActive && !canInteract()) return;
      if (!dragActive) return;
      if (e.cancelable) e.preventDefault();
      snapFromEventPosition(e);
    }

    function commitDivision() {
      const exp = expectedParts();
      if (appState.sliderValue !== exp) {
        appState.wrongPreviewParts = appState.sliderValue;
        appState.teeterNonce += 1;
        if (window.sound && window.sound.playWrongSound) window.sound.playWrongSound();
        setState({});
        schedule(function () {
          appState.wrongPreviewParts = null;
          appState.sliderValue = 0;
          appState.sliderSnapBeforeDrag = 0;
          setState({});
        }, 700);
        return;
      }
      appState.knifeLocked = true;
      appState.pulseTick = false;
      if (window.sound && window.sound.playCorrectSound) window.sound.playCorrectSound();
      setState({});
      schedule(function () {
        appState.phase = 'cut_anim';
        appState.flyingKnife = true;
        appState.cutAnimStarted = true;
        if (window.sound && window.sound.playWhoosh) window.sound.playWhoosh();
        setState({});
        schedule(function () {
          if (window.sound && window.sound.playCutSound) window.sound.playCutSound();
        }, 500);
        schedule(function () {
          appState.phase = 'select';
          appState.flyingKnife = false;
          appState.selected = [];
          appState.showHand = false;
          appState.headerKey = currentLesson().selectHeader;
          setState({});
          schedule(function () {
            appState.showHand = true;
            setState({});
          }, 1000);
        }, 1000);
      }, 450);
    }

    function onPointerUp(e) {
      if (e.cancelable) e.preventDefault();
      if (canInteract()) {
        snapFromEventPosition(e);
      }
      const wasDragging = dragActive;
      if (dragActive) {
        dragActive = false;
        try {
          wrap.releasePointerCapture(e.pointerId);
        } catch (err2) {
          /* ignore */
        }
      }
      if (!wasDragging) return;
      if (appState.phase !== 'divide' || appState.knifeLocked || appState.knifeHidden) {
        return;
      }
      commitDivision();
    }

    wrap.addEventListener('pointerdown', onPointerDown);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerup', onPointerUp);
    wrap.addEventListener('pointercancel', onPointerUp);
  }

  function toggleSelectSegment(col, index) {
    const L = currentLesson();
    if (col !== L.activeCol) return;
    if (appState.phase !== 'select') return;
    const req = requiredSel();
    const arr = appState.selected.slice().sort(function (a, b) {
      return a - b;
    });
    const pos = arr.indexOf(index);
    if (pos >= 0) {
      arr.splice(pos, 1);
    } else {
      if (arr.length >= req) {
        arr.shift();
      }
      arr.push(index);
      arr.sort(function (a, b) {
        return a - b;
      });
    }
    appState.selected = arr;
    if (arr.length === req) {
      appState.phase = 'selection_anim';
      appState.showHand = false;
      if (window.sound && window.sound.playCorrectSound) window.sound.playCorrectSound();
      setState({});
      schedule(function () {
        appState.phase = 'show_fraction';
        const c = currentLesson();
        appState.completed[c.activeCol] = {
          num: c.numerator,
          den: c.denominator,
          parts: c.expectedParts,
        };
        appState.headerKey = c.fractionShownHeader;
        setState({});
        scheduleNextAfterFraction();
      }, 2000);
    } else {
      if (window.sound && window.sound.playClickSound) window.sound.playClickSound();
      setState({});
    }
  }

  function scheduleNextAfterFraction() {
    const li = appState.lessonIndex;
    if (li === 0) {
      schedule(function () {
        appState.dimCols = [true, false, false];
        appState.lessonIndex = 1;
        appState.phase = 'divide';
        appState.headerKey = 'content-ui.instructions.divide_four';
        appState.sliderValue = 0;
        appState.knifeLocked = false;
        appState.knifeHidden = false;
        appState.sliderHighlighted = true;
        appState.selected = [];
        appState.pulseTick = true;
        setState({});
        schedule(function () {
          appState.pulseTick = false;
          setState({});
        }, 2400);
      }, 2000);
      return;
    }
    if (li === 1) {
      schedule(function () {
        appState.phase = 'equiv';
        appState.equivActive = true;
        appState.headerKey = 'content-ui.instructions.both_same_value';
        setState({});
      }, 2000);
      schedule(function () {
        appState.equivActive = false;
        appState.phase = 'reinforce';
        appState.headerKey = 'content-ui.instructions.equivalent_intro';
        appState.dimCols = [true, true, false];
        setState({});
      }, 5000);
      schedule(function () {
        appState.lessonIndex = 2;
        appState.phase = 'divide';
        appState.headerKey = 'content-ui.instructions.divide_six';
        appState.dimCols = [false, false, false];
        appState.sliderValue = 0;
        appState.knifeLocked = false;
        appState.pulseTick = true;
        setState({});
        schedule(function () {
          appState.pulseTick = false;
          setState({});
        }, 2400);
      }, 8000);
      return;
    }
    if (li === 2) {
      schedule(function () {
        appState.phase = 'final';
        appState.finalActive = true;
        appState.headerKey = 'content-ui.instructions.final_title';
        setState({});
      }, 2000);
    }
  }

  function buildClayParts(col, parts, opts) {
    const stack = el('div', {
      className:
        'equiv-clay-stack' +
        (parts === 2 ? ' equiv-clay-stack--two' : '') +
        (opts.teeter ? ' equiv-clay-stack--teeter' : '') +
        (opts.selectable ? ' equiv-clay-stack--selectable' : ''),
    });
    if (opts.teeter) {
      stack.setAttribute('data-teeter', String(opts.teeterNonce));
    }
    for (let i = 0; i < parts; i++) {
      const selected = opts.selected.indexOf(i) >= 0;
      const pulse = opts.pulseSelected && selected;
      const seg = el('div', {
        className:
          'equiv-clay-seg' +
          (selected ? ' equiv-clay-seg--selected' : '') +
          (pulse ? ' equiv-clay-seg--pulse' : ''),
        onClick: function () {
          toggleSelectSegment(col, i);
        },
      });
      stack.appendChild(seg);
    }
    return stack;
  }

  function buildColumn(colIndex) {
    const L = currentLesson();
    const completed = appState.completed[colIndex];
    const isActiveCol = L.activeCol === colIndex;
    const dim = appState.dimCols[colIndex];
    const phase = appState.phase;

    const slot = el('div', { className: 'equiv-block-slot' });
    const badges = el('div', { className: 'equiv-badges' });

    let partsShown = 1;
    let mode = 'ghost';
    const ghostNum = colIndex === 1 ? 2 : colIndex === 2 ? 3 : null;
    let greenWhole = false;
    let teeter = false;
    let selectable = false;
    let selected = [];
    let pulseSel = false;
    let pulseSlot = false;
    let dashed = 0;

    if (completed) {
      mode = 'done';
      partsShown = completed.parts;
      for (let i = 0; i < partsShown; i++) {
        const activeBadge = i < completed.num;
        badges.appendChild(
          el(
            'div',
            {
              className: 'equiv-badge' + (activeBadge ? ' equiv-badge--active' : ''),
            },
            String(i + 1)
          )
        );
      }
    } else if (phase === 'focus_first' && colIndex > 0) {
      mode = 'ghost';
    } else if (colIndex === 0 && phase === 'intro') {
      mode = 'whole';
      partsShown = 1;
      pulseSlot = appState.introPulseSlot === 0;
    } else if (colIndex === 1 && phase === 'intro') {
      mode = 'whole';
      pulseSlot = appState.introPulseSlot === 1;
    } else if (colIndex === 2 && phase === 'intro') {
      mode = 'whole';
      pulseSlot = appState.introPulseSlot === 2;
    } else if (phase === 'focus_first') {
      if (colIndex === 0) {
        mode = 'whole';
        pulseSlot = true;
      } else {
        mode = 'ghost';
      }
    } else if (isActiveCol && (phase === 'divide' || phase === 'cut_anim')) {
      const prev = appState.wrongPreviewParts;
      if (prev) {
        mode = 'sliced';
        partsShown = prev;
        teeter = true;
      } else if (phase === 'cut_anim') {
        mode = 'sliced';
        partsShown = expectedParts();
      } else if (phase === 'divide' && appState.knifeLocked) {
        mode = 'whole';
        greenWhole = true;
      } else {
        mode = 'whole';
      }
    } else if (isActiveCol && (phase === 'select' || phase === 'selection_anim')) {
      mode = 'sliced';
      partsShown = expectedParts();
      selectable = phase === 'select';
      selected = appState.selected;
      pulseSel = phase === 'selection_anim';
      for (let i = 0; i < partsShown; i++) {
        const activeBadge = i < Lesson.requiredSelections(expectedParts());
        badges.appendChild(
          el(
            'div',
            {
              className: 'equiv-badge' + (activeBadge ? ' equiv-badge--active' : ''),
            },
            String(i + 1)
          )
        );
      }
    } else if (isActiveCol && phase === 'show_fraction') {
      mode = 'sliced';
      partsShown = expectedParts();
      const c = currentLesson();
      for (let i = 0; i < partsShown; i++) {
        badges.appendChild(
          el(
            'div',
            {
              className: 'equiv-badge' + (i < c.numerator ? ' equiv-badge--active' : ''),
            },
            String(i + 1)
          )
        );
      }
    } else if (!completed && colIndex > L.activeCol && appState.lessonIndex >= colIndex) {
      mode = 'whole';
    } else if (!completed && !isActiveCol) {
      mode = 'ghost';
    }

    if (appState.equivActive && completed && colIndex <= 1) {
      dashed = colIndex === 0 ? 1 : 2;
    }
    if (appState.finalActive && completed) {
      dashed = completed.num;
    }

    slot.className +=
      (dim ? ' equiv-block-slot--dim' : '') +
      (pulseSlot ? ' equiv-block-slot--pulse' : '');

    if (mode === 'ghost') {
      const ghost = el('div', { className: 'equiv-clay-whole' });
      if (ghostNum) {
        ghost.appendChild(el('div', { className: 'equiv-ghost-num interactive-text' }, String(ghostNum)));
      }
      if (badges.childElementCount > 0) {
        slot.appendChild(badges);
      }
      slot.appendChild(ghost);
    } else if (mode === 'whole') {
      if (badges.childElementCount > 0) {
        slot.appendChild(badges);
      }
      const whole = el('div', {
        className: 'equiv-clay-whole' + (greenWhole ? ' equiv-clay-whole--green' : ''),
      });
      slot.appendChild(whole);
    } else {
      if (badges.childElementCount > 0) {
        slot.appendChild(badges);
      }
      const visSelected =
        mode === 'done' && completed
          ? (function () {
              const a = [];
              let i = 0;
              for (; i < completed.num; i++) a.push(i);
              return a;
            })()
          : selected;
      const pulseParts =
        pulseSel || Boolean(completed && (appState.equivActive || appState.finalActive));
      const stack = buildClayParts(colIndex, partsShown, {
        teeter: teeter,
        teeterNonce: appState.teeterNonce,
        selectable: selectable && mode !== 'done',
        selected: visSelected,
        pulseSelected: pulseParts,
      });
      slot.appendChild(stack);
      if (dashed > 0) {
        const dash = el('div', {
          className:
            'equiv-dashed-wrap' +
            (appState.equivActive || appState.finalActive ? ' equiv-dashed-wrap--pulse' : ''),
          style: {
            width: (dashed / partsShown) * 100 + '%',
            left: '0',
            right: 'auto',
          },
        });
        slot.appendChild(dash);
      }
    }

    if (appState.showHand && isActiveCol && phase === 'select' && mode === 'sliced') {
      slot.appendChild(
        el('img', {
          className: 'equiv-tap-finger',
          src: 'assets/images/fingerTap.gif',
          alt: 'Tap here',
          style: { left: '14%', top: '56%' },
        })
      );
    }

    return slot;
  }

  function buildFractionSlot(colIndex) {
    const completed = appState.completed[colIndex];
    const slot = el('div', { className: 'equiv-frac-slot' });
    if (!completed) {
      slot.appendChild(el('div', { style: { height: '72px' } }));
      return slot;
    }
    const pulse =
      (appState.equivActive && colIndex <= 1) || (appState.finalActive && colIndex <= 2);
    const frac = el(
      'div',
      {
        className: 'equiv-frac-box interactive-text' + (pulse ? ' equiv-frac-box--pulse' : ''),
      },
      el('div', { className: 'equiv-frac-num' }, String(completed.num)),
      el('div', { className: 'equiv-frac-bar' }),
      el('div', { className: 'equiv-frac-den' }, String(completed.den))
    );
    slot.appendChild(
      frac
    );
    return slot;
  }

  function buildEqualsBetween(leftIdx, pulse) {
    const dim =
      appState.equivActive || appState.finalActive
        ? false
        : leftIdx === 1 && appState.completed[2] == null && appState.lessonIndex < 2;
    return el(
      'div',
      {
        className:
          'equiv-equals-big interactive-text' +
          (dim ? ' equiv-equals-big--dim' : '') +
          (pulse ? ' equiv-equals-big--pulse' : ''),
      },
      '='
    );
  }

  function buildFractionRow() {
    const row = el('div', { className: 'equiv-fraction-row' });
    const inner = el('div', { className: 'equiv-frac-row-inner' });
    inner.appendChild(buildFractionSlot(0));
    if (appState.completed[0] && appState.completed[1]) {
      inner.appendChild(
        el(
          'div',
          { className: 'equiv-frac-slot equiv-frac-slot--equals' },
          el(
            'div',
            {
              className:
                'equiv-frac-box equiv-frac-box--equals interactive-text' +
                (appState.equivActive ? ' equiv-frac-box--pulse' : ''),
            },
            '='
          )
        )
      );
    } else {
      inner.appendChild(
        el('div', { className: 'equiv-frac-slot equiv-frac-slot--equals' }, el('div', { style: { height: '72px' } }))
      );
    }
    inner.appendChild(buildFractionSlot(1));
    if (appState.completed[1] && appState.completed[2]) {
      inner.appendChild(
        el(
          'div',
          { className: 'equiv-frac-slot equiv-frac-slot--equals' },
          el(
            'div',
            {
              className:
                'equiv-frac-box equiv-frac-box--equals interactive-text' +
                (appState.finalActive ? ' equiv-frac-box--pulse' : ''),
            },
            '='
          )
        )
      );
    } else {
      inner.appendChild(
        el('div', { className: 'equiv-frac-slot equiv-frac-slot--equals' }, el('div', { style: { height: '72px' } }))
      );
    }
    inner.appendChild(buildFractionSlot(2));
    row.appendChild(inner);
    return row;
  }

  function buildMain() {
    const main = el('div', { className: 'equiv-main' });
    const top = el('div', { className: 'equiv-main-top' });
    const mid = el('div', { className: 'equiv-main-mid' });
    const bottom = el('div', { className: 'equiv-main-bottom' });
    const row = el('div', { className: 'equiv-row' });

    if (appState.phase === 'intro' || appState.phase === 'focus_first') {
      row.appendChild(buildColumn(0));
      row.appendChild(
        el('div', { className: 'equiv-equals-big interactive-text' }, '=')
      );
      row.appendChild(buildColumn(1));
      row.appendChild(el('div', { className: 'equiv-equals-big interactive-text' }, '='));
      row.appendChild(buildColumn(2));
      mid.appendChild(row);
    } else {
      row.appendChild(buildColumn(0));
      row.appendChild(buildEqualsBetween(0, appState.equivActive || appState.finalActive));
      row.appendChild(buildColumn(1));
      row.appendChild(buildEqualsBetween(1, appState.finalActive));
      row.appendChild(buildColumn(2));
      mid.appendChild(row);
      bottom.appendChild(buildFractionRow());
      if (appState.finalActive) {
        const multWrap = el('div', { className: 'equiv-main-top-multipliers' });
        const spacerCol1 = el('div', { className: 'equiv-main-top-slot equiv-main-top-slot--col' });
        const spacerEq1 = el('div', { className: 'equiv-main-top-slot equiv-main-top-slot--eq' });
        const slotCol2 = el('div', { className: 'equiv-main-top-slot equiv-main-top-slot--col' });
        const spacerEq2 = el('div', { className: 'equiv-main-top-slot equiv-main-top-slot--eq' });
        const slotCol3 = el('div', { className: 'equiv-main-top-slot equiv-main-top-slot--col' });
        const m2 = el('div', { className: 'equiv-multiplier equiv-multiplier--top interactive-text' });
        m2.innerHTML = '<span class="m-x">×</span><span class="m-n2">2</span>';
        const m3 = el('div', { className: 'equiv-multiplier equiv-multiplier--top interactive-text' });
        m3.innerHTML = '<span class="m-x">×</span><span class="m-n3">3</span>';
        slotCol2.appendChild(m2);
        slotCol3.appendChild(m3);
        multWrap.appendChild(spacerCol1);
        multWrap.appendChild(spacerEq1);
        multWrap.appendChild(slotCol2);
        multWrap.appendChild(spacerEq2);
        multWrap.appendChild(slotCol3);
        top.appendChild(multWrap);
      }
    }
    main.appendChild(top);
    main.appendChild(mid);
    main.appendChild(bottom);
    return main;
  }

  function buildApp() {
    const root = el('div', { className: 'equiv-applet' });
    const headerText = el('span', { className: 'interactive-text' });
    appendInlineFractions(headerText, t(appState.headerKey));
    root.appendChild(el('header', { className: 'equiv-header' }, headerText));
    const body = el('div', { className: 'equiv-body' });
    body.appendChild(buildMain());
    const sb = UI.buildSidebar({
      topPx: SL_TOP,
      midPx: SL_MID,
      botPx: SL_BOT,
      zeroPx: SL_ZERO,
      value: appState.sliderValue,
      expectedParts: expectedParts(),
      highlightTrack: appState.sliderHighlighted,
      pulseTargetTick: appState.pulseTick,
      locked: appState.knifeLocked,
      hiddenKnife: appState.knifeHidden,
      showSwipeHint:
        appState.phase === 'divide' &&
        appState.sliderHighlighted &&
        !appState.knifeLocked &&
        !appState.knifeHidden &&
        !appState.wrongPreviewParts &&
        !appState.flyingKnife,
      wholePulse: appState.phase === 'intro',
    });
    body.appendChild(sb.sidebar);
    root.appendChild(body);
    return { root: root, sidebar: sb.sidebar };
  }

  function startIntroSequence() {
    clearScheduled();
    if (introPulseInterval) {
      clearInterval(introPulseInterval);
      introPulseInterval = null;
    }
    introPulseInterval = setInterval(function () {
      appState.introPulseSlot = (appState.introPulseSlot + 1) % 3;
      renderApp();
    }, 900);

    schedule(function () {
      appState.sliderHighlighted = true;
      appState.knifeHidden = false;
      setState({});
    }, 2000);

    schedule(function () {
      if (introPulseInterval) {
        clearInterval(introPulseInterval);
        introPulseInterval = null;
      }
      appState.phase = 'focus_first';
      appState.headerKey = 'content-ui.instructions.watch_divide';
      appState.introPulseSlot = 0;
      setState({});
      schedule(function () {
        appState.dimCols = [false, true, true];
        appState.phase = 'divide';
        appState.headerKey = 'content-ui.instructions.divide_two';
        appState.pulseTick = true;
        setState({});
        schedule(function () {
          appState.pulseTick = false;
          setState({});
        }, 2200);
      }, 2000);
    }, 5000);
  }

  function renderApp() {
    const mount = document.getElementById('app');
    if (!mount) return;
    mount.innerHTML = '';
    const built = buildApp();
    mount.appendChild(built.root);
    attachSliderInteractions(built.sidebar);
  }

  function initializeApp() {
    if (!window.__EquivLang) window.__EquivLang = 'en';
    clearScheduled();
    if (introPulseInterval) {
      clearInterval(introPulseInterval);
      introPulseInterval = null;
    }
    appState = {
      phase: 'intro',
      lessonIndex: 0,
      headerKey: 'content-ui.instructions.intro_title',
      sliderValue: 0,
      sliderSnapBeforeDrag: 0,
      knifeLocked: false,
      knifeHidden: true,
      sliderHighlighted: false,
      introPulseSlot: 0,
      teeterNonce: 0,
      wrongPreviewParts: null,
      selected: [],
      showHand: false,
      flyingKnife: false,
      pulseTick: false,
      dimCols: [false, false, false],
      completed: [null, null, null],
      equivActive: false,
      finalActive: false,
      cutAnimStarted: false,
    };
    renderApp();
    startIntroSequence();
  }

  window.initializeApp = initializeApp;
  window.renderApp = renderApp;
})();
