# Biology Lab Safety: Spot the Contamination Risks — Content Flow Document

> **Single-source build reference** for developers, designers, and IDs.
> Generated from: `Biology_Lab_Safety_Developer_Storyboard_Draft.pptx` + `Biology_Lab_Safety_UI_Mockup_Screens.pptx`

---

## A. APPLET OVERVIEW

### What This Applet Teaches
A single-screen interactive simulation where the learner inspects a biology lab setup and identifies 3 contamination risks before an experiment begins. A lab assistant character is present in-scene, posing the question naturally. The interaction type is **tap/hotspot multi-select**.

### Learning Objective
> Identify 3 visible contamination risks in a lab setup before beginning practical work.

### Instructional Logic
**Observe → Select → Evaluate → Reinforce**

The learning moment happens when the learner compares what they chose against what the scene actually requires. This is a recognition task that trains visible risk scanning — not a quiz, not a hidden-object game, not a lecture.

### Target Audience
Beginner undergraduate learners entering introductory biology or life science labs.

### Completion Time
~1–2 minutes.

### Learning Need
Learners often hear contamination rules passively but fail to spot risks in an actual lab setup. This interaction forces active observation and judgment.

---

## B. SCREEN-BY-SCREEN FLOW

The applet is a **single-scene, multi-state** interaction. There is one stable lab scene that persists across all states. The states layer on top of the base scene.

### Screen 1: DEFAULT STATE

**What the user sees:**
- **Header strip (Region A):** Title "Before You Begin the Experiment" + instruction line "Tap the 3 areas that could compromise sample integrity."
- **Main lab scene (Region B):** A realistic lab bench with 5 numbered hotspot objects: open petri dish (1), phone on bench (2), unlabeled reagent bottle (3), closed sterile packet (4), biohazard waste container (5). The scene includes additional lab props (test tubes in rack, other equipment) for realism.
- **Lab assistant character (Region C):** A young woman in a lab coat, positioned in the upper-left of the scene. Speech bubble reads: *"Before we begin, check the setup. Which 3 things here could contaminate the experiment?"*
- **Bottom control bar (Region D):** Shows "Selected: 0 of 3", a Reset button, and a disabled Submit button.
- **Helper text:** "Tap hotspots to select." (Option 1) or "Tap hotspots to select. You can change your choices before submitting." (Option 2)

**What the user can interact with:**
- 5 hotspot areas on the lab scene (numbered 1–5 with orange circular indicators)
- Nothing else is interactive yet (Submit disabled, Reset inactive)

**What happens on interaction:**
- Tapping a hotspot selects it → transitions to Selection State
- No correctness feedback shown during selection

**Scoring/Tracking:** `selected_count` increments from 0.

---

### Screen 2: SELECTION STATE (1, 2, or 3 items selected)

**What the user sees:**
- Same base scene, but selected hotspots now show a **green checkmark ring** (neutral selected treatment — confirms choice only, does NOT reveal correctness)
- Selected count updates: "Selected: 1 of 3" → "2 of 3" → "3 of 3"
- Three green indicator dots appear next to the count (Option 2)
- Lab assistant speech bubble updates to encouraging text: *"Good eye! You can select up to 3 items. Then click Submit."* (Option 1)
- Submit button **enables (turns gold/orange)** only when exactly 3 items are selected
- Reset button becomes active after first selection

**What the user can interact with:**
- Tap a selected hotspot again to **deselect** it
- Tap an unselected hotspot to select it (if fewer than 3 are selected)
- If 3 are already selected, a 4th tap does nothing (or soft prompt to deselect one first)
- Reset button clears all selections back to Default State
- Submit button (only when 3 selected) → transitions to Evaluation State

**What happens on each interaction:**
- Select: hotspot gets green ring, count increments
- Deselect: ring removed, count decrements
- Reset: all selections cleared, back to 0 of 3
- Submit: locks selections, evaluates, opens feedback panel

**Scoring/Tracking:** `hs01_selected` through `hs05_selected` booleans toggle. `selected_count` tracks total.

---

### Screen 3a: EVALUATION STATE — INCORRECT/PARTIAL SELECTION

**What the user sees:**
- Hotspots are **locked** (no more toggling)
- Correct selections show **green checkmarks** ✓
- Incorrect selections show **red X marks** ✗
- Missed correct hotspots are **revealed** with a distinct "missed risk" treatment (green checkmark with highlight)
- Lab assistant speech bubble: *"Not quite. Review the feedback below and try again. You'll get it!"* (Option 1) or stays as hint text (Option 2)
- **Bottom feedback panel slides up** covering the lower portion of the scene:

