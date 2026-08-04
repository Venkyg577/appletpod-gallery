// MCQPanel.jsx — question prompt + answer chips + correct/incorrect feedback panel.
(function(){
  var h = window.MiniReact.h;

  function MCQPanel(props){
    var question = props.question;
    var options = props.options || [];      // [{key, text}]
    var selectedOpt = props.selectedOpt;
    var result = props.result;              // null | 'correct' | 'incorrect'
    var feedbackText = props.feedbackText;
    var pulseOptions = props.pulseOptions;
    var onSelect = props.onSelect || function(){};

    var chips = options.map(function(opt){
      var cls = 'mcq-chip';
      if (selectedOpt === opt.key){
        cls += result === 'correct' ? ' mcq-chip--correct' : ' mcq-chip--incorrect';
      } else if (result === 'correct') {
        cls += ' mcq-chip--dim';
      } else if (pulseOptions && !result) {
        cls += ' mcq-chip--pulse';
      }
      return h('button', {
        className: cls,
        key: opt.key,
        onClick: function(){ onSelect(opt.key); }
      }, opt.text);
    });

    var children = [];
    if (question) children.push(h('div', { className:'mcq-question' }, question));
    children.push(h('div', { className:'mcq-options' }, chips));
    if (result && feedbackText){
      children.push(h('div', { className:'mcq-feedback mcq-feedback--' + result }, feedbackText));
    }

    return h('div', { className:'mcq-panel' }, children);
  }

  window.MCQPanel = MCQPanel;
})();
