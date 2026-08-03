// Misplaced Modifier applet — configuration + copy.
// All learner-visible strings are verbatim from DOC/Modifiers - 2updated .pdf,
// pages 22-30. Pink italic text in the source slides is developer notes and is
// NOT copy. Page 31 onward is Dangling Modifier — a separate applet.

window.MISPLACED_CONFIG = {
  // Screen 1 (deck p26): definition + the almost/almost comparison.
  compare: {
    wrong: {
      sentence: 'The manager almost reviewed every report.',
      mod: 'almost',
      meaning: 'The manager nearly reviewed the reports, but didn’t.',
    },
    right: {
      sentence: 'The manager reviewed almost every report.',
      mod: 'almost',
      meaning: 'The manager reviewed most of the reports, but not all.',
    },
  },

  // Screens 2-5 (deck p22-25): tap-to-choose what "almost" should modify.
  // Option order follows the deck (p22): The manager / Reviewed / Every report.
  almostQuiz: {
    sentence: 'The manager almost reviewed every report',
    mod: 'almost',
    question: 'What should "almost" modify?',
    options: ['The manager', 'Reviewed', 'Every report'],
    correct: 'Every report',
    feedback: {
      'The manager': '"Almost" doesn’t describe the manager. It should describe the action or the quantity, not the person.',
      'Reviewed': 'If almost modifies reviewed, it means the manager nearly reviewed the reports but didn’t. Is that the intended meaning?',
      'Every report': '"Almost" now describes every report. The sentence clearly means the manager reviewed most, but not all, of the reports.',
    },
    correctedSentence: 'The manager reviewed almost every report.',
  },

  // Screens 6-8 (deck p27-29): drag the modifier into the right position.
  // correctSlot is a gap index into the sentence with the modifier removed:
  //   ["She","served","sandwiches","to","the","children."]
  //    0     1        2            3    4     5           6
  // Slot 3 = "She served sandwiches [on paper plates] to the children."
  dragDemo: {
    sentence: 'She served sandwiches to the children on paper plates.',
    mod: 'on paper plates',
    correctSlot: 3,
    correctFeedback: '"On paper plates" describes sandwiches, not children. The sentence now clearly shows that the sandwiches are on paper plates.',
    wrongFeedback: 'Not quite! Ask yourself: Who or what is on paper plates? Move the modifier closer to the word it describes.',
  },

  // Screen 9 (deck p30): the practice bank, driving the same drag engine.
  // Each correctSlot is a gap index into the sentence with the modifier removed.
  // All eight were verified to reconstruct their `corrected` string exactly.
  practiceBank: [
    {
      sentence: 'He drove nearly for two hours.',
      mod: 'nearly',
      correctSlot: 3,
      corrected: 'He drove for nearly two hours.',
      feedback: '"Nearly" describes two hours — the length of the drive, not the act of driving.',
    },
    {
      sentence: 'She only discussed the proposal with the client.',
      mod: 'only',
      correctSlot: 2,
      corrected: 'She discussed only the proposal with the client.',
      feedback: '"Only" now limits the proposal — that was the one thing she discussed.',
    },
    {
      sentence: 'The scientist almost published every paper.',
      mod: 'almost',
      correctSlot: 3,
      corrected: 'The scientist published almost every paper.',
      feedback: '"Almost" now describes every paper — most were published, but not all.',
    },
    {
      sentence: 'The committee almost approved every recommendation.',
      mod: 'almost',
      correctSlot: 3,
      corrected: 'The committee approved almost every recommendation.',
      feedback: '"Almost" now describes every recommendation — most were approved, but not all.',
    },
    {
      sentence: 'The editor only revised the first chapter yesterday.',
      mod: 'only',
      correctSlot: 3,
      corrected: 'The editor revised only the first chapter yesterday.',
      feedback: '"Only" now limits the first chapter — that was the one thing revised.',
    },
    {
      sentence: 'The researcher nearly collected all the samples.',
      mod: 'nearly',
      correctSlot: 3,
      corrected: 'The researcher collected nearly all the samples.',
      feedback: '"Nearly" now describes all the samples — most were collected, but not every one.',
    },
    {
      sentence: 'The company almost hired every qualified candidate.',
      mod: 'almost',
      correctSlot: 3,
      corrected: 'The company hired almost every qualified candidate.',
      feedback: '"Almost" now describes every qualified candidate — most were hired, but not all.',
    },
    {
      sentence: 'The speaker only answered the audience’s questions after the presentation.',
      mod: 'only',
      correctSlot: 3,
      corrected: 'The speaker answered only the audience’s questions after the presentation.',
      feedback: '"Only" now limits the audience’s questions — those were the only ones answered.',
    },
  ],

  // Deck p30 note: "After second question, when you display the third question,
  // enable the next button, so that if the user is not interested to solve all
  // the question, user can move to next topic."
  questionsBeforeSkip: 3,

  // Deck p30, verbatim — the generic hint for any incorrect placement.
  practiceWrongFeedback: 'Not quite! The modifier is still describing the wrong word. Place it next to the word it is meant to describe.',
};

const appData = {
  en: {
    'standard-ui': {
      buttons: {
        next: 'Continue',
        continue: 'Continue',
      },
    },
    'content-ui': {
      title: 'Misplaced Modifier',
      screens: {
        1: {
          title: 'Misplaced Modifier',
          definition: 'A misplaced modifier is a modifier that is placed in the wrong position. It describes the wrong word, making the sentence confusing or changing its intended meaning.',
          meaningLabel: 'Meaning:',
        },
        2: {
          title: 'Misplaced Modifier',
          instruction: 'Read the sentence and choose the correct answer.',
        },
        6: {
          title: 'Misplaced Modifier',
          instruction: 'Drag the highlighted modifier to the correct position in the sentence.',
        },
      },
    },
  },
};

window.appData = appData;
