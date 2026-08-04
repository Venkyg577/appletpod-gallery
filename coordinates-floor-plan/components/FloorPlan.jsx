// FloorPlan.jsx — the interactive stage + the draggable tray pin (rendered separately).
//
// The stage (.fg-stage) is a fixed design-pixel box (STAGE_W x STAGE_H). It draws:
//   - floor-plan background image (fades out in grid/done)
//   - SVG grid overlay (fades in for grid/done)
//   - active target ring (placing phase, current target only — sequential reveal)
//   - placed markers: a TOP-VIEW beveled red dot at each placed target (pulse in allPlaced/grid)
//   - tappable hotspots + revealed A–P labels (grid/done)
//
// The draggable pin lives OUTSIDE the stage (in the right panel column) via the exported
// TrayPin component, so the tray reads as part of the panel like the source PDF. Drag is
// done with direct DOM + screen (client) coordinates so it works across containers; on a
// successful drop it calls onPlace() (the only point that touches state).

(function(){
  var h = window.MiniReact.h;

  // ---- stage geometry (design px; floor image 1752x898 ~ 1.951:1) ----
  var STAGE_W = 1180;
  var STAGE_H = Math.round(STAGE_W * 898 / 1752);     // 605
  var DOT_R   = 16;                                    // placed top-view dot radius (px)
  var HIT_R   = 52;                                    // drop hit radius, in SCREEN px

  // POINTS' (nx, ny) are normalized to the room's OUTER BORDER rectangle (measured by
  // pixel-detecting the border lines in floorplan.png), not the raw image bounds. This
  // box-within-the-image is expressed as fractions of the full image so px()/py() can
  // map a border-relative point straight to stage design-px.
  var BORDER_L = 0.0642, BORDER_R = 0.9344, BORDER_T = 0.0334, BORDER_B = 0.9660;

  function px(nx){ return (BORDER_L + nx * (BORDER_R - BORDER_L)) * STAGE_W; }
  function py(ny){ return (BORDER_T + ny * (BORDER_B - BORDER_T)) * STAGE_H; }

  // top-view marker: a beveled red dot (looks like a pushpin head seen from above)
  function placedDot(left, top, extraClass){
    return h('div', {
      className: 'fg-dot ' + (extraClass || ''),
      'aria-hidden': 'true',
      style: { left: left + 'px', top: top + 'px' }
    });
  }

  // Bathing-area boundary: a black line connecting L (left wall) -> O (interior
  // corner) -> N (top wall, bathroom/bedroom divider). Drawn from the very start
  // (always visible) so the bathing area reads as an enclosed region before any
  // pins are placed. Coordinates use the same border-relative px()/py(); L's end
  // runs all the way to the left wall border (nx=0), matching the room edge.
  var BATH_OUTLINE = [ { nx:0.000, ny:0.328 }, { nx:0.230, ny:0.309 }, { nx:0.228, ny:0.000 } ];
  function bathOutline(){
    var pts = BATH_OUTLINE.map(function(p){ return px(p.nx) + ',' + py(p.ny); }).join(' ');
    return h('svg', {
      className: 'fg-bath',
      viewBox: '0 0 ' + STAGE_W + ' ' + STAGE_H, preserveAspectRatio: 'none'
    }, h('polyline', { className:'fg-bath-line', points: pts }));
  }

  // Grid is bounded by the room's outer corners (M top-left, A top-right, B
  // bottom-right, K bottom-left) rather than the full image — GRID_X/Y divisions
  // land exactly on the border box so a corner point always sits at a grid
  // intersection instead of floating inside a cell.
  var GRID_L = px(0), GRID_R = px(1), GRID_T = py(0), GRID_B = py(1);
  var GRID_COLS = 12, GRID_ROWS = Math.round(GRID_COLS * (GRID_B - GRID_T) / (GRID_R - GRID_L));
  function gridOverlay(show){
    var lines = [], i;
    for (i = 0; i <= GRID_COLS; i++){
      var x = GRID_L + (GRID_R - GRID_L) * i / GRID_COLS;
      lines.push(h('line', { className:'fg-grid-line', x1:x, y1:GRID_T, x2:x, y2:GRID_B }));
    }
    for (i = 0; i <= GRID_ROWS; i++){
      var y = GRID_T + (GRID_B - GRID_T) * i / GRID_ROWS;
      lines.push(h('line', { className:'fg-grid-line', x1:GRID_L, y1:y, x2:GRID_R, y2:y }));
    }
    return h('svg', {
      className: 'fg-grid' + (show ? ' fg-grid--show' : ''),
      viewBox: '0 0 ' + STAGE_W + ' ' + STAGE_H, preserveAspectRatio: 'none'
    }, lines);
  }

  // -------------------------------------------------------------- FloorPlan
  function FloorPlan(props){
    var state = props.state;
    var onReveal = props.onReveal;

    var phase = state.phase;
    var points = state.points;
    var placing = phase === 'placing';
    var gridish = phase === 'grid' || phase === 'done';
    var pulseAll = phase === 'allPlaced' || phase === 'grid';

    var target = null;
    if (placing && state.activeId){
      target = points.filter(function(p){ return p.id === state.activeId; })[0];
    }

    var layers = [];

    layers.push(h('img', {
      className: 'fg-img' + (gridish ? ' fg-img--faded' : ''),
      src: './assets/images/floorplan.png', alt: "Floor plan of Reiaan's room"
    }));

    // bathing-area boundary line — always drawn (incl. before any pins are placed)
    layers.push(bathOutline());

    layers.push(gridOverlay(gridish));

    // active target ring (drag destination cue is the cross-container DragHint,
    // rendered by AppletContainer since it must reach from the panel tray to here)
    if (target){
      layers.push(h('div', {
        className: 'fg-target fg-target--active',
        style: { left: px(target.nx) + 'px', top: py(target.ny) + 'px' }
      }));
    }

    // placed top-view dots — only the most-recently-placed one plays the drop-in
    // animation; earlier dots render statically so they don't all "pop" together
    // on every subsequent placement (mini-react remounts the whole subtree).
    points.forEach(function(p){
      if (!state.placed[p.id]) return;
      var isRevealedGreen = !!state.revealed[p.id] || phase === 'done';
      var cls = isRevealedGreen ? 'fg-dot--revealed' : '';
      if (pulseAll) cls += ' fg-dot--pulse';
      if (p.id === state.lastPlacedId) cls += ' fg-dot--enter';
      layers.push(placedDot(px(p.nx), py(p.ny), cls));
    });

    // tappable hotspots + labels (grid/done)
    if (gridish){
      points.forEach(function(p){
        var isRevealed = !!state.revealed[p.id] || phase === 'done';
        if (phase === 'grid' && !state.revealed[p.id]){
          layers.push(h('div', {
            className: 'fg-hotspot',
            style: { left: px(p.nx) + 'px', top: py(p.ny) + 'px' },
            onClick: function(){ onReveal(p.id); }
          }));
        }
        if (isRevealed){
          // points near the top edge would have their label clipped by the stage
          // bounds (label sits above the dot by default) — flip it below instead.
          var nearTop = py(p.ny) < 40;
          var labelCls = 'fg-label' + (nearTop ? ' fg-label--below' : '') +
            (p.id === state.lastRevealedId ? ' fg-label--enter' : '');
          var labelTop = nearTop ? (py(p.ny) + DOT_R + 10) : (py(p.ny) - DOT_R - 10);
          layers.push(h('div', {
            className: labelCls,
            style: { left: px(p.nx) + 'px', top: labelTop + 'px' }
          }, p.id));
        }
      });
    }

    return h('div', { className:'fg-wrap' },
      h('div', { className:'fg-stage', style:{ width:STAGE_W + 'px', height:STAGE_H + 'px' } }, layers)
    );
  }

  // -------------------------------------------------------------- TrayPin
  // Rendered in the panel column. Draggable; on a good drop (tip within HIT_R screen-px of
  // the active target ring) it calls onPlace(activeId).
  function TrayPin(props){
    var activeId = props.activeId;
    var onPlace = props.onPlace;

    function bindDrag(node){
      if (!node || node.__bound) return;
      node.__bound = true;
      node.__tx = 0; node.__ty = 0;
      var dragging = false, startX = 0, startY = 0, baseTx = 0, baseTy = 0, scale = 1;

      // the page is rendered at --scaleFactor; CSS-px translate renders at `scale` on screen.
      // Convert a screen-px delta to local CSS px by dividing by this scale.
      function elemScale(){
        var r = node.getBoundingClientRect();
        return node.offsetWidth ? (r.width / node.offsetWidth) : 1;
      }

      // tip position of the pin in SCREEN coords (tip ≈ x:18%, y:97% of the bitmap)
      function tipScreen(){
        var r = node.getBoundingClientRect();
        return { x: r.left + r.width * 0.18, y: r.top + r.height * 0.97 };
      }
      function targetScreen(){
        var ring = document.querySelector('.fg-target--active');
        if (!ring) return null;
        var r = ring.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.max(r.width, r.height) };
      }
      function onDown(e){
        dragging = true;
        scale = elemScale() || 1;
        node.classList.add('pin--dragging');
        startX = e.clientX; startY = e.clientY;
        baseTx = node.__tx; baseTy = node.__ty;
        try { node.setPointerCapture(e.pointerId); } catch(_){}
        e.preventDefault();
      }
      function onMove(e){
        if (!dragging) return;
        node.__tx = baseTx + (e.clientX - startX) / scale;
        node.__ty = baseTy + (e.clientY - startY) / scale;
        node.style.transform = 'translate(' + node.__tx + 'px,' + node.__ty + 'px)';
      }
      function onUp(e){
        if (!dragging) return;
        dragging = false;
        node.classList.remove('pin--dragging');
        try { node.releasePointerCapture(e.pointerId); } catch(_){}
        var tip = tipScreen(), tgt = targetScreen();
        var hit = tgt && Math.hypot(tip.x - tgt.x, tip.y - tgt.y) <= Math.max(HIT_R, tgt.r);
        if (hit){
          onPlace(activeId);               // success -> state update remounts subtree
        } else {
          node.__tx = 0; node.__ty = 0;    // miss -> spring back, no feedback
          node.classList.add('pin--returning');
          node.style.transform = 'translate(0px,0px)';
          setTimeout(function(){ node && node.classList.remove('pin--returning'); }, 320);
        }
      }
      node.addEventListener('pointerdown', onDown);
      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerup', onUp);
      node.addEventListener('pointercancel', onUp);
    }

    return h('div', { className:'tray' },
      h('img', {
        className:'pin pin--tray', src:'./assets/images/pin.png',
        alt:'Draggable pin', ref: bindDrag
      })
    );
  }

  // -------------------------------------------------------------- DragHint
  // A finger-tap icon that visually travels from the tray pin to the active target,
  // looping, to teach the drag gesture. Rendered at the applet-root level (fixed,
  // viewport-wide) since the pin (panel) and the target (stage) live in separate
  // DOM subtrees — only screen (client) coordinates can bridge them. Pure DOM/rAF
  // animation so it survives mini-react's remount-on-setState without restarting
  // mid-stride from React re-renders (it re-measures on each loop, not per render).
  function DragHint(props){
    var active = props.active; // boolean: only animate while a target is live

    function bindHint(node){
      if (!node) return;
      if (node.__stop){ node.__stop(); node.__stop = null; }
      if (!active){ node.style.opacity = '0'; return; }

      var raf = null, timeout = null, stopped = false;

      // .drag-hint is positioned absolute within .responsive-wrapper, a fixed 1920x1080
      // design-px box rendered at `--scaleFactor` via transform:scale. A transformed
      // ancestor becomes the containing block for fixed/absolute descendants, so raw
      // getBoundingClientRect() viewport px land in the wrong place once scaled — every
      // measurement must be converted into that same 1920x1080 local space first.
      function toLocal(screenX, screenY){
        var wrapper = document.querySelector('.responsive-wrapper');
        if (!wrapper) return { x: screenX, y: screenY };
        var wr = wrapper.getBoundingClientRect();
        var scale = wr.width / 1920;
        return { x: (screenX - wr.left) / scale, y: (screenY - wr.top) / scale };
      }
      function pinTip(){
        var pin = document.querySelector('.pin--tray');
        if (!pin) return null;
        var r = pin.getBoundingClientRect();
        if (!r.width) return null;
        return toLocal(r.left + r.width * 0.18, r.top + r.height * 0.97);
      }
      function targetCenter(){
        var ring = document.querySelector('.fg-target--active');
        if (!ring) return null;
        var r = ring.getBoundingClientRect();
        if (!r.width) return null;
        return toLocal(r.left + r.width / 2, r.top + r.height / 2);
      }
      function ease(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; }

      function runCycle(){
        if (stopped) return;
        var from = pinTip(), to = targetCenter();
        var targetId = document.querySelector('.fg-target--active');
        if (!from || !to){ timeout = setTimeout(runCycle, 200); return; }

        var holdStart = 350, travel = 650, holdEnd = 450, fadeOut = 200;
        var total = holdStart + travel + holdEnd + fadeOut;
        var t0 = performance.now();

        node.style.opacity = '1';
        node.style.left = from.x + 'px';
        node.style.top = from.y + 'px';

        function step(now){
          if (stopped) return;
          // the active target can change mid-cycle (pin dropped while the hint was
          // still traveling/holding) — if it does, abandon this cycle immediately
          // and restart fresh toward the new target instead of finishing the stale
          // journey, which otherwise reads as the hand pointing at the dot just placed.
          if (document.querySelector('.fg-target--active') !== targetId){
            raf = null;
            runCycle();
            return;
          }
          var elapsed = now - t0;
          if (elapsed < holdStart){
            // brief pause on the pin so the cue reads as "start here"
          } else if (elapsed < holdStart + travel){
            var p = ease((elapsed - holdStart) / travel);
            node.style.left = (from.x + (to.x - from.x) * p) + 'px';
            node.style.top  = (from.y + (to.y - from.y) * p) + 'px';
          } else if (elapsed < holdStart + travel + holdEnd){
            // hold on the target so the cue reads as "drop here"
            node.style.left = to.x + 'px';
            node.style.top  = to.y + 'px';
          } else if (elapsed < total){
            node.style.opacity = String(1 - (elapsed - holdStart - travel - holdEnd) / fadeOut);
          } else {
            node.style.opacity = '0';
            timeout = setTimeout(runCycle, 250);
            return;
          }
          raf = requestAnimationFrame(step);
        }
        raf = requestAnimationFrame(step);
      }

      runCycle();
      node.__stop = function(){
        stopped = true;
        if (raf) cancelAnimationFrame(raf);
        if (timeout) clearTimeout(timeout);
      };
    }

    return h('img', {
      className: 'drag-hint', src: './assets/images/fingerTap.gif', alt: '', 'aria-hidden': 'true',
      ref: bindHint
    });
  }

  FloorPlan.STAGE_W = STAGE_W;
  FloorPlan.STAGE_H = STAGE_H;
  window.FloorPlan = FloorPlan;
  window.TrayPin = TrayPin;
  window.DragHint = DragHint;
})();
