import React, { useId } from "react";

export function ThreeSolidCardArt({ shape }) {
  const uid = useId().replace(/:/g, "");

  if (shape === "cylinder") {
    const gSide = `${uid}-cylSide`;
    const gTop = `${uid}-cylTop`;
    const gBot = `${uid}-cylBot`;
    const gSpec = `${uid}-cylSpec`;
    // cx=155, top cy=60, bottom cy=265, rx=95 ry=28 — wide & tall
    return (
      <div className="three-card-art three-card-art--svg" aria-hidden="true">
        <svg viewBox="0 0 310 340" width="310" height="340" role="presentation">
          <defs>
            <linearGradient id={gSide} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff9ac2" />
              <stop offset="28%" stopColor="#ff5f97" />
              <stop offset="55%" stopColor="#ff3f83" />
              <stop offset="78%" stopColor="#ea2f72" />
              <stop offset="100%" stopColor="#b51f5c" />
            </linearGradient>
            <radialGradient id={gTop} cx="40%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#9fd8ff" />
              <stop offset="75%" stopColor="#5caef3" />
              <stop offset="100%" stopColor="#2a79cc" />
            </radialGradient>
            <radialGradient id={gBot} cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#86c7ff" />
              <stop offset="72%" stopColor="#3f97e8" />
              <stop offset="100%" stopColor="#1d5fb6" />
            </radialGradient>
            <linearGradient id={gSpec} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.14)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <g className="solid-card-art-motion">
            {/* body — curved surface wrapping around the caps:
                top edge follows the FRONT (lower) arc of the top ellipse,
                bottom edge follows the FRONT (lower) arc of the bottom ellipse */}
            <path
              d="M 60 60
                 A 95 28 0 0 0 250 60
                 L 250 265
                 A 95 28 0 0 1 60 265
                 Z"
              fill={`url(#${gSide})`} stroke="#111" strokeWidth="2.5" opacity="0.8"
            />
            <path
              d="M 70 64
                 L 70 261
                 A 95 28 0 0 0 106 277
                 L 106 73
                 A 95 28 0 0 1 70 64 Z"
              fill={`url(#${gSpec})`} opacity="0.8"
            />
            {/* bottom cap — above body */}
            <ellipse cx="155" cy="265" rx="95" ry="28" fill={`url(#${gBot})`} stroke="#111" strokeWidth="2.5" opacity="0.5" />
            {/* top cap */}
            <ellipse cx="155" cy="60" rx="95" ry="28" fill={`url(#${gTop})`} stroke="#111" strokeWidth="2.5" />
            <ellipse cx="130" cy="52" rx="28" ry="10" fill="rgba(255,255,255,0.28)" />

            {/* h line */}
            <line x1="155" y1="66" x2="155" y2="258" stroke="#111" strokeWidth="2" />
            <circle cx="155" cy="60" r="3.5" fill="#111" />
            <circle cx="155" cy="265" r="3.5" fill="#111" />
            <text x="163" y="168" fontFamily="Arial" fontStyle="italic" fontSize="26" fontWeight="bold" fill="#111">h</text>

            {/* top radius */}
            <line x1="155" y1="60" x2="250" y2="60" stroke="#333" strokeWidth="1.8" strokeDasharray="6 4" />
            <text x="196" y="55" fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#111">r</text>

            {/* bottom radius */}
            <line x1="155" y1="265" x2="250" y2="265" stroke="#333" strokeWidth="1.8" strokeDasharray="6 4" />
            <text x="196" y="280" fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#111">r</text>
          </g>
        </svg>
      </div>
    );
  }

  const gBody = `${uid}-coneBody`;
  const gBase = `${uid}-coneBase`;
  const gSpec = `${uid}-coneSpec`;
  // apex=155,28  base cx=155,cy=270 rx=105 ry=30
  // right edge: (155,28)→(260,270) — slant line offset 10px right
  return (
    <div className="three-card-art three-card-art--svg" aria-hidden="true">
      <svg viewBox="0 0 310 340" width="310" height="340" role="presentation">
        <defs>
          <linearGradient id={gBody} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#97e1cc" />
            <stop offset="45%" stopColor="#67d3b5" />
            <stop offset="100%" stopColor="#329b85" />
          </linearGradient>
          <radialGradient id={gBase} cx="42%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#ffe58c" />
            <stop offset="78%" stopColor="#f2cf4a" />
            <stop offset="100%" stopColor="#caa42c" />
          </radialGradient>
          <linearGradient id={gSpec} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <g className="solid-card-art-motion">
          {/* cone body with curved base */}
          <path
            d="M 155 28 L 50 270 Q 155 298 260 270 Z"
            fill={`url(#${gBody})`}
            stroke="#111"
            strokeWidth="2.5"
          />
          <path d="M 155 40 L 90 256 Q 155 274 220 256 Z" fill={`url(#${gSpec})`} />
          {/* base cap */}
          <ellipse cx="155" cy="270" rx="105" ry="30" fill={`url(#${gBase})`} stroke="#111" strokeWidth="2.5" />
          <ellipse cx="134" cy="258" rx="22" ry="9" fill="rgba(255,255,255,0.22)" />

          {/* h line */}
          <line x1="155" y1="28" x2="155" y2="270" stroke="#111" strokeWidth="2" />
          <circle cx="155" cy="270" r="3.5" fill="#111" />
          <text x="163" y="162" fontFamily="Arial" fontStyle="italic" fontSize="26" fontWeight="bold" fill="#111">h</text>

          {/* base radius */}
          <line x1="155" y1="270" x2="260" y2="270" stroke="#333" strokeWidth="1.8" strokeDasharray="6 4" />
          <text x="204" y="290" fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#111">r</text>

          {/* slant line — parallel to right edge (155,28)→(260,270), offset ~10px right */}
          <line x1="167" y1="31" x2="269" y2="266" stroke="#eee" strokeWidth="2.5" />
          <text x="242" y="170" fontFamily="Arial" fontStyle="italic" fontSize="22" fontWeight="bold" fill="#fff">l</text>
        </g>
      </svg>
    </div>
  );
}
