function useAppletState() {
  var useState = window.MiniReact.useState;

  // phase: 'default' | 'selecting' | 'evaluating'
  var _phase = useState("default");
  var phase = _phase[0];
  var setPhase = _phase[1];

  var _selected = useState([]);
  var selected = _selected[0];
  var setSelected = _selected[1];

  var _results = useState(null);
  var results = _results[0];
  var setResults = _results[1];

  var CORRECT_IDS = ["hs1", "hs2", "hs3"];
  var DISTRACTOR_IDS = ["hs4", "hs5"];

  function toggleHotspot(id) {
    if (phase === "evaluating") return;
    setSelected(function (prev) {
      var idx = prev.indexOf(id);
      if (idx !== -1) {
        var next = prev.slice();
        next.splice(idx, 1);
        return next;
      }
      if (prev.length >= 3) return prev;
      return prev.concat([id]);
    });
    if (phase !== "selecting") setPhase("selecting");
  }

  function submitSelection() {
    if (selected.length !== 3) return;

    var correctCount = selected.filter(function (id) {
      return CORRECT_IDS.indexOf(id) !== -1;
    }).length;

    var incorrectSelected = selected.filter(function (id) {
      return DISTRACTOR_IDS.indexOf(id) !== -1;
    });

    var missedCorrect = CORRECT_IDS.filter(function (id) {
      return selected.indexOf(id) === -1;
    });

    setResults({
      correctCount: correctCount,
      incorrectSelected: incorrectSelected,
      missedCorrect: missedCorrect,
      selectedIds: selected.slice()
    });

    setPhase("evaluating");
  }

  function resetAll() {
    setPhase("default");
    setSelected([]);
    setResults(null);
  }

  return {
    phase: phase,
    selected: selected,
    results: results,
    CORRECT_IDS: CORRECT_IDS,
    toggleHotspot: toggleHotspot,
    submitSelection: submitSelection,
    resetAll: resetAll
  };
}

window.useAppletState = useAppletState;
