// ---- Configuration --------------------------------------------------
var TOTAL_PAGES = 15;
var IMG_BASE = "pages/page-";
var PAGE_RATIO = 1325 / 1723;  // page width / height

// Base dimensions at which index-page content is authored (px).
// scale = min(renderedW/BASE_W, renderedH/BASE_H) — same as applet scaling.
var INDEX_BASE_W = 600;
var INDEX_BASE_H = 800;

// Reference height at which hotspot decorative px values (border, radius,
// label font/padding) are authored. --page-scale = renderedH / this.
var PAGE_DECOR_BASE_H = 1080;

// Single source of truth for applets.
var APPLETS = [
  {
    id: "applet1",
    title: "Comparing Fractions Visually",
    topic: "Comparing wholes · ½ vs ⅓",
    page: 1,
    src: "applets/comparing-fractions/index.html",
    thumb: "thumbs/applet1.png",
    label: "▶ Open: Comparing Fractions",
    hotspot: { top: 27.74, left: 10.57, width: 41.89, height: 18.11 },
  },
  {
    id: "applet2",
    title: "Equivalent Fractions",
    topic: "Fun with Fraction Kit · ½ = 2⁄4 = 3⁄6",
    page: 2,
    src: "applets/equivalent-fractions/index.html",
    thumb: "thumbs/applet2.png",
    label: "▶ Open: Equivalent Fractions",
    hotspot: { top: 52.7, left: 66.04, width: 24.15, height: 16.83 },
  },
];

var APPLETS_BY_PAGE = {};
APPLETS.forEach(function (ap) {
  (APPLETS_BY_PAGE[ap.page] = APPLETS_BY_PAGE[ap.page] || []).push(ap);
});

function pad(n) { return n < 10 ? "0" + n : "" + n; }

function pageToSpreadIndex(pg) { return pg; }

function visiblePagesForIndex(idx) {
  var spreadStart = idx <= 1 ? 0 : (idx % 2 === 0 ? idx : idx - 1);
  if (spreadStart <= 0) return [1];
  var pages = [Math.min(spreadStart, TOTAL_PAGES)];
  if (spreadStart + 1 <= TOTAL_PAGES) pages.push(spreadStart + 1);
  return pages;
}

// ---- Page topics --------------------------------------------------
var PAGE_TOPICS = [
  { pg: 1,  topic: "Fractions · Comparing Different-Sized Wholes", appletId: "applet1" },
  { pg: 2,  topic: "Equivalent Fractions",                         appletId: "applet2" },
  { pg: 3,  topic: "Equivalent Fractions · Let Us Do" },
  { pg: 4,  topic: "Making Equivalent Fractions" },
  { pg: 5,  topic: "Making Equivalent Fractions · Practice" },
  { pg: 6,  topic: "Equivalent Fractions · Let Us Do" },
  { pg: 7,  topic: "Comparing Fractions · Same Denominator" },
  { pg: 8,  topic: "Comparing Fractions · Same Numerator" },
  { pg: 9,  topic: "Fractions Greater Than 1" },
  { pg: 10, topic: "Fractions Greater Than 1 · Number Line" },
  { pg: 11, topic: "Fractions Greater Than 1 · Thirds" },
  { pg: 12, topic: "Fractions Greater Than 1 · Let Us Do" },
  { pg: 13, topic: "Comparing Fractions with Reference to 1" },
  { pg: 14, topic: "Comparing Fractions with Reference to 1/2" },
  { pg: 15, topic: "Try This · Fun with Relations" },
];

