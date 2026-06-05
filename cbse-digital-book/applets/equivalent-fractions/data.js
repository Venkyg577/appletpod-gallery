/* Applet 2 – Equivalent Fractions  content data */
window.appData = {
  en: {
    'standard-ui': {
      buttons: {
        next: 'Next',
        prev: 'Prev',
        start: "Let's Start",
        restart: 'Start Again',
      },
      options: {
        yes: 'Yes',
        no: 'No',
        opt2: '2',
        opt3: '3',
        opt5: '5',
        frac_half: '1/2',
        frac_twofourths: '2/4',
        frac_onethird: '1/3',
        frac_onesixth: '1/6',
        frac_twosixths: '2/6',
        frac_threesixths: '3/6',
        sym_gt: '>',
        sym_eq: '=',
        sym_lt: '<',
      },
      labels: {
        tap_next: 'Tap » to continue.',
        tap_to_choose: 'Tap the correct answer.',
        tap_to_shade: 'Tap one part in each whole to shade it.',
        tap_dotted: 'Tap the dotted lines to split.',
        tap_whole: 'Tap a whole to select it.',
        choose_symbol: 'Tap the correct symbol.',
      },
    },
    'content-ui': {
      dialogs: {
        /* ── Screen 1 ── */
        s1_title: 'Equivalent Fractions',
        s1_line1: 'We know that <span class="w-orange">fractions</span> can be compared when the <span class="w-orange">wholes are the same size</span>.',
        s1_line2: 'But can <strong>two different-looking fractions</strong> show the <span class="w-orange">same amount of one whole</span>?',
        s1_line3: "Let's explore!",

        /* ── Screen 2 ── */
        s2_line1: 'Here are <span class="w-orange">two wholes</span> of the <strong>same size</strong>.',
        s2_line2: 'Tap Next to divide both wholes into equal parts.',

        /* ── Screen 3 ── */
        s3_line1: 'To show <span class="w-blue">1/2</span>, how many <span class="w-green">equal parts</span> should <span class="w-orange">each whole</span> be divided into?',
        s3_line2: 'Tap the correct answer.',
        s3_wrong: 'Not quite! Think about what the <strong>denominator</strong> of <span class="w-blue">1/2</span> tells us.',

        /* ── Screen 4 ── */
        s4_line1: 'Look at the <strong>denominator</strong> of <span class="w-blue">1/2</span>.',
        s4_line2: 'It tells the <strong>total number</strong> of <span class="w-green">equal parts</span>.',
        s4_line3: 'Tap the correct answer.',
        s4_wrong: 'The <strong>denominator</strong> is the number below the fraction bar. What is it for <span class="w-blue">1/2</span>?',

        /* ── Screen 5 ── */
        s5_line1: 'Both <span class="w-orange">wholes</span> are divided into <span class="w-green">2 equal parts</span>.',
        s5_line2: 'Now, shade <span class="w-blue">1/2</span> of <span class="w-orange">each whole</span>.',
        s5_hint: 'Tap to choose the color. Then tap one part in each whole.',
        s5_need_color: 'Choose a colour first!',
        s5_done_one: 'Good! Now shade a part in the other whole.',

        /* ── Screen 6 ── */
        s6_line1: 'So, both <span class="w-orange">wholes</span> show the <span class="w-blue">fraction 1/2</span>.',
        s6_line2: '',
        s6_line3: 'Tap Next to continue.',

        /* ── Screen 7 ── */
        s7_line1: 'The <span class="w-orange">wholes</span> are the <strong>same size</strong> and divided into <span class="w-green">equal parts</span>.',
        s7_line2: 'The <strong>same amount</strong> is <strong>shaded in both</strong>.',

        /* ── Screen 8 ── */
        s8_line1: 'What happens if we divide <span class="w-orange">one of the wholes</span> into <strong>smaller <span class="w-green">equal parts</span></strong>?',
        s8_line2: 'Tap Next to see what happens.',

        /* ── Screen 8b (divide one whole) ── */
        s8b_line1: "Let's divide one <span class=\"w-orange\">whole</span> into <span class=\"w-green\">smaller equal parts</span>.",
        s8b_line2: 'Tap either whole to choose it.',

        /* ── Screen 9 ── */
        s9_line1: 'Choose how many <span class="w-green">equal parts</span> to divide the <span class="w-orange">whole</span> into.',
        s9_line2: 'Tap 4 or 6 to divide the whole.',
        s9_need_whole: 'Tap a whole to select it first.',
        s9_tap_guides: 'Tap 4 or 6 to divide the whole.',

        /* ── Screen 10 ── */
        s10_line1: 'The <span class="w-orange">whole</span> has <span class="w-green">4 equal parts</span>.',
        s10_line2: 'Each half is split into <strong>2 smaller parts</strong>.',
        s10_line3: 'Tap Next to represent in fraction.',

        /* ── Screen 11 ── */
        s11_line1: 'Look at the divided <span class="w-orange">whole</span>.',
        s11_line2: 'Which <span class="w-blue">fraction</span> shows the shaded part?',
        s11_line3: 'Tap the correct answer.',
        s11_wrong: "Not quite! Count the <span class=\"w-pink\">shaded parts</span> and the total parts carefully.",

        /* ── Screen 12 ── */
        s12_line1: "Let's count again.",
        s12_line2: 'Count how many parts are <strong>shaded</strong>?',
        s12_line3: 'And how many <span class="w-green">equal parts</span> are there in all?',
        s12_line4: 'Tap the correct answer.',

        /* ── Screen 13 ── */
        s13_line1: 'The <strong>denominator 4</strong> tells us the whole has <span class="w-green">4 equal parts</span>.',
        s13_line2: 'The <strong>numerator 2</strong> tells us <span class="w-pink">2 parts</span> are shaded.',
        s13_line3: 'So, the <span class="w-blue">fraction</span> is <span class="w-blue">2/4</span>.',
        s13_line4: 'Tap Next to continue.',

        /* ── Screen 14 ── */
        s14_line1: 'Now the <span class="w-blue">fractions</span> look different.',
        s14_line2: '<span class="w-blue">2/4</span> has <span class="w-pink">2 shaded parts</span>, but <span class="w-blue">1/2</span> has only <span class="w-pink">1 shaded part</span>.',
        s14_line3: 'Is <span class="w-blue">2/4</span> greater than <span class="w-blue">1/2</span>?',
        s14_line4: 'Tap Next to know.',

        /* ── Screen 15 ── */
        s15_line1: 'We do not compare only the <strong>numbers</strong>.',
        s15_line2: 'We compare the <span class="w-pink">shaded amount</span> in <span class="w-orange">same-sized wholes</span>.',
        s15_line3: 'Tap the correct symbol.',
        s15_wrong: 'Look again — do the <span class="w-pink">shaded areas</span> cover the <strong>same amount</strong> of the whole?',
        s15_done_line1: 'The <span class="w-pink">shaded amounts</span> are equal.',

        /* ── Screen 16 ── */
        s16_line1: 'Look at the <span class="w-pink">shaded parts</span>.',
        s16_line2: 'Check if they cover the <strong>same amount</strong> of the <span class="w-orange">whole</span>?',

        /* ── Screen 17 ── */
        s17_line1: 'The <span class="w-pink">shaded parts</span> are equal in size.',
        s17_line2: 'Tap Next to continue.',

        /* ── Screen 18 ── */
        s18_line1: 'Even though the <span class="w-orange">wholes</span> are divided into <strong>different numbers of</strong> equal parts, the <span class="w-pink">shaded amount</span> <strong>did not change</strong>. Only the number of <span class="w-green">equal parts</span> changed.',
        s18_line2: '',
        s18_line3: 'Tap Next to continue.',

        /* ── Screen 19 ── */
        s19_line1: 'So the two different looking <span class="w-blue">fractions</span> 1/2 and 2/4 represent the <strong>same amount</strong> of <span class="w-orange">whole</span>, so the <span class="w-blue">fractions</span> are <strong>equal</strong>.',
        s19_line2: '',

        /* ── Screen 20 ── */
        s20_line1: 'The <span class="w-blue">fractions</span> 1/2 and 2/4 are called <span class="w-blue">equivalent fractions</span>.',

        /* ── Screen 21 ── */
        s21_line1: '<span class="w-blue">Fractions</span> that look different but show the same amount are called <span class="w-blue">equivalent fractions</span>.',
        s21_line2: 'Tap Next to summarize.',

        /* ── Screen 22 ── */
        s22_title: 'Equivalent Fractions',
        s22_line1: 'Are <span class="w-blue">1/3</span> and <span class="w-blue">2/6</span> <span class="w-orange">equivalent fractions</span>?',
        s22_line2: "Let's find out!",

        /* ── Screen 23 ── */
        s23_line1: 'This <span class="w-orange">whole</span> shows the <span class="w-blue">fraction 1/3</span>.',
        s23_line2: 'Tap Next to divide the whole further.',

        /* ── Screen 24 ── */
        s24_line1: 'Let us divide each <span class="w-blue">third</span> into <span class="w-green">2 smaller equal parts</span>.',
        s24_line2: 'Tap the dotted lines to split each third.',
        s24_tap_guides: 'Tap the dotted lines to split each third.',
        s24_done_line1: 'Now, the <span class="w-orange">whole</span> is divided into <span class="w-green">6 smaller equal parts</span>. What fraction is shaded now?',
        s24_done_hint: 'Tap the correct answer.',

        /* ── Screen 25 ── */
        s25_line1: 'What <span class="w-blue">fraction</span> is shaded now?',
        s25_line2: 'Tap the correct answer.',
        s25_wrong: 'Count carefully — how many parts are <span class="w-pink">shaded</span>, and how many parts total?',

        /* ── Screen 26 ── */
        s26_line1: "Let's count again.",
        s26_line2: 'Check how many parts are <span class="w-pink">shaded</span>?',
        s26_line3: 'And how many <span class="w-green">equal parts</span> are there in all?',

        /* ── Screen 27 ── */
        s27_line1: 'Yes! <span class="w-pink">2 out of 6</span> equal parts are shaded.',
        s27_line2: 'The fraction is <span class="w-blue">2/6</span>.',
        s27_denom: 'The <strong>denominator 6</strong> tells us the whole has <span class="w-green">6 equal parts</span>.',
        s27_numer: 'The <strong>numerator 2</strong> tells us <span class="w-pink">2 parts</span> are shaded.',

        /* ── Screen 28 ── */
        s28_line1: 'Do <span class="w-blue">1/3</span> and <span class="w-blue">2/6</span> show the <span class="w-pink">same amount</span>?',
        s28_line2: 'Tap the correct answer.',
        s28_wrong: 'Look at the <span class="w-pink">shaded parts</span> again. Even though the <span class="w-orange">whole</span> is divided into smaller equal parts, the <span class="w-pink">shaded amount</span> didn\'t change.',

        /* ── Screen 29 ── */
        s29_line1: 'Look at the <span class="w-pink">shaded parts</span> again.',
        s29_line2: 'Even though the <span class="w-orange">whole</span> is divided into smaller equal parts, the <span class="w-pink">shaded amount</span> didn\'t change.',

        /* ── Screen 30 ── */
        s30_line1: 'The parts became smaller, but the <span class="w-pink">shaded amount</span> did not change.',
        s30_line2: 'So the <span class="w-blue">fractions</span> show the <strong>same amount</strong>.',
        s30_equiv: '<span class="w-blue">Fractions 1/3</span> and <span class="w-blue">2/6</span> are also <span class="w-blue">equivalent fractions</span>.',
        s30_def: 'Equivalent fractions may look different, but they represent the same amount.',

        /* ── Screen 31 ── */
        s31_line1: '<span class="w-blue">Fractions 1/3</span> and <span class="w-blue">2/6</span> are also <span class="w-blue">equivalent fractions</span>.',

        /* ── Screen 32 ── */
        s32_line1: 'Equivalent fractions may <strong>look different</strong>, but they represent the <strong>same amount</strong>.',
        s32_line2: '<span class="w-orange">Fractions</span> that look different but show the <span class="w-orange">same amount of the whole</span> are called <span class="w-orange">equivalent fractions</span>.',

        /* ── Screen 33 ── */
        s33_line1: 'Now, can we generate <span class="w-orange">equivalent fractions</span>?',
        s33_line2: 'Tap Next to find out!',

        /* ── Screen 34 ── */
        s34_title: 'Comparing Fractions Visually',
        s34_line1: "That's an interesting question!",
        s34_line2: "You'll explore this in the next activity.",
        s34_line3: 'Want to try again?',
      },
    },
  },
};
