// Modifiers applet — state machine and screen builders.
// Reuses the globals declared by components.js / modifierLesson.js / mini-react.js
// directly (h, AppShell, ...) — these are plain <script> globals, not modules,
// so redeclaring them here would collide.

/* eslint-disable no-undef */

const L = window.modifierLesson;
const CFG = window.MODIFIER_CONFIG;
const t = window.utils.getText;

function ct(path, params) { return t('content-ui.' + path, params); }

// ---------- state ----------

let appState = {
  screen: 1,

  // Screens 1-3: which entry of CFG.onlyPositions is showing, and which the
  // learner has visited (Continue unlocks once all three meanings are seen).
  onlyIndex: 0,
  onlySeen: [0],

  // Screen 5-8: which type example is open, and which have been visited.
  s5Type: null,
  s5Visited: [],

  // Screens 10-16 question engine.
  qIndex: 0,
  qPhase: 'tap',        // 'tap' | 'drag' | 'wrongDrop' | 'correct'
  qWrongType: null,     // which target the chip was wrongly dropped on
  qWrongWord: null,     // token index of a wrong tap
  teeterNonce: 0,       // bump to replay the one-shot shake
  qMaxReached: 0,       // highest question index shown, for the skip rule

  // Screen 9: which definitions have been revealed, and how much of the
  // in-progress typewriter reveal is showing (chars typed so far).
  s9Revealed: {},      // type -> full text, once fully typed
  s9Typing: null,      // type currently mid-reveal, or null
  s9TypedChars: 0,

  // Screens 17-21.
  buildSelected: [],
};

function setState(patch) {
  Object.assign(appState, patch);
  renderApp();
}

// ---------- scheduled timers ----------

let scheduledTimers = [];

function schedule(fn, ms) {
  const id = setTimeout(function () {
    scheduledTimers = scheduledTimers.filter(function (t2) { return t2 !== id; });
    fn();
  }, ms);
  scheduledTimers.push(id);
  return id;
}

function clearScheduled() {
  scheduledTimers.forEach(clearTimeout);
  scheduledTimers = [];
  clearTypewriter();
}

// ---------- typewriter (screen 9) ----------

// A ticking interval, separate from the one-shot `schedule` timers above,
// since a typewriter reveal needs many small steps rather than a single delay.
let typewriterInterval = null;

function clearTypewriter() {
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }
}

function startTypewriter(type, text) {
  clearTypewriter();
  window.sound.playClickSound();
  appState.s9Typing = type;
  appState.s9TypedChars = 0;
  renderApp();

  typewriterInterval = setInterval(function () {
    appState.s9TypedChars += 1;
    if (appState.s9TypedChars >= text.length) {
      clearTypewriter();
      const revealed = Object.assign({}, appState.s9Revealed);
      revealed[type] = text;
      setState({ s9Revealed: revealed, s9Typing: null, s9TypedChars: 0 });
      return;
    }
    renderApp();
  }, 22);
}

function goNext() {
  clearScheduled();
  window.sound.playClickSound();
  setState({ screen: appState.screen + 1 });
}

function goTo(screenNum, patch) {
  clearScheduled();
  setState(Object.assign({ screen: screenNum }, patch || {}));
}

// ---------- drag helper ----------

// Ghost drag with hit-testing against named drop targets.
//
// The ghost is appended inside .responsive-wrapper and positioned with LOCAL
// (1920x1080-space) coordinates, the same way 2.comparing Decimals does it
// (js/app.js's dragGhostPos + screenToLocal). Because it is a descendant of
// the scaled wrapper, the wrapper's scale(--scaleFactor) transform applies to
// it automatically — so the ghost is always the same visual size as the chip
// it came from, at any window size. A position:fixed ghost positioned with
// raw clientX/Y (the previous approach here) sits OUTSIDE that transform and
// renders at the wrong size on any zoom other than 100%.
//
// The target rects are read once on pointer-down: renderApp() replaces the DOM
// on every setState, so re-querying mid-drag would hit detached nodes.
function attachChipDrag(el, opts) {
  function onDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const wrapper = document.querySelector('.responsive-wrapper');

    const targets = opts.targetIds
      .map(function (id) {
        const node = document.getElementById(id);
        return node ? { id: id, rect: node.getBoundingClientRect() } : null;
      })
      .filter(Boolean);

    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = opts.label;
    wrapper.appendChild(ghost);
    el.classList.add('chip--dragging');

    function place(clientX, clientY) {
      const local = L.screenToLocal(clientX, clientY, wrapper);
      ghost.style.left = local.x + 'px';
      ghost.style.top = local.y + 'px';
    }

    // On touchend `ev.touches` is an empty (but truthy) list — the coordinates
    // live in changedTouches. Check length, not just presence.
    function readPoint(ev) {
      let p = ev;
      if (ev.touches && ev.touches.length) p = ev.touches[0];
      else if (ev.changedTouches && ev.changedTouches.length) p = ev.changedTouches[0];
      return { x: p.clientX, y: p.clientY };
    }

    const start = readPoint(e);
    place(start.x, start.y);

    function move(ev) {
      ev.preventDefault();
      const p = readPoint(ev);
      place(p.x, p.y);
    }

    function up(ev) {
      const p = readPoint(ev);
      let landed = null;
      for (let i = 0; i < targets.length; i += 1) {
        if (L.pointInRect(p.x, p.y, targets[i].rect)) { landed = targets[i].id; break; }
      }

      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      el.classList.remove('chip--dragging');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);

      opts.onDrop(landed, p);
    }

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  }

  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, { passive: false });
}

