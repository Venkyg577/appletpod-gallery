function SeriesCircuitPanel(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var bulbCount = props.bulbCount || 2;
  var masterOn = props.masterOn !== false;

  // In series: all bulbs share voltage equally
  var brightnessPerBulb = masterOn ? Math.round(100 / bulbCount) : 0;

  var circuitW = 860;
  var circuitH = 520;
  var leftWireX = 120;
  var rightWireX = 710;
  var topY = 92;
  var bottomY = 410;
  var batteryW = 180;
  var batteryH = 84;
  var batteryX = 262;
  var batteryY = 424;
  var batteryLeftTerminalX = batteryX + 16;
  var batteryRightTerminalX = batteryX + batteryW - 16;
  var batteryWireY = batteryY + 45;
  var bulbY = topY;
  var bulbHalf = 42;
  var leftBound = leftWireX + 130;
  var rightBound = rightWireX - 110;

  var bxList = [];
  var bi;
  for (bi = 0; bi < bulbCount; bi++) {
    bxList.push(
      bulbCount === 1
        ? Math.round((leftBound + rightBound) / 2)
        : Math.round(leftBound + (bi / (bulbCount - 1)) * (rightBound - leftBound))
    );
  }

  var wireElements = [];
  var flowElements = [];
  var overlayElements = [];
  var frameLines = [
    { x1: batteryLeftTerminalX, y1: batteryWireY, x2: leftWireX, y2: batteryWireY, color: 'neg', k: 'w-bot-l' },
    { x1: leftWireX, y1: batteryWireY, x2: leftWireX, y2: topY, color: 'neg', k: 'w-left' },
    { x1: rightWireX, y1: topY, x2: rightWireX, y2: batteryWireY, color: 'pos', k: 'w-right' },
    { x1: batteryRightTerminalX, y1: batteryWireY, x2: rightWireX, y2: batteryWireY, color: 'pos', k: 'w-bot-r' }
  ];
  frameLines.forEach(function(l){
    wireElements.push(h('line', {
      x1: String(l.x1),
      y1: String(l.y1),
      x2: String(l.x2),
      y2: String(l.y2),
      className: 'circuit-wire circuit-wire--' + l.color,
      key: l.k
    }));
    if (masterOn) {
      flowElements.push(h('line', { x1: String(l.x1), y1: String(l.y1), x2: String(l.x2), y2: String(l.y2), className: 'wire-flow', 'stroke-width': '5', key: 'f-' + l.k }));
    }
  });

  // Top wire segments between bulb terminals
  if (bulbCount >= 1) {
    var b0 = bxList[0];
    wireElements.push(h('line', {
      x1: String(leftWireX),
      y1: String(bulbY),
      x2: String(b0 - bulbHalf),
      y2: String(bulbY),
      className: 'circuit-wire circuit-wire--neg',
      key: 'sw-l-0'
    }));
    if (masterOn) {
      flowElements.push(h('line', { x1: String(leftWireX), y1: String(bulbY), x2: String(b0 - bulbHalf), y2: String(bulbY), className: 'wire-flow', 'stroke-width': '4', key: 'fs-l-0' }));
    }
    for (bi = 1; bi < bulbCount; bi++) {
      var wireColor = (bi === bulbCount - 1) ? 'pos' : 'mid';
      wireElements.push(h('line', {
        x1: String(bxList[bi - 1] + bulbHalf),
        y1: String(bulbY),
        x2: String(bxList[bi] - bulbHalf),
        y2: String(bulbY),
        className: 'circuit-wire circuit-wire--' + wireColor,
        key: 'sw-m-' + bi
      }));
      if (masterOn) {
        flowElements.push(h('line', {
          x1: String(bxList[bi - 1] + bulbHalf),
          y1: String(bulbY),
          x2: String(bxList[bi] - bulbHalf),
          y2: String(bulbY),
          className: 'wire-flow',
          'stroke-width': '4',
          key: 'fs-m-' + bi
        }));
      }
    }
    var bLast = bxList[bulbCount - 1];
    wireElements.push(h('line', {
      x1: String(bLast + bulbHalf),
      y1: String(bulbY),
      x2: String(rightWireX),
      y2: String(bulbY),
      className: 'circuit-wire circuit-wire--pos',
      key: 'sw-r-end'
    }));
    if (masterOn) {
      flowElements.push(h('line', { x1: String(bLast + bulbHalf), y1: String(bulbY), x2: String(rightWireX), y2: String(bulbY), className: 'wire-flow', 'stroke-width': '4', key: 'fs-r-end' }));
    }
  }

  // Bulb overlays
  for (bi = 0; bi < bulbCount; bi++) {
    var bx = bxList[bi];
    overlayElements.push(
      h('div', {
        className: 'circuit-overlay-item series-circuit-bulb',
        style: {
          position: 'absolute',
          left: bx + 'px',
          top: bulbY + 'px',
          transform: 'translate(-50%, -50%)'
        },
        key: 'bulb-s-' + bi
      },
        h(window.CircuitBulb, {
          brightness: brightnessPerBulb,
          isOn: masterOn,
          size: 78,
          showPercent: true
        })
      )
    );
  }

  var scaleFactor = 0.78;
  var scaledW = Math.round(circuitW * scaleFactor);
  var scaledH = Math.round(circuitH * scaleFactor);

  return h('div', { className: 'circuit-panel circuit-panel--series' },
    h('h3', { className: 'panel-title' }, t('content-ui.dialogs.series_title')),
    h('div', { className: 'circuit-diagram-container', style: { width: scaledW + 'px', height: scaledH + 'px', overflow: 'visible' } },
      h('div', {
        className: 'circuit-scale-wrapper',
        style: {
          width: circuitW + 'px',
          height: circuitH + 'px',
          transform: 'scale(' + scaleFactor + ')',
          transformOrigin: 'top left',
          position: 'relative'
        }
      },
        h('svg', { width: String(circuitW), height: String(circuitH), viewBox: '0 0 ' + circuitW + ' ' + circuitH, style: { position: 'absolute', top: '0', left: '0', overflow: 'visible' } },
          wireElements,
          flowElements
        ),
        h('div', { style: { position: 'absolute', left: batteryX + 'px', top: batteryY + 'px' } },
          h(window.Battery, { label: t('content-ui.labels.voltage'), orientation: 'horizontal', width: batteryW, height: batteryH })
        ),
        overlayElements
      )
    )
  );
}
window.SeriesCircuitPanel = SeriesCircuitPanel;
