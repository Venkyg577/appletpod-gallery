var appData = {
  en: {
    ui: {
      title: "Biology Lab Safety",
      instruction: "Identifying potential contaminants before starting an experiment",
      btn_submit: "Submit",
      btn_retry: "Retry",
      btn_continue: "Continue",
      feedback_panel_title: "Feedback",
      screens: {
        screen1: {
          dialogue:
            "Before we begin, inspect the bench setup. Which items here could contaminate the experiment?",
          footer: "Tap to select 3 items, then select Submit."
        },
        screen2: {
          dialogue:
            "Good start. Check the rest of the setup - there may be other contamination risks here.",
          footer: "1 of 3 selected. Tap to select 2 more items, then Submit."
        },
        screen3: {
          dialogue:
            "You're getting close. Review the setup once more and choose one more possible risk.",
          footer: "2 of 3 selected. Tap to select 1 more item and Submit."
        },
        screen4: {
          dialogue:
            "You've marked three possible risks. Tap Submit and let's check the setup.",
          footer: "3 of 3 selected. Tap Submit to check your inspection."
        },
        screen5: {
          dialogue:
            "You caught some valid risks, but missed {count} {count, plural, one {item} other {items}}.",
          footer: "Review the feedback, then tap Retry to inspect again.",
          lead_in: "Almost there. Review the feedback and try the inspection again."
        },
        screen6: {
          dialogue:
            "Well spotted - those are the contamination risks I wanted you to catch.",
          footer: "Select Continue to close, or Retry to inspect again.",
          lead_in: "You identified all three key contamination risks."
        }
      }
    },
    hotspots: {
      hs1: {
        label: "Open petri dish",
        correct_msg:
          "An open petri dish is vulnerable to airborne and contact contamination. Leaving it exposed before controlled use increases sample risk.",
        missed_msg:
          "An open petri dish is vulnerable to airborne and contact contamination. Leaving it exposed before controlled use increases sample risk."
      },
      hs2: {
        label: "Gloved hand touching phone",
        correct_msg:
          "Touching a personal phone with lab gloves can transfer contaminants between non-lab and lab surfaces. This creates cross-contact risk.",
        missed_msg:
          "Touching a personal phone with lab gloves can transfer contaminants between non-lab and lab surfaces. This creates cross-contact risk."
      },
      hs3: {
        label: "Unlabeled reagent bottle",
        correct_msg:
          "An unlabeled reagent creates risk because the contents cannot be verified confidently. Misidentification can affect safety and integrity.",
        missed_msg:
          "An unlabeled reagent creates risk because the contents cannot be verified confidently. Misidentification can affect safety and integrity."
      },
      hs4: {
        label: "Closed sterile packet",
        incorrect_msg:
          "Safe as shown. The item remains sealed and has not yet been opened, so it is not a contamination risk in this state."
      },
      hs5: {
        label: "Properly closed waste container",
        incorrect_msg:
          "Accepted element. It supports safe disposal and is closed to prevent any further contact, so it is not a contamination risk."
      }
    },
    feedback: {
      reinforcement:
        "Contamination risk often begins with small setup oversights.",
      correct_flow: {
        remember_title: "What to remember",
        remember_points: [
          "Exposed materials increase contamination risk.",
          "Phones and personal devices create cross-contact pathways.",
          "Unlabeled reagents can lead to unsafe handling."
        ],
        remember_icons: [
          { src: "assets/images/bowl.png", alt: "Exposed petri dish" },
          { src: "assets/images/phone.png", alt: "Phone and glove cross-contact" },
          { src: "assets/images/bottle.png", alt: "Unlabeled reagent bottle" }
        ],
        summary_title: "Summary and next step",
        summary_body: "You identified the three contamination risks.",
        summary_points: [
          "Exposed materials increase contamination risk.",
          "Phones and personal devices create cross-contact pathways.",
          "Unlabeled reagents should never be handled without clear labels."
        ]
      }
    }
  }
};

if (typeof module !== "undefined" && module.exports) module.exports = appData;
if (typeof window !== "undefined") window.appData = appData;
