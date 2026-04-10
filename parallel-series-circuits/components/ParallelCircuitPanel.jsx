function ParallelCircuitPanel(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var bulbs = props.bulbs || []; // array of booleans (on/off)
  var brightnessPerBulb = 100;
  var n = Math.max(1, bulbs.length);
  var circuitW = 860;
  var dynamicGrow = (n - 1) * 140;
  var circuitH = 520 + dynamicGrow;
  var leftWireX = 120;
  var rightWireX = 710;
  var topY = 150;
  var bottomY = 300 + dynamicGrow;
  var bulbX = Math.round((leftWireX + rightWireX) / 2);
  var bulbHalf = 42;
  var batteryW = 220;
  var batteryH = 102;
  var batteryX = 242;
  var batteryY = 360 + dynamicGrow;
  var batteryTerminalInset = Math.round((batteryW * 16) / 180);
  var batteryTerminalY = Math.round((batteryH * 45) / 84);
  var batteryLeftTerminalX = batteryX + batteryTerminalInset;
  var batteryRightTerminalX = batteryX + batteryW - batteryTerminalInset;
  var batteryWireY = batteryY + batteryTerminalY;
  var branchTop = topY;
  var branchBottom = bottomY;
  var rectMidY = Math.round((branchTop + branchBottom) / 2);
  var leftBatteryJoinX = leftWireX - 34;
  var rightBatteryJoinX = rightWireX + 34;
  var bulbYOffset = -38;

  var bulbYs = [];
  var bi;
  for (bi = 0; bi < n; bi++) {
    bulbYs.push(
      n === 1
        ? branchTop
        : Math.round(branchTop + (bi / (n - 1)) * (branchBottom - branchTop))
    );
  }

  var activeCount = bulbs.reduce(function(acc, isOn){ return acc + (isOn ? 1 : 0); }, 0);
  var anyOn = activeCount > 0;
  var wireElements = [];
  var flowElements = [];
  var branchElements = [];
  var lineDefs = n === 1
    ? [
        { x1: leftWireX, y1: topY, x2: leftWireX, y2: batteryWireY, color: 'neg', key: 'l-rail' },
        { x1: batteryLeftTerminalX, y1: batteryWireY, x2: leftWireX, y2: batteryWireY, color: 'neg', key: 'l-bottom' },
        { x1: rightWireX, y1: topY, x2: rightWireX, y2: batteryWireY, color: 'pos', key: 'r-rail' },
        { x1: batteryRightTerminalX, y1: batteryWireY, x2: rightWireX, y2: batteryWireY, color: 'pos', key: 'r-bottom-wire' }
      ]
    : [
        // Small parallel rectangle rails
        { x1: leftWireX, y1: topY, x2: leftWireX, y2: bottomY, color: 'neg', key: 'l-rail' },
        { x1: rightWireX, y1: topY, x2: rightWireX, y2: bottomY, color: 'pos', key: 'r-rail' },
        // Left battery lead -> mid of left rail
        { x1: batteryLeftTerminalX, y1: batteryWireY, x2: leftBatteryJoinX, y2: batteryWireY, color: 'neg', key: 'l-bat-h1' },
        { x1: leftBatteryJoinX, y1: batteryWireY, x2: leftBatteryJoinX, y2: rectMidY, color: 'neg', key: 'l-bat-v' },
        { x1: leftBatteryJoinX, y1: rectMidY, x2: leftWireX, y2: rectMidY, color: 'neg', key: 'l-bat-h2' },
        // Right battery lead -> mid of right rail
        { x1: batteryRightTerminalX, y1: batteryWireY, x2: rightBatteryJoinX, y2: batteryWireY, color: 'pos', key: 'r-bat-h1' },
        { x1: rightBatteryJoinX, y1: batteryWireY, x2: rightBatteryJoinX, y2: rectMidY, color: 'pos', key: 'r-bat-v' },
        { x1: rightBatteryJoinX, y1: rectMidY, x2: rightWireX, y2: rectMidY, color: 'pos', key: 'r-bat-h2' }
      ];
  var li;
  for (li = 0; li < lineDefs.length; li++) {
    var ld = lineDefs[li];
    wireElements.push(h('line', {
      x1: String(ld.x1),
      y1: String(ld.y1),
      x2: String(ld.x2),
      y2: String(ld.y2),
      className: 'circuit-wire circuit-wire--' + ld.color,
      key: ld.key
    }));
    if (anyOn) {
      flowElements.push(h('line', {
        x1: String(ld.x1),
        y1: String(ld.y1),
        x2: String(ld.x2),
        y2: String(ld.y2),
        className: 'wire-flow',
        'stroke-width': '5',
        key: 'f-' + ld.key
      }));
    }
  }

  bulbs.forEach(function(isOn, idx){
    var by = bulbYs[idx];
    wireElements.push(h('line', {
      x1: String(leftWireX),
      y1: String(by),
      x2: String(bulbX - bulbHalf),
      y2: String(by),
      className: 'circuit-wire circuit-wire--neg',
      key: 'b-left-' + idx
    }));
    wireElements.push(h('line', {
      x1: String(bulbX + bulbHalf),
      y1: String(by),
      x2: String(rightWireX),
      y2: String(by),
      className: 'circuit-wire circuit-wire--pos',
      key: 'b-right-' + idx
    }));
    if (anyOn) {
      flowElements.push(h('line', { x1: String(leftWireX), y1: String(by), x2: String(bulbX - bulbHalf), y2: String(by), className: 'wire-flow', 'stroke-width': '4', key: 'fb-left-' + idx }));
      flowElements.push(h('line', { x1: String(bulbX + bulbHalf), y1: String(by), x2: String(rightWireX), y2: String(by), className: 'wire-flow', 'stroke-width': '4', key: 'fb-right-' + idx }));
    }

    branchElements.push(
      h('div', {
        className: 'circuit-overlay-item parallel-branch-bulb',
        style: {
          position: 'absolute',
          left: bulbX + 'px',
          top: (by + bulbYOffset) + 'px',
          transform: 'translate(-50%, -50%)'
        },
        key: 'bulb-' + idx
      },
        h(window.CircuitBulb, {
          brightness: brightnessPerBulb,
          isOn: isOn,
          size: 92,
          showPercent: true,
          percentAbove: true
        })
      )
    );
  });

  var scaleFactor = 0.78 - (n - 1) * 0.04;
  var scaledW = Math.round(circuitW * scaleFactor);
  var scaledH = Math.round(circuitH * scaleFactor);

  return h('div', { className: 'circuit-panel circuit-panel--parallel' },
    h('h3', { className: 'panel-title' }, t('content-ui.dialogs.parallel_title')),
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
        h('div', {
          style: { position: 'absolute', left: batteryX + 'px', top: batteryY + 'px' }
        }, h(window.Battery, { label: t('content-ui.labels.voltage'), orientation: 'horizontal', width: batteryW, height: batteryH })),
        branchElements
      )
    )
  );
}
window.ParallelCircuitPanel = ParallelCircuitPanel;
