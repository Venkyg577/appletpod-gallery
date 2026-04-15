(function () {
  var HOTSPOT_ORDER = ["hs1", "hs2", "hs3", "hs4", "hs5"];

  // Hit targets are anchored to the PNG object positions (not free-form scene coords).
  var HOTSPOT_LAYOUT = [
    { id: "hs1", cx: 520, cy: 760, leftPct: 27, topPct: 71, number: 1, isCorrect: true, hitSize: 70 },
    { id: "hs2", cx: 922, cy: 742, leftPct: 40.5, topPct: 63, number: 2, isCorrect: true, hitSize: 68 },
    { id: "hs3", cx: 778, cy: 688, leftPct: 48, topPct: 69, number: 3, isCorrect: true, hitSize: 68 },
    { id: "hs4", cx: 1170, cy: 745, leftPct: 61, topPct: 69, number: 4, isCorrect: false, hitSize: 72 },
    { id: "hs5", cx: 1480, cy: 702, leftPct: 77, topPct: 65, number: 5, isCorrect: false, hitSize: 76 }
  ];

  function isCorrectId(id) {
    return id === "hs1" || id === "hs2" || id === "hs3";
  }

  function buildFeedbackRows(results, hotspotsData) {
    var rows = [];
    if (!results) return rows;
    var sel = results.selectedIds || [];

    HOTSPOT_ORDER.forEach(function (id) {
      if (sel.indexOf(id) === -1) return;
      var hd = hotspotsData[id];
      if (!hd) return;
      if (isCorrectId(id)) {
        rows.push({
          id: id,
          kind: "correct",
          label: hd.label,
          text: hd.correct_msg
        });
      } else {
        rows.push({
          id: id,
          kind: "incorrect",
          label: hd.label,
          text: hd.incorrect_msg
        });
      }
    });

    return rows;
  }

  function getScreenKey(phase, nSel, results) {
    if (phase !== "evaluating") {
      if (nSel === 0) return "screen1";
      if (nSel === 1) return "screen2";
      if (nSel === 2) return "screen3";
      return "screen4";
    }
    return results && results.correctCount === 3 ? "screen6" : "screen5";
  }

  function AppletContainer() {
    var h = window.MiniReact.h;
    var useState = window.MiniReact.useState;
    var useResponsiveLayout = window.useResponsiveLayout;
    var useAppletState = window.useAppletState;
    var useAudioFeedback = window.useAudioFeedback;

    useResponsiveLayout();
    var audio = useAudioFeedback();
    var st = useAppletState();

    var phase = st.phase;
    var selected = st.selected;
    var results = st.results;
    var nSel = selected.length;

    var locale = window.appData && window.appData.en ? window.appData.en : {};
    var ui = locale.ui || {};
    var screens = (ui && ui.screens) || {};
    var fb = locale.feedback || {};
    var hotspotsData = locale.hotspots || {};
    var cfState = useState(0);
    var continueStep = cfState[0];
    var setContinueStep = cfState[1];

    var screenKey = getScreenKey(phase, nSel, results);
    var screenCopy = screens[screenKey] || {};
    var incorrectCount =
      phase === "evaluating" && results && results.incorrectSelected
        ? results.incorrectSelected.length
        : 0;
    var dialogue = screenCopy.dialogue || "";
    if (screenKey === "screen5") {
      dialogue = "You caught some valid risks, but missed " + (incorrectCount || 1) + " " +
        ((incorrectCount || 1) === 1 ? "item." : "items.");
    }

    function handleToggle(id) {
      if (phase === "evaluating") return;
      var was = selected.indexOf(id) !== -1;
      if (!was && selected.length >= 3) {
        audio.click();
        return;
      }
      st.toggleHotspot(id);
      if (was) audio.deselect();
      else audio.select();
    }

    function handleSubmit() {
      if (selected.length !== 3) return;
      var c = selected.filter(isCorrectId).length;
      audio.submit();
      st.submitSelection();
      setContinueStep(0);
      if (c === 3) audio.correct();
      else if (c === 0) audio.wrong();
      else audio.partial();
    }

    function handleRetry() {
      audio.reset();
      setContinueStep(0);
      st.resetAll();
    }

    function handleContinue() {
      audio.click();
      if (continueStep < 2) {
        setContinueStep(continueStep + 1);
        return;
      }
      setContinueStep(0);
      st.resetAll();
    }

    var rows = buildFeedbackRows(results, hotspotsData);
    var feedbackHeader = ui.feedback_panel_title || "Feedback";
    var panelLeadIn = screenCopy.lead_in || "";
    var feedbackBody = screenCopy.footer || "";
    var preSubmit = phase !== "evaluating";
    var flow = (fb && fb.correct_flow) || {};
    var panelMode = "feedback";
    if (screenKey === "screen6" && continueStep === 1) panelMode = "remember";
    if (screenKey === "screen6" && continueStep >= 2) panelMode = "summary";
    if (screenKey === "screen6" && continueStep > 0) {
      dialogue = "";
      panelLeadIn = "";
      feedbackBody = continueStep === 1
        ? "Select Continue to view the summary notes."
        : "Select Continue to close, or Retry to inspect again.";
    }
    var submitDisabled = nSel !== 3 || phase === "evaluating";
    var primaryAction = null;
    var secondaryAction = null;

    if (screenKey === "screen5") {
      primaryAction = {
        label: ui.btn_retry || "Retry",
        variant: "primary",
        onClick: handleRetry
      };
    } else if (screenKey === "screen6") {
      primaryAction = {
        label: ui.btn_continue || "Continue",
        variant: "primary",
        onClick: handleContinue
      };
      secondaryAction = {
        label: ui.btn_retry || "Retry",
        variant: "secondary",
        onClick: handleRetry
      };
    } else {
      primaryAction = {
        label: ui.btn_submit || "Submit",
        variant: "primary",
        disabled: submitDisabled,
        onClick: submitDisabled ? null : handleSubmit
      };
    }

    return h("div", { className: "applet-root" },
      h(window.NavBar, {
        title: ui.title,
        instruction: ui.instruction
      }),
      h("div", { className: "applet-stage" },
        h("div", { className: "applet-work-area" },
          h("div", { className: "applet-scene-wrap" },
            h(window.LabScene, {
              hotspotConfigs: HOTSPOT_LAYOUT,
              phase: phase,
              selectedIds: selected,
              results: results,
              assistantMessage: dialogue,
              highlightMissedCorrect: false
            }),
            h(window.SceneHitLayer, {
              hotspotConfigs: HOTSPOT_LAYOUT,
              phase: phase,
              onToggleHotspot: handleToggle
            })
          ),
          h(window.FeedbackPanel, {
            header: feedbackHeader,
            showBody: !preSubmit,
            mode: panelMode,
            leadIn: panelLeadIn,
            rows: rows,
            reinforcement: panelMode === "feedback" && screenKey === "screen5" ? fb.reinforcement : null,
            rememberTitle: flow.remember_title,
            rememberPoints: flow.remember_points || [],
            rememberIcons: flow.remember_icons || [],
            summaryTitle: flow.summary_title,
            summaryBody: flow.summary_body,
            summaryPoints: flow.summary_points || []
          })
        ),
        h(window.ControlBar, {
          instructionText: feedbackBody,
          primaryAction: primaryAction,
          secondaryAction: secondaryAction
        })
      )
    );
  }

  window.AppletContainer = AppletContainer;
})();
