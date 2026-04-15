function ControlBar(props) {
  var h = window.MiniReact.h;
  var primary = props.primaryAction || null;
  var secondary = props.secondaryAction || null;

  return h('footer', { className: 'control-bar', role: 'contentinfo' },
    h('div', { className: 'control-bar__left' },
      h('div', { className: 'control-bar__instruction' }, props.instructionText || '')
    ),
    h('div', { className: 'control-bar__actions' },
      secondary
        ? h(window.AppletButton, {
            label: secondary.label || '',
            variant: secondary.variant || 'secondary',
            disabled: !!secondary.disabled,
            onClick: secondary.onClick
          })
        : null,
      primary
        ? h(window.AppletButton, {
            label: primary.label || '',
            variant: primary.variant || 'primary',
            disabled: !!primary.disabled,
            title: primary.disabled ? primary.title : undefined,
            onClick: primary.onClick
          })
        : null
    )
  );
}

window.ControlBar = ControlBar;
