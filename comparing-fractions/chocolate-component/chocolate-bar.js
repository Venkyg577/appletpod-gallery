/* ChocolateBar – self-contained SVG component for the fraction applet.
   Renders a brown gradient chocolate bar with optional partition lines,
   a shaded segment, a tap-selected glow, an outline pulse, dim state,
   and a floating fraction label below it. */

(function () {
  const h = window.createElement;

  const SMALL_SIZE = 300;
  const LARGE_SIZE = 460;

  function sizeFor(size, normalized) {
    if (size === 'small') return normalized ? LARGE_SIZE : SMALL_SIZE;
    return LARGE_SIZE;
  }

  function ChocolateBar(props) {
    const {
      id,
      size = 'small',          /* 'small' | 'large' */
      parts = 0,                /* 0 | 2 | 3 | 5 */
      shadedIndex = null,       /* highlighted segment index */
      shadedIndices = null,     /* multiple highlighted segments */
      dimUnshaded = false,      /* dim non-selected halves after selection */
      outlinePulse = false,     /* pulsate the whole-bar outline */
      outlinePulseDelay = '0s', /* delay whole-bar pulse for sequenced teaching screens */
      selected = false,         /* outer glow when bar is tap-selected */
      resizeAnimation = null,   /* { fromSize, toSize, duration? } smooth make-same-size animation */
      faded = false,            /* fade entire bar (used during overlap source) */
      dimLabels = false,        /* dim segment numbers + fraction chip for ghost bars */
      teeter = false,           /* shake (wrong tap on the bar) */
      normalized = false,       /* small bar resized to large width */
      sliding = null,           /* { dx, dy, scale?, origin?, duration?, keyframes? } overlap animation */
      fractionLabel = null,     /* '1/2' | '1/3' floating chip in top-half of fraction zone */
      pulseFraction = false,    /* pulse the fraction chip for result emphasis */
      showSegmentNumbers = true,/* hide 1..n labels for de-emphasized ghost bars */
      barLabel = null,          /* small label below the bar */
      barControls = null,       /* option buttons rendered in bottom-half of fraction zone */
      pulsateHalves = false,    /* pulse all segments (S4/S7 prompt) */
      pulseSegment = null,      /* index of single segment to pulse (S18, S31) */
      pulseSegmentDelay = '0s', /* delay segment pulse for sequenced highlight */
      staggerPulse = false,     /* alternate full-bar outline and segment pulses */
      segmentSlide = null,      /* { index, dx, dy, duration?, misalign? } move only one segment */
      segmentLabels = null,     /* { [segmentIndex]: 'label' } rendered centered in segment */
      tapHint = false,          /* show tap-finger cue when user should tap a segment */
      splitAnimate = false,     /* legacy prop (no-op; split animation removed) */
      onTapSegment = null,
      onTapBar = null,
      extraClass = '',
    } = props;

    const s = sizeFor(size, normalized);
    const w = s;
    const BAR_HEIGHT = s;
    const segments = parts > 0 ? parts : 1;
    const pieceGap = segments > 1 ? 6 : 0;
    const segWidth = (w - pieceGap * (segments - 1)) / segments;
    const gradId = 'chocGrad-' + (id || size + '-' + parts + '-' + Math.floor(Math.random() * 1e6));
    const shadeIds = new Set();
    if (shadedIndex != null) shadeIds.add(shadedIndex);
    if (Array.isArray(shadedIndices)) shadedIndices.forEach((i) => shadeIds.add(i));

    const wrapperClasses = [
      'chocolate-bar',
      'chocolate-bar--' + size,
      normalized ? 'chocolate-bar--normalized' : '',
      outlinePulse ? 'chocolate-bar--outline-pulse' : '',
      staggerPulse ? 'chocolate-bar--stagger-pulse' : '',
      selected ? 'chocolate-bar--selected' : '',
      resizeAnimation ? 'chocolate-bar--resize-animate' : '',
      segmentSlide ? 'chocolate-bar--segment-flight' : '',
      faded ? 'chocolate-bar--faded' : '',
      dimLabels ? 'chocolate-bar--dim-labels' : '',
      teeter ? 'chocolate-bar--teeter' : '',
      sliding && sliding.keyframes
        ? (sliding.misalign ? 'chocolate-bar--keyframe-slide-misalign' : 'chocolate-bar--keyframe-slide')
        : '',
      tapHint ? 'chocolate-bar--tap-hint' : '',
      onTapBar ? 'chocolate-bar--tappable' : '',
      extraClass,
    ].filter(Boolean).join(' ');

    const wrapperStyle = {};
    if (outlinePulseDelay) {
      wrapperStyle['--outline-pulse-delay'] = outlinePulseDelay;
    }
    if (pulseSegmentDelay) {
      wrapperStyle['--pulse-segment-delay'] = pulseSegmentDelay;
    }
    if (resizeAnimation) {
      wrapperStyle['--resize-from-size'] = `${resizeAnimation.fromSize || s}px`;
      wrapperStyle['--resize-to-size'] = `${resizeAnimation.toSize || s}px`;
      wrapperStyle['--resize-duration'] = resizeAnimation.duration || '1.2s';
    }
    if (sliding) {
      wrapperStyle.zIndex = '40';
      if (sliding.keyframes) {
        wrapperStyle['--slide-dx'] = `${sliding.dx || 0}px`;
        wrapperStyle['--slide-dy'] = `${sliding.dy || 0}px`;
        wrapperStyle['--slide-scale'] = String(sliding.scale || 1);
        wrapperStyle['--slide-origin'] = sliding.origin || 'top left';
        wrapperStyle['--slide-duration'] = sliding.duration || '1.4s';
      } else {
        wrapperStyle.transform = `translate(${sliding.dx || 0}px, ${sliding.dy || 0}px) scale(${sliding.scale || 1})`;
        wrapperStyle.transition = `transform ${sliding.duration || '1.4s'} ease-in-out`;
        /* Top-left origin so translate(dx,dy) aligns bar corners; override per screen if needed */
        wrapperStyle.transformOrigin = sliding.origin || 'top left';
      }
    }

    /* Build SVG segments */
    const segmentsEls = [];
    for (let i = 0; i < segments; i++) {
      const x = i * (segWidth + pieceGap);
      const isShaded = shadeIds.has(i);
      const isDim = dimUnshaded && shadeIds.size > 0 && !isShaded;
      const isPulseSeg = pulseSegment === i;
      const isSlidingSeg = segmentSlide && segmentSlide.index === i;
      const segClass = [
        'chocolate-segment',
        isShaded ? 'chocolate-segment--shaded' : '',
        isDim ? 'chocolate-segment--dim' : '',
        pulsateHalves ? 'chocolate-segment--pulse' : '',
        isPulseSeg ? 'chocolate-segment--pulse-one' : '',
        onTapSegment && parts > 0 ? 'chocolate-segment--tappable' : '',
      ].filter(Boolean).join(' ');

      const segChildren = [
        h('rect', {
          x: 0,
          y: 0,
          width: segWidth,
          height: BAR_HEIGHT,
          fill: `url(#${gradId})`,
          stroke: 'none',
        }),
      ];

      if (isShaded) {
        segChildren.push(
          h('rect', {
            x: 0,
            y: 0,
            width: segWidth,
            height: BAR_HEIGHT,
            /* Keep shading in brown family; avoid color-shifting to orange */
            fill: 'rgba(58, 27, 7, 0.38)',
            className: 'chocolate-segment-shade',
          })
        );
        /* Subtle pattern inside shaded segment so it reads even when dimmed nearby */
        segChildren.push(
          h('rect', {
            x: 0,
            y: 0,
            width: segWidth,
            height: BAR_HEIGHT,
            fill: 'url(#hatch-' + gradId + ')',
            opacity: 0.32,
          })
        );
      }

      if (isPulseSeg || isSlidingSeg) {
        segChildren.push(
          h('rect', {
            x: 4,
            y: 4,
            width: Math.max(0, segWidth - 8),
            height: BAR_HEIGHT - 8,
            fill: 'none',
            rx: 5,
            className: 'chocolate-segment-focus-outline',
          })
        );
      }

      if (segmentLabels && segmentLabels[i]) {
        const words = String(segmentLabels[i]).split(/\s+/);
        segChildren.push(
          h(
            'text',
            {
              x: segWidth / 2,
              y: BAR_HEIGHT / 2 - (words.length > 1 ? 11 : 0),
              className: 'chocolate-segment-label',
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
            },
            words.map((word, idx) =>
              h(
                'tspan',
                {
                  key: 'word-' + idx,
                  x: segWidth / 2,
                  dy: idx === 0 ? 0 : 26,
                },
                word
              )
            )
          )
        );
      }

      const innerClasses = [
        'chocolate-segment-body',
        isSlidingSeg
          ? (segmentSlide.misalign ? 'chocolate-segment-body--slide-misalign' : 'chocolate-segment-body--slide')
          : '',
      ].filter(Boolean).join(' ');
      const innerStyle = isSlidingSeg
        ? {
          '--seg-slide-dx': `${segmentSlide.dx || 0}px`,
          '--seg-slide-dy': `${segmentSlide.dy || 0}px`,
          '--seg-slide-duration': segmentSlide.duration || '4.8s',
        }
        : null;

      const segEl = h(
        'g',
        {
          className: segClass,
          transform: `translate(${x}, 0)`,
          'data-segment-index': String(i),
          onClick: onTapSegment && parts > 0 ? (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            onTapSegment(i);
          } : null,
        },
        h('g', { className: innerClasses, style: innerStyle }, segChildren)
      );
      segmentsEls.push(segEl);
    }

    const defs = h(
      'defs',
      null,
      h(
        'linearGradient',
        { id: gradId, x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
        h('stop', { offset: '0%', 'stop-color': '#4A2510' }),
        h('stop', { offset: '100%', 'stop-color': '#4A2510' })
      ),
      /* hatch pattern for shaded segment */
      h(
        'pattern',
        {
          id: 'hatch-' + gradId,
          patternUnits: 'userSpaceOnUse',
          width: 14,
          height: 14,
          patternTransform: 'rotate(45)',
        },
        h('rect', { x: 0, y: 0, width: 14, height: 14, fill: 'transparent' }),
        h('line', { x1: 0, y1: 0, x2: 0, y2: 14, stroke: 'rgba(255, 255, 255, 0.35)', 'stroke-width': 3 })
      )
    );

    const svg = h(
      'svg',
      {
        className: 'chocolate-bar-svg',
        viewBox: `0 0 ${w} ${BAR_HEIGHT}`,
        width: w,
        height: BAR_HEIGHT,
        preserveAspectRatio: 'none',
        onClick: onTapBar ? (e) => {
          e.stopPropagation();
          onTapBar();
        } : null,
      },
      defs,
      h(
        'g',
        { className: 'chocolate-bar-body' },
        segmentsEls
      ),
      /* outline rect for pulse animation */
      h('rect', {
        x: 1, y: 1,
        width: w - 2, height: BAR_HEIGHT - 2,
        fill: 'none',
        stroke: '#FFFFFF',
        'stroke-width': 4,
        rx: 6,
        className: 'chocolate-bar-outline',
      })
    );

    const fractionChip = fractionLabel
      ? h(
          'div',
          { className: 'fraction-floating fraction-floating--md' + (pulseFraction ? ' fraction-floating--pulse' : '') },
          h('span', { className: 'frac-num' }, fractionLabel.num),
          h('span', { className: 'frac-den' }, fractionLabel.den)
        )
      : null;

    const labelEl = barLabel
      ? h('div', { className: 'bar-label interactive-text' }, barLabel)
      : null;

    const segmentNumbers = parts > 0 && showSegmentNumbers
      ? h(
          'div',
          { className: 'segment-numbers', style: { width: w + 'px' } },
          Array.from({ length: segments }, (_, i) =>
            h('div', { key: 'sn' + i, className: 'segment-number' }, String(i + 1))
          )
        )
      : null;

    return h(
      'div',
      { className: 'bar-with-label' },
      h(
        'div',
        { className: 'bar-chocolate-area' },
        h('div', { className: 'bar-labels-row' }, segmentNumbers),
        h(
          'div',
          { className: 'bar-svg-zone' },
          h(
            'div',
            {
              className: wrapperClasses,
              style: wrapperStyle,
              'data-size': size,
              'data-bar-id': id || '',
            },
            svg
          ),
          labelEl
        )
      ),
      h(
        'div',
        { className: 'bar-fraction-area' },
        h('div', { className: 'bar-fraction-top' }, fractionChip),
        h('div', { className: 'bar-fraction-bottom' }, barControls || null)
      )
    );
  }

  /* Helper: render fraction chip standalone (e.g. "=" sign in S25). */
  function FractionChip(num, den, sizeClass) {
    return h(
      'div',
      { className: 'fraction-floating ' + (sizeClass || 'fraction-floating--md') },
      h('span', { className: 'frac-num' }, num),
      h('span', { className: 'frac-den' }, den)
    );
  }

  function PlainSymbol(symbol) {
    return h(
      'div',
      { className: 'plain-symbol interactive-text' },
      symbol
    );
  }

  window.ChocolateBarComponent = {
    ChocolateBar,
    FractionChip,
    PlainSymbol,
    SIZE_SMALL: SMALL_SIZE,
    SIZE_LARGE: LARGE_SIZE,
  };
})();
