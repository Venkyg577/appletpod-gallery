import React, { useId, useState, useEffect, useRef } from "react";
import { CYLINDER, CYLINDER_NET as NET } from "./cylinderGeometry.js";

const DIAGRAM_X = NET.CX - CYLINDER.CX;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Static net view — circles roll one at a time across one circumference length.
 *
 * topRollProgress / bottomRollProgress: 0–1 (driven externally for smooth animation)
 * showLabel: show "2πr" label on rect
 * onRollTap: called with "top" or "bottom" when the active circle is clicked
 */
export function CylinderNetStep({
  rollProgress,
  topRollProgress,
  bottomRollProgress,
  activeTarget = "top",
  showLabel = false,
  onRollTap,
  autoPlay = false,
  autoShowLabel = false,
  onAutoDone,
}) {
  const uid = useId().replace(/:/g, "");
  const { VIEW_W, VIEW_H, RECT_X, RECT_Y, RECT_W, RECT_H, RADIUS, TOP_CY, BOT_CY } = NET;

  const gSide = `${uid}-S`;
  const gTop  = `${uid}-T`;
  const gBot  = `${uid}-B`;
  const gSpec = `${uid}-P`;

  // Auto-play: roll top circle, then bottom, then reveal 2πr label + finish.
  const [autoTop, setAutoTop] = useState(0);
  const [autoBot, setAutoBot] = useState(0);
  const [autoLabel, setAutoLabel] = useState(false);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!autoPlay) return undefined;
    const ROLL = 650;
    const runRoll = (setter, done) => {
      const start = Date.now();
      const tick = () => {
        const raw = Math.min((Date.now() - start) / ROLL, 1);
        setter(easeInOut(raw));
        if (raw < 1) rafRef.current = requestAnimationFrame(tick);
        else done();
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => {
      runRoll(setAutoTop, () => {
        runRoll(setAutoBot, () => {
          setAutoLabel(true);
          if (onAutoDone) setTimeout(onAutoDone, 400);
        });
      });
    }, 250);
    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  const fallbackProgress = rollProgress ?? 0;
  const topP = autoPlay
    ? autoTop
    : Math.max(0, Math.min(1, topRollProgress ?? fallbackProgress));
  const botP = autoPlay
    ? autoBot
    : Math.max(0, Math.min(1, bottomRollProgress ?? fallbackProgress));
  const labelOn = autoPlay ? autoLabel : showLabel || autoShowLabel;

  // Both circles start with their centres ON the LEFT corner of the rectangle
  // and roll RIGHTWARD, ending with their centres ON the RIGHT corner.
  const leftCornerX  = RECT_X;
  const rightCornerX = RECT_X + RECT_W;
  const topCx = leftCornerX + (rightCornerX - leftCornerX) * topP;
  const botCx = leftCornerX + (rightCornerX - leftCornerX) * botP;

  // Rolling rotation: one full trip across the rectangle is one circumference.
  const topRotDeg = topP * (RECT_W / RADIUS) * (180 / Math.PI);
  const botRotDeg = botP * (RECT_W / RADIUS) * (180 / Math.PI);

  const canRollTop = !!onRollTap && activeTarget === "top" && topP === 0;
  const canRollBottom = !!onRollTap && activeTarget === "bottom" && botP === 0;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", overflow: "visible" }}>
      <svg viewBox={`${DIAGRAM_X} 0 ${VIEW_W - DIAGRAM_X} ${VIEW_H}`} width="100%" style={{ overflow: "visible", maxHeight: "700px" }}
        overflow="visible"
        role="img" aria-label="Cylinder net">
        <defs>
          <linearGradient id={gSide} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ff9ac2" />
            <stop offset="28%"  stopColor="#ff5f97" />
            <stop offset="55%"  stopColor="#ff3f83" />
            <stop offset="78%"  stopColor="#ea2f72" />
            <stop offset="100%" stopColor="#b51f5c" />
          </linearGradient>
          <linearGradient id={gSpec} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.34)" />
            <stop offset="20%"  stopColor="rgba(255,255,255,0.14)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id={gTop} cx="40%" cy="28%" r="70%">
            <stop offset="0%"   stopColor="#9fd8ff" />
            <stop offset="75%"  stopColor="#5caef3" />
            <stop offset="100%" stopColor="#2a79cc" />
          </radialGradient>
          <radialGradient id={gBot} cx="40%" cy="35%" r="70%">
            <stop offset="0%"   stopColor="#86c7ff" />
            <stop offset="72%"  stopColor="#3f97e8" />
            <stop offset="100%" stopColor="#1d5fb6" />
          </radialGradient>
        </defs>

        {/* rectangle */}
        <rect x={RECT_X} y={RECT_Y} width={RECT_W} height={RECT_H}
          fill={`url(#${gSide})`} stroke="#111" strokeWidth="2.5" />
        <rect x={RECT_X + 10} y={RECT_Y} width="36" height={RECT_H}
          fill={`url(#${gSpec})`} />
        <text x={RECT_X + 18} y={RECT_Y + RECT_H / 2 + 9}
          fontFamily="Arial" fontStyle="italic" fontSize="24" fontWeight="bold" fill="#111">h</text>

        {/* end-marker line appears when both circles have completed rolling */}
        {topP >= 1 && botP >= 1 && (
          <>
            <line x1={RECT_X + RECT_W} y1={RECT_Y - 10} x2={RECT_X + RECT_W} y2={RECT_Y + RECT_H + 10}
              stroke="#ffe066" strokeWidth="3" style={{ pointerEvents: "none" }} />
          </>
        )}

        {labelOn && (
          <>
            <text x={RECT_X + RECT_W / 2} y={RECT_Y - 18}
              textAnchor="middle" fontFamily="Arial" fontSize="26" fontWeight="bold" fill="#ffe066">2πr</text>
            <text x={RECT_X + RECT_W / 2} y={RECT_Y + RECT_H + 34}
              textAnchor="middle" fontFamily="Arial" fontSize="26" fontWeight="bold" fill="#ffe066">2πr</text>
          </>
        )}

        {/* ── top circle ── */}
        <g transform={`translate(${topCx}, ${TOP_CY})`}>
          <circle r={RADIUS} fill={`url(#${gTop})`} stroke="#111" strokeWidth="2.5"
            onClick={canRollTop ? () => onRollTap("top") : undefined}
            className={canRollTop ? "pulse-shape" : ""}
            style={{ cursor: canRollTop ? "pointer" : "default" }} />
          {/* rotating group: dashed radius + horizontal contact line */}
          <g transform={`rotate(${topRotDeg})`}>
            <circle r="4" fill="#1a4a7a" />
            {/* dashed radius line */}
            <line x1="0" y1="0" x2={RADIUS - 4} y2="0"
              stroke="#1a4a7a" strokeWidth="2" strokeDasharray="6 3" strokeLinecap="round" />
            {/* solid line from centre downward to rectangle contact point */}
            <line x1="0" y1="0" x2="0" y2={RADIUS}
              stroke="#1a4a7a" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <ellipse cx={-0.27 * RADIUS} cy={-0.12 * RADIUS} rx={0.3 * RADIUS} ry={0.11 * RADIUS}
            fill="rgba(255,255,255,0.28)" style={{ pointerEvents: "none" }} />
          <text x={RADIUS * 0.5} y={-14}
            fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#111">r</text>
        </g>

        {/* ── bottom circle ── */}
        <g transform={`translate(${botCx}, ${BOT_CY})`}>
          <circle r={RADIUS} fill={`url(#${gBot})`} stroke="#111" strokeWidth="2.5"
            onClick={canRollBottom ? () => onRollTap("bottom") : undefined}
            className={canRollBottom ? "pulse-shape" : ""}
            style={{ cursor: canRollBottom ? "pointer" : "default" }} />
          <g transform={`rotate(${botRotDeg})`}>
            <circle r="4" fill="#0d3060" />
            <line x1="0" y1="0" x2={RADIUS - 4} y2="0"
              stroke="#0d3060" strokeWidth="2" strokeDasharray="6 3" strokeLinecap="round" />
            <line x1="0" y1="0" x2="0" y2={-RADIUS}
              stroke="#0d3060" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <ellipse cx={-0.22 * RADIUS} cy={-0.1 * RADIUS} rx={0.26 * RADIUS} ry={0.09 * RADIUS}
            fill="rgba(255,255,255,0.22)" style={{ pointerEvents: "none" }} />
          <text x={RADIUS * 0.5} y={-14}
            fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#111">r</text>
        </g>
      </svg>
    </div>
  );
}
