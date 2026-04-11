function CircuitBulb(props){
  var h = window.MiniReact.h;
  var brightness = props.brightness || 0;
  var isOn = props.isOn !== false;
  var size = props.size || 90;
  var showPercent = props.showPercent !== false;
  var percentAbove = props.percentAbove === true;
  var onClick = props.onClick || null;
  /** 'full' = SVG + CSS drop-shadow (series / dim bulbs). 'bulb' = SVG only, tight — avoids boxy outline on parallel @ 100%. */
  var glowMode = props.glowMode === 'bulb' ? 'bulb' : 'full';

  var effectiveBrightness = isOn ? brightness : 0;
  var b = effectiveBrightness / 100;
  // sqrt boosts low brightness so series (shared voltage) still shows a clear outer halo
  var glowFactor = Math.sqrt(Math.max(0, b));
  // Cap glow so 100% reads strong but not harsh (visual only; % label unchanged)
  var glowOpacity = Math.min(0.72, 0.17 + glowFactor * 0.58);
  var glowRadius;
  var glowRadiusOuter;
  var svgOpBoost = 1;
  if (glowMode === 'bulb') {
    glowRadius = Math.round(9 + glowFactor * 16);
    glowRadiusOuter = Math.round(14 + glowFactor * 20);
    svgOpBoost = 1.12;
  } else {
    glowRadius = Math.round(12 + glowFactor * 40);
    glowRadiusOuter = Math.round(22 + glowFactor * 36);
  }
  var bulbFill = effectiveBrightness > 0
    ? 'rgb(' + Math.round(255) + ',' + Math.round(218 + (effectiveBrightness / 100) * 28) + ',' + Math.round(68 + (1 - effectiveBrightness / 100) * 110) + ')'
    : '#555';
  var percentVal = Math.round(effectiveBrightness);

  var clickProps = onClick ? { onClick: onClick, style: { cursor: 'pointer' } } : {};

  var bulbClass = 'circuit-bulb' + (effectiveBrightness > 0 ? ' circuit-bulb--lit' : '') + (percentAbove ? ' circuit-bulb--percent-above' : '');

  var percentEl = showPercent ? h('div', {
    className: 'circuit-bulb-percent' + (effectiveBrightness === 0 ? ' circuit-bulb-percent--off' : ''),
    style: { pointerEvents: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }
  }, percentVal + '%') : null;

  var blurOuter = Math.round(4 + b * 22);
  var blurMid = Math.max(4, Math.round(blurOuter * 0.45));
  var dsA1 = Math.min(0.68, 0.18 + b * 0.52);
  var dsA2 = Math.min(0.55, 0.1 + b * 0.4);
  var outerGlowStyle = { overflow: 'visible' };
  if (effectiveBrightness > 0 && glowMode === 'full') {
    outerGlowStyle.filter = 'drop-shadow(0 0 ' + blurOuter + 'px rgba(255,200,55,' + dsA1.toFixed(3) + ')) drop-shadow(0 0 ' + blurMid + 'px rgba(255,245,200,' + dsA2.toFixed(3) + ')) drop-shadow(0 0 ' + Math.round(blurOuter * 0.28) + 'px rgba(255,220,100,' + (dsA1 * 0.45).toFixed(3) + '))';
  }

  var svgEl = h('svg', {
      width: String(size), height: String(Math.round(size * 1.3)),
      viewBox: '0 0 90 117',
      className: 'circuit-bulb-svg'
    },
      // Soft outer halos (SVG) — extra layer beyond glass for low brightness
      effectiveBrightness > 0 ? h('circle', {
        cx: '45', cy: '38', r: String(glowRadiusOuter),
        fill: 'rgba(255,220,80,' + Math.min(0.9, glowOpacity * 0.22 * svgOpBoost).toFixed(2) + ')',
        className: 'bulb-glow-outer'
      }) : null,
      effectiveBrightness > 0 ? h('circle', {
        cx: '45', cy: '38', r: String(glowRadius),
        fill: 'rgba(255,235,120,' + Math.min(0.92, glowOpacity * 0.48 * svgOpBoost).toFixed(2) + ')',
        className: 'bulb-glow'
      }) : null,
      effectiveBrightness > 0 ? h('circle', {
        cx: '45', cy: '38', r: String(Math.round(glowRadius * 0.58)),
        fill: 'rgba(255,255,210,' + Math.min(0.88, glowOpacity * 0.42 * svgOpBoost).toFixed(2) + ')',
        className: 'bulb-glow-inner'
      }) : null,
      // Bulb glass (softer edge when parallel bulb-mode + lit so glow reads as on-glass, not extra outline)
      h('ellipse', {
        cx: '45', cy: '38', rx: '28', ry: '32',
        fill: bulbFill,
        stroke: effectiveBrightness > 0 && glowMode === 'bulb' ? 'rgba(190,190,190,0.45)' : '#aaa',
        'stroke-width': effectiveBrightness > 0 && glowMode === 'bulb' ? '1.5' : '2',
        className: 'bulb-glass'
      }),
      // Filament
      h('path', {
        d: 'M38 50 Q40 35 42 45 Q44 30 46 45 Q48 35 50 50',
        fill: 'none',
        stroke: effectiveBrightness > 0 ? '#FFD700' : '#777',
        'stroke-width': '2.5',
        'stroke-linecap': 'round'
      }),
      // Base/screw
      h('rect', { x: '32', y: '68', width: '26', height: '20', rx: '3', fill: '#888', stroke: '#666', 'stroke-width': '1' }),
      h('line', { x1: '32', y1: '74', x2: '58', y2: '74', stroke: '#555', 'stroke-width': '1.5' }),
      h('line', { x1: '32', y1: '80', x2: '58', y2: '80', stroke: '#555', 'stroke-width': '1.5' }),
      // Contact at bottom
      h('rect', { x: '38', y: '88', width: '14', height: '6', rx: '2', fill: '#666' })
    );

  var svgWrapped = h('div', {
    className: 'circuit-bulb-svg-outer' + (effectiveBrightness > 0 ? ' circuit-bulb-svg-outer--lit' : ''),
    style: outerGlowStyle
  }, svgEl);

  return h('div', Object.assign({ className: bulbClass }, clickProps),
    percentAbove ? (percentEl ? [percentEl, svgWrapped] : [svgWrapped]) : [svgWrapped, percentEl].filter(Boolean)
  );
}
window.CircuitBulb = CircuitBulb;
