/* global window, document, createElement, Components, lightScene, sound, utils, LIGHT_CONFIG */
/* State machine + screen builders for "Light and Its Properties". */

// Reuse the globals declared by components.js / lightScene.js / mini-react.js directly
// (h, AppShell, NextButton, OptionButton, FeedbackBox, PropertyBadge, SceneImage,
// beamPolygonPoints, shadowWidth, brightnessToOverlayOpacity, pointInRect, screenToLocal) —
// these are plain <script> globals, not modules, so redeclaring them here would collide.
const t = window.utils.getText;
const ROOMS = LIGHT_CONFIG.rooms;

let appState = {
  screen: 1,
  s1ShowReflectionPopup: false,
  s4Answer: null, // null | 'correct'
  s4WrongPick: null, // last wrongly-clicked option label, or null
  s6FlashlightOn: false,
  s7Brightness: 1, // 0..1
  s8Placed: {}, // objectId -> 'produces' | 'noproduce' (correct baskets only, once locked)
  s8LastTapped: null,
  s8TrayOrder: null, // shuffled object id list, set on first render of screen 8
  s8Positions: {}, // objectId -> {x, y} random non-overlapping slot within its basket
  s9Positioned: false, // true once screen 9's chip positions have been measured/set
  s9Positions: {}, // objectId -> {x, y}, independent copy for screen 9's read-only layout
  s3BeamOn: false,
  s10BeamOn: false,
  s11Rotations: 0,
  s11Angle: 0, // current flashlight rotation, degrees
  s11Revealed: false,
  s12SheetPlaced: false,
  s14CardboardPlaced: false,
  s14CardboardX: 52, // % along the beam (scene-percent coords)
  s17Placed: {}, // materialId -> true once placed
  s17Current: null, // most recently placed material id (shown in the beam)
};

let scheduledTimers = [];
function schedule(fn, ms) {
  const id = setTimeout(() => {
    scheduledTimers = scheduledTimers.filter((t2) => t2 !== id);
    fn();
  }, ms);
  scheduledTimers.push(id);
  return id;
}
function clearScheduled() {
  scheduledTimers.forEach(clearTimeout);
  scheduledTimers = [];
}

function setState(patch) {
  Object.assign(appState, patch);
  renderApp();
}

function goNext() {
  clearScheduled();
  sound.playClickSound();
  setState({ screen: appState.screen + 1 });
}

function goTo(screenNum, patch) {
  clearScheduled();
  setState(Object.assign({ screen: screenNum }, patch || {}));
}

function ct(path, params) {
  return t('content-ui.' + path, params);
}

/* ---------------- Screen 1: Topic Selection ---------------- */
function buildScreen1() {
  const c = ct('screens.1');
  function pickLight() {
    sound.playClickSound();
    goTo(2);
  }
  function showReflectionPopup() {
    sound.playClickSound();
    setState({ s1ShowReflectionPopup: true });
  }
  const body = h(
    'div',
    { style: { display: 'flex', width: '100%', height: '100%', alignItems: 'center', gap: '48px' } },
    h(
      'div',
      { style: { flex: '0 0 640px', display: 'flex', flexDirection: 'column', gap: '28px' } },
      h(
        'div',
        { style: { position: 'relative', width: '100%' } },
        OptionButton({ label: c.optionA, icon: '💡', onClick: pickLight }),
        GestureHint({ extraClass: 'gesture-hint--option' })
      ),
      OptionButton({ label: c.optionB, icon: '🪞', onClick: showReflectionPopup })
    ),
    h(
      'div',
      { className: 'hero-frame', style: { flex: '1 1 auto' } },
      h('img', { className: 'hero-image', src: ROOMS.home, alt: 'Light exploration' })
    )
  );
  const modal = appState.s1ShowReflectionPopup
    ? Modal({
        title: 'Coming Soon',
        text: 'Reflection of Light and Laws of Reflection is a concept to be added soon. Stay tuned!',
        onClose: () => setState({ s1ShowReflectionPopup: false }),
      })
    : null;
  const shell = AppShell({ title: c.title, footerText: c.instruction, body });
  if (modal) shell.appendChild(modal);
  return shell;
}

/* ---------------- Screen 2: Find the Cat in Darkness ---------------- */
function buildScreen2() {
  const c = ct('screens.2');
  const onTap = () => {
    sound.playClickSound();
    goTo(3);
  };
  const body = h(
    'div',
    { className: 'scene', onClick: onTap },
    SceneImage({ src: ROOMS.dark, alt: 'Dark room' })
  );
  return AppShell({ title: c.title, footerText: c.instruction, body });
}

