// useAppletState.js — linear phase machine for the Floor Plan applet.
//
// Flow:
//   placing   -> learner drags all 16 pins onto highlighted targets (one active at a time)
//   allPlaced -> every pin pulses; Grid button appears
//   grid      -> room art fades, grid overlay reveals, pins pulse, points become tappable
//   done      -> all labels revealed; interactions disabled; final header
//
// `POINTS` (from data.js) is the ordered list of targets.

function useAppletState(){
  var useState = window.MiniReact.useState;
  var POINTS = window.POINTS || [];
  var TOTAL = POINTS.length;

  var _phase = useState('placing');                 // 'placing' | 'allPlaced' | 'grid' | 'done'
  var phase = _phase[0], setPhase = _phase[1];

  // ids of pins already locked on the floor plan
  var _placed = useState(function(){ return {}; });  // { id: true }
  var placed = _placed[0], setPlaced = _placed[1];

  // index into POINTS of the single currently-highlighted target during placing
  var _active = useState(0);
  var activeIndex = _active[0], setActiveIndex = _active[1];

  // ids of points whose A–P label has been revealed during the grid phase
  var _revealed = useState(function(){ return {}; });
  var revealed = _revealed[0], setRevealed = _revealed[1];

  // transient feedback bubble: 'good' | 'great' | 'awesome' | null
  var _fb = useState(null);
  var feedback = _fb[0], setFeedback = _fb[1];

  // ids of the most-recently-placed / most-recently-revealed point, so only THAT
  // marker plays its entrance animation on re-render (older ones stay static).
  var _lastPlaced = useState(null);
  var lastPlacedId = _lastPlaced[0], setLastPlacedId = _lastPlaced[1];
  var _lastRevealed = useState(null);
  var lastRevealedId = _lastRevealed[0], setLastRevealedId = _lastRevealed[1];

  var placedCount = Object.keys(placed).length;
  var revealedCount = Object.keys(revealed).length;
  var activeId = (phase === 'placing' && activeIndex < TOTAL) ? POINTS[activeIndex].id : null;

  // --- actions -------------------------------------------------------------

  // Called when a pin is correctly dropped on the active target.
  function placePin(id){
    if (phase !== 'placing') return;
    if (!activeId || id !== activeId) return;       // only the highlighted target accepts a pin
    var nextCount;
    setPlaced(function(prev){
      var next = {}; for (var k in prev) next[k] = prev[k];
      next[id] = true;
      nextCount = Object.keys(next).length;
      return next;
    });
    setLastPlacedId(id);
    // feedback: first placement -> "Good!", subsequent -> "Great!"
    setFeedback(activeIndex === 0 ? 'good' : 'great');

    if (activeIndex + 1 >= TOTAL){
      setPhase('allPlaced');                         // all pins down -> pulse all
    } else {
      setActiveIndex(function(i){ return i + 1; });
    }
  }

  function clearFeedback(){ setFeedback(null); }

  // Grid button -> transition to grid overlay + label phase.
  function tapGrid(){
    if (phase !== 'allPlaced') return;
    setPhase('grid');
    setFeedback(null);
  }

  // Reveal one point's label (grid phase).
  function revealLabel(id){
    if (phase !== 'grid') return;
    if (revealed[id]) return;
    var firstReveal = revealedCount === 0;
    var nextCount;
    setRevealed(function(prev){
      var next = {}; for (var k in prev) next[k] = prev[k];
      next[id] = true;
      nextCount = Object.keys(next).length;
      return next;
    });
    setLastRevealedId(id);
    if (firstReveal) setFeedback('awesome');
    if (nextCount >= TOTAL){
      setPhase('done');                              // all labels shown -> end state
      setFeedback(null);
    }
  }

  function reset(){
    setPhase('placing');
    setPlaced({});
    setActiveIndex(0);
    setRevealed({});
    setFeedback(null);
    setLastPlacedId(null);
    setLastRevealedId(null);
  }

  return {
    points: POINTS,
    total: TOTAL,
    phase: phase,
    placed: placed,
    placedCount: placedCount,
    activeIndex: activeIndex,
    activeId: activeId,
    revealed: revealed,
    revealedCount: revealedCount,
    feedback: feedback,
    lastPlacedId: lastPlacedId,
    lastRevealedId: lastRevealedId,
    // actions
    placePin: placePin,
    clearFeedback: clearFeedback,
    tapGrid: tapGrid,
    revealLabel: revealLabel,
    reset: reset
  };
}

window.useAppletState = useAppletState;
