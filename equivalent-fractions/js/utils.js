// Minimal utilities: scaling + i18n (locale from window.__EquivLang)

const missingTranslationKeys = new Set();

function getCurrentLanguage() {
  const L = window.__EquivLang;
  if (L === 'id' || L === 'fil' || L === 'en') return L;
  return 'en';
}

function getText(path, params, lang) {
  const currentLang = lang || getCurrentLanguage();
  const data = window.appData;
  if (!data) return path;
  let locale = data[currentLang] || data.en;
  if (!locale) locale = data.en;

  const segments = path.split('.');
  let value = locale;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (value && Object.prototype.hasOwnProperty.call(value, seg)) {
      value = value[seg];
    } else {
      if (currentLang !== 'en' && data.en) {
        return getText(path, params, 'en');
      }
      const key = currentLang + ':' + path;
      if (!missingTranslationKeys.has(key)) {
        missingTranslationKeys.add(key);
        console.warn('Missing translation key', key);
      }
      return path;
    }
  }

  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, function (_, k) {
      return params && params[k] != null ? params[k] : '{' + k + '}';
    });
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
  window.addEventListener('orientationchange', function () {
    setTimeout(updateScaleFactor, 100);
  });
}

window.utils = {
  getText: getText,
  getCurrentLanguage: getCurrentLanguage,
  initializeResponsiveScaling: initializeResponsiveScaling,
};
