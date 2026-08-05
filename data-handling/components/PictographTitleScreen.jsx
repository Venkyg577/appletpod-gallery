function PictographTitleScreen(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var layout = props.layout;
  var selectedTitle = props.selectedTitle;
  var setSelectedTitle = props.setSelectedTitle || function(){};
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };
  var PictogramTable = window.PictogramTable;
  var labelOrder = props.labelOrder || window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];
  var COUNTS = window.VEHICLE_COUNTS || { bus: 5, car: 10, cycle: 3, bike: 7, tractor: 5 };
  var SLOTS_PER_COL = 10;

  function select(v){
    if (v === 'correct') audio.correct();
    else if (v === 'incorrect') audio.wrong();
    setSelectedTitle(v);
  }

  var vertical = layout === 'vertical';
  var incorrect = selectedTitle === 'incorrect';
  var correctSel = selectedTitle === 'correct';
  var hasSelection = incorrect || correctSel;
  var correct = correctSel;
  var showNext = correct;
  var noteClass = hasSelection ? (correct ? ' ok' : ' error') : ' placeholder';
  var noteText = hasSelection ? (correct ? t('content-ui.feedback.title_correct') : t('content-ui.feedback.title_incorrect')) : '';
  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!showNext) nextBtnProps.disabled = 'disabled';

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.title_1')),
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
            h('div', { className: 'control-question' }, t('content-ui.prompts.title_2')),
            h('div', { className: 'choice-stack title-choices' },
              h('button', {
                className: 'choice-btn' + (incorrect ? ' wrong' : (correctSel ? ' dimmed' : '')),
                onClick: function(){ select('incorrect'); },
                disabled: hasSelection
              }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.options.title_incorrect'))),
              h('button', {
                className: 'choice-btn' + (correctSel ? ' correct' : ''),
                onClick: function(){ select('correct'); },
                disabled: correctSel
              }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.options.title_correct')))
            )
          )
        )
      ),
      h('div', { className: 'screen-right' },
        h('div', { className: 'right-panel' },
          showNext ? h('div', { className: 'right-title' }, t('content-ui.pictogram_title')) : null,
          h('div', { className: 'populate-right-grid' + (vertical ? '' : ' horizontal') },
            labelOrder.map(function(lab, i){
              var n = COUNTS[lab] || 0;
              return h('div', { key: 'l' + i, className: 'populate-col locked' + (vertical ? '' : ' populate-row') },
                vertical ? null : h('div', { className: 'right-label-pill' }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.vehicle_names.' + lab))),
                h('div', { className: 'populate-col-body' + (vertical ? '' : ' populate-row-body') },
                  (function(){
                    var out = [];
                    for (var s = 0; s < SLOTS_PER_COL; s++) {
                      var filled = vertical ? (s >= SLOTS_PER_COL - n) : (s < n);
                      out.push(h('div', { key: s, className: 'icon-in-column' + (vertical ? '' : ' icon-in-row') },
                        filled ? h('img', {
                          className: 'vehicle-img',
                          src: 'assets/images/' + lab + '.png',
                          alt: t('content-ui.vehicle_names.' + lab),
                          draggable: false
                        }) : null
                      ));
                    }
                    return out;
                  })()
                ),
                vertical ? h('div', { className: 'right-label-pill' }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.vehicle_names.' + lab))) : null
              );
            })
          )
        )
      )
    ),
    h('div', { className: 'next-row' },
      h('button', { className: 'prev-btn', onClick: onPrev }, h('span', { style: { pointerEvents: 'none' } }, '◀')),
      h('div', { className: 'next-text' }, showNext ? t('standard-ui.instructions.tap_next_horizontal') : t('standard-ui.instructions.tap_title_pictograph')),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps, h('span', { style: { pointerEvents: 'none' } }, '▶')),
        showNext ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: '' }) : null
      )
    )
  );
}
window.PictographTitleScreen = PictographTitleScreen;