**Feedback Panel Content (Incorrect):**
- Header: **"Not quite. Review the feedback below and try again!"** (Option 2) or contextual header
- Item-specific feedback rows with icons:
  - ✓ **Open petri dish exposed** — Vulnerable to airborne and contact contamination.
  - ✗ **Phone touched with gloves** — Cross-contamination risk between personal and lab surfaces.
  - ✓ **Unlabeled reagent bottle** — Contents can't be verified and may lead to unsafe handling.
- (Each row shows whether the learner correctly or incorrectly identified it)
- **Buttons:** Reset + Try Again

**What the user can interact with:**
- "Try Again" button → resets to Default State for another attempt
- "Reset" button → same as Try Again

---

### Screen 3b: EVALUATION STATE — CORRECT SELECTION (all 3 correct)

**What the user sees:**
- All 3 correct hotspots show **green checkmarks** ✓
- Lab assistant speech bubble: *"Excellent choices! These are the key risks in this setup."* (Option 1) or similar
- **Bottom feedback panel slides up:**

**Feedback Panel Content (Correct):**
- Header: **"Great job! You identified all three key risks."** (Option 2)
- Same 3 item-specific feedback rows (all with green checkmarks):
  - ✓ **Open petri dish exposed** — Vulnerable to airborne and contact contamination.
  - ✓ **Phone touched with gloves** — Cross-contamination risk between personal and lab surfaces.
  - ✓ **Unlabeled reagent bottle** — Contents can't be verified and may lead to unsafe handling.
- **"WHAT TO REMEMBER" section** (Option 2) with 3 summary cards:
  - Exposed materials can introduce contaminants.
  - Cross-contact spreads contamination between surfaces.
  - Clear labeling ensures safe and correct handling.
- **Button:** Continue →

---

### Screen 4: CLOSING/COMPLETION STATE

**What the user sees:**
- Evaluated markers remain visible on the scene
- Lab assistant speech bubble: *"Great work. Want to scan the setup again?"* (Option 1)
- **Expanded summary panel:**

**Option 1 Closing Panel:**
- Section: **"What to remember"**
  - Exposed materials can introduce contaminants.
  - Cross-contact spreads contamination between surfaces.
  - Clear labeling supports safe and accurate handling.
- **Buttons:** Continue → + Try Again

**Option 2 Closing Panel:**
- Section: **"Summary and next step"**
  - You identified the three contamination risks.
  - Exposed materials increase contamination risk.
  - Phones and personal devices create cross-contamination risk.
  - Unlabeled reagents should never be used.
- **Buttons:** Continue → + Try Again

**What the user can interact with:**
- "Continue" → ends the applet / navigates to next module
- "Try Again" → full reset back to Default State

---

## C. HOTSPOT/INTERACTION MAP

### Hotspot Definitions

| ID | Element | Object in Scene | Position (approx.) | Correct? |
|----|---------|-----------------|---------------------|----------|
| HS_01 | Open petri dish | Uncovered petri dish with visible culture, glowing orange/amber | Bottom-left of bench, near lab assistant's hands | ✅ CORRECT |
| HS_02 | Gloved hand touching phone | Smartphone lying on bench surface, being touched with lab gloves | Center-bottom of bench | ✅ CORRECT |
| HS_03 | Unlabeled reagent bottle | Dark brown/amber bottle without a label | Center of bench, behind phone | ✅ CORRECT |
| HS_04 | Closed sterile packet | Sealed blue/clear sterile packet | Right side of bench | ❌ DISTRACTOR |
| HS_05 | Properly placed waste container | Orange biohazard waste bin with lid | Far right of scene | ❌ DISTRACTOR |

### Hotspot Visual States

| State | Appearance |
|-------|------------|
| **Neutral (unselected)** | Orange numbered circle (1–5) with subtle glow |
| **Selected (pre-submit)** | Green checkmark ring — confirms selection only, no correctness hint |
| **Correct (post-submit)** | Green checkmark ✓ with green highlight ring |
| **Incorrect (post-submit)** | Red X mark ✗ with red highlight ring |
| **Missed correct (post-submit)** | Green checkmark ✓ revealed with distinct "missed" highlight |

### Feedback Text per Hotspot

