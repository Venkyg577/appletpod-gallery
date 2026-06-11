import { useEffect } from "react";

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function updateScaleFactor() {
  const scaleW = window.innerWidth / 1920;
  const scaleH = window.innerHeight / 1080;
  const scale = Math.min(scaleW, scaleH);
  document.documentElement.style.setProperty("--scaleFactor", String(scale));
}

export function useScaleFactor() {
  useEffect(() => {
    const onResize = debounce(() => updateScaleFactor(), 100);
    updateScaleFactor();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
}
