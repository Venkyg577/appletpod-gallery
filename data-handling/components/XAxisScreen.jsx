function XAxisScreen(props){
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var xAxisOrder = props.xAxisOrder || [null, null, null, null, null];
  var setXAxisOrder = props.setXAxisOrder || function(){};
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };
  var PictogramTable = window.PictogramTable;

  var LABELS = window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];
  var wrongFeedbackState = useState(false);
  var showWrongFeedback = wrongFeedbackState[0];
  var setShowWrongFeedback = wrongFeedbackState[1];

  function inPool(val){
    return xAxisOrder.indexOf(val) < 0;
  }
  function dragPayload(label, fromSlot){
    return JSON.stringify({ label: label, fromSlot: fromSlot });
  }
  function handleDrop(slotIndex, e){
    e.preventDefault();
    var raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    var pl = JSON.parse(raw);
    var label = pl.label;
    var from = pl.fromSlot;
    var next = xAxisOrder.slice();
    var isCorrect = label === LABELS[slotIndex];
    if (isCorrect) {
      if (from >= 0) next[from] = null;
      else {
        for (var j = 0; j < 5; j++) {
          if (next[j] === label && next[j] !== LABELS[j]) next[j] = null;
        }
      }
      next[slotIndex] = label;
      audio.correct();
      setXAxisOrder(next);
      setShowWrongFeedback(false);
    } else {
      if (from >= 0) next[from] = null;
      next[slotIndex] = label;
      setXAxisOrder(next);
      audio.wrong();
      setShowWrongFeedback(true);
      setTimeout(function(){
        setShowWrongFeedback(false);
        setXAxisOrder(function(prev){
          var reset = prev.slice();
          if (reset[slotIndex] === label && reset[slotIndex] !== LABELS[slotIndex]) reset[slotIndex] = null;
          return reset;
        });
      }, 3000);
    }
  }
  function handleDragOver(e){
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function renderChip(l){
    var inPoolNow = inPool(l);
    var wrongInSlot = (function(){
      for (var i = 0; i < 5; i++) {
        if (xAxisOrder[i] === l && xAxisOrder[i] !== LABELS[i]) return true;
      }
      return false;
    })();
    var correctInSlot = (function(){
      for (var i = 0; i < 5; i++) {
        if (xAxisOrder[i] === l && xAxisOrder[i] === LABELS[i]) return true;
      }
      return false;
    })();
    var chipClass = wrongInSlot ? ' wrong-fill' : (correctInSlot ? ' correct-dimmed' : '');
    var canDrag = inPoolNow || wrongInSlot;
    var fromSlotForDrag = -1;
    if (wrongInSlot) {
      for (var idx = 0; idx < 5; idx++) {
        if (xAxisOrder[idx] === l && xAxisOrder[idx] !== LABELS[idx]) { fromSlotForDrag = idx; break; }
      }
    }
    return h('div', {
      key: 'pool-' + l,
      className: 'label-chip' + chipClass,
      draggable: canDrag,
      onDragStart: canDrag ? function(ev){
        ev.dataTransfer.setData('text/plain', dragPayload(l, fromSlotForDrag));
      } : undefined
    }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.vehicle_names.' + l)));
  }

  var allFilled = xAxisOrder.every(Boolean);
  var isCorrectOrder = allFilled && LABELS.every(function(v, i){ return xAxisOrder[i] === v; });
  var hasWrongLabel = (function(){
    for (var i = 0; i < 5; i++) {
      if (xAxisOrder[i] && xAxisOrder[i] !== LABELS[i]) return true;
    }
    return false;
  })();

  var showNote = allFilled || showWrongFeedback || hasWrongLabel;
  var noteClass = showNote ? (isCorrectOrder && !showWrongFeedback && !hasWrongLabel ? ' ok' : ' error') : ' placeholder';
  var noteText = showNote ? (isCorrectOrder && !showWrongFeedback && !hasWrongLabel ? t('content-ui.feedback.label_correct_rows') : t('content-ui.feedback.label_incorrect_rows')) : '';
  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!isCorrectOrder) nextBtnProps.disabled = 'disabled';

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.x_axis_1')),
    h('div', { className: 'screen-main screen-main--split-60-40' },
      h('div', { className: 'screen-left' },
        h('div', { className: 'feedback-slot' },
          h('div', { className: 'note-box' + noteClass, role: noteClass && noteClass !== ' placeholder' ? 'status' : undefined, 'aria-live': noteClass && noteClass !== ' placeholder' ? 'polite' : undefined },
            noteText ? h('div', { className: 'note-text' }, noteText) : null
          )
        ),
        h('div', { className: 'left-bottom' },
          h('div', { className: 'side-table-wrap' },
            PictogramTable ? h(PictogramTable, { t: t }) : null
          ),
          h('div', { className: 'control-area' },
            h('div', { className: 'control-question' }, t('content-ui.prompts.x_axis_2')),
            h('div', { className: 'label-pool-grid' },
              h('div', { className: 'label-pool-row' }, LABELS.slice(0, 2).map(renderChip)),
              h('div', { className: 'label-pool-row' }, LABELS.slice(2, 4).map(renderChip)),
              h('div', { className: 'label-pool-row' }, LABELS.slice(4, 5).map(renderChip))
            )
          )
        )
      ),
      h('div', { className: 'screen-right' },
        h('div', { className: 'right-panel' },
          h('div', { className: 'bar-graph-area' },
            h('div', { className: 'axis-title y-axis-title' }, t('standard-ui.labels.y_axis')),
            h('div', { className: 'plot-area' },
              h('div', { className: 'y-axis-line' }),
              h('div', { className: 'bars-row' }),
              h('div', { className: 'x-axis-line' }),
              h('div', { className: 'x-axis-track' },
                LABELS.map(function(_, i){
                  var val = xAxisOrder[i];
                  return h('div', {
                    key: 'xs-' + i,
                    className: 'x-axis-slot' + (val ? ' filled' : '') + (val === LABELS[i] ? ' correct' : (val ? ' wrong' : '')),
                    onDrop: function(e){ handleDrop(i, e); },
                    onDragOver: handleDragOver
                  },
                    val ? h('div', { className: 'label-in-slot', draggable: true, onDragStart: function(ev){ ev.dataTransfer.setData('text/plain', dragPayload(val, i)); } },
                      h('span', { style: { pointerEvents: 'none' } }, t('content-ui.vehicle_names.' + val))
                    ) : h('span', { className: 'label-placeholder' }, t('content-ui.label_placeholder'))
                  );
                })
              ),
              h('div', { className: 'x-axis-caption' },
                h('span', null, t('standard-ui.labels.vehicles')),
                h('span', { className: 'x-arrow' })
              ),
              h('div', { className: 'axis-title x-axis-title' }, t('standard-ui.labels.x_axis'))
            )
          )
        )
      )
    ),
    h('div', { className: 'next-row' },
      h('button', { className: 'prev-btn', onClick: onPrev }, h('span', { style: { pointerEvents: 'none' } }, '◀')),
      h('div', { className: 'next-text' }, isCorrectOrder ? t('standard-ui.instructions.tap_next_vertical_axis') : t('standard-ui.instructions.drag_each_label_row')),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps, h('span', { style: { pointerEvents: 'none' } }, '▶')),
        isCorrectOrder ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: '' }) : null
      )
    )
  );
}
window.XAxisScreen = XAxisScreen;
