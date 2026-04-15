function HintCard(props) {
  var h = window.MiniReact.h;
  if (!props.text) return h('div', { style: { display: 'none' } });
  return h('div', { className: 'hint-card', role: 'note' }, props.text);
}

window.HintCard = HintCard;
