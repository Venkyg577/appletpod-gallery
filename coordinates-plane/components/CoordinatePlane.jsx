// CoordinatePlane.jsx — the SVG grid engine.
// Pure render: given (activeConcept, subStep, completed, practiceActive, selectedPoint)
// it draws axes, numbers, points, distance lines and highlights.
// All motion is CSS-class driven (see styles/main.css); no JS frame animation.

(function(){
  var h = window.MiniReact.h;

  // ---- grid geometry (SVG user units) ----
  var UNIT = 70;                 // px per grid unit
  var X_MIN = -6, X_MAX = 6;     // x range
  var Y_MIN = -5, Y_MAX = 5;     // y range
  var PAD_L = 70, PAD_R = 150;   // horizontal padding (extra on right for "X- axis" label)
  var PAD_T = 60, PAD_B = 80;    // vertical padding (extra on bottom for "Y- axis" label)
  var W = (X_MAX - X_MIN) * UNIT + PAD_L + PAD_R;
  var H = (Y_MAX - Y_MIN) * UNIT + PAD_T + PAD_B;
  var OX = PAD_L + (-X_MIN) * UNIT; // origin x in svg coords
  var OY = PAD_T + (Y_MAX) * UNIT;  // origin y in svg coords (y grows downward)

  function sx(x){ return OX + x * UNIT; }
  function sy(y){ return OY - y * UNIT; }

  // Named demo points used across concepts
  var PTS = {
    O: { x: 0, y: 0, label: 'O' },
    P: { x: 3, y: 0, label: 'P' },
    Q: { x: -3, y: 0, label: 'Q' },
    R: { x: 0, y: 2, label: 'R' },
    S: { x: 0, y: -2, label: 'S' }
  };

  function fmtPoint(label, x, y){ return label + '(' + x + ', ' + y + ')'; }

  // ---------------------------------------------------------------------------
  // visibility model: derive what to show from (concept, sub)
  // ---------------------------------------------------------------------------
  function deriveView(concept, sub, completed, practice){
    var v = {
      showXAxis: false, showYAxis: false,
      pulseXAxis: false, pulseYAxis: false,
      rightAngle: false,
      xNumbers: 'none',        // 'none' | 'pos' | 'neg' | 'all'
      yNumbers: 'none',
      animateXNumbers: false, animateYNumbers: false,
      highlightXNumbers: null, // 'pos' | 'neg' | null — which numbers are actively highlighted/pulsing
      highlightYNumbers: null,
      region: null,            // 'pos-x' | 'neg-x' | 'pos-y' | 'neg-y'
      showO: false, pulseO: false, showOCoord: false,
      dimNumbers: false,       // fade axis numbers to focus on coordinates
      points: [],              // [{key, pulse, coordLabel}]
      distance: null,          // {from:'O', to:'P', axis:'x', units:'3 units'}
      practice: !!practice
    };

    // Once a concept is completed, its axis stays drawn.
    var planeBuilt = completed.plane || concept === 'plane';

    if (planeBuilt) { v.showXAxis = true; v.showYAxis = true; }
    // numbers appear once axes have been introduced
    if (completed.xaxis || concept === 'xaxis' || completed.origin || completed.coordinates ||
        completed.xcoord || completed.ycoord || concept === 'origin' || concept === 'coordinates' ||
        concept === 'xcoord' || concept === 'ycoord' || practice) v.xNumbers = 'all';
    if (completed.yaxis || concept === 'yaxis' || completed.origin || completed.coordinates ||
        completed.xcoord || completed.ycoord || concept === 'origin' || concept === 'coordinates' ||
        concept === 'xcoord' || concept === 'ycoord' || practice) v.yNumbers = 'all';

    // origin label persists once introduced
    if (completed.origin || completed.coordinates || completed.xcoord || completed.ycoord ||
        concept === 'origin' || concept === 'coordinates' || concept === 'xcoord' || concept === 'ycoord') {
      v.showO = true;
    }
    if (completed.coordinates || completed.xcoord || completed.ycoord ||
        concept === 'coordinates' || concept === 'xcoord' || concept === 'ycoord') {
      v.showOCoord = true;
    }

    if (practice) {
      v.showXAxis = true; v.showYAxis = true; v.xNumbers = 'all'; v.yNumbers = 'all';
      v.showO = true;
      return v;
    }

    switch (concept) {
      case 'plane':
        v.showXAxis = true; v.showYAxis = true; v.rightAngle = true;
        break;
      case 'xaxis':
        v.showXAxis = true; v.showYAxis = true; v.pulseXAxis = true;
        if (sub === 0) { v.xNumbers = 'all'; v.animateXNumbers = true; }
        else if (sub === 1) { v.xNumbers = 'pos'; v.animateXNumbers = true; v.region = 'pos-x'; v.highlightXNumbers = 'pos'; }
        else { v.xNumbers = 'all'; v.animateXNumbers = true; v.region = 'neg-x'; v.highlightXNumbers = 'neg'; }
        break;
      case 'yaxis':
        v.showXAxis = true; v.showYAxis = true; v.pulseYAxis = true;
        if (sub === 0) { v.yNumbers = 'all'; v.animateYNumbers = true; }
        else if (sub === 1) { v.yNumbers = 'pos'; v.animateYNumbers = true; v.region = 'pos-y'; v.highlightYNumbers = 'pos'; }
        else { v.yNumbers = 'all'; v.animateYNumbers = true; v.region = 'neg-y'; v.highlightYNumbers = 'neg'; }
        break;
      case 'origin':
        v.showXAxis = true; v.showYAxis = true; v.xNumbers = 'all'; v.yNumbers = 'all';
        v.showO = true; v.pulseO = true;
        break;
      case 'coordinates':
        v.showXAxis = true; v.showYAxis = true; v.xNumbers = 'all'; v.yNumbers = 'all';
        v.showO = true; v.showOCoord = true; v.pulseO = true; v.dimNumbers = true;
        break;
      case 'xcoord':
        v.showXAxis = true; v.showYAxis = true; v.xNumbers = 'all'; v.yNumbers = 'all'; v.showO = true; v.showOCoord = true;
        if (sub === 0) {
          v.points = [{ key:'P', pulse:true, coordLabel:true }];
          v.distance = { to:'P', axis:'x', units:'3 units' };
        } else if (sub === 1) {
          v.points = [{ key:'P', coordLabel:true }, { key:'Q', pulse:true, coordLabel:true }];
          v.distance = { to:'Q', axis:'x', units:'3 units' };
        } else {
          v.points = [{ key:'P', pulse:true, coordLabel:true }, { key:'Q', pulse:true, coordLabel:true }];
        }
        break;
      case 'ycoord':
        v.showXAxis = true; v.showYAxis = true; v.xNumbers = 'all'; v.yNumbers = 'all'; v.showO = true; v.showOCoord = true;
        if (sub === 0) {
          v.points = [{ key:'R', pulse:true, coordLabel:true }];
          v.distance = { to:'R', axis:'y', units:'2 units' };
        } else if (sub === 1) {
          v.points = [{ key:'R', coordLabel:true }, { key:'S', pulse:true, coordLabel:true }];
          v.distance = { to:'S', axis:'y', units:'2 units' };
        } else {
          v.points = [{ key:'R', pulse:true, coordLabel:true }, { key:'S', pulse:true, coordLabel:true }];
        }
        break;
    }
    return v;
  }

  // ---------------------------------------------------------------------------
  // svg builders
  // ---------------------------------------------------------------------------
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

  function axisX(pulse, region){
    var cls = 'cp-axis' + (pulse ? ' cp-axis--pulse' : '');
    var els = [];
    // highlighted region overlay
    if (region === 'pos-x') els.push(h('line', { className:'cp-region', x1:sx(0), y1:sy(0), x2:sx(X_MAX), y2:sy(0) }));
    if (region === 'neg-x') els.push(h('line', { className:'cp-region', x1:sx(X_MIN), y1:sy(0), x2:sx(0), y2:sy(0) }));
    els.push(h('line', { className:cls, x1:sx(X_MIN) - 24, y1:sy(0), x2:sx(X_MAX) + 24, y2:sy(0) }));
    els.push(h('polygon', { className:'cp-arrow', points:(sx(X_MAX)+40)+','+sy(0)+' '+(sx(X_MAX)+18)+','+(sy(0)-12)+' '+(sx(X_MAX)+18)+','+(sy(0)+12) }));
    els.push(h('polygon', { className:'cp-arrow', points:(sx(X_MIN)-40)+','+sy(0)+' '+(sx(X_MIN)-18)+','+(sy(0)-12)+' '+(sx(X_MIN)-18)+','+(sy(0)+12) }));
    els.push(h('text', { className:'cp-axis-label', x:sx(X_MAX)+52, y:sy(0)+8 }, 'X- axis'));
    return els;
  }

  function axisY(pulse, region){
    var cls = 'cp-axis' + (pulse ? ' cp-axis--pulse' : '');
    var els = [];
    if (region === 'pos-y') els.push(h('line', { className:'cp-region', x1:sx(0), y1:sy(0), x2:sx(0), y2:sy(Y_MAX) }));
    if (region === 'neg-y') els.push(h('line', { className:'cp-region', x1:sx(0), y1:sy(0), x2:sx(0), y2:sy(Y_MIN) }));
    els.push(h('line', { className:cls, x1:sx(0), y1:sy(Y_MAX) - 24, x2:sx(0), y2:sy(Y_MIN) + 24 }));
    els.push(h('polygon', { className:'cp-arrow', points:sx(0)+','+(sy(Y_MAX)-40)+' '+(sx(0)-12)+','+(sy(Y_MAX)-18)+' '+(sx(0)+12)+','+(sy(Y_MAX)-18) }));
    els.push(h('polygon', { className:'cp-arrow', points:sx(0)+','+(sy(Y_MIN)+40)+' '+(sx(0)-12)+','+(sy(Y_MIN)+18)+' '+(sx(0)+12)+','+(sy(Y_MIN)+18) }));
    els.push(h('text', { className:'cp-axis-label', x:sx(0)+18, y:sy(Y_MIN)+46 }, 'Y- axis'));
    return els;
  }

  var TICK = 7; // half-length of a tick mark, in svg units

  function xNumberEls(mode, animate, dim, highlight){
    var els = [];
    for (var x = X_MIN; x <= X_MAX; x++){
      if (x === 0) continue;
      if (mode === 'pos' && x < 0) continue;
      if (mode === 'neg' && x > 0) continue;
      var isHi = highlight && ((highlight === 'pos' && x > 0) || (highlight === 'neg' && x < 0));
      var muted = highlight && !isHi;
      var cls = 'cp-num' + (dim ? ' cp-num--dim' : '') + (muted ? ' cp-num--muted' : '');
      var tickCls = 'cp-tick' + (dim ? ' cp-tick--dim' : '') + (muted ? ' cp-tick--muted' : '');
      if (isHi){
        cls += ' cp-num--hi';
        tickCls += ' cp-tick--hi';
        els.push(h('line', { className:tickCls, x1:sx(x), y1:sy(0)-TICK, x2:sx(x), y2:sy(0)+TICK }));
        els.push(h('text', { className:cls, x:sx(x), y:sy(0)+34 }, String(x)));
      } else if (animate && !highlight){
        cls += ' cp-num--seq';
        tickCls += ' cp-num--seq';
        // order outward from origin so 0->1->2... lights up in sequence
        var delay = Math.abs(x) * 0.28;
        els.push(h('line', { className:tickCls, x1:sx(x), y1:sy(0)-TICK, x2:sx(x), y2:sy(0)+TICK, style:{ animationDelay: delay + 's' } }));
        els.push(h('text', { className:cls, x:sx(x), y:sy(0)+34, style:{ animationDelay: delay + 's' } }, String(x)));
      } else {
        els.push(h('line', { className:tickCls, x1:sx(x), y1:sy(0)-TICK, x2:sx(x), y2:sy(0)+TICK }));
        els.push(h('text', { className:cls, x:sx(x), y:sy(0)+34 }, String(x)));
      }
    }
    return els;
  }

  // origin "0" — shown once any axis numbers appear, before the dedicated O marker/label takes over
  function zeroEl(dim){
    var cls = 'cp-num' + (dim ? ' cp-num--dim' : '');
    return h('text', { className:cls, x:sx(0)-14, y:sy(0)+34, 'text-anchor':'end' }, '0');
  }

  function yNumberEls(mode, animate, dim, highlight){
    var els = [];
    for (var y = Y_MIN; y <= Y_MAX; y++){
      if (y === 0) continue;
      if (mode === 'pos' && y < 0) continue;
      if (mode === 'neg' && y > 0) continue;
      var isHi = highlight && ((highlight === 'pos' && y > 0) || (highlight === 'neg' && y < 0));
      var muted = highlight && !isHi;
      var cls = 'cp-num' + (dim ? ' cp-num--dim' : '') + (muted ? ' cp-num--muted' : '');
      var tickCls = 'cp-tick' + (dim ? ' cp-tick--dim' : '') + (muted ? ' cp-tick--muted' : '');
      if (isHi){
        cls += ' cp-num--hi';
        tickCls += ' cp-tick--hi';
        els.push(h('line', { className:tickCls, x1:sx(0)-TICK, y1:sy(y), x2:sx(0)+TICK, y2:sy(y) }));
        els.push(h('text', { className:cls, x:sx(0)-22, y:sy(y)+7 }, String(y)));
      } else if (animate && !highlight){
        cls += ' cp-num--seq';
        tickCls += ' cp-num--seq';
        var delay = Math.abs(y) * 0.28;
        els.push(h('line', { className:tickCls, x1:sx(0)-TICK, y1:sy(y), x2:sx(0)+TICK, y2:sy(y), style:{ animationDelay: delay + 's' } }));
        els.push(h('text', { className:cls, x:sx(0)-22, y:sy(y)+7, style:{ animationDelay: delay + 's' } }, String(y)));
      } else {
        els.push(h('line', { className:tickCls, x1:sx(0)-TICK, y1:sy(y), x2:sx(0)+TICK, y2:sy(y) }));
        els.push(h('text', { className:cls, x:sx(0)-22, y:sy(y)+7 }, String(y)));
      }
    }
    return els;
  }

  function distanceEls(d){
    if (!d) return [];
    var p = PTS[d.to];
    var els = [];
    if (d.axis === 'x'){
      var midX = (sx(0) + sx(p.x)) / 2;
      els.push(h('line', { className:'cp-dist', x1:sx(0), y1:sy(0), x2:sx(p.x), y2:sy(0) }));
      els.push(h('text', { className:'cp-dist-label', x:midX, y:sy(0)-14 }, d.units));
    } else {
      var midY = (sy(0) + sy(p.y)) / 2;
      els.push(h('line', { className:'cp-dist', x1:sx(0), y1:sy(0), x2:sx(0), y2:sy(p.y) }));
      els.push(h('text', { className:'cp-dist-label cp-dist-label--y', x:sx(0)+14, y:midY+5 }, d.units));
    }
    return els;
  }

  function pointEls(view){
    var els = [];
    view.points.forEach(function(pt){
      var p = PTS[pt.key];
      var cls = 'cp-point' + (pt.pulse ? ' cp-point--pulse' : '');
      els.push(h('circle', { className:cls, cx:sx(p.x), cy:sy(p.y), r:9 }));
      if (pt.coordLabel){
        // place label up-right of point, nudged off the axis
        var lx = sx(p.x) + (p.x < 0 ? -10 : 14);
        var ly = sy(p.y) + (p.y >= 0 ? -16 : 30);
        els.push(h('text', { className:'cp-point-label', x:lx, y:ly, 'text-anchor': p.x < 0 ? 'end' : 'start' }, fmtPoint(p.label, p.x, p.y)));
      }
    });
    return els;
  }

  function practiceEls(selected, selectPoint){
    var els = [];
    var x, y;
    function addPoint(gx, gy){
      var isSel = selected && selected.x === gx && selected.y === gy;
      var cls = 'cp-ppoint' + (isSel ? ' cp-ppoint--selected' : '');
      els.push(h('circle', {
        className: cls, cx: sx(gx), cy: sy(gy), r: isSel ? 11 : 9,
        onClick: function(){ selectPoint(gx, gy); },
        style: { cursor: 'pointer' }
      }));
      if (isSel){
        var lx = sx(gx) + (gx < 0 ? -10 : 14);
        var ly = sy(gy) + (gy >= 0 ? -16 : 30);
        els.push(h('text', { className:'cp-point-label cp-point-label--reveal', x:lx, y:ly, 'text-anchor': gx < 0 ? 'end' : 'start' }, fmtPoint('P', gx, gy)));
      }
    }
    for (x = X_MIN; x <= X_MAX; x++){ if (x !== 0) addPoint(x, 0); }
    for (y = Y_MIN; y <= Y_MAX; y++){ if (y !== 0) addPoint(0, y); }
    return els;
  }

  function rightAngleEl(){
    // small square at origin in first quadrant
    var s = 22;
    var d = 'M ' + sx(0) + ' ' + (sy(0) - s) + ' L ' + (sx(0) + s) + ' ' + (sy(0) - s) + ' L ' + (sx(0) + s) + ' ' + sy(0);
    return h('path', { className:'cp-right-angle', d:d, fill:'none' });
  }

  function CoordinatePlane(props){
    var concept = props.activeConcept;
    var sub = props.subStep || 0;
    var completed = props.completed || {};
    var practice = !!props.practice;
    var selected = props.selectedPoint || null;
    var selectPoint = props.onSelectPoint || function(){};

    var view = deriveView(concept, sub, completed, practice);

    var layers = [];
    // grid
    layers = layers.concat(gridLines());
    // axes
    var xRegion = (view.region === 'pos-x' || view.region === 'neg-x') ? view.region : null;
    var yRegion = (view.region === 'pos-y' || view.region === 'neg-y') ? view.region : null;
    if (view.showXAxis) layers = layers.concat(axisX(view.pulseXAxis, xRegion));
    if (view.showYAxis) layers = layers.concat(axisY(view.pulseYAxis, yRegion));
    // numbers
    if (view.xNumbers !== 'none') layers = layers.concat(xNumberEls(view.xNumbers, view.animateXNumbers, view.dimNumbers, view.highlightXNumbers));
    if (view.yNumbers !== 'none') layers = layers.concat(yNumberEls(view.yNumbers, view.animateYNumbers, view.dimNumbers, view.highlightYNumbers));
    // origin "0" — once numbers appear, before the dedicated O marker/label takes over
    if ((view.xNumbers !== 'none' || view.yNumbers !== 'none') && !view.showO) {
      layers.push(zeroEl(view.dimNumbers));
    }
    // right angle
    if (view.rightAngle) layers.push(rightAngleEl());
    // distance
    layers = layers.concat(distanceEls(view.distance));
    // demo points
    layers = layers.concat(pointEls(view));
    // origin marker + label
    if (view.showO){
      layers.push(h('circle', { className:'cp-point cp-origin' + (view.pulseO ? ' cp-point--pulse' : ''), cx:sx(0), cy:sy(0), r:8 }));
      layers.push(h('text', { className:'cp-point-label cp-origin-label' + (view.pulseO ? ' cp-point-label--pulse' : ''), x:sx(0)-16, y:sy(0)+30, 'text-anchor':'end' }, view.showOCoord ? 'O (0,0)' : 'O'));
    }
    // practice points
    if (practice) layers = layers.concat(practiceEls(selected, selectPoint));

    return h('div', { className:'cp-wrap' },
      h('svg', {
        className:'cp-svg',
        viewBox:'0 0 ' + W + ' ' + H,
        preserveAspectRatio:'xMidYMid meet'
      }, layers)
    );
  }

  window.CoordinatePlane = CoordinatePlane;
})();