// Runs after render so drag handlers bind to the freshly created nodes.
let pendingBindings = [];
function bindAfterRender(fn) { pendingBindings.push(fn); }

// ---------- screens 1-3: drag "only" ----------

function buildOnlyScreen() {
  const pos = CFG.onlyPositions[appState.onlyIndex];
  const allSeen = appState.onlySeen.length === CFG.onlyPositions.length;

  // The sentence is rebuilt around the three possible chip positions. Empty
  // positions render as inline drop slots so the learner discovers each
  // meaning by dragging, rather than reading the answers off preview cards.
  // The sentence holds only real words plus the chip — no placeholder boxes.
  // Words simply reflow as the chip moves between them. Each word carries a
  // marker id so the drop handler can work out which gap the chip landed in.
  const SENTENCE_WORDS = ['Sarah', 'approved', 'the proposal.'];

  // Build the display order first, then apply sentence case across it, so
  // whichever segment now starts the sentence is capitalised and the one that
  // stopped being first drops back to lower case. Without this the chip stays
  // "Only" everywhere, reading "Sarah Only approved the proposal."
  // ("Sarah" is a proper noun, so applySentenceCase leaves it capitalised.)
  const segments = [];
  for (let i = 0; i <= SENTENCE_WORDS.length; i += 1) {
    if (i === pos.slot) segments.push({ text: 'only', isModifier: true });
    if (i < SENTENCE_WORDS.length) {
      segments.push({ text: SENTENCE_WORDS[i], isModifier: false, wordIndex: i });
    }
  }
  const cased = L.applySentenceCase(segments);

  const parts = [];
  cased.forEach(function (seg) {
    if (seg.isModifier) {
      parts.push(Chip({ label: seg.text, id: 'only-chip' }));
    } else {
      parts.push(h('span', { className: 'only-word', id: 'only-word-' + seg.wordIndex }, seg.text));
    }
  });

  const sentence = h('div', { className: 'sentence-box', id: 'only-sentence' }, ...parts);

  // Show the drag hint only until the learner has actually dragged once —
  // after that they know the gesture, and the hint would just clutter a
  // screen whose whole point is repeated dragging.
  const showDragHint = appState.onlySeen.length <= 1;
  const hint = showDragHint
    ? h('div', { className: 'only-hint-anchor', id: 'only-hint-anchor' },
        GestureHint({ kind: 'drag', extraClass: 'gesture-hint--chip' }))
    : null;

  bindAfterRender(function () {
    if (showDragHint) positionOnlyHint();
    const chip = document.getElementById('only-chip');
    if (!chip) return;

    // Anchor the bubble under the chip rather than under the sentence, so the
    // explanation always points at the word "only" is currently modifying.
    // Runs twice: once now, then again after layout so the measurement uses
    // this position's bubble width rather than the previous render's.
    positionOnlyBubble();
    requestAnimationFrame(positionOnlyBubble);

    attachChipDrag(chip, {
      // Drop anywhere on the sentence; the nearest word gap wins.
      targetIds: ['only-sentence'],
      // The ghost mirrors the chip, so it must use the cased label too.
      label: chip.textContent,
      onDrop: function (landed, point) {
        if (!landed) return;
        const slot = nearestOnlySlot(point.x, SENTENCE_WORDS.length);
        let idx = -1;
        CFG.onlyPositions.forEach(function (p, i) { if (p.slot === slot) idx = i; });
        // Only three of the four gaps carry a meaning; ignore the rest.
        if (idx === -1 || idx === appState.onlyIndex) return;
        window.sound.playDropSound();
        setState({
          onlyIndex: idx,
          onlySeen: appState.onlySeen.indexOf(idx) === -1
            ? appState.onlySeen.concat([idx])
            : appState.onlySeen,
        });
      },
    });
  });

  const body = h(
    'div',
    { className: 'only-stage' },
    h('div', { className: 'instruction' }, instructionWithBold('Drag only to different positions.', 'only')),
    h(
      'div',
      { className: 'only-sentence-group', style: { position: 'relative' } },
      sentence,
      hint,
      Bubble({ text: pos.tip, id: 'only-bubble', anchored: true })
    )
  );

  return AppShell({
    title: ct('screens.1.title'),
    body: body,
    continueProps: allSeen ? { onClick: function () { goTo(4); }, pulse: true } : null,
  });
}

