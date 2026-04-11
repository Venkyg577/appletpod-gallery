function BulbCountControl(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var bulbCount = props.bulbCount || 2;
  var onAdd = props.onAdd || function(){};
  var onRemove = props.onRemove || function(){};
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { addBulb:function(){}, removeBulb:function(){} };

  function handleAdd(){ audio.addBulb(); onAdd(); }
  function handleRemove(){ audio.removeBulb(); onRemove(); }

  return h('div', { className: 'bulb-count-control' },
    h('div', { className: 'bulb-count-label' }, t('content-ui.labels.add_remove')),
    h('div', { className: 'bulb-count-row' },
      h('button', {
        className: 'bulb-count-btn bulb-count-btn--minus' + (bulbCount <= 1 ? ' disabled' : ''),
        onClick: bulbCount > 1 ? handleRemove : null,
        disabled: bulbCount <= 1 ? 'disabled' : null
      }, h('span', {}, '\u2212')),
      h('div', { className: 'bulb-count-display' }, String(bulbCount)),
      h('button', {
        className: 'bulb-count-btn bulb-count-btn--plus' + (bulbCount >= 4 ? ' disabled' : ''),
        onClick: bulbCount < 4 ? handleAdd : null,
        disabled: bulbCount >= 4 ? 'disabled' : null
      }, h('span', {}, '+'))
    )
  );
}
window.BulbCountControl = BulbCountControl;
