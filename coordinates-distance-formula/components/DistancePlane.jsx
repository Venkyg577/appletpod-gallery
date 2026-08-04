// DistancePlane.jsx — coordinate plane renderer for the "distance between two points" applet.
// Forked from applet4's CartesianGrid: keeps the grid/axes/point scaffolding and the
// window.CartesianGridMath export (so the shared DragPointer needs no edits) and replaces the
// quadrant-specific layers with distance layers (segments, right-angle marker, leg tags, "?").
// Stays a PURE renderer: AppletContainer.deriveView() builds the `view` object it draws from.
(function(){
  var h = window.MiniReact.h;

  // Two grid configs:
  //   guided  — quadrant-1-dominant like the PDF (x -3..11, y -2..7), used screens 1-15
  //   explore — symmetric 4-quadrant (x -10..10, y -6..6), used on the free-exploration screen 16
  var GRIDS = {
    guided:  { X_MIN:-3,  X_MAX:11, Y_MIN:-2, Y_MAX:7, UNIT:48 },
    explore: { X_MIN:-10, X_MAX:10, Y_MIN:-6, Y_MAX:6, UNIT:34 }
  };
  var PAD_L = 60, PAD_R = 60, PAD_T = 46, PAD_B = 46;

  // active geometry — set per render by setGrid() so all helpers below see the current config
  var X_MIN, X_MAX, Y_MIN, Y_MAX, UNIT, W, H, OX, OY;
  function setGrid(mode){
    var g = GRIDS[mode] || GRIDS.guided;
    X_MIN = g.X_MIN; X_MAX = g.X_MAX; Y_MIN = g.Y_MIN; Y_MAX = g.Y_MAX; UNIT = g.UNIT;
    W = (X_MAX - X_MIN) * UNIT + PAD_L + PAD_R;
    H = (Y_MAX - Y_MIN) * UNIT + PAD_T + PAD_B;
    OX = PAD_L + (0 - X_MIN) * UNIT;
    OY = PAD_T + (Y_MAX - 0) * UNIT;
  }
  setGrid('guided'); // default so the math export below is populated

  function sx(x){ return OX + x * UNIT; }
  function sy(y){ return OY - y * UNIT; }

  function fmtSqrt(n){
    // n is the sum of squares (dx*dx + dy*dy). Print exact "k units" for perfect squares,
    // otherwise "√n units".
    var r = Math.sqrt(n);
    if (Number.isInteger(r)) return r + ' units';
    return '√' + n + ' units';
  }

  function gridLines(){
    var els = [];
    for (var x = X_MIN; x <= X_MAX; x++){
      els.push(h('line', { className:'cp-grid', x1:sx(x), y1:sy(Y_MIN), x2:sx(x), y2:sy(Y_MAX) }));
    }
    for (var y = Y_MIN; y <= Y_MAX; y++){
      els.push(h('line', { className:'cp-grid', x1:sx(X_MIN), y1:sy(y), x2:sx(X_MAX), y2:sy(y) }));
    }
    return els;
  }

  function ticks(){
    var els = [], t = 6; // half-length of each tick, in px
    for (var x = X_MIN; x <= X_MAX; x++){
      if (x === 0) continue;
      els.push(h('line', { className:'cp-tick', x1:sx(x), y1:sy(0) - t, x2:sx(x), y2:sy(0) + t }));
    }
    for (var y = Y_MIN; y <= Y_MAX; y++){
      if (y === 0) continue;
      els.push(h('line', { className:'cp-tick', x1:sx(0) - t, y1:sy(y), x2:sx(0) + t, y2:sy(y) }));
    }
    return els;
  }

  function numberEls(highlight){
    highlight = highlight || {};
    // wrong-tone highlight (red) for "you picked incorrectly" states; default stays gold.
    var toneCls = highlight.tone === 'wrong' ? ' cp-num--highlight-wrong' : ' cp-num--highlight';
    var els = [];
    for (var x = X_MIN; x <= X_MAX; x++){
      if (x === 0) continue;
      var xc = 'cp-num' + (highlight.x && highlight.x.indexOf(x) !== -1 ? toneCls + ' cp-num--pulse' : '');
      els.push(h('text', { className:xc, x:sx(x), y:sy(0) + 20 }, String(x)));
    }
    for (var y = Y_MIN; y <= Y_MAX; y++){
      if (y === 0) continue;
      var yc = 'cp-num' + (highlight.y && highlight.y.indexOf(y) !== -1 ? toneCls + ' cp-num--pulse' : '');
      els.push(h('text', { className:yc, x:sx(0) - 16, y:sy(y) + 5 }, String(y)));
    }
    els.push(h('text', { className:'cp-num', x:sx(0) - 14, y:sy(0) + 18 }, 'O(0,0)'));
    return els;
  }

  function arrowHead(px, py, dir){
    var d;
    if (dir === 'right') d = 'M ' + px + ' ' + py + ' l -14 -7 l 0 14 z';
    else if (dir === 'left') d = 'M ' + px + ' ' + py + ' l 14 -7 l 0 14 z';
    else if (dir === 'up') d = 'M ' + px + ' ' + py + ' l -7 14 l 14 0 z';
    else d = 'M ' + px + ' ' + py + ' l -7 -14 l 14 0 z';
    return h('path', { className:'cp-axis-arrow', d:d });
  }

  function axes(){
    var els = [];
    var EXT = 20, AH = 14;
    var xTipL = sx(X_MIN) - EXT, xTipR = sx(X_MAX) + EXT;
    els.push(h('line', { className:'cp-axis', x1:xTipL + AH, y1:sy(0), x2:xTipR - AH, y2:sy(0) }));
    els.push(arrowHead(xTipR, sy(0), 'right'));
    els.push(arrowHead(xTipL, sy(0), 'left'));
    els.push(h('text', { className:'cp-axis-label', x:xTipR + 24, y:sy(0) + 6 }, 'X'));

    var yTipT = sy(Y_MAX) - EXT, yTipB = sy(Y_MIN) + EXT;
    els.push(h('line', { className:'cp-axis', x1:sx(0), y1:yTipB - AH, x2:sx(0), y2:yTipT + AH }));
    els.push(arrowHead(sx(0), yTipT, 'up'));
    els.push(arrowHead(sx(0), yTipB, 'down'));
    els.push(h('text', { className:'cp-axis-label', x:sx(0) - 4, y:yTipT - 20 }, 'Y'));
    return els;
  }

  // a colored connector between two math points. ghost = faint background outline.
  function segmentEl(seg){
    var cls = 'dp-seg dp-seg--' + (seg.kind || 'slant') +
      (seg.pulse ? ' dp-seg--pulse' : '') + (seg.ghost ? ' dp-seg--ghost' : '') +
      (seg.done ? ' dp-seg--done' : '') + (seg.wrong ? ' dp-seg--wrong' : '');
    return h('line', { className:cls, x1:sx(seg.from.x), y1:sy(seg.from.y), x2:sx(seg.to.x), y2:sy(seg.to.y) });
  }

  // small right-angle marker square at corner `c`, opening toward `toward` (the two leg directions)
  function rightAngleEl(c, ax, ay){
    // ax, ay are +/-1 unit directions along the two legs from the corner
    var s = 14; // px size of marker
    var cx = sx(c.x), cy = sy(c.y);
    var dxp = ax * s, dyp = -ay * s; // svg y is flipped
    var p1 = (cx + dxp) + ' ' + cy;
    var p2 = (cx + dxp) + ' ' + (cy + dyp);
    var p3 = cx + ' ' + (cy + dyp);
    return h('path', { className:'dp-rightangle', d:'M ' + p1 + ' L ' + p2 + ' L ' + p3 });
  }

  function pointEl(p){
    var dotCls = 'cp-point' + (p.pulse ? ' cp-point--pulse' : '') + (p.ghost ? ' cp-point--ghost' : '');
    var els = [h('circle', { className:dotCls, cx:sx(p.x), cy:sy(p.y), r:p.ghost ? 6 : 8 })];
    if (p.label != null){
      var lp = p.labelPos || 'right';
      var lx = sx(p.x), ly = sy(p.y);
      if (lp === 'right'){ lx += 14; ly -= 10; }
      else if (lp === 'left'){ lx -= 14; ly -= 10; }
      else if (lp === 'above'){ ly -= 18; lx += 0; }
      else if (lp === 'above-right'){ lx += 12; ly -= 18; }
      else if (lp === 'above-left'){ lx -= 12; ly -= 18; }
      else if (lp === 'below'){ ly += 26; }
      else if (lp === 'below-right'){ lx += 14; ly += 26; }
      else if (lp === 'below-left'){ lx -= 14; ly += 26; }
      // for points that sit ON an axis: clear the axis number row/column entirely rather than
      // just nudging off the dot (the generic offsets above are sized for off-axis points).
      else if (lp === 'below-axis'){ ly += 44; }
      else if (lp === 'left-axis'){ lx -= 34; ly += 6; }
      var anchor = (lp === 'left' || lp === 'below-left' || lp === 'above-left' || lp === 'left-axis') ? 'end' :
                   (lp === 'above' || lp === 'below-axis') ? 'middle' : 'start';
      els.push(h('text', { className:'cp-point-label' + (p.ghost ? ' cp-point-label--ghost' : ''), x:lx, y:ly, style:{ textAnchor:anchor } }, p.label));
    }
    return els;
  }

  // a plain number drawn next to a leg/slant. tone 'wrong'/'right' recolors it red/orange
  // (e.g. the MA screen: red while the user has just guessed wrong, orange once correct).
  function legNumEl(item){
    var cls = 'dp-leg-num' + (item.slant ? ' dp-leg-num--slant' : '') +
      (item.tone ? ' dp-leg-num--' + item.tone : '');
    return h('text', { className:cls, x:sx(item.x), y:sy(item.y) }, item.text);
  }

  // a card-style coordinate-difference tag (e.g. "7 − 3", "y₂−y₁=3")
  function legTagEl(item){
    var tone = item.tone || 'default';
    var bgCls = 'dp-leg-tag-bg' + (tone === 'green' ? ' dp-leg-tag-bg--green' : tone === 'pink' ? ' dp-leg-tag-bg--pink' : '');
    var txtCls = 'dp-leg-tag-text' + (tone === 'green' || tone === 'pink' ? ' dp-leg-tag-text--light' : '');
    var wHalf = Math.max(34, item.text.length * 6 + 12);
    return h('g', { transform:'translate(' + sx(item.x) + ',' + sy(item.y) + ')' },
      h('rect', { className:bgCls, x:-wHalf, y:-16, width:wHalf * 2, height:32, rx:6 }),
      h('text', { className:txtCls, x:0, y:6 }, item.text)
    );
  }

  // a card-style tag whose text is a KaTeX math expression (e.g. the distance formula
  // "√(x₂-x₁)² + (y₂-y₁)² = 5") — same visual treatment as legTagEl's card, but the content is
  // rendered through KaTeX inside a <foreignObject> so radicals get a proper vinculum bar.
  function mathTagEl(item){
    if (!window.renderMathExpression){ return legTagEl(item); }
    var tone = item.tone || 'default';
    var bgCls = 'dp-leg-tag-bg' + (tone === 'green' ? ' dp-leg-tag-bg--green' : tone === 'pink' ? ' dp-leg-tag-bg--pink' : '');
    var FW = item.width || 220, FH = 40;
    return h('g', { transform:'translate(' + sx(item.x) + ',' + sy(item.y) + ')' },
      h('rect', { className:bgCls, x:-FW / 2, y:-20, width:FW, height:FH, rx:6 }),
      h('foreignObject', { x:-FW / 2, y:-FH / 2, width:FW, height:FH },
        h('div', { className:'dp-math-tag', html: window.renderMathExpression(item.text) })
      )
    );
  }

  // solved distance label. For a radical (contains "√") we typeset it with KaTeX inside a
  // <foreignObject> so the vinculum bar renders; plain numbers stay as crisp SVG <text>.
  function distLabelEl(d2){
    var isRadical = /√/.test(String(d2.text));
    if (isRadical && window.renderMathExpression){
      var FW = 96, FH = 48;  // foreignObject box (math is centered inside)
      return h('foreignObject', { x:sx(d2.x) - FW / 2, y:sy(d2.y) - FH / 2, width:FW, height:FH },
        h('div', { className:'dp-dist-fo', html: window.renderMathExpression(d2.text) })
      );
    }
    return h('text', { className:'dp-dist-label', x:sx(d2.x), y:sy(d2.y) }, d2.text);
  }

  // props: { view, onPlanePointTap(x,y), dragChildren }
  function DistancePlane(props){
    var view = props.view || {};
    setGrid(view.grid || 'guided');   // pick grid config before any sx/sy use
    var layers = [];

    layers = layers.concat(gridLines());
    layers = layers.concat(axes());
    layers = layers.concat(ticks());
    layers = layers.concat(numberEls(view.highlightNums));

    // triangle fill highlight (drawn under everything else)
    if (view.triangleFill){
      var tf = view.triangleFill;
      var d = 'M ' + sx(tf[0].x) + ' ' + sy(tf[0].y) +
              ' L ' + sx(tf[1].x) + ' ' + sy(tf[1].y) +
              ' L ' + sx(tf[2].x) + ' ' + sy(tf[2].y) + ' z';
      layers.push(h('path', { className:'dp-tri-fill', d:d }));
    }

    // exploration tap hotspots
    if (view.tapHotspots){
      for (var gx = X_MIN; gx <= X_MAX; gx++){
        for (var gy = Y_MIN; gy <= Y_MAX; gy++){
          (function(px, py){
            layers.push(h('circle', {
              className:'dp-tap-dot dp-tap-dot--pulse', cx:sx(px), cy:sy(py), r:7,
              onClick: function(){ if (props.onPlanePointTap) props.onPlanePointTap(px, py); }
            }));
          })(gx, gy);
        }
      }
    }

    // connector segments
    if (view.segments){ view.segments.forEach(function(s){ layers.push(segmentEl(s)); }); }

    // right-angle markers
    if (view.rightAngles){
      view.rightAngles.forEach(function(ra){ layers.push(rightAngleEl(ra.at, ra.ax, ra.ay)); });
    }

    // leg numbers (plain)
    if (view.legNums){ view.legNums.forEach(function(n){ layers.push(legNumEl(n)); }); }

    // pulsating "?" markers
    if (view.questionMarks){
      view.questionMarks.forEach(function(q){
        layers.push(h('text', { className:'dp-qmark' + (q.pulse ? ' dp-qmark--pulse' : ''), x:sx(q.x), y:sy(q.y) }, '?'));
      });
    }

    // solved distance labels (replace ?) — KaTeX radical or plain SVG text
    if (view.distLabels){
      view.distLabels.forEach(function(d2){ layers.push(distLabelEl(d2)); });
    }

    // points
    if (view.points){ view.points.forEach(function(p){ layers = layers.concat(pointEl(p)); }); }

    // leg tags (cards) — drawn above points so they read clearly
    if (view.legTags){ view.legTags.forEach(function(tg){ layers.push(legTagEl(tg)); }); }

    // KaTeX-rendered formula tags (e.g. the distance formula card on the graph)
    if (view.mathTags){ view.mathTags.forEach(function(tg){ layers.push(mathTagEl(tg)); }); }

    // drag pointers last (always on top)
    if (props.dragChildren) layers = layers.concat(props.dragChildren);

    return h('div', { className:'cp-wrap' },
      h('svg', {
        className:'cp-svg', viewBox:'0 0 ' + W + ' ' + H, preserveAspectRatio:'xMidYMid meet'
      }, layers)
    );
  }

  window.DistancePlane = DistancePlane;
  // Export under the name DragPointer expects, so the copied DragPointer.jsx works unchanged.
  window.CartesianGridMath = { UNIT:UNIT, X_MIN:X_MIN, X_MAX:X_MAX, Y_MIN:Y_MIN, Y_MAX:Y_MAX, OX:OX, OY:OY, W:W, H:H, sx:sx, sy:sy, fmtSqrt:fmtSqrt };
  window.DistancePlaneMath = window.CartesianGridMath;
})();
