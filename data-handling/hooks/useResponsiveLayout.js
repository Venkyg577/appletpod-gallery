function useResponsiveLayout(){
  const useEffect = window.MiniReact.useEffect;
  useEffect(()=>{
    function update(){
      const s = Math.min(window.innerWidth/1920, window.innerHeight/1080);
      document.documentElement.style.setProperty('--scaleFactor', s);
    }
    update();
    window.addEventListener('resize', update);
    return ()=> window.removeEventListener('resize', update);
  },[]);
}

window.useResponsiveLayout = useResponsiveLayout;
