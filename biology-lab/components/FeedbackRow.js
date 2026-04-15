// kind: 'correct' | 'incorrect' | 'missed'
function FeedbackRow(props) {
  var h = window.MiniReact.h;
  var kind = props.kind || 'correct';
  var icon =
    kind === 'correct' ? '\u2713' : kind === 'incorrect' ? '\u2715' : '!';

  return h(
    'div',
    {
      className:
        'feedback-row feedback-row--' +
        (kind === 'missed' ? 'missed' : kind === 'incorrect' ? 'incorrect' : 'correct')
    },
    h(
      'div',
      {
        className:
          'feedback-row__icon feedback-row__icon--' +
          (kind === 'missed' ? 'missed' : kind === 'incorrect' ? 'incorrect' : 'correct'),
        'aria-hidden': 'true'
      },
      icon
    ),
    h('div', { className: 'feedback-row__text' },
      h('span', { className: 'feedback-row__label' }, props.label || ''),
      h('div', { className: 'feedback-row__desc' }, props.text || '')
    )
  );
}

window.FeedbackRow = FeedbackRow;
