function RepresentationScreen(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var enabledOption = props.enabledOption; // 'pictograph' | 'bargraph' | null (null = terminal, none enabled)
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){} };
  var PictogramTable = window.PictogramTable;
  var isFirstVisit = props.isFirstVisit !== false;
  // The exit menu (bar graph completed, nothing left enabled) is where Pie chart and Line
  // graph are flagged as still in progress, since the storyboard ends before building them.
  var isTerminal = !isFirstVisit && enabledOption == null;

  var options = [
    { key: 'pictograph', label: t('standard-ui.buttons.pictograph') },
    { key: 'bargraph', label: t('standard-ui.buttons.bar_graph') },
    { key: 'piechart', label: t('standard-ui.buttons.pie_chart') },
    { key: 'linegraph', label: t('standard-ui.buttons.line_graph') }
  ];

  function select(key){
    if (key !== enabledOption) return;
    audio.click();
    onNext(key);
  }

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, isFirstVisit ? t('content-ui.prompts.s1_heading') : t('content-ui.prompts.menu_heading')),
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
          h('div', { className: 'choice-stack representation-choices' },
            options.map(function(opt){
              var isEnabled = enabledOption != null && opt.key === enabledOption;
              var isComingSoon = isTerminal && (opt.key === 'piechart' || opt.key === 'linegraph');
              return h('button', {
                key: opt.key,
                className: 'choice-btn representation-btn' + (isEnabled ? ' enabled' : ' disabled') + (isComingSoon ? ' coming-soon' : ''),
                onClick: function(){ select(opt.key); },
                disabled: !isEnabled
              },
                h('span', { style: { pointerEvents: 'none' } }, opt.label),
                isComingSoon ? h('span', { className: 'coming-soon-badge', style: { pointerEvents: 'none' } }, 'In progress') : null
              );
            })
          ),
          isTerminal ? h('div', { className: 'coming-soon-note' }, t('content-ui.prompts.coming_soon_note')) : null
        )
      )
    ),
    h('div', { className: 'next-row' },
      h('div', { className: 'next-text' }, isTerminal ? t('content-ui.prompts.coming_soon_heading') : (enabledOption ? t('content-ui.prompts.s1_instruction') : t('content-ui.prompts.menu_instruction')))
    )
  );
}
window.RepresentationScreen = RepresentationScreen;