// ---- Leaf builders --------------------------------------------------
function buildIndexLeaf(pageW, pageH) {
  var div = document.createElement("div");
  div.className = "page index-page";
  div.setAttribute("data-density", "hard");

  // Same scale logic as applets: fit base dimensions inside rendered page size.
  var scaleW = pageW ? pageW / INDEX_BASE_W : 1;
  var scaleH = pageH ? pageH / INDEX_BASE_H : 1;
  var scale = Math.min(scaleW, scaleH);

  // Hotspot decorative scale (shared with content pages).
  div.style.setProperty("--page-scale", String(pageH ? pageH / PAGE_DECOR_BASE_H : 1));

  var inner = document.createElement("div");
  inner.className = "index-inner";
  inner.style.setProperty("--index-scale", String(scale));
  inner.style.setProperty("--index-base-w", INDEX_BASE_W + "px");
  inner.style.setProperty("--index-base-h", INDEX_BASE_H + "px");

  var html =
    '<div class="index-header">' +
    '<h2>Chapter 2 &mdash; <span class="chapter-subject">Fractions</span></h2>' +
    '<p class="sub">Contents &nbsp;&middot;&nbsp; Tap an applet to launch it</p>' +
    '</div>' +
    '<div class="toc-list">';

  PAGE_TOPICS.forEach(function (row) {
    var ap = row.appletId ? APPLETS.find(function(a){ return a.id === row.appletId; }) : null;
    var right = ap
      ? '<div class="toc-right"><button class="toc-applet-btn" data-id="' + ap.id + '">▶ ' + ap.title + '</button></div>'
      : '<div class="toc-right"></div>';
    html +=
      '<div class="toc-row" data-pg="' + row.pg + '">' +
      '<div class="toc-left">' +
      '<span class="toc-pg">' + row.pg + '</span>' +
      '<span class="toc-topic">' + row.topic + '</span>' +
      '</div>' +
      right +
      '</div>';
  });

  html += '</div><div class="index-foot">Turn the page to begin reading &rarr;</div>';
  inner.innerHTML = html;
  div.appendChild(inner);

  // Wire applet badges
  APPLETS.forEach(function (ap) {
    var btn = inner.querySelector('.toc-applet-btn[data-id="' + ap.id + '"]');
    if (btn) btn.addEventListener("click", function (e) {
      e.stopPropagation();
      openApplet(ap, btn);
    });
  });

  // Wire row clicks → navigate to page
  inner.querySelectorAll('.toc-row[data-pg]').forEach(function (row) {
    row.addEventListener("click", function (e) {
      if (e.target.closest('.toc-applet-btn')) return;
      var pg = parseInt(row.getAttribute('data-pg'), 10);
      if (pageFlip) pageFlip.flip(pageToSpreadIndex(pg));
    });
  });

  return div;
}

function buildPageLeaf(n, pageH) {
  var div = document.createElement("div");
  div.className = "page";
  div.setAttribute("data-density", "soft");
  div.style.setProperty("--page-scale", String(pageH ? pageH / PAGE_DECOR_BASE_H : 1));

  var img = document.createElement("img");
  img.src = IMG_BASE + pad(n) + ".png";
  img.alt = "Page " + n;
  div.appendChild(img);

  (APPLETS_BY_PAGE[n] || []).forEach(function (ap) {
    var a = document.createElement("a");
    a.className = "hotspot";
    a.href = ap.src;
    a.title = ap.title;
    a.style.setProperty("--label", '"' + ap.label + '"');
    a.style.top = ap.hotspot.top + "%";
    a.style.left = ap.hotspot.left + "%";
    a.style.width = ap.hotspot.width + "%";
    a.style.height = ap.hotspot.height + "%";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      openApplet(ap, this);
    });
    div.appendChild(a);
  });
  return div;
}

// ---- Size the book to fit the viewport (no scroll) ------------------
function computeSize() {
  var stage = document.getElementById("stage");
  var cs = getComputedStyle(stage);
  var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  var availH = stage.clientHeight - padY;
  var availW = stage.clientWidth - padX;
  var h = availH;
  var w = h * PAGE_RATIO;
  if (2 * w > availW) { w = availW / 2; h = w / PAGE_RATIO; }
  return { w: Math.floor(w), h: Math.floor(h) };
}

