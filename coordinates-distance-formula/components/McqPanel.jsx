// McqPanel.jsx — the right-column question card + answer chips + feedback box.
// Used on the horizontal-change, vertical-change, AD, DM and MA question screens.
// Pure/presentational: all state lives in useAppletState; this only renders + calls onPick.
// Square roots / squared terms are typeset with KaTeX via window.renderMathExpression.
(function(){
  var h = window.MiniReact.h;

  // Does this string contain math that should go through KaTeX? (√, ², ×)
  function hasMath(s){ return /√|²|×/.test(String(s)); }

  // Render one text line: KaTeX HTML span if it has math, else a plain text node.
  function richLine(text){
    if (hasMath(text) && window.renderMathExpression){
      return h('span', { className:'math-line', html: window.renderMathExpression(text) });
    }
    return text;
  }

  // Render a possibly multi-line (\n) block, each line through richLine.
  function richBlock(text){
    var lines = String(text).split('\n');
    var kids = [];
    lines.forEach(function(ln, i){
      if (i > 0) kids.push(h('br', {}));
      kids.push(richLine(ln));
    });
    return kids;
  }

  // props: {
  //   question, options:[{label,value}], chosen (value|null),
  //   result:'correct'|'incorrect'|null, correctValue,
  //   correctFeedback, wrongFeedback, onPick(value)
  // }
  function McqPanel(props){
    var options = props.options || [];
    var chosen = props.chosen;
    var result = props.result;
    var locked = result === 'correct';

    var chips = options.map(function(opt){
      var cls = 'mcq-chip';
      var isChosen = chosen != null && chosen === opt.value;
      if (locked && opt.value === props.correctValue) cls += ' mcq-chip--correct';
      else if (result === 'incorrect' && isChosen) cls += ' mcq-chip--incorrect';
      else if (locked) cls += ' mcq-chip--dim';
      return h('button', {
        className: cls,
        disabled: locked,
        onClick: locked ? undefined : function(){ props.onPick(opt.value); }
      }, richLine(opt.label));
    });

    var children = [
      h('div', { className:'mcq-question' }, props.question),
      h('div', { className:'mcq-options' }, chips)
    ];

    if (result === 'correct' && props.correctFeedback){
      children.push(h('div', { className:'mcq-feedback mcq-feedback--correct' }, richBlock(props.correctFeedback)));
    } else if (result === 'incorrect' && props.wrongFeedback){
      children.push(h('div', { className:'mcq-feedback mcq-feedback--incorrect' }, richBlock(props.wrongFeedback)));
    }

    return h('div', { className:'mcq-panel' }, children);
  }

  window.McqPanel = McqPanel;
})();
