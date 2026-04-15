# 1. Applet Overview

**Applet Name**
Biology Lab Safety: Spot the Contamination Risks

**Learning Objective (derived)**
Enable learners to identify visible contamination risks in a lab setup before starting an experiment.

**High-Level Description**
The learner inspects a lab scene and selects exactly three contamination risks using hotspots, submits their selection, and receives structured feedback with explanation and retry.

---

# 2. Core Applet Components

### Character & Dialogue

* Lab assistant character embedded in scene
* Dialogue bubble prompting task

### Visual Data

* Single lab scene (5 hotspot objects)

  * HS_01 Open petri dish
  * HS_02 Gloved hand touching phone
  * HS_03 Unlabeled reagent bottle
  * HS_04 Closed sterile packet
  * HS_05 Properly placed waste container

### Input Mechanisms

* Hotspot tap (multi-select)
* Buttons:

  * Submit
  * Reset
  * Retry

### Feedback System

* Marker overlays:

  * Correct
  * Incorrect
  * Missed correct
* Bottom pop-up panel:

  * Outcome header
  * Explanation
  * Item-level feedback

### Navigation Rules

* No progression until submit
* Retry resets entire state
* No auto-submit

---

# 3. High-Level Flow

1. Load default screen (scene + instruction)
2. Learner explores scene
3. Learner selects hotspots (max 3)
4. Submit enabled only at 3 selections
5. Learner clicks Submit
6. System evaluates:

   * Correct selections
   * Incorrect selections
   * Missed correct hotspots
7. Feedback panel opens
8. Outcome displayed (3 variants)
9. Learner can click Retry
10. Reset → back to default state

---

# 4. Screen-by-Screen PRD

---

## SCREEN 1 — Default State

### A. App Content (VERBATIM)

Before You Begin the Experiment
Tap the 3 areas that could compromise sample integrity.

“Before we begin, which 3 things here could contaminate the experiment?”

Selected: 0 of 3

Submit
Reset

---

### B. Developer Instructions

```
state = DEFAULT
selected_count = 0

disable(BTN_SUBMIT)
collapse(feedback_panel)

render:
- all hotspots neutral
- no markers
- character visible
```

---

## SCREEN 2 — Selection States

### A. App Content (VERBATIM)

Before You Begin the Experiment
Tap the 3 areas that could compromise sample integrity.

“Before we begin, which 3 things here could contaminate the experiment?”

Selected: X of 3

Submit
Reset

---

### B. Developer Instructions

```
on hotspot_click(hs_id):
    toggle selection

if hs_selected:
    apply visual = "neutral selected (blue ring)"

selected_count = count(selected hotspots)

if selected_count > 0:
    enable(BTN_RESET)

if selected_count == 3:
    enable(BTN_SUBMIT)
else:
    disable(BTN_SUBMIT)

if selected_count == 3 AND user clicks another hotspot:
    prevent OR soft prompt
```

---

## SCREEN 3 — Submit Evaluation State

### A. App Content (VERBATIM)

You identified some risks, but missed others.
Open exposure and glove-to-phone contact are contamination risks. The sterile packet is safe as shown. The unlabeled bottle was a missed risk.

Retry

---

### B. Developer Instructions

```
on submit:

lock all hotspots

correct_set = [HS_01, HS_02, HS_03]

correct_count = count(selected ∩ correct_set)
incorrect_count = count(selected ∩ distractors)
missed = correct_set - selected

for hs in selected:
    if hs in correct_set:
        mark(hs, CORRECT)
    else:
        mark(hs, INCORRECT)

for hs in missed:
    mark(hs, MISSED_CORRECT)

open(feedback_panel)
state = EVALUATION
```

---

## SCREEN 4 — Hotspot Feedback Mapping

### A. App Content (VERBATIM)

HS_01 · Open petri dish
An open petri dish is vulnerable to airborne and contact contamination. Leaving it exposed before controlled use increases sample risk.

