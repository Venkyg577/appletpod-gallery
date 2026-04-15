function NavBar(props) {
  var h = window.MiniReact.h;
  return h('header', { className: 'applet-nav', role: 'banner' },
    h('h1', { className: 'applet-nav__title' }, props.title || ''),
    h('p', { className: 'applet-nav__instruction' }, props.instruction || '')
  );
}

window.NavBar = NavBar;
