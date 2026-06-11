import React from "react";
import { CylinderSideArt } from "./CylinderRevealSummary.jsx";

/** @param {{ copy: { title: string, cylinder_formula: string, cylinder: string } }} props */
export function SummaryScreen({ copy }) {
  return (
    <div className="diagram-wrap" style={{ flexDirection: "column", gap: 24 }}>
      <div className="summary-grid summary-grid--single">
        <div className="summary-card">
          <div className="summary-formula-box">{copy.cylinder_formula}</div>
          <div className="summary-card-art"><CylinderSideArt /></div>
          <h3 className="summary-card-label summary-card-label--cylinder">{copy.cylinder}</h3>
        </div>
      </div>
    </div>
  );
}