/* ---------------- Screen 3: Turn on the Flashlight ---------------- */
function buildScreen3() {
  const c = ct('screens.3');
  const on = appState.s3BeamOn;
  function tapFlashlight() {
    sound.playClickSound();
    setState({ s3BeamOn: true });
    schedule(() => goTo(4), 900);
  }
  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.dark, alt: 'Dark room' }),
    h('img', {
      className: 'scene-bg',
      src: ROOMS.light,
      alt: 'Lit room',
      style: { opacity: on ? 1 : 0, transition: 'opacity 0.5s ease' },
    }),
    h('img', {
      className: 'flashlight' + (on ? '' : ' flashlight--pulse'),
      src: ROOMS.flashlight,
      alt: 'Flashlight',
      onClick: on ? null : tapFlashlight,
    }),
    on ? null : GestureHint({ extraClass: 'gesture-hint--flashlight' })
  );
  return AppShell({ title: c.title, footerText: c.instruction, body });
}

/* ---------------- Screen 4: Concept Check (MCQ) ---------------- */
function buildScreen4() {
  const c = ct('screens.4');
  const solved = appState.s4Answer === 'correct';

  function pick(opt) {
    if (opt === c.answer) {
      sound.playCorrectSound();
      setState({ s4Answer: 'correct', s4WrongPick: null, s6FlashlightOn: true });
    } else {
      sound.playWrongSound();
      setState({ s4WrongPick: opt });
    }
  }
  function toggleFlashlight() {
    sound.playClickSound();
    setState({ s6FlashlightOn: !appState.s6FlashlightOn });
  }

  const options = c.options.map((opt) => {
    let variant = 'mcq';
    if (solved && opt === c.answer) variant = 'correct';
    else if (appState.s4WrongPick === opt) variant = 'wrong';
    return OptionButton({ label: opt, variant, disabled: solved, onClick: () => pick(opt) });
  });

  const roomSrc = solved ? (appState.s6FlashlightOn ? ROOMS.light : ROOMS.dark) : ROOMS.light;
  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: roomSrc, alt: 'Room' }),
    solved
      ? h('img', { className: 'flashlight', src: ROOMS.flashlight, alt: 'Flashlight toggle', onClick: toggleFlashlight })
      : null
  );

  let feedback = null;
  if (solved) feedback = FeedbackBox({ text: c.correctFeedback, correct: true });
  else if (appState.s4WrongPick) feedback = FeedbackBox({ text: c.wrongFeedback });
  const sidePanel = SidePanel({ options, feedback });

  return AppShell({
    title: solved ? c.correctTitle : c.title,
    footerText: solved ? c.correctInstruction : c.instruction,
    body,
    sidePanel,
    nextProps: solved ? { pulse: true, onClick: () => { sound.playClickSound(); goTo(7); } } : null,
  });
}

/* ---------------- Screen 7: Brightness Exploration ---------------- */
function buildScreen7() {
  const c = ct('screens.7');
  const trackHeight = 320;
  function onPointerDown(e) {
    e.preventDefault();
    const track = document.getElementById('brightness-track');
    if (!track) return;
    // Cache the rect once: renderApp() replaces the DOM on every setState,
    // so re-querying the (now-detached) `track` node mid-drag would return a zeroed rect.
    const rect = track.getBoundingClientRect();
    function move(ev) {
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      let ratio = (clientY - rect.top) / rect.height;
      ratio = Math.max(0, Math.min(1, ratio));
      setState({ s7Brightness: 1 - ratio }); // top = bright, bottom = dark
    }
    function up() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  }
  const overlayOpacity = brightnessToOverlayOpacity(appState.s7Brightness);
  const handleTop = (1 - appState.s7Brightness) * trackHeight;
  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.light, alt: 'Room' }),
    h('div', { className: 'brightness-overlay', style: { opacity: overlayOpacity } })
  );
  const sidePanel = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', paddingTop: '40px' } },
    h(
      'div',
      { id: 'brightness-track', className: 'brightness-slider-track', style: { height: trackHeight + 'px' } },
      h('div', {
        className: 'brightness-slider-handle',
        style: { top: handleTop + 'px' },
        onMouseDown: onPointerDown,
        onTouchStart: onPointerDown,
      })
    )
  );
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    sidePanel,
    nextProps: { pulse: true, onClick: goNext },
  });
}

