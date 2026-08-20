// =============================================================================
// Practice Modal Controller — wires the orbital engine + question generator
// into the element modal as a step system: Learn / Practice / Interact / Answer.
// Learn and Interact reuse the modal's existing info-pane / 3D-atom content;
// Practice and Answer are new full-width steps rendered into dedicated panels.
// =============================================================================

import { getElectronConfiguration, formatConfiguration } from "./orbitalEngine.js";
import {
  generateConfigQuestion,
  checkConfigAnswer,
  generateOrbitalDiagramQuestion,
  checkOrbitalDiagramAnswer,
  generateQuantumNumberQuestion,
  checkQuantumAssignAnswer,
  checkQuantumSpotInvalidAnswer,
  generateAnomalyQuestion,
  checkAnomalyAnswer,
} from "./questionGenerator.js";

const STEPS = ["learn", "practice", "interact", "answer"];

let state = null; // { atomicNumber, practice: {...}, answer: {...} }

function qs(id) {
  return document.getElementById(id);
}

/** Call once per element-modal open (from showModal, after 3D init). */
export function initPracticeForElement(atomicNumber) {
  state = {
    atomicNumber,
    practice: buildPracticeStepState(atomicNumber),
    answer: buildAnswerStepState(atomicNumber),
  };
  setStep("learn");
  renderPracticeStep();
  renderAnswerStep();
}

function buildPracticeStepState(atomicNumber) {
  const configQuestion = generateConfigQuestion(atomicNumber, { blankCount: 3 });
  const diagramQuestion = generateOrbitalDiagramQuestion(atomicNumber);
  return {
    configQuestion,
    configUserAnswer: configQuestion.prompt.map((p) => ({
      subshell: p.subshell,
      electrons: p.isBlank ? null : p.electrons,
    })),
    configChecked: false,
    diagramQuestion,
    diagramUserBoxes: diagramQuestion.answer.map(() => []),
    diagramChecked: false,
  };
}

function buildAnswerStepState(atomicNumber) {
  const assignQuestion = generateQuantumNumberQuestion(atomicNumber, { mode: "assign" });
  const spotQuestion = generateQuantumNumberQuestion(atomicNumber, { mode: "spot-invalid" });
  const anomalyQuestion = generateAnomalyQuestion(atomicNumber);
  return {
    assignQuestion,
    assignUserAnswer: { n: null, l: null, m_l: null, m_s: null },
    spotQuestion,
    spotSelectedId: null,
    anomalyQuestion,
    anomalySelectedId: null,
    submitted: false,
  };
}

// ---------------------------------------------------------------------------
// Step bar
// ---------------------------------------------------------------------------

export function setStep(stepName) {
  if (!STEPS.includes(stepName)) return;
  const modal = qs("element-modal");
  if (!modal) return;
  modal.querySelectorAll(".modal-step-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.step === stepName);
  });
  modal.querySelectorAll(".modal-step-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.stepPanel === stepName);
  });
  relocateVisualPane(stepName);
  window.dispatchEvent(new Event("resize")); // let threeRenderer re-fit its canvas
}

// The 3D atom view (.modal-visual-pane, containing #atom-container) is a single
// Three.js scene — it is physically moved between the Learn panel and the
// Interact slot rather than duplicated, to avoid running two WebGL contexts.
function relocateVisualPane(stepName) {
  const visualPane = document.querySelector(".modal-visual-pane");
  const learnPanel = qs("modal-content-primary")?.querySelector(".modal-step-panel-learn");
  const interactSlot = qs("interact-visual-slot");
  if (!visualPane || !learnPanel || !interactSlot) return;

  if (stepName === "interact") {
    if (visualPane.parentElement !== interactSlot) interactSlot.appendChild(visualPane);
  } else if (visualPane.parentElement !== learnPanel) {
    learnPanel.appendChild(visualPane);
  }
}

export function bindStepBar() {
  const modal = qs("element-modal");
  if (!modal || modal.dataset.stepBarBound) return;
  modal.querySelectorAll(".modal-step-btn").forEach((btn) => {
    btn.addEventListener("click", () => setStep(btn.dataset.step));
  });
  modal.dataset.stepBarBound = "true";
}

// ---------------------------------------------------------------------------
// Practice step: config fill-in + orbital diagram
// ---------------------------------------------------------------------------

function renderPracticeStep() {
  const container = qs("practice-step-body");
  if (!container || !state) return;

  const { diagramQuestion } = state.practice;

  container.innerHTML = `
    <div class="practice-section">
      <h3 class="practice-section-title">Complete the Electron Configuration</h3>
      <p class="practice-section-hint">Fill in the missing subshell electron counts, in order.</p>
      <div class="config-fill-row" id="config-fill-row"></div>
      <div class="practice-actions">
        <button type="button" class="practice-check-btn" id="config-check-btn">Check</button>
        <span class="practice-result" id="config-result"></span>
      </div>
    </div>
    <div class="practice-section">
      <h3 class="practice-section-title">Orbital Box Diagram — ${diagramQuestion.subshell}</h3>
      <p class="practice-section-hint">Click a box to add an electron (↑), click again to pair (↑↓), click again to clear. Follow Hund's rule.</p>
      <div class="orbital-boxes-row" id="orbital-boxes-row"></div>
      <div class="practice-actions">
        <button type="button" class="practice-check-btn" id="diagram-check-btn">Check</button>
        <span class="practice-result" id="diagram-result"></span>
      </div>
    </div>
  `;

  renderConfigFillInputs();
  renderOrbitalBoxes();

  qs("config-check-btn").addEventListener("click", handleConfigCheck);
  qs("diagram-check-btn").addEventListener("click", handleDiagramCheck);
}

