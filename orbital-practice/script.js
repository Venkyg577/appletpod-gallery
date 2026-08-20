import { getChemToolContent } from "./js/modules/chemToolContent.js";
import { attachToolEventListeners } from "./js/modules/chemToolInteractions.js";
import {
  buildPeriodicTable,
  initModalUI,
  reRenderCurrentAtomModal,
  setGlobalUnit,
  l3UnitState
} from "./js/modules/uiController.js";
import { initPageController } from "./js/modules/pageController.js";
import { createToolsModalController } from "./js/modules/toolsModalController.js";
import {
  getSavedAnimationState,
  initSettingsController,
} from "./js/modules/settingsController.js";
import { initMascotController } from "./js/modules/mascotController.js";
import { initElementSearch } from "./js/modules/elementSearchController.js";
import {
  initLangController,
  onLangChange,
  registerCacheCleanup,
} from "./js/modules/langController.js";
import { initOnboardingFlow } from "./js/modules/onboardingController.js";
import { initContentFlow } from "./js/modules/contentFlowController.js";

// ========================================
// Welcome Modal - Intro Page
// ========================================
// ========================================
// Global Dragging State (used to prevent accidental panel close)
// ========================================
window._appIsDragging = false;
(function initGlobalDragTracking() {
  let pointerDown = false;
  let startX = 0, startY = 0;
  const DRAG_THRESHOLD = 5;
  document.addEventListener('pointerdown', (e) => {
    pointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
  }, true);
  document.addEventListener('pointermove', (e) => {
    if (!pointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      window._appIsDragging = true;
    }
  }, true);
  document.addEventListener('pointerup', () => {
    pointerDown = false;
    // Delay clearing drag state so click handlers see it
    setTimeout(() => { window._appIsDragging = false; }, 80);
  }, true);
  document.addEventListener('pointercancel', () => {
    pointerDown = false;
    setTimeout(() => { window._appIsDragging = false; }, 80);
  }, true);
  window.addEventListener('blur', () => {
    pointerDown = false;
    // Don't close panels on blur
  });
})();

// ========================================
// Global Animation Speed State
// ========================================
const savedAnimationState = getSavedAnimationState();
window._appAnimPaused = savedAnimationState.paused;
window._appAnimSpeed = savedAnimationState.speed;

// ========================================
// Lazy Script/Module Loaders (performance)
// ========================================
const lazyScriptPromises = new Map();
let ionsTableReady = false;
let worksheetReady = false;
let heroAtomModulePromise = null;

function loadClassicScriptOnce(src) {
  if (lazyScriptPromises.has(src)) return lazyScriptPromises.get(src);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.lazySrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
  lazyScriptPromises.set(src, promise);
  return promise;
}

async function ensureIonsTableReady() {
  if (ionsTableReady) return;
  await loadClassicScriptOnce("js/ion-animations.js");
  const { initIonsTable } = await import("./js/modules/ionsController.js");
  await initIonsTable();
  ionsTableReady = true;
}

async function ensureWorksheetReady() {
  if (worksheetReady) return;
  await loadClassicScriptOnce("js/worksheet-generator.js");
  worksheetReady = true;
}

function loadHeroAtomModule() {
  if (heroAtomModulePromise) return heroAtomModulePromise;
  heroAtomModulePromise = import("./js/modules/heroAtomRenderer.js");
  return heroAtomModulePromise;
}