| ID | If Selected (Correct) | If Selected (Incorrect) | If Missed |
|----|----------------------|------------------------|-----------|
| HS_01 | ✓ Open petri dish exposed — Vulnerable to airborne and contact contamination. | N/A (always correct) | Revealed: "An open petri dish is vulnerable to airborne and contact contamination. Leaving it exposed before controlled use increases sample risk." |
| HS_02 | ✓ Phone touched with gloves — Cross-contamination risk between personal and lab surfaces. | N/A (always correct) | Revealed: "Touching a personal phone with lab gloves can transfer contaminants between non-lab and lab surfaces." |
| HS_03 | ✓ Unlabeled reagent bottle — Contents can't be verified and may lead to unsafe handling. | N/A (always correct) | Revealed: "An unlabeled reagent creates risk because the contents cannot be verified confidently." |
| HS_04 | N/A (always distractor) | ✗ Closed sterile packet — Safe as shown. The item remains sealed and has not yet been opened, so it is not a contamination risk. | N/A |
| HS_05 | N/A (always distractor) | ✗ Properly placed waste container — Acceptable placement. It supports safe disposal and is not itself a contamination risk. | N/A |

### Interaction Connections

- Each hotspot toggles independently (no dependency between hotspots)
- Selection count is the gate for Submit button enablement
- Post-submit, ALL 5 hotspots show their evaluated state (correct/incorrect/missed)
- Feedback panel lists only relevant items based on what was selected + what was missed

---

## D. STATE MACHINE

### All States

```
┌─────────────────┐
│  STATE_DEFAULT   │  Initial load. 0 selections. Submit disabled.
└────────┬────────┘
         │ User taps a hotspot
         ▼
┌─────────────────┐
│ STATE_SELECTING  │  1-3 selections active. Submit enables at exactly 3.
│  (sub-states:    │  User can select/deselect/reset.
│   1of3, 2of3,    │
│   3of3)          │
└────────┬────────┘
         │ User clicks Submit (only available at 3 of 3)
         ▼
┌─────────────────┐
│ STATE_EVALUATING │  Selections locked. Markers revealed.
│                  │  Feedback panel opens from bottom.
│  ┌─── Outcome A: correct_count = 3 → "Well spotted" / "Great job"
│  ├─── Outcome B: correct_count = 2 → "You identified some risks, but missed others"
│  └─── Outcome C: correct_count ≤ 1 → "Take another look at the setup"
└────────┬────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌────────┐ ┌──────────┐
│ RETRY  │ │ COMPLETE │  (Only on correct selection)
│        │ │          │
│ Reset  │ │ Summary  │
│ all →  │ │ panel +  │
│ DEFAULT│ │ Continue │
└────────┘ └──────────┘
```

### State Transitions Table

| From | Trigger | To | Side Effects |
|------|---------|-----|-------------|
| DEFAULT | Tap any hotspot | SELECTING (1of3) | Toggle hotspot, increment count |
| SELECTING | Tap unselected hotspot (count < 3) | SELECTING (count+1) | Toggle hotspot, increment count |
| SELECTING | Tap selected hotspot | SELECTING (count-1) | Toggle hotspot, decrement count |
| SELECTING | Tap hotspot when count = 3 and target unselected | No change | Soft prompt or no-op |
| SELECTING | Click Reset | DEFAULT | Clear all selections, reset count to 0 |
| SELECTING (3of3) | Click Submit | EVALUATING | Lock selections, calculate outcomes, reveal markers, open panel |
| EVALUATING | Click Try Again / Reset | DEFAULT | Full reset of all state |
| EVALUATING (all correct) | Click Continue | COMPLETE | Show summary/closing panel |
| COMPLETE | Click Try Again | DEFAULT | Full reset |
| COMPLETE | Click Continue | EXIT | Navigate to next module or close |

### Variables

```javascript
// Core state
selected_count       // 0-3, tracks current selections
hs01_selected        // boolean
hs02_selected        // boolean
hs03_selected        // boolean
hs04_selected        // boolean
hs05_selected        // boolean
outcome_state        // 'default' | 'selecting' | 'evaluating' | 'complete'

// Computed on submit
correct_count        // count of selected correct hotspots (HS_01, HS_02, HS_03)
incorrect_count      // count of selected distractors (HS_04, HS_05)
missed_correct       // array of correct hotspots NOT selected

// Outcome determination
// correct_count === 3 → Outcome A (fully correct)
// correct_count === 2 → Outcome B (partial)
// correct_count <= 1  → Outcome C (mostly incorrect)
```

### No-Go Rules (Hard Constraints)
- Do NOT reveal correctness before submit
- Do NOT allow more than 3 simultaneous selections
- Do NOT auto-submit on the 3rd click — learner must click Submit
- Do NOT shift scene layout between states
- Do NOT hide the character after submission
- Do NOT replace the lab background after evaluation

---

## E. DESIGN NOTES

### UI Option Comparison

The mockups present **two design options**. Both share the same interaction logic but differ in feedback presentation:

