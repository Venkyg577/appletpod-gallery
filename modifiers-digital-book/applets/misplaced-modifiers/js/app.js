// Misplaced Modifier applet — state machine and screen builders.
// Reuses the globals declared by components.js / misplacedLesson.js /
// mini-react.js directly (h, AppShell, ...) — these are plain <script> globals,
// not modules, so redeclaring them here would collide.

/* eslint-disable no-undef */

const L = window.misplacedLesson;
const CFG = window.MISPLACED_CONFIG;
const t = window.utils.getText;

function ct(path, params) { return t('content-ui.' + path, params); }

// ---------- state ----------

let appState = {
  screen: 1,

  // Screens 2-5: the "What should almost modify?" quiz.
  quizPicked: null,       // the option currently showing feedback
  quizSolved: false,      // true once the correct option has been chosen

  // Screens 6-8: the "on paper plates" drag demo.
  demoSlot: null,         // where the modifier currently sits (null = original)
  demoPhase: 'drag',      // 'drag' | 'wrong' | 'correct'

  // Screen 9: the practice bank, same drag engine.
  qIndex: 0,
  qSlot: null,
  qPhase: 'drag',         // 'drag' | 'wrong' | 'correct'
  qMaxReached: 0,         // highest question index shown, for the skip rule
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
}

function goTo(screenNum, patch) {
  clearScheduled();
  setState(Object.assign({ screen: screenNum }, patch || {}));
}

// ---------- drag helper ----------

// Ghost drag with hit-testing against named drop targets.
//
// The ghost is appended inside .responsive-wrapper and positioned with LOCAL
// (1920x1080-space) coordinates, so the wrapper's scale(--scaleFactor)
// transform applies to it automatically and it stays the same visual size as
// the chip it came from at any window size. A position:fixed ghost positioned
// with raw clientX/Y would sit OUTSIDE that transform and render wrongly.
//
// Target rects are read once on pointer-down: renderApp() replaces the DOM on
// every setState, so re-querying mid-drag would hit detached nodes.
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

// ---------- shared render helpers ----------

// Renders a sentence with one word/phrase bolded, without innerHTML.
// mini-react drops raw Text nodes, so children are passed as plain strings.
function sentenceWithMod(sentence, mod, modClass) {
  const idx = sentence.toLowerCase().indexOf(String(mod).toLowerCase());
  if (idx === -1) return h('span', {}, sentence);
  return h(
    'span',
    {},
    sentence.slice(0, idx),
    h('span', { className: modClass || 'mod' }, sentence.substr(idx, mod.length)),
    sentence.slice(idx + mod.length)
  );
}

// Splits feedback copy into paragraphs on sentence-ish boundaries the deck
// shows as separate lines, so a bubble reads like the slide.
function bubbleLines(text) {
  return String(text)
    .split('\n')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

function multiLineBubble(props) {
  const lines = bubbleLines(props.text);
  if (lines.length <= 1) return Bubble(props);
  const bubble = Bubble(Object.assign({}, props, { text: '' }));
  lines.forEach(function (line) {
    bubble.appendChild(h('span', { className: 'bubble-line' }, line));
  });
  return bubble;
}

// ---------- screen 1: definition + comparison (deck p26) ----------

function buildScreen1() {
  const c = CFG.compare;
  const meaningLabel = ct('screens.1.meaningLabel');

  function column(side, data, mark) {
    return h(
      'div',
      { className: 'mm-col mm-col--' + side },
      h('div', { className: 'mm-sentence' }, sentenceWithMod(data.sentence, data.mod)),
      h(
        'div',
        { className: 'mm-link' },
        h('span', { className: 'mm-arrow' }, '↓'),
        h('span', { className: 'mm-mark' }, mark)
      ),
      h(
        'div',
        { className: 'mm-meaning' },
        h('strong', {}, meaningLabel),
        ' ' + data.meaning
      )
    );
  }

  const body = h(
    'div',
    { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '28px' } },
    h('div', { className: 'def-band' }, definitionText()),
    h(
      'div',
      { className: 'mm-compare' },
      column('wrong', c.wrong, '✘'),
      column('right', c.right, '✔')
    )
  );

  return AppShell({
    title: ct('screens.1.title'),
    chipTitle: true,
    body: body,
    continueProps: { onClick: function () { goTo(2); }, pulse: true },
  });
}

