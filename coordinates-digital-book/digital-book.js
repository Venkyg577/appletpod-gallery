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
    title: "Floor Plan Exploration",
    topic: "Marking Locations on a Grid",
    page: 3,
    src: "applets/applet1/index.html",
    thumb: "thumbs/applet1.png",
    label: "▶ Explore Floor Plan",
    hotspot: { top: 22.50, left: 14.03, width: 72.26, height: 28.95 },
  },
  {
    id: "applet2",
    title: "Coordinate Plane Basics",
    topic: "Understanding Axes and Coordinates",
    page: 5,
    src: "applets/applet2/index.html",
    thumb: "thumbs/applet2.png",
    label: "▶ Explore Coordinate Plane",
    hotspot: { top: 12.85, left: 20.21, width: 55.40, height: 34.70 },
  },
  {
    id: "applet3",
    title: "Distance Calculation",
    topic: "Using Coordinates to Find Distances",
    page: 7,
    src: "applets/applet3/index.html",
    thumb: "thumbs/applet3.png",
    label: "▶ Calculate Door Widths",
    hotspot: { top: 59.09, left: 14.03, width: 69.04, height: 29.32 },
  },
  {
    id: "applet4",
    title: "Quadrants & Plotting",
    topic: "Four Quadrants and Sign Conventions",
    page: 9,
    src: "applets/applet4/index.html",
    thumb: "thumbs/applet4.png",
    label: "▶ Explore Quadrants",
    hotspot: { top: 14.37, left: 21.07, width: 57.81, height: 37.81 },
  },
  {
    id: "applet5",
    title: "Distance Formula",
    topic: "Pythagoras and the Distance Formula",
    page: 11,
    src: "applets/applet5/index.html",
    thumb: "thumbs/applet5.png",
    label: "▶ Discover Distance Formula",
    hotspot: { top: 21.08, left: 12.62, width: 74.72, height: 31.03 },
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
  { pg: 1,  topic: "Orienting Yourself: The Use of Coordinates" },
  { pg: 2,  topic: "Introduction" },
  { pg: 3,  topic: "Settling In · Reiaan's Room",                 appletId: "applet1" },
  { pg: 4,  topic: "Floor Plan with Grid" },
  { pg: 5,  topic: "The 2-D Cartesian Coordinate System",         appletId: "applet2" },
  { pg: 6,  topic: "Axes, Origin, and Coordinates" },
  { pg: 7,  topic: "Coordinates in Practice",                     appletId: "applet3" },
  { pg: 8,  topic: "Measuring Distances" },
  { pg: 9,  topic: "The Cartesian Plane and Quadrants",           appletId: "applet4" },
  { pg: 10, topic: "Quadrant Numbering and Sign Conventions" },
  { pg: 11, topic: "Distance Between Two Points",                 appletId: "applet5" },
  { pg: 12, topic: "Distance Formula and Pythagoras" },
  { pg: 13, topic: "Think and Reflect" },
  { pg: 14, topic: "Think and Reflect (continued)" },
  { pg: 15, topic: "Summary and Practice" },
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
    '<h2>Chapter 1 &mdash; <span class="chapter-subject">Orienting Yourself: The Use of Coordinates</span></h2>' +
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
      navigate(function () { pageFlip.flip(pageToSpreadIndex(pg)); });
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

  var pageScale = pageH ? pageH / PAGE_DECOR_BASE_H : 1;
  (APPLETS_BY_PAGE[n] || []).forEach(function (ap) {
    var a = document.createElement("a");
    a.className = "hotspot";
    a.href = ap.src;
    a.title = ap.title;
    a.style.setProperty("--label", '"' + ap.label + '"');
    a.style.setProperty("--page-scale", String(pageScale));
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
      navigate(function () { pageFlip.flip(pageToSpreadIndex(n)); });
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

// Hint for the spread on screen: names the applet reachable from a visible
// page, so it stays correct as pages turn instead of being hardcoded.
function hintForPages(pages) {
  for (var i = 0; i < pages.length; i++) {
    var onPage = APPLETS_BY_PAGE[pages[i]];
    if (onPage && onPage.length) {
      return '💡 Tap the highlighted figure to open the "' + onPage[0].title + '" applet.';
    }
  }
  return null;
}

function updateChrome(idx) {
  var visiblePages = visiblePagesForIndex(idx);
  if (idx <= 0) {
    indicator.textContent = "Index · Page 1";
    hintEl.textContent = '💡 Tap an applet in the contents to launch it.';
    hintEl.style.display = "block";
  } else {
    indicator.textContent = visiblePages.length === 1
      ? "Page " + visiblePages[0] + " / " + TOTAL_PAGES
      : "Pages " + visiblePages[0] + "-" + visiblePages[1] + " / " + TOTAL_PAGES;
    var hint = hintForPages(visiblePages);
    if (hint) {
      hintEl.textContent = hint;
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

// Base modal height at which chrome dot sizes (14px, 10px gap etc.) are authored.
var MODAL_CHROME_BASE_H = 600;

function setWrapRect(r) {
  modalWrap.style.top    = r.top    + 'px';
  modalWrap.style.left   = r.left   + 'px';
  modalWrap.style.width  = r.width  + 'px';
  modalWrap.style.height = r.height + 'px';
  // Scale traffic-light dots to modal size.
  modalWrap.style.setProperty('--modal-scale', String(r.height / MODAL_CHROME_BASE_H));
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
// Turning a page while an applet is open closes the applet first, so the
// reader never leaves a running applet layered over a different spread.
// closeApplet() tears down on a 10ms timer, so the flip waits for that.
function navigate(flip) {
  if (!pageFlip) return;
  if (modal.classList.contains('open')) {
    closeApplet();
    setTimeout(flip, 20);
  } else {
    flip();
  }
}

arrowNext.addEventListener("click", function () {
  navigate(function () { pageFlip.flipNext(); });
});
arrowPrev.addEventListener("click", function () {
  navigate(function () { pageFlip.flipPrev(); });
});
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
