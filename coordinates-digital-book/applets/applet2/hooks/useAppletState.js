// Step machine for the "Coordinates of a Point" applet.
// The applet is a single screen: a left concept menu unlocks sequentially,
// each concept plays an auto-timed sequence of sub-states on the coordinate plane.

// Ordered concepts -> menu buttons. subSteps = number of auto-timed sub-states per concept.
var CONCEPTS = [
  { key: 'plane',       subSteps: 1 }, // axis construction + right-angle
  { key: 'xaxis',       subSteps: 3 }, // x-axis / positive / negative
  { key: 'yaxis',       subSteps: 3 }, // y-axis / positive / negative
  { key: 'origin',      subSteps: 1 }, // pulse intersection -> reveal O
  { key: 'coordinates', subSteps: 1 }, // pulse O(0,0)
  { key: 'xcoord',      subSteps: 3 }, // OP / OQ / x-axis rule
  { key: 'ycoord',      subSteps: 3 }  // OR / OS / y-axis rule
];

function useAppletState(){
  var useState = window.MiniReact.useState;

  var _phase = useState('explore');            // 'explore' | 'practice'
  var phase = _phase[0], setPhase = _phase[1];

  var _unlocked = useState(0);                 // highest unlocked concept index
  var unlockedIndex = _unlocked[0], setUnlockedIndex = _unlocked[1];

  var _completed = useState(function(){ return {}; }); // { conceptKey: true }
  var completed = _completed[0], setCompleted = _completed[1];

  var _active = useState(null);                // active concept index (null = none)
  var activeIndex = _active[0], setActiveIndex = _active[1];

  var _sub = useState(0);                       // sub-step within active concept
  var subStep = _sub[0], setSubStep = _sub[1];

  var _sel = useState(null);                    // selected practice point {x,y}
  var selectedPoint = _sel[0], setSelectedPoint = _sel[1];

  function beginExplore(){
    setPhase('explore');
  }

  function selectConcept(i){
    if (i > unlockedIndex) return;             // locked
    setActiveIndex(i);
    setSubStep(0);
  }

  function advanceSubStep(){
    setSubStep(function(s){ return s + 1; });
  }

  // Called when the active concept's auto-timed sequence has finished.
  function finishConcept(){
    if (activeIndex == null) return;
    var key = CONCEPTS[activeIndex].key;
    setCompleted(function(prev){
      var next = {}; for (var k in prev) next[k] = prev[k];
      next[key] = true;
      return next;
    });
    if (activeIndex >= unlockedIndex && unlockedIndex < CONCEPTS.length - 1) {
      setUnlockedIndex(activeIndex + 1);
    }
  }

  function startPractice(){
    setPhase('practice');
    setActiveIndex(null);
    setSelectedPoint(null);
  }

  function selectPoint(x, y){
    setSelectedPoint({ x: x, y: y });
  }

  function reset(){
    setPhase('explore');
    setUnlockedIndex(0);
    setCompleted({});
    setActiveIndex(null);
    setSubStep(0);
    setSelectedPoint(null);
  }

  var allConceptsDone = unlockedIndex >= CONCEPTS.length - 1 &&
                        !!completed[CONCEPTS[CONCEPTS.length - 1].key];

  return {
    concepts: CONCEPTS,
    phase: phase,
    unlockedIndex: unlockedIndex,
    completed: completed,
    activeIndex: activeIndex,
    activeConcept: activeIndex == null ? null : CONCEPTS[activeIndex].key,
    subStep: subStep,
    selectedPoint: selectedPoint,
    allConceptsDone: allConceptsDone,
    // actions
    beginExplore: beginExplore,
    selectConcept: selectConcept,
    advanceSubStep: advanceSubStep,
    finishConcept: finishConcept,
    startPractice: startPractice,
    selectPoint: selectPoint,
    reset: reset
  };
}

window.CONCEPTS = CONCEPTS;
window.useAppletState = useAppletState;