// The definition with its two key terms bolded, matching the deck.
// NOTE: mini-react's createElement appends only strings, numbers and elements —
// a raw document.createTextNode() child is silently dropped. Pass plain strings.
function definitionText() {
  const text = ct('screens.1.definition');
  const terms = ['misplaced modifier', 'modifier'];
  const kids = [];

  // Bold the first occurrence of each term, in order, without innerHTML.
  let rest = text;
  terms.forEach(function (term) {
    const i = rest.indexOf(term);
    if (i === -1) return;
    kids.push(rest.slice(0, i));
    kids.push(h('strong', {}, term));
    rest = rest.slice(i + term.length);
  });
  kids.push(rest);

  return h('span', {}, ...kids);
}

// ---------- screens 2-5: what should "almost" modify? (deck p22-25) ----------

function buildQuizScreen() {
  const q = CFG.almostQuiz;
  const picked = appState.quizPicked;
  const solved = appState.quizSolved;

  const options = q.options.map(function (label, i) {
    let state = 'idle';
    if (picked === label) state = label === q.correct ? 'correct' : 'wrong';
    else if (solved && label === q.correct) state = 'correct';

    return OptionButton({
      id: 'option-' + i,
      label: label,
      state: state,
      disabled: solved,
      // Glow all three before any attempt has been made — three independent
      // taps, not one correct target to point at.
      glow: !picked,
      onClick: function () { onQuizPick(q, label); },
    });
  });

  let feedback = null;
  if (picked) {
    const isRight = picked === q.correct;
    let text = q.feedback[picked];
    if (isRight) text += '\n' + q.correctedSentence;
    feedback = multiLineBubble({
      text: text,
      wrong: !isRight,
      id: 'quiz-bubble',
    });
    feedback.classList.add('bubble--side');
  }

  const body = h(
    'div',
    { className: 'quiz-body' },
    h('div', { className: 'instruction' }, ct('screens.2.instruction')),
    h('div', { className: 'sentence-box quiz-sentence' },
      sentenceWithMod(q.sentence, q.mod)),
    h('div', { className: 'quiz-question' }, q.question),
    h(
      'div',
      { className: 'quiz-main', id: 'quiz-main' },
      h('div', { className: 'quiz-options', id: 'quiz-options' }, ...options),
      h('div', { className: 'quiz-feedback' }, feedback)
    )
  );

  if (picked) {
    const idx = q.options.indexOf(picked);
    bindAfterRender(function () {
      requestAnimationFrame(function () { positionQuizBubble(idx); });
    });
  }

  return AppShell({
    title: ct('screens.2.title'),
    chipTitle: true,
    body: body,
    continueProps: solved ? { onClick: function () { goTo(6); }, pulse: true } : null,
  });
}

function onQuizPick(q, label) {
  if (appState.quizSolved) return;
  const isRight = label === q.correct;
  if (isRight) window.sound.playCorrectSound();
  else window.sound.playWrongSound();
  setState({ quizPicked: label, quizSolved: isRight });
}

// Point the side bubble's tail at the vertical centre of the tapped option.
// Measured in unscaled local px: offsetHeight/offsetTop are pre-scale, while
// getBoundingClientRect is post-scale — the two must never be mixed.
function positionQuizBubble(optionIndex) {
  const option = document.getElementById('option-' + optionIndex);
  const bubble = document.getElementById('quiz-bubble');
  const optionsEl = document.getElementById('quiz-options');
  if (!option || !bubble || !optionsEl) return;

  const optionsRect = optionsEl.getBoundingClientRect();
  if (!optionsRect.height) return;
  const scale = optionsRect.height / optionsEl.offsetHeight;
  const optRect = option.getBoundingClientRect();

  const optCentre = (optRect.top + optRect.height / 2 - optionsRect.top) / scale;
  const bubbleH = bubble.offsetHeight;

  // Align the bubble so its tail lands on the option, then clamp so the bubble
  // stays inside the options column's vertical span.
  const maxTop = Math.max(0, optionsEl.offsetHeight - bubbleH);
  const top = Math.max(0, Math.min(optCentre - bubbleH / 2, maxTop));
  bubble.style.marginTop = top + 'px';

  // Tail position relative to where the bubble ACTUALLY ended up.
  bubble.style.setProperty('--tail-y', (optCentre - top - 20) + 'px');
}

// ---------- screens 6-9: drag the modifier into position ----------

