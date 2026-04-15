// HTML buttons above the scene — z-index + reliable clicks under CSS scale().
// LabScene SVG uses preserveAspectRatio xMidYMid slice; naive cx/1920 % does NOT match
// the cropped image. We mirror that slice math so buttons sit on the real markers.
//
// Troubleshooting: open index.html?debug=hits to show semi-transparent red hit discs.
function SceneHitLayer(props) {
  var h = window.MiniReact.h;
  var useState = window.MiniReact.useState;
  var useEffect = window.MiniReact.useEffect;

  var configs = props.hotspotConfigs || [];
  var phase = props.phase;
  var onToggle = props.onToggleHotspot;
  var VW = 1920;
  var VH = 1080;
  var locked = phase === "evaluating";

  var posState = useState(null);
  var positions = posState[0];
  var setPositions = posState[1];

  useEffect(function () {
    if (/[?&]debug=hits(?:&|$)/.test(String(location.search || ""))) {
      document.body.classList.add("debug-scene-hits");
    }

    function computeSlicePercents() {
      var svg = document.querySelector(".lab-scene-hotspots");
      if (!svg) return;

      var Wc = svg.clientWidth;
      var Hc = svg.clientHeight;
      if (Wc < 2 || Hc < 2) return;

      var scale = Math.max(Wc / VW, Hc / VH);
      var rw = VW * scale;
      var rh = VH * scale;
      var ox = (Wc - rw) / 2;
      var oy = (Hc - rh) / 2;

      var list = [];
      for (var i = 0; i < configs.length; i++) {
        var cfg = configs[i];
        var x = ox + cfg.cx * scale;
        var y = oy + cfg.cy * scale;
        list.push({
          id: cfg.id,
          leftPct: (x / Wc) * 100,
          topPct: (y / Hc) * 100
        });
      }
      setPositions(list);
      if (document.body.classList.contains("debug-scene-hits")) {
        console.log("[biology-lab] slice hit layout", {
          Wc: Wc,
          Hc: Hc,
          scale: scale,
          ox: ox,
          oy: oy,
          hits: list
        });
      }
    }

    function scheduleCompute() {
      requestAnimationFrame(function () {
        requestAnimationFrame(computeSlicePercents);
      });
    }

    scheduleCompute();

    window.addEventListener("resize", computeSlicePercents);

    var svgEl = document.querySelector(".lab-scene-hotspots");
    var ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(function () {
            scheduleCompute();
          })
        : null;
    if (ro && svgEl) ro.observe(svgEl);

    return function () {
      window.removeEventListener("resize", computeSlicePercents);
      if (ro && svgEl) ro.unobserve(svgEl);
    };
  }, []);

  var byId = {};
  if (positions) {
    for (var j = 0; j < positions.length; j++) {
      byId[positions[j].id] = positions[j];
    }
  }

  var buttons = configs.map(function (cfg) {
    var hasPngAnchor =
      typeof cfg.leftPct === "number" && typeof cfg.topPct === "number";
    var p = byId[cfg.id];
    var pctLeft = hasPngAnchor
      ? cfg.leftPct
      : (p ? p.leftPct : (cfg.cx / VW) * 100);
    var pctTop = hasPngAnchor
      ? cfg.topPct
      : (p ? p.topPct : (cfg.cy / VH) * 100);

    return h("button", {
      key: "hit-" + cfg.id,
      type: "button",
      className: "scene-hit-btn",
      disabled: locked,
      tabIndex: locked ? -1 : 0,
      "aria-label": "Hotspot " + cfg.number + " on the lab bench",
      "data-hotspot-id": cfg.id,
      style: {
        left: pctLeft + "%",
        top: pctTop + "%",
        width: (cfg.hitSize || 64) + "px",
        height: (cfg.hitSize || 64) + "px"
      },
      onClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (locked || !onToggle) return;
        onToggle(cfg.id);
      }
    });
  });

  return h("div", { className: "scene-hit-overlay" }, buttons);
}

window.SceneHitLayer = SceneHitLayer;