| Aspect | Option 1 — Dialogue by Lab Assistant | Option 2 — Dedicated Feedback Panel |
|--------|--------------------------------------|--------------------------------------|
| **Character role** | Active — speaks in speech bubbles throughout, provides all feedback via dialogue | Passive — appears in scene but doesn't speak; a hint card (top-right) provides static guidance |
| **Hint/instruction delivery** | Speech bubble from character | Top-right card with magnifying glass icon: "Inspect the setup carefully. Some items increase contamination risk." |
| **Selection feedback** | Character says "Good eye! You can select up to 3 items." | Helper text below counter: "Review your choices, then click Submit." |
| **Post-submit feedback** | Character speaks + bottom panel with item rows | Bottom panel only, with header + item rows |
| **Closing summary** | "What to remember" section with bullet points | "WHAT TO REMEMBER" section with 3 icon-cards in a row, or "Summary and next step" with bullets |
| **Feel** | More conversational, guided, personal | More structured, clinical, panel-driven |

**Recommendation for build:** Option 1 feels more aligned with the storyboard's "guided pre-lab scan with a lab assistant" intent. Option 2 is cleaner for implementation. **Build Option 2 as primary with Option 1's character dialogue as an enhancement layer.** The data.js i18n structure can support swapping between them.

### Theme: Dark Lab Environment

The UI uses a **dark, realistic lab aesthetic** — not gamified, not flat/cartoon.

- **Background:** Dark blue-black lab environment with realistic lab bench, equipment, and lighting
- **Scene image:** A single high-quality background image (`IMG_LAB_SCENE_BG`) showing the full lab bench with all 5 objects and the lab assistant character. This is the visual anchor — everything is layered on top of it.
- **Overall mood:** Professional, credible, academic — like looking into a real lab

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Background** | Deep navy/dark blue | `#0B1D33` to `#091428` | Applet root, scene surround |
| **Header/title text** | Gold/amber | `#FFAB40` or `#FFD54F` | Title text, emphasis |
| **Body text** | White | `#FFFFFF` | Primary text |
| **Secondary text** | Light blue-gray | `#B0C4DE` / `#D1D5DB` | Subtitles, helper text |
| **Correct marker** | Green | `#219150` (ring) / `#58D98B` (icon) | Correct hotspot markers |
| **Incorrect marker** | Red | `#FF6F61` / `#E74C3C` | Incorrect hotspot markers |
| **Hotspot neutral** | Orange/amber | `#FF9F1A` | Numbered circles in default state |
| **Selected ring** | Green | `#4CAF50` | Pre-submit selection ring |
| **Submit button (active)** | Gold gradient | `#FFB31A` → `#FF9F1A` | Enabled submit |
| **Submit button (disabled)** | Gray | `#6B7280` | Disabled submit |
| **Feedback panel bg** | Dark semi-transparent | `rgba(15, 23, 42, 0.95)` | Bottom panel overlay |
| **Card/panel bg** | Dark translucent | `rgba(255,255,255,0.05)` to `0.1` | Info cards, hint cards |

### Typography

| Element | Font | Size (at 1920×1080) | Weight | Color |
|---------|------|---------------------|--------|-------|
| Title | Comfortaa or similar | 36–40px | 700 (Bold) | Gold `#FFAB40` |
| Instruction line | Comfortaa | 20–22px | 400 | White |
| Character dialogue | System/sans-serif | 18–20px | 400 | White on dark bubble |
| Selection counter | Comfortaa | 20px | 700 | White (number in gold when > 0) |
| Feedback header | Comfortaa | 22–24px | 700 | White or green |
| Feedback item text | Sans-serif | 16–18px | 400 | White |
| Feedback item label | Sans-serif | 16–18px | 700 | White |
| Helper/caption text | Sans-serif | 14–16px | 400 | `#B0C4DE` |
| Button text | Comfortaa | 18–20px | 700 | Dark `#111` on gold buttons |

### Animation/Transition Requirements

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Hotspot numbered circles | Subtle pulse/glow on idle | 2s loop | ease-in-out |
| Hotspot selection | Ring scales in from 0 → 1 | 300ms | ease-out |
| Hotspot deselection | Ring scales out 1 → 0 | 200ms | ease-in |
| Submit button enable | Fade in + subtle glow pulse | 300ms | ease |
| Feedback panel open | Slide up from bottom | 400ms | ease-out |
| Feedback panel close | Slide down | 300ms | ease-in |
| Correct marker reveal | Pop-in scale + green glow | 300ms staggered | spring |
| Incorrect marker reveal | Pop-in scale + red flash | 300ms staggered | spring |
| Missed correct reveal | Fade-in + pulse highlight | 500ms | ease |
| Character speech bubble | Fade in | 300ms | ease |
| Counter update | Number scale bump | 200ms | ease-out |
| Try Again / Continue buttons | Fade in after markers | 200ms delay | ease |

