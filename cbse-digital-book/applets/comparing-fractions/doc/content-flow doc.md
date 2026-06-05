### 1. Applet Overview

* **Applet Name:** Comparing Fractions Visually
* **Learning Objective:** Understand that fractions depend on the size of the whole, and fair comparison requires same-sized wholes
* **High-level Description:**
  Learners interact with chocolate bars to:

  * Create fractions (1/2)
  * Compare fractions across different-sized wholes
  * Discover why comparisons can be unfair
  * Normalize wholes and compare correctly
  * Extend to comparing different fractions (1/2 vs 1/3)

---

### 2. Core Applet Components

**Character & Dialogue**

* Boojho and Paheli guided narration
* Instructional prompts and feedback text

**Visual Data**

* Chocolate bars (small and large)
* Partitioned segments (halves, thirds)
* Highlighted/shaded parts
* Labels: “Smaller half”, “Bigger half”

**Input Mechanisms**

* Option selection (2, 3, 5)
* Tap interactions (select part, chocolate bar)
* Symbol selection (>, =, <)
* CTA buttons (Next, Compare, Make Same Size)

**Feedback System**

* Pulsate (correct focus)
* Teeter (incorrect selection)
* Highlight/dim selection
* Overlapping animations for comparison

**Navigation Rules**

* Linear progression with gated validation
* “Next” enabled only after correct action
* Incorrect → stay on screen with feedback

---

### 3. High-Level Flow

1. Introduction → chocolate division into halves
2. Select correct partition (2 parts)
3. Select one half → understand 1/2
4. Repeat with larger chocolate
5. Compare halves from different wholes
6. Identify mismatch in whole size
7. Discover unfair comparison
8. Normalize wholes → compare again
9. Establish equality of halves
10. Learn rule: same-sized wholes required
11. Move to comparing 1/2 vs 1/3
12. Validate wholes are same
13. Compare shaded parts
14. Conclude 1/2 > 1/3
15. Final conceptual reinforcement

---

### 4. Screen-by-Screen PRD

---

## Screen 1

### A. App Content (VERBATIM)

Comparing Fractions Visually
Boojho and Paheli compare halves of two chocolate bars.
Let’s find out why the size of the whole chocolate bar matters.
Let’s Start

### B. Developer Instructions

* CTA → Start
* On click → navigate to next screen

---

## Screen 2

### A. App Content (VERBATIM)

Here is my chocolate bar. Let’s divide it to share.
Tap next to divide the chocolate.

### B. Developer Instructions

* On Next → animate chocolate splitting placeholder

---

## Screen 3

### A. App Content (VERBATIM)

To make       of this chocolate.
How many equal parts should we divide it into?
Choose the correct number of parts.
2
3
5

### B. Developer Instructions

* expectedValue = 2
* if correct → enable Next
* if incorrect → teeter(selectedOption)
* pulsate all options initially

---

## Screen 4

### A. App Content (VERBATIM)

Chocolate bar is divided into two equal parts.
Now choose one of the two equal parts.
Tap one of the two equal parts.

### B. Developer Instructions

* Pulsate both halves
* On selection:

  * highlight(selectedHalf)
  * dim(otherHalf)
* Enable Next after selection

---

## Screen 5

### A. App Content (VERBATIM)

This is 1 out of 2 equal parts.
This is called one-half.
Tap Next to see a bigger chocolate bar.

### B. Developer Instructions

* Display label 1/2
* Pulsate Next

---

## Screen 6 (Repeat Flow with Bigger Chocolate)

### A. App Content (VERBATIM)

Now I have a bigger chocolate bar.
To take        of it, how many equal parts should I divide it into?
Choose the correct number of parts.
2
3
5

### B. Developer Instructions

* Same logic as Screen 3
* expectedValue = 2

---

## Screen 7–8 (Select Half Again)

### A. App Content (VERBATIM)

Chocolate bar is divided into two equal parts.
Now choose one of the two equal parts.

### B. Developer Instructions

* Same selection logic as earlier

---

## Screen 9

### A. App Content (VERBATIM)

This is 1 out of 2 equal parts.
This is also one-half.
Tap Next to compare both one-half parts.

### B. Developer Instructions

* Show both chocolates side by side

---

## Screen 10 (Comparison Question)

### A. App Content (VERBATIM)

Both are one-half.
But look at the whole chocolate bars.
Are they the same size?
Yes
No
Tap the correct answer.

### B. Developer Instructions

* expectedValue = No
* incorrect → teeter + stay
* correct → proceed

---

## Screen 11 (Incorrect Handling)

### A. App Content (VERBATIM)

Look carefully at the size of the whole chocolate bars.
Yes
No
Tap the correct answer.

### B. Developer Instructions

* On wrong:

  * pulsate whole outline
  * revert state

---

## Screen 12 (Correct Feedback)

