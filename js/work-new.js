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
    { id: "a-vietnam-is-awesome", title: "Vietnam Is Awesome", year: "2025", tag: "Other Industries",
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

  function uniqueTags(arr) {
    var seen = {}, out = ["All"];
    arr.forEach(function (p) { if (!seen[p.tag]) { seen[p.tag] = 1; out.push(p.tag); } });
    return out;
  }
  var COLLECTIONS = {
    independent: { projects: INDEPENDENT,
      filters: ["All", "Food & beverage", "Education", "Architecture", "Art", "Entertainment"] },
    agency: { projects: AGENCY, filters: uniqueTags(AGENCY) }
  };
  var ALL = INDEPENDENT.concat(AGENCY);

  /* ---------- Thông số chuyển động ---------- */
  var DUR = reduceMotion ? 0 : 0.85;      // thời gian 1 lần chuyển
  var EASE = "power3.inOut";
  var FOLLOW_DELAY = 0.05;                // thumbnail sau đi theo trễ nhẹ từng cái
  var DECK_SCALE = 0.04;                  // deck ảnh lớn: mỗi lớp nhỏ đi 4%
  var DECK_Y = 16;                        // mỗi lớp lệch xuống 16px
  var DECK_FADE = 0.22;                   // mỗi lớp mờ thêm 22%
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
  var activeFilter = "All";
  var list = COLLECTIONS[activeColl].projects.slice();
  var current = 0;
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
        '<span class="wn-media-hint">' + (p.url ? "Open project" : "Click to view") + "</span>" +
      "</span>";
    layer.appendChild(el);
    var inner = el.firstChild;
    var c = { el: el, inner: inner, p: p, kind: "out", tilt: null };
    if (finePointer && !reduceMotion) {
      gsap.set(inner, { transformPerspective: 900 });
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

  /* ---------- Tính cỡ ảnh lớn và stack cho vừa màn hình ---------- */
  var mainEl = document.querySelector(".wn-main");
  var industryEl = document.querySelector(".wn-industry");
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
    var used = industryEl.offsetWidth + filtersEl.offsetWidth + 25;
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
      var k = -rel, kk = Math.min(k, DECK_VISIBLE + 1);
      return { kind: "deck", r: rects.big, scale: 1 - DECK_SCALE * kk, dy: DECK_Y * kk,
        opacity: k <= DECK_VISIBLE ? 1 - DECK_FADE * k : 0, radius: 10, z: 100 - k };
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
      : (c.p.url ? "Mở dự án ở tab mới: " + c.p.title : "Xem ảnh lớn: " + c.p.title);
    c.el.setAttribute("aria-label", label);
    c.el.style.visibility = kind === "out" ? "hidden" : "";
  }

  function resetTilt(c) {
    if (c.tilt) { c.tilt.rx(0); c.tilt.ry(0); c.tilt.y(0); }
  }

  function setCursor(mode) {
    if (!cursorEl) return;
    cursorEl.classList.toggle("cursor--open", mode === "open");
    cursorEl.classList.toggle("cursor--newtab", mode === "newtab");
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
    var p = list[current];
    if (!p) return;
    titleEl.textContent = p.title;
    catEl.textContent = p.tag;
    yearEl.textContent = p.year || "";
    metaEl.classList.toggle("wn-meta--no-year", !p.year);
    tagsEl.innerHTML = p.tags.map(function (t) { return '<li class="wn-tag">' + t + "</li>"; }).join("");
    countEl.textContent = pad(current + 1) + "/" + pad(list.length);
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

  /* ---------- Chuyển dự án trong cùng danh sách ---------- */
  function goTo(index, opts) {
    index = Math.max(0, Math.min(index, list.length - 1));
    if (index === current) return false;
    var dir = index > current ? 1 : -1;
    current = index;
    measure();

    list.forEach(function (p, i) {
      var c = cards[p.id];
      var s = stateFor(i - current);
      var wasBig = c.kind === "big";
      resetTilt(c);
      // Card đang thu từ ảnh lớn về thumbnail (khi lùi) nằm trên deck đang bước lên.
      var zDuring = (wasBig && s.kind !== "big" && s.kind !== "deck") ? 150 : s.z;
      if (opts && opts.dragged === c) zDuring = Math.max(zDuring, 150);
      gsap.set(c.el, { zIndex: zDuring });
      c.el.style.visibility = "";
      var delay = 0;
      if (dir > 0 && s.kind === "thumb") delay = FOLLOW_DELAY * (i - current);
      if (dir < 0 && (s.kind === "thumb" || s.kind === "reserve")) delay = FOLLOW_DELAY * (i - current - 1);
      if (opts && opts.dragged === c) delay = 0;
      gsap.to(c.el, vars(s, {
        duration: DUR, ease: EASE, delay: delay, overwrite: "auto",
        onComplete: function () { gsap.set(c.el, { zIndex: s.z }); }
      }));
      applyKind(c, s.kind);
    });

    animateInfo(0.12, dir);
    lockFor(DUR * 1000 + 60);
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
          gsap.set(c.el, { zIndex: c.kind === "big" ? 90 : 80 });
          gsap.to(c.el, { opacity: 0, duration: 0.3, delay: landAt - 0.05, ease: "power1.out",
            overwrite: "auto", onComplete: function () { applyKind(c, "out"); } });
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

  /* ---------- Filter ---------- */
  function renderFilters() {
    var names = COLLECTIONS[activeColl].filters;
    filtersEl.innerHTML = names.map(function (name) {
      var on = name === activeFilter;
      return '<li><button type="button" class="wn-filter' + (on ? " is-active" : "") +
        '" data-filter="' + name + '" aria-pressed="' + on + '">' + name + "</button></li>";
    }).join("");
  }

  function setFilter(name) {
    if (name === activeFilter) return;
    activeFilter = name;
    filtersEl.querySelectorAll(".wn-filter").forEach(function (btn) {
      var on = btn.getAttribute("data-filter") === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var all = COLLECTIONS[activeColl].projects;
    var newList = name === "All" ? all.slice() : all.filter(function (p) { return p.tag === name; });
    if (!newList.length) newList = all.slice();
    transitionToList(newList, 1);
  }

  filtersEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".wn-filter");
    if (!btn) return;
    var name = btn.getAttribute("data-filter");
    setFilter(activeFilter === name ? "All" : name);
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
    activeFilter = "All";
    renderSwitch();
    try { history.replaceState(null, "", name === "agency" ? "#agency" : location.pathname + location.search); } catch (e) {}

    if (reduceMotion) {
      renderFilters();
    } else {
      gsap.timeline()
        .to(filtersEl, { x: 24 * slideDir, opacity: 0, duration: 0.25, ease: "power2.in" })
        .add(function () { renderFilters(); measure(); })
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
      if (c.p.url) window.open(c.p.url, "_blank", "noopener");
      else openLightbox();
      return;
    }
    var idx = list.indexOf(c.p);
    if (idx >= 0) { pendingStep = 0; goTo(idx); }
  });

  /* ---------- Hover nghiêng theo chuột (ảnh lớn VÀ thumbnail) ---------- */
  if (finePointer && !reduceMotion) {
    ALL.forEach(function (p) {
      var c = cards[p.id];
      c.el.addEventListener("mousemove", function (event) {
        layer.classList.remove("no-hover");
        if (c.kind !== "big" && c.kind !== "thumb") return;
        if (drag && drag.active) return;
        setCursor(c.kind === "big" ? (c.p.url ? "newtab" : "open") : null);
        if (layer.classList.contains("is-moving")) return;
        var r = c.el.getBoundingClientRect();
        var px = (event.clientX - r.left) / r.width - 0.5;
        var py = (event.clientY - r.top) / r.height - 0.5;
        var amt = c.kind === "big" ? 8 : 14;
        c.tilt.ry(px * amt);
        c.tilt.rx(-py * amt);
        c.tilt.y(c.kind === "big" ? -6 : -4);
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

  /* ---------- Lightbox xem ảnh full (chỉ Independent Works) ---------- */
  function fullRect() {
    var p = list[current];
    var vw = window.innerWidth, vh = window.innerHeight;
    var maxW = Math.min(vw * 0.92, 1600), maxH = vh * 0.86;
    var ar = (p && p.width && p.height) ? p.width / p.height : 16 / 9;
    var w = maxW, h = w / ar;
    if (h > maxH) { h = maxH; w = h * ar; }
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }
  function openLightbox() {
    var p = list[current];
    if (!p) return;
    lightboxImg.src = p.image;
    lightboxImg.alt = p.alt;
    lightboxCap.textContent = p.title + (p.year ? " — " + p.year : "") + " — " + p.tag;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    setCursor(null);
    if (reduceMotion) return;
    var from = mediaSlot.getBoundingClientRect(), to = fullRect();
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
  renderFilters();
  renderInfo();
  placeAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAll);
  window.addEventListener("load", placeAll);
  requestAnimationFrame(function () { viewer.classList.add("is-ready"); });
})();
