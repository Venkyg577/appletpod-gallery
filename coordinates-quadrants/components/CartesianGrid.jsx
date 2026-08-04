// CartesianGrid.jsx — 4-quadrant SVG coordinate plane renderer.
(function(){
  var h = window.MiniReact.h;

  var UNIT = 56;
  var X_MIN = -7, X_MAX = 7, Y_MIN = -5, Y_MAX = 5;
  var PAD_L = 90, PAD_R = 90, PAD_T = 60, PAD_B = 60;
  var W = (X_MAX - X_MIN) * UNIT + PAD_L + PAD_R;
  var H = (Y_MAX - Y_MIN) * UNIT + PAD_T + PAD_B;
  var OX = PAD_L + (0 - X_MIN) * UNIT;
  var OY = PAD_T + (Y_MAX - 0) * UNIT;

  function sx(x){ return OX + x * UNIT; }
  function sy(y){ return OY - y * UNIT; }

  var QUADRANT_RECTS = {
    I:   { x: sx(0),     y: sy(Y_MAX), w: sx(X_MAX) - sx(0),    h: sy(0) - sy(Y_MAX) },
    II:  { x: sx(X_MIN), y: sy(Y_MAX), w: sx(0) - sx(X_MIN),    h: sy(0) - sy(Y_MAX) },
    III: { x: sx(X_MIN), y: sy(0),     w: sx(0) - sx(X_MIN),    h: sy(Y_MIN) - sy(0) },
    IV:  { x: sx(0),     y: sy(0),     w: sx(X_MAX) - sx(0),    h: sy(Y_MIN) - sy(0) }
  };

  var SIGN_LABEL_POS = {
    P: { x: sx(3.5),  y: sy(2) },
    Q: { x: sx(-3.5), y: sy(2) },
    R: { x: sx(-3.5), y: sy(-3) },
    S: { x: sx(3.5),  y: sy(-3) }
  };

  var QUADRANT_NUMBER = { I: 1, II: 2, III: 3, IV: 4 };

  function fmtPoint(label, x, y){ return label + ' (' + x + ', ' + y + ')'; }

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

  // x-axis numbers + the "0" at origin — shown as soon as the x-axis exists,
  // independent of whether the y-axis has been drawn yet
  function xNumberEls(){
    var els = [];
    for (var x = X_MIN; x <= X_MAX; x++){
      if (x === 0) continue;
      els.push(h('text', { className:'cp-num', x:sx(x), y:sy(0) + 22 }, String(x)));
    }
    els.push(h('text', { className:'cp-num', x:sx(0) - 14, y:sy(0) + 20 }, '0'));
    return els;
  }

  // y-axis numbers + the full "O(0,0)" origin label — needs both axes present
  function yNumberEls(){
    var els = [];
    for (var y = Y_MIN; y <= Y_MAX; y++){
      if (y === 0) continue;
      els.push(h('text', { className:'cp-num', x:sx(0) - 18, y:sy(y) + 5 }, String(y)));
    }
    els.push(h('text', { className:'cp-num', x:sx(0) - 14, y:sy(0) + 20 }, 'O(0,0)'));
    return els;
  }

  function arrowHead(px, py, dir, fadeIn){
    var d;
    if (dir === 'right') d = 'M ' + px + ' ' + py + ' l -14 -7 l 0 14 z';
    else if (dir === 'left') d = 'M ' + px + ' ' + py + ' l 14 -7 l 0 14 z';
    else if (dir === 'up') d = 'M ' + px + ' ' + py + ' l -7 14 l 14 0 z';
    else d = 'M ' + px + ' ' + py + ' l -7 -14 l 14 0 z';
    var cls = 'cp-axis-arrow' + (fadeIn ? ' cp-axis-arrow--fadein' : '');
    return h('path', { className:cls, d:d });
  }

  function axes(visible){
    var els = [];
    var EXT = 22; // how far axes extend past the grid before the arrowhead tip
    var AH = 14;  // arrowhead length — the line stops here so it doesn't poke past the tip
    if (visible.x){
      var xTipL = sx(X_MIN) - EXT, xTipR = sx(X_MAX) + EXT; // arrowhead tip positions
      var xL = xTipL + AH, xR = xTipR - AH;                  // line ends at arrowhead bases
      var xLen = xR - xL;
      var xCls = 'cp-axis' + (visible.xDrawing ? ' cp-axis--drawing' : '');
      els.push(h('line', {
        className: xCls, x1:xL, y1:sy(0), x2:xR, y2:sy(0),
        style: visible.xDrawing ? { strokeDasharray: xLen, strokeDashoffset: xLen } : undefined
      }));
      els.push(arrowHead(xTipR, sy(0), 'right', visible.xDrawing));
      els.push(arrowHead(xTipL, sy(0), 'left', visible.xDrawing));
      els.push(h('text', { className:'cp-axis-label' + (visible.xDrawing ? ' cp-axis-arrow--fadein' : ''), x:xTipR + 26, y:sy(0) + 6 }, 'X'));
    }
    if (visible.y){
      var yTipT = sy(Y_MAX) - EXT, yTipB = sy(Y_MIN) + EXT;
      var yT = yTipT + AH, yB = yTipB - AH;
      var yLen = yB - yT;
      var yCls = 'cp-axis' + (visible.yDrawing ? ' cp-axis--drawing' : '');
      els.push(h('line', {
        className: yCls, x1:sx(0), y1:yB, x2:sx(0), y2:yT,
        style: visible.yDrawing ? { strokeDasharray: yLen, strokeDashoffset: yLen } : undefined
      }));
      els.push(arrowHead(sx(0), yTipT, 'up', visible.yDrawing));
      els.push(arrowHead(sx(0), yTipB, 'down', visible.yDrawing));
      els.push(h('text', { className:'cp-axis-label' + (visible.yDrawing ? ' cp-axis-arrow--fadein' : ''), x:sx(0) - 4, y:yTipT - 22 }, 'Y'));
    }
    return els;
  }

  function quadrantRectEl(qid, opts){
    opts = opts || {};
    var r = QUADRANT_RECTS[qid];
    var cls = 'cp-quadrant-region' +
      (opts.shaded ? ' cp-quadrant-region--shaded' : '') +
      (opts.pulse ? ' cp-quadrant-region--pulse' : '');
    return h('rect', {
      className: cls, x:r.x, y:r.y, width:r.w, height:r.h,
      onClick: opts.onClick,
      style: opts.onClick ? { cursor:'pointer' } : undefined
    });
  }

  function quadrantNumberBadge(qid){
    var r = QUADRANT_RECTS[qid];
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    return [
      h('circle', { className:'cp-qbadge-circle', cx:cx, cy:cy, r:26 }),
      h('text', { className:'cp-qbadge-num', x:cx, y:cy + 8 }, String(QUADRANT_NUMBER[qid]))
    ];
  }

  // quadrant tag sitting just OUTSIDE the grid (above for I/II, below for III/IV) —
  // the one shared tag style used on every quadrant-labeling screen (8-14)
  var OUTSIDE_TAG_IS_TOP = { I:true, II:true, III:false, IV:false };
  function outsideQuadrantTag(qid, label, opts){
    opts = opts || {};
    var r = QUADRANT_RECTS[qid];
    var cx = r.x + r.w / 2;
    var y = opts.inside
      ? r.y + r.h / 2
      : (OUTSIDE_TAG_IS_TOP[qid] ? r.y - 24 : r.y + r.h + 24);
    var cls = 'cp-qtag' + (opts.inside ? ' cp-qtag--inside' : ' cp-qtag--outside') +
      (opts.tone ? ' cp-qtag--' + opts.tone : '') +
      (opts.tappable ? ' cp-qtag--tappable' : '');
    return h('g', {
      className: cls, transform:'translate(' + cx + ',' + y + ')',
      onClick: opts.onClick, style: opts.onClick ? { cursor:'pointer' } : undefined
    },
      h('rect', { className:'cp-qtag-bg', x:-58, y:-17, width:116, height:34, rx:6 }),
      h('text', { className:'cp-qtag-text', x:0, y:6 }, label)
    );
  }

  // anti-clockwise numbering arrows (screen 7): I->II (left), II->III (down), III->IV (right), IV->I (up)
  function arrow(x1, y1, x2, y2){
    var ang = Math.atan2(y2 - y1, x2 - x1);
    var ah = 10;
    // stop the line at the arrowhead base so it doesn't poke past the tip
    var baseX = x2 - ah * Math.cos(ang), baseY = y2 - ah * Math.sin(ang);
    var els = [h('line', { className:'cp-num-arrow', x1:x1, y1:y1, x2:baseX, y2:baseY })];
    var p1x = x2 - ah * Math.cos(ang - 0.5), p1y = y2 - ah * Math.sin(ang - 0.5);
    var p2x = x2 - ah * Math.cos(ang + 0.5), p2y = y2 - ah * Math.sin(ang + 0.5);
    els.push(h('path', { className:'cp-num-arrow-head', d:'M ' + x2 + ' ' + y2 + ' L ' + p1x + ' ' + p1y + ' L ' + p2x + ' ' + p2y + ' z' }));
    return els;
  }
  function numberingArrowEls(){
    var els = [];
    // I(2,2.5) -> II(-2,2.5) : leftward
    els = els.concat(arrow(sx(1.4), sy(2.5), sx(-1.4), sy(2.5)));
    // II(-3,2) -> III(-3,-2) : downward
    els = els.concat(arrow(sx(-3.5), sy(1.4), sx(-3.5), sy(-1.4)));
    // III(-2,-2.5) -> IV(2,-2.5) : rightward
    els = els.concat(arrow(sx(-1.4), sy(-2.5), sx(1.4), sy(-2.5)));
    // IV(3,-2) -> I(3,2) : upward
    els = els.concat(arrow(sx(3.5), sy(-1.4), sx(3.5), sy(1.4)));
    return els;
  }

  // axis-endpoint hotspot: a pulsing red tap target before tap, a small yellow (axis-color)
  // dot after tap so the tapped endpoint stays visible on the axis being drawn
  function axisHotspotDot(cx, cy, tapped, onClick){
    if (tapped){
      return h('circle', { className:'cp-axis-dot', cx:cx, cy:cy, r:6 });
    }
    return h('circle', {
      className:'cp-point cp-point--pulse', cx:cx, cy:cy, r:11,
      onClick: onClick, style:{cursor:'pointer'}
    });
  }

  // SVG-space tap cue (reuses fingerTap.gif) shown next to the first untapped axis hotspot
  function handCueEl(cx, cy){
    var size = 54;
    return h('image', {
      className: 'cp-hand-cue', href: './assets/images/fingerTap.gif',
      x: cx - size / 2, y: cy + 6, width: size, height: size
    });
  }

  function quadrantCenter(qid){
    var r = QUADRANT_RECTS[qid];
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  function signLabelEl(key, text, opts){
    opts = opts || {};
    var p = SIGN_LABEL_POS[key];
    return h('text', {
      className: 'cp-sign-label' + (opts.pulse ? ' cp-sign-label--pulse' : '') + (opts.teeter ? ' cp-sign-label--teeter' : ''),
      x:p.x, y:p.y
    }, text);
  }

  function plottedPointEl(x, y, label, opts){
    opts = opts || {};
    var cls = 'cp-point cp-plot-point' + (opts.pulse ? ' cp-point--pulse' : '');
    var els = [h('circle', { className:cls, cx:sx(x), cy:sy(y), r:11 })];
    if (label != null){
      els.push(h('text', { className:'cp-point-label', x:sx(x) + 16, y:sy(y) - 14 }, label));
    }
    return els;
  }

  function guideLine(kind, a, b, unitLabel){
    if (kind === 'x'){
      // horizontal highlight along the x-axis from x=b (origin) to x=a, label centered above
      var midX = (sx(a) + sx(b)) / 2;
      return [
        h('line', { className:'cp-guide cp-guide--h', x1:sx(b), y1:sy(0), x2:sx(a), y2:sy(0) }),
        h('text', { className:'cp-guide-label', x:midX, y:sy(0) - 12 }, unitLabel)
      ];
    }
    // vertical highlight at x=a from y=0 up to y=b, label to the right
    return [
      h('line', { className:'cp-guide cp-guide--v', x1:sx(a), y1:sy(0), x2:sx(a), y2:sy(b) }),
      h('text', { className:'cp-guide-label cp-guide-label--v', x:sx(a) + 14, y:(sy(0) + sy(b)) / 2 + 5 }, unitLabel)
    ];
  }

  // props: { screen, view, onTapAxis(which), onSelectQuadrant(qid), dragChildren }
  // `view` is a plain object computed by the caller (AppletContainer) describing exactly
  // which elements to render for the current screen; CartesianGrid stays a pure renderer.
  function CartesianGrid(props){
    var view = props.view || {};
    var layers = [];

    layers = layers.concat(gridLines());

    if (view.showAxisHotspots){
      layers.push(axisHotspotDot(sx(X_MIN), sy(0), view.xLeftTapped, function(){ props.onTapAxis('x', 'Left'); }));
      layers.push(axisHotspotDot(sx(X_MAX), sy(0), view.xRightTapped, function(){ props.onTapAxis('x', 'Right'); }));
      if (!view.xLeftTapped) layers.push(handCueEl(sx(X_MIN), sy(0)));
      else if (!view.xRightTapped) layers.push(handCueEl(sx(X_MAX), sy(0)));
    }
    if (view.showYAxisHotspots){
      layers.push(axisHotspotDot(sx(0), sy(Y_MAX), view.yTopTapped, function(){ props.onTapAxis('y', 'Top'); }));
      layers.push(axisHotspotDot(sx(0), sy(Y_MIN), view.yBottomTapped, function(){ props.onTapAxis('y', 'Bottom'); }));
      if (!view.yTopTapped) layers.push(handCueEl(sx(0), sy(Y_MAX)));
      else if (!view.yBottomTapped) layers.push(handCueEl(sx(0), sy(Y_MIN)));
    }

    layers = layers.concat(axes({ x: view.showXAxis, y: view.showYAxis, xDrawing: view.drawXAxis, yDrawing: view.drawYAxis }));
    if (view.showXAxis) layers = layers.concat(xNumberEls());
    if (view.showXAxis && view.showYAxis) layers = layers.concat(yNumberEls());

    // quadrant shaded/numbered reveal (screens 3-6)
    if (view.revealedQuadrants){
      view.revealedQuadrants.forEach(function(qid){
        layers.push(quadrantRectEl(qid, { shaded:true }));
        layers = layers.concat(quadrantNumberBadge(qid));
      });
    }
    if (view.pulsingQuadrant){
      layers.push(quadrantRectEl(view.pulsingQuadrant, {
        pulse:true, onClick: view.onQuadrantRevealTap ? function(){ view.onQuadrantRevealTap(view.pulsingQuadrant); } : undefined
      }));
      var pulsingCenter = quadrantCenter(view.pulsingQuadrant);
      layers.push(handCueEl(pulsingCenter.x, pulsingCenter.y));
    }

    // screen 7: numbered quadrants 1-4 + anti-clockwise direction arrows
    if (view.numberedQuadrants){
      view.numberedQuadrants.forEach(function(qid){
        layers.push(quadrantRectEl(qid, { shaded:true }));
        layers = layers.concat(quadrantNumberBadge(qid));
      });
    }
    if (view.numberingArrows){
      layers = layers.concat(numberingArrowEls());
    }

    // shade the single active quadrant (sign-convention screens)
    if (view.shadeQuadrant){
      layers.push(quadrantRectEl(view.shadeQuadrant, { shaded:true }));
    }
    // shade multiple quadrants without number badges (screen 8 cumulative sign reveal)
    if (view.shadeQuadrants){
      view.shadeQuadrants.forEach(function(qid){
        layers.push(quadrantRectEl(qid, { shaded:true }));
      });
    }

    // teeter-affected quadrant highlight (wrong tap feedback) — drawn before badges
    if (view.teeterQuadrant){
      layers.push(h('rect', {
        className:'cp-quadrant-region cp-quadrant-region--teeter',
        x:QUADRANT_RECTS[view.teeterQuadrant].x, y:QUADRANT_RECTS[view.teeterQuadrant].y,
        width:QUADRANT_RECTS[view.teeterQuadrant].w, height:QUADRANT_RECTS[view.teeterQuadrant].h
      }));
    }

    // pulsing full-quadrant tap hit-areas (practice screens 10, 17-18, 25) — no hand
    // cue here: these are quiz/practice screens where the CTA text already says "Tap..."
    if (view.pulseQuadrantHitAreas && view.tappableQuadrants){
      view.tappableQuadrants.forEach(function(qid){
        layers.push(quadrantRectEl(qid, {
          pulse:true,
          onClick: function(){ props.onSelectQuadrant(qid); }
        }));
      });
    }

    // quadrant tags (screens 8-19, 25-29) — color/tone depends on state:
    // teeter (wrong tap, all four flash red) > active (confirmed correct, green) >
    // tappable (still awaiting a tap, orange pulse) > default (plain, untouched).
    // Tags awaiting a tap (insideTagQuadrants) sit centered inside the quadrant; once
    // revealed/answered they move to just outside the grid edge.
    if (view.cornerBadges){
      ['I', 'II', 'III', 'IV'].forEach(function(qid){
        var tappable = view.tappableQuadrants && view.tappableQuadrants.indexOf(qid) !== -1;
        var inside = view.insideTagQuadrants && view.insideTagQuadrants.indexOf(qid) !== -1;
        var tone = null;
        if (view.teeterAllTags) tone = 'teeter';
        else if (view.activeQuadrant === qid) tone = 'active';
        else if (tappable) tone = 'tappable';
        layers.push(outsideQuadrantTag(qid, view.cornerBadgeLabels[qid], {
          tone: tone,
          tappable: tappable,
          inside: inside,
          onClick: tappable ? function(){ props.onSelectQuadrant(qid); } : undefined
        }));
      });
      // screen 8: hand cue next to the first still-untapped sign tag (tags sit inside the quadrant)
      if (view.insideTagQuadrants && view.insideTagQuadrants.length && !(view.pulseQuadrantHitAreas && view.tappableQuadrants)){
        var firstSignCenter = quadrantCenter(view.insideTagQuadrants[0]);
        layers.push(handCueEl(firstSignCenter.x, firstSignCenter.y));
      }
    }

    // single small quadrant tag, outside the grid (drag screens 13-14, 19-20)
    if (view.singleQuadrantLabel){
      layers.push(outsideQuadrantTag(view.singleQuadrantLabel.qid, view.singleQuadrantLabel.label, { tone:'active' }));
    }

    // sign-convention point labels (P(x,y) etc.)
    if (view.signLabels){
      view.signLabels.forEach(function(item){
        layers.push(signLabelEl(item.key, item.text, { pulse: item.pulse, teeter: view.teeterAllTags }));
      });
    }

    // guide lines + plotted point
    if (view.guideX != null){
      layers = layers.concat(guideLine('x', view.guideX, view.guideXTo, view.guideXLabel));
    }
    if (view.guideY != null){
      layers = layers.concat(guideLine('y', view.guideYAt, view.guideY, view.guideYLabel));
    }
    if (view.plottedPoint){
      layers = layers.concat(plottedPointEl(view.plottedPoint.x, view.plottedPoint.y, view.plottedPoint.label, { pulse: view.plottedPoint.pulse }));
    }

    // drag pointer(s) — rendered last so they're always on top and never blocked by quadrant rects
    if (props.dragChildren) layers = layers.concat(props.dragChildren);

    return h('div', { className:'cp-wrap' },
      h('svg', {
        className: 'cp-svg', viewBox: '0 0 ' + W + ' ' + H,
        preserveAspectRatio: 'xMidYMid meet'
      }, layers)
    );
  }

  window.CartesianGrid = CartesianGrid;
  window.CartesianGridMath = { UNIT:UNIT, X_MIN:X_MIN, X_MAX:X_MAX, Y_MIN:Y_MIN, Y_MAX:Y_MAX, OX:OX, OY:OY, W:W, H:H, sx:sx, sy:sy, fmtPoint:fmtPoint };
})();
