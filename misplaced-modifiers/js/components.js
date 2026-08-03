// Shared UI kit for the Misplaced Modifier applet.
// Every component returns a real DOM node (mini-react has no vdom).
// Carried over from Applet 1, minus its Word/Phrase/Clause-specific parts,
// plus OptionButton for the "What should almost modify?" pills.

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
  // specific element (e.g. the tapped option) rather than sitting centred.
  if (props.anchored) cls += ' bubble--anchored';
  // mini-react drops raw Text nodes — pass plain strings as children.
  const kids = [props.text || ''];
  if (props.hint) kids.push(h('span', { className: 'bubble-hint' }, props.hint));
  return h('div', { className: cls, id: props.id || null }, ...kids);
}

// Navy chip. Drag wiring lives in app.js.
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

// Gold answer pill for the "What should almost modify?" quiz (deck p22).
// state: 'idle' | 'wrong' | 'correct'
function OptionButton(props) {
  let cls = 'option-button';
  if (props.state && props.state !== 'idle') cls += ' option-button--' + props.state;
  // All three options are valid taps (only one is correct) — glow the set
  // rather than pointing a finger at any single one, which would spoil it.
  if (props.glow) cls += ' glow-target';
  return h(
    'button',
    {
      className: cls,
      type: 'button',
      id: props.id || null,
      disabled: !!props.disabled,
      onClick: props.disabled ? null : props.onClick,
    },
    props.label
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
  OptionButton: OptionButton,
  GestureHint: GestureHint,
};
