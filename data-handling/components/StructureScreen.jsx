function StructureScreen(props){
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var layout = props.layout;
  var structureCount = props.structureCount != null ? props.structureCount : 0;
  var setStructureCount = props.setStructureCount || function(){};
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };
  var PictogramTable = window.PictogramTable;

  var _check = useState(null);
  var checkResult = _check[0];
  var setCheckResult = _check[1];

  var vertical = layout === 'vertical';
  var isCols = vertical;
  var expectedCount = 5;
  var inc = function(){
    audio.click();
    setCheckResult(null);
    if (structureCount < 5) setStructureCount(structureCount + 1);
  };
  var dec = function(){
    audio.click();
    setCheckResult(null);
    if (structureCount > 0) setStructureCount(structureCount - 1);
  };
  var addDisabled = structureCount >= 5;
  var onCheck = function(){
    audio.click();
    if (structureCount < expectedCount) {
      setCheckResult('too_few');
      audio.wrong();
    } else if (structureCount > expectedCount) {
      setCheckResult('too_many');
      audio.wrong();
    } else {
      setCheckResult('correct');
      audio.correct();
    }
  };

  var correctHeader = isCols ? t('content-ui.prompts.structure_correct_header') : t('content-ui.prompts.structure_correct_header_rows');
  var baseHeader = isCols ? t('content-ui.prompts.add_columns_header') : t('content-ui.prompts.add_rows_header');
  var inst1 = checkResult === 'correct' ? correctHeader : baseHeader;
  var inst2 = isCols ? t('content-ui.prompts.structure_vertical_2') : t('content-ui.prompts.structure_horizontal_2');
  var tooFew = isCols ? t('content-ui.feedback.structure_too_few') : t('content-ui.feedback.structure_too_few_rows');
  var tooMany = isCols ? t('content-ui.feedback.structure_too_many') : t('content-ui.feedback.structure_too_many_rows');
  var correctMsg = isCols ? t('content-ui.feedback.structure_correct') : t('content-ui.feedback.structure_correct_rows');

  var correct = checkResult === 'correct';
  var showNext = correct;

  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!showNext) nextBtnProps.disabled = 'disabled';

  var noteClass = checkResult === 'correct' ? ' ok' : (checkResult ? ' error' : ' placeholder');
  var noteText = checkResult === 'too_few' ? tooFew : (checkResult === 'too_many' ? tooMany : (checkResult === 'correct' ? correctMsg : ''));

  var unitLabel = isCols ? t('standard-ui.labels.columns') : t('standard-ui.labels.rows');
  var previewCount = Math.max(structureCount || 0, 1);

  var upBtnProps = { className: 'triangle-btn up', onClick: inc };
  if (addDisabled) upBtnProps.disabled = 'disabled';

  return h('div', { className: 'screen-layout ' + (checkResult === 'too_many' ? 'shake' : ''), style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, inst1),
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
            h('div', { className: 'control-question' }, inst2),
            h('div', { className: 'structure-controls stepper-controls' },
              h('div', { className: 'stepper-row' },
                h('button', { className: 'stepper-btn minus', onClick: dec },
                  h('span', { style: { pointerEvents: 'none' } }, '–')),
                h('div', { className: 'unit-pill' },
                  h('span', { style: { pointerEvents: 'none' } }, unitLabel)
                ),
                h('button', {
                  className: 'stepper-btn plus',
                  onClick: inc,
                  disabled: addDisabled ? 'disabled' : undefined
                }, h('span', { style: { pointerEvents: 'none' } }, '+'))
              ),
              h('button', {
                className: 'check-btn' + (checkResult === 'correct' ? ' ok' : checkResult ? ' error' : ''),
                onClick: onCheck
              }, h('span', { style: { pointerEvents: 'none' } }, t('standard-ui.buttons.check')))
            )
          )
        )
      ),
      h('div', { className: 'screen-right' },
        h('div', { className: 'right-panel' },
          h('div', { className: 'structure-preview' + (isCols ? '' : ' horizontal') },
            (function(){
              var out = [];
              for (var i = 1; i <= previewCount; i++) {
                var labelBase = isCols ? t('standard-ui.labels.column') : t('standard-ui.labels.row');
                out.push(h('div', { className: 'preview-slot' + (isCols ? '' : ' row-slot') },
                  h('div', { className: isCols ? 'preview-label' : 'preview-label-left' }, labelBase + ' ' + i)
                ));
              }
              return out;
            })()
          )
        )
      )
    ),
    h('div', { className: 'next-row' },
      h('button', { className: 'prev-btn', onClick: onPrev },
        h('span', { style: { pointerEvents: 'none' } }, '◀')
      ),
      h('div', { className: 'next-text' },
        showNext ? (isCols ? t('standard-ui.instructions.tap_to_add_labels') : t('standard-ui.instructions.tap_to_add_labels_row')) : (isCols ? t('standard-ui.instructions.tap_plus_minus_check') : t('standard-ui.instructions.tap_plus_minus_check_rows'))
      ),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps,
          h('span', { style: { pointerEvents: 'none' } }, '▶')
        ),
        showNext ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: 'Tap to continue' }) : null
      )
    )
  );
}
window.StructureScreen = StructureScreen;
