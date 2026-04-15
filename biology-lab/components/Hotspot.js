// Hotspot indicator rendered as an SVG group.
// cx, cy: center position in SVG space
// id: hotspot id (hs1-hs5)
// number: display number (1-5)
// phase: 'default' | 'selecting' | 'evaluating'
// isSelected: bool (pre-submit)
// isCorrect: bool (whether this hotspot IS a violation)
// wasSelected: bool (was it selected when submitted)
function Hotspot(props){
  var h = window.MiniReact.h;
  var cx = props.cx;
  var cy = props.cy;
  var id = props.id;
  var number = props.number;
  var phase = props.phase;
  var isSelected = props.isSelected;
  var isCorrect = props.isCorrect;
  var wasSelected = props.wasSelected;
  var evaluated = phase === 'evaluating';

  var R = 38; // main circle radius (visual only — clicks use HTML layer in LabScene)

  // Determine visual state
  var outerRingColor = 'none';
  var outerRingOpacity = 0;
  var innerFill = '#FF8C00';
  var innerStroke = '#FFB347';
  var showNumber = true;
  var showCheck = false;
  var showCross = false;
  var showMissed = false;
  var pulseClass = '';
  var markerColor = '#fff';

  if (!evaluated){
    if (isSelected){
      outerRingColor = '#5EB2E7';
      outerRingOpacity = 1;
      innerFill = '#2576B6';
      innerStroke = '#3498DB';
      pulseClass = '';
    } else {
      pulseClass = 'hotspot-pulse';
    }
  } else {
    showNumber = false;
    pulseClass = '';
    if (isCorrect && wasSelected){
      // Correct selection
      innerFill = '#166534';
      innerStroke = '#4ADE80';
      outerRingColor = '#4ADE80';
      outerRingOpacity = 1;
      showCheck = true;
      markerColor = '#4ADE80';
    } else if (!isCorrect && wasSelected){
      // Incorrectly selected distractor
      innerFill = '#7f1d1d';
      innerStroke = '#F87171';
      outerRingColor = '#F87171';
      outerRingOpacity = 1;
      showCross = true;
      markerColor = '#F87171';
    } else if (isCorrect && !wasSelected){
      // Missed correct hotspot — revealed
      innerFill = '#78350f';
      innerStroke = '#FBBF24';
      outerRingColor = '#FBBF24';
      outerRingOpacity = 1;
      showMissed = true;
      markerColor = '#FBBF24';
    } else {
      // Unselected distractor — dim it out
      innerFill = '#1e293b';
      innerStroke = '#475569';
      outerRingColor = 'none';
      outerRingOpacity = 0;
    }
  }

  var children = [];

  // Outer pulse ring (only in default/selecting unselected state)
  if (pulseClass && !evaluated && !isSelected){
    children.push(
      h('circle', {
        className: 'hotspot-pulse-ring',
        cx: cx,
        cy: cy,
        r: R + 14,
        fill: 'none',
        stroke: '#FF8C00',
        'stroke-width': '3',
        opacity: '0.5'
      })
    );
  }

  // Outer evaluation ring
  if (outerRingOpacity > 0){
    children.push(
      h('circle', {
        cx: cx,
        cy: cy,
        r: R + 10,
        fill: 'none',
        stroke: outerRingColor,
        'stroke-width': '3',
        opacity: String(outerRingOpacity)
      })
    );
  }

  // Main circle
  children.push(
    h('circle', {
      className: 'hotspot-main-circle' + (pulseClass ? ' ' + pulseClass : ''),
      cx: cx,
      cy: cy,
      r: R,
      fill: innerFill,
      stroke: innerStroke,
      'stroke-width': '2.5'
    })
  );

  // Number label (pre-submit or unselected pre-submit)
  if (showNumber){
    children.push(
      h('text', {
        x: cx,
        y: cy + 1,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: isSelected ? '#ffffff' : '#fff',
        'font-size': '22',
        'font-weight': 'bold',
        'font-family': 'Arial, sans-serif',
        style: 'pointer-events:none'
      }, String(number))
    );
  }

  // Check mark (correct selection or missed)
  if (showCheck || showMissed){
    var checkColor = showMissed ? '#FBBF24' : '#4ADE80';
    // SVG checkmark path centered at cx, cy
    var cx1 = cx - 14, cy1 = cy + 2;
    var cx2 = cx - 4, cy2 = cy + 12;
    var cx3 = cx + 14, cy3 = cy - 10;
    children.push(
      h('polyline', {
        points: cx1+','+cy1+' '+cx2+','+cy2+' '+cx3+','+cy3,
        fill: 'none',
        stroke: checkColor,
        'stroke-width': '4',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        style: 'pointer-events:none'
      })
    );
    if (showMissed){
      // Exclamation detail for "missed" treatment
      children.push(
        h('text', {
          x: cx + 14,
          y: cy - 14,
          fill: '#FBBF24',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': 'Arial, sans-serif',
          style: 'pointer-events:none'
        }, '!')
      );
    }
  }

  // Cross mark (incorrect selection)
  if (showCross){
    var d = 11;
    children.push(
      h('line', { x1: cx-d, y1: cy-d, x2: cx+d, y2: cy+d, stroke: '#F87171', 'stroke-width': '4', 'stroke-linecap': 'round', style: 'pointer-events:none' }),
      h('line', { x1: cx+d, y1: cy-d, x2: cx-d, y2: cy+d, stroke: '#F87171', 'stroke-width': '4', 'stroke-linecap': 'round', style: 'pointer-events:none' })
    );
  }

  return h('g', { className: 'hotspot-group', 'data-id': id }, children);
}

window.Hotspot = Hotspot;
