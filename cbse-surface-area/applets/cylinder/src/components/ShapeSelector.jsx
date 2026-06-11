import React from "react";
import { CylinderCardArt } from "./art/CylinderCardArt.jsx";

/**
 * Cylinder-only selector. `only` prop kept for API parity with the combined
 * applet but this build always renders the single cylinder card.
 * @param {{
 *  titles: { cylinder: string },
 *  cylinderDisabled?: boolean,
 *  pulseCylinder?: boolean,
 *  onCylinder: () => void,
 * }} props
 */
export function ShapeSelector({
  titles,
  cylinderDisabled,
  pulseCylinder,
  onCylinder,
}) {
  return (
    <div className="shape-grid shape-grid--single" role="group" aria-label="Choose a solid">
      <button
        type="button"
        className={`shape-card${pulseCylinder && !cylinderDisabled ? " shape-card--pulse" : ""}`}
        disabled={!!cylinderDisabled}
        onClick={onCylinder}
      >
        {pulseCylinder && !cylinderDisabled && <span className="tap-hint-icon" aria-hidden="true">👆</span>}
        <div className="shape-card-art-motion">
          <CylinderCardArt />
        </div>
        <div className="shape-card-title shape-card-title--cylinder">{titles.cylinder}</div>
      </button>
    </div>
  );
}
