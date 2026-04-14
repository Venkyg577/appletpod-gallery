/* global createElement, window */

const h = createElement;
const DPV = () => window.DecimalPlaceValue;

function AppletButton(props) {
  const { label, onClick, disabled, impending } = props;
  const stateClass = disabled ? 'applet-button--inactive' : 'applet-button--active';
  const imp = impending === 'clickNext' ? ' applet-button--clickNext' : '';
  const classes = 'applet-button applet-button--medium action-button ' + stateClass + imp;

  return h(
    'button',
    {
      className: classes,
      type: 'button',
      disabled: !!disabled,
      onClick: disabled
        ? null
        : function (e) {
            e.preventDefault();
            if (onClick) onClick(e);
          },
    },
    h(
      'div',
      { className: 'applet-button-frame' },
      h('div', { className: 'applet-button-content' }, h('span', { className: 'applet-button-text' }, label))
    )
  );
}

function placeClassForIndex(i) {
  if (i === 0) return 'grid-cell--tens';
  if (i === 1) return 'grid-cell--ones';
  if (i === 2) return 'grid-cell--tenths';
  if (i === 3) return 'grid-cell--hundredths';
  return 'grid-cell--thousandths';
}

function headerClassForIndex(i) {
  if (i === 0) return 'grid-cell--tens';
  if (i === 1) return 'grid-cell--ones';
  if (i === 2) return 'grid-cell--tenths';
  if (i === 3) return 'grid-cell--hundredths';
  return 'grid-cell--thousandths';
}

/**
 * Grid columns: T | O | dot | t | h | th
 * highlightGridColumn: 0-5 or null
 * pulsateCells: [{row:0|1, col:0-5}] or use pulsatePlaceIndex + two rows
 */
function PlaceValueGrid(props) {
  const {
    rowA,
    rowB,
    labels,
    highlightGridColumn,
    pulsateRow,
    pulsateDecimals,
    pulsateCells,
    emptyRowA,
    emptyRowB,
    revealA,
    revealB,
  } = props;

  const pulseSet = new Set();
  if (pulsateCells && pulsateCells.length) {
    pulsateCells.forEach(function (p) {
      pulseSet.add(p.row + '-' + p.col);
    });
  }

  function rowCells(slots, rowIndex, isEmpty, revealCount) {
    const cells = [];
    const display = isEmpty ? ['', '', '', '', ''] : slots.display;
    for (let i = 0; i < 6; i++) {
      if (i === 2) {
        const dotPulse = pulsateDecimals ? ' pulse-decimal' : '';
        cells.push(
          h(
            'div',
            {
              key: 'dot',
              className: 'grid-cell grid-cell--dot' + dotPulse,
            },
            h('div', { className: 'decimal-dot' })
          )
        );
        continue;
      }
      const di = i < 2 ? i : i - 1;
      var ch = display[di] === '' ? '' : display[di];
      if (revealCount != null && di >= revealCount) ch = '';
      var isPulsing = revealCount != null && di === revealCount - 1;
      const col = i;
      const highlight = highlightGridColumn === col ? ' column-highlight' : '';
      const pr = pulsateRow === rowIndex ? ' pulse-row' : '';
      const pc = (pulseSet.has(rowIndex + '-' + col) || isPulsing) ? ' pulse-cell' : '';
      cells.push(
        h(
          'div',
          {
            key: 'c' + i,
            className: 'grid-cell ' + placeClassForIndex(di) + highlight + pr + pc,
          },
          h('span', { className: 'interactive-text' }, isEmpty ? '' : ch)
        )
      );
    }
    return cells;
  }

  const sa = rowA && !emptyRowA ? DPV().getSlots(rowA) : null;
  const sb = rowB && !emptyRowB ? DPV().getSlots(rowB) : null;

  const headerCells = [];
  for (let i = 0; i < 6; i++) {
    if (i === 2) {
      headerCells.push(h('div', { key: 'hd', className: 'grid-cell grid-cell--dot grid-cell--header grid-cell--dot-header' }));
      continue;
    }
    const di = i < 2 ? i : i - 1;
    const lab = di === 0 ? labels.tens : di === 1 ? labels.ones : di === 2 ? labels.tenths : di === 3 ? labels.hundredths : labels.thousandths;
    headerCells.push(
      h(
        'div',
        {
          key: 'h' + i,
          className: 'grid-cell grid-cell--header ' + headerClassForIndex(di),
        },
        h('span', { className: 'interactive-text' }, lab)
      )
    );
  }

  return h(
    'div',
    { className: 'place-grid' },
    h('div', { className: 'grid-row grid-row--headers' }, headerCells),
    h('div', { className: 'grid-row', 'data-row': '0' }, rowCells(sa, 0, !sa || emptyRowA, revealA)),
    h('div', { className: 'grid-row', 'data-row': '1' }, rowCells(sb, 1, !sb || emptyRowB, revealB))
  );
}