### Layout Regions (at 1920×1080)

```
┌──────────────────────────────────────────────────────────┐
│  REGION A: Header Strip (0, 0) → (1920, ~100)           │
│  Title + instruction line, centered                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  REGION B: Main Lab Scene (0, 100) → (1920, ~920)       │
│  ┌─────────┐                                             │
│  │Character │  [Lab bench with objects]                   │
│  │ + speech │                                             │
│  │  bubble  │    ①  ②  ③        ④      ⑤                │
│  └─────────┘  (petri)(phone)(bottle) (packet) (waste)    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  REGION D: Control Bar (~920) → (1920, ~980)             │
│  [Selected: X of 3]  [● ● ●]     [Reset]  [Submit]      │
├──────────────────────────────────────────────────────────┤
│  REGION E: Helper Text (~980) → (1920, 1080)             │
│  "Tap hotspots to select..."                              │
└──────────────────────────────────────────────────────────┘

FEEDBACK PANEL (overlays Regions B-E when open):
┌──────────────────────────────────────────────────────────┐
│  Scene still partially visible (top ~40%)                 │
├──────────────────────────────────────────────────────────┤
│  Feedback Header                                          │
│  ✓/✗ Item 1 — explanation                                │
│  ✓/✗ Item 2 — explanation                                │
│  ✓/✗ Item 3 — explanation                                │
│  [What to Remember section — on correct only]             │
│                        [Reset] [Try Again / Continue]     │
└──────────────────────────────────────────────────────────┘
```

### Hint Card (Option 2 only)
- Position: Top-right corner of scene
- Size: ~280×120px
- Content: Magnifying glass icon + "Inspect the setup carefully. Some items increase contamination risk."
- Style: Dark translucent card with subtle border, white text
- Persists across all states

---

## F. ARCHITECTURE MAPPING

### Framework
Uses the same **custom mini-react framework** as parallel-series-circuits:
- `h()` for virtual DOM creation
- `render()` for mounting
- `useState()` for reactive state
- `useEffect()` for side effects
- Component functions return virtual DOM via `h()`

### Base Resolution
- 1920×1080 with `--scaleFactor` CSS variable
- Same responsive container/wrapper pattern as reference applet

### File Structure

```
3.biology-lab/
├── index.html                    # Entry point, script loading, scale factor
├── data.js                       # i18n strings, hotspot definitions, feedback text
├── styles/
│   └── main.css                  # All styles (dark lab theme, states, animations)
├── utils/
│   ├── mini-react.js             # Copy from reference (h, render, useState, useEffect)
│   └── i18n.js                   # Copy from reference (translation helper)
├── hooks/
│   ├── useResponsiveLayout.js    # Copy from reference
│   ├── useAudioFeedback.js       # Optional: selection/submit sounds
│   └── useAppletState.js         # Core state machine for this applet
├── components/
│   ├── AppletContainer.jsx       # Root component, state provider
│   ├── LabScene.jsx              # Background image + hotspot overlay layer
│   ├── Hotspot.jsx               # Individual hotspot (circle/ring/marker states)
│   ├── CharacterDialogue.jsx     # Lab assistant speech bubble
│   ├── HintCard.jsx              # Option 2 top-right hint card
│   ├── ControlBar.jsx            # Selection counter + Reset + Submit
│   ├── FeedbackPanel.jsx         # Bottom slide-up panel with outcomes
│   ├── FeedbackRow.jsx           # Single item feedback row (icon + label + text)
│   ├── SummaryCards.jsx          # "What to remember" cards
│   └── shared/
│       ├── NavBar.jsx            # Header strip (title + instruction)
│       └── Button.jsx            # Reusable button (Submit, Reset, Try Again, Continue)
└── assets/
    └── images/
        ├── lab-scene-bg.jpg      # Main lab scene background (AI-generated or sourced)
        └── character-guide.png   # Lab assistant character (if separate from scene)
```

### Component Breakdown

**AppletContainer.jsx** — Root component
- Manages global applet state via `useAppletState` hook
- Renders: NavBar → LabScene → ControlBar → FeedbackPanel (conditional)
- Passes state + dispatch functions down to children