/* ---------------- Screens 8-9: Luminous vs Non-luminous ---------------- */
function allSortObjects() {
  return [
    ...LIGHT_CONFIG.luminous.map((o) => Object.assign({}, o, { correctBasket: 'produces' })),
    ...LIGHT_CONFIG.nonLuminous.map((o) => Object.assign({}, o, { correctBasket: 'noproduce' })),
  ];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// Pick a random slot inside a basket-sized box that doesn't overlap slots already taken.
function randomNonOverlappingSlot(taken, boxW, boxH, itemSize) {
  const maxX = Math.max(0, boxW - itemSize);
  const maxY = Math.max(0, boxH - itemSize);
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    const overlaps = taken.some((s) => Math.abs(s.x - x) < itemSize * 0.85 && Math.abs(s.y - y) < itemSize * 0.85);
    if (!overlaps) return { x, y };
  }
  return { x: Math.random() * maxX, y: Math.random() * maxY };
}

function buildScreen8() {
  const c = ct('screens.8');
  const allObjects = allSortObjects();
  if (!appState.s8TrayOrder) {
    appState.s8TrayOrder = shuffle(allObjects.map((o) => o.id));
  }
  const orderIndex = {};
  appState.s8TrayOrder.forEach((id, i) => { orderIndex[id] = i; });
  const objects = allObjects.slice().sort((a, b) => orderIndex[a.id] - orderIndex[b.id]);
  const unplaced = objects.filter((o) => !appState.s8Placed[o.id]);

  function tapObject(obj) {
    sound.playClickSound();
    setState({ s8LastTapped: obj.id });
    schedule(() => setState({ s8LastTapped: null }), 1200);
  }

  function attachDrag(el, obj) {
    function onDown(e) {
      e.preventDefault();
      const wrapper = document.querySelector('.responsive-wrapper');
      const startPos = e.touches ? e.touches[0] : e;
      const ghost = document.createElement('img');
      ghost.src = obj.src;
      ghost.className = 'drag-ghost';
      document.body.appendChild(ghost);
      function place(clientX, clientY) {
        ghost.style.left = clientX - 55 + 'px';
        ghost.style.top = clientY - 55 + 'px';
      }
      place(startPos.clientX, startPos.clientY);

      function move(ev) {
        const p = ev.touches ? ev.touches[0] : ev;
        place(p.clientX, p.clientY);
      }
      function up(ev) {
        const p = ev.changedTouches ? ev.changedTouches[0] : ev;
        const produces = document.getElementById('basket-produces');
        const noproduce = document.getElementById('basket-noproduce');
        let landed = null;
        if (produces && pointInRect(p.clientX, p.clientY, produces.getBoundingClientRect())) landed = 'produces';
        else if (noproduce && pointInRect(p.clientX, p.clientY, noproduce.getBoundingClientRect())) landed = 'noproduce';

        document.body.removeChild(ghost);
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', up);

        if (landed && landed === obj.correctBasket) {
          sound.playDropSound();
          const basketEl = landed === 'produces' ? produces : noproduce;
          // offsetWidth/Height are unscaled local CSS pixels — the same space the
          // slot's left/top inline styles are applied in. getBoundingClientRect()
          // returns post --scaleFactor screen pixels and would misplace the chip.
          const basketPadding = 16;
          const itemSize = 140;
          const taken = Object.keys(appState.s8Positions)
            .filter((id) => appState.s8Placed[id] === landed)
            .map((id) => appState.s8Positions[id]);
          const slot = randomNonOverlappingSlot(
            taken,
            basketEl.offsetWidth - basketPadding * 2,
            basketEl.offsetHeight - basketPadding * 2,
            itemSize
          );
          const placed = Object.assign({}, appState.s8Placed, { [obj.id]: landed });
          const positions = Object.assign({}, appState.s8Positions, { [obj.id]: slot });
          setState({ s8Placed: placed, s8Positions: positions });
        } else if (landed) {
          sound.playWrongSound();
          renderApp(); // snap back (no state change = same position)
        }
      }
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', up);
    }
    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown, { passive: false });
  }

  function ObjectChip(obj) {
    const el = h(
      'div',
      { className: 'drag-object', title: obj.label, onClick: () => tapObject(obj) },
      h('img', { src: obj.src, alt: obj.label })
    );
    attachDrag(el, obj);
    return el;
  }

  function LockedChip(o) {
    const slot = appState.s8Positions[o.id] || { x: 0, y: 0 };
    return h(
      'div',
      {
        className: 'drag-object drag-object--locked',
        style: { position: 'absolute', left: slot.x + 'px', top: slot.y + 'px' },
      },
      h('img', { src: o.src, alt: o.label })
    );
  }
  const producesChips = objects.filter((o) => appState.s8Placed[o.id] === 'produces').map(LockedChip);
  const noproduceChips = objects.filter((o) => appState.s8Placed[o.id] === 'noproduce').map(LockedChip);

  const tappedObj = objects.find((o) => o.id === appState.s8LastTapped);
  const tapMsg = tappedObj
    ? tappedObj.correctBasket === 'produces'
      ? c.tapLuminous
      : c.tapNonLuminous
    : null;

  const allSorted = unplaced.length === 0;

  const bottomZone = allSorted
    ? h('div', { className: 'feedback-box feedback-box--correct' }, c.allSorted)
    : h(
        'div',
        { className: 'object-tray' },
        ...unplaced.map(ObjectChip),
        tapMsg ? h('div', { className: 'feedback-box feedback-box--correct', style: { width: '100%' } }, tapMsg) : null
      );

  const body = h(
    'div',
    { className: 'sort-stage' },
    h(
      'div',
      { className: 'sort-stage-top' },
      h(
        'div',
        { className: 'baskets-row' },
        h(
          'div',
          { className: 'basket-column' },
          h('div', { className: 'basket-title' }, c.basketA),
          h('div', { id: 'basket-produces', className: 'basket' }, ...producesChips)
        ),
        h(
          'div',
          { className: 'basket-column' },
          h('div', { className: 'basket-title' }, c.basketB),
          h('div', { id: 'basket-noproduce', className: 'basket' }, ...noproduceChips)
        )
      )
    ),
    h('div', { className: 'sort-stage-bottom' }, bottomZone)
  );

  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    nextProps: allSorted ? { pulse: true, onClick: goNext } : { disabled: true },
  });
}