// ---- Elements -------------------------------------------------------
var indicator = document.getElementById("indicator");
var pagePicker = document.getElementById("page-picker");
var pagePickerInner = document.getElementById("page-picker-inner");
var hintEl = document.getElementById("hint");
var arrowPrev = document.getElementById("arrowPrev");
var arrowNext = document.getElementById("arrowNext");
var stage = document.getElementById("stage");
var pageFlip = null;
var pickerOpen = false;

// Build page-number buttons (1..TOTAL_PAGES)
for (var _p = 1; _p <= TOTAL_PAGES; _p++) {
  (function(n) {
    var b = document.createElement("button");
    b.className = "pg-btn";
    b.textContent = n;
    b.setAttribute("aria-label", "Go to page " + n);
    b.addEventListener("click", function(e) {
      e.stopPropagation();
      closePicker();
      if (pageFlip) pageFlip.flip(pageToSpreadIndex(n));
    });
    pagePickerInner.appendChild(b);
  })(_p);
}

function openPicker(currentIdx) {
  pickerOpen = true;
  pagePicker.hidden = false;
  syncPickerActive(currentIdx);
  var active = pagePickerInner.querySelector('.pg-btn.active');
  if (active) active.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function syncPickerActive(idx) {
  var visiblePages = visiblePagesForIndex(idx);
  pagePickerInner.querySelectorAll('.pg-btn').forEach(function(b, i) {
    b.classList.toggle('active', visiblePages.indexOf(i + 1) !== -1);
  });
}

function closePicker() {
  pickerOpen = false;
  pagePicker.hidden = true;
}

indicator.addEventListener("click", function(e) {
  e.stopPropagation();
  if (pickerOpen) { closePicker(); return; }
  var idx = pageFlip ? pageFlip.getCurrentPageIndex() : 1;
  openPicker(idx);
});

document.addEventListener("click", function() {
  if (pickerOpen) closePicker();
});

var LAST_INDEX = TOTAL_PAGES;

function createBook() {
  var size = computeSize();

  // Always use a fresh container so StPageFlip gets a virgin DOM node.
  // Remove any existing #flipbook and create a new one.
  var old = document.getElementById("flipbook");
  if (old) old.parentNode.removeChild(old);
  var el = document.createElement("div");
  el.id = "flipbook";
  stage.appendChild(el);

  pageFlip = new St.PageFlip(el, {
    width: size.w,
    height: size.h,
    size: "fixed",
    minWidth: 200, maxWidth: 2000,
    minHeight: 260, maxHeight: 2600,
    drawShadow: true,
    flippingTime: 700,
    usePortrait: false,
    startZIndex: 0,
    autoSize: false,
    maxShadowOpacity: 0.5,
    showCover: false,
    mobileScrollSupport: false,
  });

  var leaves = [buildIndexLeaf(size.w, size.h)];
  for (var i = 1; i <= TOTAL_PAGES; i++) leaves.push(buildPageLeaf(i, size.h));
  pageFlip.loadFromHTML(leaves);

  pageFlip.on("flip", function (e) { updateChrome(e.data); });
  pageFlip.on("changeState", function (e) {
    var busy = e.data === "flipping";
    var idx = pageFlip.getCurrentPageIndex();
    arrowPrev.disabled = busy || idx <= 0;
    arrowNext.disabled = busy || idx >= LAST_INDEX;
  });

  updateChrome(pageFlip.getCurrentPageIndex());
}

function updateChrome(idx) {
  var visiblePages = visiblePagesForIndex(idx);
  if (idx <= 0) {
    indicator.textContent = "Index · Page 1";
    hintEl.textContent = '💡 Click the chocolate bars to open the "Comparing Fractions" applet.';
    hintEl.style.display = "block";
  } else {
    indicator.textContent = visiblePages.length === 1
      ? "Page " + visiblePages[0] + " / " + TOTAL_PAGES
      : "Pages " + visiblePages[0] + "-" + visiblePages[1] + " / " + TOTAL_PAGES;
    if (visiblePages.indexOf(1) !== -1) {
      hintEl.textContent = '💡 Click the chocolate bars to open the "Comparing Fractions" applet.';
      hintEl.style.display = "block";
    } else {
      hintEl.style.display = "none";
    }
  }
  arrowPrev.disabled = idx <= 0;
  arrowNext.disabled = idx >= LAST_INDEX;
  syncPickerActive(idx);
}

function rebuild() {
  if (pageFlip) {
    try { pageFlip.destroy(); } catch (err) {}
    pageFlip = null;
  }
  createBook();
}

// ---- Applet modal ---------------------------------------------------
var modal      = document.getElementById("applet-modal");
var modalIframe  = document.getElementById("modal-iframe");
var modalClose   = document.getElementById("modal-close");
var modalFsBtn   = document.getElementById("modal-fullscreen");
var modalWrap    = document.getElementById("modal-frame-wrap");
var fittedRect   = null;

function setWrapRect(r) {
  modalWrap.style.top    = r.top    + 'px';
  modalWrap.style.left   = r.left   + 'px';
  modalWrap.style.width  = r.width  + 'px';
  modalWrap.style.height = r.height + 'px';
}

function expandedRect() {
  var pad = 32;
  var vw = window.innerWidth, vh = window.innerHeight;
  var w = Math.min(vw - pad*2, (vh - pad*2) * 16/9);
  var h = w * 9/16;
  return { top: (vh - h) / 2, left: (vw - w) / 2, width: w, height: h };
}

function openApplet(ap, origin) {
  var pageEl = origin && origin.closest ? origin.closest('.page') : null;
  if (pageEl) {
    var r = pageEl.getBoundingClientRect();
    var pad = 12;
    var maxW = r.width  - pad * 2;
    var maxH = r.height - pad * 2;
    var w = Math.min(maxW, maxH * 16/9);
    var h = w * 9/16;
    fittedRect = {
      left:   r.left + (r.width  - w) / 2,
      top:    r.top  + (r.height - h) / 2,
      width:  w,
      height: h,
    };
  } else {
    fittedRect = expandedRect();
  }

  modalWrap.style.transition = 'none';
  setWrapRect(fittedRect);
  modal.classList.remove('expanded');
  modal.classList.add('open');
  modalIframe.src = ap.src;
  modalClose.focus();
}

function closeApplet() {
  modal.classList.remove('expanded');
  modalWrap.style.transition = 'none';
  if (fittedRect) setWrapRect(fittedRect);
  setTimeout(function () {
    modal.classList.remove('open');
    modalIframe.src = '';
    fittedRect = null;
  }, 10);
}

function toggleExpand() {
  if (modal.classList.contains('expanded')) {
    modalWrap.style.transition = '';
    modal.classList.remove('expanded');
    if (fittedRect) setWrapRect(fittedRect);
  } else {
    modalWrap.style.transition = '';
    modal.classList.add('expanded');
    setWrapRect(expandedRect());
  }
}

modalClose.addEventListener('click', closeApplet);
modalFsBtn.addEventListener('click', toggleExpand);
document.addEventListener('keydown', function (e) {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') {
    if (modal.classList.contains('expanded')) toggleExpand();
    else closeApplet();
  }
});

// ---- Navigation -----------------------------------------------------
arrowNext.addEventListener("click", function () { pageFlip.flipNext(); });
arrowPrev.addEventListener("click", function () { pageFlip.flipPrev(); });
document.addEventListener("keydown", function (e) {
  if (modal.classList.contains("open")) return;
  if (!pageFlip) return;
  if (e.key === "ArrowLeft") pageFlip.flipPrev();
  else if (e.key === "ArrowRight") pageFlip.flipNext();
});

var rt;
window.addEventListener("resize", function () {
  clearTimeout(rt);
  rt = setTimeout(rebuild, 200);
});

window.addEventListener("load", createBook);
