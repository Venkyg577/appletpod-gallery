// AppletContainer.jsx — root. Wires state machine to header/grid/MCQ/CTA per screen.
(function(){
  var h = window.MiniReact.h;

  var MCQ_SCREENS = {
    4:  { question:'content-ui.screens.s4_question', opts:[
            { key:'a', textKey:'content-ui.screens.s4_opt_a' },
            { key:'b', textKey:'content-ui.screens.s4_opt_b' }
          ], correctKey:'a', feedbackCorrect:null, feedbackIncorrect:null },
    5:  { question:'content-ui.screens.s5_question', opts:[
            { key:'a', textKey:'content-ui.screens.s5_opt_a' },
            { key:'b', textKey:'content-ui.screens.s5_opt_b' }
          ], correctKey:'b', feedbackCorrect:null, feedbackIncorrect:null },
    7:  { question:null, opts:[
            { key:'a', textKey:'content-ui.screens.s7_opt_a' },
            { key:'b', textKey:'content-ui.screens.s7_opt_b' },
            { key:'c', textKey:'content-ui.screens.s7_opt_c' }
          ], correctKey:'a',
          feedbackCorrect:'content-ui.screens.s7_feedback_correct',
          feedbackIncorrect:'content-ui.screens.s7_feedback_incorrect' },
    11: { question:null, opts:[
            { key:'a', textKey:'content-ui.screens.s11_opt_a' },
            { key:'b', textKey:'content-ui.screens.s11_opt_b' },
            { key:'c', textKey:'content-ui.screens.s11_opt_c' }
          ], correctKey:'c',
          feedbackCorrect:'content-ui.screens.s11_feedback_correct',
          feedbackIncorrect:'content-ui.screens.s11_feedback_incorrect' }
  };

  var HEADING_KEYS = {
    1:'s1_heading', 2:'s2_heading', 3:'s3_heading', 4:'s4_heading', 5:'s5_heading',
    6:'s6_heading', 7:'s7_heading', 8:'s8_heading', 9:'s9_heading', 10:'s10_heading',
    11:'s11_heading', 12:'s12_heading', 13:'s13_heading'
  };

  var INSTRUCTION_KEYS = {
    1:'s1_cta', 2:'s2_instruction', 3:'s3_instruction', 6:'s6_cta', 7:'s7_instruction',
    8:'s8_cta', 9:'s9_cta', 10:'s10_instruction', 11:'s11_instruction', 12:'s12_cta'
  };

  function AppletContainer(props){
    var appData = props.appData || window.appData;
    var createI18n = window.i18n.createI18n;

    window.useResponsiveLayout();
    var audio = window.useAudioFeedback();
    var app = window.useAppletState();

    var i18n = appData ? createI18n(appData, 'en') : { t:function(k){ return k; } };
    var t = function(k, p){ return i18n.t(k, p); };

    function onTapPoint(id){
      audio.correct();
      app.tapPoint(id);
    }

    function onSelectOption(optKey){
      app.selectOption(optKey);
      // play audio based on the screen's correct key (state isn't readable yet here)
      var cfg = MCQ_SCREENS[app.screen];
      if (cfg){
        if (optKey === cfg.correctKey) audio.correct(); else audio.click();
      }
    }

    function onNext(){
      audio.swoosh();
      app.next();
    }

    function onExploreAgain(){
      audio.click();
      app.reset();
    }

    var screen = app.screen;
    // screen 7: once answered correctly, swap in screen 8's heading/CTA in-place
    // (matches storyboard) ahead of the auto-advance to screen 8 itself
    var showS8TextOnS7 = screen === 7 && app.mcqResult === 'correct';
    var headingKey = showS8TextOnS7 ? 's8_heading' : HEADING_KEYS[screen];
    var heading = headingKey ? t('content-ui.screens.' + headingKey) : '';
    var instructionKey = showS8TextOnS7 ? 's8_cta' : INSTRUCTION_KEYS[screen];
    var instruction = instructionKey ? t('content-ui.screens.' + instructionKey) : '';

    var mcqCfg = MCQ_SCREENS[screen];
    var mcqEl = null;
    if (mcqCfg){
      var options = mcqCfg.opts.map(function(o){ return { key:o.key, text:t(o.textKey) }; });
      var feedbackText = null;
      if (app.mcqResult === 'correct' && mcqCfg.feedbackCorrect) feedbackText = t(mcqCfg.feedbackCorrect);
      if (app.mcqResult === 'incorrect' && mcqCfg.feedbackIncorrect) feedbackText = t(mcqCfg.feedbackIncorrect);
      mcqEl = h(window.MCQPanel, {
        question: mcqCfg.question ? t(mcqCfg.question) : null,
        options: options,
        selectedOpt: app.selectedOpt,
        result: app.mcqResult,
        feedbackText: feedbackText,
        pulseOptions: screen === 5,
        onSelect: onSelectOption
      });
    }

    var AUTO_ADVANCE_SCREENS = { 2:true, 3:true, 4:true, 5:true, 7:true, 10:true, 11:true };
    var showNext = screen < 13 && app.canAdvance && !AUTO_ADVANCE_SCREENS[screen];
    var showExploreAgain = screen === 13;

    return h('div', { className:'applet-root' },
      h('div', { className:'screen-layout' },
        h('div', { className:'screen-header' }, heading),
        h('div', { className:'screen-main' },
          h('div', { className:'grid-col' },
            h(window.RoomGrid, {
              screen: screen,
              tapped: app.tapped,
              revealed: app.revealed,
              mcqResult: app.mcqResult,
              onTapPoint: onTapPoint
            })
          ),
          // right 25% column is always present so the grid never shifts; it holds
          // the MCQ panel on question screens and stays empty otherwise.
          h('div', { className:'mcq-col' }, mcqEl)
        ),
        h('div', { className:'screen-footer' },
          h('div', { className:'screen-instruction' }, instruction),
          showNext ? h('button', { className:'next-btn', onClick:onNext }, t('standard-ui.buttons.next')) : null,
          showExploreAgain ? h('button', { className:'explore-again', onClick:onExploreAgain }, t('standard-ui.buttons.explore_again')) : null
        )
      )
    );
  }

  window.AppletContainer = AppletContainer;
})();
