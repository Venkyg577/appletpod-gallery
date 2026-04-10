/* global window */
window.PROBLEM_SET = [
  { a: '25.678', b: '32.789' },
  { a: '82.905', b: '83.999' },
  { a: '8.345', b: '8.349' },
  { a: '19.56', b: '19.52' },
  { a: '64.305', b: '64.209' },
  { a: '7.891', b: '7.631' },
  { a: '75.536', b: '96.745' },
  { a: '8.256', b: '8.279', extended_only: true },
  { a: '9.12', b: '8.99' },
  { a: '27.4', b: '27.8' },
  { a: '4.056', b: '4.067' },
  { a: '5.230', b: '5.23' },
  { a: '0.45', b: '0.405' },
  { a: '3.4', b: '3.40' },
  { a: '2.305', b: '2.35' },
  { a: '68.345', b: '39.836' },
];

const appData = {
  en: {
    'standard-ui': {
      buttons: {
        next: 'Next',
        compare: 'Compare',
        start_practice: 'Practice',
        try_again: 'Try Again',
        finish: 'Finish',
        continue: 'Continue',
      },
      instructions: {
        scroll_to_choose: 'Scroll to choose',
        tap_next: 'Tap Next to continue.',
      },
    },
    'content-ui': {
      instructions: {
        intro_title: "Let's compare these decimal numbers.",
        intro_hint: 'We compare decimals using place values.',
        tap_to_begin: 'Tap to begin',
        align_decimals: 'Write the numbers so the decimal points are one below the other.',
        compare_from_left: 'Start comparing from the leftmost digit.',
        practice_header: 'Try comparing these decimal numbers.',
        drag_first: 'Drag the first number into the top row of the chart.',
        drag_second: 'Drag the second number into the bottom row.',
        extended_try_comparing: 'Try comparing these decimal numbers.',
      },
      feedback: {
        rule_greater_first_diff: 'The number with the greater first different digit is larger.',
        rule_greater_first_diff_alt: 'The first different digit decides the greater number.',
        rule_first_diff_decides: 'The first different digit decides which number is greater.',
        rule_equal_next_place: 'If digits are equal, move to the next place and compare.',
        rule_keep_comparing: 'Keep comparing until the digits are different.',
        equal_numbers: 'These numbers are equal.',
      },
      summary: {
        title: 'Summary:',
        subtitle: 'Steps to compare decimals:',
        align_decimals: 'Align the decimal points.',
        step_compare: 'Compare digits from the leftmost place.',
        step_first_diff: 'The first different digit tells which number is greater.',
      },
      extended: {
        row_a: '8 2 6 0 5',
        row_b: '8 2 7 9 9',
      },
      place_labels: {
        tens: 'T',
        ones: 'O',
        tenths: 't',
        hundredths: 'h',
        thousandths: 'th',
      },
    },
  },
};

window.appData = appData;
