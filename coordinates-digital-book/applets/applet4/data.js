var appData = {
  en: {
    "standard-ui": {
      buttons: {
        next: "Next",
        explore_again: "Explore again",
        drag_the_pointer: "Drag the pointer",
        drag_the_pointer_dot: "Drag the pointer.",
        tap_correct_quadrant: "Tap the correct quadrant"
      }
    },
    "content-ui": {
      screens: {
        s1_heading: "Let's draw the x-axis to start building the Cartesian plane.",

        s2_heading: "Now, let's draw the y-axis.",

        s3_heading: "The x-axis and y-axis divide the Cartesian plane into four parts.",
        s4_heading: "The x-axis and y-axis divide the Cartesian plane into four parts.",
        s5_heading: "The x-axis and y-axis divide the Cartesian plane into four parts.",
        s6_heading: "The x-axis and y-axis divide the Cartesian plane into four parts.",

        s7_heading: "These parts are called quadrants. They are numbered in an anti-clockwise direction.",

        s8_heading: "These four parts of the Cartesian plane are called quadrants.",
        s8_cta: "Tap a quadrant to discover the signs of its coordinates.",

        sign_I_text: "Points in Quadrant I have both x- and y-coordinates positive.",
        sign_I_point_label: "P (x, y)",

        sign_II_text: "Points in Quadrant II have negative x-coordinate and positive y-coordinate.",
        sign_II_point_label: "Q (-x, y)",

        sign_III_text: "Points in Quadrant III have both x- and y-coordinates negative.",
        sign_III_point_label: "R (-x, - y)",

        sign_IV_text: "Points in Quadrant IV have positive x-coordinate and negative y-coordinate.",
        sign_IV_point_label: "S (x, - y)",

        s9_heading: "Each quadrant has a different combination of coordinate signs.",
        s9_box_qI: "x and y are both positive.",
        s9_box_qII: "x is negative and y is positive.",
        s9_box_qIII: "x and y are both negative.",
        s9_box_qIV: "x is positive and y is negative.",

        s10_heading: "Identify the quadrant of the point P(5, 3).",
        s10_cta: "Tap the correct quadrant",

        s11_heading: "The point P(5, 3) lies in Quadrant I.",
        s11_cta: "Tap Next to plot P(5, 3).",

        s12_heading: "To plot P(5, 3), move 5 units right from O along the x-axis.",
        s12_cta: "Drag the pointer.",

        s13_heading: "The y-coordinate is 3 units above the x-axis.",
        s13_cta: "Drag the pointer",

        s14_heading: "Now, the y-coordinate is 3 units above from the x-axis.",

        s15_heading: "Point P(5, 3) is now plotted on the Cartesian plane.",
        s15_point_label: "P (5, 3)",

        s16_heading: "Choose a point to locate on the Cartesian plane.",

        s17_heading: "Allow the learner to select a quadrant.",

        s18_heading: "Locate the x-coordinate of P({x}, {y}).",
        s18_cta: "Drag the pointer.",

        s19_heading: "Locate the y-coordinate of P({x}, {y}).",

        s20_heading: "Locate y coordinate of P({x}, {y})",

        s21_heading: "Point P({x}, {y}) is now plotted on the Cartesian plane.",

        s22_heading: "Follow the same rule for the rest of the points."
      },
      labels: {
        quadrant_I: "Quadrant- I",
        quadrant_II: "Quadrant- II",
        quadrant_III: "Quadrant-III",
        quadrant_IV: "Quadrant- IV"
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = appData;
if (typeof window !== 'undefined') window.appData = appData;
