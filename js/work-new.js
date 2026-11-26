// Nam Bao Portfolio — trang Work MỚI, BẢN STAGING (work-new.html)
// Bản v5: 2 trang con (Independent Works / Agency Works) dùng chung
// một bộ card cố định.
//
// Ý chính: mỗi dự án (7 independent + 7 agency) là MỘT card DOM duy
// nhất, tạo 1 lần khi tải trang, không bao giờ bị xóa/vẽ lại bằng
// innerHTML. Card chỉ đổi VỊ TRÍ theo khoảng cách tới dự án đang
// xem (rel):
//   rel < 0  : deck ảnh lớn đã xem, xếp chồng dưới ảnh lớn
//              (nhỏ dần 4%, lệch xuống 16px, mờ dần) như radiance.family
//   rel = 0  : ảnh lớn bên phải
//   rel 1..3 : thumbnail front / mid / back
//   rel > 3  : nằm sẵn ngay sau thumbnail back (bị che), nên stack
//              luôn đủ từ đầu, không bao giờ tụt 2 rồi thêm 3
//   ngoài danh sách đang xem (khác filter / khác trang): "out" (ẩn)
// Chuyển dự án = GSAP đưa mọi card từ trạng thái cũ sang trạng thái
// mới, nên tiến/lùi/kéo thả đều mượt, không clone, không spawn.
//
// Cuộn: 1 cử chỉ lăn (kể cả quán tính trackpad) = đúng 1 dự án.
// iPad ngang: vuốt lên/xuống = 1 dự án. Kéo thả: kéo thumbnail thả
// vào ảnh lớn để mở; kéo ảnh lớn về phía stack để lùi lại.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (typeof window.gsap === "undefined") return;
  var gsap = window.gsap;

  /* ---------- Dữ liệu: Independent Works (thứ tự đã chốt) ----------
     Meta hiển thị "INDUSTRY ——— NĂM". */
  var INDEPENDENT = [
    { id: "vore", title: "Vore", year: "2025", tag: "Food & beverage",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION", "PRINT DESIGN"],
      image: "assets/work/vore.jpg", alt: "Ba poster của Vore treo trên tường", width: 1600, height: 900 },
    { id: "egg01", title: "EGG:01", year: "2025", tag: "Food & beverage",
      caseStudy: "/work/egg-01",
      hero: { src: "assets/case-study/egg-01/01-hero.jpg", width: 1920, height: 1860 },
      tags: ["BRAND IDENTITY", "PACKAGING DESIGN", "PRODUCT DESIGN", "ART DIRECTION"],
      image: "assets/work/egg01.jpg", alt: "Hộp bạc EGG:01 cạnh chai thủy tinh gân sóng có lòng đỏ cam", width: 1400, height: 1356 },
    { id: "rmit25", title: "RMIT 25th Anniversary Logo", year: "2025", tag: "Education",
      tags: ["LOGO DESIGN", "IDENTITY DESIGN", "EVENT DESIGN"],
      image: "assets/work/rmit25.jpg", alt: "Billboard 25 Years Of Progress trên mặt tiền gỗ", width: 1920, height: 1080 },
    { id: "dothanh", title: "Việt Cổ Truyện", year: "2026", tag: "Art",
      tags: ["BRAND IDENTITY", "ILLUSTRATION", "WEB DESIGN", "ART DIRECTION"],
      image: "assets/work/dothanh.jpg", alt: "Laptop chạy website Phố Việt Cổ Truyện", width: 1393, height: 853 },
    { id: "tad", title: "Tad.atelier", year: "2025", tag: "Architecture",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION"],
      image: "assets/work/tad.jpg", alt: "Board tổng hợp các dự án của Tad.atelier", width: 1400, height: 989 },
    { id: "vibe", title: "VIBE Expo", year: "2026", tag: "Architecture",
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "EXHIBITION DESIGN", "STAGE DESIGN"],
      image: "assets/work/vibe.jpg", alt: "Render 3D sảnh expo cam của VIBE", width: 1000, height: 558 },
    { id: "th28", title: "Tuổi Hồng 28", year: "2024", tag: "Entertainment",
      caseStudy: "/work/tuoi-hong-28",
      hero: { src: "assets/case-study/tuoi-hong-28/01-hero.jpg", width: 1920, height: 1280 },
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "POSTER DESIGN", "ART DIRECTION"],
      image: "assets/work/th28.jpg", alt: "Bốn poster Tuổi Hồng 28 năm 2024 trên nền sọc hồng", width: 1600, height: 1067 }
  ];

  /* ---------- Dữ liệu: Agency Works (Collective Design Agency) ----------
     Năm, industry và capabilities lấy từ trang dự án của agency
     (collectivedesign.agency/work/...). Ảnh bìa lấy từ ảnh đại diện
     của từng trang, lưu trong assets/work/agency-. Bấm ảnh lớn mở
     trang dự án ở tab mới. */
  var AGENCY_BASE = "https://collectivedesign.agency/work/";
  var AGENCY = [
    { id: "a-cda-independence", title: "CDA Independence Typeface", year: "2026", tag: "Public Sector",
      tags: ["TYPEFACE DESIGN"],
      image: "assets/work/agency-cda-independence.jpg", alt: "Chữ CDA Independence trên nền Dinh Độc Lập", width: 1600, height: 900,
      url: AGENCY_BASE + "cda-independence" },
    { id: "a-vietnam-is-awesome", title: "Vietnam Is Awesome", year: "2025", tag: "Travel & Tourism",
      tags: ["VISUAL IDENTITY", "BRAND CŌMPASS™"],
      image: "assets/work/agency-vietnam-is-awesome.jpg", alt: "Poster Vietnam Is Awesome trên vỉa hè", width: 1168, height: 625,
      url: AGENCY_BASE + "vietnam-is-awesome" },
    { id: "a-de-stem", title: "Dế STEM Foundation", year: "2026", tag: "Education",
      tags: ["BRANDING", "WEB DESIGN & DEVELOPMENT"],
      image: "assets/work/agency-de-stem-foundation.jpg", alt: "Bộ ấn phẩm mạng xã hội của Dế STEM Foundation", width: 1600, height: 1018,
      url: AGENCY_BASE + "de-stem-foundation" },
    { id: "a-we-create-content", title: "We Create Content", year: "2022", tag: "Creative & Media",
      tags: ["BRANDING", "VISUAL IDENTITY", "TONE OF VOICE & MESSAGING", "WEB DESIGN & DEVELOPMENT"],
      image: "assets/work/agency-we-create-content.jpg", alt: "Billboard We Create Content trên tường", width: 1600, height: 890,
      url: AGENCY_BASE + "we-create-content" },
    { id: "a-awuf-2025", title: "AWUF 2025", year: "2024", tag: "Sustainability & Non-Profit",
      tags: ["VISUAL IDENTITY", "EVENT, INSTALLATION & SPATIAL DESIGN"],
      image: "assets/work/agency-awuf-2025.jpg", alt: "Cờ phướn URBAN WATER AFNR của diễn đàn AWUF 2025", width: 1280, height: 768,
      url: AGENCY_BASE + "awuf-2025" },
    { id: "a-we-well", title: "WEWELL", year: "2025", tag: "Retail & Consumer Brands",
      tags: ["PACKAGING DESIGN", "MOTION, ILLUSTRATION & 3D"],
      image: "assets/work/agency-we-well.jpg", alt: "Lon nước WEWELL nhiều vị", width: 1600, height: 959,
      url: AGENCY_BASE + "we-well" },
    { id: "a-cypeace", title: "CyPeace", year: "2022", tag: "Technology & AI",
      tags: ["VISUAL IDENTITY", "WEB DESIGN & DEVELOPMENT"],
      image: "assets/work/agency-cypeace.jpg", alt: "Logo CyPeace trên nền xanh bạc hà", width: 1600, height: 900,
      url: AGENCY_BASE + "cypeace" }
  ];

  var COLLECTIONS = {
    independent: { projects: INDEPENDENT },
    agency: { projects: AGENCY }
  };
  var ALL = INDEPENDENT.concat(AGENCY);

  /* ---------- Thông số chuyển động ---------- */
  var DUR = reduceMotion ? 0 : 0.85;      // thời gian 1 lần chuyển
  var EASE = "power3.inOut";
  var FOLLOW_DELAY = 0.05;                // thumbnail sau đi theo trễ nhẹ từng cái
  var DECK_SCALE = 0.04;                  // deck ảnh lớn: mỗi lớp nhỏ đi 4%
  var DECK_Y = 16;                        // mỗi lớp lệch xuống 16px
  var DECK_VISIBLE = 3;                   // chỉ thấy 3 lớp dưới ảnh lớn
  var THUMB_VISIBLE = 3;                  // 3 thumbnail thấy được
  var SLIDE = 80;                         // quãng trượt ngang khi card rời / vào stack

  /* ---------- DOM ---------- */
  var viewer = document.getElementById("wn-viewer");
  var countEl = document.getElementById("wn-count");
  var titleEl = document.getElementById("wn-title");
  var metaEl = document.getElementById("wn-meta");
  var yearEl = document.getElementById("wn-year");
  var catEl = document.getElementById("wn-cat");
  var tagsEl = document.getElementById("wn-tags");
  var filtersEl = document.getElementById("wn-filters");
  var switchEl = document.getElementById("wn-switch");
  var mediaSlot = document.getElementById("wn-media");
  var layer = document.getElementById("wn-cards");
  var thumbSlots = [
    document.querySelector(".wn-slot--front"),
    document.querySelector(".wn-slot--mid"),
    document.querySelector(".wn-slot--back")
  ];
  var lightbox = document.getElementById("wn-lightbox");
  var lightboxImg = document.getElementById("wn-lightbox-img");
  var lightboxCap = document.getElementById("wn-lightbox-cap");
  var lightboxClose = document.getElementById("wn-lightbox-close");
  var cursorEl = document.querySelector(".cursor");
  if (!viewer || !layer || !mediaSlot) return;

  /* ---------- Trạng thái ---------- */
  var activeColl = /agency/i.test(location.hash) ? "agency" : "independent";
  var list = COLLECTIONS[activeColl].projects.slice();
  var current = 0;
  var shownIndex = 0;         // dự án đang hiện chữ (đích cuối khi nhảy nhiều bước)
  var busyUntil = 0;
  var pendingStep = 0;
  var infoTl = null;
  var moveTimer = null;
  var cards = {};
  var drag = null;              // trạng thái kéo thả đang diễn ra
  var suppressClick = false;    // vừa kéo xong thì bỏ qua click

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function now() { return performance.now(); }
  function isBusy() { return now() < busyUntil; }
  function isPinnedLayout() { return window.innerWidth > 900; }

  /* ---------- Tạo card (1 lần duy nhất cho cả 14 dự án) ---------- */
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
    var img = inner.querySelector("img");
    var c = { el: el, inner: inner, img: img, p: p, kind: "out", tilt: null };
    if (finePointer && !reduceMotion) {
      gsap.set(inner, { transformPerspective: 900 });
      c.tilt = {
        rx: gsap.quickTo(inner, "rotationX", { duration: 0.5, ease: "power2.out" }),
        ry: gsap.quickTo(inner, "rotationY", { duration: 0.5, ease: "power2.out" }),
        y: gsap.quickTo(inner, "y", { duration: 0.5, ease: "power2.out" }),
        s: gsap.quickTo(inner, "scale", { duration: 0.5, ease: "power2.out" })
      };
    }
    gsap.set(el, { opacity: 0 });
    el.style.visibility = "hidden";
    cards[p.id] = c;
  });

  /* ---------- Tính cỡ ảnh lớn và stack cho vừa màn hình ---------- */
  var mainEl = document.querySelector(".wn-main");
  function fitLayout() {
    if (!isPinnedLayout()) {
      viewer.style.removeProperty("--big-w");
      viewer.style.removeProperty("--ts");
      return;
    }
    var cs = getComputedStyle(viewer);
    var inner = viewer.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var top = mainEl.getBoundingClientRect().top - viewer.getBoundingClientRect().top;
    var availH = viewer.clientHeight - top - 40;
    var bigW = Math.min(910, inner * 0.4946, availH * 910 / 548);
    viewer.style.setProperty("--big-w", Math.round(bigW) + "px");
    var gap = parseFloat(getComputedStyle(mainEl).columnGap) || 40;
    var leftW = inner - gap - bigW;
    var used = filtersEl.offsetWidth + 25;
    var ts = Math.max(0.55, Math.min(1, (leftW - used - 32) / 271));
    viewer.style.setProperty("--ts", ts.toFixed(3));
  }

  /* ---------- Đo khung giữ chỗ (tọa độ trong viewer) ---------- */
  var rects = null;
  function measure() {
    fitLayout();
    var v = viewer.getBoundingClientRect();
    function rel(node) {
      var r = node.getBoundingClientRect();
      return { x: r.left - v.left, y: r.top - v.top, w: r.width, h: r.height };
    }
    rects = { big: rel(mediaSlot), thumbs: thumbSlots.map(rel), v: v };
  }

  function stateFor(rel) {
    if (rel === 0) {
      return { kind: "big", r: rects.big, scale: 1, dy: 0, opacity: 1, radius: 10, z: 100 };
    }
    if (rel < 0) {
      // Deck KHÔNG trong suốt (v8): chỉ nhỏ dần và lệch xuống. Card trong
      // suốt chồng lên nhau làm hình "fade lẫn vào nhau" khi chuyển; lớp
      // sâu hơn 3 nằm đúng sau lớp 3 nên bị che hoàn toàn.
      var k = -rel, kk = Math.min(k, DECK_VISIBLE);
      return { kind: "deck", r: rects.big, scale: 1 - DECK_SCALE * kk, dy: DECK_Y * kk,
        opacity: 1, radius: 10, z: 100 - k };
    }
    var slot = Math.min(rel, THUMB_VISIBLE) - 1;
    return { kind: rel <= THUMB_VISIBLE ? "thumb" : "reserve", r: rects.thumbs[slot],
      scale: 1, dy: 0, opacity: 1, radius: 5, z: 60 - rel };
  }

  function vars(s, extra) {
    var o = {
      x: s.r.x, y: s.r.y + s.dy, width: s.r.w, height: s.r.h, rotation: 0,
      scale: s.scale, opacity: s.opacity, "--r": s.radius + "px"
    };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }

  function applyKind(c, kind) {
    c.kind = kind;
    c.el.classList.toggle("is-big", kind === "big");
    c.el.classList.toggle("is-thumb", kind === "thumb");
    var interactive = kind === "big" || kind === "thumb";
    c.el.style.pointerEvents = interactive ? "auto" : "none";
    c.el.tabIndex = interactive ? 0 : -1;
    c.el.setAttribute("aria-hidden", interactive ? "false" : "true");
    var label = kind !== "big" ? "Tới dự án: " + c.p.title
      : (c.p.url ? "Mở dự án ở tab mới: " + c.p.title
        : c.p.caseStudy ? "Mở case study: " + c.p.title
        : "Case study coming soon: " + c.p.title);
    c.el.setAttribute("aria-label", label);
    c.el.style.visibility = kind === "out" ? "hidden" : "";
  }

  function resetTilt(c) {
    if (c.tilt) { c.tilt.rx(0); c.tilt.ry(0); c.tilt.y(0); c.tilt.s(1); }
  }

  function setCursor(mode) {
    if (!cursorEl) return;
    cursorEl.classList.toggle("cursor--open", mode === "open");
    cursorEl.classList.toggle("cursor--soon", mode === "soon");
    cursorEl.classList.toggle("cursor--newtab", mode === "newtab");
  }

  // Con tro theo trang thai du an: agency mo tab moi, independent
  // da co case study thi "Open", chua co thi "coming soon".
  function cursorFor(p) {
    if (!p) return null;
    if (p.url) return "newtab";
    if (p.caseStudy) return "open";
    return "soon";
  }

  // Bấm ảnh lớn / tiêu đề lớn: agency mở tab mới, independent đã
  // có case study thì ảnh phóng to ra full màn rồi mới sang trang
  // case study (hiệu ứng mở rộng bằng tay, xem expandToCaseStudy),
  // chưa có thì không làm gì — lightbox cũ đã bỏ, không mở gì thay thế.
  function openProject(p) {
    if (!p) return;
    if (p.url) { window.open(p.url, "_blank", "noopener"); return; }
    if (p.caseStudy) { expandToCaseStudy(p); }
  }

  // Tải và giải mã xong một ảnh thì mới coi là sẵn sàng (để trang
  // đích vẽ hero ngay khi tới, không chớp khung trống). Có timeout
  // an toàn để không kẹt nếu ảnh lỗi hoặc mạng chậm.
  function loadImage(src) {
    return new Promise(function (resolve) {
      var done = false;
      function fin() { if (!done) { done = true; resolve(); } }
      var im = new Image();
      im.onload = function () {
        if (im.decode) { im.decode().then(fin, fin); } else { fin(); }
      };
      im.onerror = fin;
      im.src = src;
      setTimeout(fin, 10000);
    });
  }

  // Hiệu ứng mở rộng bằng tay: ảnh lớn phóng to từ vị trí đang hiện
  // ra đúng vị trí và tỉ lệ hero ở trang đích (hero full-width, cao
  // theo tỉ lệ, căn trên, xem css/case-study.css) rồi mới chuyển trang.
  // Chỉ chuyển khi cả hiệu ứng xong VÀ ảnh hero đích đã tải và
  // giải mã xong, nên trang đích hiện hero ngay, không chớp trắng.
  // Không dùng View Transitions API nữa, để chắc chắn mượt trên
  // mọi trình duyệt.
  var expanding = false;
  function expandToCaseStudy(p) {
    if (expanding) return;
    expanding = true;
    var c = cards[p.id];
    var img = c && c.img;
    var rect = img ? img.getBoundingClientRect() : null;
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var vh = window.innerHeight;
    // Đích: đúng khung ảnh hero sẽ hiện ở trang đích (full-width,
    // cao theo tỉ lệ, căn trên, không crop). Vì hero tràn hết chiều
    // rộng nên overlay phóng tới x=0, y=0, rộng bằng viewport, cao
    // bằng viewport chia tỉ lệ (có thể cao hơn viewport, phần thừa
    // nằm dưới fold, đúng như trang đích).
    var hw = (p.hero && p.hero.width) || 1920;
    var hh = (p.hero && p.hero.height) || 1080;
    var ar = hw / hh;
    var target = { x: 0, y: 0, w: vw, h: Math.round(vw / ar) };
    // Bắt đầu tải ảnh hero đích ngay từ lúc bấm (song song với
    // hiệu ứng mở rộng) để khi chuyển trang thì ảnh đã sẵn trong
    // cache và đã giải mã xong.
    var heroSrc = (p.hero && p.hero.src) || "";
    var heroReady = heroSrc ? loadImage(heroSrc) : Promise.resolve();
    var navigated = false;
    function go() {
      if (navigated) return;
      navigated = true;
      location.href = p.caseStudy;
    }
    // An toàn: không đợi quá 10 giây thì vẫn chuyển trang (overlay
    // đã phủ full màn bằng ảnh nên chờ thêm không hỏng trải nghiệm).
    setTimeout(go, 10000);
    var overlay = document.createElement("div");
    overlay.className = "wn-expand";
    overlay.setAttribute("aria-hidden", "true");
    var oimg = document.createElement("img");
    oimg.src = img ? (img.currentSrc || img.src) : p.image;
    oimg.alt = "";
    overlay.appendChild(oimg);
    document.body.appendChild(overlay);
    var start = rect || { left: vw / 2 - 455, top: vh / 2 - 274, width: 910, height: 548 };
    gsap.set(overlay, { left: start.left, top: start.top, width: start.width, height: start.height });
    if (cursorEl) cursorEl.style.opacity = "0";
    var dur = reduceMotion ? 0 : 0.6;
    gsap.to(overlay, {
      left: target.x, top: target.y, width: target.w, height: target.h,
      duration: dur, ease: "power3.inOut",
      onComplete: function () { heroReady.then(go); }
    });
  }

  /* ---------- Đặt tất cả card không animation (khởi tạo, resize) ---------- */
  function placeAll() {
    measure();
    ALL.forEach(function (p) {
      var c = cards[p.id];
      var idx = list.indexOf(p);
      if (idx < 0) {
        gsap.set(c.el, { opacity: 0 });
        applyKind(c, "out");
        return;
      }
      var s = stateFor(idx - current);
      gsap.set(c.el, vars(s, { zIndex: s.z, transformOrigin: "50% 100%" }));
      applyKind(c, s.kind);
    });
  }

  /* ---------- Thông tin dự án: tiêu đề, "INDUSTRY ——— NĂM", tag, số ---------- */
  function renderInfo() {
    var p = list[shownIndex];
    if (!p) return;
    titleEl.textContent = p.title;
    catEl.textContent = p.tag;
    yearEl.textContent = p.year || "";
    metaEl.classList.toggle("wn-meta--no-year", !p.year);
    tagsEl.innerHTML = p.tags.map(function (t) { return '<li class="wn-tag">' + t + "</li>"; }).join("");
    countEl.textContent = pad(shownIndex + 1) + "/" + pad(list.length);
    markActiveName();
  }

  function animateInfo(delay, dir) {
    var els = [titleEl, metaEl, tagsEl, countEl];
    if (infoTl) infoTl.kill();
    if (reduceMotion) { renderInfo(); return; }
    infoTl = gsap.timeline({ delay: delay || 0 });
    infoTl.to(els, { y: dir > 0 ? -20 : 20, opacity: 0, duration: 0.25, ease: "power2.in" }, 0);
    infoTl.add(renderInfo, 0.27);
    infoTl.fromTo(els, { y: dir > 0 ? 24 : -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", clearProps: "transform,opacity" }, 0.3);
  }

  function lockFor(ms) {
    layer.classList.add("is-moving");
    busyUntil = now() + ms;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(afterMove, ms + 20);
  }

  /* ---------- Chuyển dự án trong cùng danh sách (v8) ----------
     Không có card nào fade tại khung ảnh lớn:
     - Nhảy 1–3 dự án: mọi card chạy thẳng 1 lần tới chỗ mới.
     - Nhảy lùi từ 4 dự án (vd 07 về 01): ảnh đích nằm sẵn rõ nét ở
       đúng khung, dưới cùng; ảnh lớn cũ và các lớp deck không cần ở
       điểm cuối slide XUỐNG ra khỏi khung để lộ ảnh đích; card còn
       cần (thành thumbnail) bay từ dưới ảnh đích về stack.
     - Nhảy tới từ 4 dự án (vd 01 về 07): thumbnail lần lượt bay thẳng
       vào chồng ảnh lớn theo thứ tự, card đích bay cuối cùng, nằm trên.
     Card rời stack (thành dự trữ) trượt vào sau card thứ 3, bị che,
     không mờ. Chữ chỉ đổi 1 lần, thẳng tới dự án đích. */
  var FAR = 4;

  function moveCards(dir, dur, ease, opts) {
    var k = dur / DUR;
    list.forEach(function (p, i) {
      var c = cards[p.id];
      var s = stateFor(i - current);
      var from = c.kind;
      resetTilt(c);
      var rel = i - current;
      var zDuring = (from === "big" && s.kind !== "big" && s.kind !== "deck") ? 150 : s.z;
      if (s.kind === "reserve") zDuring = s.z;
      if (opts && opts.dragged === c) zDuring = Math.max(zDuring, 150);
      gsap.set(c.el, { zIndex: zDuring, opacity: 1 });
      c.el.style.visibility = "";
      var delay = 0;
      if (dir > 0 && s.kind === "thumb") delay = FOLLOW_DELAY * (i - current) * k;
      if (dir < 0 && (s.kind === "thumb" || s.kind === "reserve")) delay = FOLLOW_DELAY * (i - current - 1) * k;
      if (opts && opts.dragged === c) delay = 0;
      // Ảnh lớn cũ thu về thumbnail giữa/cuối (rel > 1) khi lùi: lúc rời
      // khỏi khung ảnh lớn nó phải ở trên (z 150) để không chìm sau ảnh
      // lớn mới, nhưng khi tới gần stack thumbnail thì phải hạ xuống z
      // đích để nằm DƯỚI các thumbnail đi trước nó (vd Việt Cổ Truyện
      // về thumbnail back phải nằm dưới EGG:01 front và RMIT25 mid).
      // Hạ z ở giữa đường bay (progress 0.5), đúng lúc nó rời khỏi
      // vùng ảnh lớn. Thumbnail front (rel 1) là cao nhất trong stack
      // nên giữ z 150 suốt đường bay, không cần hạ.
      var dropZ = (from === "big" && s.kind === "thumb" && rel > 1 && !(opts && opts.dragged === c));
      var zDropped = false;
      gsap.to(c.el, vars(s, {
        duration: dur, ease: ease, delay: delay, overwrite: "auto",
        onUpdate: function () {
          if (dropZ && !zDropped && this.progress() > 0.5) {
            zDropped = true;
            gsap.set(c.el, { zIndex: s.z });
          }
        },
        onComplete: function () { gsap.set(c.el, { zIndex: s.z }); }
      }));
      applyKind(c, s.kind);
    });
    return dur;
  }

  function farBack() {
    var drop = viewer.clientHeight - rects.big.y + 80;   // xuống quá đáy khung
    var longest = DUR + 0.15;
    list.forEach(function (p, i) {
      var c = cards[p.id];
      var s = stateFor(i - current);
      var from = c.kind;
      resetTilt(c);
      c.el.style.visibility = "";
      gsap.killTweensOf(c.el);
      if (s.kind === "big") {
        // Ảnh đích: đặt sẵn rõ nét đúng khung, nằm dưới các ảnh sắp slide đi.
        gsap.set(c.el, vars(s, { zIndex: 100, opacity: 1 }));
      } else if ((from === "big" || from === "deck") && s.kind === "reserve") {
        // Không cần ở điểm cuối: slide xuống ra khỏi khung CÙNG LÚC
        // (không so le theo thứ tự như trước) để cả chồng trượt đi như
        // một khối, xong thì về chỗ dự trữ sau stack (bị che).
        var cur = parseInt(c.el.style.zIndex, 10) || 100;
        var order = Math.max(0, 100 - cur);
        gsap.set(c.el, { zIndex: 110 + Math.min(cur, 100) - 90, opacity: 1 });
        longest = Math.max(longest, 0.65);
        gsap.to(c.el, { y: "+=" + drop, rotation: (order % 2 ? -3 : 3), duration: 0.65,
          ease: "power2.in", delay: 0,
          onComplete: function () { gsap.set(c.el, vars(s, { zIndex: s.z })); } });
      } else {
        // Card còn cần: deck -> thumbnail bay từ dưới ảnh đích về stack;
        // deck -> deck bước lên dưới ảnh đích; thumbnail dịch nấc.
        // Các thumbnail mới bay vào stack CÙNG LÚC (cùng độ trễ 0.12)
        // để stack hiện lên như một khối, không nhảy từng cái.
        gsap.set(c.el, { zIndex: s.z, opacity: 1 });
        var delay = (s.kind === "thumb" || s.kind === "reserve") ? 0.12 : 0;
        gsap.to(c.el, vars(s, { duration: DUR, ease: EASE, delay: delay,
          onComplete: function () { gsap.set(c.el, { zIndex: s.z }); } }));
        longest = Math.max(longest, delay + DUR);
      }
      applyKind(c, s.kind);
    });
    return longest;
  }

  function farForward() {
    // Nhảy tới xa, cách dàn dựng mới (v15): đặt sẵn ảnh đích ở khung
    // ảnh lớn rồi trượt ảnh lớn cũ đi để lộ ra, như farBack.
    // Vấn đề ở v14: card đích và card deck lớp 1 CÙNG bay từ stack
    // thumbnail tới khung ảnh lớn trong cùng lúc. Deck lớp 1 về đích
    // ở cỡ 96% (chỉ nhỏ hơn ảnh lớn 4%) và lệch xuống 16px, gần như
    // cùng vị trí và cùng cỡ với card đích (100%). Hai card cùng hội
    // tụ về khung ảnh lớn cùng lúc nên chồng lên nhau giữa chừng, dù
    // đã cho hạ cánh cùng lúc ở 0.9s. Cho hạ cánh cùng lúc không sửa
    // được, vì cả hai vẫn đang bay tới cùng một chỗ trong cùng lúc.
    // Cách sửa: ảnh đích đặt sẵn rõ nét đúng khung ảnh lớn từ đầu
    // (z 100), ảnh lớn cũ trượt xuống ra khỏi khung để lộ ảnh đích,
    // các card deck bay từ stack về chui xuống DƯỚI ảnh đích đã nằm
    // sẵn. Trong lúc chuyển không bao giờ có hai ảnh lớn cùng bay
    // tới khung, nên không va nhau. Lỗi hiện ra đột ngột không quay
    // lại: ảnh đích đã nằm sẵn ở khung, không bay vào nên không
    // phình to giữa chừng.
    var drop = viewer.clientHeight - rects.big.y + 80;   // xuống quá đáy khung
    var longest = DUR + 0.15;
    list.forEach(function (p, i) {
      var c = cards[p.id];
      var s = stateFor(i - current);
      var from = c.kind;
      resetTilt(c);
      c.el.style.visibility = "";
      gsap.killTweensOf(c.el);
      gsap.set(c.el, { opacity: 1 });
      if (s.kind === "big") {
        // Ảnh đích: đặt sẵn rõ nét đúng khung, nằm dưới ảnh lớn cũ sắp trượt đi.
        // (Nhảy tới xa nên đích luôn là dự trữ, đang bị che sau thumbnail
        // back, nên việc đặt sẵn nó lên khung là vô hình ở stack.)
        gsap.set(c.el, vars(s, { zIndex: 100 }));
      } else if (from === "big") {
        // Ảnh lớn cũ: trượt xuống ra khỏi khung để lộ ảnh đích, xong
        // thì về chỗ deck sâu nhất sau chồng deck (bị che hoàn toàn,
        // vì nhảy tới xa nên nó luôn về lớp 4 trở xuống, cùng khung
        // với lớp 3 và bị lớp 3 che). Nâng z lên 120 để trượt đi
        // trên ảnh đích, không bị ảnh đích đè khi hai ảnh cùng ở
        // một khung lúc bắt đầu.
        gsap.set(c.el, { zIndex: 120 });
        longest = Math.max(longest, 0.65);
        gsap.to(c.el, { y: "+=" + drop, rotation: 3, duration: 0.65,
          ease: "power2.in",
          onComplete: function () { gsap.set(c.el, vars(s, { zIndex: s.z })); } });
      } else if (s.kind === "deck") {
        // Deck (cũ hoặc từ stack bay về): chui xuống dưới ảnh đích
        // đã nằm sẵn (z 100), nên chỉ cần bay về vị trí deck. Nâng
        // z lên z đích trong onStart, đúng lúc bắt đầu bay, để
        // trong lúc chờ (0.12s) card vẫn giữ z cũ ở stack, không
        // nhảy lên trên các thumbnail khác rồi đứng yên đó.
        var deckDelay = (from === "thumb" || from === "reserve") ? 0.12 : 0;
        gsap.to(c.el, vars(s, { duration: DUR, ease: EASE, delay: deckDelay,
          onStart: function () { gsap.set(c.el, { zIndex: s.z }); },
          onComplete: function () { gsap.set(c.el, { zIndex: s.z }); } }));
        longest = Math.max(longest, deckDelay + DUR);
      } else {
        // Thumbnail / dự trữ còn lại: dịch nấc trong stack, cùng
        // lúc (cùng độ trễ 0.12) để stack đi như một khối. Nâng z
        // lên z đích trong onStart, đúng lúc bắt đầu bay, để trong
        // lúc chờ card vẫn giữ z cũ, không nhảy lên trên các
        // thumbnail khác rồi đứng yên đó.
        gsap.to(c.el, vars(s, { duration: DUR, ease: EASE, delay: 0.12,
          onStart: function () { gsap.set(c.el, { zIndex: s.z }); },
          onComplete: function () { gsap.set(c.el, { zIndex: s.z }); } }));
        longest = Math.max(longest, 0.12 + DUR);
      }
      applyKind(c, s.kind);
    });
    return longest;
  }

  function goTo(index, opts) {
    index = Math.max(0, Math.min(index, list.length - 1));
    if (index === current) return false;
    var dir = index > current ? 1 : -1;
    var n = Math.abs(index - current);
    shownIndex = index;
    animateInfo(0.12, dir);
    current = index;
    measure();
    var total;
    if (n < FAR || reduceMotion || (opts && opts.dragged)) total = moveCards(dir, DUR, EASE, opts);
    else if (dir < 0) total = farBack();
    else total = farForward();
    lockFor(total * 1000 + 60);
    return true;
  }

  function afterMove() {
    layer.classList.remove("is-moving");
    if (pendingStep) {
      var d = pendingStep;
      pendingStep = 0;
      step(d);
    }
  }

  function step(dir) {
    var target = current + dir;
    if (target < 0 || target > list.length - 1) return;
    goTo(target);
  }

  /* ---------- Đổi cả danh sách (filter hoặc đổi trang) ----------
     slideDir = +1: card cũ trượt sang PHẢI rồi mất, card mới trượt
     vào từ trái. slideDir = -1: ngược lại.
     1) Thumbnail cũ không còn trong danh sách mới trượt ngang và mờ đi.
     2) Stack mới trượt ngang vào đúng front/mid/back.
     3) Dự án đầu danh sách: đang có trên màn hình thì bay thẳng lên ảnh
        lớn; chưa có thì trượt vào vị trí front trước rồi mới phóng to
        bay lên ảnh lớn (luôn thấy motion thumbnail -> ảnh lớn).
     4) Ảnh lớn và deck cũ nằm yên bên dưới tới khi ảnh mới phủ kín
        rồi mới mờ đi, nên khung ảnh lớn không bao giờ trống. */
  function transitionToList(newList, slideDir) {
    pendingStep = 0;
    measure();
    list = newList;
    current = 0;
    shownIndex = 0;

    var OUT_DUR = reduceMotion ? 0 : 0.45;
    var IN_AT = reduceMotion ? 0 : 0.25;
    var IN_DUR = reduceMotion ? 0 : 0.55;
    var target = cards[list[0].id];
    var onScreen = target.kind !== "out";
    var flyAt = reduceMotion ? 0 : (onScreen ? 0.1 : IN_AT + IN_DUR * 0.7);
    var landAt = flyAt + DUR;

    // Thumbnail đang hiện, xếp từ front ra back, để rời đi lần lượt.
    var outThumbs = 0;

    ALL.forEach(function (p) {
      var c = cards[p.id];
      var idx = list.indexOf(p);
      resetTilt(c);

      if (idx < 0) {
        if (c.kind === "out") return;
        if (c.kind === "thumb" || c.kind === "reserve") {
          // Trượt ngang theo hướng slideDir rồi mất (không trượt xuống).
          var order = c.kind === "thumb" ? outThumbs++ : 3;
          gsap.to(c.el, { x: "+=" + (SLIDE * slideDir), opacity: 0, duration: OUT_DUR,
            ease: "power2.in", delay: order * 0.04, overwrite: "auto",
            onComplete: function () { applyKind(c, "out"); } });
        } else {
          if (c.kind === "big") {
            // Ảnh lớn cũ nằm yên dưới tới khi ảnh mới phủ kín rồi ẩn (không fade).
            gsap.set(c.el, { zIndex: 90 });
            gsap.delayedCall(landAt, function () {
              if (list.indexOf(c.p) < 0) { gsap.set(c.el, { opacity: 0 }); applyKind(c, "out"); }
            });
          } else {
            // Deck cũ (lộ mép dưới ảnh lớn): slide xuống ra khỏi khung.
            gsap.set(c.el, { zIndex: 80 });
            gsap.to(c.el, { y: "+=" + (viewer.clientHeight - rects.big.y + 80), duration: 0.6,
              ease: "power2.in", delay: Math.max(0, flyAt - 0.1), overwrite: "auto",
              onComplete: function () { gsap.set(c.el, { opacity: 0 }); applyKind(c, "out"); } });
          }
        }
        c.el.style.pointerEvents = "none";
        c.kind = "leaving";
        return;
      }

      var s = stateFor(idx);
      var finalVars = vars(s, { duration: DUR, ease: EASE, overwrite: "auto",
        onComplete: function () { gsap.set(c.el, { zIndex: s.z }); } });

      if (c.kind === "out" || c.kind === "leaving") {
        // Chưa có trên màn hình: trượt ngang vào đúng slot.
        var entry = s.kind === "big" ? stateFor(1) : s;
        gsap.set(c.el, vars(entry, { x: entry.r.x - SLIDE * slideDir, opacity: 0,
          zIndex: s.kind === "big" ? 120 : s.z, transformOrigin: "50% 100%" }));
        c.el.style.visibility = "";
        gsap.to(c.el, vars(entry, { duration: IN_DUR, ease: "power3.out",
          delay: IN_AT + (s.kind === "big" ? 0 : FOLLOW_DELAY * idx), overwrite: "auto" }));
        if (s.kind === "big") {
          finalVars.delay = flyAt;
          gsap.to(c.el, finalVars);
        }
      } else {
        var wasUp = c.kind === "big" || c.kind === "deck";
        if (wasUp && s.kind === "reserve") {
          gsap.set(c.el, { zIndex: 85 });
          gsap.delayedCall(landAt, function () {
            var i2 = list.indexOf(c.p);
            if (i2 < 0) return;
            var s2 = stateFor(i2 - current);
            gsap.set(c.el, vars(s2, { zIndex: s2.z }));
          });
        } else if (s.kind === "big" && !wasUp) {
          // Card đích đang ở stack thumbnail: giữ z hiện tại (dưới các
          // thumbnail đi trước nó) cho tới khi bắt đầu bay lên ảnh lớn.
          // Nâng z lên 120 trong onStart, đúng lúc bay (flyAt).
          finalVars.delay = flyAt;
          finalVars.onStart = function () { gsap.set(c.el, { zIndex: 120 }); };
          gsap.to(c.el, finalVars);
        } else {
          gsap.set(c.el, { zIndex: s.kind === "big" ? 120 : (c.kind === "big" ? 150 : s.z) });
          if (s.kind === "big") finalVars.delay = flyAt;
          else if (wasUp) finalVars.delay = flyAt;
          else if (s.kind === "thumb") finalVars.delay = IN_AT * 0.5 + FOLLOW_DELAY * idx;
          gsap.to(c.el, finalVars);
        }
      }
      applyKind(c, s.kind);
    });

    animateInfo(Math.max(0, flyAt + 0.05), 1);
    lockFor((landAt + 0.1) * 1000);
  }

  /* ---------- Danh sách tên dự án (thay cho filter) ----------
     Cột trái hiện tên toàn bộ dự án của trang đang xem. Dự án đang
     xem màu đen, các dự án khác màu xám; hover thì đậm dần. Bấm tên
     thì chuyển tới dự án đó với cùng motion như bấm thumbnail. Tên
     đổi màu đúng lúc tiêu đề đổi (trong renderInfo). Bề rộng cột cố
     định theo tên dài nhất của cả 2 trang, nên khi đổi trang stack
     thumbnail không bị xê dịch. */
  function renderNames() {
    filtersEl.innerHTML = list.map(function (p, i) {
      return '<li><button type="button" class="wn-filter" data-index="' + i + '">' + p.title + "</button></li>";
    }).join("");
    markActiveName();
  }

  function markActiveName() {
    filtersEl.querySelectorAll(".wn-filter").forEach(function (btn) {
      var on = parseInt(btn.getAttribute("data-index"), 10) === shownIndex;
      btn.classList.toggle("is-active", on);
      if (on) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });
  }

  function lockNamesWidth() {
    var keep = list, w = 0;
    filtersEl.style.width = "auto";
    ["independent", "agency"].forEach(function (k) {
      list = COLLECTIONS[k].projects;
      renderNames();
      w = Math.max(w, filtersEl.offsetWidth);
    });
    list = keep;
    filtersEl.style.width = Math.ceil(w) + "px";
  }

  filtersEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".wn-filter");
    if (!btn) return;
    var i = parseInt(btn.getAttribute("data-index"), 10);
    if (isNaN(i)) return;
    pendingStep = 0;
    goTo(i);
  });

  /* ---------- Đổi trang: Independent Works / Agency Works ----------
     Sang Agency (bên phải): nội dung cũ trượt sang TRÁI, nội dung mới
     vào từ phải; quay lại Independent thì ngược lại. Filter đổi danh
     sách bằng cách mờ + trượt nhẹ cùng hướng. */
  function renderSwitch() {
    if (!switchEl) return;
    switchEl.querySelectorAll("[data-coll]").forEach(function (btn) {
      var on = btn.getAttribute("data-coll") === activeColl;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    switchEl.classList.toggle("is-agency", activeColl === "agency");
  }

  function switchCollection(name) {
    if (name === activeColl || !COLLECTIONS[name]) return;
    var slideDir = name === "agency" ? -1 : 1;
    activeColl = name;
    renderSwitch();
    try { history.replaceState(null, "", name === "agency" ? "#agency" : location.pathname + location.search); } catch (e) {}

    if (reduceMotion) {
      renderNames();
    } else {
      gsap.timeline()
        .to(filtersEl, { x: 24 * slideDir, opacity: 0, duration: 0.25, ease: "power2.in" })
        .add(function () { renderNames(); })
        .fromTo(filtersEl, { x: -24 * slideDir, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, ease: "power3.out", clearProps: "transform,opacity" });
    }
    transitionToList(COLLECTIONS[name].projects.slice(), slideDir);
  }

  if (switchEl) {
    switchEl.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-coll]");
      if (btn) switchCollection(btn.getAttribute("data-coll"));
    });
  }

  /* ---------- Bấm card ---------- */
  layer.addEventListener("click", function (event) {
    if (suppressClick) { suppressClick = false; event.preventDefault(); return; }
    var el = event.target.closest(".wn-card");
    if (!el) return;
    var c = cards[el.getAttribute("data-id")];
    if (!c) return;
    if (c.kind === "big") {
      openProject(c.p);
      return;
    }
    var idx = list.indexOf(c.p);
    if (idx >= 0) { pendingStep = 0; goTo(idx); }
  });

  /* ---------- Bấm tên dự án lớn ----------
     Tiêu đề lớn của dự án đang xem (h1#wn-title) cũng mở như bấm
     vô ảnh lớn: Agency thì mở URL dự án của agency ở tab mới,
     Independent đã có case study thì sang trang đó, chưa có thì
     không làm gì. Hover tên lớn thì cursor hiện chữ Open (đã có
     case study), "coming soon" (chưa có) hoặc mũi tên tab mới
     (Agency). Dự án đang xem là list[shownIndex], khớp với chữ
     tiêu đề đang hiện trên màn hình. Phần tử tiêu đề ổn định
     (renderInfo chỉ đổi textContent), nên gắn sự kiện trực tiếp
     một lần là đủ. */
  titleEl.addEventListener("click", function () {
    openProject(list[shownIndex]);
  });
  if (finePointer) {
    titleEl.addEventListener("mouseenter", function () {
      setCursor(cursorFor(list[shownIndex]));
    });
    titleEl.addEventListener("mouseleave", function () {
      setCursor(null);
    });
  }

  /* ---------- Hover nghiêng theo chuột (ảnh lớn VÀ thumbnail) ---------- */
  if (finePointer && !reduceMotion) {
    ALL.forEach(function (p) {
      var c = cards[p.id];
      c.el.addEventListener("mousemove", function (event) {
        layer.classList.remove("no-hover");
        if (c.kind !== "big" && c.kind !== "thumb") return;
        if (drag && drag.active) return;
        setCursor(cursorFor(c.p));
        if (layer.classList.contains("is-moving")) return;
        var r = c.el.getBoundingClientRect();
        var px = (event.clientX - r.left) / r.width - 0.5;
        var py = (event.clientY - r.top) / r.height - 0.5;
        // Thumbnail nhỏ nên cần phối cảnh gần hơn và góc lớn hơn ảnh lớn
        // thì mới thấy rõ độ nghiêng như ảnh lớn (cùng cảm giác).
        var isBig = c.kind === "big";
        gsap.set(c.inner, { transformPerspective: isBig ? 1100 : 380 });
        var amt = isBig ? 10 : 26;
        c.tilt.ry(px * amt);
        c.tilt.rx(-py * amt);
        c.tilt.y(isBig ? -6 : -8);
        c.tilt.s(isBig ? 1 : 1.06);
      });
      c.el.addEventListener("mouseleave", function () {
        resetTilt(c);
        setCursor(null);
      });
    });
  }

  /* ---------- Kéo thả card ----------
     - Kéo thumbnail: card đi theo chuột/ngón tay; thả vào vùng ảnh lớn
       thì nó thành ảnh lớn (bay tiếp từ chỗ thả), thả chỗ khác thì bật
       về đúng chỗ trong stack.
     - Kéo ảnh lớn: thả vào vùng stack (hoặc kéo sang trái quá 30% bề
       ngang) thì lùi lại một dự án, ảnh thu về thumbnail từ chỗ thả.
       Trên cảm ứng, vuốt ảnh lớn lên/xuống rõ ràng thì sang dự án
       tiếp/trước. Còn lại bật về chỗ cũ.
     Kéo chỉ bắt đầu khi di chuyển quá 6px, nên bấm (click) vẫn như cũ. */
  function pointInRect(x, y, r, pad) {
    return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
  }
  function stackZone() {
    var t = rects.thumbs, x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    t.forEach(function (r) { x1 = Math.min(x1, r.x); y1 = Math.min(y1, r.y); x2 = Math.max(x2, r.x + r.w); y2 = Math.max(y2, r.y + r.h); });
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  function snapBack(c) {
    var idx = list.indexOf(c.p);
    if (idx < 0) return;
    var s = stateFor(idx - current);
    gsap.to(c.el, vars(s, { duration: 0.6, ease: "power3.out", overwrite: "auto",
      onComplete: function () { gsap.set(c.el, { zIndex: s.z }); } }));
  }

  layer.addEventListener("pointerdown", function (e) {
    if (!isPinnedLayout() || e.button !== 0) return;
    var el = e.target.closest(".wn-card");
    if (!el) return;
    var c = cards[el.getAttribute("data-id")];
    if (!c || (c.kind !== "big" && c.kind !== "thumb") || isBusy()) return;
    measure();
    drag = { c: c, id: e.pointerId, sx: e.clientX, sy: e.clientY,
      ox: gsap.getProperty(el, "x"), oy: gsap.getProperty(el, "y"),
      lx: e.clientX, active: false, type: e.pointerType };
  });

  window.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.active) {
      if (Math.hypot(dx, dy) < 6) return;
      drag.active = true;
      try { drag.c.el.setPointerCapture(e.pointerId); } catch (err) {}
      layer.classList.add("is-dragging");
      resetTilt(drag.c);
      setCursor(null);
      gsap.killTweensOf(drag.c.el);
      gsap.set(drag.c.el, { zIndex: 200 });
    }
    e.preventDefault();
    var vx = e.clientX - drag.lx;
    drag.lx = e.clientX;
    var near = 0;
    if (drag.c.kind === "thumb") {
      // Càng gần ảnh lớn, thumbnail càng phóng to nhẹ, báo hiệu thả được.
      var px = e.clientX - rects.v.left, py = e.clientY - rects.v.top;
      near = pointInRect(px, py, rects.big, 40) ? 1 : 0;
    }
    gsap.to(drag.c.el, { x: drag.ox + dx, y: drag.oy + dy, rotation: Math.max(-8, Math.min(8, vx * 0.6)),
      scale: drag.c.kind === "thumb" ? 1.06 + near * 0.12 : 0.97, duration: 0.25, ease: "power2.out", overwrite: "auto" });
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    if (!d.active) return;
    layer.classList.remove("is-dragging");
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 50);
    var c = d.c;
    var px = e.clientX - rects.v.left, py = e.clientY - rects.v.top;
    var dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    var idx = list.indexOf(c.p);
    pendingStep = 0;
    if (c.kind === "thumb") {
      if (pointInRect(px, py, rects.big, 40) && goTo(idx, { dragged: c })) return;
    } else if (c.kind === "big") {
      var toStack = pointInRect(px, py, stackZone(), 60) || dx < -rects.big.w * 0.3;
      if (toStack && current > 0 && goTo(current - 1, { dragged: c })) return;
      if (d.type !== "mouse" && Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        var target = current + (dy < 0 ? 1 : -1);
        if (target >= 0 && target < list.length) {
          snapBack(c);
          goTo(target);
          return;
        }
      }
    }
    snapBack(c);
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  /* ---------- Lăn chuột: 1 cử chỉ = 1 dự án ---------- */
  var WHEEL_GAP = 200;
  var lastWheel = 0;
  var gestureUsed = false;
  var wheelAccum = 0;

  function onWheel(event) {
    if (!isPinnedLayout()) return;
    if (lightbox && !lightbox.hidden) return;
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
  }
  window.addEventListener("wheel", onWheel, { passive: false });

  /* ---------- iPad / màn cảm ứng ngang: vuốt dọc = 1 dự án ----------
     Vuốt bắt đầu trên card (ảnh lớn / thumbnail) do phần kéo thả xử lý. */
  var touchY = null, touchX = null, touchDone = false;
  viewer.addEventListener("touchstart", function (e) {
    touchY = null;
    if (!isPinnedLayout() || e.touches.length !== 1) return;
    if (e.target.closest(".wn-card.is-big, .wn-card.is-thumb")) return;
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
    if (lightbox && !lightbox.hidden) return;
    if (!isPinnedLayout()) return;
    var dir = 0;
    if (event.key === "ArrowDown" || event.key === "PageDown") dir = 1;
    if (event.key === "ArrowUp" || event.key === "PageUp") dir = -1;
    if (!dir) return;
    event.preventDefault();
    if (isBusy()) { pendingStep = dir; return; }
    step(dir);
  });

  /* ---------- Lightbox xem ảnh full (ĐÃ NGHỈ — giữ lại cho an toàn) ----------
     Từng mở khi bấm ảnh lớn Independent; từ khi có trang case study
     thì bấm ảnh lớn sẽ sang trang case study (đã có) hoặc không làm
     gì (chưa có), nên không còn chỗ nào gọi openLightbox nữa. Giữ
     nguyên hàm và phần tử lightbox để các chỗ kiểm tra
     lightbox.hidden (lăn chuột, phím) không vỡ; xóa hẳn sau khi
     đã kiểm tra kỹ trên trình duyệt thật. */
  function fullRect(proj) {
    var p = proj || list[current];
    var vw = window.innerWidth, vh = window.innerHeight;
    var maxW = Math.min(vw * 0.92, 1600), maxH = vh * 0.86;
    var ar = (p && p.width && p.height) ? p.width / p.height : 16 / 9;
    var w = maxW, h = w / ar;
    if (h > maxH) { h = maxH; w = h * ar; }
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }
  function openLightbox(proj) {
    var p = proj || list[current];
    if (!p) return;
    lightboxImg.src = p.image;
    lightboxImg.alt = p.alt;
    lightboxCap.textContent = p.title + (p.year ? " — " + p.year : "") + " — " + p.tag;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    setCursor(null);
    if (reduceMotion) return;
    var from = mediaSlot.getBoundingClientRect(), to = fullRect(p);
    var frame = lightbox.querySelector(".wn-lightbox-frame");
    gsap.fromTo(frame,
      { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: "0 0" },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: "power3.inOut" });
    gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
  }
  function closeLightbox() {
    if (lightbox.hidden) return;
    var done = function () {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      ALL.forEach(function (p) { resetTilt(cards[p.id]); });
      layer.classList.add("no-hover");
    };
    if (reduceMotion) { done(); return; }
    var from = mediaSlot.getBoundingClientRect();
    var frame = lightbox.querySelector(".wn-lightbox-frame");
    var r = frame.getBoundingClientRect();
    gsap.to(frame, { x: from.left - r.left, y: from.top - r.top, scaleX: from.width / r.width,
      scaleY: from.height / r.height, transformOrigin: "0 0", duration: 0.5, ease: "power3.inOut" });
    gsap.to(lightbox, { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: function () {
      gsap.set(frame, { clearProps: "all" });
      gsap.set(lightbox, { clearProps: "opacity" });
      done();
    }});
  }
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
  });
  lightboxClose.addEventListener("click", function (e) { e.stopPropagation(); closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
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
  lockNamesWidth();
  renderNames();
  renderInfo();
  placeAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lockNamesWidth(); renderNames(); placeAll(); });
  window.addEventListener("load", placeAll);
  requestAnimationFrame(function () { viewer.classList.add("is-ready"); });
})();