function ColoredDecimalString(props) {
  const { value, pulseDecimalDot } = props;
  const s = DPV().getSlots(value);
  const seq = [
    { ch: s.tens === '' ? '\u00A0' : s.tens, k: 'tens' },
    { ch: s.ones, k: 'ones' },
    { ch: '.', k: 'dot' },
    { ch: s.tenths, k: 'tenths' },
    { ch: s.hundredths, k: 'hundredths' },
    { ch: s.thousandths, k: 'thousandths' },
  ];
  const fixClass = {
    tens: 'digit--tens',
    ones: 'digit--ones',
    tenths: 'digit--tenths',
    hundredths: 'digit--hundredths',
    thousandths: 'digit--thousandths',
  };
  const els = seq.map(function (item, idx) {
    if (item.k === 'dot') {
      const dotCls = 'decimal-point-char' + (pulseDecimalDot ? ' decimal-point-char--pulse' : '');
      return h('span', { key: 'e' + idx, className: dotCls }, '.');
    }
    return h('span', { key: 'e' + idx, className: fixClass[item.k] }, item.ch);
  });

  return h('span', { className: 'pair-item-inner' }, els);
}

function PairPicker(props) {
  const { problems, selectedIndex, onChangeIndex, showOperator, operator, pulseDecimalsActive, highlightPlace, stripOpChar, completedByIndex, showScrollHint, onFirstInteract } = props;
  const doneMap = completedByIndex || {};
  const visRadius = 3;
  const items = [];
  var hinted = false;

  function markInteracted() {
    if (hinted) return;
    hinted = true;
    if (onFirstInteract) onFirstInteract();
  }

  function nav(delta) {
    markInteracted();
    const next = Math.max(0, Math.min(problems.length - 1, selectedIndex + delta));
    onChangeIndex(next);
  }

  for (let o = -visRadius; o <= visRadius; o++) {
    const idx = selectedIndex + o;
    if (idx < 0 || idx >= problems.length) {
      items.push(h('div', { key: 'ph' + o, className: 'pair-item', style: { visibility: 'hidden' } }, '\u00A0'));
      continue;
    }
    const p = problems[idx];
    const isActive = o === 0;
    var dist = Math.abs(o);
    var isDone = !!doneMap[String(idx)];
    var cls = 'pair-item'
      + (isActive ? ' pair-item--active' : ' pair-item--near pair-item--dist-' + dist)
      + (isDone ? ' pair-item--done' : '');

    // Determine operator character
    var itemOp = isDone ? DPV().comparisonOperator(p.a, p.b) : null;
    var activeOpStr = stripOpChar || '?';
    var opChar = isDone && itemOp
      ? itemOp
      : isActive && showOperator && operator
        ? operator
        : isActive ? activeOpStr : '?';
    const pulseDot = !!(isActive && pulseDecimalsActive);

    // Build number displays
    var numAEl, numBEl;
    if (isActive && highlightPlace != null) {
      numAEl = HighlightedNumber({ value: p.a, highlightPlaceIndex: highlightPlace });
      numBEl = HighlightedNumber({ value: p.b, highlightPlaceIndex: highlightPlace });
    } else {
      numAEl = ColoredDecimalString({ value: p.a, pulseDecimalDot: pulseDot });
      numBEl = ColoredDecimalString({ value: p.b, pulseDecimalDot: pulseDot });
    }

    // Operator input box
    var opBoxCls = 'pair-item-op' + (isActive ? ' pair-item-op--active' : '') + (isDone ? ' pair-item-op--done' : '');
    var opBox = h('div', { className: opBoxCls }, h('span', null, opChar));

    var inner = h('div', { className: 'pair-item-inner' }, numAEl, opBox, numBEl);

    if (isActive) {
      var canUp = selectedIndex > 0;
      var canDown = selectedIndex < problems.length - 1;
      // Active row: arrows outside, outline only on inner
      items.push(
        h('div', { key: 'p' + idx, className: 'pair-item-active-row' },
          h('button', {
            type: 'button',
            className: 'pair-side-arrow pair-side-arrow--left' + (canUp ? '' : ' pair-side-arrow--disabled'),
            onClick: function () { nav(-1); },
            disabled: !canUp,
          }, '‹'),
          h('div', { className: cls }, inner),
          h('button', {
            type: 'button',
            className: 'pair-side-arrow pair-side-arrow--right' + (canDown ? '' : ' pair-side-arrow--disabled'),
            onClick: function () { nav(1); },
            disabled: !canDown,
          }, '›')
        )
      );
    } else {
      items.push(
        h('div', {
          key: 'p' + idx,
          className: cls,
          onClick: function () {
            markInteracted();
            onChangeIndex(idx);
          },
        }, inner)
      );
    }
  }

  return h(
    'div',
    {
      className: 'pair-picker',
      onWheel: function (e) {
        e.preventDefault();
        markInteracted();
        if (e.deltaY > 0) nav(1);
        else if (e.deltaY < 0) nav(-1);
      },
    },
    h('div', { className: 'pair-picker-window' }, items),
    showScrollHint ? h(
      'div',
      { className: 'gesture-hint gesture-hint--scroll', 'aria-hidden': 'true' },
      h('img', {
        className: 'gesture-hint-img',
        src: 'assets/finger swipe up.gif',
        alt: '',
        draggable: 'false',
      })
    ) : null,
    h('div', { className: 'scroll-hint interactive-text' }, 'Scroll to choose')
  );
}

