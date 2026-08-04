// useAppletState.js — linear screen-by-screen state machine for the Distances applet.
//
// 13 screens (matches doc/content-flow.md). Each screen optionally requires:
//   - tapping a set of named points before Next/MCQ unlocks (taps screens: 2, 10)
//   - answering an MCQ correctly before Next unlocks (MCQ screens: 4, 5, 7, 11)
// All other screens just need a Next tap.

function useAppletState(){
  var useState = window.MiniReact.useState;

  var _screen = useState(1);
  var screen = _screen[0], setScreen = _screen[1];

  // points tapped so far on the current "tap pair" screen, e.g. { D1:true, R1:true }
  var _tapped = useState(function(){ return {}; });
  var tapped = _tapped[0], setTapped = _tapped[1];

  // revealed coordinate labels, persists across screens once shown
  var _revealed = useState(function(){ return {}; });
  var revealed = _revealed[0], setRevealed = _revealed[1];

  // last MCQ result on the current screen: null | 'correct' | 'incorrect'
  var _mcqResult = useState(null);
  var mcqResult = _mcqResult[0], setMcqResult = _mcqResult[1];

  // option key the learner last selected (for chip highlight), reset per screen
  var _selectedOpt = useState(null);
  var selectedOpt = _selectedOpt[0], setSelectedOpt = _selectedOpt[1];

  var TAP_REQUIREMENTS = {
    2: ['D1', 'R1'],
    3: ['D1'],
    10: ['B1', 'B2']
  };

  // screens whose tap requirement, once fully met, should auto-advance
  // instead of waiting for an explicit Next tap
  var AUTO_ADVANCE_SCREENS = { 2:true, 3:true, 10:true };

  var MCQ_ANSWERS = {
    4: 'a',   // 8 units
    5: 'b',   // 0 units
    7: 'a',   // 3.5 units
    11: 'c'   // 2.5 units
  };

  // MCQ screens auto-advance on a correct answer; screens with feedback text
  // get a longer delay so the learner has time to read it before transitioning
  var MCQ_AUTO_ADVANCE_DELAY = { 4:900, 5:900, 7:1800, 11:1800 };

  function tapPoint(id){
    var req = TAP_REQUIREMENTS[screen];
    if (!req || req.indexOf(id) === -1) return;
    if (tapped[id]) return;

    var nextTapped = {}; for (var k in tapped) nextTapped[k] = tapped[k];
    nextTapped[id] = true;

    setTapped(function(){ return nextTapped; });
    setRevealed(function(prev){
      var next = {}; for (var k2 in prev) next[k2] = prev[k2];
      next[id] = true;
      return next;
    });

    var requirementNowMet = req.every(function(pid){ return !!nextTapped[pid]; });
    if (requirementNowMet && AUTO_ADVANCE_SCREENS[screen]){
      var fromScreen = screen;
      setTimeout(function(){
        setScreen(function(s){ return s === fromScreen ? Math.min(s + 1, 13) : s; });
        setTapped({});
        setMcqResult(null);
        setSelectedOpt(null);
      }, 700);
    }
  }

  function tapRequirementMet(){
    var req = TAP_REQUIREMENTS[screen];
    if (!req) return true;
    return req.every(function(id){ return !!tapped[id]; });
  }

  function selectOption(optKey){
    var answer = MCQ_ANSWERS[screen];
    if (!answer) return;
    if (mcqResult === 'correct') return; // already answered correctly, ignore further taps
    setSelectedOpt(optKey);
    var isCorrect = optKey === answer;
    setMcqResult(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect && MCQ_AUTO_ADVANCE_DELAY[screen]){
      var fromScreen = screen;
      setTimeout(function(){
        setScreen(function(s){ return s === fromScreen ? Math.min(s + 1, 13) : s; });
        setTapped({});
        setMcqResult(null);
        setSelectedOpt(null);
      }, MCQ_AUTO_ADVANCE_DELAY[screen]);
    }
  }

  function mcqRequirementMet(){
    var answer = MCQ_ANSWERS[screen];
    if (!answer) return true;
    return mcqResult === 'correct';
  }

  function canAdvance(){
    return tapRequirementMet() && mcqRequirementMet();
  }

  function next(){
    if (!canAdvance()) return;
    setScreen(function(s){ return Math.min(s + 1, 13); });
    setTapped({});
    setMcqResult(null);
    setSelectedOpt(null);
  }

  function reset(){
    setScreen(1);
    setTapped({});
    setRevealed({});
    setMcqResult(null);
    setSelectedOpt(null);
  }

  return {
    screen: screen,
    tapped: tapped,
    revealed: revealed,
    mcqResult: mcqResult,
    selectedOpt: selectedOpt,
    tapRequirementMet: tapRequirementMet(),
    canAdvance: canAdvance(),
    tapPoint: tapPoint,
    selectOption: selectOption,
    next: next,
    reset: reset
  };
}

window.useAppletState = useAppletState;
