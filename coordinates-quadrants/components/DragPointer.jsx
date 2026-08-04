// DragPointer.jsx — shared draggable circle for x/y coordinate placement on CartesianGrid.
// Drags are handled with native DOM listeners (not mini-react state) to avoid a full
// component-subtree re-render on every mousemove; only the final snapped value triggers setState.
(function(){
  var h = window.MiniReact.h;

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  // props: { axis:'x'|'y', value, lockedAt, locked, teetering, color:'green'|'pink', onDragEnd(snappedValue) }
  //   axis 'x'  -> pointer slides along the x-axis row (y fixed at 0), value = current/locked x
  //   axis 'y'  -> pointer slides along a vertical line at x = lockedAt, value = current/locked y
  function DragPointer(props){
    var M = window.CartesianGridMath;
    var axis = props.axis;
    var value = props.value != null ? props.value : 0;
    var cx = axis === 'x' ? M.sx(value) : M.sx(props.lockedAt);
    var cy = axis === 'x' ? M.sy(0) : M.sy(value);

    function getSvg(el){ return el.ownerSVGElement || (el.closest ? el.closest('svg') : null); }

    function onPointerDown(domEvt){
      if (props.locked) return;
      domEvt.preventDefault();
      var node = domEvt.currentTarget;
      var svgEl = getSvg(node);
      var currentVal = value;

      function clientToValue(clientX, clientY){
        var rect = svgEl.getBoundingClientRect();
        var scale = M.W / rect.width;
        if (axis === 'x'){
          var svgX = (clientX - rect.left) * scale;
          return Math.round((svgX - M.OX) / M.UNIT);
        }
        var svgY = (clientY - rect.top) * scale;
        return Math.round((M.OY - svgY) / M.UNIT);
      }

      function pos(e){
        if (e.touches && e.touches.length) return { x:e.touches[0].clientX, y:e.touches[0].clientY };
        return { x:e.clientX, y:e.clientY };
      }

      function onMove(e){
        e.preventDefault();
        var p = pos(e);
        var raw = clientToValue(p.x, p.y);
        var clamped = axis === 'x' ? clamp(raw, M.X_MIN, M.X_MAX) : clamp(raw, M.Y_MIN, M.Y_MAX);
        currentVal = clamped;
        if (axis === 'x') node.setAttribute('cx', M.sx(clamped));
        else node.setAttribute('cy', M.sy(clamped));
      }

      function onUp(){
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        props.onDragEnd(currentVal);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive:false });
      document.addEventListener('touchend', onUp);
    }

    var cls = 'cp-drag-pointer' +
      (props.color === 'pink' ? ' cp-drag-pointer--pink' : ' cp-drag-pointer--green') +
      (props.teetering ? ' cp-drag-pointer--teeter' : '') +
      (props.pulse ? ' cp-drag-pointer--pulse' : '') +
      (props.locked ? ' cp-drag-pointer--locked' : '');

    return h('circle', {
      className: cls, cx:cx, cy:cy, r:16,
      onMousedown: onPointerDown, onTouchstart: onPointerDown,
      style: { cursor: props.locked ? 'default' : 'grab' }
    });
  }

  window.DragPointer = DragPointer;
})();
