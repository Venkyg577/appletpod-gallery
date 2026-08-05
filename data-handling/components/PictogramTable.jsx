function PictogramTable(props){
  var h = window.MiniReact.h;
  var t = props.t || function(k){ return k; };
  var highlightVehicle = props.highlightVehicle;
  var wrongRows = props.wrongRows || [];
  var lockedVehicles = props.lockedVehicles || [];
  var TABLE = (typeof window !== 'undefined' && window.TABLE) || [
    { vehicle: 1, key: 'bus', count: 5 },
    { vehicle: 2, key: 'car', count: 10 },
    { vehicle: 3, key: 'cycle', count: 3 },
    { vehicle: 4, key: 'bike', count: 7 },
    { vehicle: 5, key: 'tractor', count: 5 }
  ];
  var style = props.style || {};
  var showTitle = props.showTitle !== false;
  return h('div', { className: 'pictogram-table', style: style },
    showTitle ? h('div', { className: 'row header' },
      h('div', { className: 'cell', style: { gridColumn: '1 / -1' } }, t('content-ui.dialogs.table_title'))
    ) : null,
    h('div', { className: 'row header' },
      h('div', { className: 'cell' }, t('standard-ui.labels.vehicles')),
      h('div', { className: 'cell' }, t('standard-ui.labels.no_of_vehicles'))
    ),
    TABLE.map(function(r){
      var isHighlighted = highlightVehicle != null && r.vehicle === highlightVehicle;
      var isDehighlighted = highlightVehicle != null && r.vehicle !== highlightVehicle;
      var vehicleKey = r.key;
      var isLocked = lockedVehicles.indexOf(vehicleKey) >= 0;
      var isWrong = !isLocked && wrongRows.indexOf(r.vehicle) >= 0;
      return h('div', {
        className: 'row' + (isHighlighted ? ' highlighted' : '') + (isDehighlighted ? ' dehighlighted' : '') + (isWrong ? ' wrong-row' : '')
      },
        h('div', { className: 'cell' }, t('content-ui.vehicle_names.' + r.key)),
        h('div', { className: 'cell' }, String(r.count))
      );
    })
  );
}
window.PictogramTable = PictogramTable;
