// ConceptMenu.jsx — left vertical pill buttons with sequential unlocking + hand cue.
(function(){
  var h = window.MiniReact.h;

  function ConceptMenu(props){
    var t = props.t;
    var concepts = props.concepts;       // [{key, subSteps}]
    var unlockedIndex = props.unlockedIndex;
    var activeIndex = props.activeIndex;
    var completed = props.completed || {};
    var handTargetIndex = props.handTargetIndex; // index to show fingerTap on (or null)
    var onSelect = props.onSelect;

    var rows = concepts.map(function(c, i){
      var locked = i > unlockedIndex;
      var isActive = i === activeIndex;
      var isDone = !!completed[c.key];
      var cls = 'menu-pill';
      if (locked) cls += ' menu-pill--locked';
      else cls += ' menu-pill--unlocked';
      if (isActive) cls += ' menu-pill--active';
      else if (isDone) cls += ' menu-pill--done';

      var children = [ h('span', { className:'menu-pill-text' }, t('content-ui.menu.' + c.key)) ];
      if (i === handTargetIndex) children.push(h(window.HandPointer, {}));

      return h('button', {
        className: cls,
        disabled: locked ? 'disabled' : null,
        onClick: function(){ if (!locked) onSelect(i); }
      }, children);
    });

    return h('div', { className:'concept-menu' }, rows);
  }
  window.ConceptMenu = ConceptMenu;
})();
