function useAppletState(){
  var useState = window.MiniReact.useState;

  // Shared bulb count for both circuits (1-4, default 2)
  var _bulbCount = useState(2);
  var bulbCount = _bulbCount[0];
  var setBulbCount = _bulbCount[1];

  // Parallel circuit: per-bulb on/off switches
  var _parallelSwitches = useState(function(){ return [true, true]; });
  var parallelSwitches = _parallelSwitches[0];
  var setParallelSwitches = _parallelSwitches[1];

  // Series master switch
  var _seriesMasterOn = useState(true);
  var seriesMasterOn = _seriesMasterOn[0];
  var setSeriesMasterOn = _seriesMasterOn[1];

  function addBulb(){
    if (bulbCount >= 4) return;
    setBulbCount(function(prev){ return Math.min(prev + 1, 4); });
    setParallelSwitches(function(prev){ return prev.concat([true]); });
  }

  function removeBulb(){
    if (bulbCount <= 1) return;
    setBulbCount(function(prev){ return Math.max(prev - 1, 1); });
    setParallelSwitches(function(prev){ return prev.slice(0, prev.length - 1); });
  }

  function toggleParallelBulb(idx){
    setParallelSwitches(function(prev){
      var next = prev.slice();
      next[idx] = !next[idx];
      return next;
    });
  }

  function toggleSeriesMaster(){
    setSeriesMasterOn(function(prev){ return !prev; });
  }

  return {
    bulbCount: bulbCount,
    addBulb: addBulb,
    removeBulb: removeBulb,
    parallelSwitches: parallelSwitches,
    toggleParallelBulb: toggleParallelBulb,
    seriesMasterOn: seriesMasterOn,
    toggleSeriesMaster: toggleSeriesMaster
  };
}

window.useAppletState = useAppletState;