function buildScreen9() {
  const c = ct('screens.9');
  const luminous = LIGHT_CONFIG.luminous;
  const nonLuminous = LIGHT_CONFIG.nonLuminous;

  // Positions are measured off the real basket DOM, so compute them one frame
  // after first mount (elements don't exist yet on the very first render).
  if (!appState.s9Positioned) {
    schedule(() => {
      const produces = document.getElementById('basket-produces-9');
      const noproduce = document.getElementById('basket-noproduce-9');
      if (!produces || !noproduce) return;
      const basketPadding = 16;
      const itemSize = 140;
      function layout(basketEl, items) {
        // Use unscaled local CSS pixels (offsetWidth/Height), not screen-space
        // getBoundingClientRect(), so slots line up with the applied left/top styles.
        const taken = [];
        const positions = {};
        items.forEach((o) => {
          const slot = randomNonOverlappingSlot(
            taken,
            basketEl.offsetWidth - basketPadding * 2,
            basketEl.offsetHeight - basketPadding * 2,
            itemSize
          );
          taken.push(slot);
          positions[o.id] = slot;
        });
        return positions;
      }
      const positions = Object.assign({}, layout(produces, luminous), layout(noproduce, nonLuminous));
      setState({ s9Positions: positions, s9Positioned: true });
    }, 0);
  }

  function PositionedChip(o) {
    const slot = appState.s9Positions[o.id];
    const style = slot
      ? { position: 'absolute', left: slot.x + 'px', top: slot.y + 'px' }
      : { position: 'absolute', left: 0, top: 0, opacity: 0 };
    return h('div', { className: 'drag-object drag-object--locked', style }, h('img', { src: o.src, alt: o.label }));
  }

  const body = h(
    'div',
    { className: 'sort-stage' },
    h(
      'div',
      { className: 'sort-stage-top' },
      h(
        'div',
        { className: 'baskets-row' },
        h(
          'div',
          { className: 'basket-column' },
          h('div', { className: 'basket-title' }, ct('screens.8.basketA')),
          h('div', { id: 'basket-produces-9', className: 'basket' }, ...luminous.map(PositionedChip))
        ),
        h(
          'div',
          { className: 'basket-column' },
          h('div', { className: 'basket-title' }, ct('screens.8.basketB')),
          h('div', { id: 'basket-noproduce-9', className: 'basket' }, ...nonLuminous.map(PositionedChip))
        )
      )
    ),
    h(
      'div',
      { className: 'sort-stage-bottom', style: { display: 'flex', gap: '24px', width: '100%' } },
      h('div', { className: 'feedback-box feedback-box--correct', style: { flex: 1 } }, c.defLuminous),
      h('div', { className: 'feedback-box', style: { flex: 1, background: '#3f6ac2' } }, c.defNonLuminous)
    )
  );
  return AppShell({
    title: "Some objects produce their own light. Others do not.",
    footerText: c.instruction,
    body,
    nextProps: { pulse: true, onClick: goNext },
  });
}

