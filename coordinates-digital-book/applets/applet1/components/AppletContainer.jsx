// AppletContainer.jsx — root. Wires hooks, derives header/instruction/feedback text from
// the current phase, renders the FloorPlan stage, the right-side panel (Grid button +
// feedback callout), and routes pin-place / grid-tap / label-reveal actions through audio.
(function(){
  var h = window.MiniReact.h;

  function AppletContainer(props){
    var appData = props.appData || window.appData;
    var createI18n = window.i18n.createI18n;

    window.useResponsiveLayout();
    var audio = window.useAudioFeedback();
    var app = window.useAppletState();

    var i18n = appData ? createI18n(appData, 'en') : { t:function(k){ return k; } };
    var t = function(k, p){ return i18n.t(k, p); };

    var phase = app.phase;

    // -------- derive header / instruction text per phase --------
    function headerText(){
      switch (phase){
        case 'placing':   return app.placedCount === 0
                            ? t('content-ui.headers.placing_intro')
                            : t('content-ui.headers.placing');
        case 'allPlaced': return t('content-ui.headers.all_placed');
        case 'grid':      return app.revealedCount === 0
                            ? t('content-ui.headers.grid')
                            : t('content-ui.headers.labeling');
        case 'done':      return t('content-ui.headers.done');
      }
      return '';
    }
    function instructionText(){
      switch (phase){
        case 'placing':   return app.placedCount === 0
                            ? t('content-ui.instructions.placing_intro')
                            : t('content-ui.instructions.placing');
        case 'allPlaced': return t('content-ui.instructions.tap_grid');
        case 'grid':      return app.revealedCount === 0
                            ? t('content-ui.instructions.tap_point')
                            : t('content-ui.instructions.tap_name');
        case 'done':      return '';
      }
      return '';
    }

    // -------- actions (wrapped with audio) --------
    function onPlace(id){ audio.correct(); app.placePin(id); }
    function onReveal(id){ audio.correct(); app.revealLabel(id); }
    function onGrid(){ audio.swoosh(); app.tapGrid(); }
    function onReset(){ audio.click(); app.reset(); }

    // -------- right-side panel callouts --------
    function panelCallouts(){
      var items = [];
      if (app.feedback){
        items.push({ text: t('content-ui.feedback.' + app.feedback), pos:'panel', tone:'good' });
      }
      if (phase === 'grid'){
        items.push({ text: t('content-ui.callouts.grid_helps'), pos:'panel' });
      }
      return items;
    }

    var calloutEls = panelCallouts().map(function(c, i){
      var cls = 'panel-callout' + (c.tone ? ' panel-callout--' + c.tone : '');
      var lines = String(c.text).split('\n');
      var kids = [];
      lines.forEach(function(ln, j){ if (j>0) kids.push(h('br', {})); kids.push(ln); });
      return h('div', { className: cls, key:'pc'+i }, kids);
    });

    // -------- render --------
    return h('div', { className:'applet-root' },
      (phase === 'placing' && app.activeId)
        ? h(window.DragHint, { active: true, key: app.activeId })
        : null,
      h('div', { className:'screen-layout' },
        h('div', { className:'screen-header' }, headerText()),
        h('div', { className:'screen-main' },
          // floor plan stage
          h('div', { className:'stage-col' },
            h(window.FloorPlan, { state: app, onReveal: onReveal })
          ),
          // right control panel
          h('div', { className:'panel-col' },
            calloutEls,
            // draggable pin tray (placing phase, while a target is active)
            (phase === 'placing' && app.activeId)
              ? h(window.TrayPin, { activeId: app.activeId, onPlace: onPlace })
              : null,
            (phase === 'allPlaced')
              ? h('button', { className:'grid-btn', onClick:onGrid }, t('standard-ui.buttons.grid'))
              : null,
            (phase === 'done')
              ? h('button', { className:'explore-again', onClick:onReset }, t('standard-ui.buttons.explore_again'))
              : null
          )
        ),
        h('div', { className:'screen-footer' }, instructionText())
      )
    );
  }

  window.AppletContainer = AppletContainer;
})();