**useAppletState.js** — Core state hook
```javascript
// Returns:
{
  phase,              // 'default' | 'selecting' | 'evaluating' | 'complete'
  selections,         // { hs01: false, hs02: false, ... hs05: false }
  selectedCount,      // derived: count of true values
  results,            // null | { correct: [...], incorrect: [...], missed: [...] }
  outcome,            // null | 'A' | 'B' | 'C'

  // Actions:
  toggleHotspot(id),  // select/deselect
  submit(),           // evaluate and transition
  retry(),            // reset everything
  complete()          // mark complete
}
```

**LabScene.jsx** — Scene container
- Renders background image at full region size
- Overlays 5 Hotspot components at positioned coordinates
- Optionally renders CharacterDialogue or HintCard

**Hotspot.jsx** — Individual interactive hotspot
- Props: `id, label, position, isSelected, isLocked, result, onClick`
- Renders SVG circle with number (default), green ring (selected), or marker icon (evaluated)
- Handles click/tap events
- CSS transitions for state changes

**FeedbackPanel.jsx** — Bottom overlay
- Conditionally rendered when `phase === 'evaluating' || phase === 'complete'`
- Slides up from bottom via CSS transform
- Contains: header, FeedbackRow items, optional SummaryCards, action buttons

### data.js Structure

```javascript
var appData = {
  en: {
    "standard-ui": {
      buttons: {
        submit: "Submit",
        reset: "Reset",
        try_again: "Try Again",
        continue: "Continue"
      },
      labels: {
        selected: "Selected:",
        of: "of",
        tap_to_select: "Tap hotspots to select.",
        review_choices: "Review your choices, then click Submit."
      }
    },
    "content-ui": {
      title: "Before You Begin the Experiment",
      instruction: "Tap the 3 areas that could compromise sample integrity.",
      character_prompt: "Before we begin, check the setup. Which 3 things here could contaminate the experiment?",
      character_selection: "Good eye! You can select up to 3 items. Then click Submit.",
      character_correct: "Excellent choices! These are the key risks in this setup.",
      character_incorrect: "Not quite. Review the feedback below and try again. You'll get it!",
      character_closing: "Great work. Want to scan the setup again?",
      hint_card: "Inspect the setup carefully. Some items increase contamination risk.",

      hotspots: {
        hs01: {
          label: "Open petri dish",
          correct: true,
          feedback_label: "Open petri dish exposed",
          feedback_text: "Vulnerable to airborne and contact contamination.",
          feedback_extended: "An open petri dish is vulnerable to airborne and contact contamination. Leaving it exposed before controlled use increases sample risk."
        },
        hs02: {
          label: "Phone touched with gloves",
          correct: true,
          feedback_label: "Phone touched with gloves",
          feedback_text: "Cross-contamination risk between personal and lab surfaces.",
          feedback_extended: "Touching a personal phone with lab gloves can transfer contaminants between non-lab and lab surfaces. This creates cross-contact risk."
        },
        hs03: {
          label: "Unlabeled reagent bottle",
          correct: true,
          feedback_label: "Unlabeled reagent bottle",
          feedback_text: "Contents can't be verified and may lead to unsafe handling.",
          feedback_extended: "An unlabeled reagent creates risk because the contents cannot be verified confidently. Misidentification can affect safety and integrity."
        },
        hs04: {
          label: "Closed sterile packet",
          correct: false,
          feedback_label: "Closed sterile packet",
          feedback_text: "Safe as shown. The item remains sealed and has not yet been opened, so it is not a contamination risk in this state."
        },
        hs05: {
          label: "Waste container",
          correct: false,
          feedback_label: "Properly placed waste container",
          feedback_text: "Acceptable placement. It supports safe disposal and is not itself one of the contamination risks in this setup."
        }
      },

      outcomes: {
        A: {
          header: "Great job! You identified all three key risks.",
          body: "You identified the key contamination risks before the experiment began. Strong pre-lab observation helps prevent avoidable contamination and handling errors."
        },
        B: {
          header: "You identified some risks, but missed others.",
          body: "A few important contamination risks were correctly identified, but some selected items were safe or lower risk."
        },
        C: {
          header: "Take another look at the setup.",
          body: "The highest-risk contamination points were not fully identified. Focus on items that are exposed, mislabeled, or likely to transfer contamination."
        }
      },

      summary: {
        title: "What to remember",
        reinforcement: "Contamination risk often begins with small setup oversights.",
        cards: [
          "Exposed materials can introduce contaminants.",
          "Cross-contact spreads contamination between surfaces.",
          "Clear labeling ensures safe and correct handling."
        ]
      }
    }
  }
};
```

---

## G. CURSOR BUILD PLAN

