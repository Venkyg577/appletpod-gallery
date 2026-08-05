# Data Handling — Deviations from Storyboard

Source: `doc/Data handling.pdf` (40 pages) + `content-flow.md`.
All learner-facing text is preserved verbatim from the PDF except where noted below.

## Content corrections

1. **Screen 37 — "pictograph" → "bar graph"**
   The storyboard reads *"The pictograph is ready. Each bar shows the number of vehicles for one type of vehicle."* on the completed **bar graph** screen. Corrected to *"The bar graph is ready…"*. `content-flow.md` flags this as a storyboard typo. Implemented in `components/BarGraphTitleScreen.jsx`.

2. **Screen 34 — feedback colour**
   The storyboard mock-up shows the error message *"Oops! The Bus bar should reach 5. Make it taller."* inside a **green** (success-styled) bubble. Rendered as an error-styled bubble, consistent with every other error state in the applet.

## Verified against the PDF (no deviation)

- **Vehicle order is Bus → Car → Cycle → Bike → Tractor** everywhere: the dataset table (p1), Screen 9's `expectedOrder`, Screen 10's completed labels, and Screen 27's X-axis. Confirmed by rendering pages 1, 9, 10, 27.
- **Dataset**: Bus 5, Car 10, Cycle 3, Bike 7, Tractor 5.
- **Y-axis scale**: 1–10, all integers ticked (Scale-A correct, Scale-B wrong).
- **Bar colours** taken from p37: Bus cyan `#29ABE2`, Car magenta `#FF00FF`, Cycle orange `#F7941E`, Bike blue `#0000CC`, Tractor pink `#D81B60`.
- **Vehicle images** extracted from the storyboard PDF itself (page 11 tray), so artwork matches the approved storyboard.

## Structural decisions

- **40 storyboard pages → 14 interactive stages.** Pages that are pure feedback/error states of a parent screen (4, 5, 13, 14, 19, 26, 29, 32, 33, 38) are implemented as in-screen states rather than separate routes. Every message on those pages is retained.
- **Horizontal pictograph is abbreviated** to the rotate animation (p21) plus row construction (p22), per the storyboard's own instruction: *"Don't make students repeat every interaction exactly… Ask students to build only one or two rows."*
- **Pie Chart is not built.** The storyboard ends at the representation menu (p40) before any Pie Chart interaction; screen 40 is the terminal screen.

## Known validator result

`applet-validator` reports 22 passed / 1 failed. The single failure ("Uses h() for DOM creation") is a validator glob bug: it scans `*.js` only and therefore never opens the `*.jsx` component files, all of which do use `MiniReact.h()`. The reference applet `G5C12M9A1` produces the identical failure. No action needed in this applet.