function renderConfigFillInputs() {
  const row = qs("config-fill-row");
  if (!row) return;
  const { configQuestion, configUserAnswer } = state.practice;

  row.innerHTML = configQuestion.prompt
    .map((p, i) => {
      if (!p.isBlank) {
        return `<span class="config-token config-token-fixed">${p.subshell}<sup>${p.electrons}</sup></span>`;
      }
      return `
        <span class="config-token config-token-blank">
          <span class="config-token-subshell">${p.subshell}</span><sup>
            <input type="number" min="0" max="14" class="config-blank-input" data-index="${i}"
              value="${configUserAnswer[i].electrons ?? ""}" aria-label="Electrons in ${p.subshell}">
          </sup>
        </span>
      `;
    })
    .join("");

  row.querySelectorAll(".config-blank-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = Number(e.target.dataset.index);
      const val = e.target.value === "" ? null : Number(e.target.value);
      state.practice.configUserAnswer[idx].electrons = val;
    });
  });
}

function handleConfigCheck() {
  const { configQuestion, configUserAnswer } = state.practice;
  const result = checkConfigAnswer(configQuestion, configUserAnswer);
  state.practice.configChecked = true;

  const row = qs("config-fill-row");
  row.querySelectorAll(".config-blank-input").forEach((input) => {
    const idx = Number(input.dataset.index);
    const r = result.results[idx];
    input.closest(".config-token").classList.toggle("config-token-correct", r.correct);
    input.closest(".config-token").classList.toggle("config-token-incorrect", !r.correct);
  });

  const resultEl = qs("config-result");
  resultEl.textContent = result.correct
    ? `Correct — ${formatConfiguration(getElectronConfiguration(state.atomicNumber))}`
    : `${result.score}/${result.total} correct — keep trying`;
  resultEl.classList.toggle("practice-result-correct", result.correct);
  resultEl.classList.toggle("practice-result-incorrect", !result.correct);
}

function renderOrbitalBoxes() {
  const row = qs("orbital-boxes-row");
  if (!row) return;
  const { diagramUserBoxes } = state.practice;

  row.innerHTML = diagramUserBoxes
    .map((box, i) => {
      const arrows = box.map((spin) => (spin === "up" ? "↑" : "↓")).join("");
      return `<button type="button" class="orbital-box" data-index="${i}" aria-label="Orbital box ${i + 1}">${arrows}</button>`;
    })
    .join("");

  row.querySelectorAll(".orbital-box").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      cycleBox(idx);
      renderOrbitalBoxes();
    });
  });
}

function cycleBox(idx) {
  const box = state.practice.diagramUserBoxes[idx];
  if (box.length === 0) {
    box.push("up");
  } else if (box.length === 1) {
    box.push("down");
  } else {
    box.length = 0;
  }
}

function handleDiagramCheck() {
  const { diagramQuestion, diagramUserBoxes } = state.practice;
  const result = checkOrbitalDiagramAnswer(diagramQuestion, diagramUserBoxes);
  state.practice.diagramChecked = true;

  const row = qs("orbital-boxes-row");
  row.querySelectorAll(".orbital-box").forEach((btn, i) => {
    const hasViolation = result.pauliViolations.some((v) => v.box === i);
    btn.classList.toggle("orbital-box-violation", hasViolation);
  });

  const resultEl = qs("diagram-result");
  if (result.correct) {
    resultEl.textContent = "Correct — matches ground-state filling";
  } else if (result.pauliViolations.length > 0) {
    resultEl.textContent = `Pauli exclusion violated: ${result.pauliViolations[0].reason}`;
  } else if (result.errors.length > 0) {
    resultEl.textContent = result.errors[0];
  } else {
    resultEl.textContent = "Not quite — check Hund's rule (fill singly before pairing)";
  }
  resultEl.classList.toggle("practice-result-correct", result.correct);
  resultEl.classList.toggle("practice-result-incorrect", !result.correct);
}

// ---------------------------------------------------------------------------
// Answer step: quantum numbers + anomaly, submitted together and scored
// ---------------------------------------------------------------------------

