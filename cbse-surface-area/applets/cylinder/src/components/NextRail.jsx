import React from "react";

/** Navigation button — hint text is now rendered separately in the footer. */
export function NextRail({ disabled, pulse, onClick, nextLabel }) {
  return (
    <button
      type="button"
      className={`next-button${pulse && !disabled ? " next-button--pulse" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={nextLabel}
    >
      <span className="chevron" aria-hidden="true">›</span>
    </button>
  );
}