// autoOpen=false registers the modal's handlers and window._showWelcome
// without popping it open, so the About/Settings entry points keep working
// even when the legacy intro is skipped.
function initWelcomeModal({ autoOpen = true } = {}) {
  const welcomeModal = document.getElementById("welcome-modal");
  const closeBtn = document.getElementById("welcome-close-btn");
  const startBtn = document.getElementById("welcome-start-btn");

  // ===== Current version for cache-busting =====
  const CURRENT_VERSION = "2.0.1";

  // Cache busting force reload (one-time for each release). Only meaningful
  // for the legacy intro path; it rewrites the URL, so skip it otherwise.
  const lastForced = localStorage.getItem("pt_force_refresh");
  if (autoOpen && lastForced !== CURRENT_VERSION) {
    localStorage.setItem("pt_force_refresh", CURRENT_VERSION);
    // Add version to URL and reload to bypass disk cache once
    const url = new URL(window.location.href);
    url.searchParams.set('v', CURRENT_VERSION);
    window.location.replace(url.toString());
    return;
  }

  // ===== Welcome helpers =====
  function openWelcomeModal() {
    if (!welcomeModal) return;
    welcomeModal.classList.add("active");
    document.body.classList.add("welcome-active");
    document.body.classList.add("hide-nav");
    void loadHeroAtomModule()
      .then(({ initHeroAtom }) => initHeroAtom())
      .catch((e) => console.error("Hero 3D init error:", e));
  }

  function closeWelcome() {
    if (!welcomeModal) return;
    welcomeModal.classList.remove("active");
    document.body.classList.remove("welcome-active");
    document.body.classList.remove("hide-nav");
    localStorage.setItem("pt_welcomed", "true");
    if (window._heroCleanup) window._heroCleanup();
  }

  // ===== Show welcome on first visit =====
  const hasVisited = localStorage.getItem("pt_welcomed");
  if (autoOpen && !hasVisited) {
    openWelcomeModal();
  }

  // ===== Global helper to manually trigger welcome =====
  window._showWelcome = function showWelcome() {
    openWelcomeModal();
  };

  // ===== Event bindings: Welcome =====
  if (closeBtn) closeBtn.addEventListener("click", closeWelcome);
  if (startBtn) startBtn.addEventListener("click", closeWelcome);
  if (welcomeModal) {
    welcomeModal.addEventListener("click", (e) => {
      if (window._appIsDragging) return;
      if (e.target === welcomeModal) closeWelcome();
    });
  }

  // ===== Escape key closes welcome =====
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (welcomeModal && welcomeModal.classList.contains("active")) {
      closeWelcome();
    }
  });
}