// Centre the screen-1 bubble under the "Only" chip and point its tail at the
// chip's centre. Measured in unscaled local px: offsetWidth/offsetLeft are
// pre-scale, getBoundingClientRect is post-scale, so the two must not be mixed.
function positionOnlyBubble() {
  const chip = document.getElementById('only-chip');
  const bubble = document.getElementById('only-bubble');
  const sentenceEl = document.getElementById('only-sentence');
  if (!chip || !bubble || !sentenceEl) return;

  const sentRect = sentenceEl.getBoundingClientRect();
  if (!sentRect.width) return;
  const scale = sentRect.width / sentenceEl.offsetWidth;
  const chipRect = chip.getBoundingClientRect();

  const chipCentre = (chipRect.left + chipRect.width / 2 - sentRect.left) / scale;
  const bubbleW = bubble.offsetWidth;

  // Centre on the chip, then clamp so the bubble stays within the sentence.
  const maxLeft = sentenceEl.offsetWidth - bubbleW;
  const left = Math.max(0, Math.min(chipCentre - bubbleW / 2, maxLeft));
  bubble.style.marginLeft = left + 'px';

  // Point the tail at the chip relative to where the bubble ACTUALLY ended up,
  // so it stays on the chip even when the clamp above shifts the bubble.
  bubble.style.setProperty('--tail-x', (chipCentre - left) + 'px');
}

// Position the drag-hint finger over the "Only" chip. Same local-px rule as
// positionOnlyBubble: measured against the sentence group (the hint's
// positioned parent), not the sentence box itself, since the hint sits
// outside the sentence box in the DOM.
function positionOnlyHint() {
  const chip = document.getElementById('only-chip');
  const anchor = document.getElementById('only-hint-anchor');
  const group = anchor ? anchor.parentElement : null;
  if (!chip || !anchor || !group) return;

  const groupRect = group.getBoundingClientRect();
  if (!groupRect.width) return;
  const scale = groupRect.width / group.offsetWidth;
  const chipRect = chip.getBoundingClientRect();

  // Sit just to the right of the chip, vertically centred on it — clear of
  // both the chip itself and the meaning bubble beneath the sentence.
  const chipRightX = (chipRect.right - groupRect.left) / scale;
  const chipCentreY = (chipRect.top + chipRect.height / 2 - groupRect.top) / scale;

  anchor.style.left = chipRightX + 'px';
  anchor.style.top = chipCentreY + 'px';
}

// Animate the tap-hint finger from the lifted modifier chip straight DOWN
// onto the correct drop target, so it reads as "drag this down into the box
// below" rather than a sideways swipe. Path is expressed as CSS custom
// properties (--start-x/y, --end-x/y) consumed by the qHintDrag keyframes,
// all measured in unscaled local px against #q-body (their shared ancestor).
function positionQHint() {
  const chip = document.getElementById('q-chip');
  const anchor = document.getElementById('q-hint-anchor');
  const body = document.getElementById('q-body');
  const target = document.getElementById('target-' + (CFG.questionBank[appState.qIndex] || {}).type);
  if (!chip || !anchor || !body || !target) return;

  const bodyRect = body.getBoundingClientRect();
  if (!bodyRect.width) return;
  const scale = bodyRect.width / body.offsetWidth;

  const chipRect = chip.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const startX = (chipRect.left + chipRect.width / 2 - bodyRect.left) / scale;
  const startY = (chipRect.top + chipRect.height / 2 - bodyRect.top) / scale;
  const endX = (targetRect.left + targetRect.width / 2 - bodyRect.left) / scale;
  const endY = (targetRect.top + targetRect.height / 2 - bodyRect.top) / scale;

  anchor.style.setProperty('--start-x', startX + 'px');
  anchor.style.setProperty('--start-y', startY + 'px');
  anchor.style.setProperty('--end-x', endX + 'px');
  anchor.style.setProperty('--end-y', endY + 'px');
  anchor.style.left = startX + 'px';
  anchor.style.top = startY + 'px';
}

// Centre the question-engine feedback bubble under whichever target box the
// chip actually landed on (Word/Phrase/Clause), rather than under the whole
// row — same local-px measurement rule as positionOnlyBubble.
function positionQBubble(targetId) {
  const target = document.getElementById(targetId);
  const bubble = document.getElementById('q-bubble');
  const group = document.getElementById('targets-group');
  if (!target || !bubble || !group) return;

  const groupRect = group.getBoundingClientRect();
  if (!groupRect.width) return;
  const scale = groupRect.width / group.offsetWidth;
  const paddingLeft = parseFloat(getComputedStyle(group).paddingLeft) || 0;
  const paddingRight = parseFloat(getComputedStyle(group).paddingRight) || 0;
  const contentWidth = group.offsetWidth - paddingLeft - paddingRight;

  const targetRect = target.getBoundingClientRect();
  const targetCentre = (targetRect.left + targetRect.width / 2 - groupRect.left) / scale - paddingLeft;
  const bubbleW = bubble.offsetWidth;

  const maxLeft = contentWidth - bubbleW;
  const left = Math.max(0, Math.min(targetCentre - bubbleW / 2, maxLeft));
  bubble.style.marginLeft = left + 'px';
  bubble.style.setProperty('--tail-x', (targetCentre - left) + 'px');
}

