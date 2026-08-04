// AppletContainer.jsx — root orchestrator for the Cartesian-plane applet (22 screens).
(function(){
  var h = window.MiniReact.h;
  var useEffect = window.MiniReact.useEffect;

  var HEADING_KEYS = {
    1:'s1_heading', 2:'s2_heading', 3:'s3_heading', 4:'s4_heading', 5:'s5_heading', 6:'s6_heading',
    7:'s7_heading', 8:'s8_heading',
    9:'s9_heading', 10:'s10_heading', 11:'s11_heading', 12:'s12_heading',
    13:'s13_heading', 14:'s14_heading', 15:'s15_heading', 16:'s16_heading',
    17:'s17_heading', 18:'s18_heading', 19:'s19_heading', 20:'s20_heading',
    21:'s21_heading', 22:'s22_heading'
  };

  var INSTRUCTION_KEYS = {
    8:'s8_cta', 10:'s10_cta', 11:'s11_cta', 12:'s12_cta',
    13:'s13_cta', 18:'s18_cta'
  };

  // screen 8: per-quadrant sign-convention reveal data (tap-driven, all four shown cumulatively)
  var SIGN_QUADRANTS = {
    I:   { key:'P', signKey:'sign_I_text',   labelKey:'sign_I_point_label'   },
    II:  { key:'Q', signKey:'sign_II_text',  labelKey:'sign_II_point_label'  },
    III: { key:'R', signKey:'sign_III_text', labelKey:'sign_III_point_label' },
    IV:  { key:'S', signKey:'sign_IV_text',  labelKey:'sign_IV_point_label'  }
  };

  var QUADRANT_LABEL_KEYS = { I:'quadrant_I', II:'quadrant_II', III:'quadrant_III', IV:'quadrant_IV' };

  // screen 8: which screen corner each quadrant's explanation callout appears in
  var CALLOUT_POS = { I:'top-right', II:'top-left', III:'bottom-left', IV:'bottom-right' };

  // screen 9: short per-quadrant sign descriptions for the summary callouts
  var SIGN_BOX_KEYS = { I:'s9_box_qI', II:'s9_box_qII', III:'s9_box_qIII', IV:'s9_box_qIV' };

  function allCornerBadgeLabels(tLabel){
    return {
      I: tLabel(QUADRANT_LABEL_KEYS.I), II: tLabel(QUADRANT_LABEL_KEYS.II),
      III: tLabel(QUADRANT_LABEL_KEYS.III), IV: tLabel(QUADRANT_LABEL_KEYS.IV)
    };
  }

  function AppletContainer(props){
    var appData = props.appData || window.appData;
    var createI18n = window.i18n.createI18n;
    var i18n = appData ? createI18n(appData, 'en') : { t:function(k){ return k; } };
    var t = function(k, p){ return i18n.t('content-ui.screens.' + k, p); };
    var tLabel = function(k){ return i18n.t('content-ui.labels.' + k); };
    var tBtn = function(k){ return i18n.t('standard-ui.buttons.' + k); };

    window.useResponsiveLayout();
    var audio = window.useAudioFeedback();
    var app = window.useAppletState();
    var screen = app.screen;

    // short local auto-sub-sequence flag for the "reveal P then P(5,3)" style screens (14, 20)
    var labelStageS = window.MiniReact.useState(0);
    var labelStage = labelStageS[0], setLabelStage = labelStageS[1];

    useEffect(function(){
      if (screen === 14 || screen === 20){
        setLabelStage(0);
        var t1 = setTimeout(function(){ setLabelStage(1); }, 500);
        var t2 = setTimeout(function(){ setLabelStage(2); }, 1200);
        var t3 = setTimeout(function(){ app.next(); }, 2000);
        return function(){ clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
      }
    }, [screen]);

    function onTapAxis(which, end){
      audio.correct();
      app.drawAxis(which, end);
    }

    function onRevealQuadrantTap(qid){
      audio.correct();
      app.revealQuadrant(qid);
    }

    function onSelectQuadrant(qid){
      if (screen === 8){
        audio.correct();
        app.exploreQuadrantSign(qid);
        return;
      }
      var target = app.quadrantOf(app.currentPoint);
      app.selectQuadrant(qid);
      if (qid === target) audio.correct(); else audio.wrong();
    }

    function onDragXEnd(value){
      var target = app.currentPoint ? app.currentPoint.x : 5;
      if (value === target) audio.correct(); else audio.wrong();
      app.commitDragX(value);
    }

    function onDragYEnd(value){
      var target = app.currentPoint ? app.currentPoint.y : 3;
      if (value === target) audio.correct(); else audio.wrong();
      app.commitDragY(value);
    }

    function onChoosePoint(pt){
      audio.click();
      app.choosePoint(pt);
    }

    function onNext(){
      audio.swoosh();
      app.next();
    }

    function onExploreAgain(){
      audio.click();
      app.exploreAgain();
    }

    var headingKey = HEADING_KEYS[screen];
    var headingParams = app.currentPoint ? { x:app.currentPoint.x, y:app.currentPoint.y } : null;
    var heading = headingKey ? t(headingKey, headingParams) : '';
    var instructionKey = INSTRUCTION_KEYS[screen];
    var instruction = instructionKey ? t(instructionKey) : '';

    var view = deriveView(screen, app, labelStage, t, tLabel, onRevealQuadrantTap);
    var dragChildren = deriveDragChildren(screen, app, onDragXEnd, onDragYEnd);

    // 21 is explore-again only, 22 is terminal;
    // 1-2 (axis drawing) and 3-6 (quadrant reveal) auto-advance on tap with no Next fallback at all;
    // 12-14 and 18-20 (drag-to-locate + label reveal) auto-advance on correct drag, no Next either;
    // 16 (choose point) and 17 (generic quadrant select) auto-advance on selection, no Next;
    // 8 shows Next only once all four quadrant signs have been revealed (gated via canAdvance)
    var NO_NEXT_SCREENS = [1, 2, 3, 4, 5, 6, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22];
    var showNext = app.canAdvance && NO_NEXT_SCREENS.indexOf(screen) === -1;
    var showExploreAgain = screen === 21;

    if (screen === 22){
      return h('div', { className:'applet-root' },
        h('div', { className:'idle-screen' },
          h('div', { className:'idle-text-card' }, heading)
        )
      );
    }

    var rightCol = null;
    if (screen === 16){
      rightCol = h(window.PracticeList, { selectedPoint:app.selectedPoint, mode:'choose', onChoose:onChoosePoint });
    } else if (screen >= 17 && screen <= 21){
      rightCol = h(window.PracticeList, { selectedPoint:app.selectedPoint, mode:'display' });
    }

    return h('div', { className:'applet-root' },
      h('div', { className:'screen-layout' },
        h('div', { className:'screen-header' }, heading),
        h('div', { className:'screen-main' },
          h('div', { className:'grid-col' },
            h(window.CartesianGrid, {
              screen: screen,
              view: view,
              dragChildren: dragChildren,
              onTapAxis: onTapAxis,
              onSelectQuadrant: onSelectQuadrant
            }),
            h(window.Callout, { items: view.calloutItems })
          ),
          h('div', { className:'mcq-col' }, rightCol)
        ),
        h('div', { className:'screen-footer' },
          h('div', { className:'screen-instruction' }, instruction),
          showNext ? h('button', { className:'next-btn', onClick:onNext }, tBtn('next')) : null,
          showExploreAgain ? h('button', { className:'explore-again', onClick:onExploreAgain }, tBtn('explore_again')) : null
        )
      )
    );
  }

  // Pure function: screen + state -> CartesianGrid view-description object.
  function deriveView(screen, app, labelStage, t, tLabel, onRevealQuadrantTap){
    var view = {};
    var tapped = app.tapped;
    var cp = app.currentPoint;

    if (screen === 1){
      view.showAxisHotspots = true;
      view.xLeftTapped = !!tapped.xAxisLeft;
      view.xRightTapped = !!tapped.xAxisRight;
      view.showXAxis = !!tapped.xAxis;
      view.drawXAxis = !!tapped.xAxis;
      return view;
    }
    if (screen === 2){
      view.showXAxis = true;
      view.showYAxisHotspots = true;
      view.yTopTapped = !!tapped.yAxisTop;
      view.yBottomTapped = !!tapped.yAxisBottom;
      view.showYAxis = !!tapped.yAxis;
      view.drawYAxis = !!tapped.yAxis;
      return view;
    }

    // screens 3-6: full axes always visible, quadrants reveal one at a time anti-clockwise
    if (screen >= 3 && screen <= 6){
      view.showXAxis = true; view.showYAxis = true;
      var order = ['I', 'II', 'III', 'IV'];
      var revealed = [];
      for (var i = 0; i < order.length; i++){
        var qid = order[i];
        if (tapped['q' + qid]) revealed.push(qid);
      }
      view.revealedQuadrants = revealed;
      var revealMap = { 3:'I', 4:'II', 5:'III', 6:'IV' };
      var thisQid = revealMap[screen];
      if (!tapped['q' + thisQid]){
        view.pulsingQuadrant = thisQid;
        view.onQuadrantRevealTap = onRevealQuadrantTap;
      }
      return view;
    }

    // screen 7: all four quadrants shaded + numbered 1-4 with anti-clockwise direction arrows
    if (screen === 7){
      view.showXAxis = true; view.showYAxis = true;
      view.numberedQuadrants = ['I', 'II', 'III', 'IV'];
      view.numberingArrows = true;
      return view;
    }

    // screen 8: tap any/all quadrant ovals to reveal that quadrant's sign convention —
    // the tag moves outside the grid and the full sentence appears in a side callout,
    // cumulatively; Next stays hidden (see showNext) until all four are tapped
    if (screen === 8){
      view.showXAxis = true; view.showYAxis = true;
      view.cornerBadges = true;
      view.cornerBadgeLabels = allCornerBadgeLabels(tLabel);
      var revealedSigns = [];
      var calloutItems = [];
      var signLabels = [];
      var qids = ['I', 'II', 'III', 'IV'];
      for (var si = 0; si < qids.length; si++){
        var sqid = qids[si];
        if (tapped['sign' + sqid]){
          revealedSigns.push(sqid);
          var scfg = SIGN_QUADRANTS[sqid];
          calloutItems.push({ text:t(scfg.signKey), pos:CALLOUT_POS[sqid] });
          signLabels.push({ key:scfg.key, text:t(scfg.labelKey), pulse:true });
        }
      }
      var unrevealed = qids.filter(function(qid){ return revealedSigns.indexOf(qid) === -1; });
      view.tappableQuadrants = unrevealed;
      view.insideTagQuadrants = unrevealed;
      view.shadeQuadrants = revealedSigns;
      view.calloutItems = calloutItems;
      view.signLabels = signLabels;
      return view;
    }

    // screen 9: summary — all sign labels + all four corner sign boxes + short callouts at once
    if (screen === 9){
      view.showXAxis = true; view.showYAxis = true;
      view.cornerBadges = true;
      view.cornerBadgeLabels = allCornerBadgeLabels(tLabel);
      view.signLabels = [
        { key:'P', text:'P (x, y)' },
        { key:'Q', text:'Q (-x, y)' },
        { key:'R', text:'R (-x, - y)' },
        { key:'S', text:'S (x, - y)' }
      ];
      view.calloutItems = ['I', 'II', 'III', 'IV'].map(function(qid){
        return { text:t(SIGN_BOX_KEYS[qid]), pos:CALLOUT_POS[qid] };
      });
      return view;
    }

    // screen 10: practice — tap the quadrant of P(5,3). Wrong tap keeps that quadrant's
    // tag + all point labels red until the next tap; correct tap turns Quadrant I green.
    if (screen === 10){
      view.showXAxis = true; view.showYAxis = true;
      view.cornerBadges = true;
      view.cornerBadgeLabels = allCornerBadgeLabels(tLabel);
      var correct = app.quadrantResult === 'correct';
      var wrong = app.quadrantResult === 'incorrect';
      view.tappableQuadrants = correct ? [] : ['I', 'II', 'III', 'IV'];
      view.pulseQuadrantHitAreas = !correct;
      if (correct){
        view.activeQuadrant = app.selectedQuadrant; // turns green
        view.shadeQuadrant = app.selectedQuadrant;
        view.signLabels = [{ key:'P', text:'P (x, y)' }];
      } else if (wrong){
        // persist red feedback on all tags + all four point labels until retry
        view.teeterQuadrant = app.selectedQuadrant;
        view.teeterAllTags = true;
        view.signLabels = [
          { key:'P', text:'P (x, y)' }, { key:'Q', text:'Q (-x, y)' },
          { key:'R', text:'R (-x, - y)' }, { key:'S', text:'S (x, - y)' }
        ];
      }
      return view;
    }

    // screen 11: confirmation, QI highlighted green
    if (screen === 11){
      view.showXAxis = true; view.showYAxis = true;
      view.cornerBadges = true;
      view.cornerBadgeLabels = allCornerBadgeLabels(tLabel);
      view.activeQuadrant = 'I';
      view.shadeQuadrant = 'I';
      view.signLabels = [{ key:'P', text:'P (x, y)' }];
      return view;
    }

    // screen 12: drag x-pointer to 5
    if (screen === 12){
      view.showXAxis = true; view.showYAxis = true;
      view.singleQuadrantLabel = { qid:'I', label:tLabel('quadrant_I') };
      if (app.dragXLocked){
        view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = cp.x + ' units';
      }
      return view;
    }

    // screen 13: drag y-pointer to 3 (x already locked)
    if (screen === 13){
      view.showXAxis = true; view.showYAxis = true;
      view.singleQuadrantLabel = { qid:'I', label:tLabel('quadrant_I') };
      view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = cp.x + ' units';
      if (app.dragYLocked){
        view.guideY = cp.y; view.guideYAt = cp.x; view.guideYLabel = cp.y + ' units';
      }
      return view;
    }

    // screen 14: completion — show guides, then P, then P(5,3)
    if (screen === 14){
      view.showXAxis = true; view.showYAxis = true;
      view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = cp.x + ' units';
      view.guideY = cp.y; view.guideYAt = cp.x; view.guideYLabel = cp.y + ' units';
      if (labelStage >= 1){
        view.plottedPoint = { x:cp.x, y:cp.y, label: labelStage >= 2 ? (cp.label + ' (' + cp.x + ', ' + cp.y + ')') : cp.label, pulse:true };
      }
      return view;
    }

    // screen 15: plotted point complete
    if (screen === 15){
      view.showXAxis = true; view.showYAxis = true;
      view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = cp.x + ' units';
      view.guideY = cp.y; view.guideYAt = cp.x; view.guideYLabel = cp.y + ' units';
      view.plottedPoint = { x:cp.x, y:cp.y, label: cp.label + ' (' + cp.x + ', ' + cp.y + ')', pulse:true };
      return view;
    }

    // screen 16: independent practice — empty grid, point chosen via right-column list
    if (screen === 16){
      view.showXAxis = true; view.showYAxis = true;
      return view;
    }

    // screen 17: generic quadrant select for chosen point
    if (screen === 17){
      view.showXAxis = true; view.showYAxis = true;
      view.cornerBadges = true;
      view.cornerBadgeLabels = allCornerBadgeLabels(tLabel);
      var correct17 = app.quadrantResult === 'correct';
      var wrong17 = app.quadrantResult === 'incorrect';
      view.tappableQuadrants = correct17 ? [] : ['I', 'II', 'III', 'IV'];
      view.pulseQuadrantHitAreas = !correct17;
      if (correct17){
        view.activeQuadrant = app.selectedQuadrant;
        view.shadeQuadrant = app.selectedQuadrant;
      } else if (wrong17){
        view.teeterQuadrant = app.selectedQuadrant;
        view.teeterAllTags = true;
      }
      return view;
    }

    // screen 18: generic drag-x
    if (screen === 18){
      view.showXAxis = true; view.showYAxis = true;
      var qid18 = app.quadrantOf(cp);
      view.singleQuadrantLabel = { qid:qid18, label:tLabel(QUADRANT_LABEL_KEYS[qid18]) };
      if (app.dragXLocked){
        view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = Math.abs(cp.x) + ' units';
      }
      return view;
    }

    // screen 19: generic drag-y
    if (screen === 19){
      view.showXAxis = true; view.showYAxis = true;
      var qid19 = app.quadrantOf(cp);
      view.singleQuadrantLabel = { qid:qid19, label:tLabel(QUADRANT_LABEL_KEYS[qid19]) };
      view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = Math.abs(cp.x) + ' units';
      if (app.dragYLocked){
        view.guideY = cp.y; view.guideYAt = cp.x; view.guideYLabel = Math.abs(cp.y) + ' units';
      }
      return view;
    }

    // screen 20: generic completion sequence
    if (screen === 20){
      view.showXAxis = true; view.showYAxis = true;
      view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = Math.abs(cp.x) + ' units';
      view.guideY = cp.y; view.guideYAt = cp.x; view.guideYLabel = Math.abs(cp.y) + ' units';
      if (labelStage >= 1){
        view.plottedPoint = { x:cp.x, y:cp.y, label: labelStage >= 2 ? (cp.label + ' (' + cp.x + ', ' + cp.y + ')') : cp.label, pulse:true };
      }
      return view;
    }

    // screen 21: generic plotted complete
    if (screen === 21){
      view.showXAxis = true; view.showYAxis = true;
      view.guideX = cp.x; view.guideXTo = 0; view.guideXLabel = Math.abs(cp.x) + ' units';
      view.guideY = cp.y; view.guideYAt = cp.x; view.guideYLabel = Math.abs(cp.y) + ' units';
      view.plottedPoint = { x:cp.x, y:cp.y, label: cp.label + ' (' + cp.x + ', ' + cp.y + ')', pulse:true };
      return view;
    }

    view.showXAxis = true; view.showYAxis = true;
    return view;
  }

  function deriveDragChildren(screen, app, onDragXEnd, onDragYEnd){
    var h = window.MiniReact.h;
    var cp = app.currentPoint;
    var children = [];

    if (screen === 12 || screen === 18){
      children.push(h(window.DragPointer, {
        axis:'x', value: app.dragX, locked: app.dragXLocked,
        teetering: app.teeter === 'x', pulse: !app.dragXLocked, color:'green', onDragEnd: onDragXEnd
      }));
    }
    if (screen === 13 || screen === 19){
      // x stays locked in place (rendered as a static plotted reference), y pointer is draggable
      var lockedX = cp ? cp.x : 5;
      children.push(h(window.DragPointer, {
        axis:'x', value: lockedX, locked:true, color:'green', onDragEnd: function(){}
      }));
      children.push(h(window.DragPointer, {
        axis:'y', value: app.dragY, lockedAt: lockedX, locked: app.dragYLocked,
        teetering: app.teeter === 'y', pulse: !app.dragYLocked, color:'pink', onDragEnd: onDragYEnd
      }));
    }
    return children;
  }

  window.AppletContainer = AppletContainer;
})();
