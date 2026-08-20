// =============================================================================
// Orbital Engine — pure derivation logic for electron configuration,
// orbital diagrams, and quantum numbers. No DOM, no UI, no i18n.
// All functions are deterministic given an atomic number Z.
// =============================================================================

// Subshells in Aufbau (n + l, then n) fill order, up to Z=118.
// Each entry: { n, l, label, capacity }
const SUBSHELL_LABELS = ["s", "p", "d", "f"];
const SUBSHELL_CAPACITY = { s: 2, p: 6, d: 10, f: 14 };

function buildAufbauOrder() {
  // Generate (n, l) pairs and sort by (n + l), then by n, per the Madelung rule.
  const pairs = [];
  for (let n = 1; n <= 8; n++) {
    for (let l = 0; l < Math.min(n, 4); l++) {
      pairs.push({ n, l });
    }
  }
  pairs.sort((a, b) => {
    const sumA = a.n + a.l;
    const sumB = b.n + b.l;
    if (sumA !== sumB) return sumA - sumB;
    return a.n - b.n;
  });
  return pairs.map(({ n, l }) => ({
    n,
    l,
    label: SUBSHELL_LABELS[l],
    capacity: SUBSHELL_CAPACITY[SUBSHELL_LABELS[l]],
  }));
}

export const AUFBAU_ORDER = buildAufbauOrder();

// Standard JEE/NEET-recognized ground-state exceptions to strict Aufbau filling.
// Keyed by atomic number. Each value fully specifies the outer subshell electron
// counts that differ from naive Aufbau fill (extra stability from half-filled /
// fully-filled d or f subshells).
// This list covers the exceptions consistently tested at the JEE/NEET level;
// a few deep-transition/lanthanide/actinide edge cases beyond this are genuine
// spectroscopic irregularities with low pedagogical weight and are intentionally
// treated with plain Aufbau fill rather than every real-world anomaly.
export const AUFBAU_EXCEPTIONS = {
  24: { subshells: { "3d": 5, "4s": 1 } }, // Cr
  29: { subshells: { "3d": 10, "4s": 1 } }, // Cu
  41: { subshells: { "4d": 4, "5s": 1 } }, // Nb
  42: { subshells: { "4d": 5, "5s": 1 } }, // Mo
  44: { subshells: { "4d": 7, "5s": 1 } }, // Ru
  45: { subshells: { "4d": 8, "5s": 1 } }, // Rh
  46: { subshells: { "4d": 10, "5s": 0 } }, // Pd
  47: { subshells: { "4d": 10, "5s": 1 } }, // Ag
  57: { subshells: { "6s": 2, "4f": 0, "5d": 1 } }, // La
  58: { subshells: { "6s": 2, "4f": 1, "5d": 1 } }, // Ce
  64: { subshells: { "6s": 2, "4f": 7, "5d": 1 } }, // Gd
  78: { subshells: { "6s": 1, "4f": 14, "5d": 9 } }, // Pt
  79: { subshells: { "6s": 1, "4f": 14, "5d": 10 } }, // Au
  89: { subshells: { "7s": 2, "5f": 0, "6d": 1 } }, // Ac
  90: { subshells: { "7s": 2, "5f": 0, "6d": 2 } }, // Th
  91: { subshells: { "7s": 2, "5f": 2, "6d": 1 } }, // Pa
  92: { subshells: { "7s": 2, "5f": 3, "6d": 1 } }, // U
  93: { subshells: { "7s": 2, "5f": 4, "6d": 1 } }, // Np
  96: { subshells: { "7s": 2, "5f": 7, "6d": 1 } }, // Cm
  103: { subshells: { "7s": 2, "5f": 14, "7p": 1, "6d": 0 } }, // Lr (predicted 7p¹, not 6d¹)
  110: { subshells: { "7s": 1, "5f": 14, "6d": 9 } }, // Ds
  111: { subshells: { "7s": 1, "5f": 14, "6d": 10 } }, // Rg
};

/**
 * Returns the ground-state electron configuration for a given atomic number
 * as an ordered list of { n, l, label, subshell, electrons, capacity }.
 * subshell is the conventional string like "3d". Order is Aufbau fill order
 * (not the "n then l" order used for display) — callers that need periodic-
 * table-style grouped display order should sort by (n, l) themselves.
 */