// ========================================
// Periodic Table Auto-Scale on Short Viewport
// ========================================
function initPeriodicTableScale() {
  const table = document.getElementById("periodic-table");
  const container = document.getElementById("main-container");
  if (!table || !container) return;

  const LOGICAL_WIDTH = 1240;
  const MAX_GAP = 96;
  const MIN_GAP = 24;
  let isScaling = false;
  let lastScaleSignature = "";
  let legendEl = null;

  function computeTvmin(tableW) {
    // Scale tvmin with table width to keep text proportional in cells
    const effectiveH = Math.max(window.innerHeight, 500);
    return Math.min(tableW, effectiveH) / 100;
  }

  function measureHeight(gap) {
    table.style.setProperty("--series-gap", `${gap}px`);
    table.style.transition = "none";
    table.style.transform = "none";
    void table.offsetHeight;
    return table.getBoundingClientRect().height;
  }

  function applyLayout(gap, scale, marginTop) {
    table.style.setProperty("--series-gap", `${gap}px`);
    table.style.transformOrigin = "top center";
    table.style.transform = scale < 0.999 ? `scale(${scale})` : "none";
    table.style.marginTop = `${marginTop}px`;

    const legend = document.getElementById("table-legend");
    if (legend) {
      legend.style.transform = "translateY(10px)";
      legend.style.transformOrigin = "top center";
    }
  }

  function scaleTable(force = false) {
    if (isScaling) return;
    if (getComputedStyle(container).display === "none") return;
    if (table.children.length === 0) return;

    const scaleSignature = [
      window.innerWidth,
      window.innerHeight,
      container.clientWidth,
      container.clientHeight,
      table.childElementCount,
    ].join(":");

    if (!force && scaleSignature === lastScaleSignature) return;

    isScaling = true;
    try {
      lastScaleSignature = scaleSignature;
      // 1. Measure Environment
      const containerStyle = getComputedStyle(container);
      const padT = parseFloat(containerStyle.paddingTop) || 0;
      const padB = parseFloat(containerStyle.paddingBottom) || 0;
      const availH = Math.max(window.innerHeight - padT - padB, 100);

      const MIN_READABLE_SCALE = 0.65;
      const SCROLL_THRESHOLD = 1150; // Below this, always scroll

      // 2. Smart width decision: try fitting at current window width first
      let tableWidth;
      let useScrollMode = false;

      if (window.innerWidth < SCROLL_THRESHOLD) {
        // Very narrow window: always use scroll mode
        useScrollMode = true;
      } else {
        // Try fitting at current window width
        const tryWidth = window.innerWidth - 40;
        const tryTvmin = computeTvmin(tryWidth);
        table.style.setProperty("--tvmin", `${tryTvmin}px`);
        table.style.width = `${tryWidth}px`;
        const tryH = measureHeight(MIN_GAP);
        const tryScale = availH / tryH;

        if (tryScale >= MIN_READABLE_SCALE) {
          // Table fits at this width with acceptable scaling
          tableWidth = tryWidth;
          // Set container min-width to window width (no scroll)
          container.style.minWidth = `${window.innerWidth}px`;
        } else {
          // Scale too small — table would be unreadable. Use scroll mode.
          useScrollMode = true;
        }
      }

      if (useScrollMode) {
        // Scroll mode: use fullscreen-equivalent width
        const fullscreenRef = Math.max(screen.availWidth, 1280);
        tableWidth = Math.max(fullscreenRef - 40, LOGICAL_WIDTH);
        container.style.minWidth = `${tableWidth + 40}px`;
      }

      // 3. Apply width and tvmin
      const tvmin = computeTvmin(tableWidth);
      table.style.setProperty("--tvmin", `${tvmin}px`);
      table.style.width = `${tableWidth}px`;

      // 4. Measure base height with MIN gap
      const hMin = measureHeight(MIN_GAP);

      // 5. Adaptive Gap: expand gap to fill available height, maximizing the table
      let currentGap;
      let height;
      let scale = 1;

      if (hMin > availH) {
        // Even with min gap, too tall → need to scale
        currentGap = MIN_GAP;
        height = hMin;
        scale = Math.max(availH / height, 0.1);
      } else {
        // Table fits. Expand gap to fill remaining space.
        const extraSpace = availH - hMin;
        currentGap = Math.min(MAX_GAP, MIN_GAP + extraSpace);
        height = measureHeight(currentGap);
        // Fine-tune: if somehow still doesn't fit, clamp
        if (height > availH) {
          currentGap = MIN_GAP;
          height = hMin;
        }
      }

      // 6. Vertical Centering
      const scaledHeight = height * scale;
      let marginTop = 0;
      if (scaledHeight < availH) {
        marginTop = (availH - scaledHeight) / 2;
      }

      // 7. Fix scroll mode margins: match container to visual width
      if (useScrollMode && scale < 0.999) {
        const visualWidth = Math.ceil(tableWidth * scale);
        container.style.minWidth = `${visualWidth + 40}px`;
      }

      // 8. Legend layout: switch between 4-col and 2-col based on VISUAL width
      legendEl = legendEl || document.getElementById("table-legend");
      const legend = legendEl;
      if (legend) {
        // Legend spans grid-column 3/13 = 10 out of 18 columns
        // Use visual width (accounting for scale) to decide layout
        const legendVisualWidth = (10 / 18) * tableWidth * scale;
        // 4 columns need ~560px visual minimum (4 × 140px)
        if (legendVisualWidth < 560) {
          legend.classList.add("legend-compact");
        } else {
          legend.classList.remove("legend-compact");
        }
      }

      applyLayout(currentGap, scale, marginTop);

    } catch (e) {
      console.error("Scale Error:", e);
    } finally {
      isScaling = false;
    }
  }

  window._scalePeriodicTable = (force = false) => scaleTable(force);
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => requestAnimationFrame(() => scaleTable(true)), 50);
  });
  window.addEventListener("load", () => scaleTable(true));
  // Also run immediately
  requestAnimationFrame(() => scaleTable(true));
}

function initNavResponsive() {
  const nav = document.getElementById("global-nav");
  if (!nav) return;
  const root = document.documentElement;

  const SAFETY_GAP = 32;

  function syncGlobalNavScale() {
    const width = window.innerWidth;
    const height = Math.max(window.innerHeight, 1);
    const aspectRatio = width / height;
    let scale = 1;

    if (width <= 1360) {
      scale = 0.88;
    } else if (width <= 1500) {
      scale = 0.94;
    }

    if (width > 1700 && aspectRatio > 1.7) {
      const aspectReduction = Math.min(0.07, (aspectRatio - 1.7) * 0.09);
      const widthReduction = Math.min(0.05, (width - 1700) / 1800 * 0.05);
      scale -= aspectReduction + widthReduction;
    }

    scale = Math.max(0.86, Math.min(1, scale));
    root.style.setProperty("--global-nav-scale", scale.toFixed(3));
  }

  function checkNavCollision() {
    syncGlobalNavScale();
    nav.classList.remove("nav-hide-brand");
    void nav.offsetWidth;

    const navInnerWidth = nav.clientWidth - 40;
    const logo = nav.querySelector(".nav-logo-link");
    const brand = nav.querySelector(".nav-brand");
    const pill = nav.querySelector(".global-nav-pill");

    const logoW = logo ? logo.offsetWidth : 0;
    const brandW = brand ? brand.offsetWidth : 0;
    const pillW = pill ? pill.offsetWidth : 0;
    const navGap = 12;
    const brandGap = brand && brandW > 0 ? 10 : 0;

    const totalNeeded = logoW + brandGap + brandW + navGap + pillW + SAFETY_GAP * 2;

    if (totalNeeded > navInnerWidth) {
      nav.classList.add("nav-hide-brand");
    }
  }

  let navResizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(navResizeTimer);
    navResizeTimer = setTimeout(checkNavCollision, 60);
  });
  window.addEventListener("load", checkNavCollision);
  onLangChange(() => requestAnimationFrame(checkNavCollision));
  requestAnimationFrame(checkNavCollision);
}