### A. App Content (VERBATIM)

Nice!
The whole chocolate bars are different sizes.

### B. Developer Instructions

* Pulsate outlines
* Return to main comparison state

---

## Screen 13–15 (Why halves differ)

### A. App Content (VERBATIM)

Both chocolates represents the same fraction      .
Then why do they show different amount of chocolate?
Tap Next to investigate.

### B. Developer Instructions

* Pulsate both chocolates
* Move to comparison animation

---

## Screen 16 (Overlap Animation)

### A. App Content (VERBATIM)

Let’s compare
of both the chocolate bars.

### B. Developer Instructions

* Animate small over big
* Highlight halves

---

## Screen 17

### A. App Content (VERBATIM)

The halves are different because the whole chocolate bars are different sizes.

Smaller half
Bigger half

### B. Developer Instructions

* Label halves
* Pulsate larger half

---

## Screen 18

### A. App Content (VERBATIM)

of the bigger chocolate is bigger than the
of the smaller chocolate.

### B. Developer Instructions

* Highlight larger half
* Pulsate corresponding 1/2

---

## Screen 19–21 (Concept Rule)

### A. App Content (VERBATIM)

The same fraction can show different amounts if the wholes are different sizes.

So, it is not fair to compare these fractions.

Fractions can be compared fairly only when they come from wholes of the same size.

### B. Developer Instructions

* Sequential screens
* No interaction

---

## Screen 22 (Make Same Size)

### A. App Content (VERBATIM)

Tap a chocolate bar, then tap ‘Make Same Size.
Let’s make both chocolates the same size and compare again.
Make same size

### B. Developer Instructions

* Step 1: select chocolate
* Step 2: trigger resize animation
* Normalize dimensions

---

## Screen 23 (Equal Comparison)

### A. App Content (VERBATIM)

Now both chocolate bars are the same size.
Do both halves show the same amount?

Choose the correct symbol.

>

=
<

### B. Developer Instructions

* expectedValue = =
* incorrect → prompt retry

---

## Screen 24 (Overlap Check)

### A. App Content (VERBATIM)

Look again carefully.
Do the shaded halves cover the same amount?

### B. Developer Instructions

* Animate overlap
* Highlight matching edges

---

## Screen 25 (Result)

### A. App Content (VERBATIM)

Both        of the chocolates cover the same amount.

=

Both halves are equal.
Here the comparison is fair and meaningful.

### B. Developer Instructions

* Auto transition after 2 seconds

---

## Screen 26 (Rule Reinforcement)

### A. App Content (VERBATIM)

So, to compare fractions fairly, first check that the wholes are the same size.

### B. Developer Instructions

* Passive screen

---

## Screen 27 (New Case: 1/2 vs 1/3)

### A. App Content (VERBATIM)

Here are two chocolates showing        and       .
Can we find which one is greater?

### B. Developer Instructions

* Display 1/2 and 1/3

---

## Screen 28 (Check Same Size)

### A. App Content (VERBATIM)

Before we compare, let’s use our rule.
Are these chocolates the same size?
Yes
No

### B. Developer Instructions

* expectedValue = Yes

---

## Screen 29 (Overlap Whole)

### A. App Content (VERBATIM)

Great!
The wholes are the same size.
So now we can compare the fractions.

### B. Developer Instructions

* Animate overlap

---

## Screen 30 (Compare Fractions)

### A. App Content (VERBATIM)

Choose the correct symbol

>

=
<

Now look at the shaded parts.
Which fraction is bigger?

### B. Developer Instructions

* expectedValue = >

---

## Screen 31 (Final Insight)

### A. App Content (VERBATIM)

One-half covers more area than one-third.

is bigger than    .

### B. Developer Instructions

* Highlight 1/2

---

## Screen 32 (Closure)

### A. App Content (VERBATIM)

Now I understand!
Before comparing fractions,
I must check if the wholes are the same size.

That’s right!
Fractions can be compared fairly only when they come from same-sized wholes.

Now, can different fractions of the same whole be equal?

That’s an interesting question!
Let’s explore it next.

### B. Developer Instructions

* End state

---

### 5. Error & Feedback Patterns

* **Incorrect option (partition / yes-no / symbol)**
  → teeter(selectedOption)

* **Correct selection**
  → enable Next

* **Wrong conceptual answer (same size check)**
  → pulsate whole outline + revert

* **Comparison mistakes**
  → replay animation + retry

---

### 6. Content vs Developer Instructions

**App Content**

* All dialogues
* Instructions
* Questions
* Options (2,3,5 / Yes-No / > = <)
* Feedback text (“Nice!”, “Great!” etc.)

**Developer Logic**

* Validation rules (expectedValue)
* Animation triggers (overlap, resize)
* Interaction gating (Next enable/disable)
* Visual feedback (pulsate, teeter, highlight, dim)
* State transitions and retries
