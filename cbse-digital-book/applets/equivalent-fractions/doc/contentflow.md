# Developer-Ready PRD

## Applet: *Boojho’s Chocolate Sharing – Equivalent Fractions (Applet 2)*

---

# 1. Applet Overview

### Applet Name

**Boojho’s Chocolate Sharing – Equivalent Fractions**

### Learning Objective

Enable learners to discover that fractions that look different can represent the same quantity of the same-sized whole, and identify/generate equivalent fractions through visual partitioning.

### High-Level Description

The learner:

* compares same-sized wholes
* partitions wholes into equal parts
* shades parts
* observes invariance of shaded quantity when partitions increase
* identifies equivalent fractions visually
* validates equivalence using two worked examples:

  * 1/2 = 2/4
  * 1/3 = 2/6

---

# 2. Core Applet Components

## Visual Components

* Same-sized whole rectangles/circular fraction visuals (as shown in source)
* Fraction labels
* Equal partition overlays
* Dotted split guides
* Shaded regions
* Overlay animation for comparison
* Fraction equation display with symbols:

  * =
  * >
  * <

---

## Input Components

* Next button
* Start Again button
* Tap-to-select numeric options
* Tap-to-select Yes/No
* Tap-to-select comparison symbol
* Tap to choose color
* Tap fraction segment
* Tap whole
* Tap dotted split guides

---

## Feedback Components

Visual:

* Pulsate
* Dim inactive object
* Overlay animation
* Transparency comparison animation
* Highlight numerator
* Highlight denominator
* Highlight shaded parts

Behavioral:

* Disable Next until valid completion
* Reject incorrect answers without progression
* replay counting guidance

---

## Navigation Rules

* Strict linear progression
* No skip states
* Next unlocks only after required action
* Wrong answers do not advance state
* Final restart loop via Start Again

---

# 3. High-Level Flow

1. Intro concept setup
2. Show two same-sized wholes
3. Determine denominator for 1/2
4. Divide both wholes into 2 equal parts
5. Shade 1/2 in both
6. Confirm equality
7. Ask if splitting into smaller equal parts changes amount
8. Convert 1/2 → 2/4
9. Identify resulting fraction
10. Compare 1/2 and 2/4
11. Define equivalent fractions
12. Second worked example: 1/3 → 2/6
13. Confirm equivalence
14. Reinforcement summary
15. Transition to next activity
16. Restart option

---

# 4. Screen-by-Screen PRD

---

# SCREEN 1 — Intro

## A. App Content (VERBATIM)

**Equivalent Fractions**

“We know that fractions can be compared when the wholes are the same size.”

“But can two different-looking fractions show the same amount of one whole?”

“Let’s explore!”

**CTA:**
“Let’s Start”

---

## B. Developer Instructions

* Initial landing state
* Single CTA enabled
* On tap → Screen 2

---

# SCREEN 2 — Same Sized Wholes

## A. App Content

“Here are two wholes of the same size.”

“Tap Next to divide both wholes into equal parts.”

CTA: **Next**

---

## B. Developer Instructions

* Render two identical wholes
* No interaction except Next

---

# SCREEN 3 — Determine Partition Count

## A. App Content

“To show 1/2, how many equal parts should each whole be divided into?”

“Tap the correct answer.”

Options include:

* 2
* distractors

CTA: Next

---

## B. Developer Instructions

```pseudo
expected = 2
if selected == expected:
    animate divide both wholes into 2 equal parts
    enable next
else:
    keep locked
```

Animation:

* split both wholes into 2 equal parts

---

# SCREEN 4 — Denominator Meaning

## A. App Content

“Look at the denominator of 1/2.”

“It tells the total number of equal parts.”

“Tap the correct answer.”

---

## B. Developer Instructions

```pseudo
expected = 2
if correct:
    enable next
else:
    remain
```

---

# SCREEN 5 — Shade 1/2

## A. App Content

“Now, shade 1/2 of each whole.”

“Tap to choose the color. Then tap one part in each whole.”

CTA: Next

---

## B. Developer Instructions

Rules:

* learner selects color
* must shade exactly 1 part in each 2-part whole

```pseudo
required_shaded_per_whole = 1
total_wholes = 2

if valid:
   enable next
```

Interaction:

* tapped part pulses
* fill with selected color

Constraint:

* no progression unless both correctly shaded