// Centre the arrow and "Modifiers" tag under the boxed word on screens 6-8.
// Measured in unscaled local px, same rule as positionOnlyBubble: offsetWidth
// is pre-scale, getBoundingClientRect is post-scale — never mix them.
function centerUnderExampleMod() {
  const mod = document.getElementById('example-mod');
  const arrow = document.getElementById('example-arrow');
  const tag = document.getElementById('example-tag');
  const panel = document.getElementById('s5-panel');
  if (!mod || !arrow || !tag || !panel) return;

  const panelRect = panel.getBoundingClientRect();
  if (!panelRect.width) return;
  const scale = panelRect.width / panel.offsetWidth;
  const modRect = mod.getBoundingClientRect();

  // A flex child's margin-left is relative to the panel's CONTENT box, but
  // getBoundingClientRect().left is the panel's BORDER box — offset by the
  // left padding, or the arrow/tag land ~48px right of the boxed word.
  const paddingLeft = parseFloat(getComputedStyle(panel).paddingLeft) || 0;
  const contentWidth = panel.offsetWidth - paddingLeft - (parseFloat(getComputedStyle(panel).paddingRight) || 0);
  const modCentre = (modRect.left + modRect.width / 2 - panelRect.left) / scale - paddingLeft;

  [arrow, tag].forEach(function (el) {
    const w = el.offsetWidth;
    const maxLeft = contentWidth - w;
    const left = Math.max(0, Math.min(modCentre - w / 2, maxLeft));
    el.style.marginLeft = left + 'px';
  });
}

// Which gap between words is nearest to a drop point?
// Gap i sits before word i, so gap 0 = before "Sarah", 1 = after "Sarah", etc.
// Boundaries are read live from the DOM, so this stays correct as words reflow.
function nearestOnlySlot(clientX, wordCount) {
  const boundaries = [];
  for (let i = 0; i < wordCount; i += 1) {
    const el = document.getElementById('only-word-' + i);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    boundaries.push({ slot: i, x: r.left });
    if (i === wordCount - 1) boundaries.push({ slot: i + 1, x: r.right });
  }
  if (!boundaries.length) return -1;

  let best = boundaries[0];
  boundaries.forEach(function (b) {
    if (Math.abs(clientX - b.x) < Math.abs(clientX - best.x)) best = b;
  });
  return best.slot;
}

// Renders an instruction with one word bolded, without innerHTML.
function instructionWithBold(text, boldWord) {
  const idx = text.indexOf(boldWord);
  if (idx === -1) return h('span', {}, text);
  return h(
    'span',
    {},
    text.slice(0, idx),
    h('strong', {}, boldWord),
    text.slice(idx + boldWord.length)
  );
}

// ---------- screen 4 ----------

function buildScreen4() {
  // Rebuilt from each variant's slot (rather than its pre-split before/after
  // strings) so the three sentences get the same sentence-case treatment as
  // screen 1 — the chip is capitalised only when it starts the sentence.
  const SENTENCE_WORDS = ['Sarah', 'approved', 'the proposal.'];

  const variants = CFG.onlyPositions.map(function (p) {
    const segments = [];
    for (let i = 0; i <= SENTENCE_WORDS.length; i += 1) {
      if (i === p.slot) segments.push({ text: 'only', isModifier: true });
      if (i < SENTENCE_WORDS.length) {
        segments.push({ text: SENTENCE_WORDS[i], isModifier: false });
      }
    }
    const parts = L.applySentenceCase(segments).map(function (seg) {
      return seg.isModifier ? Chip({ label: seg.text }) : h('span', {}, seg.text);
    });
    return h('div', { className: 's4-variant' }, ...parts);
  });

  const panel = h(
    'div',
    { className: 's4-panel' },
    h('div', {}, ct('screens.4.panel')),
    h('div', { style: { marginTop: '22px' } },
      'Words like this have a name called ',
      h('strong', {}, 'MODIFIERS'))
  );

  const body = h(
    'div',
    { className: 's4-body' },
    h('div', { className: 's4-list' }, ...variants),
    panel
  );

  return AppShell({
    title: ct('screens.4.title'),
    body: body,
    continueProps: { onClick: function () { goTo(5); }, pulse: true },
  });
}

// ---------- screens 5-8: definition + type examples ----------