/* ---------------- Screens 10-18: Beam room ---------------- */
/*
 * Beam scene geometry — ONE coordinate space: percent of the scene box.
 * The flashlight lens sits at LENS; the beam travels straight to the wall
 * plane at WALL_PCT. Shadows form ON THE WALL at beam height, sized by
 * similar triangles: scale = (wall−lens) / (object−lens).
 */
const LENS = { x: 16, y: 55 }; // % of scene: flashlight lens (beam origin)
const WALL_PCT = 92; // % of scene: wall plane the beam/shadow lands on
const BEAM_HALF_LENS = 1.5; // beam cone half-height at the lens, %
const BEAM_HALF_WALL = 9; // beam cone half-height at the wall, %
const OBJ_W = 7; // in-beam material width, %
const OBJ_H = 30; // in-beam material height, %

// Cone half-height at a given x along the beam (linear spread).
function beamHalfAt(x) {
  const t = (x - LENS.x) / (WALL_PCT - LENS.x);
  return BEAM_HALF_LENS + t * (BEAM_HALF_WALL - BEAM_HALF_LENS);
}

function beamConePoints(fromX, toX, dimStart) {
  const h0 = dimStart || beamHalfAt(fromX);
  const h1 = beamHalfAt(toX);
  return (
    fromX + ',' + (LENS.y - h0) + ' ' +
    toX + ',' + (LENS.y - h1) + ' ' +
    toX + ',' + (LENS.y + h1) + ' ' +
    fromX + ',' + (LENS.y + h0)
  );
}

/*
 * BeamScene: the full light overlay.
 *  - angle: degrees; rotates the whole beam around the lens (S11). Straight always.
 *  - obstacleX: % position of a material in the beam, or null.
 *  - passRatio: how much light continues past the obstacle (1 transparent,
 *    ~0.45 translucent, 0 opaque).
 */
function BeamScene({ angle, obstacleX, passRatio }) {
  const endX = obstacleX == null ? WALL_PCT : obstacleX;
  const parts = [
    h('polygon', { points: beamConePoints(LENS.x, endX), fill: 'rgba(255,250,210,0.42)' }),
    h('line', {
      x1: LENS.x, y1: LENS.y, x2: endX, y2: LENS.y,
      stroke: 'rgba(30,30,30,0.75)', 'stroke-width': 2.5,
      'stroke-dasharray': '8,6', 'vector-effect': 'non-scaling-stroke',
    }),
  ];
  if (obstacleX != null && passRatio > 0) {
    parts.push(
      h('polygon', {
        points: beamConePoints(obstacleX, WALL_PCT),
        fill: 'rgba(255,250,210,' + (0.42 * passRatio).toFixed(3) + ')',
      })
    );
    parts.push(
      h('line', {
        x1: obstacleX, y1: LENS.y, x2: WALL_PCT, y2: LENS.y,
        stroke: 'rgba(30,30,30,' + (0.75 * passRatio).toFixed(3) + ')', 'stroke-width': 2.5,
        'stroke-dasharray': '8,6', 'vector-effect': 'non-scaling-stroke',
      })
    );
  }
  return h(
    'div',
    {
      className: 'light-beam-wrap',
      style: angle
        ? { transform: 'rotate(' + angle + 'deg)', transformOrigin: LENS.x + '% ' + LENS.y + '%' }
        : {},
    },
    h('svg', { className: 'light-beam', viewBox: '0 0 100 100', preserveAspectRatio: 'none' }, ...parts)
  );
}

// Shadow silhouette on the wall. Similar triangles: closer object => bigger shadow.
function WallShadow({ objX, opacity }) {
  if (!opacity) return null;
  const scale = (WALL_PCT - LENS.x) / Math.max(6, objX - LENS.x);
  const shW = Math.min(16, OBJ_W * 0.8 * scale);
  const shH = Math.min(62, OBJ_H * scale);
  return h('div', {
    className: 'wall-shadow',
    style: {
      left: WALL_PCT - shW / 2 + '%',
      top: LENS.y - shH / 2 + '%',
      width: shW + '%',
      height: shH + '%',
      opacity: String(opacity),
    },
  });
}

