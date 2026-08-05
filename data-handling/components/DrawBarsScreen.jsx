function DrawBarsScreen(props){
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var state = props.state;
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };
  var PictogramTable = window.PictogramTable;
  var VEHICLES = window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];
  var COUNTS = window.VEHICLE_COUNTS || { bus: 5, car: 10, cycle: 3, bike: 7, tractor: 5 };
  var SCALE_MAX = 10;

  var barHeights = state ? state.barHeights : { bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 };
  var setBarHeights = state ? state.setBarHeights : function(){};
  var lockedBars = state ? state.lockedBars : [];
  var setLockedBars = state ? state.setLockedBars : function(){};

  var currIdx = 0;
  for (var i = 0; i < VEHICLES.length; i++) {
    if (lockedBars.indexOf(VEHICLES[i]) < 0) { currIdx = i; break; }
    currIdx = i + 1;
  }
  var allDone = lockedBars.length >= VEHICLES.length;
  var currKey = VEHICLES[Math.min(currIdx, VEHICLES.length - 1)];
  var expectedCount = COUNTS[currKey];

  var checkState = useState(null); // 'too_short' | 'too_tall' | 'correct' | null
  var checkResult = checkState[0];
  var setCheckResult = checkState[1];

  // mini-react remounts this component on every render, which would reset a useState-based
  // dragging flag mid-gesture and kill the drag after one frame. Module-level state survives.
  function isDragging(){ return window.__barDragActive === true; }
  function setDragging(v){ window.__barDragActive = !!v; }

  // The track spans exactly values 0..SCALE_MAX, so a pointer at the track's bottom edge is 0
  // and at its top edge is SCALE_MAX. Rounding snaps the bar to whole vehicles.
  function heightToCount(px, trackHeight){
    if (!trackHeight) return 0;
    var ratio = 1 - (px / trackHeight);
    var count = Math.round(ratio * SCALE_MAX);
    return Math.max(0, Math.min(SCALE_MAX, count));
  }

  // `n` is passed in from the live gesture: reading state here would return the value captured
  // when the drag started, not the one the learner released on.
  function commitDrag(n){
    if (!isDragging()) return;
    setDragging(false);
    audio.click();
    if (n < expectedCount) {
      setCheckResult('too_short');
      audio.wrong();
    } else if (n > expectedCount) {
      setCheckResult('too_tall');
      audio.wrong();
    } else {
      setCheckResult('correct');
      audio.correct();
      setLockedBars(function(prev){
        return prev.indexOf(currKey) >= 0 ? prev : prev.concat([currKey]);
      });
    }
  }

  // The whole gesture is driven from window listeners attached on pointerdown, so it keeps
  // working across the remounts each setBarHeights triggers.
  function onPointerDown(ev){
    if (lockedBars.indexOf(currKey) >= 0) return;
    ev.preventDefault();
    var track = ev.currentTarget;
    var rect = track.getBoundingClientRect();
    setDragging(true);
    setCheckResult(null);
    var liveValue = applyFromClientY(ev.clientY, rect);

    function move(e){
      if (!isDragging()) return;
      e.preventDefault();
      liveValue = applyFromClientY(e.clientY, rect);
    }
    function up(){
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      commitDrag(liveValue);
    }
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function applyFromClientY(clientY, rect){
    var relY = clientY - rect.top;
    var count = heightToCount(relY, rect.height);
    setBarHeights(function(prev){
      var n = Object.assign({}, prev);
      n[currKey] = count;
      return n;
    });
    return count;
  }

  function repl(str, vehicle, count){
    var name = vehicle ? t('content-ui.vehicle_names.' + vehicle) : '';
    return (str || '').replace(/\{vehicle\}/g, name).replace(/\{count\}/g, count != null ? String(count) : '');
  }

  var noteClass = checkResult === 'correct' ? ' ok' : (checkResult ? ' error' : ' placeholder');
  var noteText = checkResult === 'too_short' ? repl(t('content-ui.feedback.bar_too_short'), currKey, expectedCount)
    : checkResult === 'too_tall' ? repl(t('content-ui.feedback.bar_too_tall'), currKey, expectedCount)
    : checkResult === 'correct' ? repl(t('content-ui.feedback.plot_column_complete'), currKey)
    : '';

  var headerText = currIdx === 0
    ? repl(t('content-ui.prompts.bar_demo_1'), currKey) + ' ' + repl(t('content-ui.prompts.bar_demo_2'), currKey, expectedCount)
    : t('content-ui.prompts.bar_remaining');

  var showNext = allDone;
  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!showNext) nextBtnProps.disabled = 'disabled';

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, headerText),
    h('div', { className: 'screen-main screen-main--split-60-40' },
      h('div', { className: 'screen-left' },
        h('div', { className: 'feedback-slot' },
          h('div', { className: 'note-box' + noteClass, role: noteClass && noteClass !== ' placeholder' ? 'status' : undefined, 'aria-live': noteClass && noteClass !== ' placeholder' ? 'polite' : undefined },
            noteText ? h('div', { className: 'note-text' }, noteText) : null
          )
        ),
        h('div', { className: 'left-bottom' },
          h('div', { className: 'side-table-wrap' },
            PictogramTable ? h(PictogramTable, { t: t, highlightVehicle: VEHICLES.indexOf(currKey) + 1, lockedVehicles: lockedBars }) : null
          ),
          h('div', { className: 'control-area' },
            h('div', { className: 'control-question' }, t('content-ui.prompts.bar_remaining_2'))
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
              h('div', { className: 'y-axis-ticks' },
                [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(function(v){
                  return h('div', { key: 'yt' + v, className: 'y-axis-tick' + (v === expectedCount && !allDone ? ' highlight' : '') },
                    h('span', { className: 'y-tick-num' }, String(v)),
                    h('span', { className: 'y-tick-mark' })
                  );
                })
              ),
              h('div', { className: 'bars-row' },
                VEHICLES.map(function(v){
                  var n = barHeights[v] || 0;
                  var pct = (n / SCALE_MAX) * 100;
                  var isActive = v === currKey && !allDone;
                  var locked = lockedBars.indexOf(v) >= 0;
                  return h('div', { key: v, className: 'bar-col' + (isActive ? ' active' : '') + (locked ? ' locked' : '') },
                    h('div', {
                      className: 'bar-track',
                      onPointerDown: isActive ? onPointerDown : null
                    },
                      h('div', { className: 'bar-fill bar-fill--' + v + (n === 0 ? ' stub' : ''), style: { height: pct + '%' } },
                        isActive && !locked ? h('div', { className: 'bar-drag-handle' }) : null
                      )
                    )
                  );
                })
              ),
              h('div', { className: 'x-axis-line' }),
              h('div', { className: 'x-labels-row' },
                VEHICLES.map(function(v){
                  var isActive = v === currKey && !allDone;
                  return h('div', { key: 'xl' + v, className: 'bar-x-label' + (isActive ? ' active' : '') }, t('content-ui.vehicle_names.' + v));
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
      h('div', { className: 'next-text' }, showNext ? t('standard-ui.instructions.tap_to_add_key') : t('content-ui.prompts.bar_remaining_2')),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps, h('span', { style: { pointerEvents: 'none' } }, '▶')),
        showNext ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: '' }) : null
      )
    )
  );
}
window.DrawBarsScreen = DrawBarsScreen;
