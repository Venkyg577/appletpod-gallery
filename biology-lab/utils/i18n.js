function get(obj, path){
  return path.split('.').reduce((o,k)=> (o && k in o) ? o[k] : undefined, obj);
}

function replacePlaceholders(str, data){
  if (typeof str !== 'string' || !data) return str;
  return str.replace(/\{(\w+)\}/g, function(m, key){ return data[key] != null ? String(data[key]) : m; });
}

function createI18n(appData, initialLocale='en'){
  let locale = initialLocale;
  const setLocale = (l)=>{ locale = l; };
  function t(path, placeholders){
    const chain = [locale];
    if (locale === 'id-ID') chain.push('id');
    if (locale.startsWith('fil') || locale === 'tl') chain.push('fil');
    if (locale.startsWith('es-')) chain.push('es');
    chain.push('en');
    for (const loc of chain){
      const val = get(appData[loc], path);
      if (val !== undefined) return replacePlaceholders(val, placeholders);
    }
    return path;
  }
  return { t, setLocale, get locale(){ return locale; } };
}

window.i18n = { get, createI18n, replacePlaceholders };