// Material standing in the beam at x (%), vertically centred on the beam axis.
function InBeamMaterial({ x, type, onDragX }) {
  const el = h('div', {
    className: 'material-prop material-prop--inbeam material-prop--' + type + (onDragX ? ' material-prop--draggable' : ''),
    style: { left: x - OBJ_W / 2 + '%', top: LENS.y - OBJ_H / 2 + '%' },
  });
  if (onDragX) attachBeamDrag(el, onDragX);
  return el;
}

function FlashlightProp({ on, onClick, angle, beamPos, source }) {
  const isBulb = source === 'bulb';
  const cls =
    (isBulb ? 'lightsource-bulb' : 'flashlight') +
    (beamPos ? ' flashlight--beam' : '') +
    (on ? '' : ' flashlight--pulse');
  const style = {};
  if (beamPos && angle && !isBulb) {
    style.transform = 'translateY(-50%) rotate(' + angle + 'deg)';
  }
  return h('img', {
    className: cls,
    src: isBulb ? ROOMS.bulb : ROOMS.flashlight,
    alt: isBulb ? 'Bulb' : 'Flashlight',
    onClick,
    style,
  });
}

function PropertyPanel(revealedList) {
  const items = ['p1', 'p2', 'p3'].map((key, i) =>
    PropertyBadge({ text: ct('properties.' + key), revealed: !!revealedList[i] })
  );
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, ...items);
}

/* ---------------- Screen 10: Path of Light ---------------- */
function buildScreen10() {
  const c = ct('screens.10');
  function tap() {
    sound.playClickSound();
    setState({ s10BeamOn: true });
    schedule(() => goNext(), 1100);
  }
  const on = appState.s10BeamOn;
  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.empty, alt: 'Empty room' }),
    on ? BeamScene({ angle: 0, obstacleX: null, passRatio: 1 }) : null,
    FlashlightProp({ on, beamPos: true, onClick: on ? null : tap }),
    on ? null : GestureHint({ extraClass: 'gesture-hint--beamlight' })
  );
  return AppShell({ title: c.title, footerText: c.instruction, body });
}

/* ---------------- Screen 11: Can Light Bend? ---------------- */
// Tapping the flashlight rotates it. The beam follows the rotation but ALWAYS
// stays a straight line — it can never bend around the corner of the room.
const S11_ANGLES = [0, -16, 12];

function buildScreen11() {
  const c = ct('screens.11');
  function rotate() {
    sound.playClickSound();
    const rotations = appState.s11Rotations + 1;
    setState({
      s11Rotations: rotations,
      s11Angle: S11_ANGLES[rotations % S11_ANGLES.length],
      s11Revealed: rotations >= 2 ? true : appState.s11Revealed,
    });
  }
  const angle = appState.s11Angle || 0;
  const body = h(
    'div',
    { className: 'scene', onClick: rotate },
    SceneImage({ src: ROOMS.empty, alt: 'Empty room' }),
    BeamScene({ angle, obstacleX: null, passRatio: 1 }),
    FlashlightProp({ on: true, beamPos: true, angle, onClick: rotate })
  );
  const sidePanel = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    PropertyBadge({ text: ct('properties.p1'), revealed: appState.s11Revealed })
  );
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    sidePanel,
    nextProps: appState.s11Revealed ? { pulse: true, onClick: goNext } : { disabled: true },
  });
}

/* ---------------- Screens 12/14 shared: drop a material into the beam ---------------- */
const MAT_X = 52; // % — default in-beam position for placed materials
// How far along the beam a material can be dragged (% of scene). Nearer the
// light (MIN) makes a bigger wall shadow; nearer the wall (MAX) a smaller one.
const BEAM_MIN_X = 26;
const BEAM_MAX_X = 82;

function attachSimpleDrop(el, onPlaced) {
  function onDown(e) {
    e.preventDefault();
    function up() {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
      onPlaced();
    }
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
  }
  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, { passive: false });
}

// Drag a placed in-beam material left/right along the beam. onMoveX receives the
// clamped x (% of scene). The scene rect is captured once at drag start so the
// percentage math is invariant to --scaleFactor.
function attachBeamDrag(el, onMoveX) {
  function onDown(e) {
    e.preventDefault();
    e.stopPropagation();
    const sceneEl = document.querySelector('.scene');
    if (!sceneEl) return;
    const rect = sceneEl.getBoundingClientRect();
    function move(ev) {
      const p = ev.touches ? ev.touches[0] : ev;
      const pctX = ((p.clientX - rect.left) / rect.width) * 100;
      onMoveX(Math.max(BEAM_MIN_X, Math.min(BEAM_MAX_X, pctX)));
    }
    function up() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  }
  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, { passive: false });
}

