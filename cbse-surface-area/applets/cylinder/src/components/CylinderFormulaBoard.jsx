import React, { useEffect } from "react";

const PARTS = [
  { id: "base1", label: "Base Area 1", value: "πr²", note: "Area of a circle with radius r is πr²." },
  { id: "rect", label: "Rectangular Area", value: "2πrh", note: "Area of a rectangle is length × breadth = 2πr × h" },
  { id: "base2", label: "Base Area 2", value: "πr²", note: "Area of a circle with radius r is πr²." },
];

function MiniCircle({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="62" fill="#69a4ff" stroke="#111" strokeWidth="2" />
      <line x1="0" y1="0" x2="58" y2="0" stroke="#555" strokeWidth="2" strokeDasharray="6 5" />
      <line x1="0" y1="0" x2="0" y2="62" stroke="#111" strokeWidth="2" />
      <circle cx="0" cy="0" r="5" fill="#111" />
      <text x="30" y="28" fontFamily="Arial" fontSize="20" fontWeight="700" fill="#111">r</text>
    </g>
  );
}

function MiniRect({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="240" height="145" fill="#ff3f83" stroke="#111" strokeWidth="2" />
      <text x="12" y="78" fontFamily="Arial" fontSize="20" fontWeight="700" fill="#111">h</text>
      <text x="110" y="132" fontFamily="Arial" fontSize="20" fontWeight="700" fill="#111">2πr</text>
    </g>
  );
}

function Symbol({ children }) {
  return <span className="formula-symbol">{children}</span>;
}

function FormulaButton({ part, active, revealed, onClick }) {
  return (
    <button
      type="button"
      className={`formula-choice${active ? " formula-choice--pulse" : ""}`}
      onClick={active ? onClick : undefined}
      disabled={!active}
    >
      {revealed ? part.value : part.label}
    </button>
  );
}

function FormulaPill({ children, final = false, highlight = false }) {
  return (
    <span className={`formula-pill${final ? " formula-pill--final" : ""}${highlight ? " formula-pill--highlight" : ""}`}>
      {children}
    </span>
  );
}

export function CylinderFormulaBoard({ step, onAdvance, copy }) {
  const revealed = Math.max(0, Math.min(3, step - 1));
  const activePart = PARTS[revealed]?.id ?? null;
  const note = step >= 2 && step <= 4 ? PARTS[step - 2].note : null;

  // highlight the two πr² pills when combining (step 5 = grouping like terms)
  const highlightLike = step === 5;
  // highlight unlike terms at step 6 before final factored form
  const highlightUnlike = step === 6;

  useEffect(() => {
    if (step !== 0 && step !== 4 && step !== 5) return undefined;
    const t = setTimeout(onAdvance, 2000);
    return () => clearTimeout(t);
  }, [step, onAdvance]);

  return (
    <div className="cylinder-formula-board">
      {/* Top row: Surface Area = [diagrams] on the same line */}
      <div className="formula-top-row">
        <div className="formula-top-left">
          <FormulaPill>{copy.surface_area}</FormulaPill>
          <Symbol>=</Symbol>
        </div>
        <div className="formula-shape-strip formula-shape-strip--cylinder">
          <svg viewBox="0 0 878 200" width="100%" aria-hidden="true">
            <MiniCircle x="105" y="100" />
            <text x="247" y="114" textAnchor="middle" className="formula-svg-plus">+</text>
            <MiniRect x="319" y="28" />
            <text x="631" y="114" textAnchor="middle" className="formula-svg-plus">+</text>
            <MiniCircle x="773" y="100" />
          </svg>
        </div>
      </div>

      {/* Formula pills row */}
      {step >= 0 ? (
        <div className="formula-line">
          <div className="formula-left" style={{ opacity: 0, pointerEvents: "none" }}><FormulaPill>{copy.surface_area}</FormulaPill></div>
          <Symbol style={{ opacity: 0 }}>=</Symbol>
          <div className="formula-right formula-right--cylinder">
            {step >= 1 ? (
              <>
                <FormulaButton part={PARTS[0]} active={activePart === "base1"} revealed={revealed >= 1} onClick={onAdvance} />
                <Symbol>+</Symbol>
                <FormulaButton part={PARTS[1]} active={activePart === "rect"} revealed={revealed >= 2} onClick={onAdvance} />
                <Symbol>+</Symbol>
                <FormulaButton part={PARTS[2]} active={activePart === "base2"} revealed={revealed >= 3} onClick={onAdvance} />
              </>
            ) : (
              <span className="formula-placeholder">…</span>
            )}
          </div>
        </div>
      ) : null}

      {note ? (
        <div className="formula-note">
          <span>{note}</span>
        </div>
      ) : null}

      {/* C12: combining step — highlight like terms (both πr²), then group */}
      {step >= 5 ? (
        <div className="formula-line">
          <div className="formula-left" style={{ opacity: 0, pointerEvents: "none" }}><FormulaPill>{copy.surface_area}</FormulaPill></div>
          <Symbol style={{ opacity: 0 }}>=</Symbol>
          <div className="formula-right formula-right--cylinder">
            <FormulaPill highlight={highlightLike}>2πr²</FormulaPill>
            <Symbol>+</Symbol>
            <FormulaPill highlight={highlightUnlike}>2πrh</FormulaPill>
          </div>
        </div>
      ) : null}

      {step >= 6 ? (
        <div className="formula-line">
          <div className="formula-left"><FormulaPill>{copy.surface_area}</FormulaPill></div>
          <Symbol>=</Symbol>
          <div className="formula-right formula-right--cylinder">
            <FormulaPill final>2πr ( r + h )</FormulaPill>
          </div>
        </div>
      ) : null}
    </div>
  );
}