---

# SCREEN 6 — Visual Equality Confirmation

## A. App Content

“The wholes are the same size and divided into equal parts.”

“The same amount is shaded in both.”

“Tap Next”

---

## B. Developer Instructions

Animation:

* pulsate wholes
* overlap both wholes

---

# SCREEN 7 — Fraction Equality

## A. App Content

“So, both wholes show the fraction 1/2.”

“Tap next to continue.”

---

## B. Developer Instructions

Animation:

* pulsate shaded parts
* pulsate 1/2 labels
* show equality symbol

---

# SCREEN 8 — Predict Change

## A. App Content

“If we divide one whole into smaller equal parts, will the shaded amount change?”

“Tap next to explore.”

---

## B. Developer Instructions

Informational transition only

---

# SCREEN 9 — Split Halves into Fourths

## A. App Content

“Let’s divide each half of one whole into two smaller equal parts.”

“Tap to choose one whole, Then tap the dotted lines to split each half into two smaller parts.”

---

## B. Developer Instructions

Rules:

* learner selects one whole
* dim unselected whole
* pulsate “4”
* learner taps split guides

Result:

* selected whole becomes 4 equal parts
* shaded region preserved exactly

---

# SCREEN 10 — State Result

## A. App Content

“Each half was split into 2 smaller parts.”

“Now this whole has 4 equal parts.”

“Tap next to represent in fraction.”

---

## B. Developer Instructions

Informational transition

---

# SCREEN 11 — Identify Fraction

## A. App Content

“Look at the divided whole.”

“What fraction is shaded now?”

“Tap the correct answer.”

Options:

* 2/4
* distractors

---

## B. Developer Instructions

```pseudo
expected = 2/4
```

Wrong answer feedback:

* pulsate 2 shaded parts
* pulsate all 4 parts

---

# SCREEN 12 — Guided Counting

## A. App Content

“Let’s count again.”

“Check how many parts are shaded?”

“And how many equal parts are there in all?”

“Tap the correct answer.”

---

## B. Developer Instructions

Same validation:

```pseudo
expected = 2/4
```

Wrong:

* replay count cues

---

# SCREEN 13 — Explain Numerator / Denominator

## A. App Content

“The denominator 4 tells us the whole has 4 equal parts.”

“The numerator 2 tells us 2 parts are shaded.”

“So, the fraction is 2/4”

“Tap next to continue.”

---

## B. Developer Instructions

If correct:

* pulsate shaded parts
* pulsate all parts

---

# SCREEN 14 — Compare Fractions

## A. App Content

“Now the fractions look different.”

“2/4 has 2 shaded parts, but 1/2 has only 1 shaded part.”

“Is 2/4 greater than 1/2?”

“Tap to know.”

---

## B. Developer Instructions

Informational setup only

---

# SCREEN 15 — Symbol Comparison

## A. App Content

“We do not compare only the numbers.”

“We compare the shaded amount in same-sized wholes.”

“Tap the correct symbol.”

Options:

* >
* =
* <

---

## B. Developer Instructions

```pseudo
expected = "="
```

---

# SCREEN 16 — Visual Overlay Validation

## A. App Content

“Look at the shaded parts.”

“Check if they cover the same amount of the whole?”

“Tap the correct answer.”

---

## B. Developer Instructions

Animation:

* slide shaded area from 1/2 over 2/4
* transparent overlap

Expected:

```pseudo
equal
```

---

# SCREEN 17 — Equality Explanation

## A. App Content

“The shaded parts are equal in size.”

“Tap next to continue.”

---

## B. Developer Instructions

Replay overlay animation

---

# SCREEN 18 — Concept Explanation

## A. App Content

“Even though the wholes are divided into different numbers of equal parts, the shaded amount did not change.”

“Only the number of equal parts changed.”

“Tap next to continue.”

---

## B. Developer Instructions

Pulsate:

* partition counts
* shaded regions

---

# SCREEN 19 — Equivalent Fraction Statement

## A. App Content

“So the two different looking fractions 1/2 and 2/4 represent the same amount of whole, so the fractions are equal.”

---

## B. Developer Instructions

Animation:

* pulsate shaded regions
* pulsate fraction labels

---

# SCREEN 20 — Definition

## A. App Content

“The fractions 1/2 and 2/4 are called equivalent fractions.”

---

