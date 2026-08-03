// Pure lesson logic for the Modifiers applet. No DOM, no rendering.
// Mirrors the domain-helper convention used by lightScene.js / fractionLesson.js.

(function () {
  // Finite-verb markers used by the Blueprint's phrase-vs-clause test
  // (Part 1, p.1.3: a clause has a subject and predicate having a finite verb).
  const FINITE_VERBS = new Set([
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'has', 'have', 'had', 'do', 'does', 'did',
    'knew', 'won', 'impressed', 'answered', 'parked', 'belongs', 'ate', 'spoke',
    'collapsed', 'waved', 'smiled', 'received', 'proofread', 'approved',
  ]);

  // Relative pronouns that introduce an adjectival clause.
  const RELATIVE_MARKERS = new Set(['who', 'whose', 'whom', 'which', 'that']);

  function normalize(text) {
    return String(text || '').trim().replace(/\s+/g, ' ');
  }

  function stripPunctuation(word) {
    return String(word || '').replace(/[.,!?;:]+$/g, '');
  }

  // Split a sentence into tappable tokens. Each token keeps its index so the
  // caller can map a tap back to a position without re-splitting.
  function tokenize(sentence) {
    return normalize(sentence)
      .split(' ')
      .map(function (word, index) {
        return { index: index, word: word, bare: stripPunctuation(word).toLowerCase() };
      });
  }

  // Classify a modifier as word | phrase | clause using the Blueprint test.
  function classify(modifierText) {
    const words = normalize(modifierText).split(' ').filter(Boolean);
    if (words.length <= 1) return 'word';

    const bare = words.map(function (w) { return stripPunctuation(w).toLowerCase(); });
    const hasRelative = bare.some(function (w) { return RELATIVE_MARKERS.has(w); });
    const hasFiniteVerb = bare.some(function (w) { return FINITE_VERBS.has(w); });

    // "as if he knew everything" has no relative marker but does have a subject
    // (he) plus a finite verb (knew) — still a clause.
    if (hasFiniteVerb && (hasRelative || bare.length > 2)) return 'clause';
    if (hasRelative && hasFiniteVerb) return 'clause';
    return 'phrase';
  }

  // Find where a multi-word modifier starts within a tokenized sentence.
  // Returns { start, end } inclusive token indices, or null when absent.
  function locateModifier(sentence, modifierText) {
    const tokens = tokenize(sentence);
    const modWords = normalize(modifierText).split(' ').filter(Boolean);
    if (!modWords.length) return null;

    const target = modWords.map(function (w) { return stripPunctuation(w).toLowerCase(); });

    for (let i = 0; i + target.length <= tokens.length; i += 1) {
      let matched = true;
      for (let j = 0; j < target.length; j += 1) {
        if (tokens[i + j].bare !== target[j]) { matched = false; break; }
      }
      if (matched) return { start: i, end: i + target.length - 1 };
    }
    return null;
  }

  // True when a tapped token index falls inside the sentence's modifier span.
  function isModifierToken(sentence, modifierText, tokenIndex) {
    const span = locateModifier(sentence, modifierText);
    if (!span) return false;
    return tokenIndex >= span.start && tokenIndex <= span.end;
  }

  // Screens 17-21: assemble the sentence from whichever cards are selected.
  // Pre-head modifiers sit before the head noun, post-head ones after it,
  // each group kept in its configured order.
  function buildSentence(base, cards, selectedIds) {
    const chosen = cards.filter(function (c) { return selectedIds.indexOf(c.id) !== -1; });
    const byOrder = function (a, b) { return a.order - b.order; };

    const pre = chosen.filter(function (c) { return c.position === 'pre'; }).sort(byOrder);
    const post = chosen.filter(function (c) { return c.position === 'post'; }).sort(byOrder);

    return {
      lead: base.lead,
      pre: pre.map(function (c) { return c.label; }),
      head: base.head,
      post: post.map(function (c) { return c.label; }),
      tail: base.tail,
    };
  }

  // Plain-text form of the assembled sentence, used for checks and narration.
  function sentenceToText(parts) {
    const segments = [parts.lead.trim()]
      .concat(parts.pre)
      .concat([parts.head])
      .concat(parts.post)
      .filter(Boolean);
    return segments.join(' ') + parts.tail.replace(/^\s+/, ' ');
  }

  function feedbackFor(type) {
    const f = window.appData.en['content-ui'].feedback;
    return { text: f[type], hint: f[type + 'Hint'] };
  }

  // ---- sentence-case helpers ----
  //
  // Whichever word starts the sentence must be capitalised, and a word that
  // stops being first must drop back to lower case — otherwise moving "only"
  // to the front reads "only Sarah approved..." and leaving it mid-sentence
  // reads "Sarah Only approved...".
  //
  // Proper nouns and "I" must never be lowercased, so a word is only demoted
  // when its lower-case form is a known safe word. Anything unrecognised is
  // left exactly as authored — better to under-correct than to write "sarah".
  const SENTENCE_START_WORDS = new Set([
    'the', 'a', 'an', 'she', 'he', 'they', 'it', 'we', 'you',
    'his', 'her', 'their', 'its', 'our', 'your', 'my',
    'this', 'that', 'these', 'those',
    'only', 'almost', 'nearly', 'just', 'even', 'often', 'always',
    'on', 'in', 'at', 'to', 'for', 'with', 'by', 'from',
  ]);

  function capitalizeFirst(text) {
    const s = String(text || '');
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function decapitalizeFirst(text) {
    const s = String(text || '');
    if (!s) return s;
    const bare = stripPunctuation(s).toLowerCase();
    if (!SENTENCE_START_WORDS.has(bare)) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  // Apply sentence case across an ordered list of display segments.
  // `segments` is [{ text, ... }, ...] in render order; returns a new array
  // with the first capitalised and every later one de-capitalised where safe.
  function applySentenceCase(segments) {
    return segments.map(function (seg, i) {
      const text = i === 0 ? capitalizeFirst(seg.text) : decapitalizeFirst(seg.text);
      return Object.assign({}, seg, { text: text });
    });
  }

  function pointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  // Convert a pointer/touch clientX/Y into the 1920x1080 local coordinate space,
  // accounting for --scaleFactor and the wrapper's on-screen position.
  function screenToLocal(clientX, clientY, wrapperEl) {
    const rect = wrapperEl.getBoundingClientRect();
    const scale = rect.width / 1920;
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  }

  window.modifierLesson = {
    tokenize: tokenize,
    classify: classify,
    locateModifier: locateModifier,
    isModifierToken: isModifierToken,
    buildSentence: buildSentence,
    sentenceToText: sentenceToText,
    feedbackFor: feedbackFor,
    capitalizeFirst: capitalizeFirst,
    decapitalizeFirst: decapitalizeFirst,
    applySentenceCase: applySentenceCase,
    pointInRect: pointInRect,
    screenToLocal: screenToLocal,
  };
})();
