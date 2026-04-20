
# 1. Applet Overview

**Applet Name**
Equivalent Fractions – Clay Block Exploration

**Learning Objective (derived)**
Help learners understand that the same value can be represented using different fractions by visually dividing a whole into equal parts.

**High-level Description**
Learner observes and interacts with clay blocks. They divide blocks into equal parts using a slider-controlled knife and select parts to form fractions, eventually recognizing equivalent fractions (1/2 = 2/4 = 3/6).

---

# 2. Core Applet Components

### Visual Components

* Clay blocks (3 blocks representing 1, 2, 3)
* Slider with values: 2, 4, 6
* Knife (moves from slider)
* Block partitions (dynamic)
* Highlight states (green outline, pulsation)
* Fraction display (1/2, 2/4, 3/6)
* Equal sign (=)
* Hand icon (interaction hint)

### Input Mechanisms

* Slider drag (select division count)
* Tap on block parts (selection)

### Feedback System

* Pulsation of blocks/parts
* Green highlight (correct selection)
* Teeter animation (incorrect division)
* Auto-reset knife position
* Delayed transitions (2 seconds)

### Navigation Rules

* Linear progression (Block 1 → Block 2 → Block 3)
* Next state unlocked only after correct interaction

---

# 3. High-Level Flow

1. Intro screen shows 3 blocks and concept of equal values
2. Focus shifts to first block
3. Learner divides block into 2 parts
4. Learner selects 1 part → fraction appears (1/2)
5. Second block introduced
6. Learner divides into 4 parts
7. Learner selects 2 parts → fraction appears (2/4)
8. Equivalence shown (1/2 = 2/4)
9. Third block introduced
10. Learner divides into 6 parts
11. Learner selects 3 parts → fraction appears (3/6)
12. Final equivalence shown (1/2 = 2/4 = 3/6)

---

# 4. Screen-by-Screen PRD

---

## Screen 1: Introduction

### A. App Content (VERBATIM)

* “Let’s explore how the same value can be shown using different fractions.”
* “Divide the block into equal parts”
* “One Whole clay block”
* “1 = 2 = 3”

### B. Developer Instructions

* Animate:

  * Pulsate blocks sequentially
  * Pulsate one whole block (right side)
* After 2 seconds:

  * Highlight slider
  * Enable slicer interaction

---

## Screen 2: Focus on First Block

### A. App Content (VERBATIM)

* “Watch how a whole can be divided into equal parts.”
* “Divide the block into equal parts”
* “One Whole clay block”
* “1 = 2 = 3”

### B. Developer Instructions

* Pulsate first block
* Dehighlight second and third blocks after 2 seconds
* Enable slider interaction

---

## Screen 3: Divide into 2 Parts

### A. App Content (VERBATIM)

* “Divide the whole into 2 equal parts.”
* “Divide the block into equal parts”
* “One Whole clay block”

### B. Developer Instructions

* expectedValue = 2
* If slider != 2:

  * Divide block into selected parts
  * Trigger teeter animation
  * Reset knife to original position
* If slider == 2:

  * Lock knife
  * Apply green highlight around block

---

## Screen 4: Cutting Animation

### A. App Content (VERBATIM)

* “Divide the whole into 2 equal parts.”

### B. Developer Instructions

* Pulsate slider value 2
* Animate knife moving from slider to block
* Animate cutting into 2 equal parts

---

## Screen 5–6: Select 1 out of 2 Parts

### A. App Content (VERBATIM)

* “Select 1 out of 2 equal parts.”

### B. Developer Instructions

* After 1 second:

  * Show hand icon
* On tap:

  * Allow selection of only one part
  * Highlight selected part

---

## Screen 7: Selection Feedback

### A. App Content (VERBATIM)

* “Select 1 out of 2 equal parts.”

### B. Developer Instructions

* On correct selection:

  * Pulsate selected part
  * Bring selected part forward
* After 2 seconds:

  * Transition to fraction display

---

## Screen 8: Fraction Display (1/2)

