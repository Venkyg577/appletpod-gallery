// =============================================================================
// Language Controller — English-only string lookup.
//
// The app previously supported 8 languages via a runtime-switchable i18n
// system (dropdown, per-language locale files, page-reload-on-switch, etc).
// That machinery has been removed; this module now only provides a static
// English string lookup (t) plus no-op-compatible stubs for the handful of
// functions still called from other modules, so those call sites did not
// need to be rewritten one-by-one.
// =============================================================================

import { translations } from "../data/translations.js";

const LANG = "en";

// No non-English element/ion locale data is ever loaded, so these stay empty.
export const elementLocales = {};
export const ionLocales = {};

/** Lookup a translated string by dot-path key, e.g. t("nav.table", "Fallback") */
export function t(key, fallback) {
  const parts = key.split(".");
  let val = translations[LANG];
  for (const p of parts) {
    if (val == null) break;
    val = val[p];
  }
  if (val != null) return val;
  return fallback !== undefined ? fallback : key;
}

export function getLang() {
  return LANG;
}

// Language switching no longer exists — kept as a no-op so any leftover
// call sites don't throw.
export function setLang() {
  // no-op: English-only build
}

// There is nothing to load for English-only locale data, so these resolve
// immediately without fetching anything.
export async function fetchElementLocale() {
  return;
}

export async function fetchIonLocale() {
  return;
}

// Language never changes at runtime anymore, so callbacks are accepted for
// API compatibility but are never invoked.
export function onLangChange() {
  // no-op: language never changes
}

export function registerCacheCleanup() {
  // no-op: nothing to invalidate since language never changes
}

export function initLangController() {
  document.documentElement.lang = LANG;
}
