// Pure lesson logic for the Misplaced Modifier applet. No DOM, no rendering.
// Mirrors the domain-helper convention used by Applet 1's modifierLesson.js.

(function () {
  function normalize(text) {
    return String(text || '').trim().replace(/\s+/g, ' ');
  }

  function stripPunctuation(word) {
    return String(word || '').replace(/[.,!?;:]+$/g, '');
  }

  // Split a sentence into tokens, each keeping its index.
  function tokenize(sentence) {
    return normalize(sentence)
      .split(' ')
      .map(function (word, index) {
        return { index: index, word: word, bare: stripPunctuation(word).toLowerCase() };
      });
  }

  // Locate a (possibly multi-word) modifier inside a sentence.
  // Returns { start, end } inclusive token indices, or null when absent.
  function locateModifier(sentence, modifierText) {
    const tokens = tokenize(sentence);
    const target = normalize(modifierText)
      .split(' ')
      .filter(Boolean)
      .map(function (w) { return stripPunctuation(w).toLowerCase(); });
    if (!target.length) return null;

    for (let i = 0; i + target.length <= tokens.length; i += 1) {
      let matched = true;
      for (let j = 0; j < target.length; j += 1) {
        if (tokens[i + j].bare !== target[j]) { matched = false; break; }
      }
      if (matched) return { start: i, end: i + target.length - 1 };
    }
    return null;
  }

  // The sentence with the modifier taken out, as a token-word array.
  // Trailing punctuation stays attached to whichever word ends the sentence,
  // so re-inserting the modifier mid-sentence never strands a full stop.
  function removeModifier(sentence, modifierText) {
    const tokens = tokenize(sentence);
    const span = locateModifier(sentence, modifierText);
    if (!span) return tokens.map(function (t) { return t.word; });

    const kept = [];
    tokens.forEach(function (t, i) {
      if (i < span.start || i > span.end) kept.push(t.word);
    });

    // If the modifier sat at the very end it carried the full stop with it —
    // give the punctuation back to the new final word.
    const removedLast = span.end === tokens.length - 1;
    if (removedLast && kept.length) {
      const tail = tokens[span.end].word;
      const punct = (tail.match(/[.,!?;:]+$/) || [''])[0];
      if (punct && !/[.,!?;:]$/.test(kept[kept.length - 1])) {
        kept[kept.length - 1] += punct;
      }
    }
    return kept;
  }

  // Re-insert the modifier at `slot` (gap index: 0 = before word 0).
  // Returns the assembled sentence string.
  function insertAt(baseWords, modifierText, slot) {
    const mod = normalize(modifierText);
    const words = baseWords.slice();
    const at = Math.max(0, Math.min(slot, words.length));

    // Moving the modifier past the final word must not push it after the
    // full stop — strip the punctuation, insert, then re-attach it.
    let punct = '';
    if (at === words.length && words.length) {
      const last = words[words.length - 1];
      const m = last.match(/[.,!?;:]+$/);
      if (m) {
        punct = m[0];
        words[words.length - 1] = last.slice(0, -punct.length);
      }
    }

    words.splice(at, 0, mod);

    // Sentence case: whichever word now starts the sentence is capitalised,
    // and a word that has stopped being first drops back to lower case (only
    // when safe — proper nouns are never demoted). Without this, moving the
    // modifier to the front reads "nearly He drove for two hours."
    if (words.length) {
      words[0] = capitalizeFirst(words[0]);
      for (let i = 1; i < words.length; i += 1) {
        words[i] = decapitalizeFirst(words[i]);
      }
    }

    let out = words.join(' ');
    if (punct) out += punct;
    return normalize(out);
  }

  function isCorrectSlot(question, slot) {
    return slot === question.correctSlot;
  }

  // ---- sentence-case helpers ----
  //
  // Whichever word starts the sentence must be capitalised, and a word that
  // stops being first must drop back to lower case — otherwise moving a
  // modifier to the front produces "nearly He drove..." or leaves a stranded
  // capital mid-sentence ("Sarah Only approved...").
  //
  // Proper nouns and "I" must never be lowercased, so a word is only demoted
  // when its lower-case form is a known safe word. Anything unrecognised is
  // left exactly as authored — better to under-correct than to write "sarah".

  // Words that are only ever capitalised because they begin a sentence.
  const SENTENCE_START_WORDS = new Set([
    'the', 'a', 'an', 'she', 'he', 'they', 'it', 'we', 'you',
    'his', 'her', 'their', 'its', 'our', 'your', 'my',
    'this', 'that', 'these', 'those',
    'only', 'almost', 'nearly', 'just', 'even', 'often', 'always',
    'on', 'in', 'at', 'to', 'for', 'with', 'by', 'from',
    'driving', 'wearing', 'sitting', 'running', 'walking',
  ]);

  function capitalizeFirst(text) {
    const s = String(text || '');
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Lower-case a word only when it is safe to do so (not a proper noun / "I").
  function decapitalizeFirst(text) {
    const s = String(text || '');
    if (!s) return s;
    const bare = stripPunctuation(s).toLowerCase();
    if (!SENTENCE_START_WORDS.has(bare)) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  // Apply sentence case across an ordered list of display segments.
  // `segments` is [{ text, isModifier }, ...] in render order; returns a new
  // array with the first segment capitalised and every later one de-capitalised
  // where safe. Used by both the chip and the plain words so they stay in sync.
  function applySentenceCase(segments) {
    return segments.map(function (seg, i) {
      const text = i === 0 ? capitalizeFirst(seg.text) : decapitalizeFirst(seg.text);
      return Object.assign({}, seg, { text: text });
    });
  }

  // Which gap between words is nearest to a drop point?
  // Gap i sits before word i. Boundaries are read live from the DOM, so this
  // stays correct as words reflow. Generalised from Applet 1's nearestOnlySlot
  // so the demo sentence and the practice bank share one implementation.
  function nearestGap(clientX, wordCount, idPrefix) {
    const boundaries = [];
    for (let i = 0; i < wordCount; i += 1) {
      const el = document.getElementById(idPrefix + i);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      boundaries.push({ slot: i, x: r.left });
      if (i === wordCount - 1) boundaries.push({ slot: i + 1, x: r.right });
    }
    if (!boundaries.length) return -1;

    let best = boundaries[0];
    boundaries.forEach(function (b) {
      if (Math.abs(clientX - b.x) < Math.abs(clientX - best.x)) best = b;
    });
    return best.slot;
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

  window.misplacedLesson = {
    tokenize: tokenize,
    locateModifier: locateModifier,
    removeModifier: removeModifier,
    insertAt: insertAt,
    isCorrectSlot: isCorrectSlot,
    nearestGap: nearestGap,
    capitalizeFirst: capitalizeFirst,
    decapitalizeFirst: decapitalizeFirst,
    applySentenceCase: applySentenceCase,
    pointInRect: pointInRect,
    screenToLocal: screenToLocal,
  };
})();
