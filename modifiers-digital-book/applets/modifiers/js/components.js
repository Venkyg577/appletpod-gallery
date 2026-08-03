// Shared UI kit for the Modifiers applet.
// Every component returns a real DOM node (mini-react has no vdom).

/* eslint-disable no-undef */

const h = createElement;

// Layout primitive every screen returns.
function AppShell(opts) {
  const children = [
    h(
      'header',
      { className: 'applet-header' + (opts.chipTitle ? ' applet-header--chip' : '') },
      h('span', {}, opts.title || '')
    ),
    h('div', { className: 'applet-body' }, h('div', { className: 'stage-card' }, opts.body)),
    h(
      'footer',
      { className: 'applet-footer' },
      opts.continueProps ? ContinueButton(opts.continueProps) : null
    ),
  ];
  return h('div', { className: 'modifier-applet' }, ...children.filter(Boolean));
}

function ContinueButton(props) {
  const cls = 'continue-button' + (props.pulse ? ' continue-button--pulse' : '');
  return h(
    'button',
    {
      className: cls,
      type: 'button',
      disabled: !!props.disabled,
      onClick: props.disabled ? null : function () {
        // goTo() (unlike goNext()) doesn't play a click sound itself, and every
        // screen's Continue button navigates via goTo — play it here once,
        // centrally, so no call site has to remember to.
        window.sound.playClickSound();
        props.onClick();
      },
    },
    props.label || window.utils.getText('standard-ui.buttons.continue')
  );
}

// Green (or salmon) speech bubble with a CSS triangle tail.
function Bubble(props) {
  let cls = 'bubble';
  if (props.wrong) cls += ' bubble--wrong';
  // Anchored bubbles are positioned by the caller so the tail points at a
  // specific element (e.g. the "Only" chip) rather than sitting centred.
  if (props.anchored) cls += ' bubble--anchored';
  // mini-react drops raw Text nodes — pass plain strings as children.
  const kids = [props.text || ''];
  if (props.hint) kids.push(h('span', { className: 'bubble-hint' }, props.hint));
  return h('div', { className: cls, id: props.id || null }, ...kids);
}

// Navy chip. `draggable` only marks styling/cursor; drag wiring lives in app.js.
function Chip(props) {
  return h(
    'span',
    {
      className: 'chip' + (props.extraClass ? ' ' + props.extraClass : ''),
      id: props.id || null,
    },
    props.label
  );
}

// Gold Word / Phrase / Clause selector used on screens 5-8.
function TypeButton(props) {
  let cls = 'type-button';
  if (props.active) cls += ' type-button--active';
  else if (props.visited) cls += ' type-button--visited';
  // glow (not a pointing finger) marks a SET of untried buttons where any of
  // several is a valid next tap — one finger would wrongly suggest only one
  // is correct.
  if (props.glow) cls += ' glow-target';
  return h(
    'button',
    { className: cls, type: 'button', onClick: props.onClick },
    props.label
  );
}

// One Word/Phrase/Clause drop target for the question engine.
function DropTarget(props) {
  let cls = 'target target--' + (props.state || 'idle');
  if (props.hover) cls += ' target--hover';
  // All three targets are valid drop zones (only one is correct for this
  // question, but the learner doesn't know which) — glow the set rather than
  // pointing a finger at any single one.
  if (props.glow) cls += ' glow-target';
  return h(
    'div',
    { className: cls, id: props.id },
    h('div', { className: 'target-header' }, props.label),
    h('div', { className: 'target-zone' }, props.chipLabel || '')
  );
}

// Animated finger hint. `kind` is 'tap' (default) or 'drag'.
// Purely decorative: pointer-events:none so it never blocks the interaction
// it is pointing at. Position it with `extraClass` or inline `style`.
function GestureHint(props) {
  var kind = (props && props.kind) === 'drag' ? 'drag' : 'tap';
  var src = kind === 'drag'
    ? 'assets/gestures/finger-drag.gif'
    : 'assets/gestures/finger-tap.gif';
  return h(
    'div',
    {
      className: 'gesture-hint gesture-hint--' + kind +
        (props.extraClass ? ' ' + props.extraClass : ''),
      style: props.style || {},
      'aria-hidden': 'true',
    },
    h('img', {
      className: 'gesture-hint-img',
      src: src,
      alt: '',
      draggable: 'false',
    })
  );
}

window.Components = {
  h: h,
  AppShell: AppShell,
  ContinueButton: ContinueButton,
  Bubble: Bubble,
  Chip: Chip,
  TypeButton: TypeButton,
  DropTarget: DropTarget,
  GestureHint: GestureHint,
};
