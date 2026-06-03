/* Shared UI components for the Fractions applet */

(function () {
  const h = window.createElement;

  function formatFractionsInHtml(rawHtml) {
    if (!rawHtml || typeof rawHtml !== 'string') return rawHtml;
    return rawHtml.replace(/(\d+)\s*\/\s*(\d+)/g, (_, num, den) =>
      `<span class="frac-inline"><span class="frac-num">${num}</span><span class="frac-den">${den}</span></span>`
    );
  }

  function revealHtml(rawHtml, visibleChars) {
    let out = '';
    let used = 0;
    for (let i = 0; i < rawHtml.length;) {
      const ch = rawHtml[i];
      if (ch === '<') {
        const end = rawHtml.indexOf('>', i);
        if (end === -1) break;
        out += rawHtml.slice(i, end + 1);
        i = end + 1;
        continue;
      }
      if (used >= visibleChars) break;
      if (ch === '&') {
        const end = rawHtml.indexOf(';', i);
        if (end !== -1) {
          out += rawHtml.slice(i, end + 1);
          i = end + 1;
          used += 1;
          continue;
        }
      }
      out += ch;
      i += 1;
      used += 1;
    }
    return out;
  }

  function visibleTextLength(rawHtml) {
    let count = 0;
    for (let i = 0; i < rawHtml.length;) {
      const ch = rawHtml[i];
      if (ch === '<') {
        const end = rawHtml.indexOf('>', i);
        if (end === -1) break;
        i = end + 1;
      } else if (ch === '&') {
        const end = rawHtml.indexOf(';', i);
        i = end === -1 ? i + 1 : end + 1;
        count += 1;
      } else {
        i += 1;
        count += 1;
      }
    }
    return count;
  }

  /* ---------- Character Panel ---------- */
  function CharacterPanel(props) {
    const { lines, character = 'boojho', typewriterChars = null } = props;
    const characterImage =
      character === 'paheli'
        ? 'assets/images/Paheli.png'
        : 'assets/images/boojho.png';
    const altText = character === 'paheli' ? 'Paheli' : 'Boojho';
    const hasLines = lines && lines.length > 0;

    return h(
      'div',
      { className: 'left-character-section' + (hasLines ? '' : ' left-character-section--no-bubble') },
      hasLines ? h(
        'div',
        { className: 'character-speech-bubble', key: 'bubble-' + lines.join('|') },
        h(
          'div',
          { className: 'speech-text interactive-text' },
          lines.map((t, idx) => {
            const formatted = formatFractionsInHtml(t);
            const prior = lines
              .slice(0, idx)
              .reduce((sum, line) => sum + visibleTextLength(formatFractionsInHtml(line)), 0);
            const lineChars = typewriterChars == null
              ? null
              : Math.max(0, typewriterChars - prior);
            return h('div', {
              className: 'speech-line',
              key: 'l' + idx,
              dangerouslySetInnerHTML: { __html: lineChars == null ? formatted : revealHtml(formatted, lineChars) },
            });
          })
        )
      ) : null,
      h(
        'div',
        { className: 'character-display' },
        h('img', {
          src: characterImage,
          alt: altText,
          className: 'character-image',
          draggable: false,
        })
      )
    );
  }

  /* ---------- Footer Nav ---------- */
  function FooterNav(props) {
    const {
      centerText = '',
      onPrev,
      onNext,
      canPrev,
      canNext,
      glowNext = true,
    } = props;

    const prevClasses =
      'nav-btn prev-btn action-button ' + (canPrev ? 'enabled' : 'disabled');

    const nextClasses =
      'nav-btn next-btn action-button ' +
      (canNext ? 'enabled' : 'disabled') +
      (canNext && glowNext ? ' glow applet-button--clickNext' : '');

    return h(
      'div',
      { className: 'footer' },
      h(
        'div',
        { className: 'footer-left' },
        h(
          'button',
          {
            className: prevClasses,
            disabled: !canPrev,
            onClick: canPrev ? onPrev : null,
            type: 'button',
          },
          h('span', { className: 'nav-btn-text' }, '\u00ab')
        )
      ),
      h(
        'div',
        { className: 'footer-center' },
        centerText
          ? h('span', { className: 'footer-text' }, centerText)
          : null
      ),
      h(
        'div',
        { className: 'footer-right' },
        h(
          'button',
          {
            className: nextClasses,
            disabled: !canNext,
            onClick: canNext ? onNext : null,
            type: 'button',
          },
          h('span', { className: 'nav-btn-text' }, '\u00bb')
        )
      )
    );
  }

  /* ---------- Applet Button (CTA) ---------- */
  function AppletButton(props) {
    const {
      label,
      onClick,
      variant = 'active',
      impending = '',
      disabled = false,
    } = props;

    let stateClass = 'applet-button--active';
    if (variant === 'correct') stateClass = 'applet-button--correct';
    if (variant === 'wrong') stateClass = 'applet-button--wrong';
    if (disabled) stateClass = 'applet-button--inactive';

    let impendingClass = '';
    if (impending === 'clickNext') impendingClass = 'applet-button--clickNext';

    const classes =
      'applet-button applet-button--medium action-button ' +
      stateClass +
      (impendingClass ? ' ' + impendingClass : '');

    const handleClick = disabled
      ? null
      : (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onClick) onClick(e);
        };

    return h(
      'button',
      {
        className: classes,
        onClick: handleClick,
        disabled: disabled,
        type: 'button',
      },
      h('span', { className: 'applet-button-text' }, label)
    );
  }

  /* ---------- OptionRow (2/3/5 or Yes/No) ---------- */
  function OptionRow(props) {
    const {
      options,                        /* array of { value, label } */
      selectedValue = null,
      correctValue = null,
      wrongValue = null,
      pulsate = true,                /* pulse all options when no answer yet */
      disabled = false,
      yesNo = false,
      onSelect,
    } = props;

    return h(
      'div',
      { className: 'option-row' },
      options.map((opt) => {
        const isCorrect = correctValue === opt.value;
        const isWrong = wrongValue === opt.value;
        const isSelected = selectedValue === opt.value;
        const showPulse = pulsate && !selectedValue && !disabled;

        const cls =
          'option-button action-button' +
          (yesNo ? ' option--yes-no' : '') +
          (showPulse ? ' is-pulsate' : '') +
          (isCorrect ? ' is-correct' : '') +
          (isWrong ? ' is-wrong' : '') +
          (disabled && !isCorrect && !isWrong ? ' is-disabled' : '');

        return h(
          'button',
          {
            key: 'opt-' + opt.value,
            className: cls,
            disabled: disabled || isSelected,
            type: 'button',
            onClick: disabled ? null : (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSelect) onSelect(opt.value);
            },
          },
          h('span', null, opt.label)
        );
      })
    );
  }

  /* ---------- SymbolRow (>, =, <) horizontal ---------- */
  function SymbolRow(props) {
    const {
      selectedValue = null,
      correctValue = null,
      wrongValue = null,
      pulsate = true,
      disabled = false,
      onSelect,
    } = props;

    const opts = [
      { value: '>', label: '>' },
      { value: '=', label: '=' },
      { value: '<', label: '<' },
    ];

    return h(
      'div',
      { className: 'symbol-row' },
      opts.map((opt) => {
        const isCorrect = correctValue === opt.value;
        const isWrong = wrongValue === opt.value;
        const showPulse = pulsate && !selectedValue && !disabled;

        const cls =
          'symbol-button action-button' +
          (showPulse ? ' is-pulsate' : '') +
          (isCorrect ? ' is-correct' : '') +
          (isWrong ? ' is-wrong' : '') +
          (disabled && !isCorrect && !isWrong ? ' is-disabled' : '');

        return h(
          'button',
          {
            key: 'sym-' + opt.value,
            className: cls,
            disabled: disabled || selectedValue === opt.value,
            type: 'button',
            onClick: disabled ? null : (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSelect) onSelect(opt.value);
            },
          },
          h('span', null, opt.label)
        );
      })
    );
  }

  /* ---------- SymbolStrip – vertical >, =, < between two bars (storyboard) ---------- */
  function SymbolStrip(props) {
    const {
      selectedValue = null,
      correctValue = null,
      wrongValue = null,
      pulsate = true,
      disabled = false,
      interactionLocked = false,
      collapseToSelected = false,
      onSelect,
    } = props;

    const opts = [
      { value: '>', label: '>' },
      { value: '=', label: '=' },
      { value: '<', label: '<' },
    ];

    const lock = disabled || interactionLocked;

    const visibleOpts = collapseToSelected && selectedValue
      ? opts.filter((opt) => opt.value === selectedValue)
      : opts;

    return h(
      'div',
      {
        className:
          'symbol-strip symbol-strip--vertical' +
          (visibleOpts.length === 1 ? ' symbol-strip--single' : ''),
        role: 'group',
        'aria-label': 'Compare fractions',
      },
      visibleOpts.map((opt) => {
        const isCorrect = correctValue === opt.value;
        const isWrong = wrongValue === opt.value;
        const showPulse = pulsate && !selectedValue && !disabled && !interactionLocked;

        const cls =
          'symbol-button action-button' +
          (showPulse ? ' is-pulsate' : '') +
          (isCorrect ? ' is-correct' : '') +
          (isWrong ? ' is-wrong' : '') +
          (lock && !isCorrect && !isWrong ? ' is-disabled' : '');

        return h(
          'button',
          {
            key: 'strip-sym-' + opt.value,
            className: cls,
            'data-symbol-value': opt.value,
            disabled: disabled || interactionLocked || selectedValue === opt.value,
            type: 'button',
            onClick: disabled || interactionLocked ? null : (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSelect) onSelect(opt.value);
            },
          },
          h('span', null, opt.label)
        );
      })
    );
  }

  /* ---------- FractionLabel (inline within speech bubble) ---------- */
  function FractionLabel(num, den, sizeClass) {
    return h(
      'span',
      { className: 'frac-inline' },
      h('span', { className: 'frac-num' }, num),
      h('span', { className: 'frac-den' }, den)
    );
  }

  /* ---------- ComparisonResult (Smaller/Bigger callouts) ---------- */
  function HalfCallout(props) {
    const { variant = 'smaller', text, style = {} } = props;
    return h(
      'div',
      {
        className: 'half-callout half-callout--' + variant,
        style: style,
      },
      text
    );
  }

  /* ---------- Confetti overlay ---------- */
  function Confetti(props) {
    const { count = 80 } = props || {};
    const colors = ['#FF6F61', '#FF9F1A', '#F1C40F', '#1ABC9C', '#3498DB', '#9B59B6', '#E84393'];
    const pieces = [];
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 1.5;
      const duration = 2.5 + Math.random() * 2;
      const color = colors[i % colors.length];
      const rotate = Math.random() * 360;
      pieces.push(
        h('div', {
          key: 'c' + i,
          className: 'confetti-piece',
          style: {
            left: left + '%',
            backgroundColor: color,
            animationDelay: delay + 's',
            animationDuration: duration + 's',
            transform: 'rotate(' + rotate + 'deg)',
          },
        })
      );
    }
    return h('div', { className: 'confetti-overlay' }, pieces);
  }

  /* ---------- Feedback Banner ---------- */
  function FeedbackBanner(props) {
    const { variant = 'correct', text } = props;
    return h(
      'div',
      { className: 'feedback-banner feedback-banner--' + variant },
      text
    );
  }

  window.Components = {
    CharacterPanel,
    FooterNav,
    AppletButton,
    OptionRow,
    SymbolRow,
    SymbolStrip,
    FractionLabel,
    HalfCallout,
    Confetti,
    FeedbackBanner,
    visibleTextLength,
    formatFractionsInHtml,
  };
})();