function buildTypeScreen() {
  const labels = ct('screens.5.options');
  const types = ['word', 'phrase', 'clause'];
  const active = appState.s5Type;

  const buttons = types.map(function (type, i) {
    return TypeButton({
      label: labels[i],
      active: active === type,
      visited: appState.s5Visited.indexOf(type) !== -1 && active !== type,
      // Glow every untried button before the learner has tapped any of them —
      // all three are valid next taps, so nothing should single one out.
      glow: !active && appState.s5Visited.length === 0,
      onClick: function () {
        window.sound.playClickSound();
        const visited = appState.s5Visited.indexOf(type) === -1
          ? appState.s5Visited.concat([type])
          : appState.s5Visited;
        const example = CFG.typeExamples.filter(function (e) { return e.type === type; })[0];
        setState({ s5Type: type, s5Visited: visited, screen: example.screen });
      },
    });
  });

  let panel;
  let tells = null;

  if (!active) {
    panel = h(
      'div',
      { className: 's5-panel' },
      h('div', {}, ct('screens.5.describingLabel')),
      h('div', {}, ct('screens.5.describing'))
    );
  } else {
    const ex = CFG.typeExamples.filter(function (e) { return e.type === active; })[0];
    panel = h(
      'div',
      { className: 's5-panel', id: 's5-panel' },
      h(
        'div',
        { className: 'example-sentence' },
        ex.before ? h('span', {}, ex.before) : null,
        h('span', { className: 'example-mod', id: 'example-mod' }, ex.mod),
        ex.after ? h('span', {}, ex.after) : null
      ),
      h('div', { className: 'example-arrow', id: 'example-arrow' }, '↓'),
      h('div', { className: 'example-tag', id: 'example-tag' }, 'Modifiers')
    );
    tells = h('div', { className: 'tells-bar' }, ex.tells);

    // Centre the arrow and "Modifiers" tag under the boxed word rather than
    // under the whole panel, so they track wherever the box actually sits on
    // the line (it can wrap, and its width varies per example).
    bindAfterRender(function () {
      requestAnimationFrame(centerUnderExampleMod);
    });
  }

  // Always render the slot, so its reserved height never appears/disappears —
  // only the tells-bar inside it comes and goes.
  const tellsSlot = h('div', { className: 'tells-bar-slot' }, tells);

  const body = h(
    'div',
    { style: { flex: '1', display: 'flex', flexDirection: 'column' } },
    h('div', { className: 'instruction' },
      active ? instructionWithBold(ct('screens.6.instruction'), 'three') : ct('screens.5.instruction')),
    h('div', { className: 's5-body' }, h('div', { className: 's5-options' }, ...buttons), panel),
    tellsSlot
  );

  // Continue appears once all three examples have been seen (PDF page 8).
  const allSeen = appState.s5Visited.length === 3;

  return AppShell({
    title: ct('screens.5.title'),
    chipTitle: true,
    body: body,
    continueProps: allSeen ? { onClick: function () { goTo(9); }, pulse: true } : null,
  });
}

// ---------- screen 9: summary ----------

function buildScreen9() {
  const cards = ct('screens.9.cards');

  const band = h(
    'div',
    { className: 's9-band' },
    'A ',
    h('span', { className: 'kw' }, 'modifier'),
    ' is a ',
    h('strong', {}, 'word'),
    ', ',
    h('strong', {}, 'phrase'),
    ', or ',
    h('strong', {}, 'clause'),
    ' that gives more information about another word.'
  );

  const branches = cards.map(function (card, i) {
    const type = card.label.toLowerCase();
    const revealedText = appState.s9Revealed[type];
    const isTyping = appState.s9Typing === type;

    let descText = '';
    if (revealedText) descText = revealedText;
    else if (isTyping) descText = card.text.slice(0, appState.s9TypedChars);

    const done = !!revealedText;
    const blocked = !done && !isTyping && !!appState.s9Typing;
    let nodeCls = 's9-node';
    if (done) nodeCls += ' s9-node--done';
    else if (blocked) nodeCls += ' s9-node--blocked';
    // Glow all three before any has been tapped — they're three independent
    // reveals, not a single correct target, so no one finger should point.
    else if (!appState.s9Typing && Object.keys(appState.s9Revealed).length === 0) {
      nodeCls += ' glow-target';
    }

    return h(
      'div',
      { className: 's9-branch', id: 's9-branch-' + i },
      h('span', { className: 's9-connector-stub' }),
      h(
        'button',
        {
          className: nodeCls,
          type: 'button',
          onClick: function () {
            // Block starting a new reveal while ANY node is mid-typewriter —
            // not just this one — so switching nodes can't cancel an
            // in-progress reveal before it commits to s9Revealed.
            if (done || appState.s9Typing) return;
            startTypewriter(type, card.text);
          },
        },
        card.label
      ),
      h('span', { className: 's9-connector s9-connector--dark' }, '→'),
      h(
        'div',
        { className: 's9-desc' },
        descText,
        // Blinking cursor while typing, so the reveal reads as "in progress".
        isTyping ? h('span', { className: 's9-caret' }, '') : null
      )
    );
  });

  const allRevealed = cards.every(function (card) {
    return !!appState.s9Revealed[card.label.toLowerCase()];
  });

  const body = h(
    'div',
    { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '30px' } },
    band,
    h(
      'div',
      { className: 's9-tree' },
      h('div', { className: 's9-root', id: 's9-root' }, 'Modifiers'),
      // The connecting line is drawn by JS (positionS9Connector) so it can
      // span exactly from the root to each branch's stub, at any zoom.
      h('div', { className: 's9-connector-line', id: 's9-connector-line' }),
      h('div', { className: 's9-branches', id: 's9-branches' }, ...branches)
    )
  );

  bindAfterRender(function () {
    requestAnimationFrame(positionS9Connector);
  });

  return AppShell({
    title: ct('screens.9.title'),
    chipTitle: true,
    body: body,
    continueProps: allRevealed ? { onClick: function () { goTo(10); }, pulse: true } : null,
  });
}