### A. App Content (VERBATIM)

* “This is ½ of the whole.”
* “1/2”

### B. Developer Instructions

* Display fraction 1/2
* Dehighlight first block after 2 seconds
* Prepare second block interaction

---

## Screen 9–10: Divide into 4 Parts

### A. App Content (VERBATIM)

* “Now divide another whole into 4 equal parts.”
* “Divide the block into equal parts”
* “One Whole clay block”

### B. Developer Instructions

* expectedValue = 4
* Same logic as previous division:

```
if slider != 4:
  divide visually
  teeter
  reset knife
if slider == 4:
  lock knife
  green highlight
```

* Reuse same animation and flow as 2-part division

---

## Screen 11: Select 2 out of 4 Parts

### A. App Content (VERBATIM)

* (Implied continuation)
* Fraction: “2/4”

### B. Developer Instructions

* Allow selection of exactly 2 parts
* On selection:

  * Pulsate both selected parts
  * Bring forward

---

## Screen 12: Show Equivalence

### A. App Content (VERBATIM)

* “Both show the same value using different numbers of parts.”
* “1/2”
* “2/4”

### B. Developer Instructions

* Pulsate:

  * Selected parts in both blocks
  * Equal sign
* Show equality relation

---

## Screen 13: Concept Reinforcement

### A. App Content (VERBATIM)

* “Same value, different fractions — these are called equivalent fractions.”

### B. Developer Instructions

* Dehighlight first and second blocks after 2 seconds
* Prepare third block

---

## Screen 14–15: Divide into 6 Parts

### A. App Content (VERBATIM)

* “Now divide another whole into 6 equal parts.”
* “Divide the block into equal parts”
* “One Whole clay block”

### B. Developer Instructions

* expectedValue = 6
* Same reusable division logic
* Same animation flow

---

## Screen 16: Final Equivalence

### A. App Content (VERBATIM)

* “Equivalent fractions are different fractions that have the same value.”
* “1/2 = 2/4 = 3/6”
* “x2”
* “x3”

### B. Developer Instructions

* Display:

  * 1/2, 2/4, 3/6
* Highlight:

  * Multiplication relationships (x2, x3)
* Pulsate all selected parts across blocks
* Emphasize equality

---

# 5. Variants Handling

**Reusable Logic**

* Division logic identical for 2, 4, 6
* Selection logic varies only by count:

  * 1/2 → select 1
  * 2/4 → select 2
  * 3/6 → select 3

**Substitution Rule**

```
targetParts = sliderValue
requiredSelections = targetParts / 2
```

---

# 6. Error & Feedback Patterns

### Wrong Division

* Condition: slider != expectedValue
* Feedback:

  * Divide visually
  * Teeter animation
  * Reset knife

### Correct Division

* Condition: slider == expectedValue
* Feedback:

  * Lock knife
  * Green highlight

### Wrong Selection

* Condition: selectedParts != requiredSelections
* Feedback:

  * No progression
  * Maintain state (no highlight)

### Correct Selection

* Condition: selectedParts == requiredSelections
* Feedback:

  * Pulsate selected parts
  * Bring forward
  * Show fraction

---

# 7. Content vs Developer Instructions

### App Content

* All instructional text:

  * “Let’s explore how the same value can be shown using different fractions.”
  * “Divide the whole into 2 equal parts.”
  * “Select 1 out of 2 equal parts.”
  * “This is ½ of the whole.”
  * “Both show the same value using different numbers of parts.”
  * “Same value, different fractions — these are called equivalent fractions.”
  * “Equivalent fractions are different fractions that have the same value.”
* Fraction labels: 1/2, 2/4, 3/6
* UI labels: “One Whole clay block”, “Divide the block into equal parts”

### Developer Logic

* Slider validation rules
* Knife animation + reset behavior
* Teeter animation for incorrect input
* Selection count validation
* Pulsation timing (1–2 seconds delays)
* Highlight states (green outline, focus states)
* Fraction rendering logic
* Equality visualization logic
* State progression control

---
