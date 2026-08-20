// =============================================================================
// Question Generator — builds practice questions from an element's derived
// orbital data (orbitalEngine.js). Pure logic, no DOM. Each generator returns
// a plain question object; the UI layer renders it and calls the matching
// check* function to grade a submitted answer.
// =============================================================================

import {
  getElectronConfiguration,
  formatConfiguration,
  getOrbitalBoxDiagram,
  getQuantumNumbersForSubshell,
  validateQuantumNumberSet,
  AUFBAU_EXCEPTIONS,
} from "./orbitalEngine.js";

function pickRandom(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// 1. Build-the-configuration: student fills in subshell + electron count pairs
//    for blanked-out entries in the element's full configuration.
// ---------------------------------------------------------------------------
export function generateConfigQuestion(atomicNumber, { blankCount = null, rng = Math.random } = {}) {
  const config = getElectronConfiguration(atomicNumber);
  const n = blankCount ?? Math.min(3, config.length);
  const blankIndices = new Set();
  while (blankIndices.size < Math.min(n, config.length)) {
    blankIndices.add(Math.floor(rng() * config.length));
  }

  const prompt = config.map((entry, i) => ({
    subshell: entry.subshell,
    electrons: blankIndices.has(i) ? null : entry.electrons,
    isBlank: blankIndices.has(i),
  }));

  return {
    type: "config-fill",
    atomicNumber,
    prompt,
    fullConfigDisplay: formatConfiguration(config),
    answer: config.map((e) => ({ subshell: e.subshell, electrons: e.electrons })),
  };
}

export function checkConfigAnswer(question, userAnswer) {
  const results = question.answer.map((expected, i) => {
    const given = userAnswer[i];
    const correct =
      given &&
      given.subshell === expected.subshell &&
      Number(given.electrons) === expected.electrons;
    return { index: i, correct, expected, given };
  });
  return {
    correct: results.every((r) => r.correct),
    results,
    score: results.filter((r) => r.correct).length,
    total: results.length,
  };
}

// ---------------------------------------------------------------------------
// 2. Orbital box diagram: student places up/down arrows into boxes for a
//    chosen subshell of the element, following Aufbau + Hund's rule + Pauli.
// ---------------------------------------------------------------------------
export function generateOrbitalDiagramQuestion(atomicNumber, { subshell = null, rng = Math.random } = {}) {
  const config = getElectronConfiguration(atomicNumber);
  const target = subshell
    ? config.find((s) => s.subshell === subshell)
    : pickRandom(config.filter((s) => s.electrons > 0), rng);

  if (!target) {
    throw new Error(`No fillable subshell found for Z=${atomicNumber}`);
  }

  const boxes = getOrbitalBoxDiagram(target);
  return {
    type: "orbital-diagram",
    atomicNumber,
    subshell: target.subshell,
    n: target.n,
    l: target.l,
    electronCount: target.electrons,
    boxCount: boxes.length,
    answer: boxes, // array of arrays: [["up"], ["up","down"], ...]
  };
}

/**
 * userBoxes: array of arrays of "up"/"down" strings, same shape as answer.
 * Validates against physical rules (Pauli: max 2 per box, opposite spins;
 * correct total count) AND against Hund's-rule ground-state filling.
 */
export function checkOrbitalDiagramAnswer(question, userBoxes) {
  const errors = [];

  if (!Array.isArray(userBoxes) || userBoxes.length !== question.boxCount) {
    return { correct: false, errors: ["Box count mismatch"], pauliViolations: [], matchesGroundState: false };
  }

  let totalElectrons = 0;
  const pauliViolations = [];
  userBoxes.forEach((box, i) => {
    if (box.length > 2) {
      pauliViolations.push({ box: i, reason: "More than 2 electrons in one orbital" });
    }
    if (box.length === 2 && box[0] === box[1]) {
      pauliViolations.push({ box: i, reason: "Two electrons with the same spin (Pauli exclusion violated)" });
    }
    totalElectrons += box.length;
  });

  if (totalElectrons !== question.electronCount) {
    errors.push(`Expected ${question.electronCount} electrons total, got ${totalElectrons}`);
  }

  const matchesGroundState =
    pauliViolations.length === 0 &&
    JSON.stringify(userBoxes) === JSON.stringify(question.answer);

  return {
    correct: matchesGroundState && errors.length === 0,
    errors,
    pauliViolations,
    matchesGroundState,
  };
}

// ---------------------------------------------------------------------------
// 3. Quantum number assignment: given a subshell + electron index, ask the
//    student to supply (or select from choices) valid quantum numbers, OR
//    ask them to spot an invalid quantum number set (JEE/NEET staple).
// ---------------------------------------------------------------------------
export function generateQuantumNumberQuestion(atomicNumber, { subshell = null, mode = "assign", rng = Math.random } = {}) {
  const config = getElectronConfiguration(atomicNumber);
  const target = subshell
    ? config.find((s) => s.subshell === subshell)
    : pickRandom(config.filter((s) => s.electrons > 0), rng);

  if (!target) {
    throw new Error(`No fillable subshell found for Z=${atomicNumber}`);
  }

  const validSets = getQuantumNumbersForSubshell(target);

  if (mode === "spot-invalid") {
    // Build 3 valid sets (from this subshell, or plausible neighbors) + 1 invalid set.
    const distractors = buildInvalidDistractors(target, rng);
    const correctAnswerSet = pickRandom(validSets, rng);
    const options = shuffle(
      [correctAnswerSet, ...distractors.slice(0, 3)].map((qn, i) => ({
        id: i,
        qn,
      })),
      rng,
    );
    const invalidOption = options.find((o) => !validateQuantumNumberSet(o.qn).valid);
    return {
      type: "quantum-spot-invalid",
      atomicNumber,
      subshell: target.subshell,
      options,
      answerOptionId: invalidOption ? invalidOption.id : null,
    };
  }

  // mode === "assign": ask for the full set for a specific electron in the subshell.
  const electronIndex = Math.floor(rng() * target.electrons);
  return {
    type: "quantum-assign",
    atomicNumber,
    subshell: target.subshell,
    n: target.n,
    l: target.l,
    electronIndex,
    answer: validSets[electronIndex],
  };
}

function buildInvalidDistractors({ n, l }, rng) {
  const invalidCandidates = [
    { n, l: l + 1, m_l: 0, m_s: 0.5 }, // l too large for n
    { n, l, m_l: l + 1, m_s: 0.5 }, // m_l out of range
    { n, l, m_l: 0, m_s: 0 }, // invalid m_s
    { n: 0, l: 0, m_l: 0, m_s: 0.5 }, // invalid n
  ];
  return shuffle(invalidCandidates, rng);
}

function shuffle(arr, rng) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function checkQuantumAssignAnswer(question, userAnswer) {
  const expected = question.answer;
  const correct =
    Number(userAnswer.n) === expected.n &&
    Number(userAnswer.l) === expected.l &&
    Number(userAnswer.m_l) === expected.m_l &&
    Number(userAnswer.m_s) === expected.m_s;
  return { correct, expected };
}

export function checkQuantumSpotInvalidAnswer(question, selectedOptionId) {
  return {
    correct: selectedOptionId === question.answerOptionId,
    answerOptionId: question.answerOptionId,
  };
}

// ---------------------------------------------------------------------------
// 4. Anomalous configuration tier: only offered for elements in
//    AUFBAU_EXCEPTIONS. Asks the student to identify why the naive Aufbau
//    prediction is wrong (extra stability from half-filled/filled d or f).
// ---------------------------------------------------------------------------
export function generateAnomalyQuestion(atomicNumber) {
  if (!AUFBAU_EXCEPTIONS[atomicNumber]) {
    return null;
  }
  const config = getElectronConfiguration(atomicNumber);
  const actualDisplay = formatConfiguration(config);
  return {
    type: "anomaly-identify",
    atomicNumber,
    actualConfigDisplay: actualDisplay,
    reasonOptions: [
      { id: 0, text: "Extra stability from a half-filled or fully-filled subshell", correct: true },
      { id: 1, text: "A calculation error in the periodic table", correct: false },
      { id: 2, text: "The element is radioactive, so electrons behave unpredictably", correct: false },
      { id: 3, text: "Electrons always fill the lowest n first, regardless of subshell", correct: false },
    ],
  };
}

export function checkAnomalyAnswer(question, selectedOptionId) {
  const option = question.reasonOptions.find((o) => o.id === selectedOptionId);
  return { correct: !!option?.correct };
}

// ---------------------------------------------------------------------------
// Session builder: assembles a mixed practice set for one element.
// ---------------------------------------------------------------------------
export function buildPracticeSession(atomicNumber, { rng = Math.random } = {}) {
  const questions = [
    generateConfigQuestion(atomicNumber, { rng }),
    generateOrbitalDiagramQuestion(atomicNumber, { rng }),
    generateQuantumNumberQuestion(atomicNumber, { mode: "assign", rng }),
    generateQuantumNumberQuestion(atomicNumber, { mode: "spot-invalid", rng }),
  ];
  const anomaly = generateAnomalyQuestion(atomicNumber);
  if (anomaly) questions.push(anomaly);
  return { atomicNumber, questions };
}
