;(function () {
  // KaTeX-backed square-root / math rendering helpers.
  // Same API as the BYJU'S applet utils (window.renderSqrt / window.renderMathExpression) so the
  // pattern is familiar across applets. Falls back to a Unicode "√n" span if KaTeX isn't loaded.

  /**
   * Render a square-root expression with KaTeX (proper radical + vinculum bar).
   * @param {string|number} expression - radicand, e.g. 29, "2² + 5²", "4 × 4"
   * @param {string} fontSize - CSS font-size for the rendered span
   * @returns {string} HTML string
   */
  function renderSqrt(expression, fontSize) {
    fontSize = fontSize || '1em';
    if (typeof katex !== 'undefined') {
      try {
        var cleanExpr = String(expression)
          .replace(/×|×/g, '\\times')
          .replace(/²|²/g, '^2');
        var latexExpression = '\\sqrt{' + cleanExpr + '}';
        var html = katex.renderToString(latexExpression, { displayMode: false, throwOnError: false });
        return '<span class="sqrt-wrapper" style="font-size: ' + fontSize + ';">' + html + '</span>';
      } catch (error) {
        return '<span style="font-size: ' + fontSize + ';">√' + expression + '</span>';
      }
    }
    return '<span style="font-size: ' + fontSize + ';">√' + expression + '</span>';
  }

  /**
   * Render a mixed expression that may contain √n, ², ×, ÷ (e.g. a feedback line "= √29 units").
   * @param {string} expression
   * @param {string} fontSize
   * @returns {string} HTML string
   */
  // Pull out the radicand after a "√": either a run of digits (√29) or a balanced-parenthesis
  // group (√((x₂ − x₁)² + (y₂ − y₁)²)) — a plain regex can't match balanced parens, so this
  // walks the string counting depth to find the matching close-paren.
  function extractSqrtGroups(s){
    var out = '', i = 0;
    while (i < s.length) {
      if (s[i] === '√' && s[i + 1] === '(') {
        var depth = 0, j = i + 1;
        for (; j < s.length; j++) {
          if (s[j] === '(') depth++;
          else if (s[j] === ')') { depth--; if (depth === 0) { j++; break; } }
        }
        out += '\\sqrt{' + s.slice(i + 2, j - 1) + '}';
        i = j;
      } else if (s[i] === '√' && /\d/.test(s[i + 1] || '')) {
        var k = i + 1;
        while (k < s.length && /\d/.test(s[k])) k++;
        out += '\\sqrt{' + s.slice(i + 1, k) + '}';
        i = k;
      } else {
        out += s[i]; i++;
      }
    }
    return out;
  }

  function renderMathExpression(expression, fontSize) {
    fontSize = fontSize || '1em';
    if (typeof katex !== 'undefined') {
      try {
        var latexExpression = extractSqrtGroups(String(expression))
          .replace(/×|×/g, '\\times')
          .replace(/²|²/g, '^2')
          .replace(/÷/g, '\\div')
          // plain trailing words (e.g. "units") are wrapped in \text{} with an explicit math-mode
          // space before them — raw spaces/letters in LaTeX math mode are otherwise collapsed and
          // italicized, which is why "√29 units" was rendering as squashed-together "√29units".
          .replace(/\s+units\b/g, '\\ \\text{units}');
        var html = katex.renderToString(latexExpression, { displayMode: false, throwOnError: false });
        return '<span style="font-size: ' + fontSize + ';">' + html + '</span>';
      } catch (error) {
        return '<span style="font-size: ' + fontSize + ';">' + expression + '</span>';
      }
    }
    return '<span style="font-size: ' + fontSize + ';">' + expression + '</span>';
  }

  window.renderSqrt = renderSqrt;
  window.renderMathExpression = renderMathExpression;
})();