/* ---------------- Screen 12: Transparent Material ---------------- */
function buildScreen12() {
  const c = ct('screens.12');
  const placed = appState.s12SheetPlaced;

  const trayEl = h('div', { className: 'material-prop material-prop--transparent' });
  if (!placed) {
    attachSimpleDrop(trayEl, () => {
      if (!appState.s12SheetPlaced) {
        sound.playDropSound();
        setState({ s12SheetPlaced: true });
      }
    });
  }

  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.empty, alt: 'Empty room' }),
    BeamScene({ angle: 0, obstacleX: placed ? MAT_X : null, passRatio: 1 }),
    FlashlightProp({ on: true, beamPos: true }),
    placed ? InBeamMaterial({ x: MAT_X, type: 'transparent' }) : null
  );
  const sidePanel = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    PropertyBadge({ text: ct('properties.p1'), revealed: true }),
    !placed ? h('div', { className: 'material-tray' }, trayEl) : null
  );
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    sidePanel,
    nextProps: placed ? { pulse: true, onClick: goNext } : { disabled: true },
  });
}

/* ---------------- Screen 13: Property Reveal (Transparent) ---------------- */
function buildScreen13() {
  const c = ct('screens.13');
  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.empty, alt: 'Empty room' }),
    BeamScene({ angle: 0, obstacleX: MAT_X, passRatio: 1 }),
    FlashlightProp({ on: true, beamPos: true }),
    InBeamMaterial({ x: MAT_X, type: 'transparent' })
  );
  const sidePanel = PropertyPanel([true, true, false]);
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    sidePanel,
    nextProps: { pulse: true, onClick: goNext },
  });
}

/* ---------------- Screen 14: Opaque Material ---------------- */
// The light source here is a hanging bulb. Once the cardboard is dropped in the
// beam, it can be dragged along the beam and the wall shadow resizes live.
function buildScreen14() {
  const c = ct('screens.14');
  const placed = appState.s14CardboardPlaced;
  const cardX = appState.s14CardboardX;

  const trayEl = h('div', { className: 'material-prop material-prop--opaque' });
  if (!placed) {
    attachSimpleDrop(trayEl, () => {
      if (!appState.s14CardboardPlaced) {
        sound.playDropSound();
        setState({ s14CardboardPlaced: true, s14CardboardX: MAT_X });
      }
    });
  }

  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.empty, alt: 'Empty room' }),
    BeamScene({ angle: 0, obstacleX: placed ? cardX : null, passRatio: 0 }),
    placed ? WallShadow({ objX: cardX, opacity: 0.55 }) : null,
    FlashlightProp({ on: true, beamPos: true, source: 'bulb' }),
    placed
      ? InBeamMaterial({ x: cardX, type: 'opaque', onDragX: (nx) => setState({ s14CardboardX: nx }) })
      : null
  );
  const sidePanel = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    PropertyPanel([true, true, false]),
    !placed ? h('div', { className: 'material-tray' }, trayEl) : null
  );
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    sidePanel,
    nextProps: placed ? { pulse: true, onClick: goNext } : { disabled: true },
  });
}

/* ---------------- Screen 15: Shadow Formation ---------------- */
// Drag the cardboard along the beam. Closer to the light => bigger wall shadow
// (similar triangles), farther => smaller. Shadow always forms ON the wall.
function buildScreen15() {
  const c = ct('screens.15');
  const cardX = appState.s14CardboardX;

  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.empty, alt: 'Empty room' }),
    BeamScene({ angle: 0, obstacleX: cardX, passRatio: 0 }),
    WallShadow({ objX: cardX, opacity: 0.55 }),
    FlashlightProp({ on: true, beamPos: true, source: 'bulb' }),
    InBeamMaterial({ x: cardX, type: 'opaque', onDragX: (nx) => setState({ s14CardboardX: nx }) })
  );
  const sidePanel = PropertyPanel([true, true, true]);
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    sidePanel,
    nextProps: { pulse: true, onClick: goNext },
  });
}

