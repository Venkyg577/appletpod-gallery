function BarGraphTitleScreen(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var barGraphTitle = props.barGraphTitle;
  var setBarGraphTitle = props.setBarGraphTitle || function(){};
  var barHeights = props.barHeights || window.VEHICLE_COUNTS || { bus: 5, car: 10, cycle: 3, bike: 7, tractor: 5 };
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };
  var PictogramTable = window.PictogramTable;
  var VEHICLES = window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];
  var SCALE_MAX = 10;

  function select(v){
    if (v === 'correct') audio.correct();
    else audio.wrong();
    setBarGraphTitle(v);
  }

  var incorrect = barGraphTitle === 'incorrect';
  var correctSel = barGraphTitle === 'correct';
  var hasSelection = incorrect || correctSel;
  var showNext = correctSel;
  var noteClass = hasSelection ? (correctSel ? ' ok' : ' error') : ' placeholder';
  // Screen 37 storyboard text said "pictograph" for the completed bar graph — corrected here to "bar graph"; see deviations note.
  var noteText = hasSelection ? (correctSel ? t('content-ui.feedback.bar_title_correct') : t('content-ui.feedback.bar_title_incorrect')) : '';
  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!showNext) nextBtnProps.disabled = 'disabled';

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.bar_title_1')),
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
            h('div', { className: 'control-question' }, t('content-ui.prompts.bar_title_2')),
            h('div', { className: 'choice-stack title-choices' },
              h('button', {
                className: 'choice-btn' + (incorrect ? ' wrong' : (correctSel ? ' dimmed' : '')),
                onClick: function(){ select('incorrect'); },
                disabled: hasSelection
              }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.options.bar_title_incorrect'))),
              h('button', {
                className: 'choice-btn' + (correctSel ? ' correct' : ''),
                onClick: function(){ select('correct'); },
                disabled: correctSel
              }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.options.bar_title_correct')))
            )
          )
        )
      ),
      h('div', { className: 'screen-right' },
        h('div', { className: 'right-panel' },
          showNext ? h('div', { className: 'right-title' }, t('content-ui.bar_graph_title')) : null,
          h('div', { className: 'bar-graph-area' },
            h('div', { className: 'axis-title y-axis-title' }, t('standard-ui.labels.y_axis')),
            h('div', { className: 'axis-title y-axis-caption' }, t('standard-ui.labels.no_of_vehicles')),
            h('div', { className: 'plot-area' },
              h('div', { className: 'y-axis-line' }),
              h('div', { className: 'y-axis-ticks' },
                [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(function(v){
                  return h('div', { key: 'yt' + v, className: 'y-axis-tick' },
                    h('span', { className: 'y-tick-num' }, String(v)),
                    h('span', { className: 'y-tick-mark' })
                  );
                })
              ),
              h('div', { className: 'bars-row' },
                VEHICLES.map(function(v){
                  var n = barHeights[v] || 0;
                  var pct = (n / SCALE_MAX) * 100;
                  return h('div', { key: v, className: 'bar-col locked' },
                    h('div', { className: 'bar-track' },
                      h('div', { className: 'bar-fill bar-fill--' + v, style: { height: pct + '%' } })
                    )
                  );
                })
              ),
              h('div', { className: 'x-axis-line' }),
              h('div', { className: 'x-labels-row' },
                VEHICLES.map(function(v){
                  return h('div', { key: 'xl' + v, className: 'bar-x-label' }, t('content-ui.vehicle_names.' + v));
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
      h('div', { className: 'next-text' }, showNext ? t('standard-ui.instructions.tap_next_pie_chart') : t('standard-ui.instructions.tap_title_bargraph')),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps, h('span', { style: { pointerEvents: 'none' } }, '▶')),
        showNext ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: '' }) : null
      )
    )
  );
}
window.BarGraphTitleScreen = BarGraphTitleScreen;
