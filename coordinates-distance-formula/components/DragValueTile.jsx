// DragValueTile.jsx — drag the horizontal/vertical change tiles into their slots (screens 18-22).
// Renders two slots (Horizontal change, Vertical change) and the orange number tiles below.
// Order-gated: the horizontal slot must be filled before the vertical one accepts a tile.
// Reports each drop to the parent via onDrop(slot, value); the parent (useAppletState) decides
// correct/teeter/lock. Drag uses pointer events; on release we hit-test against the slot rects.
(function(){
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;

  // A body-level drag ghost. The app lives inside a scale(var(--scaleFactor)) transform, so a
  // position:fixed element rendered INSIDE that tree is positioned relative to the transformed
  // ancestor (not the viewport) and won't track the cursor. We append the ghost straight to
  // document.body and size it by the current scale factor so it follows the pointer 1:1.
  var ghostEl = null;
  function showGhost(value){
    if (!ghostEl){
      ghostEl = document.createElement('div');
      ghostEl.className = 'drag-tile drag-ghost';
      ghostEl.style.position = 'fixed';
      ghostEl.style.zIndex = '2000';
      ghostEl.style.pointerEvents = 'none';
      ghostEl.style.opacity = '.92';
      document.body.appendChild(ghostEl);
    }
    ghostEl.textContent = String(value);
    var s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scaleFactor')) || 1;
    ghostEl.style.width = (70 * s) + 'px';
    ghostEl.style.height = (70 * s) + 'px';
    ghostEl.style.fontSize = (2 * s) + 'rem';
    ghostEl.style.borderRadius = (12 * s) + 'px';
  }
  function moveGhost(x, y){
    if (!ghostEl) return;
    var s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scaleFactor')) || 1;
    ghostEl.style.left = (x - 35 * s) + 'px';
    ghostEl.style.top = (y - 35 * s) + 'px';
  }
  function hideGhost(){
    if (ghostEl && ghostEl.parentNode){ ghostEl.parentNode.removeChild(ghostEl); }
    ghostEl = null;
  }

  // props: {
  //   tiles:[{value,label}], hFilled (value|null), vFilled (value|null),
  //   activeSlot:'h'|'v', teeterTile (value|null),
  //   instruction, onDrop(slot, value)
  // }
  function DragTilePanel(props){
    var dragState = useState(null);          // { value, x, y } while dragging
    var drag = dragState[0], setDrag = dragState[1];

    var hFilled = props.hFilled;
    var vFilled = props.vFilled;

    function slotEl(slot, filledVal, label, isActive){
      var cls = 'drag-slot';
      if (filledVal != null) cls += ' drag-slot--filled drag-slot--locked';
      else if (isActive) cls += ' drag-slot--active';
      return h('div', { className:'drag-row' },
        h('div', { className:'drag-row-label' }, label),
        h('div', {
          className: cls,
          'data-slot': slot
        }, filledVal != null ? String(filledVal) : '')
      );
    }

    function startDrag(value, domEvt){
      // can't drag a tile that's already placed
      if (value === hFilled || value === vFilled) return;
      domEvt.preventDefault();
      var p = pointFrom(domEvt);
      setDrag({ value:value });
      showGhost(value);
      moveGhost(p.x, p.y);

      function onMove(e){
        e.preventDefault && e.preventDefault();
        var pt = pointFrom(e);
        moveGhost(pt.x, pt.y);
      }
      function onUp(e){
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        var pt = pointFrom(e);
        var slot = hitSlot(pt.x, pt.y);
        hideGhost();
        setDrag(null);
        if (slot) props.onDrop(slot, value);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive:false });
      document.addEventListener('touchend', onUp);
    }

    function pointFrom(e){
      if (e.changedTouches && e.changedTouches.length) return { x:e.changedTouches[0].clientX, y:e.changedTouches[0].clientY };
      if (e.touches && e.touches.length) return { x:e.touches[0].clientX, y:e.touches[0].clientY };
      return { x:e.clientX, y:e.clientY };
    }

    // Query the live slot nodes from the DOM at drop time (not captured refs): mini-react
    // replaces the whole subtree on each setState, so refs captured at drag-start would point
    // at detached nodes by the time the pointer is released.
    function hitSlot(x, y){
      var slots = ['h', 'v'];
      for (var i = 0; i < slots.length; i++){
        var node = document.querySelector('.drag-slot[data-slot="' + slots[i] + '"]');
        if (!node) continue;
        var r = node.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return slots[i];
      }
      return null;
    }

    var tiles = (props.tiles || []).map(function(tile){
      var used = tile.value === hFilled || tile.value === vFilled;
      var cls = 'drag-tile' +
        (used ? ' drag-tile--used' : '') +
        (props.teeterTile === tile.value ? ' drag-tile--teeter' : '') +
        (drag && drag.value === tile.value ? ' drag-tile--dragging' : '');
      return h('div', {
        className: cls,
        onMousedown: function(e){ startDrag(tile.value, e); },
        onTouchstart: function(e){ startDrag(tile.value, e); }
      }, tile.label);
    });

    var children = [
      slotEl('h', hFilled, props.hLabel, props.activeSlot === 'h'),
      slotEl('v', vFilled, props.vLabel, props.activeSlot === 'v'),
      h('div', { className:'drag-tiles' }, tiles),
      h('div', { className:'drag-instr' }, props.instruction)
    ];

    return h('div', { className:'drag-area' }, children);
  }

  window.DragTilePanel = DragTilePanel;
})();