// Draws the vertical line connecting "Modifiers" to the three branch nodes,
// plus each branch's short horizontal stub — replacing the old per-branch
// orange arrow with one continuous tree connector.
function positionS9Connector() {
  const root = document.getElementById('s9-root');
  const line = document.getElementById('s9-connector-line');
  const branches = document.getElementById('s9-branches');
  if (!root || !line || !branches) return;

  const branchEls = [0, 1, 2].map(function (i) { return document.getElementById('s9-branch-' + i); });
  if (branchEls.some(function (el) { return !el; })) return;

  const container = branches.parentElement; // .s9-tree
  const containerRect = container.getBoundingClientRect();
  if (!containerRect.width) return;
  const scale = containerRect.width / container.offsetWidth;

  const rootRect = root.getBoundingClientRect();
  const rootCentreY = (rootRect.top + rootRect.height / 2 - containerRect.top) / scale;

  const firstStub = branchEls[0].querySelector('.s9-connector-stub');
  const stubX = (firstStub.getBoundingClientRect().left - containerRect.left) / scale;

  const firstBranchRect = branchEls[0].getBoundingClientRect();
  const firstCentreY = (firstBranchRect.top + firstBranchRect.height / 2 - containerRect.top) / scale;
  const lastBranchRect = branchEls[branchEls.length - 1].getBoundingClientRect();
  const lastCentreY = (lastBranchRect.top + lastBranchRect.height / 2 - containerRect.top) / scale;

  const top = Math.min(rootCentreY, firstCentreY);
  const bottom = Math.max(rootCentreY, lastCentreY);

  line.style.left = stubX + 'px';
  line.style.top = top + 'px';
  line.style.height = (bottom - top) + 'px';
}

// ---------- screens 10-16: question engine ----------

