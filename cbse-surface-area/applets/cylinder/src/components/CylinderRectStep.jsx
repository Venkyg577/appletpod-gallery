import React, { useId, useEffect, useRef, useState } from "react";
import { CYLINDER, CYLINDER_NET as NET } from "./cylinderGeometry.js";

// Compact viewBox must match CylinderStyledDiagram exactly so the cylinder
// stays in the same screen position when CYL_CURVED → CYL_RECT swaps.
const DIAGRAM_X = NET.CX - CYLINDER.CX;

/**
 * Two-phase animation:
 * Phase 1 (cutProgress 0→1): dashed cut line draws down the cylinder height.
 * Phase 2 (progress 0→1): curved surface unfolds into rectangle.
 */

const LIFT_T   = -100;
const LIFT_B   =   90;
const CUT_DUR  =  600;
const CUT_DELAY = 350;
const DELAY    =  300;
const DURATION = 1000;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function CylinderRectStep() {
  const uid = useId().replace(/:/g, "");
  const [cutProgress, setCutProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shift, setShift] = useState(0);
  const rafRef = useRef(null);
  const cutRafRef = useRef(null);
  const shiftRafRef = useRef(null);

  const { VIEW_W, VIEW_H, CX, RADIUS, RECT_X, RECT_Y, RECT_W, RECT_H,
          TOP_CY, BOT_CY } = NET;

  const gSide = `${uid}-S`;
  const gTop  = `${uid}-T`;
  const gBot  = `${uid}-B`;
  const gSpec = `${uid}-P`;

  // Phase 1: cut line
  useEffect(() => {
    const t = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const raw = Math.min((Date.now() - start) / CUT_DUR, 1);
        setCutProgress(easeInOut(raw));
        if (raw < 1) {
          cutRafRef.current = requestAnimationFrame(tick);
        } else {
          // Phase 2: unfold after cut completes
          setTimeout(() => {
            const start2 = Date.now();
            const tick2 = () => {
              const raw2 = Math.min((Date.now() - start2) / DURATION, 1);
              setProgress(easeInOut(raw2));
              if (raw2 < 1) rafRef.current = requestAnimationFrame(tick2);
            };
            rafRef.current = requestAnimationFrame(tick2);
          }, DELAY);
        }
      };
      cutRafRef.current = requestAnimationFrame(tick);
    }, CUT_DELAY);
    return () => {
      clearTimeout(t);
      if (cutRafRef.current) cancelAnimationFrame(cutRafRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const p = progress;

  const bodyX = RECT_X;
  const bodyW = RADIUS * 2 + (RECT_W - RADIUS * 2) * p;

  const leftCornerX  = RECT_X;
  const rightCornerX = RECT_X + RECT_W;
  const endCx = leftCornerX + (rightCornerX - leftCornerX) * shift;
  const topCx = CX + (endCx - CX) * p;
  const topCy = (RECT_Y + LIFT_T) + (TOP_CY - (RECT_Y + LIFT_T)) * p;
  const botCx = CX + (endCx - CX) * p;
  const botCy = (RECT_Y + RECT_H + LIFT_B) + (BOT_CY - (RECT_Y + RECT_H + LIFT_B)) * p;

  const canShift = p >= 1 && shift === 0;
  const handleShift = () => {
    if (!canShift) return;
    const start = Date.now();
    const DUR = 900;
    const tick = () => {
      const raw = Math.min((Date.now() - start) / DUR, 1);
      setShift(easeInOut(raw));
      if (raw < 1) shiftRafRef.current = requestAnimationFrame(tick);
    };
    shiftRafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => {
    if (shiftRafRef.current) cancelAnimationFrame(shiftRafRef.current);
  }, []);

  const rimOpacity = Math.max(0, 1 - p * 2.5);

  // Cut line: drawn from top to bottom of cylinder body
  const cylBodyTop = RECT_Y;
  const cylBodyBot = RECT_Y + RECT_H;
  const cutLineX = RECT_X; // left edge of body = cut seam
  const cutLineY2 = cylBodyTop + (cylBodyBot - cylBodyTop) * cutProgress;

  // h line/label travel with the unfold: start at the cylinder centre (matching
  // CYL_CURVED), glide to the left edge (the cut seam) as the rectangle opens.
  const hLineX = CX + (RECT_X + 14 - CX) * p;
  const hTextX = hLineX + 6;

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", width:"100%", overflow:"visible" }}>
      <svg viewBox={`${DIAGRAM_X} 0 ${VIEW_W - DIAGRAM_X} ${VIEW_H}`} width="100%" style={{ overflow:"visible", maxHeight:"700px", cursor: canShift ? "pointer" : "default" }}
        overflow="visible"
        onClick={handleShift}
        role="img" aria-label="Cylinder unfolding to rectangle">
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

        {/* Phase 1: cut line animates down the cylinder height before unfold */}
        {cutProgress > 0 && p === 0 && (
          <line
            x1={cutLineX} y1={cylBodyTop}
            x2={cutLineX} y2={cutLineY2}
            stroke="#ffe066" strokeWidth="3" strokeDasharray="8 5"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* body — curved at p=0 (matches CylinderStyledDiagram), flattens to rect as p→1 */}
        {(() => {
          const ry = 16 * (1 - p);
          const x0 = bodyX, x1 = bodyX + bodyW;
          const y0 = RECT_Y, y1 = RECT_Y + RECT_H;
          const d = ry > 0.5
            ? `M ${x0} ${y0} A ${(x1-x0)/2} ${ry} 0 0 0 ${x1} ${y0} L ${x1} ${y1} A ${(x1-x0)/2} ${ry} 0 0 1 ${x0} ${y1} Z`
            : `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
          return (
            <path d={d} fill={`url(#${gSide})`} stroke="#111" strokeWidth="2.5" />
          );
        })()}
        {(() => {
          const ry = 16 * (1 - p);
          const x0 = bodyX + 10, x1 = bodyX + 46;
          const y0 = RECT_Y, y1 = RECT_Y + RECT_H;
          const d = ry > 0.5
            ? `M ${x0} ${y0} A ${(x1-x0)/2} ${ry} 0 0 0 ${x1} ${y0} L ${x1} ${y1} A ${(x1-x0)/2} ${ry} 0 0 1 ${x0} ${y1} Z`
            : `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
          return <path d={d} fill={`url(#${gSpec})`} style={{ pointerEvents: "none" }} />;
        })()}
        <line x1={hLineX} y1={RECT_Y + 5} x2={hLineX} y2={RECT_Y + RECT_H - 5}
          stroke="#111" strokeWidth="1.5" />
        <text x={hTextX} y={RECT_Y + RECT_H / 2 + 9}
          fontFamily="Arial" fontStyle="italic" fontSize="24" fontWeight="bold" fill="#111">h</text>

        {/* open-rim ellipses fade as rect unfolds */}
        {rimOpacity > 0 && <>
          <ellipse cx={CX} cy={RECT_Y} rx={RADIUS} ry={14}
            fill="rgba(25,35,55,0.6)" stroke="#111" strokeWidth="2" opacity={rimOpacity} />
          <ellipse cx={CX} cy={RECT_Y + RECT_H} rx={RADIUS} ry={14}
            fill="rgba(25,35,55,0.6)" stroke="#111" strokeWidth="2" opacity={rimOpacity} />
        </>}

        {/* bottom circle */}
        <circle cx={botCx} cy={botCy} r={RADIUS}
          fill={`url(#${gBot})`} stroke="#111" strokeWidth="2.5" />
        <ellipse cx={botCx - 0.22*RADIUS} cy={botCy - 0.1*RADIUS} rx={0.26*RADIUS} ry={0.09*RADIUS}
          fill="rgba(255,255,255,0.22)" />
        <circle cx={botCx} cy={botCy} r="4" fill="#111" />
        <line x1={botCx} y1={botCy} x2={botCx + RADIUS - 5} y2={botCy}
          stroke="#333" strokeWidth="1.8" strokeDasharray="6 4" />
        <text x={botCx + RADIUS * 0.5} y={botCy - 14}
          fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#111">r</text>

        {/* top circle */}
        <circle cx={topCx} cy={topCy} r={RADIUS}
          fill={`url(#${gTop})`} stroke="#111" strokeWidth="2.5" />
        <ellipse cx={topCx - 0.27*RADIUS} cy={topCy - 0.12*RADIUS} rx={0.3*RADIUS} ry={0.11*RADIUS}
          fill="rgba(255,255,255,0.28)" />
        <circle cx={topCx} cy={topCy} r="4" fill="#111" />
        <line x1={topCx} y1={topCy} x2={topCx + RADIUS - 5} y2={topCy}
          stroke="#333" strokeWidth="1.8" strokeDasharray="6 4" />
        <text x={topCx + RADIUS * 0.5} y={topCy - 14}
          fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#111">r</text>
      </svg>
    </div>
  );
}
