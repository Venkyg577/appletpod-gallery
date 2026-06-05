/* Shared utilities: translation lookup + responsive scale wrapper. */

const missingTranslationKeys = new Set();

function getCurrentLanguage() {
  const htmlLang = document.documentElement.lang;
  if (htmlLang && window.appData && window.appData[htmlLang]) {
    return htmlLang;
  }
  return 'en';
}

function getText(path, params = {}, lang) {
  const currentLang = lang || getCurrentLanguage();
  const locale = (window.appData && window.appData[currentLang]) || (window.appData && window.appData.en);
  if (!locale) return path;

  const segments = path.split('.');
  let value = locale;
  for (const seg of segments) {
    if (value && Object.prototype.hasOwnProperty.call(value, seg)) {
      value = value[seg];
    } else {
      const key = `${currentLang}:${path}`;
      if (!missingTranslationKeys.has(key)) {
        missingTranslationKeys.add(key);
        console.warn('Missing translation key', key);
      }
      return path;
    }
  }

  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? params[k] : `{${k}}`));
  }
  return value;
}

function initializeResponsiveScaling() {
  function updateScaleFactor() {
    const scaleW = window.innerWidth / 1920;
    const scaleH = window.innerHeight / 1080;
    const scale = Math.min(scaleW, scaleH);
    document.documentElement.style.setProperty('--scaleFactor', String(scale));
  }

  updateScaleFactor();
  let raf = null;
  window.addEventListener('resize', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateScaleFactor);
  });
}

window.utils = {
  getText,
  getCurrentLanguage,
  initializeResponsiveScaling,
};
window.initializeResponsiveScaling = initializeResponsiveScaling;
