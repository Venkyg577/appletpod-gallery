// =============================================================================
// Content Flow Controller — guided intro that teaches periods, groups, blocks
// and element types by annotating the real #periodic-table grid.
//
// Annotations (axis numbers, guide lines, axis labels, mode buttons) are
// injected as children of the grid itself, so they line up with the real
// element cells at any scale. Screens defined in contentFlowData.js
// (spec: doc/contentflow.md).
// =============================================================================

import { elements } from "../data/elementsData.js";
import {
  highlightPeriod,
  highlightGroup,
  highlightBlock,
  highlightElementCell,
  highlightTableCategory,
  clearTableHighlights,
  describeElementPlacement,
} from "./uiController.js";
import {
  CONTENT_FLOW_SCREENS,
  PERIOD_VALUES,
  GROUP_VALUES,
  BLOCK_VALUES,
  CATEGORY_VALUES,
} from "./contentFlowData.js";

const CONTROL_SETS = {
  period: () => PERIOD_VALUES.map((v) => ({ value: v, label: String(v) })),
  group: () => GROUP_VALUES.map((v) => ({ value: v, label: String(v) })),
  block: () => BLOCK_VALUES,
  category: () => CATEGORY_VALUES,
};

export function initContentFlow(tableContainer, { onComplete } = {}) {
  if (!tableContainer || document.getElementById("content-flow-overlay")) return null;

  let index = 0;
  let timer = null;
  let destroyed = false;

  const caption = buildCaption();
  const panel = buildPanel();
  const axisLayer = buildAxisLayer();
  const modeBar = buildModeBar();

  // The statement lives in the global nav bar, replacing the pill/search row
  // for the duration of the flow.
  const host = tableContainer.parentElement || document.body;
  const navBar = document.getElementById("global-nav");
  if (navBar) navBar.appendChild(caption);
  else host.insertBefore(caption, tableContainer);
  host.appendChild(panel);
  tableContainer.appendChild(axisLayer);
  tableContainer.appendChild(modeBar);
  document.body.classList.add("content-flow-active");

  const captionText = caption.querySelector(".cf-caption-text");
  const controlsEl = panel.querySelector("#cf-controls");
  const infoEl = panel.querySelector("#cf-info");
  const nextBtn = panel.querySelector("#cf-next");
  const skipBtn = panel.querySelector("#cf-skip");
  const progressEl = panel.querySelector("#cf-progress");

  // Capture-phase: the real per-cell showModal handlers must not fire mid-intro.
  function onTableClick(event) {
    const cell = event.target.closest(".element");
    if (!cell || !tableContainer.contains(cell)) return;
    event.preventDefault();
    event.stopPropagation();
    if (!screenAt(index).interactive) return;
    const number = Number(cell.dataset.elementNumber);
    if (!Number.isNaN(number)) showElementInfo(number);
  }
  tableContainer.addEventListener("click", onTableClick, { capture: true });

  // ---- Mode buttons (Period / Group), shown in the table's empty gap ----
  modeBar.querySelectorAll(".cf-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearTimer();
      setAxis(btn.dataset.mode);
    });
  });

  function screenAt(i) {
    return CONTENT_FLOW_SCREENS[i] || CONTENT_FLOW_SCREENS[CONTENT_FLOW_SCREENS.length - 1];
  }

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  let currentAxis = null;
  let currentAxisValue = null;
  let currentElement = null;

  // Measures a representative cell per row/column using layout coordinates
  // (offsetLeft/offsetTop), which ignore the table's CSS scale transform.
  function measureTrack(axis, value) {
    const cells = [...tableContainer.querySelectorAll(".element")];
    const match = cells.find((el) => {
      const element = elements.find(
        (e) => e.number === Number(el.dataset.elementNumber),
      );
      if (!element || element.series === "lanthanide" || element.series === "actinide") {
        return false;
      }
      return axis === "period" ? element.row === value : element.column === value;
    });
    if (!match) return null;
    return {
      top: match.offsetTop,
      left: match.offsetLeft,
      width: match.offsetWidth,
      height: match.offsetHeight,
    };
  }

  // Renders the full axis legend: every number + guide line at once, as in the
  // source slides, rather than one row/column at a time.
  function setAxis(axis, { highlightValue = null } = {}) {
    currentAxis = axis;
    axisLayer.innerHTML = "";
    axisLayer.dataset.axis = axis || "";
    axisLayer.hidden = !axis;

    modeBar.querySelectorAll(".cf-mode-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === axis);
    });
    // The Period/Group toggle only applies to the two axis sections, but the
    // bar keeps occupying its space on every screen (visibility, not hidden)
    // so the table's computed layout — and the anchored panel — never shift.
    const showModes = axis === "period" || axis === "group";
    modeBar.hidden = false;
    modeBar.style.visibility = showModes ? "visible" : "hidden";
    modeBar.style.pointerEvents = showModes ? "auto" : "none";

    if (!axis) {
      currentAxisValue = null;
      clearTableHighlights(tableContainer);
      return;
    }

    const tableWidth = tableContainer.scrollWidth;
    const lastRow = measureTrack("period", 7);
    const rowsBottom = lastRow ? lastRow.top + lastRow.height : 0;

    // "both" draws the period and group legends together (element screens).
    const axesToDraw = axis === "both" ? ["period", "group"] : [axis];

    axesToDraw.forEach((ax) => {
      const values = ax === "period" ? PERIOD_VALUES : GROUP_VALUES;
      values.forEach((v) => {
        const box = measureTrack(ax, v);
        if (!box) return;

        const mark = document.createElement("button");
        mark.type = "button";
        mark.className = `cf-axis-mark cf-axis-${ax}`;
        mark.dataset.value = String(v);
        mark.textContent = String(v);
        if (ax === "period") {
          mark.style.top = `${box.top + box.height / 2}px`;
          mark.style.left = "0px";
        } else {
          mark.style.left = `${box.left + box.width / 2}px`;
          mark.style.top = "0px";
        }
        mark.addEventListener("click", () => {
          clearTimer();
          selectAxisValue(ax, v);
        });
        axisLayer.appendChild(mark);

        const line = document.createElement("span");
        line.className = `cf-axis-line cf-axis-line-${ax}`;
        line.dataset.value = String(v);
        if (ax === "period") {
          line.style.top = `${box.top + box.height / 2}px`;
          line.style.left = "0px";
          line.style.width = `${tableWidth}px`;
        } else {
          line.style.left = `${box.left + box.width / 2}px`;
          line.style.top = "0px";
          line.style.height = `${rowsBottom}px`;
        }
        axisLayer.appendChild(line);
      });
    });

    if (axis !== "both") {
      const label = document.createElement("span");
      label.className = "cf-axis-caption";
      label.textContent = axis === "period" ? "PERIODS" : "GROUPS";
      label.style.top = `${rowsBottom + 14}px`;
      axisLayer.appendChild(label);
    }

    // Period/Group sit as a centred heading on row 1, above the panel.
    const row1 = measureTrack("period", 1);
    if (row1) {
      modeBar.style.top = `${row1.top + row1.height / 2}px`;
      modeBar.style.transform = "translate(-50%, -50%)";
    }

    // The side panel tucks in just under that heading, in the same gap,
    // rather than floating in the page corner.
    positionPanel();

    if (highlightValue !== null) selectAxisValue(axis, highlightValue);
    else clearTableHighlights(tableContainer);
  }

  // Pin the panel to a FIXED rectangle in the table's empty gap: horizontally
  // between Be and B, vertically from row 2 down to the bottom of row 3. The
  // box never moves or resizes as screen content changes, so nothing shifts
  // or spills over the element cells.
  function positionPanel() {
    const be = tableContainer.querySelector('.element[data-element-number="4"]');
    const b = tableContainer.querySelector('.element[data-element-number="5"]');
    const li = tableContainer.querySelector('.element[data-element-number="3"]');
    // Sc (row 4) is the last row before the d-block fills the gap, so the
    // panel can claim rows 2-3 plus the empty space above Sc.
    const sc = tableContainer.querySelector('.element[data-element-number="21"]');
    if (!be || !b || !li || !sc) return;

    const gapLeft = be.getBoundingClientRect().right;
    const gapRight = b.getBoundingClientRect().left;
    const gapWidth = gapRight - gapLeft;
    if (gapWidth < 240) {
      // Too tight to sit inside the table — fall back to the stylesheet corner.
      delete panel.dataset.anchored;
      panel.style.cssText = "";
      return;
    }

    // Start just under the Period/Group heading rather than at row 2, so the
    // card sits higher in the gap and gains vertical room.
    const barBottom = modeBar.getBoundingClientRect().bottom;
    const top = Math.max(barBottom + 10, li.getBoundingClientRect().top - 34);
    const bottom = sc.getBoundingClientRect().top - 8;

    const inset = 14;
    panel.style.left = `${gapLeft + inset}px`;
    panel.style.width = `${gapWidth - inset * 2}px`;
    panel.style.top = `${top}px`;
    // Cap the height at the gap, but let a light screen (nav row only) shrink
    // to its content instead of reserving a tall empty card.
    panel.style.height = "auto";
    panel.style.maxHeight = `${bottom - top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.dataset.anchored = "true";
  }

  // Cell geometry changes when the table rescales; re-measure the annotations.
  function refreshAxis() {
    if (!currentAxis) {
      positionPanel();
      return;
    }
    // On element screens the selection is an element, not an axis value —
    // re-applying a stale axis value would highlight the wrong row/column.
    if (currentAxis === "both" && currentElement !== null) {
      setAxis(currentAxis);
      showElementInfo(currentElement);
    } else {
      setAxis(currentAxis, { highlightValue: currentAxisValue });
    }
  }
  const onResize = () => refreshAxis();
  window.addEventListener("resize", onResize);

  function selectAxisValue(axis, value) {
    currentAxisValue = value;
    currentElement = null;
    axisLayer.querySelectorAll(".cf-axis-mark, .cf-axis-line").forEach((el) => {
      el.classList.toggle("selected", Number(el.dataset.value) === value);
    });
    infoEl.hidden = true;
    if (axis === "period") highlightPeriod(tableContainer, value);
    else highlightGroup(tableContainer, value);
  }

  function showElementInfo(number) {
    const element = elements.find((e) => e.number === number);
    if (!element) return;
    currentElement = number;
    highlightElementCell(tableContainer, number);

    // Mark the element's own period row and group column green against the
    // dotted magenta legend, as in the source slides.
    const isDetached = element.series === "lanthanide" || element.series === "actinide";
    axisLayer.querySelectorAll(".cf-axis-mark, .cf-axis-line").forEach((el) => {
      const v = Number(el.dataset.value);
      const isPeriodEl = el.classList.contains("cf-axis-period")
        || el.classList.contains("cf-axis-line-period");
      const match = !isDetached
        && (isPeriodEl ? v === element.row : v === element.column);
      el.classList.toggle("selected", match);
    });

    infoEl.innerHTML = `
      <div class="cf-info-head"><span class="cf-info-num">${element.number}</span> <span class="cf-info-sym">${element.symbol}</span></div>
      <div class="cf-info-name">${element.name}</div>
      <div class="cf-info-body">${describeElementPlacement(element)}</div>
    `;
    infoEl.hidden = false;
  }

  function applyHighlight(highlight) {
    clearTableHighlights(tableContainer);
    infoEl.hidden = true;
    infoEl.innerHTML = "";
    if (!highlight) return;
    const { type, value } = highlight;
    if (type === "period" || type === "group") selectAxisValue(type, value);
    else if (type === "block") highlightBlock(tableContainer, value);
    else if (type === "category") highlightTableCategory(tableContainer, value);
    else if (type === "element") showElementInfo(value);
  }

  // Block / element-type chips live in the side panel; axis controls do not
  // (they are drawn on the table instead).
  function renderControls(screen) {
    controlsEl.innerHTML = "";
    const kind = screen.controls;
    const chipKind = kind === "block" || kind === "category" ? kind : null;
    controlsEl.hidden = !chipKind;
    if (!chipKind) return;

    CONTROL_SETS[chipKind]().forEach(({ value, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cf-pill";
      btn.textContent = label;
      btn.dataset.value = String(value);
      btn.addEventListener("click", () => {
        clearTimer();
        controlsEl.querySelectorAll(".cf-pill").forEach((b) => {
          b.classList.toggle("active", b === btn);
        });
        applyHighlight({ type: chipKind, value });
      });
      controlsEl.appendChild(btn);
    });

    if (screen.highlight && screen.highlight.type === chipKind) {
      const match = controlsEl.querySelector(
        `.cf-pill[data-value="${screen.highlight.value}"]`,
      );
      if (match) match.classList.add("active");
    }
  }

  function render() {
    const screen = screenAt(index);
    captionText.textContent = screen.caption || "";
    caption.hidden = !screen.caption;
    progressEl.textContent = `${index + 1} / ${CONTENT_FLOW_SCREENS.length}`;

    // Drop any element card carried over from a previous screen.
    infoEl.hidden = true;
    infoEl.innerHTML = "";
    currentElement = null;
    currentAxisValue = null;

    // Axis annotations follow the screen's section. Element screens show both
    // legends at once, dotted, per the source slides.
    const isElementScreen =
      screen.interactive === "element"
      || (screen.highlight && screen.highlight.type === "element");
    const axis = isElementScreen
      ? "both"
      : screen.controls === "period"
        ? "period"
        : screen.controls === "group"
          ? "group"
          : null;
    const axisHighlight =
      screen.highlight && (screen.highlight.type === "period" || screen.highlight.type === "group")
        ? screen.highlight.value
        : null;
    setAxis(axis, { highlightValue: axisHighlight });

    renderControls(screen);
    if (axis === "both" || !axis) applyHighlight(screen.highlight);

    // Caption length changes the nav height, which rescales the table, so
    // re-measure once layout has settled — otherwise the box shifts per screen.
    positionPanel();
    requestAnimationFrame(() => {
      if (destroyed) return;
      refreshAxis();
      positionPanel();
    });

    nextBtn.textContent = screen.isFinal ? "Explore the table" : "Next";
    skipBtn.hidden = !!screen.isFinal;

    clearTimer();
  }

  function goNext() {
    clearTimer();
    if (index >= CONTENT_FLOW_SCREENS.length - 1) {
      finish();
      return;
    }
    index += 1;
    render();
  }

  function finish() {
    if (destroyed) return;
    destroy();
    if (typeof onComplete === "function") onComplete();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    clearTimer();
    tableContainer.removeEventListener("click", onTableClick, { capture: true });
    window.removeEventListener("resize", onResize);
    clearTableHighlights(tableContainer);
    document.body.classList.remove("content-flow-active");
    axisLayer.remove();
    modeBar.remove();
    caption.remove();
    panel.remove();
  }

  nextBtn.addEventListener("click", goNext);
  skipBtn.addEventListener("click", finish);

  render();

  return { destroy, finish };
}

function buildCaption() {
  const el = document.createElement("div");
  el.className = "cf-caption-bar";
  el.innerHTML = `<p class="cf-caption-text"></p>`;
  return el;
}

function buildAxisLayer() {
  const el = document.createElement("div");
  el.className = "cf-axis-layer";
  el.id = "cf-axis-layer";
  return el;
}

function buildModeBar() {
  const el = document.createElement("div");
  el.className = "cf-mode-bar";
  el.hidden = true;
  el.innerHTML = `
    <button type="button" class="cf-mode-btn" data-mode="period">Period</button>
    <button type="button" class="cf-mode-btn" data-mode="group">Group</button>
  `;
  return el;
}

function buildPanel() {
  const el = document.createElement("div");
  el.id = "content-flow-overlay";
  el.className = "content-flow-overlay";
  el.innerHTML = `
    <div class="cf-panel">
      <div class="cf-panel-scroll">
        <div class="cf-controls" id="cf-controls" hidden></div>
        <div class="cf-info-bubble" id="cf-info" hidden></div>
      </div>
      <div class="cf-nav">
        <span class="cf-progress" id="cf-progress"></span>
        <button type="button" class="cf-btn cf-btn-ghost" id="cf-skip">Skip intro</button>
        <button type="button" class="cf-btn cf-btn-primary" id="cf-next">Next</button>
      </div>
    </div>
  `;
  return el;
}
