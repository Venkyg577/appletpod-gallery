function PlotPictogramScreen(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var onPrev = props.onPrev || function(){};
  var state = props.state;
  var layout = props.layout;
  var PictogramTable = window.PictogramTable;
  var VEHICLES = window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];
  var COUNTS = window.VEHICLE_COUNTS || { bus: 5, car: 10, cycle: 3, bike: 7, tractor: 5 };
  var SLOTS_PER_COL = 10;
  var audio = window.useAudioFeedback ? window.useAudioFeedback() : { click: function(){}, correct: function(){}, wrong: function(){} };

  // Row mode reuses this screen for the horizontal pictograph on its own independent state.
  // The storyboard asks for only one or two rows there, not a full repeat of all five.
  var rowMode = props.rowMode === true;
  var REQUIRED = rowMode ? 2 : VEHICLES.length;

  var idx = state ? (rowMode ? state.rowPlotColumnIndex : state.plotColumnIndex) : 0;
  if (idx < 0 || idx >= VEHICLES.length) idx = 0;
  var currKey = VEHICLES[idx];
  var expectedCount = COUNTS[currKey];

  var placedByVehicle = state ? (rowMode ? state.rowPlacedByVehicle : state.placedByVehicle) : { bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 };
  var setPlacedByVehicle = state ? (rowMode ? state.setRowPlacedByVehicle : state.setPlacedByVehicle) : function(){};
  var lockedVehicles = state ? (rowMode ? state.rowLockedVehicles : state.lockedVehicles) : [];
  var setLockedVehicles = state ? (rowMode ? state.setRowLockedVehicles : state.setLockedVehicles) : function(){};
  var setPlotColumnIndex = state ? (rowMode ? state.setRowPlotColumnIndex : state.setPlotColumnIndex) : function(){};
  var checkResult = state ? (rowMode ? state.rowPlotCheckResult : state.plotCheckResult) : null;
  var setCheckResult = state ? (rowMode ? state.setRowPlotCheckResult : state.setPlotCheckResult) : function(){};

  var inCurr = placedByVehicle[currKey] || 0;
  // Every required vehicle must be locked at its exact count — not merely "enough locks".
  var allDone = VEHICLES.slice(0, REQUIRED).every(function(v){
    return lockedVehicles.indexOf(v) >= 0 && (placedByVehicle[v] || 0) === COUNTS[v];
  });

  function repl(str, vehicle, count){
    var name = vehicle ? t('content-ui.vehicle_names.' + vehicle) : '';
    var plural = vehicle ? t('content-ui.vehicle_names_plural.' + vehicle) : '';
    return (str || '')
      .replace(/\{vehicle_plural\}/g, plural)
      .replace(/\{vehicle\}/g, name)
      .replace(/\{count\}/g, count != null ? String(count) : '');
  }

  function handleDragOver(e){
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  }

  // Drop a vehicle picture into a column.
  function handleDrop(colKey, e){
    e.preventDefault();
    if (lockedVehicles.indexOf(colKey) >= 0) return;
    var raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    var payload;
    try { payload = JSON.parse(raw); } catch (err) { return; }
    var draggedVehicle = payload.vehicle;
    var fromColumn = payload.fromColumn;

    // Dragging a placed picture back to the tray is handled by the tray's own drop target.
    if (fromColumn) return;

    // Wrong column: only the active column accepts drops.
    if (colKey !== currKey) {
      setCheckResult({ type: 'wrong_column', wrongKey: colKey });
      audio.wrong();
      return;
    }
    // Wrong vehicle for this column.
    if (draggedVehicle !== currKey) {
      setCheckResult({ type: 'wrong_vehicle', wrongKey: colKey });
      audio.wrong();
      return;
    }
    if (inCurr >= expectedCount) {
      setCheckResult({ type: 'too_many' });
      audio.wrong();
      return;
    }
    audio.click();
    setCheckResult(null);
    setPlacedByVehicle(function(prev){
      var n = Object.assign({}, prev);
      n[colKey] = (n[colKey] || 0) + 1;
      if (n[colKey] === expectedCount) {
        setCheckResult({ type: 'correct' });
        audio.correct();
        setLockedVehicles(function(pv){
          return pv.indexOf(colKey) >= 0 ? pv : pv.concat([colKey]);
        });
        var nextIdx = VEHICLES.indexOf(colKey) + 1;
        if (nextIdx < REQUIRED) {
          setTimeout(function(){
            setPlotColumnIndex(nextIdx);
            setCheckResult(null);
          }, 2400);
        }
      }
      return n;
    });
  }

  // Drop a placed picture back onto the tray to remove it (storyboard screen 13).
  function handleTrayDrop(e){
    e.preventDefault();
    var raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    var payload;
    try { payload = JSON.parse(raw); } catch (err) { return; }
    if (!payload.fromColumn) return;
    var colKey = payload.fromColumn;
    if (lockedVehicles.indexOf(colKey) >= 0) return;
    audio.click();
    setCheckResult(null);
    setPlacedByVehicle(function(prev){
      var n = Object.assign({}, prev);
      n[colKey] = Math.max(0, (n[colKey] || 0) - 1);
      return n;
    });
  }

  var checkType = checkResult ? checkResult.type : null;
  var vertical = layout === 'vertical';

  var noteClass = checkType === 'correct' ? ' ok' : (checkType ? ' error' : ' placeholder');
  var noteText = '';
  if (checkType === 'wrong_vehicle' || checkType === 'wrong_column') noteText = repl(t('content-ui.feedback.plot_wrong_vehicle'), currKey);
  else if (checkType === 'too_many') noteText = repl(t('content-ui.feedback.plot_too_many'), currKey, expectedCount);
  else if (checkType === 'correct') noteText = repl(t('content-ui.feedback.plot_column_complete'), currKey);

  var nextBtnProps = { className: 'next-btn', onClick: function(){ audio.click(); onNext(); } };
  if (!allDone) nextBtnProps.disabled = 'disabled';

  // Footer guidance follows the storyboard's per-state wording.
  var footerText;
  if (allDone) footerText = t('standard-ui.instructions.tap_to_add_title');
  else if (checkType === 'too_many') footerText = t('standard-ui.instructions.drag_back_bus');
  else if (idx === 0 && inCurr === 0) footerText = t('content-ui.prompts.plot_intro_2');
  else footerText = repl(t('content-ui.prompts.plot_continue'), currKey, expectedCount);

  function vehicleImg(vKey, extraClass){
    return h('img', {
      className: 'vehicle-img' + (extraClass ? ' ' + extraClass : ''),
      src: 'assets/images/' + vKey + '.png',
      alt: t('content-ui.vehicle_names.' + vKey),
      draggable: false
    });
  }

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.plot_intro_1')),
    h('div', { className: 'screen-main screen-main--split-60-40' },
      h('div', { className: 'screen-left' },
        h('div', { className: 'feedback-slot' },
          h('div', { className: 'note-box' + noteClass, role: noteClass && noteClass !== ' placeholder' ? 'status' : undefined, 'aria-live': noteClass && noteClass !== ' placeholder' ? 'polite' : undefined },
            noteText ? h('div', { className: 'note-text' }, noteText) : null
          )
        ),
        h('div', { className: 'left-bottom' },
          h('div', { className: 'side-table-wrap' },
            PictogramTable ? h(PictogramTable, { t: t, highlightVehicle: idx + 1, lockedVehicles: lockedVehicles }) : null
          ),
          // Draggable source tray of vehicle pictures.
          h('div', {
            className: 'vehicle-tray',
            onDrop: handleTrayDrop,
            onDragOver: handleDragOver
          },
            VEHICLES.map(function(v){
              return h('div', {
                key: 'tray-' + v,
                className: 'tray-item' + (v === currKey && !allDone ? ' pulse' : ''),
                draggable: !allDone,
                onDragStart: !allDone ? function(ev){
                  ev.dataTransfer.setData('text/plain', JSON.stringify({ vehicle: v, fromColumn: null }));
                } : undefined
              }, vehicleImg(v));
            })
          )
        )
      ),
      h('div', { className: 'screen-right' },
        h('div', { className: 'right-panel' },
          h('div', { className: 'populate-right-grid' + (vertical ? '' : ' horizontal') },
            VEHICLES.map(function(ck){
              var n = placedByVehicle[ck] || 0;
              var locked = lockedVehicles.indexOf(ck) >= 0;
              var isActive = ck === currKey && !allDone;
              var beyondRequired = rowMode && VEHICLES.indexOf(ck) >= REQUIRED;
              var wrongKey = checkResult && checkResult.wrongKey;
              var isWrong = ((checkType === 'wrong_vehicle' || checkType === 'wrong_column') && wrongKey === ck) || (checkType === 'too_many' && ck === currKey);
              return h('div', {
                key: ck,
                className: 'populate-col' + (vertical ? '' : ' populate-row') + (locked ? ' locked' : '') + (isActive ? ' active' : '') + (isWrong ? ' wrong-col' : '') + (beyondRequired ? ' beyond-required' : '')
              },
                vertical ? null : h('div', { className: 'right-label-pill' }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.vehicle_names.' + ck))),
                h('div', {
                  className: 'populate-col-body' + (vertical ? '' : ' populate-row-body'),
                  onDrop: (function(colKey){ return function(e){ handleDrop(colKey, e); }; })(ck),
                  onDragOver: handleDragOver
                },
                  (function(){
                    var out = [];
                    for (var i = 0; i < SLOTS_PER_COL; i++) {
                      var filled = vertical ? (i >= SLOTS_PER_COL - n) : (i < n);
                      out.push(h('div', {
                        key: i,
                        className: 'icon-in-column' + (vertical ? '' : ' icon-in-row'),
                        draggable: filled && !locked,
                        onDragStart: (filled && !locked) ? (function(colKey){
                          return function(ev){
                            ev.dataTransfer.setData('text/plain', JSON.stringify({ vehicle: colKey, fromColumn: colKey }));
                          };
                        })(ck) : undefined
                      }, filled ? vehicleImg(ck) : null));
                    }
                    return out;
                  })()
                ),
                vertical ? h('div', { className: 'right-label-pill' }, h('span', { style: { pointerEvents: 'none' } }, t('content-ui.vehicle_names.' + ck))) : null
              );
            })
          )
        )
      )
    ),
    h('div', { className: 'next-row' },
      h('button', { className: 'prev-btn', onClick: onPrev }, h('span', { style: { pointerEvents: 'none' } }, '◀')),
      h('div', { className: 'next-text' }, footerText),
      h('div', { className: 'buttons', style: { position: 'relative' } },
        h('button', nextBtnProps, h('span', { style: { pointerEvents: 'none' } }, '▶')),
        allDone ? h('img', { className: 'tap-indicator', src: 'assets/finger tap.gif', alt: '' }) : null
      )
    )
  );
}
window.PlotPictogramScreen = PlotPictogramScreen;
