// Nam Bao Portfolio — trang Work (/work), bản v7 theo Figma Frame 28
// (node 1742:156, file NAM-BAO).
//
// Bố cục: cột trái là nút Independent / Agency, mục lục (số + TAGLINE
// của dự án, không phải tên), rồi số thứ tự, tên dự án và tag ở đáy.
// Cột phải là một CHỒNG ẢNH kiểu "Folders" (tham khảo
// madewithgsap.com/effects/tutorial045, xem demo rồi tự viết lại,
// không copy code): ảnh dự án đang xem nằm trước, 3 dự án kế tiếp
// nằm phía sau, nhỏ dần và nhô lên trên mép ảnh trước như tab của
// tập hồ sơ.
//
// Mỗi dự án là MỘT card DOM, tạo 1 lần khi tải trang. Card chỉ đổi
// vị trí theo khoảng cách tới dự án đang xem (rel = index - current):
//   rel < 0   : đã xem, rơi xuống dưới khung (bị viewer cắt, ẩn)
//   rel = 0   : ảnh trước (front), hover nghiêng theo chuột như cũ,
//               con trỏ Open / Coming Soon / tab mới và note trong ảnh
//   rel 1..3  : lớp phía sau, nhỏ dần và nhô lên (thông số Figma)
//   rel > 3   : dự trữ, nằm sau lớp 3, trong suốt
// Sang dự án tiếp = ảnh trước rơi xuống, cả chồng tiến lên 1 nấc;
// lùi lại = ảnh đã rơi bay ngược lên đứng trước chồng. Dừng ở 2 đầu
// (không lặp vòng), nên gần cuối danh sách chồng mỏng dần.
//
// Điều khiển: lăn chuột (1 cử chỉ = 1 dự án), phím mũi tên / Page,
// bấm tagline ở mục lục, bấm mép ảnh phía sau, kéo ảnh trước lên /
// xuống (chuột hoặc ngón tay). Bấm ảnh trước: Agency mở tab mới,
// Independent đã có case study thì phóng to sang trang case study.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (typeof window.gsap === "undefined") return;
  var gsap = window.gsap;

  /* ---------- Dữ liệu: Independent Works ----------
     tagline: dòng hiện ở mục lục. Vore, EGG:01, RMIT lấy đúng Figma;
     Tuổi Hồng 28 lấy từ subtitle case study; còn lại là BẢN NHÁP,
     Bảo duyệt rồi sửa thẳng ở đây. */
  var INDEPENDENT = [
    { id: "vore", title: "Vore", year: "2025", tag: "Food & beverage",
      tagline: "Progressive lens on Vietnamese Fine-dining",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION", "PRINT DESIGN"],
      image: "assets/work/vore.jpg", alt: "Ba poster của Vore treo trên tường", width: 1600, height: 900 },
    { id: "egg01", title: "EGG:01", year: "2025", tag: "Food & beverage",
      tagline: "Fictional luxury egg brand",
      caseStudy: "/work/egg-01",
      hero: { src: "/assets/case-study/egg-01/01-hero.jpg", width: 1920, height: 1483 },
      tags: ["BRAND IDENTITY", "PACKAGING DESIGN", "PRODUCT DESIGN", "ART DIRECTION"],
      image: "assets/work/egg01.jpg", alt: "Hộp bạc EGG:01 cạnh chai thủy tinh gân sóng có lòng đỏ cam", width: 1400, height: 1356 },
    { id: "rmit25", title: "RMIT 25th Anniversary Logo", year: "2025", tag: "Education",
      tagline: "Not another logo",
      tags: ["LOGO DESIGN", "IDENTITY DESIGN", "EVENT DESIGN"],
      image: "assets/work/rmit25.jpg", alt: "Billboard 25 Years Of Progress trên mặt tiền gỗ", width: 1920, height: 1080 },
    { id: "dothanh", title: "Việt Cổ Truyện", year: "2026", tag: "Art",
      tagline: "Vietnamese folk tales, redrawn for the web",
      tags: ["BRAND IDENTITY", "ILLUSTRATION", "WEB DESIGN", "ART DIRECTION"],
      image: "assets/work/dothanh.jpg", alt: "Laptop chạy website Phố Việt Cổ Truyện", width: 1393, height: 853 },
    { id: "tad", title: "Tad.atelier", year: "2025", tag: "Architecture",
      tagline: "A quiet mark for an architecture studio",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION"],
      image: "assets/work/tad.jpg", alt: "Board tổng hợp các dự án của Tad.atelier", width: 1400, height: 989 },
    { id: "vibe", title: "VIBE Expo", year: "2026", tag: "Architecture",
      tagline: "An expo you can walk through",
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "EXHIBITION DESIGN", "STAGE DESIGN"],
      image: "assets/work/vibe.jpg", alt: "Render 3D sảnh expo cam của VIBE", width: 1000, height: 558 },
    { id: "th28", title: "Tuổi Hồng 28", year: "2024", tag: "Entertainment",
      tagline: "Not an ordinary festival",
      caseStudy: "/work/tuoi-hong-28",
      hero: { src: "/assets/case-study/tuoi-hong-28/01-hero.jpg", width: 1920, height: 1280 },
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "POSTER DESIGN", "ART DIRECTION"],
      image: "assets/work/th28.jpg", alt: "Bốn poster Tuổi Hồng 28 năm 2024 trên nền sọc hồng", width: 1600, height: 1067 }
  ];

  /* ---------- Dữ liệu: Agency Works (Collective Design Agency) ----------
     Tagline rút gọn từ dòng mô tả trên collectivedesign.agency/work
     (CDA Independence, We Create Content, Vietnam Is Awesome, AWUF);
     Dế STEM, WEWELL, CyPeace chưa có mô tả trên trang agency nên là
     BẢN NHÁP. Bấm ảnh trước mở trang dự án ở tab mới. */
  var AGENCY_BASE = "https://collectivedesign.agency/work/";
  var AGENCY = [
    { id: "a-cda-independence", title: "CDA Independence Typeface", year: "2026", tag: "Public Sector",
      tagline: "From concrete and stone to living language",
      tags: ["TYPEFACE DESIGN"],
      image: "assets/work/agency-cda-independence.jpg", alt: "Chữ CDA Independence trên nền Dinh Độc Lập", width: 1600, height: 900,
      url: AGENCY_BASE + "cda-independence" },
    { id: "a-vietnam-is-awesome", title: "Vietnam Is Awesome", year: "2025", tag: "Travel & Tourism",
      tagline: "Redefining how people discover Vietnam",
      tags: ["VISUAL IDENTITY", "BRAND CŌMPASS™"],
      image: "assets/work/agency-vietnam-is-awesome.jpg", alt: "Poster Vietnam Is Awesome trên vỉa hè", width: 1168, height: 625,
      url: AGENCY_BASE + "vietnam-is-awesome" },
    { id: "a-de-stem", title: "Dế STEM Foundation", year: "2026", tag: "Education",
      tagline: "Making STEM feel like play",
      tags: ["BRANDING", "WEB DESIGN & DEVELOPMENT"],
      image: "assets/work/agency-de-stem-foundation.jpg", alt: "Bộ ấn phẩm mạng xã hội của Dế STEM Foundation", width: 1600, height: 1018,
      url: AGENCY_BASE + "de-stem-foundation" },
    { id: "a-we-create-content", title: "We Create Content", year: "2022", tag: "Creative & Media",
      tagline: "Redefining “Made in Vietnam”",
      tags: ["BRANDING", "VISUAL IDENTITY", "TONE OF VOICE & MESSAGING", "WEB DESIGN & DEVELOPMENT"],
      image: "assets/work/agency-we-create-content.jpg", alt: "Billboard We Create Content trên tường", width: 1600, height: 890,
      url: AGENCY_BASE + "we-create-content" },
    { id: "a-awuf-2025", title: "AWUF 2025", year: "2024", tag: "Sustainability & Non-Profit",
      tagline: "From forum to future",
      tags: ["VISUAL IDENTITY", "EVENT, INSTALLATION & SPATIAL DESIGN"],
      image: "assets/work/agency-awuf-2025.jpg", alt: "Cờ phướn URBAN WATER AFNR của diễn đàn AWUF 2025", width: 1280, height: 768,
      url: AGENCY_BASE + "awuf-2025" },
    { id: "a-we-well", title: "WEWELL", year: "2025", tag: "Retail & Consumer Brands",
      tagline: "Wellness you can see on the shelf",
      tags: ["PACKAGING DESIGN", "MOTION, ILLUSTRATION & 3D"],
      image: "assets/work/agency-we-well.jpg", alt: "Lon nước WEWELL nhiều vị", width: 1600, height: 959,
      url: AGENCY_BASE + "we-well" },
    { id: "a-cypeace", title: "CyPeace", year: "2022", tag: "Technology & AI",
      tagline: "Cybersecurity with a calm face",
      tags: ["VISUAL IDENTITY", "WEB DESIGN & DEVELOPMENT"],
      image: "assets/work/agency-cypeace.jpg", alt: "Logo CyPeace trên nền xanh bạc hà", width: 1600, height: 900,
      url: AGENCY_BASE + "cypeace" }
  ];

  var COLLECTIONS = { independent: INDEPENDENT, agency: AGENCY };
  var ALL = INDEPENDENT.concat(AGENCY);

  /* ---------- Thông số chồng ảnh (đo từ Figma, khung ảnh trước 910px) ----------
     Lớp 1: rộng 864.8 (95.0%), nhô lên 27px; lớp 2: 791.3 (86.95%),
     nhô 45.4px; lớp 3: 710.3 (78.06%), nhô 57.4px. Các lớp căn giữa
     theo chiều ngang, bo góc 5.5px (ảnh trước bo 10px). */
  var LAYER_SCALE = [1, 0.9504, 0.8695, 0.7806, 0.70];
  var LAYER_RISE = [0, 27, 45.37, 57.37, 66];
  var LAYERS = 3;

  var DUR = reduceMotion ? 0 : 0.9;
  var EASE = "power3.inOut";
  var STAGGER = 0.07;

  /* ---------- DOM ---------- */
  var viewer = document.getElementById("wn-viewer");
  var countEl = document.getElementById("wn-count");
  var titleEl = document.getElementById("wn-title");
  var tagsEl = document.getElementById("wn-tags");
  var tocEl = document.getElementById("wn-toc");
  var switchEl = document.getElementById("wn-switch");
  var mediaSlot = document.getElementById("wn-media");
  var layer = document.getElementById("wn-cards");
  var cursorEl = document.querySelector(".cursor");
  if (!viewer || !layer || !mediaSlot || !tocEl) return;

  /* ---------- Trạng thái ---------- */
  var activeColl = /agency/i.test(location.hash) ? "agency" : "independent";
  var list = COLLECTIONS[activeColl].slice();
  var current = 0;
  var busyUntil = 0;
  var pendingStep = 0;
  var infoTl = null;
  var moveTimer = null;
  var cards = {};
  var drag = null;
  var suppressClick = false;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function now() { return performance.now(); }
  function isBusy() { return now() < busyUntil; }
  function isPinnedLayout() { return window.innerWidth > 900; }

  /* ---------- Tạo card (1 lần cho cả 14 dự án) ---------- */
  ALL.forEach(function (p) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "wn-card";
    el.setAttribute("data-id", p.id);
    el.innerHTML =
      '<span class="wn-card-inner">' +
        '<img src="' + p.image + '" alt="" decoding="async" draggable="false">' +
        '<span class="wn-media-hint">' + (p.url ? "Open in new tab" : p.caseStudy ? "Open case study" : "Case study coming soon") + "</span>" +
      "</span>";
    layer.appendChild(el);
    var inner = el.firstChild;
    var c = { el: el, inner: inner, img: inner.querySelector("img"), p: p, kind: "out", tilt: null };
    if (finePointer && !reduceMotion) {
      gsap.set(inner, { transformPerspective: 1100 });
      c.tilt = {
        rx: gsap.quickTo(inner, "rotationX", { duration: 0.5, ease: "power2.out" }),
        ry: gsap.quickTo(inner, "rotationY", { duration: 0.5, ease: "power2.out" }),
        y: gsap.quickTo(inner, "y", { duration: 0.5, ease: "power2.out" })
      };
    }
    gsap.set(el, { opacity: 0 });
    el.style.visibility = "hidden";
    cards[p.id] = c;
  });

  /* ---------- Đo khung ảnh trước (tọa độ trong viewer) ---------- */
  var R = null;
  function measure() {
    var v = viewer.getBoundingClientRect();
    var r = mediaSlot.getBoundingClientRect();
    R = { x: r.left - v.left, y: r.top - v.top, w: r.width, h: r.height, vh: viewer.clientHeight };
  }

  // Trạng thái đích theo rel. Card luôn đúng cỡ khung ảnh trước, chỉ
  // đổi scale (gốc ở mép trên giữa) và y, nên ảnh không bị crop lại.
  function stateFor(rel) {
    var k = R.w / 910;
    var base = { x: R.x, width: R.w, height: R.h, rotation: 0, transformOrigin: "50% 0%" };
    if (rel === 0) {
      return assign(base, { kind: "front", y: R.y, scale: 1, opacity: 1, z: 100, r: 10 });
    }
    if (rel < 0) {
      // Rơi xuống quá đáy viewer (bị cắt), nghiêng nhẹ như tờ giấy rơi.
      return assign(base, { kind: "past", y: R.vh + 40, scale: 1, opacity: 1, rotation: rel % 2 ? 2.5 : -2.5,
        z: 110 + rel, r: 10 });
    }
    var n = Math.min(rel, LAYERS + 1);
    var s = LAYER_SCALE[n];
    return assign(base, { kind: rel <= LAYERS ? "layer" : "reserve", y: R.y - LAYER_RISE[n] * k,
      scale: s, opacity: rel <= LAYERS ? 1 : 0, z: 100 - Math.min(rel, 20), r: 5.5 / s });
  }

  function assign(a, b) { for (var key in b) a[key] = b[key]; return a; }

  function tweenVars(s, extra) {
    var o = { x: s.x, y: s.y, width: s.width, height: s.height, scale: s.scale, rotation: s.rotation,
      opacity: s.opacity, transformOrigin: s.transformOrigin, "--r": s.r + "px" };
    return extra ? assign(o, extra) : o;
  }

  function applyKind(c, kind) {
    c.kind = kind;
    c.el.classList.toggle("is-big", kind === "front");
    c.el.classList.toggle("is-layer", kind === "layer");
    var interactive = kind === "front" || kind === "layer";
    c.el.style.pointerEvents = interactive ? "auto" : "none";
    c.el.tabIndex = kind === "front" ? 0 : -1;
    c.el.setAttribute("aria-hidden", kind === "front" ? "false" : "true");
    c.el.setAttribute("aria-label", kind !== "front" ? "Tới dự án: " + c.p.title
      : (c.p.url ? "Mở dự án ở tab mới: " + c.p.title
        : c.p.caseStudy ? "Mở case study: " + c.p.title
        : "Case study coming soon: " + c.p.title));
    c.el.style.visibility = (kind === "out" || kind === "past") ? "hidden" : "";
  }

  function resetTilt(c) {
    if (c.tilt) { c.tilt.rx(0); c.tilt.ry(0); c.tilt.y(0); }
  }

  /* ---------- Con trỏ ---------- */
  function setCursor(mode) {
    if (!cursorEl) return;
    cursorEl.classList.toggle("cursor--open", mode === "open");
    cursorEl.classList.toggle("cursor--soon", mode === "soon");
    cursorEl.classList.toggle("cursor--newtab", mode === "newtab");
  }
  function cursorFor(p) {
    if (!p) return null;
    if (p.url) return "newtab";
    if (p.caseStudy) return "open";
    return "soon";
  }

  /* ---------- Mở dự án ---------- */
  function openProject(p) {
    if (!p) return;
    if (p.url) { window.open(p.url, "_blank", "noopener"); return; }
    if (p.caseStudy) expandToCaseStudy(p);
  }

  // Ảnh trước phóng to ra đúng khung hero ở trang case study (full
  // width, cao theo tỉ lệ, căn trên), overlay 2 lớp: ảnh card hiện
  // ngay + ảnh hero thật crossfade lên khi tải xong. Chỉ chuyển trang
  // khi cả hiệu ứng xong VÀ ảnh hero đã sẵn, nên trang đích trùng
  // khít, không nháy (xem css/case-study.css, View Transition).
  var expanding = false;
  function expandToCaseStudy(p) {
    if (expanding) return;
    expanding = true;
    var c = cards[p.id];
    var img = c && c.img;
    var rect = img ? img.getBoundingClientRect() : null;
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var vh = window.innerHeight;
    var hw = (p.hero && p.hero.width) || 1920;
    var hh = (p.hero && p.hero.height) || 1080;
    var target = { x: 0, y: 0, w: vw, h: Math.round(vw * hh / hw) };
    var heroSrc = (p.hero && p.hero.src) || p.image;

    var overlay = document.createElement("div");
    overlay.className = "wn-expand";
    overlay.setAttribute("aria-hidden", "true");
    var low = new Image();
    low.alt = "";
    low.src = img ? (img.currentSrc || img.src) : p.image;
    var high = new Image();
    high.alt = "";
    high.className = "wn-expand-hi";
    overlay.appendChild(low);
    overlay.appendChild(high);
    document.body.appendChild(overlay);

    var heroShown = new Promise(function (resolve) {
      var done = false;
      function fin() { if (!done) { done = true; resolve(); } }
      high.onload = function () {
        var d = high.decode ? high.decode() : Promise.resolve();
        d.then(function () {
          gsap.to(high, { opacity: 1, duration: reduceMotion ? 0 : 0.3, ease: "power1.out", onComplete: fin });
        }, fin);
      };
      high.onerror = fin;
      high.src = heroSrc;
      setTimeout(fin, 8000);
    });

    var start = rect || { left: vw / 2 - 455, top: vh / 2 - 270, width: 910, height: 540 };
    var r0 = c ? getComputedStyle(c.inner).borderRadius : "0px";
    gsap.set(overlay, { left: start.left, top: start.top, width: start.width, height: start.height, borderRadius: r0 });
    if (cursorEl) gsap.to(cursorEl, { opacity: 0, duration: 0.2 });

    var expanded = new Promise(function (resolve) {
      gsap.to(overlay, { left: target.x, top: target.y, width: target.w, height: target.h, borderRadius: 0,
        duration: reduceMotion ? 0 : 0.75, ease: "expo.inOut", onComplete: resolve });
    });

    try { sessionStorage.setItem("cs-enter", "1"); } catch (e) {}

    Promise.all([expanded, heroShown]).then(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { location.href = p.caseStudy; });
      });
    });
  }

  // Bấm Back: trang trả về từ bfcache với overlay còn phủ màn hình.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    var ov = document.querySelectorAll(".wn-expand");
    for (var i = 0; i < ov.length; i++) ov[i].remove();
    expanding = false;
    if (cursorEl) { gsap.set(cursorEl, { clearProps: "opacity" }); cursorEl.style.opacity = ""; }
  });

  /* ---------- Đặt tất cả card không animation (khởi tạo, resize) ---------- */
  function placeAll() {
    measure();
    ALL.forEach(function (p) {
      var c = cards[p.id];
      var idx = list.indexOf(p);
      if (idx < 0) { gsap.set(c.el, { opacity: 0 }); applyKind(c, "out"); return; }
      var s = stateFor(idx - current);
      gsap.set(c.el, tweenVars(s, { zIndex: s.z }));
      applyKind(c, s.kind);
    });
  }

  /* ---------- Thông tin: số thứ tự, tên dự án, tag, mục lục ---------- */
  function renderInfo() {
    var p = list[current];
    if (!p) return;
    titleEl.textContent = p.title;
    tagsEl.innerHTML = p.tags.map(function (t) { return '<li class="wn-tag">' + t + "</li>"; }).join("");
    countEl.textContent = pad(current + 1) + "/" + pad(list.length);
  }

  function animateInfo(delay, dir) {
    var els = [countEl, titleEl, tagsEl];
    if (infoTl) infoTl.kill();
    markActive();
    if (reduceMotion) { renderInfo(); return; }
    infoTl = gsap.timeline({ delay: delay || 0 });
    infoTl.to(els, { y: dir > 0 ? -18 : 18, opacity: 0, duration: 0.25, ease: "power2.in", stagger: 0.03 }, 0);
    infoTl.add(renderInfo, 0.3);
    infoTl.fromTo(els, { y: dir > 0 ? 22 : -22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.05, clearProps: "transform,opacity" }, 0.32);
  }

  function renderToc() {
    tocEl.innerHTML = list.map(function (p, i) {
      return '<li><button type="button" class="wn-toc-item" data-index="' + i + '">' +
        '<span class="wn-toc-num">' + pad(i + 1) + "</span>" +
        '<span class="wn-toc-line">' + p.tagline + "</span></button></li>";
    }).join("");
    markActive();
  }

  function markActive() {
    tocEl.querySelectorAll(".wn-toc-item").forEach(function (btn) {
      var on = parseInt(btn.getAttribute("data-index"), 10) === current;
      btn.classList.toggle("is-active", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }

  tocEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".wn-toc-item");
    if (!btn) return;
    var i = parseInt(btn.getAttribute("data-index"), 10);
    if (isNaN(i)) return;
    pendingStep = 0;
    goTo(i);
  });

  /* ---------- Chuyển dự án ----------
     Mọi card đi thẳng từ trạng thái cũ sang trạng thái mới. Card rơi
     xuống / bay lên so le theo thứ tự (STAGGER) nên nhảy nhiều bước
     (bấm mục lục) thấy từng tờ rơi lần lượt như lật tập hồ sơ. */
  function lockFor(ms) {
    layer.classList.add("is-moving");
    busyUntil = now() + ms;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(afterMove, ms + 20);
  }

  function afterMove() {
    layer.classList.remove("is-moving");
    if (pendingStep) { var d = pendingStep; pendingStep = 0; step(d); }
  }

  function goTo(index, opts) {
    index = Math.max(0, Math.min(index, list.length - 1));
    if (index === current) return false;
    var dir = index > current ? 1 : -1;
    var prev = current;
    current = index;
    measure();
    animateInfo(0.1, dir);

    // Nhảy xa (vd 01 -> 07, 07 -> 01): giữ đúng thứ tự trong chồng suốt
    // lúc chuyển, tờ đứng trước LUÔN nằm trên tờ đứng sau:
    // - Tiến: các tờ đang thấy rơi lần lượt từ tờ trước ra sau, z-index
    //   giảm dần theo thứ tự (trước đây tờ sâu lại có z cao hơn nên vừa
    //   bắt đầu đã đè lên tờ trước).
    // - Lùi: ngược lại với lúc rơi, tờ sâu nhất bay lên trước, tờ trước
    //   bay lên sau cùng và nằm trên cùng.
    // - Card ẩn cả trước lẫn sau (đã rơi / dự trữ) thì đặt thẳng, không
    //   bay qua màn hình rồi mờ đi.
    var risers = dir < 0 ? Math.min(prev - current - 1, LAYERS) : 0;   // rel lớn nhất của tờ bay lên
    var longest = DUR;
    list.forEach(function (p, i) {
      var c = cards[p.id];
      var from = c.kind;
      var s = stateFor(i - current);
      resetTilt(c);
      gsap.killTweensOf(c.el);

      var hiddenFrom = from === "past" || from === "reserve" || from === "out";
      var hiddenTo = s.kind === "past" || s.kind === "reserve";
      if (hiddenFrom && hiddenTo) {
        gsap.set(c.el, tweenVars(s, { zIndex: s.z }));
        applyKind(c, s.kind);
        return;
      }

      c.el.style.visibility = "";
      var delay = 0;
      var dur = DUR;
      var ease = EASE;

      if (dir > 0) {
        if (s.kind === "past") {
          // Rơi xuống: tờ trước rơi trước, các tờ sau rơi theo, z giữ thứ tự chồng.
          // Tờ đang ở lớp sau thì rơi luôn ở cỡ hiện tại, không phình to ra.
          var order = i - prev;   // 0 = tờ đang đứng trước
          delay = order * STAGGER;
          dur = DUR * 0.85;
          ease = "power3.in";
          s.scale = gsap.getProperty(c.el, "scale");
          s.r = parseFloat(c.el.style.getPropertyValue("--r")) || s.r;
          gsap.set(c.el, { zIndex: 140 - order });
        } else {
          // Cả chồng tiến lên sau khi tờ trước bắt đầu rơi, nằm dưới các tờ đang rơi.
          delay = Math.min(index - prev, 3) * STAGGER * 0.6 + 0.08;
          gsap.set(c.el, { zIndex: s.z });
          if (from === "reserve" || from === "out") gsap.set(c.el, tweenVars(stateFor(LAYERS + 1)));
        }
      } else {
        if (from === "past") {
          // Bay lên từ dưới, ngược thứ tự lúc rơi: tờ sâu lên trước, tờ trước lên sau cùng.
          var rel = i - current;
          delay = (risers - rel) * STAGGER;
          ease = "power3.out";
          gsap.set(c.el, { zIndex: 140 - rel, rotation: (i % 2 ? 2.5 : -2.5) });
        } else {
          // Chồng cũ lùi về sau, nằm dưới các tờ bay lên; lớp sâu nhất mờ đi.
          gsap.set(c.el, { zIndex: s.z });
        }
      }

      if (opts && opts.dragged === c) { delay = 0; ease = "power3.out"; }
      longest = Math.max(longest, delay + dur);
      gsap.to(c.el, tweenVars(s, {
        duration: dur, ease: ease, delay: delay, overwrite: "auto",
        onComplete: function () {
          gsap.set(c.el, { zIndex: s.z });
          if (s.kind === "past") c.el.style.visibility = "hidden";
        }
      }));
      applyKind(c, s.kind);
      if (s.kind === "past") c.el.style.visibility = "";   // vẫn thấy lúc đang rơi
    });

    lockFor(longest * 1000 + 40);
    return true;
  }

  function step(dir) {
    var target = current + dir;
    if (target < 0 || target > list.length - 1) return;
    goTo(target);
  }

  /* ---------- Đổi trang: Independent Works / Agency Works ----------
     Chồng cũ: tờ trước rơi xuống, các lớp sau thu nhỏ và mờ đi.
     Chồng mới: các lớp sau hiện dần từ chỗ dự trữ, tờ trước bay lên
     từ dưới đáy, như rút một tập hồ sơ khác ra. */
  function renderSwitch() {
    if (!switchEl) return;
    switchEl.querySelectorAll("[data-coll]").forEach(function (btn) {
      var on = btn.getAttribute("data-coll") === activeColl;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function switchCollection(name) {
    if (name === activeColl || !COLLECTIONS[name]) return;
    var oldList = list;
    activeColl = name;
    renderSwitch();
    try { history.replaceState(null, "", name === "agency" ? "#agency" : location.pathname + location.search); } catch (e) {}

    pendingStep = 0;
    measure();
    var oldCurrent = current;
    list = COLLECTIONS[name].slice();
    current = 0;

    // Chồng cũ ra.
    oldList.forEach(function (p, i) {
      var c = cards[p.id];
      var rel = i - oldCurrent;
      gsap.killTweensOf(c.el);
      resetTilt(c);
      c.el.style.pointerEvents = "none";
      if (rel === 0) {
        gsap.set(c.el, { zIndex: 140 });
        gsap.to(c.el, { y: R.vh + 40, rotation: -2.5, duration: reduceMotion ? 0 : 0.7, ease: "power3.in",
          onComplete: function () { gsap.set(c.el, { opacity: 0 }); applyKind(c, "out"); } });
      } else if (rel > 0 && rel <= LAYERS) {
        var r = stateFor(LAYERS + 1);
        gsap.to(c.el, { y: r.y, scale: r.scale, opacity: 0, duration: reduceMotion ? 0 : 0.5, ease: "power2.in",
          delay: (LAYERS - rel) * 0.04, onComplete: function () { applyKind(c, "out"); } });
      } else {
        gsap.set(c.el, { opacity: 0 });
        applyKind(c, "out");
      }
    });

    // Chồng mới vào.
    var IN_AT = reduceMotion ? 0 : 0.35;
    list.forEach(function (p, i) {
      var c = cards[p.id];
      var s = stateFor(i);
      c.el.style.visibility = "";
      if (s.kind === "front") {
        gsap.set(c.el, tweenVars(stateFor(-1), { zIndex: 130, rotation: 2.5 }));
        gsap.to(c.el, tweenVars(s, { duration: DUR, ease: "power3.out", delay: IN_AT + 0.15,
          onComplete: function () { gsap.set(c.el, { zIndex: s.z }); } }));
      } else {
        gsap.set(c.el, tweenVars(stateFor(LAYERS + 1), { zIndex: s.z, opacity: 0 }));
        gsap.to(c.el, tweenVars(s, { duration: DUR * 0.8, ease: "power3.out", delay: IN_AT + (LAYERS - Math.min(i, LAYERS)) * 0.06 }));
      }
      applyKind(c, s.kind);
    });

    if (reduceMotion) { renderToc(); renderInfo(); }
    else {
      gsap.timeline()
        .to(tocEl, { opacity: 0, y: -10, duration: 0.25, ease: "power2.in" })
        .add(renderToc)
        .fromTo(tocEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "transform,opacity" });
      animateInfo(IN_AT, 1);
    }
    lockFor((IN_AT + 0.15 + DUR) * 1000);
  }

  if (switchEl) {
    switchEl.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-coll]");
      if (btn) switchCollection(btn.getAttribute("data-coll"));
    });
  }

  /* ---------- Bấm card: tờ trước mở dự án, mép tờ sau thì tới dự án đó ---------- */
  layer.addEventListener("click", function (event) {
    if (suppressClick) { suppressClick = false; event.preventDefault(); return; }
    var el = event.target.closest(".wn-card");
    if (!el) return;
    var c = cards[el.getAttribute("data-id")];
    if (!c) return;
    if (c.kind === "front") { openProject(c.p); return; }
    var idx = list.indexOf(c.p);
    if (idx >= 0) { pendingStep = 0; goTo(idx); }
  });

  /* ---------- Tên dự án lớn: bấm mở như bấm ảnh trước ---------- */
  titleEl.addEventListener("click", function () { openProject(list[current]); });
  if (finePointer) {
    titleEl.addEventListener("mouseenter", function () { setCursor(cursorFor(list[current])); });
    titleEl.addEventListener("mouseleave", function () { setCursor(null); });
  }

  /* ---------- Hover ảnh trước: nghiêng theo chuột (giữ như bản cũ) ---------- */
  if (finePointer && !reduceMotion) {
    ALL.forEach(function (p) {
      var c = cards[p.id];
      c.el.addEventListener("mousemove", function (event) {
        layer.classList.remove("no-hover");
        if (c.kind !== "front" || (drag && drag.active)) return;
        setCursor(cursorFor(c.p));
        if (layer.classList.contains("is-moving")) return;
        var r = c.el.getBoundingClientRect();
        var px = (event.clientX - r.left) / r.width - 0.5;
        var py = (event.clientY - r.top) / r.height - 0.5;
        c.tilt.ry(px * 10);
        c.tilt.rx(-py * 10);
        c.tilt.y(-6);
      });
      c.el.addEventListener("mouseleave", function () {
        resetTilt(c);
        setCursor(null);
      });
    });
  }

  /* ---------- Kéo ảnh trước ----------
     Màn rộng: kéo xuống quá 90px = sang dự án tiếp (tờ rơi luôn từ
     chỗ thả), kéo lên = lùi lại. Màn hẹp (trang cuộn dọc): vuốt
     ngang, trái = tiếp, phải = lùi. Dưới 6px vẫn là bấm. */
  layer.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    var el = e.target.closest(".wn-card");
    if (!el) return;
    var c = cards[el.getAttribute("data-id")];
    if (!c || c.kind !== "front" || isBusy()) return;
    measure();
    drag = { c: c, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: gsap.getProperty(el, "x"),
      oy: gsap.getProperty(el, "y"), active: false, vertical: isPinnedLayout() };
  });

  window.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.active) {
      if (Math.hypot(dx, dy) < 6) return;
      if (!drag.vertical && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }  // để trang cuộn
      drag.active = true;
      try { drag.c.el.setPointerCapture(e.pointerId); } catch (err) {}
      layer.classList.add("is-dragging");
      resetTilt(drag.c);
      setCursor(null);
      gsap.set(drag.c.el, { zIndex: 140 });
    }
    e.preventDefault();
    if (drag.vertical) {
      // Kéo lên bị hãm (chỉ đi 35%) vì tờ trước không thể chui vào chồng.
      var y = dy > 0 ? dy : dy * 0.35;
      gsap.to(drag.c.el, { y: drag.oy + y, rotation: Math.max(-4, Math.min(4, dx * 0.02)), duration: 0.25,
        ease: "power2.out", overwrite: "auto" });
    } else {
      gsap.to(drag.c.el, { x: drag.ox + dx, rotation: dx * 0.02, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    }
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    if (!d.active) return;
    layer.classList.remove("is-dragging");
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 50);
    var dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    var amount = d.vertical ? dy : -dx;
    pendingStep = 0;
    if (amount > 90 && current < list.length - 1) { goTo(current + 1, { dragged: d.c }); return; }
    if (amount < -60 && current > 0) {
      var s0 = stateFor(0);
      gsap.to(d.c.el, tweenVars(s0, { duration: 0.5, ease: "power3.out" }));
      goTo(current - 1);
      return;
    }
    var s = stateFor(0);
    gsap.to(d.c.el, tweenVars(s, { duration: 0.6, ease: "power3.out", overwrite: "auto",
      onComplete: function () { gsap.set(d.c.el, { zIndex: s.z }); } }));
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  /* ---------- Lăn chuột: 1 cử chỉ = 1 dự án (màn rộng) ---------- */
  var WHEEL_GAP = 200;
  var lastWheel = 0;
  var gestureUsed = false;
  var wheelAccum = 0;
  window.addEventListener("wheel", function (event) {
    if (!isPinnedLayout()) return;
    if (document.body.classList.contains("contact-open")) return;
    event.preventDefault();
    if (drag && drag.active) return;
    var dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16;
    else if (event.deltaMode === 2) dy *= window.innerHeight;
    var t = now();
    if (t - lastWheel > WHEEL_GAP) { gestureUsed = false; wheelAccum = 0; }
    lastWheel = t;
    if (gestureUsed) return;
    wheelAccum += dy;
    if (Math.abs(wheelAccum) < 10) return;
    gestureUsed = true;
    var dir = wheelAccum > 0 ? 1 : -1;
    if (isBusy()) { pendingStep = dir; return; }
    step(dir);
  }, { passive: false });

  /* ---------- Cảm ứng màn rộng (iPad ngang): vuốt dọc ngoài ảnh = 1 dự án ---------- */
  var touchY = null, touchX = null, touchDone = false;
  viewer.addEventListener("touchstart", function (e) {
    touchY = null;
    if (!isPinnedLayout() || e.touches.length !== 1) return;
    if (e.target.closest(".wn-card.is-big")) return;
    touchY = e.touches[0].clientY; touchX = e.touches[0].clientX; touchDone = false;
  }, { passive: true });
  viewer.addEventListener("touchmove", function (e) {
    if (touchY === null || !isPinnedLayout()) return;
    var dy = touchY - e.touches[0].clientY;
    var dx = touchX - e.touches[0].clientX;
    if (Math.abs(dy) > Math.abs(dx)) e.preventDefault();
    if (touchDone || Math.abs(dy) < 40 || Math.abs(dy) < Math.abs(dx)) return;
    touchDone = true;
    var dir = dy > 0 ? 1 : -1;
    if (isBusy()) { pendingStep = dir; return; }
    step(dir);
  }, { passive: false });
  viewer.addEventListener("touchend", function () { touchY = null; }, { passive: true });

  /* ---------- Bàn phím ---------- */
  document.addEventListener("keydown", function (event) {
    if (!isPinnedLayout()) return;
    var dir = 0;
    if (event.key === "ArrowDown" || event.key === "PageDown") dir = 1;
    if (event.key === "ArrowUp" || event.key === "PageUp") dir = -1;
    if (!dir) return;
    event.preventDefault();
    if (isBusy()) { pendingStep = dir; return; }
    step(dir);
  });

  /* ---------- Resize: đặt lại vị trí, không animation ---------- */
  var resizeRaf = 0;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      ALL.forEach(function (p) { gsap.killTweensOf(cards[p.id].el); });
      placeAll();
    });
  });

  /* ---------- Khởi tạo ---------- */
  renderSwitch();
  renderToc();
  renderInfo();
  placeAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAll);
  window.addEventListener("load", placeAll);
  requestAnimationFrame(function () { viewer.classList.add("is-ready"); });
})();
