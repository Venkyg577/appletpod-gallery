// RoomGrid.jsx — SVG coordinate grid with Riaan's room drawn to scale (x:[0,12], y:[0,10]).
// Pure render: given (screen, tapped, revealed, mcqResult) derives what's visible/pulsing.
// Room geometry (bed, wardrobe, walls, doors) is fixed; only label/pulse/line state changes.

(function(){
  var h = window.MiniReact.h;

  // ---- grid geometry (SVG user units) ----
  var UNIT = 56;
  var X_MIN = 0, X_MAX = 12;
  var Y_MIN = 0, Y_MAX = 10;
  var PAD_L = 150, PAD_R = 160;
  var PAD_T = 60, PAD_B = 130;
  var W = (X_MAX - X_MIN) * UNIT + PAD_L + PAD_R;
  var H = (Y_MAX - Y_MIN) * UNIT + PAD_T + PAD_B;
  var OX = PAD_L;
  var OY = PAD_T + Y_MAX * UNIT;

  function sx(x){ return OX + x * UNIT; }
  function sy(y){ return OY - y * UNIT; }

  // Named points used throughout the applet
  var PTS = {
    O:  { x: 0,    y: 0,   label: 'O' },
    A:  { x: 12,   y: 0,   label: 'A' },
    B:  { x: 12,   y: 10,  label: 'B' },
    C:  { x: 0,    y: 10,  label: 'C' },
    D1: { x: 8,    y: 0,   label: 'D₁' },
    R1: { x: 11.5, y: 0,   label: 'R₁' },
    B1: { x: 0,    y: 1.5, label: 'B₁' },
    B2: { x: 0,    y: 4,   label: 'B₂' }
  };

  function fmtPoint(label, x, y){ return label + '(' + x + ', ' + y + ')'; }

  function gridLines(){
    var els = [];
    var x, y;
    for (x = X_MIN; x <= X_MAX; x++){
      els.push(h('line', { className:'cp-grid', x1:sx(x), y1:sy(Y_MIN), x2:sx(x), y2:sy(Y_MAX) }));
    }
    for (y = Y_MIN; y <= Y_MAX; y++){
      els.push(h('line', { className:'cp-grid', x1:sx(X_MIN), y1:sy(y), x2:sx(X_MAX), y2:sy(y) }));
    }
    return els;
  }

  function axes(){
    var els = [];
    // axis lines run exactly origin -> corner (x to A/B at x=12, y to C at y=10)
    els.push(h('line', { className:'cp-axis', x1:sx(0), y1:sy(0), x2:sx(X_MAX), y2:sy(0) }));
    els.push(h('line', { className:'cp-axis', x1:sx(0), y1:sy(0), x2:sx(0), y2:sy(Y_MAX) }));
    els.push(h('text', { className:'cp-axis-label', x:sx(X_MAX/2), y:sy(Y_MIN)+98 }, 'x-axis'));
    els.push(h('text', { className:'cp-axis-label cp-axis-label--y', x:sx(X_MIN)-110, y:sy(Y_MAX/2), transform:'rotate(-90 '+(sx(X_MIN)-110)+' '+sy(Y_MAX/2)+')' }, 'y-axis'));
    // "Right wall" label down the right edge at x=12
    els.push(h('text', { className:'cp-axis-label cp-axis-label--y', x:sx(12)+34, y:sy(Y_MAX/2), transform:'rotate(90 '+(sx(12)+34)+' '+sy(Y_MAX/2)+')' }, 'Right wall'));
    return els;
  }

  function numberEls(){
    var els = [];
    var x, y;
    for (x = X_MIN; x <= X_MAX; x++){
      if (x === 0) continue; // origin already labeled "O (0,0)"
      els.push(h('text', { className:'cp-num', x:sx(x), y:sy(0)+30 }, '+' + x));
    }
    for (y = Y_MIN; y <= Y_MAX; y++){
      if (y === 0) continue;
      els.push(h('text', { className:'cp-num', x:sx(0)-22, y:sy(y)+7 }, '+' + y));
    }
    return els;
  }

  // small corner dot (furniture vertices) — distinct from the big named red points
  function cornerDot(gx, gy){
    return h('circle', { className:'room-corner-dot', cx:sx(gx), cy:sy(gy), r:4 });
  }
  function cornerLabel(text, gx, gy, dx, dy, anchor){
    return h('text', { className:'room-corner-label', x:sx(gx)+dx, y:sy(gy)+dy, 'text-anchor':anchor }, text);
  }

  // ---- room shapes (fixed geometry, grid-aligned) ----
  // Bed: S1(1,5) S2(6,5) S3(6,8) S4(1,8). Headboard at left edge, two pillows top-left.
  function bedEl(){
    var els = [];
    // headboard slab against the left edge (x=1)
    els.push(h('rect', { className:'room-bed-headboard', x:sx(1), y:sy(8), width:14, height:sy(5)-sy(8) }));
    // mattress
    els.push(h('rect', { className:'room-bed', x:sx(1), y:sy(8), width:sx(6)-sx(1), height:sy(5)-sy(8), rx:8 }));
    // two pillows stacked near the headboard, kept inside the bed (y 5..8)
    els.push(h('rect', { className:'room-pillow', x:sx(1)+18, y:sy(7.8), width:sx(2.1)-sx(1), height:sy(6.55)-sy(7.8), rx:6 }));
    els.push(h('rect', { className:'room-pillow', x:sx(1)+18, y:sy(6.45), width:sx(2.1)-sx(1), height:sy(5.2)-sy(6.45), rx:6 }));
    els.push(h('text', { className:'room-shape-label', x:(sx(3.5)+sx(6))/2, y:(sy(8)+sy(5))/2 }, 'Bed'));
    // corner dots + labels
    els.push(cornerDot(1,5)); els.push(cornerDot(6,5)); els.push(cornerDot(6,8)); els.push(cornerDot(1,8));
    els.push(cornerLabel('S₁', 1, 5, 4, 18, 'start'));
    els.push(cornerLabel('S₂', 6, 5, 6, 18, 'start'));
    els.push(cornerLabel('S₃', 6, 8, 6, -8, 'start'));
    els.push(cornerLabel('S₄', 1, 8, -6, -8, 'end'));
    return els;
  }

  // Wardrobe: W1(3,0) W2(7,0) on the x-axis, W3(7,2) W4(3,2) top. Sits on the x-axis.
  function wardrobeEl(){
    var els = [];
    els.push(h('rect', { className:'room-wardrobe', x:sx(3), y:sy(2), width:sx(7)-sx(3), height:sy(0)-sy(2), rx:3 }));
    // top trim line + two knobs to read as drawers
    els.push(h('line', { className:'room-wardrobe-trim', x1:sx(3), y1:sy(1.6), x2:sx(7), y2:sy(1.6) }));
    els.push(h('circle', { className:'room-knob', cx:sx(4.5), cy:sy(1.8), r:3 }));
    els.push(h('circle', { className:'room-knob', cx:sx(5.5), cy:sy(1.8), r:3 }));
    els.push(h('text', { className:'room-shape-label', x:(sx(3)+sx(7))/2, y:(sy(2)+sy(0))/2+8 }, 'Wardrobe'));
    // all four corner dots drawn AFTER the rect so they sit on top (not hidden)
    els.push(cornerDot(3,2)); els.push(cornerDot(7,2));
    els.push(cornerDot(3,0)); els.push(cornerDot(7,0));
    els.push(cornerLabel('W₄', 3, 2, -4, -8, 'end'));
    els.push(cornerLabel('W₃', 7, 2, 6, -8, 'start'));
    // W1/W2 OUTSIDE the wardrobe, beside their corner dots (left of W1, right of W2)
    els.push(cornerLabel('W₁', 3, 0, -8, -6, 'end'));
    els.push(cornerLabel('W₂', 7, 0, 10, -6, 'start'));
    return els;
  }

  function decorEl(){
    var els = [];
    // F marker (bedside table / flower-pot spot) at ~ (0,9) — dot + label only
    els.push(cornerDot(0, 9));
    els.push(cornerLabel('F', 0, 9, -8, -6, 'end'));
    return els;
  }

  // A door is drawn exactly like the source PDF's door diagram:
  //   - a dashed red ARC (dome) joining the two door endpoints — but rather than meeting
  //     the second endpoint on the axis, it meets the TOP of a short straight line that
  //     rises from that endpoint;
  //   - a straight dashed LEAF line running 2 grid units out from that endpoint (with an
  //     arrowhead at the endpoint), representing the open door in its frame.
  //
  // roomDoor: arc from D1(8,0) over to (11.5, 2); vertical leaf from (11.5,2) down to R1.
  // bathDoor: arc from B1(0,1.5) over to (2.5, 4); horizontal leaf from (2.5,4) to B2.
  var DOOR_LEG = 2; // length of the straight dashed leaf, in grid units

  function roomDoorEl(visible, pulse, showLabel, faded){
    if (!visible) return [];
    var fadedSuffix = faded ? ' room-door--faded' : '';
    var cls = 'room-door' + (pulse ? ' room-door--pulse' : '') + fadedSuffix;
    var d1x = sx(8),   d1y = sy(0);            // D1 (arc base)
    var topx = sx(11.5), topy = sy(DOOR_LEG);  // top of the leaf, above R1
    var rx = sx(11.5), ry = sy(0);             // R1 (leaf foot)
    var r = sx(11.5) - sx(8);                  // arc radius in px (3.5 units)
    var els = [];
    // dome arc from D1 up and over to the top of the leaf above R1 (does not cross the leaf)
    els.push(h('path', {
      className: cls,
      d: 'M ' + d1x + ' ' + d1y + ' A ' + r + ' ' + r + ' 0 0 1 ' + topx + ' ' + topy,
      fill: 'none'
    }));
    // straight dashed leaf: vertical, from top down to R1
    els.push(h('path', { className:'room-door-leaf' + fadedSuffix, d:'M ' + topx + ' ' + topy + ' L ' + rx + ' ' + ry, fill:'none' }));
    // small downward arrowhead at R1
    els.push(h('path', { className:'room-door-arrow' + fadedSuffix, d:'M ' + rx + ' ' + (ry+2) + ' l -5 -8 l 10 0 z' }));
    if (showLabel){
      els.push(h('text', { className:'room-door-label' + fadedSuffix, x:sx(9.7), y:sy(1.1) }, 'Door'));
    }
    return els;
  }

  function bathDoorEl(visible, pulse){
    if (!visible) return [];
    var cls = 'room-door' + (pulse ? ' room-door--pulse' : '');
    var b1x = sx(0),   b1y = sy(1.5);          // B1 (arc base)
    var topx = sx(DOOR_LEG + 0.5), topy = sy(4); // top of the leaf, right of B2
    var b2x = sx(0), b2y = sy(4);              // B2 (leaf foot)
    var r = sy(1.5) - sy(4);                   // arc radius in px (2.5 units)
    var els = [];
    // dome arc from B1 over to the far end of the leaf (right of B2); sweep 0 bulges
    // up-right so it does not cross the leaf (form: M 150 536 A 140 140 0 0 0 290 396).
    els.push(h('path', {
      className: cls,
      d: 'M ' + b1x + ' ' + b1y + ' A ' + r + ' ' + r + ' 0 0 0 ' + topx + ' ' + topy,
      fill: 'none'
    }));
    // straight dashed leaf: horizontal, from far end back to B2
    els.push(h('path', { className:'room-door-leaf', d:'M ' + topx + ' ' + topy + ' L ' + b2x + ' ' + b2y, fill:'none' }));
    // small leftward arrowhead at B2
    els.push(h('path', { className:'room-door-arrow', d:'M ' + (b2x-2) + ' ' + b2y + ' l 8 -5 l 0 10 z' }));
    return els;
  }

  function measureLine(key, visible, pulse, label, faded){
    if (!visible) return [];
    var els = [];
    if (key === 'door'){
      // horizontal green line D1 -> R1 along x-axis; label sits just ABOVE the line
      // (inside the door arc) so it clears the D1/R1 point labels on the row below.
      // once we've moved on to the bathroom door question, fade this to gray.
      var cls = 'room-measure' + (pulse ? ' room-measure--pulse' : '') + (faded ? ' room-measure--faded' : '');
      els.push(h('line', { className:cls, x1:sx(8), y1:sy(0), x2:sx(11.5), y2:sy(0) }));
      if (label) els.push(h('text', { className:'room-measure-label' + (faded ? ' room-measure-label--faded' : ''), x:(sx(8)+sx(11.5))/2, y:sy(0)-14 }, label));
    } else if (key === 'bath'){
      // green line ON the y-axis (x=0) between B1 and B2, label sits to its RIGHT —
      // mirrors the room-door measure which sits on the x-axis.
      var clsB = 'room-measure room-measure--v' + (pulse ? ' room-measure--pulse' : '');
      els.push(h('line', { className:clsB, x1:sx(0), y1:sy(1.5), x2:sx(0), y2:sy(4) }));
      if (label) els.push(h('text', { className:'room-measure-label room-measure-label--v', x:sx(0)+16, y:(sy(1.5)+sy(4))/2+5 }, label));
    } else if (key === 'origin-r1'){
      // storyboard screen 2: full green highlight from O to R1 along the x-axis
      var clsO = 'room-measure' + (pulse ? ' room-measure--pulse' : '');
      els.push(h('line', { className:clsO, x1:sx(0), y1:sy(0), x2:sx(11.5), y2:sy(0) }));
    } else if (key === 'origin-d1'){
      // storyboard screens 5/6: green highlight from O to D1 along the x-axis, "8 units" label
      var clsD = 'room-measure' + (pulse ? ' room-measure--pulse' : '');
      els.push(h('line', { className:clsD, x1:sx(0), y1:sy(0), x2:sx(8), y2:sy(0) }));
      if (label) els.push(h('text', { className:'room-measure-label', x:sx(4), y:sy(0)-14 }, label));
    }
    return els;
  }

  function axisHighlightLine(toX, visible){
    if (!visible) return [];
    return [h('line', { className:'room-axis-highlight', x1:sx(0), y1:sy(0), x2:sx(toX), y2:sy(0) })];
  }

  // explicit per-point label placement (dx, dy in px from the point, text-anchor).
  // Point labels deliberately sit on a row clear of the axis tick numbers:
  //   - x-axis points (O, D1, R1, A) label BELOW the "+n" number row (which is at sy(0)+30)
  //   - y-axis points (B1, B2) label to the LEFT of the "+n" number column (at sx(0)-22)
  // so the bold point names never collide with the lighter index numbers.
  var X_PT_ROW = 56;    // point-label row, clear below the tick-number row (at +30)
  var LABEL_PLACEMENT = {
    O:  { dx:-14, dy:X_PT_ROW, anchor:'end' },
    // A(12,0) sits up-right of the axis end so it clears R1(11.5,0)'s lower-row label.
    A:  { dx:16,  dy:-14,      anchor:'start' },
    B:  { dx:18,  dy:-16,      anchor:'start' },
    C:  { dx:-14, dy:-16,      anchor:'end' },
    D1: { dx:0,   dy:X_PT_ROW, anchor:'middle' },
    // R1 nudged left on the lower row so its "(11.5, 0)" doesn't run into A.
    R1: { dx:-10, dy:X_PT_ROW, anchor:'end' },
    B1: { dx:-44, dy:6,        anchor:'end' },
    B2: { dx:-44, dy:6,        anchor:'end' }
  };

  function pointEl(key, opts){
    opts = opts || {};
    var p = PTS[key];
    var cls = 'cp-point' + (opts.pulse ? ' cp-point--pulse' : '') + (opts.blue ? ' cp-point--blue' : '');
    var els = [h('circle', {
      className: cls, cx: sx(p.x), cy: sy(p.y), r: 11,
      onClick: opts.onClick, style: opts.onClick ? { cursor:'pointer' } : undefined
    })];
    var place = LABEL_PLACEMENT[key] || { dx:12, dy:-16, anchor:'start' };
    var lx = sx(p.x) + place.dx;
    var ly = sy(p.y) + place.dy;
    var labelCls = 'cp-point-label' + (opts.showLabel && opts.fresh ? ' cp-point-label--reveal' : '');
    var pulseCls = 'cp-point-label--pulse-coord' + (opts.pulseVariant === 'b' ? ' cp-point-label--pulse-coord-b' : '');
    if (opts.showLabel){
      if (opts.pulseCoord === 'x'){
        // split "D₁(8, 0)" so the x-coordinate digit can pulse on its own
        els.push(h('text', { className: labelCls, x: lx, y: ly, 'text-anchor': place.anchor },
          p.label + '(',
          h('tspan', { className:pulseCls }, String(p.x)),
          ', ' + p.y + ')'
        ));
      } else if (opts.pulseCoord === 'y'){
        // split "D₁(8, 0)" so the y-coordinate digit can pulse on its own
        els.push(h('text', { className: labelCls, x: lx, y: ly, 'text-anchor': place.anchor },
          p.label + '(' + p.x + ', ',
          h('tspan', { className:pulseCls }, String(p.y)),
          ')'
        ));
      } else {
        els.push(h('text', {
          className: labelCls, x: lx, y: ly, 'text-anchor': place.anchor
        }, fmtPoint(p.label, p.x, p.y)));
      }
    } else {
      els.push(h('text', {
        className: labelCls, x: lx, y: ly, 'text-anchor': place.anchor
      }, p.label));
    }
    return els;
  }

  // ---------------------------------------------------------------------------
  function deriveView(screen, tapped, mcqResult){
    var v = {
      showDoorArc: false, doorArcPulse: false,
      showBathArcGlow: false,
      pulseD1: false, pulseR1: false, pulseB1: false, pulseB2: false,
      axisHighlight: null,        // number (x) to highlight 0..x
      roomMeasure: null,          // 'origin-r1' | 'origin-d1' | 'door' | 'bath'
      roomMeasurePulse: false,
      roomMeasureLabel: null,
      roomMeasureFaded: false,
      pulseCornerZero: false
    };

    switch (screen){
      case 1:
        break;
      case 2:
        v.pulseD1 = !tapped.D1;
        v.pulseR1 = !tapped.R1;
        v.showDoorArc = tapped.D1 && tapped.R1;
        v.roomMeasure = 'origin-r1';
        break;
      case 3:
        v.showDoorArc = true;
        v.axisHighlight = 11.5;
        v.pulseD1 = !tapped.D1;
        break;
      case 4:
        v.showDoorArc = true;
        v.axisHighlight = 8;
        break;
      case 5:
        v.showDoorArc = true;
        v.pulseCornerZero = true;
        v.roomMeasure = 'origin-d1';
        v.roomMeasureLabel = '8 units';
        break;
      case 6:
        v.showDoorArc = true;
        v.roomMeasure = 'origin-d1';
        v.roomMeasureLabel = '8 units';
        break;
      case 7:
        v.showDoorArc = true;
        v.roomMeasure = 'door';
        if (mcqResult === 'correct'){
          v.roomMeasureLabel = '3.5 units';
        } else {
          v.roomMeasurePulse = true;
        }
        break;
      case 8:
        v.showDoorArc = true;
        v.roomMeasure = 'door';
        v.roomMeasureLabel = '3.5 units';
        break;
      case 9:
        v.showDoorArc = true;
        v.roomMeasure = 'door';
        v.roomMeasureLabel = '3.5 units';
        break;
      case 10:
        v.showDoorArc = true;
        v.roomMeasure = 'door';
        v.roomMeasureLabel = '3.5 units';
        v.showBathDoor = tapped.B1 && tapped.B2;
        v.pulseB1 = !tapped.B1;
        v.pulseB2 = !tapped.B2;
        break;
      case 11:
        v.showDoorArc = true;
        v.roomMeasure = 'door';
        v.roomMeasureLabel = '3.5 units';
        v.roomMeasureFaded = true;
        v.showBathDoor = true;
        v.bathMeasure = true;
        v.pulseBathCoords = true;
        break;
      case 12:
        v.showDoorArc = true;
        v.roomMeasure = 'door';
        v.roomMeasureLabel = '3.5 units';
        v.roomMeasureFaded = true;
        v.showBathDoor = true;
        v.bathMeasure = true;
        v.bathMeasureLabel = '2.5 units';
        break;
      case 13:
        v.showDoorArc = true;
        v.roomMeasure = 'door';
        v.roomMeasureLabel = '3.5 units';
        v.showBathDoor = true;
        v.bathMeasure = true;
        v.bathMeasureLabel = '2.5 units';
        v.compareLoop = true;
        break;
    }
    return v;
  }

  function RoomGrid(props){
    var screen = props.screen;
    var tapped = props.tapped || {};
    var revealed = props.revealed || {};
    var mcqResult = props.mcqResult;
    var onTapPoint = props.onTapPoint || function(){};

    var view = deriveView(screen, tapped, mcqResult);

    var layers = [];
    layers = layers.concat(gridLines());
    layers = layers.concat(axes());
    layers = layers.concat(numberEls());

    // room shapes
    layers = layers.concat(bedEl());
    layers = layers.concat(wardrobeEl());
    layers = layers.concat(decorEl());

    // axis highlight (line drawing animation cue, screens 3/4/6)
    layers = layers.concat(axisHighlightLine(view.axisHighlight, !!view.axisHighlight));

    // room door (quarter-circle arc + dashed leaf) — "Door" label shown from screen 5 on;
    // fades to gray from screen 10 on once attention moves to the bathroom door
    layers = layers.concat(roomDoorEl(view.showDoorArc, false, screen >= 5, screen >= 10));
    // bathroom door (quarter-circle arc + dashed leaf)
    layers = layers.concat(bathDoorEl(!!view.showBathDoor, false));

    // measurement lines
    layers = layers.concat(measureLine(view.roomMeasure, !!view.roomMeasure, view.roomMeasurePulse, view.roomMeasureLabel, view.roomMeasureFaded));
    layers = layers.concat(measureLine('bath', !!view.bathMeasure, false, view.bathMeasureLabel));

    // named points drawn last so the red dots always sit above furniture, doors, and measure lines
    layers = layers.concat(pointEl('O', { showLabel:true }));
    layers = layers.concat(pointEl('A', { showLabel:true }));
    layers = layers.concat(pointEl('B', { showLabel:true }));
    layers = layers.concat(pointEl('C', { showLabel:true }));
    layers = layers.concat(pointEl('R1', {
      showLabel: true, fresh: false,
      pulse: view.pulseR1,
      pulseCoord: screen === 7 ? 'x' : null,
      pulseVariant: 'b',
      blue: screen >= 7,
      onClick: function(){ onTapPoint('R1'); }
    }));
    layers = layers.concat(pointEl('D1', {
      showLabel: screen === 3 ? !!tapped.D1 : (screen > 3 && !!revealed.D1), fresh: false,
      pulse: view.pulseD1,
      pulseCoord: (screen === 4 || screen === 5) && mcqResult === 'incorrect' ? (screen === 4 ? 'x' : 'y') : (screen === 7 ? 'x' : null),
      blue: screen >= 6,
      onClick: function(){ onTapPoint('D1'); }
    }));
    layers = layers.concat(pointEl('B1', {
      showLabel: !!revealed.B1,
      pulse: view.pulseB1,
      pulseCoord: view.pulseBathCoords ? 'y' : null,
      onClick: function(){ onTapPoint('B1'); }
    }));
    layers = layers.concat(pointEl('B2', {
      showLabel: !!revealed.B2,
      pulse: view.pulseB2,
      pulseCoord: view.pulseBathCoords ? 'y' : null,
      onClick: function(){ onTapPoint('B2'); }
    }));

    return h('div', { className:'cp-wrap' },
      h('svg', {
        className:'cp-svg',
        viewBox:'0 0 ' + W + ' ' + H,
        preserveAspectRatio:'xMidYMid meet'
      }, layers)
    );
  }

  window.RoomGrid = RoomGrid;
})();
