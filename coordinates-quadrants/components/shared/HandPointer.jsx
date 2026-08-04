// HandPointer.jsx — animated tap cue reusing fingerTap.gif.
(function(){
  var h = window.MiniReact.h;
  function HandPointer(props){
    return h('img', {
      className: 'hand-pointer',
      src: './assets/images/fingerTap.gif',
      alt: 'Tap here',
      'aria-hidden': 'true'
    });
  }
  window.HandPointer = HandPointer;
})();
