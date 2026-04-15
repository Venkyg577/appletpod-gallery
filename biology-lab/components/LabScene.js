// Photo-based lab scene: background + table props + SVG hotspot overlay + speech bubble.
// hotspotConfigs: array of { id, cx, cy, number, isCorrect } — cx/cy in 1920×1080 viewBox space
function LabScene(props) {
  var h = window.MiniReact.h;
  var hotspotConfigs = props.hotspotConfigs || [];
  var phase = props.phase;
  var selectedIds = props.selectedIds || [];
  var results = props.results;
  var assistantMessage = props.assistantMessage || '';
  var highlightMissedCorrect = !!props.highlightMissedCorrect;

  function wasSelected(id) {
    return results && results.selectedIds && results.selectedIds.indexOf(id) !== -1;
  }

  function isCorrectHotspot(id) {
    for (var i = 0; i < hotspotConfigs.length; i++) {
      if (hotspotConfigs[i].id === id) return !!hotspotConfigs[i].isCorrect;
    }
    return false;
  }

  // Match viewBox 1920×1080 — same box as photo aspect ratio
  var VW = 1920;
  var VH = 1080;

  // Table props: center-anchored (left/top %), width % of scene — tune to sit on bench
  var tableProps = [
    {
      id: 'bowl',
      hotspotId: 'hs1',
      src: 'assets/images/bowl.png',
      leftPct: 27,
      topPct: 71,
      widthPct: 16.9,
      z: 2
    },
    {
      id: 'bottle',
      hotspotId: 'hs2',
      src: 'assets/images/bottle.png',
      leftPct: 40.5,
      topPct: 63,
      widthPct: 10.4,
      z: 3
    },
    {
      id: 'phone',
      hotspotId: 'hs3',
      src: 'assets/images/phone.png',
      leftPct: 49.5625,
      topPct: 69,
      widthPct: 11.7,
      z: 4
    },
    {
      id: 'covereditem',
      hotspotId: 'hs4',
      src: 'assets/images/covereditem.png',
      leftPct: 63.6042,
      topPct: 73.6296,
      widthPct: 16.25,
      z: 3
    },
    {
      id: 'recyclbin',
      hotspotId: 'hs5',
      src: 'assets/images/recyclbin.png',
      leftPct: 83.7708,
      topPct: 65,
      widthPct: 16.25,
      z: 2
    }
  ];

  var propNodes = tableProps.map(function (p) {
    var hotspotId = p.hotspotId || null;
    var isSel = hotspotId ? selectedIds.indexOf(hotspotId) !== -1 : false;
    var wasSel = hotspotId ? wasSelected(hotspotId) : false;
    var propClass = 'lab-scene-prop';

    if (isSel && phase !== 'evaluating') {
      propClass += ' lab-scene-prop--selected';
    } else if (phase === 'evaluating' && wasSel) {
      propClass += isCorrectHotspot(hotspotId)
        ? ' lab-scene-prop--correct'
        : ' lab-scene-prop--wrong';
    } else if (highlightMissedCorrect && phase === 'evaluating' && !wasSel && isCorrectHotspot(hotspotId)) {
      // Guidance glow: show missed correct risks during evaluation before Retry.
      propClass += ' lab-scene-prop--hint-correct';
    }

    return h('img', {
      key: p.id,
      className: propClass,
      src: p.src,
      alt: '',
      draggable: false,
      style: {
        left: p.leftPct + '%',
        top: p.topPct + '%',
        width: p.widthPct + '%',
        zIndex: p.z
      }
    });
  });

  var hotspotNodes = hotspotConfigs.map(function (cfg) {
    var sel = selectedIds.indexOf(cfg.id) !== -1;
    return h(window.Hotspot, {
      key: cfg.id,
      id: cfg.id,
      cx: cfg.cx,
      cy: cfg.cy,
      number: cfg.number,
      phase: phase,
      isSelected: sel,
      isCorrect: cfg.isCorrect,
      wasSelected: wasSelected(cfg.id)
    });
  });

  var speech = assistantMessage && String(assistantMessage).trim()
    ? h(
        'div',
        { className: 'lab-scene-speech', role: 'status', 'aria-live': 'polite' },
        h('div', { className: 'lab-scene-speech__inner' }, assistantMessage)
      )
    : null;

  var svgLayer = h(
    'svg',
    {
      className: 'lab-scene-hotspots',
    viewBox: '0 0 ' + VW + ' ' + VH,
      preserveAspectRatio: 'xMidYMid slice',
      'aria-hidden': 'true'
    },
    h('title', {}, 'Hotspot markers'),
    h('g', { className: 'hotspots-layer' }, hotspotNodes)
  );

  return h(
    'div',
    { className: 'lab-scene-composite' },
    h(
      'div',
      { className: 'lab-scene-inner' },
      h('img', {
        className: 'lab-scene-bg',
        src: 'assets/images/labtechnician.png',
        alt: 'Laboratory bench with technician'
      }),
      h('div', { className: 'lab-scene-props' }, propNodes),
      svgLayer,
      speech
    )
  );
}

window.LabScene = LabScene;
