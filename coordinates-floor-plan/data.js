// data.js — i18n copy (VERBATIM from the PRD) + the 16 pin target points.
//
// Target points are stored as NORMALIZED coordinates (nx, ny) in the range 0..1,
// relative to the floor-plan image box. This keeps positions resolution-independent
// and makes them trivial to re-tune later (single source of truth). The (nx, ny)
// marks where the PIN TIP lands and where the A–P grid label is anchored.
//
// `order` is the sequence in which pins must be placed during the drag phase.

var appData = {
  en: {
    "standard-ui": {
      buttons: {
        grid: "Grid",
        explore_again: "Start over"
      },
      instructions: {
        dev_note_title: "Developer Note"
      }
    },
    "content-ui": {
      developer_note: "Please avoid automatic slide transitions. Advance only after the learner performs the required action (drag a pin, tap Grid, tap a point). When no user action is involved, use animations with a clearly noticeable duration instead of jumping ahead.",

      // ---- headers (top bar), one per phase / milestone ----
      headers: {
        placing_intro:  "Shalini used a floor plan to represent Reiaan's room.",
        placing:        "Let's explore how the room is represented on a floor plan.",
        all_placed:     "Different pins mark different locations in the room.",
        grid:           "Locations on a floor plan can be represented as points.",
        labeling:       "Points can be named and located on a grid.",
        done:           "Coordinate geometry helps us describe the position of points on a grid."
      },

      // ---- bottom instruction strip ----
      instructions: {
        placing_intro: "Drag the pins to mark important locations.",
        placing:       "Drag the pins to mark important locations on the floor plan.",
        tap_grid:      "Tap Grid to organize the points.",
        tap_point:     "Tap any point to reveal its label.",
        tap_name:      "Tap any point to reveal its name."
      },

      // ---- feedback bubbles ----
      feedback: {
        good:    "Good! This pin marks a location.",
        great:   "Great! Let's mark more locations.",
        awesome: "Awesome! Keep tapping the points to reveal their labels."
      },

      // ---- callouts ----
      callouts: {
        grid_helps: "A grid helps organize the positions of points."
      }
    }
  }
};

// 16 pin targets (A–P). nx/ny normalized to the floor-plan OUTER BORDER rectangle
// (0,0 = inner top-left corner of the room border, 1,1 = inner bottom-right corner).
// Measured by pixel-detecting the red pin centroids and the border lines directly in
// doc/pdf-images/page-8.png (connected-component clustering + dark-line edge detection),
// then expressing each pin as a fraction of the border box — so values are exact corner/
// wall-junction/door-corner positions, not estimates. Re-tune freely; this is the single
// source of truth for point placement.
var POINTS = [
  { id: 'A', nx: 0.999, ny: 0.000, order: 1  },
  { id: 'B', nx: 0.999, ny: 0.999, order: 2  },
  { id: 'C', nx: 0.907, ny: 0.819, order: 3  },
  { id: 'D', nx: 0.818, ny: 0.999, order: 4  },
  { id: 'E', nx: 0.746, ny: 0.999, order: 5  },
  { id: 'F', nx: 0.746, ny: 0.787, order: 6  },
  { id: 'G', nx: 0.517, ny: 0.786, order: 7  },
  { id: 'H', nx: 0.517, ny: 0.999, order: 8  },
  { id: 'I', nx: 0.412, ny: 0.890, order: 9  },
  { id: 'J', nx: 0.324, ny: 0.802, order: 10 },
  { id: 'K', nx: 0.000, ny: 1.000, order: 11 },
  { id: 'L', nx: 0.000, ny: 0.328, order: 12 },
  { id: 'M', nx: 0.000, ny: 0.000, order: 13 },
  { id: 'N', nx: 0.228, ny: 0.000, order: 14 },
  { id: 'O', nx: 0.230, ny: 0.309, order: 15 },
  { id: 'P', nx: 0.326, ny: 0.000, order: 16 }
].sort(function(a, b){ return a.order - b.order; });

if (typeof module !== 'undefined' && module.exports) module.exports = { appData: appData, POINTS: POINTS };
if (typeof window !== 'undefined') { window.appData = appData; window.POINTS = POINTS; }
