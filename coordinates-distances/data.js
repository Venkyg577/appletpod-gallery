var appData = {
  en: {
    "standard-ui": {
      buttons: {
        next: "Next",
        explore_again: "Explore again"
      }
    },
    "content-ui": {
      screens: {
        s1_heading: "Let's use coordinates to find distances in Riaan's room.",
        s1_cta: "Tap Next to find the room door on the coordinate grid.",

        s2_heading: "If D₁R₁ represents the door to Reiaan's room.",
        s2_instruction: "Tap both endpoints of the door: D₁ and R₁.",

        s3_heading: "The door starts at D₁ and ends at R₁. Let's find where D₁ is.",
        s3_instruction: "Tap D₁ to reveal its coordinates.",

        s4_heading: "D₁ is at (8, 0). To find the distance from the y-axis, look at the x-coordinate.",
        s4_question: "How far is D₁ from the y-axis?",
        s4_opt_a: "8 units",
        s4_opt_b: "0 units",

        s5_heading: "Door is 8 units away from the left wall (the y-axis) of the room. Now look at the y-coordinate of D₁.",
        s5_question: "How far is D₁ from the x-axis?",
        s5_opt_a: "8 units",
        s5_opt_b: "0 units",

        s6_heading: "Since D₁ lies on the x-axis, the door starts 0 units away from the x-axis.",
        s6_cta: "Tap Next to find the width of the door.",

        s7_heading: "The door starts at D₁(8, 0) and ends at R₁(11.5, 0). To find its width, subtract the x-coordinate of D₁ from the x-coordinate of R₁.",
        s7_instruction: "Tap the width of the room door.",
        s7_opt_a: "3.5 units",
        s7_opt_b: "3 units",
        s7_opt_c: "2.5 units",
        s7_feedback_correct: "Correct! The width of the door is 11.5 − 8 = 3.5 units.",
        s7_feedback_incorrect: "Not quite. The door width is the difference between the x-coordinates of R₁ and D₁.",

        s8_heading: "Hence the width of the door is 3.5 units.",
        s8_cta: "Tap Next to see what this width means in real life.",

        s9_heading: "Assuming 1 unit = 1 foot, this door is wider than many standard room doors and should be comfortable for most people, including wheelchair users.",
        s9_cta: "Tap next to continue.",

        s10_heading: "B₁ and B₂ are the endpoints of the bathroom door.",
        s10_instruction: "Tap B₁ and B₂ to reveal their coordinates.",

        s11_heading: "The bathroom door lies on the y-axis. To find its width, subtract the y-coordinates of B₁ and B₂.",
        s11_instruction: "Tap the width of the bathroom door.",
        s11_opt_a: "3.5 units",
        s11_opt_b: "3 units",
        s11_opt_c: "2.5 units",
        s11_feedback_correct: "Correct! The width of the bathroom door is 4 − 1.5 = 2.5 units.",
        s11_feedback_incorrect: "Incorrect! Use: y-coordinate of B₂ − y-coordinate of B₁.",

        s12_heading: "Hence, the bathroom door is 2.5 units wide.",
        s12_cta: "Tap next to compare with width of the room door.",

        s13_heading: "The bathroom door is 2.5 units wide and the room door is 3.5 units wide. Since 2.5 is less than 3.5, the bathroom door is narrower."
      },
      labels: {
        room_door_width: "3.5 units",
        bathroom_door_width: "2.5 units"
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = appData;
if (typeof window !== 'undefined') window.appData = appData;