export function getElectronConfiguration(atomicNumber) {
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    throw new RangeError(`atomicNumber must be an integer in [1, 118], got ${atomicNumber}`);
  }

  const exception = AUFBAU_EXCEPTIONS[atomicNumber];
  const filled = [];
  let remaining = atomicNumber;

  if (exception) {
    // Exceptions are specified as explicit outer-subshell electron counts.
    // Fill everything below the exception's lowest touched subshell normally,
    // then apply the explicit counts for the touched subshells, in Aufbau order.
    const touchedKeys = Object.keys(exception.subshells);
    const touchedIndices = touchedKeys.map((key) =>
      AUFBAU_ORDER.findIndex((s) => `${s.n}${s.label}` === key),
    );
    const firstTouchedIndex = Math.min(...touchedIndices);

    for (let i = 0; i < firstTouchedIndex; i++) {
      const s = AUFBAU_ORDER[i];
      const electrons = Math.min(s.capacity, remaining);
      filled.push({ ...s, subshell: `${s.n}${s.label}`, electrons });
      remaining -= electrons;
    }

    for (const key of touchedKeys) {
      const idx = AUFBAU_ORDER.findIndex((s) => `${s.n}${s.label}` === key);
      const s = AUFBAU_ORDER[idx];
      const electrons = exception.subshells[key];
      if (electrons > 0) {
        filled.push({ ...s, subshell: key, electrons });
      }
      remaining -= electrons;
    }

    // Continue Aufbau fill for anything after the touched region (rare, only
    // matters for exceptions defined well below Z; none of the current
    // AUFBAU_EXCEPTIONS entries need this, but keep it correct in general).
    const lastTouchedIndex = Math.max(...touchedIndices);
    for (let i = lastTouchedIndex + 1; i < AUFBAU_ORDER.length && remaining > 0; i++) {
      const s = AUFBAU_ORDER[i];
      const electrons = Math.min(s.capacity, remaining);
      filled.push({ ...s, subshell: `${s.n}${s.label}`, electrons });
      remaining -= electrons;
    }

    filled.sort((a, b) => (a.n !== b.n ? a.n - b.n : a.l - b.l));
    return filled;
  }

  for (const s of AUFBAU_ORDER) {
    if (remaining <= 0) break;
    const electrons = Math.min(s.capacity, remaining);
    filled.push({ ...s, subshell: `${s.n}${s.label}`, electrons });
    remaining -= electrons;
  }

  filled.sort((a, b) => (a.n !== b.n ? a.n - b.n : a.l - b.l));
  return filled;
}

/** Formats a configuration list as a display string, e.g. "1s² 2s² 2p⁶". */
const SUPERSCRIPT_DIGITS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
function toSuperscript(num) {
  return String(num)
    .split("")
    .map((d) => SUPERSCRIPT_DIGITS[d])
    .join("");
}

export function formatConfiguration(config) {
  return config.map((s) => `${s.subshell}${toSuperscript(s.electrons)}`).join(" ");
}

/**
 * Returns the orbital-box (Hund's rule) diagram for a subshell entry.
 * Each subshell has (2l + 1) orbitals (boxes). Filling order: one electron
 * (spin up) into every orbital first, then pair up (spin down) — Hund's
 * maximum-multiplicity rule. Returns an array of boxes, each box an array
 * of 0-2 spins ("up" | "down").
 */
export function getOrbitalBoxDiagram({ l, electrons }) {
  const orbitalCount = 2 * l + 1;
  const boxes = Array.from({ length: orbitalCount }, () => []);
  let remaining = electrons;

  // First pass: one spin-up electron per box (Hund's rule).
  for (let i = 0; i < orbitalCount && remaining > 0; i++) {
    boxes[i].push("up");
    remaining--;
  }
  // Second pass: pair remaining electrons as spin-down.
  for (let i = 0; i < orbitalCount && remaining > 0; i++) {
    boxes[i].push("down");
    remaining--;
  }

  return boxes;
}

/**
 * Returns every valid (n, l, m_l, m_s) quantum number combination for the
 * electrons in a given subshell entry, in fill order (matches
 * getOrbitalBoxDiagram's box order and Hund's-rule spin assignment).
 */
export function getQuantumNumbersForSubshell({ n, l, electrons }) {
  const boxes = getOrbitalBoxDiagram({ l, electrons });
  const results = [];
  boxes.forEach((spins, boxIndex) => {
    const m_l = boxIndex - l; // m_l ranges from -l to +l
    spins.forEach((spin) => {
      results.push({ n, l, m_l, m_s: spin === "up" ? 0.5 : -0.5 });
    });
  });
  return results;
}

/**
 * Validates a user-proposed (n, l, m_l, m_s) quantum number set against the
 * physical rules (independent of any specific element):
 * - n is a positive integer
 * - 0 <= l <= n - 1
 * - -l <= m_l <= l (integer)
 * - m_s is +1/2 or -1/2
 * Returns { valid: boolean, reason?: string }.
 */
export function validateQuantumNumberSet({ n, l, m_l, m_s }) {
  if (!Number.isInteger(n) || n < 1) {
    return { valid: false, reason: "n must be a positive integer" };
  }
  if (!Number.isInteger(l) || l < 0 || l > n - 1) {
    return { valid: false, reason: "l must satisfy 0 ≤ l ≤ n - 1" };
  }
  if (!Number.isInteger(m_l) || m_l < -l || m_l > l) {
    return { valid: false, reason: "m_l must satisfy -l ≤ m_l ≤ l" };
  }
  if (m_s !== 0.5 && m_s !== -0.5) {
    return { valid: false, reason: "m_s must be +1/2 or -1/2" };
  }
  return { valid: true };
}

const SUBSHELL_LABEL_TO_L = { s: 0, p: 1, d: 2, f: 3 };

/** Parses a subshell label like "3d" into { n, l, label }. */
export function parseSubshellLabel(label) {
  const match = /^(\d+)([spdf])$/.exec(label);
  if (!match) throw new Error(`Invalid subshell label: ${label}`);
  const n = Number(match[1]);
  const l = SUBSHELL_LABEL_TO_L[match[2]];
  return { n, l, label: match[2] };
}

/** Returns the number of valence electrons (outermost principal quantum shell). */
export function getValenceElectronCount(config) {
  const maxN = Math.max(...config.map((s) => s.n));
  return config
    .filter((s) => s.n === maxN)
    .reduce((sum, s) => sum + s.electrons, 0);
}