function buildQuestionScreen() {
  const q = CFG.questionBank[appState.qIndex];
  const tokens = L.tokenize(q.sentence);
  const span = L.locateModifier(q.sentence, q.mod);
  const targetLabels = ct('screens.10.targets');
  const types = ['word', 'phrase', 'clause'];

  // --- the sentence ---
  let sentenceKids;

  if (appState.qPhase === 'tap') {
    sentenceKids = tokens.map(function (tok) {
      const isWrong = appState.qWrongWord === tok.index;
      let cls = 'word';
      if (isWrong) cls += ' word--wrong word--teeter';
      return h(
        'span',
        {
          className: cls,
          key: 'w' + tok.index + '-' + appState.teeterNonce,
          onClick: function () { onWordTap(q, tok.index); },
        },
        tok.word
      );
    });
  } else {
    // Modifier lifted out as a chip; the rest of the sentence stays as text.
    sentenceKids = [];
    let i = 0;
    while (i < tokens.length) {
      if (span && i === span.start) {
        const placed = appState.qPhase === 'correct';
        sentenceKids.push(Chip({
          label: q.mod,
          id: 'q-chip',
          extraClass: placed ? 'chip--dragging' : '',
        }));
        i = span.end + 1;
      } else {
        sentenceKids.push(h('span', {}, tokens[i].word));
        i += 1;
      }
    }
  }

  // On the FIRST question only, glow the whole sentence during 'tap' so the
  // learner knows to tap into it — a finger pointing at one word would give
  // away which word is the modifier.
  const isFirstQuestion = appState.qIndex === 0 && appState.qMaxReached === 0;
  const sentenceCls = 'sentence-box' + (appState.qPhase === 'tap' && isFirstQuestion ? ' glow-target' : '');
  const showDragHint = appState.qPhase === 'drag' && isFirstQuestion;
  const sentence = h(
    'div',
    { className: sentenceCls, id: 'q-sentence' },
    ...sentenceKids
  );

  // --- drop targets ---
  const targets = types.map(function (type, i) {
    let state = 'idle';
    let chipLabel = '';

    if (appState.qPhase === 'drag') {
      state = 'ready';
    } else if (appState.qPhase === 'wrongDrop') {
      state = appState.qWrongType === type ? 'wrong' : 'ready';
      if (appState.qWrongType === type) chipLabel = q.mod;
    } else if (appState.qPhase === 'correct') {
      state = q.type === type ? 'correct' : 'ready';
      if (q.type === type) chipLabel = q.mod;
    }

    return DropTarget({
      id: 'target-' + type,
      label: targetLabels[i],
      state: state,
      chipLabel: chipLabel,
      glow: appState.qPhase === 'drag' && isFirstQuestion,
    });
  });

  // --- feedback ---
  // Anchored under whichever target box the chip actually landed on, rather
  // than centred under the whole row — so it stays correct regardless of
  // which of the three targets (Word/Phrase/Clause) got the wrong or right drop.
  let feedback = null;
  let anchorTargetId = null;
  if (appState.qPhase === 'tap' && appState.qWrongWord !== null) {
    feedback = Bubble({ text: ct('feedback.wrongTap'), wrong: true, id: 'q-bubble', anchored: true });
  } else if (appState.qPhase === 'wrongDrop') {
    const fb = L.feedbackFor(appState.qWrongType);
    feedback = Bubble({ text: fb.text, hint: fb.hint, wrong: true, id: 'q-bubble', anchored: true });
    anchorTargetId = 'target-' + appState.qWrongType;
  } else if (appState.qPhase === 'correct') {
    const fb = L.feedbackFor(q.type);
    feedback = Bubble({ text: fb.text, hint: fb.hint, id: 'q-bubble', anchored: true });
    anchorTargetId = 'target-' + q.type;
  }

  if (appState.qPhase === 'drag' || appState.qPhase === 'wrongDrop') {
    bindAfterRender(function () {
      const chip = document.getElementById('q-chip');
      if (!chip) return;
      attachChipDrag(chip, {
        label: q.mod,
        targetIds: types.map(function (ty) { return 'target-' + ty; }),
        onDrop: function (landed) {
          if (!landed) return;
          const droppedType = landed.replace('target-', '');
          onChipDrop(q, droppedType);
        },
      });
    });
  }

  if (showDragHint) {
    bindAfterRender(function () {
      positionQHint();
      requestAnimationFrame(positionQHint);
    });
  }

  if (anchorTargetId) {
    bindAfterRender(function () {
      requestAnimationFrame(function () { positionQBubble(anchorTargetId); });
    });
  }

  const body = h(
    'div',
    { className: 'q-body', id: 'q-body' },
    h('div', { className: 'q-progress' },
      'Question ' + (appState.qIndex + 1) + ' of ' + CFG.questionBank.length),
    sentence,
    h(
      'div',
      { className: 'targets-group', id: 'targets-group' },
      h('div', { className: 'targets' }, ...targets),
      feedback
    ),
    // A straight tap-and-drag from the chip down onto the correct box, built
    // from the plain tap gif + a CSS path — not a sideways swipe asset, which
    // read as the wrong gesture for "drag this down into the target below".
    showDragHint
      ? h('div', { className: 'q-hint-anchor', id: 'q-hint-anchor' },
          GestureHint({ kind: 'tap' }))
      : null
  );

  // Skip rule: Next unlocks once the third question is on screen.
  const canSkip = appState.qMaxReached >= CFG.questionsBeforeSkip - 1;

  return AppShell({
    title: ct('screens.10.title'),
    chipTitle: true,
    body: h(
      'div',
      { style: { flex: '1', display: 'flex', flexDirection: 'column' } },
      h('div', { className: 'instruction instruction--left' }, ct('screens.10.instruction')),
      body
    ),
    continueProps: canSkip ? { onClick: function () { goTo(17); }, pulse: false } : null,
  });
}

function onWordTap(q, tokenIndex) {
  if (appState.qPhase !== 'tap') return;

  if (L.isModifierToken(q.sentence, q.mod, tokenIndex)) {
    window.sound.playCorrectSound();
    setState({ qPhase: 'drag', qWrongWord: null });
  } else {
    window.sound.playWrongSound();
    setState({ qWrongWord: tokenIndex, teeterNonce: appState.teeterNonce + 1 });
    // Drop the teeter class once the 0.5s shake has played, so the node settles
    // (a permanently-animating word never becomes stable for taps or tests).
    schedule(function () {
      if (appState.qPhase === 'tap') setState({ qWrongWord: null });
    }, 1800);
  }
}

function onChipDrop(q, droppedType) {
  if (droppedType === q.type) {
    window.sound.playCorrectSound();
    setState({ qPhase: 'correct', qWrongType: null });
    // Auto-advance to the next question (slide-15 dev note).
    schedule(function () {
      const next = appState.qIndex + 1;
      if (next >= CFG.questionBank.length) {
        goTo(17);
      } else {
        setState({
          qIndex: next,
          qMaxReached: Math.max(appState.qMaxReached, next),
          qPhase: 'tap',
          qWrongType: null,
          qWrongWord: null,
        });
      }
    }, 2000);
  } else {
    window.sound.playWrongSound();
    setState({ qPhase: 'wrongDrop', qWrongType: droppedType });
    // Reset so the learner can retry.
    schedule(function () {
      setState({ qPhase: 'drag', qWrongType: null });
    }, 2200);
  }
}

