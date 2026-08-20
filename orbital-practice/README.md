# Interactive Periodic Table — Periods, Groups, Blocks & Element Types

A guided walkthrough of the periodic table for Grade 9–12 chemistry.

## Guided content flow

The applet opens into a 16-screen learner-paced sequence that annotates the
periodic table itself:

1. **Periods** — numbers 1–7 down the left edge with guide lines across each
   row; tap a number to isolate that period.
2. **Groups** — numbers 1–18 across the top with guide lines down each column;
   tap a number to isolate that group.
3. **Element → period and group** — both legends render dotted; tapping any
   element turns its own row and column green and shows its placement.
4. **Blocks** — s, p, d and f regions.
5. **Element types** — all ten categories, from alkali metals to actinides.

Nothing advances on a timer; every screen waits for the learner.

Finishing (or skipping) the flow hands off to the full periodic table, with
element modals, search, category legend and the chemistry tools.

## Structure

- `index.html` — single entry point
- `js/modules/contentFlowController.js` — guided flow: annotation layer,
  screen sequencing, element tap handling
- `js/modules/contentFlowData.js` — the 16 screen definitions
- `css/content-flow.css` — annotation and panel styling
- `js/data/elementsData.js` — element dataset
- `vendor/driver.css` — vendored from driver.js so the applet runs on a
  static host without a bundler

## Running locally

Serve the folder over HTTP (ES modules will not load from `file://`):

```bash
npx serve .
```
