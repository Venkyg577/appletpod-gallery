// useAppletState.js — 22-screen state machine for the Cartesian-plane applet.
(function(){
  var useState = window.MiniReact.useState;

  var GUIDED_POINT = { x:5, y:3, label:'P' };
  var LAST_SCREEN = 22;
  var PRACTICE_FIRST_SCREEN = 16;

  // anti-clockwise quadrant reveal order: TR(I) -> TL(II) -> BL(III) -> BR(IV)
  var REVEAL_SCREEN_TO_QID = { 3:'I', 4:'II', 5:'III', 6:'IV' };

  var SIGN_QIDS = ['I', 'II', 'III', 'IV'];

  function quadrantOf(pt){
    if (!pt) return null;
    if (pt.x > 0 && pt.y > 0) return 'I';
    if (pt.x < 0 && pt.y > 0) return 'II';
    if (pt.x < 0 && pt.y < 0) return 'III';
    return 'IV';
  }

  function getCurrentPoint(screen, selectedPoint){
    if (screen >= 10 && screen <= 15) return GUIDED_POINT;
    if (screen >= 17 && screen <= 21) return selectedPoint;
    return null;
  }

  function merge(obj, extra){
    var next = {};
    for (var k in obj) next[k] = obj[k];
    for (var k2 in extra) next[k2] = extra[k2];
    return next;
  }

  function useAppletState(){
    var screenS = useState(1);
    var screen = screenS[0], setScreen = screenS[1];

    var tappedS = useState(function(){ return {}; });
    var tapped = tappedS[0], setTapped = tappedS[1];

    var selectedQuadrantS = useState(null);
    var selectedQuadrant = selectedQuadrantS[0], setSelectedQuadrant = selectedQuadrantS[1];

    var quadrantResultS = useState(null);
    var quadrantResult = quadrantResultS[0], setQuadrantResult = quadrantResultS[1];

    var dragXS = useState(0);
    var dragX = dragXS[0], setDragX = dragXS[1];
    var dragYS = useState(0);
    var dragY = dragYS[0], setDragY = dragYS[1];
    var dragXLockedS = useState(false);
    var dragXLocked = dragXLockedS[0], setDragXLocked = dragXLockedS[1];
    var dragYLockedS = useState(false);
    var dragYLocked = dragYLockedS[0], setDragYLocked = dragYLockedS[1];

    var teeterS = useState(null);
    var teeter = teeterS[0], setTeeter = teeterS[1];

    var selectedPointS = useState(null);
    var selectedPoint = selectedPointS[0], setSelectedPoint = selectedPointS[1];

    var currentPoint = getCurrentPoint(screen, selectedPoint);

    function resetPerScreenInteraction(){
      setSelectedQuadrant(null);
      setQuadrantResult(null);
      setDragX(0);
      setDragY(0);
      setDragXLocked(false);
      setDragYLocked(false);
      setTeeter(null);
    }

    function drawAxis(which, end){
      if (which === 'x' && screen === 1){
        var extraX = {};
        extraX['xAxis' + end] = true; // end: 'Left' | 'Right'
        var nextX = merge(tapped, extraX);
        if (nextX.xAxisLeft && nextX.xAxisRight){
          nextX.xAxis = true;
          setTapped(nextX);
          setTimeout(function(){
            setScreen(2);
            resetPerScreenInteraction();
          }, 700);
          return;
        }
        setTapped(nextX);
      }
      if (which === 'y' && screen === 2){
        var extraY = {};
        extraY['yAxis' + end] = true; // end: 'Top' | 'Bottom'
        var nextY = merge(tapped, extraY);
        if (nextY.yAxisTop && nextY.yAxisBottom){
          nextY.yAxis = true;
          setTapped(nextY);
          setTimeout(function(){
            setScreen(3);
            resetPerScreenInteraction();
          }, 700);
          return;
        }
        setTapped(nextY);
      }
    }

    function revealQuadrant(qid){
      var expected = REVEAL_SCREEN_TO_QID[screen];
      if (expected !== qid) return;
      var extra = {};
      extra['q' + qid] = true;
      setTapped(merge(tapped, extra));
      var thisScreen = screen;
      setTimeout(function(){
        setScreen(thisScreen + 1);
        resetPerScreenInteraction();
      }, 700);
    }

    function selectQuadrant(qid){
      var pt = currentPoint;
      var target = quadrantOf(pt);
      setSelectedQuadrant(qid);
      if (qid === target){
        setQuadrantResult('correct');
        if (screen === 17){
          setTimeout(function(){
            setScreen(18);
            resetPerScreenInteraction();
          }, 700);
        }
      } else {
        setQuadrantResult('incorrect');
        triggerTeeter('quadrant');
      }
    }

    function exploreQuadrantSign(qid){
      if (screen !== 8) return;
      var extra = {};
      extra['sign' + qid] = true;
      setTapped(merge(tapped, extra));
    }

    function allSignsRevealed(t){
      for (var i = 0; i < SIGN_QIDS.length; i++){
        if (!t['sign' + SIGN_QIDS[i]]) return false;
      }
      return true;
    }

    function commitDragX(value){
      var target = currentPoint ? currentPoint.x : 5;
      if (value === target){
        setDragX(value);
        setDragXLocked(true);
        if (screen === 12 || screen === 18){
          var thisScreenX = screen;
          setTimeout(function(){
            setScreen(thisScreenX + 1);
            resetPerScreenInteraction();
          }, 700);
        }
      } else {
        triggerTeeter('x');
        setDragX(0);
      }
    }

    function commitDragY(value){
      var target = currentPoint ? currentPoint.y : 3;
      if (value === target){
        setDragY(value);
        setDragYLocked(true);
        if (screen === 13 || screen === 19){
          var thisScreenY = screen;
          setTimeout(function(){
            setScreen(thisScreenY + 1);
            resetPerScreenInteraction();
          }, 700);
        }
      } else {
        triggerTeeter('y');
        setDragY(0);
      }
    }

    function choosePoint(pt){
      setSelectedPoint(pt);
      if (screen === 16){
        setTimeout(function(){
          setScreen(17);
          resetPerScreenInteraction();
        }, 500);
      }
    }

    function triggerTeeter(kind){
      setTeeter(kind);
      setTimeout(function(){ setTeeter(null); }, 500);
    }

    function canAdvance(){
      switch (screen){
        case 1: return !!tapped.xAxis;
        case 2: return !!tapped.yAxis;
        case 3: return !!tapped.qI;
        case 4: return !!tapped.qII;
        case 5: return !!tapped.qIII;
        case 6: return !!tapped.qIV;
        case 8: return allSignsRevealed(tapped);
        case 10: case 17:
          return quadrantResult === 'correct';
        case 12: case 18:
          return dragXLocked;
        case 13: case 19:
          return dragYLocked;
        case 16:
          return !!selectedPoint;
        case 21: case 22:
          return false;
        default:
          return true;
      }
    }

    function next(){
      if (screen >= LAST_SCREEN) return;
      if (!canAdvance()) return;
      var nextScreen = screen + 1;
      setScreen(nextScreen);
      resetPerScreenInteraction();
    }

    function exploreAgain(){
      setScreen(PRACTICE_FIRST_SCREEN);
      setSelectedPoint(null);
      resetPerScreenInteraction();
    }

    function reset(){
      setScreen(1);
      setTapped({});
      setSelectedPoint(null);
      resetPerScreenInteraction();
    }

    return {
      screen: screen,
      tapped: tapped,
      selectedQuadrant: selectedQuadrant,
      quadrantResult: quadrantResult,
      dragX: dragX,
      dragY: dragY,
      dragXLocked: dragXLocked,
      dragYLocked: dragYLocked,
      teeter: teeter,
      selectedPoint: selectedPoint,
      currentPoint: currentPoint,
      canAdvance: canAdvance(),
      drawAxis: drawAxis,
      revealQuadrant: revealQuadrant,
      selectQuadrant: selectQuadrant,
      exploreQuadrantSign: exploreQuadrantSign,
      commitDragX: commitDragX,
      commitDragY: commitDragY,
      choosePoint: choosePoint,
      next: next,
      exploreAgain: exploreAgain,
      reset: reset,
      quadrantOf: quadrantOf
    };
  }

  window.useAppletState = useAppletState;
  window.GUIDED_POINT = GUIDED_POINT;
})();