// ---------- screens 17-21: build & connect ----------

function buildBuildScreen() {
  const selected = appState.buildSelected;
  const parts = L.buildSentence(CFG.buildBase, CFG.buildCards, selected);
  const allUsed = selected.length === CFG.buildCards.length;

  // NOTE: mini-react's createElement only appends strings, numbers and elements —
  // a raw document.createTextNode() child is silently dropped. Pass plain strings.
  const kids = [parts.lead];

  if (parts.pre.length) {
    parts.pre.forEach(function (label) {
      kids.push(h('span', { className: 'mod' }, label));
      kids.push(' ');
    });
  } else {
    kids.push(h('span', { className: 'build-blank' }));
    kids.push(' ');
  }

  kids.push(parts.head);

  if (parts.post.length) {
    kids.push(' ');
    parts.post.forEach(function (label, i) {
      kids.push(h('span', { className: 'mod' }, label));
      if (i < parts.post.length - 1) kids.push(' ');
    });
  } else {
    kids.push(' ');
    kids.push(h('span', { className: 'build-blank' }));
  }

  kids.push(parts.tail);

  const sentence = h('div', { className: 'sentence-box build-sentence' }, ...kids);

  const cards = CFG.buildCards.map(function (card) {
    const used = selected.indexOf(card.id) !== -1;
    return h(
      'button',
      {
        className: 'build-card' + (!used && !selected.length ? ' build-card--pulse' : ''),
        type: 'button',
        disabled: used,
        onClick: used ? null : function () {
          window.sound.playClickSound();
          setState({ buildSelected: selected.concat([card.id]) });
        },
      },
      card.label
    );
  });

  const body = h(
    'div',
    { style: { flex: '1', display: 'flex', flexDirection: 'column' } },
    h('div', { className: 'instruction' }, ct('screens.17.instruction')),
    h('div', { className: 'build-body' }, sentence, h('div', { className: 'build-cards' }, ...cards))
  );

  return AppShell({
    title: ct('screens.17.title'),
    body: body,
    continueProps: allUsed ? { onClick: function () { goTo(22); }, pulse: true } : null,
  });
}

// ---------- end ----------

function buildEndScreen() {
  const body = h(
    'div',
    { className: 'only-stage' },
    h('div', { className: 's9-band' },
      'You have completed the Modifiers topic.'),
    Bubble({ text: 'A modifier is a word, phrase, or clause that gives more information about another word.' })
  );
  return AppShell({ title: 'Modifiers', chipTitle: true, body: body });
}

// ---------- router ----------

const SCREEN_BUILDERS = {
  1: buildOnlyScreen,
  2: buildOnlyScreen,
  3: buildOnlyScreen,
  4: buildScreen4,
  5: buildTypeScreen,
  6: buildTypeScreen,
  7: buildTypeScreen,
  8: buildTypeScreen,
  9: buildScreen9,
  10: buildQuestionScreen,
  11: buildQuestionScreen,
  12: buildQuestionScreen,
  13: buildQuestionScreen,
  14: buildQuestionScreen,
  15: buildQuestionScreen,
  16: buildQuestionScreen,
  17: buildBuildScreen,
  18: buildBuildScreen,
  19: buildBuildScreen,
  20: buildBuildScreen,
  21: buildBuildScreen,
  22: buildEndScreen,
};

function App() {
  const builder = SCREEN_BUILDERS[appState.screen] || buildEndScreen;
  return builder();
}

function renderApp() {
  pendingBindings = [];
  const root = document.getElementById('app');
  root.innerHTML = '';
  const tree = App();
  if (tree) root.appendChild(tree);
  // Bind drag handlers now that the nodes are in the document.
  pendingBindings.forEach(function (fn) { fn(); });
  pendingBindings = [];
}

// Re-derive which target the question-engine bubble is currently anchored to
// (it depends on qPhase/qWrongType, not just the DOM), for the resize handler.
function currentQAnchorTargetId() {
  if (appState.qPhase === 'wrongDrop') return 'target-' + appState.qWrongType;
  if (appState.qPhase === 'correct') {
    const q = CFG.questionBank[appState.qIndex];
    return q ? 'target-' + q.type : null;
  }
  return null;
}

function initializeApp() {
  renderApp();
  // Keep anchored elements locked to what they point at when --scaleFactor
  // changes: the screen-1 bubble to its chip, the screen 6-8 arrow/tag to the
  // boxed modifier, the screen 9 tree connector to its nodes, the question-
  // engine bubble to its target box.
  window.addEventListener('resize', function () {
    requestAnimationFrame(positionOnlyBubble);
    requestAnimationFrame(positionOnlyHint);
    requestAnimationFrame(centerUnderExampleMod);
    requestAnimationFrame(positionS9Connector);
    requestAnimationFrame(positionQHint);
    requestAnimationFrame(function () {
      const id = currentQAnchorTargetId();
      if (id) positionQBubble(id);
    });
  });
}