function DraggableChip(props) {
  const { label, chipClass, visible, dataChip, style, onPointerDown, children } = props;
  const base = 'draggable-chip ' + (chipClass || '') + (!visible ? ' draggable-chip--hidden' : '');
  return h(
    'div',
    {
      className: base,
      'data-chip': dataChip,
      style: style || {},
      onPointerDown: visible ? onPointerDown : null,
    },
    h('span', { className: 'interactive-text' }, label),
    children || null
  );
}

function OperatorPicker(props) {
  const { onPick, disabled, wrongSym, wrongKey } = props;
  const symbols = ['<', '=', '>'];
  return h(
    'div',
    { className: 'operator-picker' },
    symbols.map(function (sym) {
      var isWrong = wrongSym === sym && wrongKey;
      var btnClass = 'operator-choice action-button' +
        (isWrong ? ' operator-choice--wrong' : '');
      return h(
        'button',
        {
          type: 'button',
          className: btnClass,
          key: 'op-' + sym + '-' + (isWrong ? wrongKey : '0'),
          disabled: !!disabled,
          onClick: function (e) {
            e.preventDefault();
            if (!disabled && onPick) onPick(sym);
          },
        },
        h('span', { className: 'interactive-text' }, sym)
      );
    })
  );
}

function HighlightedNumber(props) {
  const { value, highlightPlaceIndex } = props;
  const s = DPV().getSlots(value);
  const places = ['tens', 'ones', 'tenths', 'hundredths', 'thousandths'];
  const colorMap = {
    tens: '#58d98b',
    ones: '#c9a0dc',
    tenths: '#daa06d',
    hundredths: '#e07080',
    thousandths: '#6eb3ff',
  };
  var parts = [];
  // Build: tens ones . tenths hundredths thousandths
  for (var i = 0; i < 5; i++) {
    if (i === 2) {
      parts.push(
        h(
          'span',
          { key: 'dot', className: 'decimal-point-char', 'aria-hidden': 'true' },
          h('span', { className: 'decimal-point-dot' })
        )
      );
    }
    var ch = s.display[i];
    if (ch === '' && i === 0) { ch = '\u00A0'; }
    if (highlightPlaceIndex != null && i === highlightPlaceIndex) {
      parts.push(h('span', {
        key: 'p' + i,
        className: 'highlight-digit',
        style: { color: colorMap[places[i]], fontSize: '1.4em', fontWeight: 900 },
      }, ch));
    } else {
      parts.push(h('span', { key: 'p' + i }, ch));
    }
  }
  return h('span', { className: 'interactive-text' }, parts);
}

function NextChevron(props) {
  const { onClick, pulsate } = props;
  return h(
    'div',
    {
      className: 'next-chevron' + (pulsate ? ' next-chevron--pulse' : ''),
      onClick: onClick,
      role: 'button',
      tabIndex: 0,
      onKeydown: function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick(e);
        }
      },
    },
    '›'
  );
}

window.Components = {
  AppletButton,
  PlaceValueGrid,
  PairPicker,
  DraggableChip,
  NextChevron,
  ColoredDecimalString,
  OperatorPicker,
  HighlightedNumber,
};
