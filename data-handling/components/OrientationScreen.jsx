function OrientationScreen(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var setLayout = props.setLayout || function(){};
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){} };
  var PictogramTable = window.PictogramTable;

  function select(layout){
    audio.click();
    setLayout(layout);
    onNext();
  }

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.s2_instruction')),
    h('div', { className: 'screen-main screen-main--split-60-40' },
      h('div', { className: 'screen-left' },
        h('div', { className: 'left-bottom' },
          h('div', { className: 'side-table-wrap' },
            PictogramTable ? h(PictogramTable, { t: t }) : null
          )
        )
      ),
      h('div', { className: 'screen-right' },
        h('div', { className: 'right-panel' },
          h('div', { className: 'orientation-panel-inner' },
            h('div', { className: 'control-question' }, t('content-ui.prompts.s2_question')),
            h('div', { className: 'orientation-choices' },
              h('button', { className: 'choice-btn orientation-btn', onClick: function(){ select('vertical'); } },
                h('span', { style: { pointerEvents: 'none' } }, t('standard-ui.buttons.vertical_pictograph'))),
              h('button', { className: 'choice-btn orientation-btn', onClick: function(){ select('horizontal'); } },
                h('span', { style: { pointerEvents: 'none' } }, t('standard-ui.buttons.horizontal_pictograph')))
            )
          )
        )
      )
    ),
    h('div', { className: 'next-row' },
      h('div', { className: 'next-text' }, t('standard-ui.instructions.tap_to_select_choice'))
    )
  );
}
window.OrientationScreen = OrientationScreen;
