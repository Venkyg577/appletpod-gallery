// Pure helpers for equivalent-fractions lesson

window.FractionLesson = {
  /** @param {2|4|6} parts */
  requiredSelections: function (parts) {
    return parts / 2;
  },

  /** @param {0|1|2} lessonIndex */
  config: function (lessonIndex) {
    const rows = [
      {
        activeCol: 0,
        expectedParts: 2,
        divideHeader: 'content-ui.instructions.divide_two',
        selectHeader: 'content-ui.instructions.select_one_of_two',
        fractionShownHeader: 'content-ui.instructions.this_is_half',
        prepNextHeader: 'content-ui.instructions.divide_second_four',
        fracTextKey: 'content-ui.fractions.half',
        numerator: 1,
        denominator: 2,
      },
      {
        activeCol: 1,
        expectedParts: 4,
        divideHeader: 'content-ui.instructions.divide_four',
        selectHeader: 'content-ui.instructions.select_two_of_four',
        fractionShownHeader: 'content-ui.instructions.both_same_value',
        prepNextHeader: 'content-ui.instructions.divide_third_six',
        fracTextKey: 'content-ui.fractions.quarters',
        numerator: 2,
        denominator: 4,
      },
      {
        activeCol: 2,
        expectedParts: 6,
        divideHeader: 'content-ui.instructions.divide_six',
        selectHeader: 'content-ui.instructions.select_three_of_six',
        fractionShownHeader: 'content-ui.instructions.equivalent_intro',
        prepNextHeader: null,
        fracTextKey: 'content-ui.fractions.sixths',
        numerator: 3,
        denominator: 6,
      },
    ];
    return rows[lessonIndex] || rows[0];
  },
};
