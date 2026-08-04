// Callout.jsx — speech-bubble definition box(es) shown beside the grid.
// Accepts an array of {text, pos, tone} where pos is 'top-right'|'bottom-right'|'top-left'|'bottom-left'.
(function(){
  var h = window.MiniReact.h;

  function bubble(item, idx){
    var cls = 'callout callout--' + (item.pos || 'top-right');
    if (item.tone) cls += ' callout--' + item.tone;
    if (item.wide) cls += ' callout--wide';
    var lines = String(item.text).split('\n');
    var children = [];
    lines.forEach(function(ln, i){
      if (i > 0) children.push(h('br', {}));
      children.push(ln);
    });
    return h('div', { className: cls, key: 'c' + idx }, children);
  }

  function Callout(props){
    var items = props.items || [];
    if (!items.length) return null;
    return h('div', { className:'callout-layer' }, items.map(bubble));
  }
  window.Callout = Callout;
})();
