// Lab assistant character rendered as SVG group.
// x, y: top-left anchor of the character area
// message: string to show in speech bubble
function LabAssistant(props){
  var h = window.MiniReact.h;
  var x = props.x || 1520;
  var y = props.y || 80;
  var message = props.message || '';

  // Character body measurements (relative to x, y)
  var headCX = x + 55;
  var headCY = y + 62;
  var headR  = 36;

  // Speech bubble to the left of character
  var bubbleW = 340;
  var bubbleH = 110;
  var bubbleX = x - bubbleW - 30;
  var bubbleY = y + 10;
  var bubbleTailX = bubbleX + bubbleW; // tail points right toward character

  var children = [];

  // ── Speech bubble ──────────────────────────────────────────
  // rounded rect
  children.push(
    h('rect', {
      x: bubbleX, y: bubbleY,
      width: bubbleW, height: bubbleH,
      rx: '16', ry: '16',
      fill: '#1e3a5a',
      stroke: '#4A90D9',
      'stroke-width': '2.5'
    })
  );
  // tail triangle pointing right
  var tailPoints = [
    (bubbleTailX) + ',' + (bubbleY + 38),
    (bubbleTailX + 22) + ',' + (bubbleY + 52),
    (bubbleTailX) + ',' + (bubbleY + 66)
  ].join(' ');
  children.push(
    h('polygon', {
      points: tailPoints,
      fill: '#1e3a5a',
      stroke: '#4A90D9',
      'stroke-width': '2.5'
    })
  );
  // cover bubble-rect edge behind tail
  children.push(
    h('line', {
      x1: bubbleTailX, y1: bubbleY + 40,
      x2: bubbleTailX, y2: bubbleY + 64,
      stroke: '#1e3a5a',
      'stroke-width': '3'
    })
  );

  // Bubble text — wrapped manually into lines
  var lines = wrapText(message, 34);
  var lineH = 22;
  var totalTextH = lines.length * lineH;
  var textStartY = bubbleY + (bubbleH - totalTextH) / 2 + lineH * 0.7;
  lines.forEach(function(line, i){
    children.push(
      h('text', {
        x: bubbleX + bubbleW / 2,
        y: textStartY + i * lineH,
        'text-anchor': 'middle',
        fill: '#e2e8f0',
        'font-size': '17',
        'font-family': 'Arial, sans-serif'
      }, line)
    );
  });

  // ── Character body ─────────────────────────────────────────
  // Lab coat body (torso)
  children.push(
    h('rect', {
      x: x + 22, y: y + 92,
      width: 66, height: 110,
      rx: '10', ry: '10',
      fill: '#d4e8f8',
      stroke: '#b0cce0',
      'stroke-width': '1.5'
    })
  );
  // Left arm
  children.push(
    h('rect', {
      x: x + 6, y: y + 98,
      width: 20, height: 72,
      rx: '8', ry: '8',
      fill: '#d4e8f8',
      stroke: '#b0cce0',
      'stroke-width': '1.5'
    })
  );
  // Right arm
  children.push(
    h('rect', {
      x: x + 84, y: y + 98,
      width: 20, height: 72,
      rx: '8', ry: '8',
      fill: '#d4e8f8',
      stroke: '#b0cce0',
      'stroke-width': '1.5'
    })
  );
  // Shirt / scrubs under coat (visible at collar)
  children.push(
    h('rect', {
      x: x + 34, y: y + 92,
      width: 42, height: 28,
      fill: '#3b82f6',
      rx: '4'
    })
  );
  // Lab coat lapels
  children.push(
    h('polygon', {
      points: [(x+34)+','+(y+92), (x+22)+','+(y+110), (x+34)+','+(y+116)].join(' '),
      fill: '#d4e8f8', stroke: '#b0cce0', 'stroke-width': '1'
    }),
    h('polygon', {
      points: [(x+76)+','+(y+92), (x+88)+','+(y+110), (x+76)+','+(y+116)].join(' '),
      fill: '#d4e8f8', stroke: '#b0cce0', 'stroke-width': '1'
    })
  );
  // Head
  children.push(
    h('circle', {
      cx: headCX, cy: headCY,
      r: headR,
      fill: '#f5cba7',
      stroke: '#d4a574',
      'stroke-width': '1.5'
    })
  );
  // Hair
  children.push(
    h('ellipse', {
      cx: headCX, cy: headCY - 18,
      rx: '37', ry: '24',
      fill: '#1a0a00'
    })
  );
  children.push(
    h('rect', {
      x: headCX - 37, y: headCY - 18,
      width: 74, height: 26,
      fill: '#1a0a00',
      rx: '4'
    })
  );
  // Eyes
  children.push(
    h('circle', { cx: headCX - 13, cy: headCY + 4, r: '5', fill: '#fff' }),
    h('circle', { cx: headCX + 13, cy: headCY + 4, r: '5', fill: '#fff' }),
    h('circle', { cx: headCX - 13, cy: headCY + 5, r: '3', fill: '#2d1a0a' }),
    h('circle', { cx: headCX + 13, cy: headCY + 5, r: '3', fill: '#2d1a0a' })
  );
  // Safety goggles on assistant (she IS wearing them — contrast with student)
  children.push(
    h('rect', {
      x: headCX - 28, y: headCY,
      width: 56, height: 16,
      rx: '6', ry: '6',
      fill: 'none',
      stroke: '#FFAB40',
      'stroke-width': '3'
    })
  );
  // Goggle lenses
  children.push(
    h('ellipse', { cx: headCX - 14, cy: headCY + 8, rx: '10', ry: '7', fill: 'rgba(100,200,255,0.25)', stroke: '#FFAB40', 'stroke-width': '1.5' }),
    h('ellipse', { cx: headCX + 14, cy: headCY + 8, rx: '10', ry: '7', fill: 'rgba(100,200,255,0.25)', stroke: '#FFAB40', 'stroke-width': '1.5' })
  );
  // Goggle strap
  children.push(
    h('line', {
      x1: headCX - 28, y1: headCY + 8,
      x2: headCX - 34, y2: headCY + 8,
      stroke: '#FFAB40', 'stroke-width': '2.5'
    }),
    h('line', {
      x1: headCX + 28, y1: headCY + 8,
      x2: headCX + 34, y2: headCY + 8,
      stroke: '#FFAB40', 'stroke-width': '2.5'
    })
  );
  // Smile
  children.push(
    h('path', {
      d: 'M '+(headCX-10)+','+(headCY+18)+' Q '+(headCX)+','+(headCY+26)+' '+(headCX+10)+','+(headCY+18),
      fill: 'none',
      stroke: '#8b5e3c',
      'stroke-width': '2',
      'stroke-linecap': 'round'
    })
  );
  // "Lab Assistant" badge
  children.push(
    h('rect', {
      x: x + 24, y: y + 122,
      width: 62, height: 18,
      rx: '4', fill: '#1e3a5a', stroke: '#4A90D9', 'stroke-width': '1'
    }),
    h('text', {
      x: x + 55, y: y + 134,
      'text-anchor': 'middle',
      fill: '#93c5fd',
      'font-size': '10',
      'font-family': 'Arial, sans-serif',
      'font-weight': 'bold'
    }, 'LAB GUIDE')
  );

  return h('g', { className: 'lab-assistant' }, children);
}

// Naive word-wrap: splits into lines of max `maxChars` characters
function wrapText(text, maxChars){
  var words = text.split(' ');
  var lines = [];
  var current = '';
  words.forEach(function(word){
    if ((current + ' ' + word).trim().length <= maxChars){
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

window.LabAssistant = LabAssistant;