/* ---------------- Screen 16: Review ---------------- */
function buildScreen16() {
  const c = ct('screens.16');
  function MiniRoom(kind) {
    const hasObstacle = kind === 'transparent' || kind === 'opaque';
    const passRatio = kind === 'transparent' ? 1 : 0;
    return h(
      'div',
      { className: 'review-thumb' },
      SceneImage({ src: ROOMS.empty, alt: 'Room' }),
      BeamScene({ angle: 0, obstacleX: hasObstacle ? MAT_X : null, passRatio }),
      kind === 'opaque' ? WallShadow({ objX: MAT_X, opacity: 0.55 }) : null,
      hasObstacle ? InBeamMaterial({ x: MAT_X, type: kind }) : null
    );
  }
  const body = h(
    'div',
    { className: 'review-row' },
    h('div', { className: 'review-card' }, MiniRoom('straight'), PropertyBadge({ text: ct('properties.p1'), revealed: true })),
    h('div', { className: 'review-card' }, MiniRoom('transparent'), PropertyBadge({ text: ct('properties.p2'), revealed: true })),
    h('div', { className: 'review-card' }, MiniRoom('opaque'), PropertyBadge({ text: ct('properties.p3'), revealed: true }))
  );
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    nextProps: { pulse: true, onClick: goNext },
  });
}

/* ---------------- Screen 17: Compare Materials ---------------- */
function buildScreen17() {
  const c = ct('screens.17');
  const materials = LIGHT_CONFIG.materials;

  function place(mat) {
    sound.playDropSound();
    const placed = Object.assign({}, appState.s17Placed, { [mat.id]: true });
    setState({ s17Placed: placed, s17Current: mat.id });
  }

  const tray = materials
    .filter((m) => !appState.s17Placed[m.id])
    .map((m) => {
      const el = h('div', { className: 'material-prop material-prop--' + m.type, title: m.label });
      attachSimpleDrop(el, () => place(m));
      return el;
    });

  // Show the most recently placed material in the beam so each drop is observable.
  const current = materials.find((m) => m.id === appState.s17Current) || null;
  const shadowOpacity = current ? (1 - current.pass) * 0.55 : 0;
  const allPlaced = materials.every((m) => appState.s17Placed[m.id]);

  const body = h(
    'div',
    { className: 'scene' },
    SceneImage({ src: ROOMS.empty, alt: 'Empty room' }),
    BeamScene({ angle: 0, obstacleX: current ? MAT_X : null, passRatio: current ? current.pass : 1 }),
    current ? WallShadow({ objX: MAT_X, opacity: shadowOpacity }) : null,
    FlashlightProp({ on: true, beamPos: true }),
    current ? InBeamMaterial({ x: MAT_X, type: current.type }) : null
  );
  const sidePanel = h('div', { className: 'material-tray' }, ...tray);
  return AppShell({
    title: c.title,
    footerText: c.instruction,
    body,
    sidePanel,
    nextProps: allPlaced ? { pulse: true, onClick: goNext } : { disabled: true },
  });
}

/* ---------------- Screen 18: Final Concept ---------------- */
function buildScreen18() {
  const c = ct('screens.18');
  const body = h(
    'div',
    { className: 'review-row' },
    h(
      'div',
      { className: 'review-card' },
      h('div', { className: 'review-thumb', style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h('div', { className: 'material-prop material-prop--transparent', style: { position: 'static' } })),
      PropertyBadge({ text: c.classGlass, revealed: true })
    ),
    h(
      'div',
      { className: 'review-card' },
      h('div', { className: 'review-thumb', style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h('div', { className: 'material-prop material-prop--translucent', style: { position: 'static' } })),
      PropertyBadge({ text: c.classPaper, revealed: true })
    ),
    h(
      'div',
      { className: 'review-card' },
      h('div', { className: 'review-thumb', style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h('div', { className: 'material-prop material-prop--opaque', style: { position: 'static' } })),
      PropertyBadge({ text: c.classWood, revealed: true })
    )
  );
  return AppShell({ title: c.title, footerText: c.instruction, body });
}

/* ---------------- Screen switch ---------------- */
const SCREEN_BUILDERS = {
  1: buildScreen1,
  2: buildScreen2,
  3: buildScreen3,
  4: buildScreen4,
  7: buildScreen7,
  8: buildScreen8,
  9: buildScreen9,
  10: buildScreen10,
  11: buildScreen11,
  12: buildScreen12,
  13: buildScreen13,
  14: buildScreen14,
  15: buildScreen15,
  16: buildScreen16,
  17: buildScreen17,
  18: buildScreen18,
};

function App() {
  const builder = SCREEN_BUILDERS[appState.screen] || buildScreen18;
  return builder();
}

function renderApp() {
  const root = document.getElementById('app');
  root.innerHTML = '';
  const tree = App();
  if (tree) root.appendChild(tree);
}

function initializeApp() {
  renderApp();
}

window.initializeApp = initializeApp;