// Global Data Version State
window.appVersion = 'old';

function bootstrapApp() {
  initLangController();

  // The guided content flow is the app's opening experience, so the legacy
  // logo splash and welcome modal are off by default. Pass "?onboarding" to
  // bring them back.
  const showLegacyIntro = new URLSearchParams(window.location.search).has("onboarding");

  if (showLegacyIntro) {
    // Release-gated onboarding: force-show the intro animation once per release.
    const ONBOARDING_VERSION = "2.0.1";
    const seenOnboardingVersion = localStorage.getItem("pt_onboarding_seen_version");
    if (seenOnboardingVersion !== ONBOARDING_VERSION) {
      localStorage.setItem("pt_onboarding_seen_version", ONBOARDING_VERSION);
      localStorage.removeItem("pt_welcomed_v2");
    }

    if (!localStorage.getItem("pt_welcomed_v2")) {
      initOnboardingFlow();
      return;
    }
  }

  // Always bind the welcome modal so About/Settings can open it on demand;
  // it only auto-opens on the legacy intro path.
  initWelcomeModal({ autoOpen: showLegacyIntro });

  initPeriodicTableScale();
  initNavResponsive();

  const tableContainer = document.getElementById("periodic-table");
  if (tableContainer) buildPeriodicTable(tableContainer);
  initModalUI();

  const toolsModalController = createToolsModalController({
    getToolContent: getChemToolContent,
    attachToolEventListeners,
  });
  toolsModalController.init();

  // Register tool cache cleanup when language changes
  registerCacheCleanup(() => {
    toolsModalController.clearToolContentCache();
  });

  const pageCtrl = initPageController({
    onTablePageShown: () => {
      if (window._scalePeriodicTable) window._scalePeriodicTable(true);
    },
    onIonsPageShown: () => {
      void ensureIonsTableReady().catch((e) =>
        console.error("Ions lazy init error:", e),
      );
    },
    onToolsPageShown: () => {
      setTimeout(() => toolsModalController.initChemToolCards(), 100);
    },
    onWorksheetPageShown: () => {
      void ensureWorksheetReady().catch((e) =>
        console.error("Worksheet lazy init error:", e),
      );
    },
    onSettingsPageShown: () => {
      requestAnimationFrame(() => {
         if (window._syncGlobalUnitButtons) window._syncGlobalUnitButtons(true);
      });
    }
  });

  // Initialize element search in navbar
  initElementSearch(pageCtrl);

  // Floating about button opens Welcome / Help
  const aboutBtn = document.getElementById("floating-about-btn");
  if (aboutBtn) {
    aboutBtn.addEventListener("click", () => {
      if (window._showWelcome) window._showWelcome();
    });
  }

  requestAnimationFrame(() => {
    if (window._scalePeriodicTable) window._scalePeriodicTable(true);
  });
  initSettingsController({
    onOpenWelcome: () => {
      if (window._showWelcome) window._showWelcome();
    },
    l3UnitState,
    setGlobalUnit,
  });

  // Initialize mascot chemistry assistant
  initMascotController();

  // Guided periodic-table intro (periods → groups → blocks → element types).
  // Replays on every load; hands the learner off to the normal table when done.
  if (tableContainer) {
    requestAnimationFrame(() => initContentFlow(tableContainer));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapApp, { once: true });
} else {
  bootstrapApp();
}
