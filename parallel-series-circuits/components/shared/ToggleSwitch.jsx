function ToggleSwitch(props){
  var h = window.MiniReact.h;
  var isOn = props.isOn !== false;
  var onToggle = props.onToggle || function(){};
  var label = props.label || '';
  var size = props.size || 'medium';

  var sizeClass = 'toggle-switch--' + size;

  return h('div', {
    className: 'toggle-switch ' + sizeClass + (isOn ? ' toggle-switch--on' : ' toggle-switch--off'),
    onClick: function(e){ e.stopPropagation(); onToggle(); },
    role: 'button',
    tabIndex: '0'
  },
    h('div', { className: 'toggle-switch-track' },
      h('div', { className: 'toggle-switch-thumb' })
    ),
    label ? h('span', { className: 'toggle-switch-label', style: { pointerEvents: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' } }, label) : null
  );
}
window.ToggleSwitch = ToggleSwitch;