function renderAnswerStep() {
  const container = qs("answer-step-body");
  if (!container || !state) return;

  const { assignQuestion, spotQuestion, anomalyQuestion } = state.answer;

  let html = `
    <div class="practice-section">
      <h3 class="practice-section-title">Assign Quantum Numbers</h3>
      <p class="practice-section-hint">
        Give the (n, l, m<sub>l</sub>, m<sub>s</sub>) set for electron #${state.answer.assignQuestion.electronIndex + 1}
        in the ${assignQuestion.subshell} subshell.
      </p>
      <div class="qn-input-row">
        <label>n <input type="number" class="qn-input" data-field="n"></label>
        <label>l <input type="number" class="qn-input" data-field="l"></label>
        <label>m<sub>l</sub> <input type="number" class="qn-input" data-field="m_l"></label>
        <label>m<sub>s</sub>
          <select class="qn-input" data-field="m_s">
            <option value="">--</option>
            <option value="0.5">+1/2</option>
            <option value="-0.5">-1/2</option>
          </select>
        </label>
      </div>
    </div>
    <div class="practice-section">
      <h3 class="practice-section-title">Spot the Invalid Quantum Number Set</h3>
      <p class="practice-section-hint">One of these four sets violates the quantum number rules. Which one?</p>
      <div class="qn-options" id="spot-options">
        ${spotQuestion.options
          .map(
            (opt) => `
          <button type="button" class="qn-option-btn" data-option-id="${opt.id}">
            (${opt.qn.n}, ${opt.qn.l}, ${opt.qn.m_l}, ${opt.qn.m_s > 0 ? "+1/2" : "-1/2"})
          </button>
        `,
          )
          .join("")}
      </div>
    </div>
  `;

  if (anomalyQuestion) {
    html += `
      <div class="practice-section">
        <h3 class="practice-section-title">Why the Anomaly?</h3>
        <p class="practice-section-hint">
          This element's actual configuration is <strong>${anomalyQuestion.actualConfigDisplay}</strong>,
          which differs from a naive Aufbau prediction. Why?
        </p>
        <div class="qn-options" id="anomaly-options">
          ${anomalyQuestion.reasonOptions
            .map(
              (opt) => `<button type="button" class="qn-option-btn qn-option-wide" data-option-id="${opt.id}">${opt.text}</button>`,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  html += `
    <div class="practice-actions">
      <button type="button" class="practice-check-btn" id="answer-submit-btn">Submit Answers</button>
      <span class="practice-result" id="answer-result"></span>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll(".qn-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const field = e.target.dataset.field;
      const val = e.target.value === "" ? null : Number(e.target.value);
      state.answer.assignUserAnswer[field] = val;
    });
  });

  const spotOptions = qs("spot-options");
  if (spotOptions) {
    spotOptions.querySelectorAll(".qn-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.answer.spotSelectedId = Number(btn.dataset.optionId);
        spotOptions.querySelectorAll(".qn-option-btn").forEach((b) => b.classList.remove("qn-option-selected"));
        btn.classList.add("qn-option-selected");
      });
    });
  }

  const anomalyOptions = qs("anomaly-options");
  if (anomalyOptions) {
    anomalyOptions.querySelectorAll(".qn-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.answer.anomalySelectedId = Number(btn.dataset.optionId);
        anomalyOptions.querySelectorAll(".qn-option-btn").forEach((b) => b.classList.remove("qn-option-selected"));
        btn.classList.add("qn-option-selected");
      });
    });
  }

  qs("answer-submit-btn").addEventListener("click", handleAnswerSubmit);
}

function handleAnswerSubmit() {
  const { assignQuestion, assignUserAnswer, spotQuestion, spotSelectedId, anomalyQuestion, anomalySelectedId } =
    state.answer;

  let correctCount = 0;
  let totalCount = 0;

  totalCount++;
  const assignResult = checkQuantumAssignAnswer(assignQuestion, assignUserAnswer);
  if (assignResult.correct) correctCount++;

  totalCount++;
  const spotResult = checkQuantumSpotInvalidAnswer(spotQuestion, spotSelectedId);
  if (spotResult.correct) correctCount++;

  let anomalyResult = null;
  if (anomalyQuestion) {
    totalCount++;
    anomalyResult = checkAnomalyAnswer(anomalyQuestion, anomalySelectedId);
    if (anomalyResult.correct) correctCount++;
  }

  state.answer.submitted = true;

  const spotOptions = qs("spot-options");
  if (spotOptions) {
    spotOptions.querySelectorAll(".qn-option-btn").forEach((btn) => {
      const optId = Number(btn.dataset.optionId);
      if (optId === spotQuestion.answerOptionId) btn.classList.add("qn-option-correct");
      else if (optId === spotSelectedId) btn.classList.add("qn-option-incorrect");
    });
  }

  const anomalyOptions = qs("anomaly-options");
  if (anomalyOptions && anomalyQuestion) {
    const correctOpt = anomalyQuestion.reasonOptions.find((o) => o.correct);
    anomalyOptions.querySelectorAll(".qn-option-btn").forEach((btn) => {
      const optId = Number(btn.dataset.optionId);
      if (optId === correctOpt.id) btn.classList.add("qn-option-correct");
      else if (optId === anomalySelectedId) btn.classList.add("qn-option-incorrect");
    });
  }

  const resultEl = qs("answer-result");
  resultEl.textContent = `Score: ${correctCount}/${totalCount}`;
  resultEl.classList.toggle("practice-result-correct", correctCount === totalCount);
  resultEl.classList.toggle("practice-result-incorrect", correctCount < totalCount);
}
