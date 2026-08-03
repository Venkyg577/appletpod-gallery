// Modifiers applet — configuration + copy.
// All learner-visible strings are verbatim from DOC/Modifiers.pdf (pages 1-21).
// Pink italic text in the source slides is developer notes and is NOT copy.

window.MODIFIER_CONFIG = {
  // Screens 1-3: the "only" chip moves between three slots.
  // slot index refers to a gap in the token list ['Sarah', 'approved', 'the proposal.']
  onlyPositions: [
    {
      slot: 1,
      before: ['Sarah'],
      after: ['approved the proposal.'],
      tip: "Sarah approved it, but she didn't review, edit, or present it.",
    },
    {
      slot: 0,
      before: [],
      after: ['Sarah approved the proposal.'],
      tip: 'No one except Sarah approved the proposal.',
    },
    {
      slot: 2,
      before: ['Sarah approved'],
      after: ['the proposal.'],
      tip: 'She approved the proposal, but not the budget or timeline.',
    },
  ],

  // Screens 6-8: one worked example per modifier type.
  typeExamples: [
    {
      type: 'word',
      screen: 6,
      before: 'The ',
      mod: 'happy',
      after: ' child smiled.',
      tells: 'Modifier tells What kind of child?',
    },
    {
      type: 'phrase',
      screen: 7,
      before: 'The man ',
      mod: 'wearing a blue hat',
      after: ' is my uncle.',
      tells: 'Modifier tells Which man?',
    },
    {
      type: 'clause',
      screen: 8,
      before: 'He spoke ',
      mod: 'as if he knew everything.',
      after: '',
      tells: 'Modifier tells How?',
    },
  ],

  // Screens 10-16: the tap-then-drag question engine.
  // Item 1 is the worked example from the slides; items 2-10 are the slide-16 bank.
  // Types are Blueprint-verified (Part 1, p.1.3): a clause has its own subject +
  // finite verb; a phrase has no finite verb; a single token is a word.
  questionBank: [
    { sentence: 'The old bridge collapsed.', mod: 'old', type: 'word' },
    { sentence: 'The boy sitting near the window waved.', mod: 'sitting near the window', type: 'phrase' },
    { sentence: 'The car that was parked outside belongs to me.', mod: 'that was parked outside', type: 'clause' },
    { sentence: 'She answered confidently.', mod: 'confidently', type: 'word' },
    { sentence: 'The books on the top shelf are expensive.', mod: 'on the top shelf', type: 'phrase' },
    { sentence: 'The student whose project won first prize smiled.', mod: 'whose project won first prize', type: 'clause' },
    { sentence: 'The proposal that impressed the committee was approved.', mod: 'that impressed the committee', type: 'clause' },
    { sentence: 'The candidate who answered every question confidently received the highest score.', mod: 'who answered every question confidently', type: 'clause' },
    { sentence: 'The student carefully proofread her draft.', mod: 'carefully', type: 'word' },
    { sentence: 'She ate a vegetarian burger.', mod: 'vegetarian', type: 'word' },
  ],

  // Next unlocks once this many questions have been shown (slide-16 dev note:
  // "After second question, when you display the third question, enable the next button").
  questionsBeforeSkip: 3,

  // Screens 17-21: progressive sentence building.
  buildBase: { head: 'laptop', lead: 'The ', tail: ' is available.' },
  buildCards: [
    { id: 'lightweight', label: 'lightweight', position: 'pre', order: 1 },
    { id: 'gaming', label: 'gaming', position: 'pre', order: 2 },
    { id: 'rgb', label: 'with RGB keyboard', position: 'post', order: 1 },
    { id: 'pro', label: 'designed for professionals', position: 'post', order: 2 },
  ],
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
      title: 'Modifiers',
      screens: {
        1: {
          title: 'Can one word change the meaning of an entire sentence?',
          instruction: 'Drag only to different positions.',
        },
        4: {
          title: 'Same sentence, Same words, Different meaning.',
          panel: 'The word "only" was giving extra information about different parts of the sentence.',
          panelName: 'Words like this have a name called MODIFIERS',
        },
        5: {
          title: 'Modifiers',
          instruction: 'A modifier adds extra information about another word and can take three forms:',
          options: ['1. A Word', '2. A Phrase', '3.A Clause'],
          describingLabel: 'Describing:',
          describing: '• Which one? • What kind? • Whose? • How many? • How? • When? • Where? • To what extent?',
        },
        6: { instruction: 'Modifiers can be three things:' },
        9: {
          title: 'Modifiers',
          definition: 'A modifier is a word, phrase, or clause that gives more information about another word.',
          cards: [
            { label: 'Word', text: 'A single describing word.' },
            { label: 'Phrase', text: 'A group of words without its own subject and finite verb.' },
            { label: 'Clause', text: 'A group of words with its own subject and verb.' },
          ],
        },
        10: {
          title: 'Modifiers',
          instruction: 'Tap to identify the modifier and drag it correct modifier type.',
          targets: ['Word', 'Phrase', 'Clause'],
        },
        17: {
          title: 'Build & Connect the Modifier',
          instruction: 'Tap each modifier cards and notice how the information modify the sentence.',
        },
      },
      feedback: {
        // Verbatim from the slides.
        wrongTap: 'Every extra piece of information is a modifier.',
        word: 'A single describing word.',
        phrase: 'A group of words without its own subject and finite verb.',
        clause: 'A group of words with its own subject and verb.',
        // Blueprint Part 1, p.1.3 — the finite-verb test, appended so the
        // Word/Phrase/Clause distinction is teachable rather than asserted.
        wordHint: 'One word on its own — no group, no verb.',
        phraseHint: 'No subject doing anything, so it stays a phrase.',
        clauseHint: 'Look for a subject doing something — that finite verb is the giveaway.',
      },
    },
  },
};

window.appData = appData;
