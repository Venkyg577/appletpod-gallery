// data.js — all learner-facing text for Applet 5 "Distance Between Two Points".
// Text is verbatim from doc/content-flow.md / the source PDF. No logic lives here.
var appData = {
  en: {
    "standard-ui": {
      buttons: {
        next: "Next",
        horizontal_line: "Horizontal Line",
        vertical_line: "Vertical Line",
        explore_again: "Explore again"
      }
    },
    "content-ui": {
      screens: {
        // ---- Stage 1: intro slanted AD ----
        s1_heading: "Two points are marked on the coordinate plane. The line between them is slanted. How can we find its length?",
        s1_cta: "Tap Next to explore.",

        // ---- Stage 2: same-line intro, horizontal/vertical sample buttons ----
        s2_heading: "When two points lie on the same horizontal or vertical line, we can count the distance directly.",

        // ---- Screens 3-4 (horizontal PQ) ----
        s3_heading: "For a horizontal line, we subtract the x-coordinates.",
        s3_dist_label: "Distance along x-axis",
        s3_calc: "9 − 3 = 6 units",

        // ---- Screens 5-6 (vertical RS) ----
        s5_heading: "For a vertical line, we subtract the y-coordinates.",
        s5_dist_label: "Distance along y-axis",
        s5_calc: "5 − 2 = 3 units",

        // ---- Screen 7: restore slanted AD ----
        s7_heading: "But what if the line segment is slanted? We cannot count only along one axis.",
        s7_cta: "Tap Next to explore",

        // ---- Screens 8-10: horizontal change MCQ ----
        s8_heading: "Move from A(3,4) to D(7,1). First, find the horizontal change.",
        s8_question: "How far do we move along the x-axis?",
        s8_calc: "7 − 3 = 4",

        // ---- Screens 11-13: vertical change MCQ ----
        s11_heading: "Now find the vertical change from A to D.",
        s11_question: "How far do we move along the y-axis?",
        s11_calc: "4 − 1 = 3",

        // ---- Screen 14: build right triangle ----
        s14_heading: "The horizontal and vertical moves form a right triangle and AD becomes the slanted side of the right triangle.",

        // ---- Screens 15-17: AD via Pythagoras ----
        s15_heading: "Using Pythagoras, we can find the slanted distance AD. The slanted distance is the hypotenuse.",
        s15_question: "What is the length of AD?",
        s15_wrong: "Not quite! Apply:\nAD² = AC² + DC²",
        s15_correct: "Awesome!\nAD² = AC² + DC²\n= 3² + 4²\n= 9 + 16\n= 25 = 5 units",
        s15_cta: "Tap Next to find DM",

        // ---- Screens 18-22: DM drag tiles ----
        s18_heading: "Let's find the distance DM using the same method.",
        s18_slot_h: "Horizontal change",
        s18_slot_v: "Vertical change",
        s18_cta_h: "Drag the horizontal change first",
        s18_cta_v: "Drag the correct vertical change",

        // ---- Screens 23-25: DM via Pythagoras ----
        s23_heading: "Can you find DM?",
        s23_subheading: "Now use Pythagoras to find DM.",
        s23_question: "What is the length of DM?",
        s23_wrong: "Not quite!\nApply:\nDM² = DE² + ME²",
        s23_correct: "Awesome!\nDM² = DE² + ME²\n= 2² + 5²\n= 4 + 25\n= √29 units",
        s23_cta: "Tap Next to find MA",

        // ---- Screens 26-28: MA via Pythagoras ----
        s26_heading: "Now find the distance MA.",
        s26_question: "What is the length of MA?",
        s26_wrong: "Not quite!\nApply:\nPythagoras Theorem.",
        s26_correct: "Awesome!\n= 2² + 6²\n= 4 + 36\n= √40 units",

        // ---- Screen 29: generalize horizontal/vertical change ----
        s29_heading: "For any two points, we can find the horizontal and vertical changes.",
        s29_hchange_title: "Horizontal change:",
        s29_hchange: "x₂ − x₁ = 4",
        s29_vchange_title: "Vertical change:",
        s29_vchange: "y₂ − y₁ = 3",
        s29_note: "These horizontal changes and the vertical changes form a right triangle.",

        // ---- Screen 30: two shorter sides ----
        s30_heading: "The horizontal and vertical changes are the two shorter sides of a right triangle.",

        // ---- Screen 31: distance formula ----
        s31_heading: "The distance between two points is found using this formula.",
        s31_formula_intro: "Distance between the points A(x₁,y₁) and D(x₂,y₂) is",
        s31_formula: "AD = √((x₂ − x₁)² + (y₂ − y₁)²)",
        s31_note: "The distance formula is simply Pythagoras' Theorem written using coordinates.",

        // ---- Screens 32-33: free exploration ----
        s32_heading: "Let's explore the distance between any two points.",
        s32_cta_p1: "Tap the first point",
        s32_cta_p2: "Tap the second point"
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = appData;
if (typeof window !== 'undefined') window.appData = appData;
