// Minimal utilities shared across applet

const missingTranslationKeys = new Set();

function getCurrentLanguage() {
  return 'en';
}

function getText(path, params = {}, lang) {
  const currentLang = lang || getCurrentLanguage();
  const locale = (window.appData && window.appData[currentLang]) || window.appData.en;
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
  window.addEventListener('resize', updateScaleFactor);
}

window.utils = {
  getText,
  getCurrentLanguage,
  initializeResponsiveScaling,
};
