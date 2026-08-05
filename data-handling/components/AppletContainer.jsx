function AppletContainer(props){
  var appData = props.appData || (typeof window !== 'undefined' && window.appData);
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;
  var createI18n = window.i18n.createI18n;
  var useResponsiveLayout = window.useResponsiveLayout;
  var useAudioFeedback = window.useAudioFeedback;
  var useAppletState = window.useAppletState;

  var RepresentationScreen = window.RepresentationScreen;
  var OrientationScreen = window.OrientationScreen;
  var StructureScreen = window.StructureScreen;
  var LabelsScreen = window.LabelsScreen;
  var PlotPictogramScreen = window.PlotPictogramScreen;
  var PictographTitleScreen = window.PictographTitleScreen;
  var XAxisScreen = window.XAxisScreen;
  var YAxisScaleScreen = window.YAxisScaleScreen;
  var DrawBarsScreen = window.DrawBarsScreen;
  var BarGraphTitleScreen = window.BarGraphTitleScreen;

  useResponsiveLayout();
  var audio = useAudioFeedback();
  var appState = useAppletState();

  var i18n = appData ? createI18n(appData, 'en') : { t: function(k){ return k; } };
  var t = function(key){ return i18n.t(key); };

  var stages = [
    'representation',    // 1
    'orientation',        // 2
    'structure',           // 3 (vertical columns)
    'labels',               // 4
    'plotPictograph',      // 5
    'pictographTitle',     // 6
    'rows',                  // 7 (horizontal rows, reuses StructureScreen)
    'rowLabels',            // 8 (label the rows, reuses LabelsScreen horizontally)
    'plotRows',             // 9 (drag pictures into rows, reuses PlotPictogramScreen)
    'backToMenu',           // 10
    'xAxis',                  // 11
    'yAxisScale',            // 12
    'drawBars',               // 13
    'barGraphTitle',         // 14
    'exitMenu'                // 15
  ];
  var stageState = useState('representation');
  var stage = stageState[0];
  var setStage = stageState[1];
  var istage = stages.indexOf(stage);
  if (istage < 0) istage = 0;

  function goTo(name){ setStage(name); }
  function goNext(){ setStage(stages[Math.min(istage + 1, stages.length - 1)]); }
  function goPrev(){ audio.click(); setStage(stages[Math.max(istage - 1, 0)]); }
  function goStartOver(){ audio.click(); appState.reset(); setStage('representation'); }

  function onRepresentationSelect(key){
    if (stage === 'representation' && key === 'pictograph') goTo('orientation');
    else if (stage === 'backToMenu' && key === 'bargraph') goTo('xAxis');
  }

  var child = null;
  if (stage === 'representation') {
    child = h(RepresentationScreen, { t: t, onNext: onRepresentationSelect, enabledOption: 'pictograph', isFirstVisit: true });
  } else if (stage === 'orientation') {
    child = h(OrientationScreen, { t: t, onNext: function(){ goTo('structure'); }, setLayout: appState.setLayout });
  } else if (stage === 'structure') {
    child = h(StructureScreen, {
      t: t, onNext: function(){ goTo('labels'); }, onPrev: goPrev,
      layout: appState.layout, structureCount: appState.structureCount, setStructureCount: appState.setStructureCount
    });
  } else if (stage === 'labels') {
    child = h(LabelsScreen, {
      t: t, onNext: function(){ goTo('plotPictograph'); }, onPrev: goPrev,
      layout: appState.layout, labelOrder: appState.labelOrder, setLabelOrder: appState.setLabelOrder
    });
  } else if (stage === 'plotPictograph') {
    child = h(PlotPictogramScreen, {
      t: t, onNext: function(){ goTo('pictographTitle'); }, onPrev: goPrev,
      layout: appState.layout, state: appState
    });
  } else if (stage === 'pictographTitle') {
    child = h(PictographTitleScreen, {
      t: t, onNext: function(){ goTo('rows'); }, onPrev: goPrev,
      layout: appState.layout, selectedTitle: appState.pictographTitle, setSelectedTitle: appState.setPictographTitle,
      labelOrder: appState.labelOrder
    });
  } else if (stage === 'rows') {
    child = h(StructureScreen, {
      t: t, onNext: function(){ goTo('rowLabels'); }, onPrev: goPrev,
      layout: 'horizontal', structureCount: appState.rowCount, setStructureCount: appState.setRowCount
    });
  } else if (stage === 'rowLabels') {
    child = h(LabelsScreen, {
      t: t, onNext: function(){ goTo('plotRows'); }, onPrev: goPrev,
      layout: 'horizontal', labelOrder: appState.rowLabelOrder, setLabelOrder: appState.setRowLabelOrder
    });
  } else if (stage === 'plotRows') {
    child = h(PlotPictogramScreen, {
      t: t, onNext: function(){ goTo('backToMenu'); }, onPrev: goPrev,
      layout: 'horizontal', state: appState, rowMode: true
    });
  } else if (stage === 'backToMenu') {
    child = h(RepresentationScreen, { t: t, onNext: onRepresentationSelect, enabledOption: 'bargraph', isFirstVisit: false });
  } else if (stage === 'xAxis') {
    child = h(XAxisScreen, {
      t: t, onNext: function(){ goTo('yAxisScale'); }, onPrev: goPrev,
      xAxisOrder: appState.xAxisOrder, setXAxisOrder: appState.setXAxisOrder
    });
  } else if (stage === 'yAxisScale') {
    child = h(YAxisScaleScreen, {
      t: t, onNext: function(){ goTo('drawBars'); }, onPrev: goPrev,
      yScale: appState.yScale, setYScale: appState.setYScale
    });
  } else if (stage === 'drawBars') {
    child = h(DrawBarsScreen, {
      t: t, onNext: function(){ goTo('barGraphTitle'); }, onPrev: goPrev,
      state: appState
    });
  } else if (stage === 'barGraphTitle') {
    child = h(BarGraphTitleScreen, {
      t: t, onNext: function(){ goTo('exitMenu'); }, onPrev: goPrev,
      barGraphTitle: appState.barGraphTitle, setBarGraphTitle: appState.setBarGraphTitle,
      barHeights: appState.barHeights
    });
  } else if (stage === 'exitMenu') {
    child = h(RepresentationScreen, { t: t, onNext: function(){}, enabledOption: null, isFirstVisit: false });
  }

  return h('div', { className: 'applet-root', style: { width: '100%', height: '100%' } }, child);
}
window.AppletContainer = AppletContainer;
