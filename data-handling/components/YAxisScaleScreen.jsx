function YAxisScaleScreen(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var yScale = props.yScale;
  var setYScale = props.setYScale || function(){};
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };
  var PictogramTable = window.PictogramTable;
  var VEHICLES = window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];

  function select(v){
    if (v === 'A') audio.correct();
    else audio.wrong();
    setYScale(v);
  }

  var wrongSel = yScale === 'B';
  var correctSel = yScale === 'A';
  var hasSelection = wrongSel || correctSel;
  var showNext = correctSel;
  var noteClass = hasSelection ? (correctSel ? ' ok' : ' error') : ' placeholder';
  var noteText = hasSelection ? (correctSel ? t('content-ui.feedback.scale_correct') : t('content-ui.feedback.scale_incorrect')) : '';
  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!showNext) nextBtnProps.disabled = 'disabled';

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.y_scale_1')),
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
            h('div', { className: 'choice-stack scale-choices' },
              h('button', {
                className: 'choice-btn' + (correctSel ? ' correct' : ''),
                onClick: function(){ select('A'); },
                disabled: correctSel
              }, h('span', { style: { pointerEvents: 'none' } }, t('standard-ui.buttons.scale_a'))),
              h('button', {
                className: 'choice-btn' + (wrongSel ? ' wrong' : (correctSel ? ' dimmed' : '')),
                onClick: function(){ select('B'); },
                disabled: hasSelection
              }, h('span', { style: { pointerEvents: 'none' } }, t('standard-ui.buttons.scale_b')))
            )
          )
        )
      ),
      h('div', { className: 'screen-right' },
        h('div', { className: 'right-panel' },
          h('div', { className: 'bar-graph-area' },
            h('div', { className: 'axis-title y-axis-title' }, t('standard-ui.labels.y_axis')),
            h('div', { className: 'axis-title y-axis-caption' }, t('standard-ui.labels.no_of_vehicles')),
            h('div', { className: 'plot-area' },
              h('div', { className: 'y-axis-line' }),
              showNext ? h('div', { className: 'y-axis-ticks' },
                [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(function(v){
                  return h('div', { key: 'yt' + v, className: 'y-axis-tick' },
                    h('span', { className: 'y-tick-num' }, String(v)),
                    h('span', { className: 'y-tick-mark' })
                  );
                })
              ) : null,
              h('div', { className: 'bars-row' },
                VEHICLES.map(function(v){
                  return h('div', { key: v, className: 'bar-col' },
                    h('div', { className: 'bar-track' },
                      h('div', { className: 'bar-fill bar-fill--' + v + ' stub' })
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
      h('div', { className: 'next-text' }, showNext ? t('standard-ui.instructions.tap_next_bar_graph') : t('standard-ui.instructions.tap_correct_scale')),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps, h('span', { style: { pointerEvents: 'none' } }, '▶')),
        showNext ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: '' }) : null
      )
    )
  );
}
window.YAxisScaleScreen = YAxisScaleScreen;
