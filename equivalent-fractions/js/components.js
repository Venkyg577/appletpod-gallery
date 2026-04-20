/* global window */
(function () {
  const el = window.createElement;

  function t(path) {
    return window.utils.getText(path);
  }

  /** @returns {SVGElement} */
  function knifeSvg() {
    return el(
      'svg',
      {
        className: 'equiv-knife-svg',
        width: '72',
        height: '40',
        viewBox: '0 0 72 40',
        'aria-hidden': 'true',
      },
      el('path', {
        d: 'M4 20 L44 8 L52 12 L54 22 L48 28 L8 32 Z',
        fill: '#c8d4e0',
        stroke: '#6b7a8f',
        strokeWidth: '1',
      }),
      el('path', {
        d: 'M44 8 L68 4 L70 14 L52 12 Z',
        fill: '#f1c40f',
        stroke: '#bfa70b',
        strokeWidth: '1',
      }),
      el('circle', { cx: '58', cy: '18', r: '5', fill: '#3498db', stroke: '#2576b6', strokeWidth: '1' }),
      el('circle', { cx: '62', cy: '22', r: '3', fill: '#5eb2e7' })
    );
  }

  function handSvg() {
    return el(
      'svg',
      {
        className: 'equiv-hand-svg',
        width: '72',
        height: '72',
        viewBox: '0 0 72 72',
        'aria-hidden': 'true',
      },
      el('path', {
        d: 'M28 8 C22 8 18 14 20 22 L24 48 C25 54 30 58 36 58 L44 58 C50 58 54 52 52 46 L48 28 C46 18 38 8 28 8 Z',
        fill: '#fff',
        stroke: '#ccc',
        strokeWidth: '1.5',
      }),
      el('path', {
        d: 'M32 24 L36 50',
        stroke: '#ddd',
        strokeWidth: '2',
        strokeLinecap: 'round',
      })
    );
  }

  /**
   * @param {object} opts
   * @param {number} opts.topPx
   * @param {number} opts.midPx
   * @param {number} opts.botPx
   * @param {number} [opts.zeroPx]
   * @param {0|2|4|6} opts.value
   * @param {2|4|6} opts.expectedParts
   * @param {boolean} opts.highlightTrack
   * @param {boolean} opts.pulseTargetTick
   * @param {boolean} opts.locked
   * @param {boolean} opts.hiddenKnife
   * @param {boolean} [opts.showSwipeHint]
   * @param {boolean} opts.interactive
   */
  function buildSidebar(opts) {
    const wrap = el('div', {
      className:
        'equiv-slider-wrap' + (opts.highlightTrack ? ' equiv-slider-wrap--highlight' : ''),
    });

    wrap.appendChild(el('div', { className: 'equiv-slider-track' }));
    const zeroPx = typeof opts.zeroPx === 'number' ? opts.zeroPx : opts.botPx + 56;

    const ticks = [
      { v: 6, y: opts.topPx },
      { v: 4, y: opts.midPx },
      { v: 2, y: opts.botPx },
      { v: 0, y: zeroPx },
    ];

    ticks.forEach(function (tick) {
      const row = el('div', {
        className: 'equiv-slider-tick',
        style: { top: tick.y + 'px' },
      });
      row.dataset.value = String(tick.v);
      row.appendChild(el('div', { className: 'equiv-slider-tick-line' }));
      const isActive = tick.v === opts.value;
      const num = el(
        'div',
        {
          className:
            'equiv-slider-tick-num' +
            (isActive ? ' equiv-slider-tick-num--active' : ' equiv-slider-tick-num--dim') +
            (isActive && tick.v === 0 ? ' equiv-slider-tick-num--zero-active' : '') +
            (opts.pulseTargetTick && isActive ? ' equiv-slider-tick-num--pulse' : ''),
        },
        String(tick.v)
      );
      row.appendChild(num);
      wrap.appendChild(row);
    });

    const knife = el(
      'div',
      {
        className:
          'equiv-knife' +
          (opts.locked ? ' equiv-knife--locked' : '') +
          (opts.hiddenKnife ? ' equiv-knife--hidden' : ''),
        style: {
          top: knifeTopForValue(opts.value, opts.topPx, opts.midPx, opts.botPx, zeroPx) + 'px',
        },
      },
      knifeSvg()
    );
    knife.dataset.role = 'knife';
    wrap.appendChild(knife);

    if (opts.showSwipeHint) {
      const knifeTop = knifeTopForValue(opts.value, opts.topPx, opts.midPx, opts.botPx, zeroPx);
      wrap.appendChild(
        el('img', {
          className: 'equiv-slider-swipe',
          src: 'assets/images/fingerSwipeUp.png',
          alt: 'Swipe up',
          style: {
            top: knifeTop + 18 + 'px',
          },
        })
      );
    }

    const sidebar = el('div', { className: 'equiv-sidebar' });
    sidebar.appendChild(
      el('div', { className: 'equiv-sidebar-title interactive-text' }, t('content-ui.sidebar.divide_title'))
    );
    sidebar.appendChild(wrap);
    sidebar.appendChild(
      el(
        'div',
        {
          className: 'equiv-whole-btn interactive-text' + (opts.wholePulse ? ' equiv-whole-btn--pulse' : ''),
        },
        t('content-ui.sidebar.one_whole')
      )
    );
    return { sidebar: sidebar, sliderWrap: wrap, knife: knife };
  }

  function knifeTopForValue(value, topPx, midPx, botPx, zeroPx) {
    if (value === 6) return topPx - 10;
    if (value === 4) return midPx - 10;
    if (value === 2) return botPx - 10;
    if (value === 0) return (typeof zeroPx === 'number' ? zeroPx : botPx + 56) - 10;
    return botPx - 10;
  }

  function sliderStopMap(wrapHeight) {
    const topPad = 44;
    const bottomPad = 4;
    const top = topPad;
    const zero = Math.max(topPad, wrapHeight - bottomPad);
    const step = (zero - top) / 3;
    return {
      6: top,
      4: top + step,
      2: top + step * 2,
      0: zero,
    };
  }

  window.EquivUI = {
    knifeSvg: knifeSvg,
    handSvg: handSvg,
    buildSidebar: buildSidebar,
    knifeTopForValue: knifeTopForValue,
    sliderStopMap: sliderStopMap,
  };
})();
