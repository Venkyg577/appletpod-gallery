// Place-value alignment and comparison for decimals (T, O, t, h, th)

(function () {
  const PLACES = ['tens', 'ones', 'tenths', 'hundredths', 'thousandths'];

  function normalizeInput(s) {
    const t = String(s == null ? '' : s).trim();
    if (!t || !/^-?\d*\.?\d*$/.test(t.replace('-', ''))) return null;
    const neg = t.startsWith('-');
    const u = neg ? t.slice(1) : t;
    const parts = u.split('.');
    const intPart = parts[0] === '' ? '0' : parts[0] || '0';
    const fracPart = parts[1] != null ? parts[1] : '';
    return { neg, intPart, fracPart };
  }

  function getSlots(raw) {
    const n = normalizeInput(raw);
    if (!n) {
      return {
        tens: '',
        ones: '0',
        tenths: '0',
        hundredths: '0',
        thousandths: '0',
        display: ['', '0', '0', '0', '0'],
      };
    }
    const ip = n.intPart.replace(/^0+(\d)/, '$1');
    const safeInt = ip === '' ? '0' : ip;
    let tens;
    let ones;
    if (safeInt.length >= 2) {
      tens = safeInt[safeInt.length - 2];
      ones = safeInt[safeInt.length - 1];
    } else {
      tens = '';
      ones = safeInt[safeInt.length - 1] || '0';
    }
    const fp = (n.fracPart + '000').slice(0, 3);
    const tenths = fp[0] || '0';
    const hundredths = fp[1] || '0';
    const thousandths = fp[2] || '0';
    return {
      tens,
      ones,
      tenths,
      hundredths,
      thousandths,
      display: [tens, ones, tenths, hundredths, thousandths],
      neg: n.neg,
    };
  }

  function digitVal(ch) {
    if (ch === '' || ch == null) return 0;
    const d = parseInt(ch, 10);
    return Number.isNaN(d) ? 0 : d;
  }

  function numericValue(s) {
    const n = parseFloat(String(s).trim());
    return Number.isFinite(n) ? n : NaN;
  }

  function compareNumbers(a, b) {
    const va = numericValue(a);
    const vb = numericValue(b);
    if (!Number.isFinite(va) || !Number.isFinite(vb)) return 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
    return 0;
  }

  function comparisonOperator(a, b) {
    const c = compareNumbers(a, b);
    if (c === 0) return '=';
    return c > 0 ? '>' : '<';
  }

  /**
   * First place (0=tens .. 4=thousandths) where aligned digits differ.
   * Uses 0 for missing tens. Returns null if numerically equal.
   */
  function firstDifferingPlace(a, b) {
    if (compareNumbers(a, b) === 0) return null;
    const sa = getSlots(a);
    const sb = getSlots(b);
    for (let i = 0; i < PLACES.length; i++) {
      const k = ['tens', 'ones', 'tenths', 'hundredths', 'thousandths'][i];
      const d1 = k === 'tens' ? digitVal(sa[k]) : digitVal(sa[k]);
      const d2 = k === 'tens' ? digitVal(sb[k]) : digitVal(sb[k]);
      if (d1 !== d2) {
        return {
          placeIndex: i,
          placeKey: PLACES[i],
          digitA: sa[k],
          digitB: sb[k],
          valueA: d1,
          valueB: d2,
        };
      }
    }
    return null;
  }

  /**
   * Grid column index: 0=T, 1=O, 2=dot, 3=t, 4=h, 5=th
   */
  function placeIndexToGridColumn(placeIndex) {
    if (placeIndex <= 1) return placeIndex;
    return placeIndex + 1;
  }

  const PLACE_KEYS = ['tens', 'ones', 'tenths', 'hundredths', 'thousandths'];

  function digitsAtPlaceIndex(a, b, placeIndex) {
    const sa = getSlots(a);
    const sb = getSlots(b);
    const k = PLACE_KEYS[placeIndex];
    if (!k) return { digitA: '', digitB: '', valueA: 0, valueB: 0 };
    const chA = sa[k];
    const chB = sb[k];
    return {
      digitA: chA,
      digitB: chB,
      valueA: digitVal(chA),
      valueB: digitVal(chB),
    };
  }

  function expectedOperatorForDigits(valueA, valueB) {
    if (valueA < valueB) return '<';
    if (valueA > valueB) return '>';
    return '=';
  }

  /**
   * Steps from left to first differing place (inclusive). Each step { placeIndex, valueA, valueB, digitA, digitB }.
   * Empty if numbers are numerically equal.
   */
  function comparisonStepsUntilDiff(a, b) {
    const diff = firstDifferingPlace(a, b);
    if (!diff) return [];
    const steps = [];
    let startPlaceIndex = 0;
    for (let pi = 0; pi <= diff.placeIndex; pi++) {
      const atPlace = digitsAtPlaceIndex(a, b, pi);
      if (!(atPlace.digitA === '' && atPlace.digitB === '')) {
        startPlaceIndex = pi;
        break;
      }
    }
    for (let pi = startPlaceIndex; pi <= diff.placeIndex; pi++) {
      steps.push(Object.assign({ placeIndex: pi }, digitsAtPlaceIndex(a, b, pi)));
    }
    return steps;
  }

  window.DecimalPlaceValue = {
    PLACES,
    getSlots,
    compareNumbers,
    comparisonOperator,
    firstDifferingPlace,
    placeIndexToGridColumn,
    numericValue,
    digitsAtPlaceIndex,
    expectedOperatorForDigits,
    comparisonStepsUntilDiff,
  };
})();
