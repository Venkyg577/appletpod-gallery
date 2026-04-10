function getLocaleFromDocument(){
  try {
    var lang = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) ? document.documentElement.lang : 'en';
    var lower = (lang || 'en').toLowerCase();
    if (lower.indexOf('id') === 0) return 'id-ID';
    if (lower.indexOf('fil') === 0 || lower === 'tl') return 'fil';
    return 'en';
  } catch (e) {
    return 'en';
  }
}

function AppletContainer(props){
  var appData = props.appData || (typeof window !== 'undefined' && window.appData);
  var h = window.MiniReact.h;
  var useResponsiveLayout = window.useResponsiveLayout;
  var useAppletState = window.useAppletState;
  var createI18n = window.i18n.createI18n;

  useResponsiveLayout();
  var appState = useAppletState();

  var i18n = appData ? createI18n(appData, getLocaleFromDocument()) : { t: function(k){ return k; } };
  var t = function(key, placeholders){ return i18n.t(key, placeholders); };

  // Build parallel bulbs array from switches
  var parallelBulbs = appState.parallelSwitches;

  return h('div', { className: 'applet-root single-page-root' },
    // Title
    h('div', { className: 'page-title' }, t('content-ui.dialogs.page_title')),

    // Main content: left panel + center controls + right panel
    h('div', { className: 'main-content' },
      // Left: Parallel Circuit (matches reference diagram)
      h('div', { className: 'panel-wrapper panel-wrapper--left' },
        h(window.ParallelCircuitPanel, {
          t: t,
          bulbs: parallelBulbs,
          onToggleBulb: appState.toggleParallelBulb
        })
      ),

      // Center: Bulb count control
      h('div', { className: 'center-controls' },
        h(window.BulbCountControl, {
          t: t,
          bulbCount: appState.bulbCount,
          onAdd: appState.addBulb,
          onRemove: appState.removeBulb
        })
      ),

      // Right: Series Circuit (matches reference diagram)
      h('div', { className: 'panel-wrapper panel-wrapper--right' },
        h(window.SeriesCircuitPanel, {
          t: t,
          bulbCount: appState.bulbCount,
          masterOn: appState.seriesMasterOn,
          onToggleMaster: appState.toggleSeriesMaster
        })
      )
    ),

    // Description row
    h('div', { className: 'panel-descriptions' },
      h('div', { className: 'panel-desc panel-desc--left' },
        h('p', { className: 'desc-main' }, t('content-ui.dialogs.parallel_voltage_desc')),
        h('p', { className: 'desc-detail' }, t('content-ui.dialogs.parallel_brightness_desc'))
      ),
      h('div', { className: 'panel-desc-spacer' }),
      h('div', { className: 'panel-desc panel-desc--right' },
        h('p', { className: 'desc-main' }, t('content-ui.dialogs.series_voltage_desc')),
        h('p', { className: 'desc-detail' }, t('content-ui.dialogs.series_brightness_desc'))
      )
    ),

    // Bottom takeaway
    h('div', { className: 'page-takeaway' }, t('content-ui.dialogs.page_takeaway'))
  );
}
window.AppletContainer = AppletContainer;