## B. Developer Instructions

Pulsate both fraction labels

---

# SCREEN 21 — General Rule

## A. App Content

“Fractions that look different but show the same amount are called equivalent fractions.”

“Tap Next to explore another pair of equivalent fractions.”

---

## B. Developer Instructions

Transition to second example

---

# SCREEN 22 — Example 2 Intro

## A. App Content

“Equivalent Fractions”

“Are 1/3 and 2/6 equivalent fractions?”

“Let’s find out!”

---

## B. Developer Instructions

Initialize second example

---

# SCREEN 23 — Show 1/3

## A. App Content

“This whole shows the fraction 1/3.”

“Tap Next to divide the whole further.”

---

## B. Developer Instructions

Display 3 equal partitions
1 shaded

---

# SCREEN 24 — Split Thirds

## A. App Content

“Let us divide each third into 2 smaller equal parts.”

“Tap the dotted lines to split each third.”

---

## B. Developer Instructions

Convert:

```pseudo
1/3 → 2/6
```

Preserve shaded quantity

---

# SCREEN 25 — Identify New Fraction

## A. App Content

“What fraction is shaded now?”

“Tap the correct answer.”

Options:

* 2/6
* distractors

---

## B. Developer Instructions

```pseudo
expected = 2/6
```

---

# SCREEN 26 — Counting Reinforcement

## A. App Content

“Let’s count again.”

“Check how many parts are shaded?”

“And how many equal parts are there in all?”

---

## B. Developer Instructions

Guided count cues

---

# SCREEN 27 — Confirmation

## A. App Content

“Yes! 2 out of 6 equal parts are shaded.”

---

## B. Developer Instructions

Positive confirmation

---

# SCREEN 28 — Equivalence Question

## A. App Content

“Do 1/3 and 2/6 show the same amount?”

Options:

* Yes
* No

---

## B. Developer Instructions

```pseudo
expected = Yes
```

---

# SCREEN 29 — Reflection

## A. App Content

“Look at the shaded parts again.”

“Even though the whole is divided into smaller part, shaded parts didn't change.”

---

## B. Developer Instructions

Maintain comparison visual

---

# SCREEN 30 — Explanation

## A. App Content

“The parts became smaller, but the shaded amount did not change.”

“So the fractions show the same amount.”

---

## B. Developer Instructions

On correct:

* replace ? with "="
* enable next

---

# SCREEN 31 — Equivalent Statement

## A. App Content

“Fractions 1/3 and 2/6 are also equivalent fractions.”

---

## B. Developer Instructions

Static confirmation

---

# SCREEN 32 — Summary

## A. App Content

“Equivalent fractions may look different, but they represent the same amount.”

“Fractions that look different but show the same amount of the whole are called equivalent fractions.”

---

## B. Developer Instructions

Show:

* 1/2 = 2/4
* 1/3 = 2/6

---

# SCREEN 33 — Transition

## A. App Content

“Now, can we generate equivalent fractions?”

---

## B. Developer Instructions

Transition screen

---

# SCREEN 34 — End State

## A. App Content

“Comparing Fractions Visually”

“That’s an interesting question!”

“You’ll explore this in the next activity.”

“Want to try again?”

CTA:
**Start Again**

---

## B. Developer Instructions

```pseudo
on Start Again:
   reset all state
   return screen 1
```

---

# 6. Error & Feedback Patterns

## Wrong Fraction Choice

Behavior:

* no progression
* replay counting support

Examples:

* choosing non-2/4
* choosing non-2/6

---

## Wrong Symbol

Expected:

```pseudo
=
```

Wrong:

* remain on screen

---

## Wrong Yes/No

Expected:

```pseudo
Yes
```

Wrong:

* remain
* preserve visual comparison

---

## Incomplete Shading

Cases:

* only one whole shaded
* wrong number shaded

Behavior:

```pseudo
disable next
```

---

## Incomplete Split Action

Cases:

* whole selected but not split
* partial split

Behavior:

```pseudo
block progression
```

---

# Content vs Developer Instructions

## App Content

Includes ONLY:

* all learner-facing dialogue
* instructions
* questions
* options
* feedback text
* CTA labels

---

## Developer Logic

Includes ONLY:

* validation
* progression rules
* state locks
* interaction gating
* animations
* visual highlighting
* comparison logic
* equality checking
* reset behavior
