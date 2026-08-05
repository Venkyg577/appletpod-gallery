// Universal drag-and-drop polyfill for both touch AND mouse.
// Bypasses the native HTML5 drag API entirely so that custom
// ghosts work identically on all devices and scale correctly
// inside CSS-transformed wrappers (desktop: ghost in viewport pixels).
// Technique from reference: G6C4M9A1 – Chances of choosing correct object.
(function(){
  if (typeof window === 'undefined') return;

  var dragData = null;
  var dragElement = null;
  var lastOverElement = null;
  var dragGhost = null;
  var ghostOffsetX = 0, ghostOffsetY = 0;
  var lastClientX = 0, lastClientY = 0;
  var rafId = 0;
  var activeTouchId = null;
  var dragBodyStyle = null;

  // Mouse-specific state
  var mouseDown = false;
  var mouseDragging = false;
  var mouseStartX = 0, mouseStartY = 0;
  var DRAG_THRESHOLD = 5;

  function makeDataTransfer(data){
    return {
      data: data || {},
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: function(type, value){ this.data[type] = value; },
      getData: function(type){ return this.data[type] || ''; },
      setDragImage: function(){}
    };
  }

  function dispatchDnDEvent(target, type, dataTransfer){
    if (!target) return null;
    var evt = new Event(type, { bubbles: true, cancelable: true });
    evt.dataTransfer = dataTransfer;
    target.dispatchEvent(evt);
    return evt;
  }

  function findDroppableTargetFromPoint(x, y, dataTransfer){
    var el = document.elementFromPoint(x, y);
    while (el && el !== document.body) {
      var overEvt = dispatchDnDEvent(el, 'dragover', dataTransfer);
      if (overEvt && overEvt.defaultPrevented) return el;
      el = el.parentElement;
    }
    return null;
  }

  // Find the nearest draggable ancestor (or self)
  function findDraggable(el) {
    while (el && el !== document.body) {
      if (el.draggable) return el;
      el = el.parentElement;
    }
    return null;
  }

  function getScaleFactor(){
    var raw = document.documentElement && getComputedStyle(document.documentElement).getPropertyValue('--scaleFactor');
    if (raw == null || raw === '') return 1;
    var n = parseFloat(String(raw).trim());
    return isNaN(n) || n <= 0 ? 1 : n;
  }

  // Ghost uses same scaling technique as app: render at design size, then scale
  // so font and buttons match at all resolutions (960x540, 1920x1080, 3840x2160).
  function ensureGhost(){
    if (!dragElement || dragGhost) return;
    var rect = dragElement.getBoundingClientRect();
    var scaleFactor = getScaleFactor();
    var designW = rect.width / scaleFactor;
    var designH = rect.height / scaleFactor;

    var clone = dragElement.cloneNode(true);
    var cs = window.getComputedStyle && window.getComputedStyle(dragElement);
    clone.style.cssText = '';
    clone.style.margin = '0';
    clone.style.pointerEvents = 'none';
    clone.style.boxSizing = 'border-box';
    clone.style.width = designW + 'px';
    clone.style.height = designH + 'px';
    clone.style.minWidth = designW + 'px';
    clone.style.minHeight = designH + 'px';
    clone.style.transformOrigin = '0 0';
    clone.style.transform = 'scale(' + scaleFactor + ')';
    clone.style.willChange = 'transform';
    if (cs) {
      var bg = cs.background || cs.backgroundColor || '';
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        clone.style.background = bg;
      }
      clone.style.border = cs.border || 'none';
      clone.style.borderRadius = cs.borderRadius || '0';
      clone.style.boxShadow = cs.boxShadow || 'none';
      clone.style.color = cs.color || 'inherit';
      clone.style.padding = cs.padding || '0';
      clone.style.fontSize = cs.fontSize || 'inherit';
      clone.style.fontWeight = cs.fontWeight || 'inherit';
      clone.style.fontFamily = cs.fontFamily || 'inherit';
      clone.style.textAlign = cs.textAlign || 'start';
      clone.style.lineHeight = cs.lineHeight || 'normal';
      clone.style.display = cs.display || 'flex';
      clone.style.alignItems = cs.alignItems || 'center';
      clone.style.justifyContent = cs.justifyContent || 'center';
    }

    var wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.width = rect.width + 'px';
    wrapper.style.height = rect.height + 'px';
    wrapper.style.margin = '0';
    wrapper.style.padding = '0';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '2147483647';
    wrapper.style.opacity = '0.92';
    wrapper.style.overflow = 'hidden';
    wrapper.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))';
    wrapper.style.willChange = 'transform';
    wrapper.style.backfaceVisibility = 'visible';
    wrapper.style.webkitBackfaceVisibility = 'visible';
    var tx = lastClientX - ghostOffsetX, ty = lastClientY - ghostOffsetY;
    wrapper.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    dragGhost = wrapper;
  }

  function updateGhostPosition(){
    rafId = 0;
    if (!dragGhost) return;
    var tx = lastClientX - ghostOffsetX, ty = lastClientY - ghostOffsetY;
    dragGhost.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
  }

  function scheduleGhostUpdate(){
    if (rafId) return;
    rafId = requestAnimationFrame(updateGhostPosition);
  }

  function cleanupGhost(){
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (dragGhost && dragGhost.parentNode) dragGhost.parentNode.removeChild(dragGhost);
    dragGhost = null;
  }

  function startDrag(el, clientX, clientY) {
    dragElement = el;
    lastOverElement = null;
    cleanupGhost();
    lastClientX = clientX;
    lastClientY = clientY;
    var rect = dragElement.getBoundingClientRect();
    ghostOffsetX = clientX - rect.left;
    ghostOffsetY = clientY - rect.top;
    var dragStartEvent = new Event('dragstart', { bubbles: true, cancelable: true });
    dragStartEvent.dataTransfer = makeDataTransfer({});
    dragElement.dispatchEvent(dragStartEvent);
    dragData = dragStartEvent.dataTransfer.data || {};
    dragElement.style.opacity = '0.4';
    ensureGhost();
  }

  function moveDrag(clientX, clientY) {
    if (!dragElement) return;
    lastClientX = clientX;
    lastClientY = clientY;
    if (!dragGhost) ensureGhost();
    scheduleGhostUpdate();
    var elementAtPoint = document.elementFromPoint(clientX, clientY);
    if (elementAtPoint !== lastOverElement) {
      if (lastOverElement) dispatchDnDEvent(lastOverElement, 'dragleave', makeDataTransfer(dragData));
      if (elementAtPoint) dispatchDnDEvent(elementAtPoint, 'dragenter', makeDataTransfer(dragData));
      lastOverElement = elementAtPoint;
    }
    findDroppableTargetFromPoint(clientX, clientY, makeDataTransfer(dragData));
  }

  function endDrag(clientX, clientY) {
    if (!dragElement) return;
    lastClientX = clientX;
    lastClientY = clientY;
    var dropTarget = findDroppableTargetFromPoint(clientX, clientY, makeDataTransfer(dragData));
    dragElement.style.opacity = '';
    if (dropTarget) dispatchDnDEvent(dropTarget, 'drop', makeDataTransfer(dragData));
    dispatchDnDEvent(dragElement, 'dragend', makeDataTransfer(dragData));
    cleanupGhost();
    dragElement = null;
    dragData = null;
    lastOverElement = null;
  }

  // ===== TOUCH HANDLERS =====

  function setBodyTouchAction(value){
    if (!document.body) return;
    if (dragBodyStyle === null) dragBodyStyle = document.body.style.touchAction;
    document.body.style.touchAction = value;
  }
  function restoreBodyTouchAction(){
    if (!document.body) return;
    document.body.style.touchAction = dragBodyStyle !== null ? dragBodyStyle : '';
    dragBodyStyle = null;
  }

  function handleTouchStart(e){
    var target = findDraggable(e.target);
    if (!target) return;
    var touch = (e.touches && e.touches[0]) || null;
    if (!touch) return;
    activeTouchId = touch.identifier;
    setBodyTouchAction('none');
    startDrag(target, touch.clientX, touch.clientY);
    e.preventDefault();
  }

  function handleTouchMove(e){
    if (!dragElement) return;
    var touch = null;
    for (var i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === activeTouchId) { touch = e.touches[i]; break; }
    }
    if (!touch) return;
    moveDrag(touch.clientX, touch.clientY);
    e.preventDefault();
  }

  function handleTouchEnd(e){
    if (!dragElement) return;
    var touch = null;
    if (e.changedTouches && e.changedTouches.length) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) { touch = e.changedTouches[i]; break; }
      }
      if (!touch) touch = e.changedTouches[0];
    }
    if (!touch) return;
    restoreBodyTouchAction();
    activeTouchId = null;
    endDrag(touch.clientX, touch.clientY);
  }

  // ===== MOUSE HANDLERS (desktop: same custom ghost, correct scale in wrapper) =====

  function handleMouseDown(e) {
    if (e.button !== 0) return;
    var target = findDraggable(e.target);
    if (!target) return;
    mouseDown = true;
    mouseDragging = false;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    dragElement = target;
    e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!mouseDown || !dragElement) return;
    if (!mouseDragging) {
      var dx = e.clientX - mouseStartX;
      var dy = e.clientY - mouseStartY;
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      mouseDragging = true;
      startDrag(dragElement, mouseStartX, mouseStartY);
    }
    moveDrag(e.clientX, e.clientY);
    e.preventDefault();
  }

  function handleMouseUp(e) {
    if (!mouseDown) return;
    mouseDown = false;
    if (mouseDragging && dragElement) {
      endDrag(e.clientX, e.clientY);
    } else {
      dragElement = null;
    }
    mouseDragging = false;
  }

  // Kill native HTML5 drag so the browser never creates its own ghost.
  function killNativeDrag(e) {
    if (findDraggable(e.target)) e.preventDefault();
  }

  // ===== REGISTER =====

  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
  document.addEventListener('touchcancel', handleTouchEnd, { passive: false, capture: true });

  document.addEventListener('mousedown', handleMouseDown, true);
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('mouseup', handleMouseUp, true);
  document.addEventListener('dragstart', killNativeDrag, true);

  window.touchDragEnabled = true;
})();
