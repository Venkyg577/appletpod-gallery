function FeedbackPanel(props) {
  var h = window.MiniReact.h;
  var showBody = !!props.showBody;
  var mode = props.mode || "feedback";
  var rows = props.rows || [];
  var rememberPoints = props.rememberPoints || [];
  var rememberIcons = props.rememberIcons || [];
  var summaryPoints = props.summaryPoints || [];

  var rowNodes = rows.map(function (r, i) {
    return h(window.FeedbackRow, {
      key: r.id || "r" + i,
      kind: r.kind,
      label: r.label,
      text: r.text
    });
  });

  var reinforcement = props.reinforcement
    ? h(
        "p",
        { className: "feedback-panel__reinforcement" },
        props.reinforcement
      )
    : null;

  var rememberNodes = rememberPoints.map(function (text, i) {
    var icon = rememberIcons[i] || null;
    return h(
      "li",
      { key: "remember-" + i, className: "feedback-panel__remember-card" },
      icon && icon.src
        ? h("img", {
            className: "feedback-panel__remember-icon-image",
            src: icon.src,
            alt: icon.alt || "",
            draggable: false
          })
        : h("span", { className: "feedback-panel__remember-icon", "aria-hidden": "true" }, "•"),
      h("span", { className: "feedback-panel__remember-text" }, text)
    );
  });

  var summaryNodes = summaryPoints.map(function (text, i) {
    return h("li", { key: "summary-" + i, className: "feedback-panel__point" }, text);
  });

  var bodyNode = null;
  if (showBody && mode === "remember") {
    bodyNode = h(
      "div",
      { className: "feedback-panel__stack" },
      h("h3", { className: "feedback-panel__subheader" }, props.rememberTitle || "What to remember"),
      h("ul", { className: "feedback-panel__list" }, rememberNodes)
    );
  } else if (showBody && mode === "summary") {
    bodyNode = h(
      "div",
      { className: "feedback-panel__stack" },
      h("h3", { className: "feedback-panel__subheader" }, props.summaryTitle || "Summary and next step"),
      props.summaryBody
        ? h("p", { className: "feedback-panel__summary-body" }, props.summaryBody)
        : null,
      h("ul", { className: "feedback-panel__list" }, summaryNodes)
    );
  } else if (showBody) {
    bodyNode = h(
      "div",
      { className: "feedback-panel__stack" },
      props.leadIn
        ? h("p", { className: "feedback-panel__lead-in" }, props.leadIn)
        : null,
      h("div", { className: "feedback-rows" }, rowNodes),
      reinforcement
    );
  }

  return h(
    "div",
    {
      className: "feedback-panel" + (showBody ? " feedback-panel--active" : ""),
      role: "region",
      "aria-modal": "false",
      "aria-labelledby": "feedback-panel-title"
    },
    h("div", { className: "feedback-panel__left" },
      mode === "feedback"
        ? h(
            "h2",
            { id: "feedback-panel-title", className: "feedback-panel__header" },
            props.header || ""
          )
        : null,
      bodyNode
    )
  );
}

window.FeedbackPanel = FeedbackPanel;
