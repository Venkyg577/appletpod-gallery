// useAppletState.js — state machine for Applet 5 "Distance Between Two Points" (16 logical screens).
// Each screen handles its own ask -> answer -> reveal internally, so a single Next advances to the
// next real step (no duplicate Next presses). Mirrors applet4's single-`screen` + gating pattern.
//
// Logical screen map (PDF group -> screen):
//   1 intro AD | 2 sample-line buttons | 3 horizontal PQ | 4 vertical RS | 5 restore AD
//   6 horizontal-change MCQ | 7 vertical-change MCQ | 8 build triangle | 9 AD Pythagoras
//   10 DM drag tiles | 11 DM Pythagoras | 12 MA Pythagoras
//   13 generalize changes | 14 two shorter sides | 15 distance formula | 16 free exploration
(function(){
  var useState = window.MiniReact.useState;

  var LAST_SCREEN = 16;

  // The three MCQ stages share one shape: { chosen, result }.
  function freshMcq(){ return { chosen:null, result:null }; }

  // optional ?screen=N deep-link for development/QA (defaults to 1)
  function initialScreen(){
    try {
      var m = /[?&]screen=(\d+)/.exec(window.location.search);
      if (m){ var n = parseInt(m[1], 10); if (n >= 1 && n <= LAST_SCREEN) return n; }
    } catch (e){}
    return 1;
  }

  function useAppletState(){
    var screenS = useState(initialScreen());
    var screen = screenS[0], setScreen = screenS[1];

    // screen 2-6: which sample line(s) the learner has opened
    var lineModeS = useState({ horizontal:false, vertical:false });
    var lineMode = lineModeS[0], setLineMode = lineModeS[1];

    // MCQ stages
    var hChangeS = useState(freshMcq()); var hChange = hChangeS[0], setHChange = hChangeS[1]; // screen 6
    var vChangeS = useState(freshMcq()); var vChange = vChangeS[0], setVChange = vChangeS[1]; // screen 7
    var adS = useState(freshMcq());      var ad = adS[0], setAd = adS[1];                     // screen 9
    var dmS = useState(freshMcq());      var dm = dmS[0], setDm = dmS[1];                     // screen 11
    var maS = useState(freshMcq());      var ma = maS[0], setMa = maS[1];                     // screen 12

    // DM drag tiles (screen 10): h must be filled before v
    var dragS = useState({ h:null, v:null, teeter:null });
    var drag = dragS[0], setDrag = dragS[1];

    // exploration (screens 32-33)
    var exploreS = useState({ p1:null, p2:null });
    var explore = exploreS[0], setExplore = exploreS[1];

    // ---------- actions ----------
    function selectLine(which){
      var m = { horizontal:lineMode.horizontal, vertical:lineMode.vertical };
      m[which] = true;
      setLineMode(m);
    }

    function answerMcq(stage, value, correctValue){
      var result = value === correctValue ? 'correct' : 'incorrect';
      var payload = { chosen:value, result:result };
      if (stage === 'hChange') setHChange(payload);
      else if (stage === 'vChange') setVChange(payload);
      else if (stage === 'ad') setAd(payload);
      else if (stage === 'dm') setDm(payload);
      else if (stage === 'ma') setMa(payload);
      return result;
    }

    // drop a tile into a slot. correctH/correctV are the expected values.
    // returns 'h'|'v'|'wrong' so the caller can play audio.
    function dropTile(slot, value, correctH, correctV){
      if (slot === 'h'){
        if (drag.h != null) return 'locked';                 // already filled
        if (value === correctH){ setDrag({ h:value, v:drag.v, teeter:null }); return 'h'; }
        setDrag({ h:drag.h, v:drag.v, teeter:value });
        return 'wrong';
      }
      // vertical slot only accepts after horizontal is locked
      if (drag.h == null){ setDrag({ h:drag.h, v:drag.v, teeter:value }); return 'wrong'; }
      if (drag.v != null) return 'locked';
      if (value === correctV){ setDrag({ h:drag.h, v:value, teeter:null }); return 'v'; }
      setDrag({ h:drag.h, v:drag.v, teeter:value });
      return 'wrong';
    }
    function clearTeeter(){ if (drag.teeter != null) setDrag({ h:drag.h, v:drag.v, teeter:null }); }

    function tapExplorePoint(x, y){
      if (explore.p1 == null){ setExplore({ p1:{ x:x, y:y }, p2:null }); return 1; }
      if (explore.p2 == null){
        // ignore tapping the exact same point twice
        if (explore.p1.x === x && explore.p1.y === y) return 0;
        setExplore({ p1:explore.p1, p2:{ x:x, y:y } });
        return 2;
      }
      return 0;
    }
    function exploreAgain(){ setExplore({ p1:null, p2:null }); }

    function canAdvance(){
      switch (screen){
        case 6: return hChange.result === 'correct';
        case 7: return vChange.result === 'correct';
        case 9: return ad.result === 'correct';
        case 10: return drag.h != null && drag.v != null;
        case 11: return dm.result === 'correct';
        case 12: return ma.result === 'correct';
        case 16: return false;                 // terminal (explore loops via Explore again)
        default: return true;
      }
    }

    function resetPerScreen(nextScreen){
      // entering a fresh question stage resets that stage's interaction
      if (nextScreen === 6) setHChange(freshMcq());
      if (nextScreen === 7) setVChange(freshMcq());
      if (nextScreen === 9) setAd(freshMcq());
      if (nextScreen === 10) setDrag({ h:null, v:null, teeter:null });
      if (nextScreen === 11) setDm(freshMcq());
      if (nextScreen === 12) setMa(freshMcq());
      if (nextScreen === 16) setExplore({ p1:null, p2:null });
    }

    function next(){
      if (screen >= LAST_SCREEN) return;
      if (!canAdvance()) return;
      var ns = screen + 1;
      resetPerScreen(ns);
      setScreen(ns);
    }

    function goTo(n){ resetPerScreen(n); setScreen(n); }

    function reset(){
      setScreen(1);
      setLineMode({ horizontal:false, vertical:false });
      setHChange(freshMcq()); setVChange(freshMcq()); setAd(freshMcq());
      setDm(freshMcq()); setMa(freshMcq());
      setDrag({ h:null, v:null, teeter:null });
      setExplore({ p1:null, p2:null });
    }

    return {
      screen: screen,
      lineMode: lineMode,
      hChange: hChange, vChange: vChange, ad: ad, dm: dm, ma: ma,
      drag: drag, explore: explore,
      canAdvance: canAdvance(),
      selectLine: selectLine,
      answerMcq: answerMcq,
      dropTile: dropTile,
      clearTeeter: clearTeeter,
      tapExplorePoint: tapExplorePoint,
      exploreAgain: exploreAgain,
      next: next,
      goTo: goTo,
      reset: reset
    };
  }

  window.useAppletState = useAppletState;
})();
