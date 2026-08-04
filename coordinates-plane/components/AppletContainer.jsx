// AppletContainer.jsx — root. Wires hooks, owns the auto-timed sub-step advancement,
// derives callouts/tags from the active concept, and routes intro/explore/practice.
(function(){
  var h = window.MiniReact.h;
  var useEffect = window.MiniReact.useEffect;

  var SUBSTEP_MS = 3200;        // dwell per auto-timed sub-state
  var SETTLE_MS  = 800;         // pause before unlocking next concept

  function AppletContainer(props){
    var appData = props.appData || window.appData;
    var createI18n = window.i18n.createI18n;

    window.useResponsiveLayout();
    var audio = window.useAudioFeedback();
    var app = window.useAppletState();

    var i18n = appData ? createI18n(appData, 'en') : { t:function(k){ return k; } };
    var t = function(k, p){ return i18n.t(k, p); };

    // --- auto-timed sub-step chain for the active concept ---
    useEffect(function(){
      if (app.phase !== 'explore' || app.activeIndex == null) return;
      var concept = app.concepts[app.activeIndex];
      var lastSub = concept.subSteps - 1;
      var timer;
      if (app.subStep < lastSub){
        timer = setTimeout(function(){
          audio.swoosh();
          app.advanceSubStep();
        }, SUBSTEP_MS);
      } else {
        // final sub-state: settle, then complete + unlock next
        timer = setTimeout(function(){
          app.finishConcept();
        }, SUBSTEP_MS + SETTLE_MS);
      }
      return function(){ if (timer) clearTimeout(timer); };
    }, [app.phase, app.activeIndex, app.subStep]);

    function onSelectConcept(i){ audio.click(); app.selectConcept(i); }
    function onSelectPoint(x, y){ audio.correct(); app.selectPoint(x, y); }
    function onExploreAgain(){ audio.click(); app.reset(); }
    function onStartPractice(){ audio.swoosh(); app.startPractice(); }

    // --------- derive callouts + region tags from concept/sub ----------
    function callouts(){
      var c = app.activeConcept, s = app.subStep;
      if (app.phase === 'practice') return [{ text: t('content-ui.practice.prompt'), pos:'header' }];
      if (!c) return [];
      var defs = [];
      switch (c){
        case 'plane': defs.push({ text:t('content-ui.def.plane'), pos:'top-right' }); break;
        case 'xaxis':
          if (s === 0) defs.push({ text:t('content-ui.def.xaxis'), pos:'top-right' });
          else if (s === 1) defs.push({ text:t('content-ui.def.pos_xaxis'), pos:'top-right' });
          else defs.push({ text:t('content-ui.def.neg_xaxis'), pos:'top-left' });
          break;
        case 'yaxis':
          if (s === 0) defs.push({ text:t('content-ui.def.yaxis'), pos:'top-right' });
          else if (s === 1) defs.push({ text:t('content-ui.def.pos_yaxis'), pos:'top-right' });
          else defs.push({ text:t('content-ui.def.neg_yaxis'), pos:'bottom-left' });
          break;
        case 'origin': defs.push({ text:t('content-ui.def.origin'), pos:'top-right' }); break;
        case 'coordinates':
          defs.push({ text:t('content-ui.def.coordinates'), pos:'top-right' });
          defs.push({ text:t('content-ui.def.origin_coords'), pos:'bottom-right', wide:true });
          break;
        case 'xcoord':
          if (s === 0){
            defs.push({ text:t('content-ui.def.xcoord_def'), pos:'top-right' });
            defs.push({ text:t('content-ui.def.pos_xcoord'), pos:'bottom-right' });
          } else if (s === 1){
            defs.push({ text:t('content-ui.def.xcoord_def'), pos:'top-right' });
            defs.push({ text:t('content-ui.def.neg_xcoord'), pos:'bottom-left' });
          } else { defs.push({ text:t('content-ui.def.xaxis_rule'), pos:'top-right' }); }
          break;
        case 'ycoord':
          if (s === 0){
            defs.push({ text:t('content-ui.def.ycoord_def'), pos:'top-right' });
            defs.push({ text:t('content-ui.def.pos_ycoord'), pos:'bottom-right' });
          } else if (s === 1){
            defs.push({ text:t('content-ui.def.ycoord_def'), pos:'top-right' });
            defs.push({ text:t('content-ui.def.neg_ycoord'), pos:'bottom-left' });
          } else { defs.push({ text:t('content-ui.def.yaxis_rule'), pos:'top-right' }); }
          break;
      }
      return defs;
    }

    // region pill tags (Positive/Negative x-axis etc.)
    function regionTags(){
      var c = app.activeConcept, s = app.subStep, tags = [];
      if (c === 'xaxis' && s === 1) tags.push({ text:t('content-ui.tags.pos_xaxis'), kind:'pos-x' });
      if (c === 'xaxis' && s === 2){ tags.push({ text:t('content-ui.tags.neg_xaxis'), kind:'neg-x' }); tags.push({ text:t('content-ui.tags.pos_xaxis'), kind:'pos-x', muted:true }); }
      if (c === 'yaxis' && s === 1) tags.push({ text:t('content-ui.tags.pos_yaxis'), kind:'pos-y' });
      if (c === 'yaxis' && s === 2){ tags.push({ text:t('content-ui.tags.neg_yaxis'), kind:'neg-y' }); tags.push({ text:t('content-ui.tags.pos_yaxis'), kind:'pos-y', muted:true }); }
      return tags;
    }

    function regionTagEls(){
      return regionTags().map(function(tag, i){
        var cls = 'region-tag region-tag--' + tag.kind + (tag.muted ? ' region-tag--muted' : '');
        return h('div', { className:cls, key:'rt'+i }, tag.text);
      });
    }

    // hand pointer target: when idle (no active animation) point at next unlocked concept
    function handTarget(){
      if (app.phase !== 'explore') return null;
      if (app.activeIndex != null) return null; // animation running, no hand
      // point at the highest unlocked, not-yet-completed concept
      for (var i = 0; i <= app.unlockedIndex; i++){
        if (!app.completed[app.concepts[i].key]) return i;
      }
      return null;
    }

    // ------------------------------ render ------------------------------
    var practice = app.phase === 'practice';
    var showPracticeCta = app.phase === 'explore' && app.allConceptsDone;

    var headerText = practice ? t('content-ui.practice.prompt') : t('content-ui.intro.title');

    return h('div', { className:'applet-root' },
      h('div', { className:'screen-layout' },
        h('div', { className:'screen-header' }, headerText),
        h('div', { className:'screen-main' },
          // left menu (hidden during practice)
          practice ? null : h('div', { className:'menu-col' },
            h(window.ConceptMenu, {
              t:t,
              concepts: app.concepts,
              unlockedIndex: app.unlockedIndex,
              activeIndex: app.activeIndex,
              completed: app.completed,
              handTargetIndex: handTarget(),
              onSelect: onSelectConcept
            })
          ),
          // grid + overlays
          h('div', { className:'grid-col' + (practice ? ' grid-col--practice' : '') },
            h(window.CoordinatePlane, {
              activeConcept: app.activeConcept,
              subStep: app.subStep,
              completed: app.completed,
              practice: practice,
              selectedPoint: app.selectedPoint,
              onSelectPoint: onSelectPoint
            }),
            h(window.Callout, { items: callouts().filter(function(c){ return c.pos !== 'header'; }) }),
            regionTagEls(),
            // bottom-right CTA / hint
            (!practice && app.activeIndex == null && app.unlockedIndex === 0 && !app.completed.plane)
              ? h('div', { className:'cta-hint' }, t('standard-ui.instructions.tap_term'))
              : null,
            showPracticeCta
              ? h('button', { className:'practice-cta', onClick:onStartPractice }, '▶')
              : null
          )
        )
      ),
      practice
        ? h('button', { className:'explore-again', onClick:onExploreAgain }, t('standard-ui.buttons.start_over'))
        : null
    );
  }

  window.AppletContainer = AppletContainer;
})();
