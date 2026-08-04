// PracticeList.jsx — right-column point picker (S24) and read-only chosen-point indicator (S25-29).
(function(){
  var h = window.MiniReact.h;

  var POINTS = [
    { x:-5, y:3,  label:'P' },
    { x:4,  y:-2, label:'P' },
    { x:-5, y:-3, label:'P' },
    { x:3,  y:-5, label:'P' },
    { x:-7, y:-4, label:'P' }
  ];

  function fmtPoint(label, x, y){ return label + '(' + x + ', ' + y + ')'; }

  // props: { selectedPoint, mode:'choose'|'display', onChoose(pt) }
  function PracticeList(props){
    var selected = props.selectedPoint;
    var chips = POINTS.map(function(pt, i){
      var isSel = selected && selected.x === pt.x && selected.y === pt.y;
      var cls = 'practice-chip' + (isSel ? ' practice-chip--selected' : '');
      return h('button', {
        className: cls, key:'pp' + i,
        disabled: props.mode === 'display',
        onClick: function(){ if (props.mode === 'choose') props.onChoose(pt); }
      }, fmtPoint(pt.label, pt.x, pt.y));
    });
    return h('div', { className:'practice-list' }, chips);
  }

  window.PracticeList = PracticeList;
  window.PRACTICE_POINTS = POINTS;
})();
