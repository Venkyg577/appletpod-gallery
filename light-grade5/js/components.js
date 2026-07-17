/* global window, createElement */
/* Shared UI building blocks. */

const h = createElement;

function AppShell({ title, footerText, body, nextProps, sidePanel }) {
  const stageClass = 'stage-panel' + (sidePanel ? ' stage-panel--split' : '');
  const children = [
    h('header', { className: 'applet-header' }, h('span', {}, title)),
    h(
      'div',
      { className: 'applet-body' },
      h('div', { className: stageClass }, body),
      sidePanel ? h('div', { className: 'side-panel' }, sidePanel) : null
    ),
    h(
      'footer',
      { className: 'applet-footer' },
      h('span', {}, footerText || ''),
      nextProps ? NextButton(nextProps) : null
    ),
  ];
  return h('div', { className: 'light-applet' }, ...children.filter(Boolean));
}

function NextButton({ disabled, pulse, onClick }) {
  const cls = 'next-button' + (pulse && !disabled ? ' next-button--pulse' : '');
  return h(
    'button',
    {
      type: 'button',
      className: cls,
      disabled: !!disabled,
      onClick: disabled ? null : onClick,
      'aria-label': 'Next',
    },
    '›'
  );
}

function OptionButton({ label, variant, disabled, onClick, icon }) {
  let cls = 'option-button';
  if (variant === 'correct') cls += ' option-button--correct';
  else if (variant === 'wrong') cls += ' option-button--wrong';
  else if (variant === 'mcq') cls += ' option-button--mcq';
  if (disabled) cls += ' option-button--disabled';
  return h(
    'button',
    { type: 'button', className: cls, disabled: !!disabled, onClick: disabled ? null : onClick },
    icon ? h('span', { className: 'option-button-icon' }, icon) : null,
    h('span', { className: 'option-button-label' }, label)
  );
}

function Modal({ title, text, onClose }) {
  return h(
    'div',
    { className: 'modal-backdrop', onClick: onClose },
    h(
      'div',
      { className: 'modal-card', onClick: (e) => e.stopPropagation() },
      h('div', { className: 'modal-title' }, title),
      h('div', { className: 'modal-text' }, text),
      h('button', { type: 'button', className: 'modal-close', onClick: onClose }, 'Got it')
    )
  );
}

function SidePanel({ options, feedback }) {
  return h(
    'div',
    { className: 'side-panel-split' },
    h('div', { className: 'side-panel-top' }, ...(Array.isArray(options) ? options : [options])),
    h('div', { className: 'side-panel-bottom' }, feedback || null)
  );
}

function FeedbackBox({ text, correct }) {
  return h(
    'div',
    { className: 'feedback-box' + (correct ? ' feedback-box--correct' : '') },
    text
  );
}

function PropertyBadge({ text, revealed }) {
  return h(
    'div',
    { className: 'property-badge' + (revealed === false ? ' property-badge--muted' : '') },
    text
  );
}

function SceneImage({ src, alt }) {
  return h('img', { className: 'scene-bg', src, alt: alt || '' });
}

function GestureHint({ extraClass }) {
  return h(
    'div',
    { className: 'gesture-hint' + (extraClass ? ' ' + extraClass : ''), 'aria-hidden': 'true' },
    h('img', {
      className: 'gesture-hint-img',
      src: 'assets/gestures/finger-tap.gif',
      alt: '',
      draggable: 'false',
    })
  );
}

window.Components = {
  h,
  AppShell,
  NextButton,
  OptionButton,
  FeedbackBox,
  PropertyBadge,
  SceneImage,
  Modal,
  GestureHint,
  SidePanel,
};
