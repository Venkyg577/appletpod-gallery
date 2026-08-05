// mini-react has no reconciliation: every parent re-render remounts this component with a
// fresh hooks array, so useEffect([]) would re-fire and re-schedule these timers repeatedly.
// This module-level guard survives remounts so the sequence runs exactly once per visit.
window.__rotateTransitionStarted = false;
window.__rotateTransitionRotated = false;

function RotateTransitionScreen(props){
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;
  var t = props.t || function(k){ return k; };
  var onNext = props.onNext || function(){};
  var labelOrder = props.labelOrder || window.VEHICLE_ORDER || ['bus', 'car', 'cycle', 'bike', 'tractor'];
  var COUNTS = window.VEHICLE_COUNTS || { bus: 5, car: 10, cycle: 3, bike: 7, tractor: 5 };

  // `rotated` must live outside component state: a useState flag would be reset by the
  // remount that setting it triggers, making the layout flick back to its pre-rotation form.
  var tickState = useState(0);
  var setTick = tickState[1];
  var rotated = window.__rotateTransitionRotated;

  if (!window.__rotateTransitionStarted) {
    window.__rotateTransitionStarted = true;
    window.__rotateTransitionRotated = false;
    setTimeout(function(){
      window.__rotateTransitionRotated = true;
      setTick(function(n){ return n + 1; });
    }, 900);
    setTimeout(function(){
      window.__rotateTransitionStarted = false;
      window.__rotateTransitionRotated = false;
      onNext();
    }, 3600);
  }

  return h('div', { className: 'screen-layout', style: { position: 'relative' } },
    h('div', { className: 'screen-header' }, t('content-ui.prompts.structure_horizontal_1')),
    h('div', { className: 'screen-main', style: { justifyContent: 'center', alignItems: 'center' } },
      h('div', { className: 'rotate-transition-wrap' + (rotated ? ' rotated' : '') },
        h('div', { className: 'populate-right-grid' + (rotated ? ' horizontal' : '') },
          labelOrder.map(function(v){
            var n = COUNTS[v];
            return h('div', { key: v, className: 'populate-col' + (rotated ? ' populate-row locked' : ' locked') },
              rotated ? h('div', { className: 'right-label-pill' }, t('content-ui.vehicle_names.' + v)) : null,
              h('div', { className: 'populate-col-body' + (rotated ? ' populate-row-body' : '') },
                (function(){
                  var out = [];
                  for (var i = 0; i < n; i++) {
                    out.push(h('div', { key: i, className: 'icon-in-column' + (rotated ? ' icon-in-row' : '') },
                      h('img', {
                        className: 'vehicle-img',
                        src: 'assets/images/' + v + '.png',
                        alt: t('content-ui.vehicle_names.' + v),
                        draggable: false
                      })
                    ));
                  }
                  return out;
                })()
              ),
              !rotated ? h('div', { className: 'right-label-pill' }, t('content-ui.vehicle_names.' + v)) : null
            );
          })
        )
      )
    )
  );
}
window.RotateTransitionScreen = RotateTransitionScreen;