// One builder serves both the scripted demo (deck p27-29) and the practice
// bank (deck p30) — they are the same interaction over different data.
function buildDragScreen() {
  const isDemo = appState.screen === 6;
  const q = isDemo ? CFG.dragDemo : CFG.practiceBank[appState.qIndex];
  const slot = isDemo ? appState.demoSlot : appState.qSlot;
  const phase = isDemo ? appState.demoPhase : appState.qPhase;

  const base = L.removeModifier(q.sentence, q.mod);
  // Before any drag the modifier sits where the deck shows it (in the original
  // sentence); after a drag it sits wherever it was dropped.
  const originalSpan = L.locateModifier(q.sentence, q.mod);
  const originalSlot = originalSpan ? originalSpan.start : base.length;
  const shownSlot = slot === null ? originalSlot : slot;

  let chipClass = '';
  if (phase === 'correct') chipClass = 'chip--correct';
  else if (phase === 'wrong') chipClass = 'chip--wrong';

  // Assemble the sentence: real words, with the chip inserted at shownSlot.
  //
  // removeModifier() reattaches the sentence's full stop to whichever word now
  // ends it. When the chip is then placed AFTER that word (the original
  // end-of-sentence position), the stop would read "...children. on paper
  // plates" — so in that case the punctuation moves to trail the chip instead.
  const trailingPunct = shownSlot === base.length
    ? (base[base.length - 1].match(/[.,!?;:]+$/) || [''])[0]
    : '';

  // Build the display order first, then apply sentence case across it, so
  // whichever segment now starts the sentence is capitalised and the one that
  // stopped being first drops back to lower case. Without this, dragging the
  // modifier to the front reads "nearly He drove for two hours."
  const segments = [];
  for (let i = 0; i <= base.length; i += 1) {
    if (i === shownSlot) segments.push({ text: q.mod, isModifier: true });
    if (i < base.length) {
      const word = (trailingPunct && i === base.length - 1)
        ? base[i].slice(0, -trailingPunct.length)
        : base[i];
      segments.push({ text: word, isModifier: false, wordIndex: i });
    }
  }
  const cased = L.applySentenceCase(segments);

  const parts = [];
  cased.forEach(function (seg) {
    if (seg.isModifier) {
      parts.push(Chip({ label: seg.text, id: 'drag-chip', extraClass: chipClass }));
      if (trailingPunct) parts.push(h('span', { className: 'drag-word' }, trailingPunct));
    } else {
      parts.push(h('span', { className: 'drag-word', id: 'drag-word-' + seg.wordIndex }, seg.text));
    }
  });

  // Show the drag hint only on the demo screen, before the learner's first
  // ever attempt in this applet — after that they know the gesture, and the
  // practice bank (8 more of the same interaction) would be cluttered by it.
  const showDragHint = isDemo && phase === 'drag' && slot === null;
  if (showDragHint) {
    parts.push(h('div', { className: 'drag-hint-anchor', id: 'drag-hint-anchor' },
      GestureHint({ kind: 'drag' })));
  }

  const sentence = h(
    'div',
    { className: 'sentence-box', id: 'drag-sentence', style: { position: 'relative' } },
    ...parts
  );

  let feedback = null;
  if (phase === 'wrong') {
    feedback = multiLineBubble({
      text: isDemo ? q.wrongFeedback : CFG.practiceWrongFeedback,
      wrong: true,
      id: 'drag-bubble',
      anchored: true,
    });
  } else if (phase === 'correct') {
    feedback = multiLineBubble({
      text: isDemo ? q.correctFeedback : q.feedback,
      id: 'drag-bubble',
      anchored: true,
    });
  }

  if (phase !== 'correct') {
    bindAfterRender(function () {
      const chip = document.getElementById('drag-chip');
      if (!chip) return;
      attachChipDrag(chip, {
        // The ghost mirrors the chip, so it must use the cased label too.
        label: chip.textContent,
        targetIds: ['drag-sentence'],
        onDrop: function (landed, point) {
          if (!landed) return;
          const dropped = L.nearestGap(point.x, base.length, 'drag-word-');
          if (dropped === -1 || dropped === shownSlot) return;
          onDrop(q, dropped, isDemo);
        },
      });
    });
  }

  if (feedback) {
    bindAfterRender(function () {
      requestAnimationFrame(positionDragBubble);
    });
  }

  if (showDragHint) {
    bindAfterRender(function () {
      positionDragHint();
      requestAnimationFrame(positionDragHint);
    });
  }

  const progress = isDemo
    ? null
    : h('div', { className: 'drag-progress' },
      'Question ' + (appState.qIndex + 1) + ' of ' + CFG.practiceBank.length);

  // Skip rule (deck p30): Next unlocks once the third question is displayed.
  const canSkip = !isDemo && appState.qMaxReached >= CFG.questionsBeforeSkip - 1;

  const body = h(
    'div',
    { className: 'drag-body' },
    progress,
    h('div', { className: 'drag-sentence-group', id: 'drag-group' }, sentence, feedback)
  );

  return AppShell({
    title: ct('screens.6.title'),
    chipTitle: true,
    body: h(
      'div',
      { style: { flex: '1', display: 'flex', flexDirection: 'column' } },
      h('div', { className: 'instruction' }, ct('screens.6.instruction')),
      body
    ),
    continueProps: canSkip ? { onClick: function () { goTo(10); }, pulse: false } : null,
  });
}