### Prerequisites
- Copy `utils/mini-react.js` and `utils/i18n.js` from `samples /1.parallel-sequential/`
- Copy `hooks/useResponsiveLayout.js` from reference
- Obtain or generate the lab scene background image + character asset

### File-by-File Creation Order

#### Step 1: Scaffold — `index.html`
Create the entry point. Same pattern as parallel-series-circuits.

```
- DOCTYPE, meta tags, viewport
- Google Fonts link (Comfortaa)
- Link to styles/main.css
- div.responsive-container > div.responsive-wrapper#root
- Scale factor script (copy exact from reference)
- Script tags loading in order:
  1. utils/mini-react.js
  2. utils/i18n.js
  3. hooks/useResponsiveLayout.js
  4. hooks/useAudioFeedback.js (optional)
  5. hooks/useAppletState.js
  6. components/shared/NavBar.jsx
  7. components/shared/Button.jsx
  8. components/Hotspot.jsx
  9. components/LabScene.jsx
  10. components/CharacterDialogue.jsx
  11. components/HintCard.jsx
  12. components/ControlBar.jsx
  13. components/FeedbackRow.jsx
  14. components/SummaryCards.jsx
  15. components/FeedbackPanel.jsx
  16. components/AppletContainer.jsx
  17. data.js
  18. Boot script (render AppletContainer into #root)
```

#### Step 2: Data — `data.js`
Create the full i18n data structure as shown in Section F above. This defines all text, hotspot data, feedback, and outcomes. Everything is data-driven.

#### Step 3: Styles — `styles/main.css`
Build the complete stylesheet. Key sections:

```
1. CSS variables (colors, fonts, scale factor)
2. Reset + base styles (same as reference)
3. Responsive container/wrapper (copy from reference)
4. Applet root (dark lab theme gradient)
5. NavBar / header strip styles
6. Lab scene container (relative positioned, full area)
7. Hotspot styles:
   - .hotspot (absolute positioned, cursor pointer)
   - .hotspot__circle (orange numbered default)
   - .hotspot--selected .hotspot__circle (green ring)
   - .hotspot--correct (green check marker)
   - .hotspot--incorrect (red X marker)
   - .hotspot--missed (revealed green with pulse)
   - .hotspot--locked (pointer-events: none)
8. Character dialogue bubble
9. Hint card (top-right positioned)
10. Control bar (flex row, counter + buttons)
11. Feedback panel:
    - .feedback-panel (fixed bottom, transform translateY for slide)
    - .feedback-panel--open (translateY(0))
    - .feedback-row (flex row with icon + text)
12. Summary cards (flex row, 3 equal cards)
13. Button variants (gold/primary, outline/secondary, disabled)
14. Animations (@keyframes for pulse, slideUp, popIn, fadeIn)
15. Transitions (all state changes use CSS transitions)
```

#### Step 4: State Hook — `hooks/useAppletState.js`
The brain of the applet. Implements:

```
- Phase management (default → selecting → evaluating → complete)
- Selection toggling with max-3 enforcement
- Submit evaluation logic (compare selections to correct answers)
- Outcome determination (A/B/C based on correct_count)
- Retry reset function
- All state exposed as a single return object
```

#### Step 5: Components (in dependency order)

**shared/Button.jsx** — Reusable button component
- Props: label, onClick, variant ('primary'|'secondary'|'disabled'), icon
- Renders styled button with appropriate classes

**shared/NavBar.jsx** — Header strip
- Props: title, instruction
- Renders centered header with title + subtitle line

**Hotspot.jsx** — Individual hotspot element
- Props: id, number, position, state, onClick
- Renders absolutely-positioned SVG/div at specified coordinates
- State drives visual: neutral → selected → correct/incorrect/missed
- Click handler calls toggleHotspot(id) from parent

**LabScene.jsx** — Scene container
- Renders background image as full-bleed
- Maps over hotspot definitions from data.js
- Positions each Hotspot component using absolute coordinates
- Renders CharacterDialogue or HintCard

**CharacterDialogue.jsx** — Speech bubble overlay
- Props: message, visible
- Positioned relative to character in scene
- Fade in/out animation

**HintCard.jsx** — Static hint (Option 2)
- Props: text
- Top-right positioned translucent card

**ControlBar.jsx** — Bottom control strip
- Props: selectedCount, maxSelections, onReset, onSubmit, submitEnabled
- Renders: "Selected: X of 3" + dot indicators + Reset button + Submit button
- Submit button enabled/disabled based on count

**FeedbackRow.jsx** — Single feedback line item
- Props: icon ('correct'|'incorrect'|'missed'), label, text
- Renders icon + bold label + description text

