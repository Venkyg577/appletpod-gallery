function useResponsiveLayout(){
  var useEffect = window.MiniReact.useEffect;
  useEffect(function(){
    function update(){
      var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      document.documentElement.style.setProperty('--scaleFactor', s);
    }
    function onOrientationChange(){ setTimeout(update, 100); }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', onOrientationChange);
    return function(){
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, []);
}

window.useResponsiveLayout = useResponsiveLayout;
