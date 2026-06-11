import React, { useId } from "react";

function CylinderMini({ x, y, scale = 1 }) {
  const uid = useId().replace(/:/g, "");
  const side = `${uid}-side`;
  const top = `${uid}-top`;
  const bot = `${uid}-bot`;
  const spec = `${uid}-spec`;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id={side} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff9ac2" />
          <stop offset="45%" stopColor="#ff3f83" />
          <stop offset="100%" stopColor="#b51f5c" />
        </linearGradient>
        <radialGradient id={top} cx="40%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#9fd8ff" />
          <stop offset="100%" stopColor="#2a79cc" />
        </radialGradient>
        <radialGradient id={bot} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#86c7ff" />
          <stop offset="100%" stopColor="#1d5fb6" />
        </radialGradient>
        <linearGradient id={spec} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* curved body */}
      <path d="M 0 42 A 95 28 0 0 0 190 42 L 190 247 A 95 28 0 0 1 0 247 Z"
        fill={`url(#${side})`} stroke="#111" strokeWidth="2.5" opacity="0.8" />
      <path d="M 10 42 A 95 28 0 0 0 46 42 L 46 247 A 95 28 0 0 1 10 247 Z"
        fill={`url(#${spec})`} opacity="0.8" />
      {/* bottom ellipse above body */}
      <ellipse cx="95" cy="247" rx="95" ry="28" fill={`url(#${bot})`} stroke="#111" strokeWidth="2.5" opacity="0.5" />
      {/* top cap */}
      <ellipse cx="95" cy="42" rx="95" ry="28" fill={`url(#${top})`} stroke="#111" strokeWidth="2.5" />
      <ellipse cx="72" cy="32" rx="28" ry="10" fill="rgba(255,255,255,0.28)" />
      {/* h line */}
      <line x1="95" y1="46" x2="95" y2="240" stroke="#222" strokeWidth="1.5" />
      <circle cx="95" cy="42" r="3.5" fill="#111" />
      <circle cx="95" cy="247" r="3.5" fill="#111" />
      <text x="102" y="156" fontFamily="Arial" fontSize="28" fontWeight="700" fill="#111">h</text>
      {/* top radius */}
      <line x1="95" y1="42" x2="184" y2="42" stroke="#555" strokeWidth="2" strokeDasharray="7 5" />
      <circle cx="95" cy="42" r="3.5" fill="#111" />
      <text x="135" y="34" fontFamily="Arial" fontSize="22" fontWeight="700" fill="#111">r</text>
      {/* bottom radius */}
      <line x1="95" y1="247" x2="184" y2="247" stroke="#555" strokeWidth="2" strokeDasharray="7 5" />
      <circle cx="95" cy="247" r="3.5" fill="#111" />
      <text x="143" y="268" fontFamily="Arial" fontSize="22" fontWeight="700" fill="#111">r</text>
    </g>
  );
}

function NetMini({ x, y, scale = 1 }) {
  const uid = useId().replace(/:/g, "");
  const top = `${uid}-top`;
  const bot = `${uid}-bot`;

  const RECT_X = 0;
  const RECT_Y = 85;
  const RECT_W = 420;
  const RECT_H = 205;
  const R = 80;
  const rightX = RECT_X + RECT_W;
  const capCx = rightX;
  const topCy = RECT_Y - R;
  const botCy = RECT_Y + RECT_H + R;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={top} cx="40%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#9fd8ff" />
          <stop offset="100%" stopColor="#2a79cc" />
        </radialGradient>
        <radialGradient id={bot} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#86c7ff" />
          <stop offset="100%" stopColor="#1d5fb6" />
        </radialGradient>
      </defs>
      <rect x={RECT_X} y={RECT_Y} width={RECT_W} height={RECT_H} fill="#ff3f83" stroke="#111" strokeWidth="2.5" />
      <circle cx={capCx} cy={topCy} r={R} fill={`url(#${top})`} stroke="#111" strokeWidth="2.5" />
      <circle cx={capCx} cy={botCy} r={R} fill={`url(#${bot})`} stroke="#111" strokeWidth="2.5" />
      <text x="16" y="206" fontFamily="Arial" fontSize="28" fontWeight="700" fill="#111">h</text>
      <text x="202" y="272" fontFamily="Arial" fontSize="28" fontWeight="700" fill="#111">2πr</text>
      <line x1={capCx} y1={topCy} x2={capCx + R} y2={topCy} stroke="#555" strokeWidth="2" strokeDasharray="7 5" />
      <text x={capCx + R / 2 - 4} y={topCy + 27} fontFamily="Arial" fontSize="24" fontWeight="700" fill="#111">r</text>
      <line x1={capCx} y1={botCy} x2={capCx + R} y2={botCy} stroke="#555" strokeWidth="2" strokeDasharray="7 5" />
      <text x={capCx + R / 2 - 4} y={botCy + 28} fontFamily="Arial" fontSize="24" fontWeight="700" fill="#111">r</text>
    </g>
  );
}

export function CylinderSideArt() {
  return (
    <svg viewBox="0 10 200 270" width="100%" aria-hidden="true">
      <CylinderMini x="0" y="0" scale={1} />
    </svg>
  );
}

export function CylinderRevealSummary() {
  return (
    <div className="cylinder-summary-wrap">
      <svg viewBox="0 0 1180 520" width="100%" role="img" aria-label="Cylinder before and after unfolding">
        <CylinderMini x="40" y="132" scale="0.95" />
        <path d="M 290 260 H 425" stroke="#f8b66b" strokeWidth="14" />
        <path d="M 455 260 L 430 238 V 282 Z" fill="#f8b66b" />
        <NetMini x="480" y="80" scale="0.95" />
      </svg>
    </div>
  );
}
