# UPDATED HIGH-LEVEL FLOW (Developer Logic)

## Flow A — Guided Discovery: 1/2 → 2/4

### Step 1 — Intro

Learner enters equivalent fractions exploration.

State:

```pseudo
currentMode = intro
```

---

### Step 2 — Show Same-Sized Wholes

Display:

* 2 identical wholes
* unpartitioned

Goal:
establish comparison baseline

---

### Step 3 — Determine Partition Count for 1/2

Prompt:
How many equal parts to show 1/2?

Expected:

```pseudo
expected = 2
```

On correct:

```pseudo
partition both wholes into 2
```

---

### Step 4 — Denominator Understanding

Prompt:
denominator meaning

Expected:

```pseudo
2
```

---

### Step 5 — Shade Both Wholes

Learner:

* choose colour
* shade exactly one part in each whole

Validation:

```pseudo
for each whole:
    shadedCount == 1
```

Constraint:

```pseudo
nextDisabled until both valid
```

---

### Step 6 — Equality Visual Confirmation

System:

* pulsate shaded halves
* pulsate 1/2 labels
* show equals

Then:

* overlap whole A over whole B

Purpose:
same-sized same-shaded confirmation

---

### Step 7 — Concept Prompt

Question:
If one whole is divided into smaller equal parts, will shaded amount change? 

No validation input here.
Transition only.

---

### Step 8 — Whole Selection

NEW LOGIC CHANGE

Learner chooses which whole to transform. 

State:

```pseudo
selectedWhole = left | right
```

Behavior:

```pseudo
pulse both wholes
on selection:
   dim unselectedWhole
   lock selectedWhole
```

Constraint:

```pseudo
nextDisabled until selection
```

---

### Step 9 — Split Selected Whole

Updated doc now defines deterministic transformation:
each half split into 2 smaller equal parts → total 4 

State:

```pseudo
selectedWhole.parts = 4
selectedWhole.shadedArea = unchanged
```

Critical invariant:

```pseudo
visualArea(before) == visualArea(after)
```

This is core equivalence logic.

---

### Step 10 — Represent New Fraction

Prompt:
What fraction is shaded now?

Expected:

```pseudo
2/4
```

Distractors:

```pseudo
1/4
4/2
```

---

### Step 11 — Error Recovery Count Loop

If wrong answer: 

Behavior:

```pseudo
pulse shaded parts first
pulse all parts second
```

Expected:

```pseudo
2/4
```

Loop until correct.

---

### Step 12 — Fraction Explanation

System explains:

* denominator = 4
* numerator = 2 

Visual:

```pseudo
pulse numerator region
pulse denominator total
```

---

### Step 13 — Misconception Challenge

Prompt:
Is 2/4 > 1/2? 

Purpose:
number-comparison misconception

---

### Step 14 — Symbol Selection

Expected:

```pseudo
=
```

Options:

```pseudo
>
=
<
```

Wrong:
stay

---

### Step 15 — Overlay Proof

System animation: 

```pseudo
move shadedArea(1/2)
overlay on shadedArea(2/4)
opacity = translucent
```

Goal:
exact area match

---

### Step 16 — Equivalence Explanation

System explains:

* different number of equal parts
* same shaded amount 

Invariant:

```pseudo
partitionCount changed
areaChanged = false
```

---

### Step 17 — Naming Concept

System defines:

```pseudo
1/2 == 2/4
concept = equivalent fractions
```

---

# Flow B — Explicit Worked Example: 1/3 → 2/6

This remains deterministic.

---

### Step 18 — New Pair Intro

Prompt:
Are 1/3 and 2/6 equivalent? 

---

### Step 19 — Show 1/3

State:

```pseudo
whole.parts = 3
whole.shaded = 1
```

---

### Step 20 — Split Thirds

Instruction:
split each third into 2 smaller parts 

Transformation:

```pseudo
3 -> 6
```

Invariant:

```pseudo
shadedArea unchanged
```

---

### Step 21 — Identify New Fraction

Expected:

```pseudo
2/6
```

---

### Step 22 — Guided Count Recovery

Wrong path:
recount

Expected:

```pseudo
2/6
```

---

### Step 23 — Explicit Confirmation

System:
“Yes! 2 out of 6 equal parts are shaded” 

---

### Step 24 — Same Amount Check

Question:
Do 1/3 and 2/6 show same amount? 

Expected:

```pseudo
Yes
```

Wrong:
stay

---

### Step 25 — Reinforcement

Prompt:
look again

Expected:

```pseudo
Yes
```

---

### Step 26 — Equality Resolution

Once correct: 

```pseudo
replace "?" with "="
enable next
```

---

### Step 27 — Final Equivalent Statement

System:

```pseudo
1/3 == 2/6
```

---

# FINAL APPLET STATE MODEL

```pseudo
states = {
 intro,
 baseline_compare,
 denominator_understanding,
 shading,
 equality_confirmation,
 transformation_selection,
 repartition,
 fraction_identification,
 misconception_check,
 overlay_proof,
 equivalence_definition,
 second_example_intro,
 second_repartition,
 second_validation,
 summary,
 restart
}
```

---

# KEY DEVELOPER CORRECTIONS FROM OLD PRD

## Remove this old branch

INVALID now:

```pseudo
choose 4 OR 6 from first example
```

That was from intermediary source version.

Final updated file is:

```pseudo
1/2 -> 2/4 only
```

---

## Preserve visual area invariant

Critical:

```pseudo
area(before split) == area(after split)
```

Not just numeric fraction swap.

---

## Add state lock for whole selection

Missing in prior PRD.

Need:

```pseudo
selectedWhole required before repartition
```

---

## Add misconception pedagogy state

The “2/4 has more shaded parts” trap is deliberate.

Need explicit state:

```pseudo
misconceptionCheck
```

---

This is now the corrected **developer logic + flow architecture** for the updated applet.