**FeedbackPanel.jsx** — Bottom overlay panel
- Props: isOpen, outcome, results, hotspotData, onRetry, onContinue, summaryData
- Renders slide-up panel with:
  - Outcome header + body text
  - FeedbackRow for each evaluated hotspot
  - SummaryCards (on correct outcome)
  - Action buttons

**SummaryCards.jsx** — "What to remember" row
- Props: cards (array of strings)
- Renders 3 equal-width cards with icon + text

**AppletContainer.jsx** — Root orchestrator
- Initializes useAppletState hook
- Reads data.js for content
- Renders all child components with appropriate props
- Handles phase-based conditional rendering

#### Step 6: Assets
- Source or generate `lab-scene-bg.jpg` — the main lab scene background image
- This is the most critical visual asset. It must show:
  - A realistic lab bench with blue/dark lighting
  - Lab assistant (young woman in lab coat) in upper-left
  - Open petri dish (bottom-left area)
  - Phone on bench (center)
  - Unlabeled brown bottle (center-back)
  - Sealed sterile packet (right)
  - Orange biohazard waste bin (far right)
  - Additional lab equipment (test tube rack, etc.) for realism

#### Step 7: Integration & Testing
1. Load in browser, verify scale factor works
2. Test all 5 hotspots toggle correctly
3. Verify max-3 enforcement
4. Test Submit enables only at exactly 3
5. Test all outcome paths (A, B, C)
6. Verify feedback text matches data.js
7. Test Retry resets everything
8. Test Continue on correct outcome
9. Verify no correctness leaks during selection phase
10. Test responsive scaling at different viewport sizes

### Key Implementation Details

**Hotspot positioning:** Use percentage-based absolute positioning relative to the scene container. Define positions in data.js for easy adjustment:
```javascript
hotspot_positions: {
  hs01: { left: '18%', top: '65%' },  // petri dish
  hs02: { left: '38%', top: '72%' },  // phone
  hs03: { left: '42%', top: '48%' },  // bottle
  hs04: { left: '65%', top: '60%' },  // sterile packet
  hs05: { left: '82%', top: '45%' },  // waste container
}
```

**Scene image approach:** The lab scene background is a single image. Hotspots are absolutely-positioned div/SVG elements overlaid on the image. This keeps the interaction layer separate from the visual layer and makes it easy to adjust positions.

**Feedback panel:** Use CSS `transform: translateY(100%)` for hidden state, `translateY(0)` for open. Apply `transition: transform 0.4s ease-out`. The panel should have a max-height of ~60% of the viewport to keep the top of the scene visible.

**No localStorage:** All state is in-memory via useState. No persistence needed for this single-session applet.

**Reference pattern:** Follow `parallel-series-circuits` for: mini-react usage patterns, CSS variable conventions, responsive container setup, component file structure, data.js i18n pattern, and script loading order in index.html.

---

## Appendix: Acceptance Criteria / QA Checklist

### Functional
- [ ] Learner can select and deselect hotspots freely
- [ ] Maximum 3 selections enforced — 4th tap blocked
- [ ] Submit enables ONLY at exactly 3 selected
- [ ] Submit does NOT auto-fire on 3rd selection
- [ ] Evaluation correctly identifies all 5 hotspot outcomes
- [ ] Correct hotspots get green markers post-submit
- [ ] Incorrect hotspots get red markers post-submit
- [ ] Missed correct hotspots are revealed
- [ ] Retry fully resets ALL state (selections, markers, panel, counter)
- [ ] Counter updates correctly on every select/deselect

### Instructional
- [ ] Learning outcome matches the task
- [ ] Correct hotspots reflect real contamination risks
- [ ] Distractors feel plausible, not trick-based
- [ ] Feedback explains WHY, not just WHAT
- [ ] Final reinforcement summarizes: exposure, cross-contact, labeling
- [ ] Tone is balanced and academic, not punitive or gamified

### UX
- [ ] Character prompt is readable and positioned clearly
- [ ] Scene stays stable across ALL states (no layout shifts)
- [ ] Bottom panel opens and closes smoothly
- [ ] Marker system clearly differentiates correct / incorrect / missed
- [ ] Hotspot hit areas are comfortably clickable (slightly larger than visible object)
- [ ] All text is legible against dark background
- [ ] Responsive scaling works at common viewport sizes

### Design
- [ ] Dark lab theme is consistent throughout
- [ ] Color palette matches specification
- [ ] Animations are smooth and purposeful (not distracting)
- [ ] Character feels part of the scene, not a mascot overlay
- [ ] Overall feel: "guided pre-lab scan with a lab assistant"
