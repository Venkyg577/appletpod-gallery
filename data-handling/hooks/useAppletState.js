function useAppletState(){
  const useState = window.MiniReact.useState;

  const [representationVisit, setRepresentationVisit] = useState(1); // 1 = first menu visit, 2 = after horizontal pictograph
  const [layout, setLayout] = useState(null); // 'vertical' | 'horizontal'
  const [structureCount, setStructureCount] = useState(0);
  const [labelOrder, setLabelOrder] = useState([null, null, null, null, null]);
  const [pictographTitle, setPictographTitle] = useState(null);

  // Plot pictograph (per-column symbol placement)
  const [plotColumnIndex, setPlotColumnIndex] = useState(0); // 0..4, index into VEHICLE_ORDER
  const [placedByVehicle, setPlacedByVehicle] = useState({ bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 });
  const [lockedVehicles, setLockedVehicles] = useState([]);
  const [plotCheckResult, setPlotCheckResult] = useState(null);

  // Horizontal pictograph: rows are built independently of the vertical pictograph so the
  // learner repeats the interaction on a fresh grid (storyboard screens 21-22).
  const [rowCount, setRowCount] = useState(0);
  const [rowLabelOrder, setRowLabelOrder] = useState([null, null, null, null, null]);
  const [rowPlotColumnIndex, setRowPlotColumnIndex] = useState(0);
  const [rowPlacedByVehicle, setRowPlacedByVehicle] = useState({ bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 });
  const [rowLockedVehicles, setRowLockedVehicles] = useState([]);
  const [rowPlotCheckResult, setRowPlotCheckResult] = useState(null);

  // Bar graph
  const [xAxisOrder, setXAxisOrder] = useState([null, null, null, null, null]);
  const [yScale, setYScale] = useState(null); // 'A' (1-10) | 'B' (1-5)
  const [barHeights, setBarHeights] = useState({ bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 });
  const [lockedBars, setLockedBars] = useState([]);
  const [barDemoDone, setBarDemoDone] = useState(false);
  const [barGraphTitle, setBarGraphTitle] = useState(null);

  function reset(){
    setRepresentationVisit(1);
    setLayout(null);
    setStructureCount(0);
    setLabelOrder([null, null, null, null, null]);
    setPictographTitle(null);
    setPlotColumnIndex(0);
    setPlacedByVehicle({ bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 });
    setLockedVehicles([]);
    setPlotCheckResult(null);
    setRowCount(0);
    setRowLabelOrder([null, null, null, null, null]);
    setRowPlotColumnIndex(0);
    setRowPlacedByVehicle({ bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 });
    setRowLockedVehicles([]);
    setRowPlotCheckResult(null);
    setXAxisOrder([null, null, null, null, null]);
    setYScale(null);
    setBarHeights({ bus: 0, car: 0, cycle: 0, bike: 0, tractor: 0 });
    setLockedBars([]);
    setBarDemoDone(false);
    setBarGraphTitle(null);
  }

  return {
    representationVisit, setRepresentationVisit,
    layout, setLayout,
    structureCount, setStructureCount,
    labelOrder, setLabelOrder,
    pictographTitle, setPictographTitle,
    plotColumnIndex, setPlotColumnIndex,
    placedByVehicle, setPlacedByVehicle,
    lockedVehicles, setLockedVehicles,
    plotCheckResult, setPlotCheckResult,
    rowCount, setRowCount,
    rowLabelOrder, setRowLabelOrder,
    rowPlotColumnIndex, setRowPlotColumnIndex,
    rowPlacedByVehicle, setRowPlacedByVehicle,
    rowLockedVehicles, setRowLockedVehicles,
    rowPlotCheckResult, setRowPlotCheckResult,
    xAxisOrder, setXAxisOrder,
    yScale, setYScale,
    barHeights, setBarHeights,
    lockedBars, setLockedBars,
    barDemoDone, setBarDemoDone,
    barGraphTitle, setBarGraphTitle,
    reset
  };
}

window.useAppletState = useAppletState;