HS_02 · Gloved hand touching phone
Touching a personal phone with lab gloves can transfer contaminants between non-lab and lab surfaces. This creates cross-contact risk.

HS_03 · Unlabeled reagent bottle
An unlabeled reagent creates risk because the contents cannot be verified confidently. Misidentification can affect safety and integrity.

HS_04 · Closed sterile packet
Safe as shown. The item remains sealed and has not yet been opened, so it is not a contamination risk in this state.

HS_05 · Properly placed waste container
Acceptable placement. It supports safe disposal and is not itself one of the contamination risks in this setup.

---

### B. Developer Instructions

```
for each hotspot:
    attach rationale_text

display logic:
- show only for:
    - selected hotspots
    - missed correct hotspots
```

---

## SCREEN 5 — Outcome States

### A. App Content (VERBATIM)

**Outcome A · Fully correct**
Header: Well spotted.
Body: You identified the key contamination risks before the experiment began. Strong pre-lab observation helps prevent avoidable contamination and handling errors.

**Outcome B · Partially correct**
Header: You identified some risks, but missed others.
Body: A few important contamination risks were correctly identified, but some selected items were safe or lower risk.

**Outcome C · Mostly incorrect**
Header: Take another look at the setup.
Body: The highest-risk contamination points were not fully identified. Focus on items that are exposed, mislabeled, or likely to transfer contamination.

Shared reinforcement line:
Contamination risk often begins with small setup oversights.

---

### B. Developer Instructions

```
if correct_count == 3:
    outcome_state = FULL
elif correct_count == 2:
    outcome_state = PARTIAL
else:
    outcome_state = LOW

render outcome header + body accordingly
append reinforcement line
```

---

## SCREEN 6 — Bottom Panel Structure

### A. App Content (VERBATIM)

Layer 1 · Outcome header
Layer 2 · Overall evaluation paragraph
Layer 3 · Item-specific rationale rows
Layer 4 · Reinforcement summary + CTA

Retry

---

### B. Developer Instructions

```
panel_structure = [
    outcome_header,
    evaluation_body,
    hotspot_feedback_list,
    reinforcement_text,
    BTN_RETRY
]

animate panel from bottom
do not hide background scene
```

---

## SCREEN 7 — Retry / Reset

### A. App Content (VERBATIM)

Retry
Reset

---

### B. Developer Instructions

```
on RESET:
    clear all selections
    selected_count = 0
    disable submit
    remove markers

on RETRY:
    reset entire state:
        selected_count = 0
        clear markers
        collapse panel
        state = DEFAULT
```

---

## SCREEN 8 — Completion State

### A. App Content (VERBATIM)

Before You Begin the Experiment
Tap the 3 areas that could compromise sample integrity.

“You identified some risks, but missed others.”
Open exposure and glove-to-phone contact are contamination risks. The sterile packet is safe as shown. The unlabeled bottle was a missed risk.

Retry

---

### B. Developer Instructions

```
state = COMPLETE

- keep markers visible
- keep panel open
- disable further selection

only action available:
    BTN_RETRY
```

---

# 5. Error & Feedback Patterns

### Wrong Selection (Distractor Chosen)

* Mark as incorrect
* Show rationale explaining why safe

### Less Than Required

* Submit disabled
* No explicit feedback (implicit constraint)

### More Than Required

* Prevent 4th selection

### Missed Correct

* Highlight with "missed risk" marker
* Show explanation

### Fully Correct

* Outcome A messaging

---

# 6. Variants Handling

No structural variants.

Reusable pattern:

* Same logic can extend to:

  * Different scenes
  * Different hotspot sets
  * Different domains

---

# 7. Content vs Developer Instructions

### App Content

* All text strings:

  * Titles
  * Instructions
  * Dialogue
  * Feedback
  * Outcome messages
  * Hotspot explanations
  * CTA labels

### Developer Logic

* Selection constraints (max = 3)
* Submit enable/disable logic
* Evaluation logic
* Marker rendering rules
* State transitions
* Feedback panel behavior
* Outcome computation

