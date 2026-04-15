function SummaryCards(props) {
  var h = window.MiniReact.h;
  var title = props.title || '';
  var cards = props.cards || [];

  var nodes = cards.map(function (text, i) {
    return h(
      'div',
      { key: 'c' + i, className: 'summary-card' },
      h('span', { className: 'summary-card__bullet', 'aria-hidden': 'true' }, '\u2022'),
      h('span', {}, text)
    );
  });

  return h('div', { className: 'summary-section' },
    h('h3', { className: 'summary-section__title' }, title),
    h('div', { className: 'summary-cards' }, nodes)
  );
}

window.SummaryCards = SummaryCards;
