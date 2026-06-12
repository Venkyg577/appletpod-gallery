import React, { useId, useState, useRef, useEffect } from "react";
import { CYLINDER, CYLINDER_NET } from "./cylinderGeometry.js";

/**
 * Render order makes all the difference for 3D appearance:
 *   1. Body rect + specular
 *   2. Bottom-rim ellipse (dark) — only when bottom cap is lifted (step≥2)
 *   3. Top-rim ellipse   (dark) — only when top cap is lifted   (step≥1)
 *   4. Bottom cap  — drawn AFTER body so it visually sits on the cylinder bottom
 *   5. Top cap     — always on top
 *
 * At step=0 both caps (flat scaleY ellipses) overlap their respective body edges
 * → the classic 3D cylinder look.
 *
 * viewBox matches the unfold/net screens so the cylinder keeps the same size
 * when the learner moves from the surface steps into the rectangle reveal.
 */

const { CX, RADIUS, TOP_Y, BOT_Y, FLAT_S, LIFT_T, LIFT_B } = CYLINDER;
const DIAGRAM_X = CYLINDER_NET.CX - CX;
const DIAGRAM_Y = CYLINDER_NET.RECT_Y - TOP_Y;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function CylinderStyledDiagram({ step, pulseTarget, onTopTap, onBottomTap, onCurvedTap, compact = true, autoPlay = false, autoPlayDelay = 350 }) {
  const uid = useId().replace(/:/g, "");
  const [animTop,    setAnimTop]    = useState(false);
  const [animBottom, setAnimBottom] = useState(false);
  const [cutProgress, setCutProgress] = useState(0);
  const [cutting, setCutting] = useState(false);
  const cutRafRef = useRef(null);

  const gSide = `${uid}-S`;
  const gTop  = `${uid}-T`;
  const gBot  = `${uid}-B`;
  const gSpec = `${uid}-P`;

  const flatStyle = { transform: `scaleY(${FLAT_S})`, transformBox: "fill-box", transformOrigin: "center" };
  const liftT     = { transform: `translateY(${LIFT_T}px) scaleY(1)`, transformBox: "fill-box", transformOrigin: "center" };
  const liftB     = { transform: `translateY(${LIFT_B}px) scaleY(1)`,  transformBox: "fill-box", transformOrigin: "center" };

  const topStyle = animTop    ? undefined : step >= 1 ? liftT : flatStyle;
  const botStyle = animBottom ? undefined : step >= 2 ? liftB : flatStyle;

  const topPulse  = !animTop    && pulseTarget === "top"    ? " pulse-shape" : "";
  const botPulse  = !animBottom && pulseTarget === "bottom" ? " pulse-shape" : "";
  const sidePulse = pulseTarget === "curved" ? " pulse-shape" : "";

  const liftMs = autoPlay ? 460 : 720;
  const handleTopClick = () => {
    if (pulseTarget !== "top" || !onTopTap || animTop) return;
    setAnimTop(true);
    setTimeout(onTopTap, liftMs);
  };
  const handleBottomClick = () => {
    if (pulseTarget !== "bottom" || !onBottomTap || animBottom) return;
    setAnimBottom(true);
    setTimeout(onBottomTap, liftMs);
  };
  const handleCurvedClick = () => {
    if (pulseTarget !== "curved" || !onCurvedTap || cutting) return;
    setCutting(true);
    const CUT_DUR = autoPlay ? 420 : 600;
    const start = Date.now();
    const tick = () => {
      const raw = Math.min((Date.now() - start) / CUT_DUR, 1);
      setCutProgress(easeInOut(raw));
      if (raw < 1) {
        cutRafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(onCurvedTap, 200);
      }
    };
    cutRafRef.current = requestAnimationFrame(tick);
  };

  // Auto-play: fire this screen's tap animation on mount, then the onTap
  // callback advances to the next screen once the animation completes.
  useEffect(() => {
    if (!autoPlay) return undefined;
    const t = setTimeout(() => {
      if (pulseTarget === "top") handleTopClick();
      else if (pulseTarget === "bottom") handleBottomClick();
      else if (pulseTarget === "curved") handleCurvedClick();
    }, autoPlayDelay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, pulseTarget]);

  const topLifted = step >= 1 || animTop;
  const botLifted = step >= 2 || animBottom;

  const vbX = compact ? DIAGRAM_X : 0;
  const vbW = compact ? CYLINDER_NET.VIEW_W - DIAGRAM_X : CYLINDER_NET.VIEW_W;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", overflow: "visible" }}>
      <svg
        viewBox={`${vbX} 0 ${vbW} ${CYLINDER_NET.VIEW_H}`}
        width="100%"
        overflow="visible"
        style={{ overflow: "visible", maxHeight: "700px" }}
        role="img" aria-label="Cylinder diagram"
      >
        <defs>
          <linearGradient id={gSide} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ff9ac2" />
            <stop offset="28%"  stopColor="#ff5f97" />
            <stop offset="55%"  stopColor="#ff3f83" />
            <stop offset="78%"  stopColor="#ea2f72" />
            <stop offset="100%" stopColor="#b51f5c" />
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
          <linearGradient id={gSpec} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.34)" />
            <stop offset="20%"  stopColor="rgba(255,255,255,0.14)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <g transform={`translate(${DIAGRAM_X} ${DIAGRAM_Y})`}>
          {/* 1 ── body — curved path so top/bottom edges wrap around the caps */}
          <path
            d={`M ${CX - RADIUS} ${TOP_Y} A ${RADIUS} 16 0 0 0 ${CX + RADIUS} ${TOP_Y} L ${CX + RADIUS} ${BOT_Y} A ${RADIUS} 16 0 0 1 ${CX - RADIUS} ${BOT_Y} Z`}
            fill={`url(#${gSide})`} stroke="#111" strokeWidth="2.5"
            className={sidePulse}
            onClick={handleCurvedClick}
            style={{ cursor: pulseTarget === "curved" ? "pointer" : "default" }}
          />
          <path
            d={`M ${CX - RADIUS + 10} ${TOP_Y} A ${RADIUS} 16 0 0 0 ${CX - RADIUS + 46} ${TOP_Y} L ${CX - RADIUS + 46} ${BOT_Y} A ${RADIUS} 16 0 0 1 ${CX - RADIUS + 10} ${BOT_Y} Z`}
            fill={`url(#${gSpec})`} style={{ pointerEvents: "none" }} />
          <line x1={CX} y1={TOP_Y + 5} x2={CX} y2={BOT_Y - 5}
            stroke="#111" strokeWidth="2" style={{ pointerEvents: "none" }} />
          <text x={CX + 8} y={(TOP_Y + BOT_Y) / 2 + 9}
            fontFamily="Arial" fontStyle="italic" fontSize="26" fontWeight="bold" fill="#111"
            style={{ pointerEvents: "none" }}>h</text>

          {/* cut line animates down the centre of the cylinder body —
              same x as the h line so cut → h reads as one continuous element */}
          {cutting && cutProgress > 0 && (
            <line
              x1={CX} y1={TOP_Y}
              x2={CX} y2={TOP_Y + (BOT_Y - TOP_Y) * cutProgress}
              stroke="#ffe066" strokeWidth="3.5" strokeDasharray="8 5"
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* 2 ── bottom rim ellipse — visible when bottom cap is lifted (shows open mouth) */}
          {botLifted && (
            <ellipse cx={CX} cy={BOT_Y} rx={RADIUS} ry={16}
              fill="rgba(25,35,55,0.75)" stroke="#111" strokeWidth="2.5"
              style={{ pointerEvents: "none" }} />
          )}

          {/* 3 ── top rim ellipse — visible when top cap is lifted (shows open mouth) */}
          {topLifted && (
            <ellipse cx={CX} cy={TOP_Y} rx={RADIUS} ry={16}
              fill="rgba(25,35,55,0.75)" stroke="#111" strokeWidth="2.5"
              style={{ pointerEvents: "none" }} />
          )}

          {/* 4 ── bottom cap — rendered AFTER body so it overlaps the bottom edge (3D look) */}
          <g
            className={`${animBottom ? "lid-anim-bottom" : ""}${botPulse}`}
            style={botStyle}
          >
            <circle
              cx={CX} cy={BOT_Y} r={RADIUS}
              fill={`url(#${gBot})`} stroke="#111" strokeWidth="2.5"
              onClick={handleBottomClick}
              style={{ cursor: pulseTarget === "bottom" ? "pointer" : "default" }}
            />
            <ellipse cx={CX - 22} cy={BOT_Y - 10} rx="26" ry="9"
              fill="rgba(255,255,255,0.22)" style={{ pointerEvents: "none" }} />
            <line x1={CX} y1={BOT_Y} x2={CX + RADIUS - 5} y2={BOT_Y}
              stroke="#333" strokeWidth="1.8" strokeDasharray="6 4" style={{ pointerEvents: "none" }} />
            <circle cx={CX} cy={BOT_Y} r="4" fill="#111" style={{ pointerEvents: "none" }} />
            <text x={CX + RADIUS / 2 - 8} y={BOT_Y - 15}
              fontFamily="Arial" fontStyle="italic" fontSize="28" fontWeight="bold" fill="#111"
              style={{ pointerEvents: "none" }}>r</text>
          </g>

          {/* 5 ── top cap — always last (in front of everything) */}
          <g
            className={`${animTop ? "lid-anim-top" : ""}${topPulse}`}
            style={topStyle}
          >
            <circle
              cx={CX} cy={TOP_Y} r={RADIUS}
              fill={`url(#${gTop})`} stroke="#111" strokeWidth="2.5"
              onClick={handleTopClick}
              style={{ cursor: pulseTarget === "top" ? "pointer" : "default" }}
            />
            <ellipse cx={CX - 28} cy={TOP_Y - 11} rx="30" ry="11"
              fill="rgba(255,255,255,0.28)" style={{ pointerEvents: "none" }} />
            <line x1={CX} y1={TOP_Y} x2={CX + RADIUS - 5} y2={TOP_Y}
              stroke="#333" strokeWidth="1.8" strokeDasharray="6 4" style={{ pointerEvents: "none" }} />
            <circle cx={CX} cy={TOP_Y} r="4" fill="#111" style={{ pointerEvents: "none" }} />
            <text x={CX + RADIUS / 2 - 8} y={TOP_Y + 20}
              fontFamily="Arial" fontStyle="italic" fontSize="28" fontWeight="bold" fill="#111"
              style={{ pointerEvents: "none" }}>r</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