function onDrop(q, slot, isDemo) {
  const correct = L.isCorrectSlot(q, slot);

  if (correct) {
    window.sound.playCorrectSound();
    if (isDemo) {
      setState({ demoSlot: slot, demoPhase: 'correct' });
      // Deck p29: "After dragging to the correct place, next question should
      // appear automatically."
      schedule(function () {
        goTo(9, { qIndex: 0, qSlot: null, qPhase: 'drag', qMaxReached: 0 });
      }, 2600);
    } else {
      setState({ qSlot: slot, qPhase: 'correct' });
      schedule(function () {
        const next = appState.qIndex + 1;
        if (next >= CFG.practiceBank.length) {
          goTo(10);
        } else {
          setState({
            qIndex: next,
            qMaxReached: Math.max(appState.qMaxReached, next),
            qSlot: null,
            qPhase: 'drag',
          });
        }
      }, 2600);
    }
    return;
  }

  window.sound.playWrongSound();
  if (isDemo) {
    setState({ demoSlot: slot, demoPhase: 'wrong' });
    schedule(function () { setState({ demoPhase: 'drag' }); }, 2600);
  } else {
    setState({ qSlot: slot, qPhase: 'wrong' });
    schedule(function () { setState({ qPhase: 'drag' }); }, 2600);
  }
}

// Centre the drag feedback bubble under the chip it refers to.
// Same local-px measurement rule as positionQuizBubble.
function positionDragBubble() {
  const chip = document.getElementById('drag-chip');
  const bubble = document.getElementById('drag-bubble');
  const sentenceEl = document.getElementById('drag-sentence');
  if (!chip || !bubble || !sentenceEl) return;

  const sentRect = sentenceEl.getBoundingClientRect();
  if (!sentRect.width) return;
  const scale = sentRect.width / sentenceEl.offsetWidth;
  const chipRect = chip.getBoundingClientRect();

  const chipCentre = (chipRect.left + chipRect.width / 2 - sentRect.left) / scale;
  const bubbleW = bubble.offsetWidth;

  const maxLeft = sentenceEl.offsetWidth - bubbleW;
  const left = Math.max(0, Math.min(chipCentre - bubbleW / 2, maxLeft));
  bubble.style.marginLeft = left + 'px';
  bubble.style.setProperty('--tail-x', (chipCentre - left) + 'px');
}

// Position the drag-hint finger over the modifier chip on the demo screen.
// Same local-px rule as positionDragBubble: offsetWidth is pre-scale,
// getBoundingClientRect is post-scale — never mix the two.
function positionDragHint() {
  const chip = document.getElementById('drag-chip');
  const anchor = document.getElementById('drag-hint-anchor');
  const sentenceEl = document.getElementById('drag-sentence');
  if (!chip || !anchor || !sentenceEl) return;

  const sentRect = sentenceEl.getBoundingClientRect();
  if (!sentRect.width) return;
  const scale = sentRect.width / sentenceEl.offsetWidth;
  const chipRect = chip.getBoundingClientRect();

  const chipRightX = (chipRect.right - sentRect.left) / scale;
  const chipCentreY = (chipRect.top + chipRect.height / 2 - sentRect.top) / scale;

  anchor.style.left = chipRightX + 'px';
  anchor.style.top = chipCentreY + 'px';
}

// ---------- end ----------

function buildEndScreen() {
  const body = h(
    'div',
    { style: { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px' } },
    h('div', { className: 'def-band' }, 'You have completed the Misplaced Modifier topic.'),
    h('div', { className: 'def-band' },
      'Keep a modifier next to the word it describes — its position decides the meaning.')
  );
  return AppShell({ title: ct('screens.1.title'), chipTitle: true, body: body });
}

// ---------- router ----------

const SCREEN_BUILDERS = {
  1: buildScreen1,
  2: buildQuizScreen,
  3: buildQuizScreen,
  4: buildQuizScreen,
  5: buildQuizScreen,
  6: buildDragScreen,
  7: buildDragScreen,
  8: buildDragScreen,
  9: buildDragScreen,
  10: buildEndScreen,
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

function initializeApp() {
  renderApp();
  // Keep anchored bubbles locked to what they point at when --scaleFactor
  // changes: the quiz bubble to its option, the drag bubble to its chip.
  window.addEventListener('resize', function () {
    requestAnimationFrame(function () {
      const q = CFG.almostQuiz;
      if (appState.quizPicked) positionQuizBubble(q.options.indexOf(appState.quizPicked));
      positionDragBubble();
      positionDragHint();
    });
  });
}
