// label: string, onClick, disabled, variant: 'primary' | 'secondary'
function Button(props) {
  var h = window.MiniReact.h;
  var variant = props.variant || 'primary';
  var disabled = !!props.disabled;
  var cls =
    'applet-btn applet-btn--' +
    (disabled ? 'disabled' : variant);
  if (disabled) cls += ' applet-btn--disabled';

  var btnProps = {
    type: 'button',
    className: cls,
    disabled: disabled,
    onClick: disabled ? undefined : props.onClick,
    'aria-disabled': disabled ? 'true' : undefined
  };
  if (props.title) btnProps.title = props.title;

  return h(
    'button',
    btnProps,
    h('span', {}, props.label || '')
  );
}

window.AppletButton = Button;
