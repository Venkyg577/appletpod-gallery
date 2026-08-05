function LabelsScreen(props){
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var layout = props.layout;
  var labelOrder = props.labelOrder || [null, null, null, null, null];
  var setLabelOrder = props.setLabelOrder || function(){};
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };
  var PictogramTable = window.PictogramTable;

  var LABELS = window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];
  var wrongFeedbackState = useState(false);
  var showWrongFeedback = wrongFeedbackState[0];
  var setShowWrongFeedback = wrongFeedbackState[1];

  function inPool(val){
    return labelOrder.indexOf(val) < 0;
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
    var next = labelOrder.slice();
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
      setLabelOrder(next);
      setShowWrongFeedback(false);
    } else {
      if (from >= 0) next[from] = null;
      next[slotIndex] = label;
      setLabelOrder(next);
      audio.wrong();
      setShowWrongFeedback(true);
      setTimeout(function(){
        setShowWrongFeedback(false);
        setLabelOrder(function(prev){
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

  var vertical = layout === 'vertical';
  var allFilled = labelOrder.every(Boolean);
  var isCorrectOrder = allFilled && LABELS.every(function(v, i){ return labelOrder[i] === v; });
  var hasWrongLabel = (function(){
    for (var i = 0; i < 5; i++) {
      if (labelOrder[i] && labelOrder[i] !== LABELS[i]) return true;
    }
    return false;
  })();
  var labelCorrect = vertical ? t('content-ui.feedback.label_correct') : t('content-ui.feedback.label_correct_rows');
  var labelIncorrect = vertical ? t('content-ui.feedback.label_incorrect') : t('content-ui.feedback.label_incorrect_rows');

  var showNote = allFilled || showWrongFeedback || hasWrongLabel;
  var noteClass = showNote ? (isCorrectOrder && !showWrongFeedback && !hasWrongLabel ? ' ok' : ' error') : ' placeholder';
  var noteText = showNote ? (isCorrectOrder && !showWrongFeedback && !hasWrongLabel ? labelCorrect : labelIncorrect) : '';
  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!isCorrectOrder) nextBtnProps.disabled = 'disabled';

  function renderChip(l){
    var inPoolNow = inPool(l);
    var wrongInSlot = (function(){
      for (var i = 0; i < 5; i++) {
        if (labelOrder[i] === l && labelOrder[i] !== LABELS[i]) return true;
      }
      return false;
    })();
    var correctInSlot = (function(){
      for (var i = 0; i < 5; i++) {
        if (labelOrder[i] === l && labelOrder[i] === LABELS[i]) return true;
      }
      return false;
    })();
    var chipClass = wrongInSlot ? ' wrong-fill' : (correctInSlot ? ' correct-dimmed' : '');
    var canDrag = inPoolNow || wrongInSlot;
    var fromSlotForDrag = -1;
    if (wrongInSlot) {
      for (var idx = 0; idx < 5; idx++) {
        if (labelOrder[idx] === l && labelOrder[idx] !== LABELS[idx]) { fromSlotForDrag = idx; break; }
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

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.labels_1')),
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
            h('div', { className: 'control-question' }, vertical ? t('content-ui.prompts.labels_2_col') : t('content-ui.prompts.labels_2_row')),
            h('div', { className: 'control-subtext' }, t('content-ui.prompts.labels_3')),
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
          h('div', { className: 'label-right-grid' + (vertical ? '' : ' horizontal') },
            LABELS.map(function(_, i){
              var val = labelOrder[i];
              return h('div', { key: 'slot-' + i, className: 'label-column' + (vertical ? '' : ' label-row') },
                vertical ? h('div', {
                  className: 'label-column-body',
                  onDrop: function(e){ handleDrop(i, e); },
                  onDragOver: handleDragOver
                }) : null,
                h('div', {
                  className: 'label-slot' + (val ? ' filled' : '') + (val === LABELS[i] ? ' correct' : (val ? ' wrong' : '')),
                  onDrop: function(e){ handleDrop(i, e); },
                  onDragOver: handleDragOver
                },
                  val ? h('div', { className: 'label-in-slot', draggable: true, onDragStart: function(ev){ ev.dataTransfer.setData('text/plain', dragPayload(val, i)); } },
                    h('span', { style: { pointerEvents: 'none' } }, t('content-ui.vehicle_names.' + val))
                  ) : h('span', { className: 'label-placeholder' }, t('content-ui.label_placeholder'))
                ),
                vertical ? null : h('div', { className: 'label-column-body label-row-body', onDrop: function(e){ handleDrop(i, e); }, onDragOver: handleDragOver })
              );
            })
          )
        )
      )
    ),
    h('div', { className: 'next-row' },
      h('button', { className: 'prev-btn', onClick: onPrev }, h('span', { style: { pointerEvents: 'none' } }, '◀')),
      h('div', { className: 'next-text' }, isCorrectOrder ? t('standard-ui.instructions.tap_to_add_title') : (vertical ? t('standard-ui.instructions.drag_each_label') : t('standard-ui.instructions.drag_each_label_row'))),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps, h('span', { style: { pointerEvents: 'none' } }, '▶')),
        isCorrectOrder ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: '' }) : null
      )
    )
  );
}
window.LabelsScreen = LabelsScreen;
