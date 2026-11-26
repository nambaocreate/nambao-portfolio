// Nam Bao Portfolio — trang Work MỚI, BẢN STAGING (work-new.html)
// Bản v4: viết lại theo kiểu "một bộ card cố định".
//
// Ý chính: mỗi dự án là MỘT card DOM duy nhất, tạo 1 lần khi tải
// trang và không bao giờ bị xóa/vẽ lại bằng innerHTML. Card chỉ
// đổi VỊ TRÍ theo khoảng cách tới dự án đang xem (rel):
//   rel < 0  : deck ảnh lớn đã xem, xếp chồng dưới ảnh lớn
//              (nhỏ dần 4%, lệch xuống 16px, mờ dần) như radiance.family
//   rel = 0  : ảnh lớn bên phải
//   rel 1..3 : thumbnail front / mid / back
//   rel > 3  : nằm sẵn ngay sau thumbnail back (bị che), nên stack
//              luôn đủ từ đầu, không bao giờ tụt 2 rồi thêm 3
//   ngoài filter: "out" (đã trượt đi, ẩn)
// Chuyển dự án = GSAP đưa mọi card từ trạng thái cũ sang trạng thái
// mới. Vì vậy: tiến thì thumbnail bay lên ảnh lớn và thumbnail sau
// lớn lên theo; lùi thì ảnh lớn thu về đúng thumbnail front và deck
// bước lên. Không clone, không spawn, không flash.
//
// Cuộn: 1 cử chỉ lăn (kể cả quán tính trackpad/Magic Mouse kéo dài
// 1-2 giây) = đúng 1 dự án. iPad ngang: vuốt lên/xuống = 1 dự án.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (typeof window.gsap === "undefined") return;
  var gsap = window.gsap;

  /* ---------- Dữ liệu dự án (thứ tự đã chốt) ---------- */
  var PROJECTS = [
    { id: "vore", title: "Vore", year: "", tag: "Food & beverage",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION", "PRINT DESIGN"],
      image: "assets/work/vore.jpg", alt: "Ba poster của Vore treo trên tường", width: 1600, height: 900 },
    { id: "egg01", title: "EGG:01", year: "2025", tag: "Food & beverage",
      tags: ["BRAND IDENTITY", "PACKAGING DESIGN", "PRODUCT DESIGN", "ART DIRECTION"],
      image: "assets/work/egg01.jpg", alt: "Hộp bạc EGG:01 cạnh chai thủy tinh gân sóng có lòng đỏ cam", width: 1400, height: 1356 },
    { id: "rmit25", title: "RMIT 25th Anniversary Logo", year: "2025", tag: "Education",
      tags: ["LOGO DESIGN", "IDENTITY DESIGN", "EVENT DESIGN"],
      image: "assets/work/rmit25.jpg", alt: "Billboard 25 Years Of Progress trên mặt tiền gỗ", width: 1920, height: 1080 },
    { id: "dothanh", title: "Đô Thành Cổ Tích", year: "", tag: "Art",
      tags: ["BRAND IDENTITY", "ILLUSTRATION", "WEB DESIGN", "ART DIRECTION"],
      image: "assets/work/dothanh.jpg", alt: "Laptop chạy website Phố Việt Cổ Truyện", width: 1393, height: 853 },
    { id: "tad", title: "Tad.atelier", year: "", tag: "Architecture",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION"],
      image: "assets/work/tad.jpg", alt: "Board tổng hợp các dự án của Tad.atelier", width: 1400, height: 989 },
    { id: "vibe", title: "VIBE Expo", year: "2026", tag: "Architecture",
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "EXHIBITION DESIGN", "STAGE DESIGN"],
      image: "assets/work/vibe.jpg", alt: "Render 3D sảnh expo cam của VIBE", width: 1000, height: 558 },
    { id: "th28", title: "Tuổi Hồng 28", year: "2024", tag: "Entertainment",
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "POSTER DESIGN", "ART DIRECTION"],
      image: "assets/work/th28.jpg", alt: "Bốn poster Tuổi Hồng 28 năm 2024 trên nền sọc hồng", width: 1600, height: 1067 }
  ];
  var FILTERS = ["All", "Food & beverage", "Education", "Architecture", "Art", "Entertainment"];

  /* ---------- Thông số chuyển động ---------- */
  var DUR = reduceMotion ? 0 : 0.85;      // thời gian 1 lần chuyển
  var EASE = "power3.inOut";
  var FOLLOW_DELAY = 0.05;                // thumbnail sau đi theo trễ nhẹ từng cái
  var DECK_SCALE = 0.04;                  // deck ảnh lớn: mỗi lớp nhỏ đi 4%
  var DECK_Y = 16;                        // mỗi lớp lệch xuống 16px
  var DECK_FADE = 0.22;                   // mỗi lớp mờ thêm 22%
  var DECK_VISIBLE = 3;                   // chỉ thấy 3 lớp dưới ảnh lớn
  var THUMB_VISIBLE = 3;                  // 3 thumbnail thấy được

  /* ---------- DOM ---------- */
  var viewer = document.getElementById("wn-viewer");
  var countEl = document.getElementById("wn-count");
  var titleEl = document.getElementById("wn-title");
  var metaEl = document.getElementById("wn-meta");
  var yearEl = document.getElementById("wn-year");
  var catEl = document.getElementById("wn-cat");
  var tagsEl = document.getElementById("wn-tags");
  var filtersEl = document.getElementById("wn-filters");
  var mediaSlot = document.getElementById("wn-media");       // khung giữ chỗ ảnh lớn
  var layer = document.getElementById("wn-cards");           // lớp chứa toàn bộ card
  var thumbSlots = [                                          // khung giữ chỗ thumbnail
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
  var activeFilter = "All";
  var list = PROJECTS.slice();
  var current = 0;
  var busyUntil = 0;           // thời điểm animation chuyển dự án xong
  var pendingStep = 0;         // 1 bước lăn đến trong lúc đang chạy (tối đa 1)
  var infoTl = null;
  var cards = {};              // id -> { el, inner, p, kind, tilt }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function now() { return performance.now(); }
  function isBusy() { return now() < busyUntil; }

  /* ---------- Tạo card (1 lần duy nhất) ---------- */
  PROJECTS.forEach(function (p) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "wn-card";
    el.setAttribute("data-id", p.id);
    el.innerHTML =
      '<span class="wn-card-inner">' +
        '<img src="' + p.image + '" alt="" decoding="async">' +
        '<span class="wn-media-hint">Click to view</span>' +
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
    cards[p.id] = c;
  });

  /* ---------- Tính cỡ ảnh lớn và stack cho vừa màn hình ----------
     Ảnh lớn: tối đa 910px, ~49% bề ngang nội dung (910/1840 như
     Figma), và không cao quá phần còn lại của màn hình (chừa 40px
     dưới) để filter + thumbnail không bị crop. Stack thumbnail thu
     nhỏ theo --ts khi cột trái hẹp, luôn cách ảnh lớn >= 32px. */
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
    rects = { big: rel(mediaSlot), thumbs: thumbSlots.map(rel) };
  }

  // Trạng thái hình học của card theo rel.
  function stateFor(rel) {
    var s;
    if (rel === 0) {
      s = { kind: "big", r: rects.big, scale: 1, dy: 0, opacity: 1, radius: 10, z: 100 };
    } else if (rel < 0) {
      var k = -rel;
      var vis = k <= DECK_VISIBLE;
      s = { kind: "deck", r: rects.big, scale: 1 - DECK_SCALE * Math.min(k, DECK_VISIBLE + 1),
            dy: DECK_Y * Math.min(k, DECK_VISIBLE + 1), opacity: vis ? 1 - DECK_FADE * k : 0,
            radius: 10, z: 100 - k };
    } else {
      var slot = Math.min(rel, THUMB_VISIBLE) - 1;
      s = { kind: rel <= THUMB_VISIBLE ? "thumb" : "reserve", r: rects.thumbs[slot],
            scale: 1, dy: 0, opacity: 1, radius: 5, z: 60 - rel };
    }
    return s;
  }

  function vars(s, extra) {
    var o = {
      x: s.r.x, y: s.r.y + s.dy, width: s.r.w, height: s.r.h,
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
    c.el.setAttribute("aria-label", kind === "big" ? "Xem ảnh lớn: " + c.p.title : "Tới dự án: " + c.p.title);
    c.el.style.visibility = kind === "out" ? "hidden" : "";
  }

  function resetTilt(c) {
    if (c.tilt) { c.tilt.rx(0); c.tilt.ry(0); c.tilt.y(0); }
  }

  /* ---------- Đặt tất cả card không animation (khởi tạo, resize) ---------- */
  function placeAll() {
    measure();
    PROJECTS.forEach(function (p) {
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

  /* ---------- Thông tin dự án ---------- */
  function renderInfo() {
    var p = list[current];
    if (!p) return;
    titleEl.textContent = p.title;
    yearEl.textContent = p.year || "";
    catEl.textContent = p.tag;
    metaEl.classList.toggle("wn-meta--no-year", !p.year);
    tagsEl.innerHTML = p.tags.map(function (t) { return '<li class="wn-tag">' + t + "</li>"; }).join("");
    countEl.textContent = pad(current + 1) + "/" + pad(list.length);
  }

  // Chữ mờ đi rồi hiện lại; đổi nội dung đúng lúc đang mờ hẳn.
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

  /* ---------- Chuyển dự án trong cùng danh sách ---------- */
  function goTo(index) {
    index = Math.max(0, Math.min(index, list.length - 1));
    if (index === current) return;
    var dir = index > current ? 1 : -1;
    current = index;
    measure();
    layer.classList.add("is-moving");

    list.forEach(function (p, i) {
      var c = cards[p.id];
      var s = stateFor(i - current);
      var wasBig = c.kind === "big";
      resetTilt(c);
      // Card đang thu từ ảnh lớn về thumbnail (khi lùi) phải nằm trên
      // card deck đang bước lên, nên tạm cho z cao nhất trong lúc bay.
      var zDuring = (wasBig && s.kind !== "big" && s.kind !== "deck") ? 150 : s.z;
      gsap.set(c.el, { zIndex: zDuring });
      if (s.kind !== "out") c.el.style.visibility = "";
      var delay = 0;
      if (dir > 0 && s.kind === "thumb") delay = FOLLOW_DELAY * (i - current);
      if (dir < 0 && (s.kind === "thumb" || s.kind === "reserve")) delay = FOLLOW_DELAY * (i - current - 1);
      gsap.to(c.el, vars(s, {
        duration: DUR, ease: EASE, delay: delay, overwrite: "auto",
        onComplete: function () { gsap.set(c.el, { zIndex: s.z }); }
      }));
      applyKind(c, s.kind);
    });

    animateInfo(0.12, dir);
    busyUntil = now() + DUR * 1000 + 60;
    clearTimeout(goTo._t);
    goTo._t = setTimeout(afterMove, DUR * 1000 + 80);
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

  /* ---------- Filter ----------
     1) Thumbnail cũ không thuộc filter trượt xuống và mất đi.
     2) Stack mới trượt vào từ bên phải, xếp đúng front/mid/back.
     3) Dự án đầu tiên của filter: nếu đang có trong stack thì bay
        thẳng lên ảnh lớn; nếu chưa có thì trượt vào vị trí front
        trước rồi mới phóng to bay lên ảnh lớn (luôn thấy motion
        thumbnail -> ảnh lớn, kể cả trên iPad).
     4) Ảnh lớn cũ và deck cũ mờ đi khi ảnh mới đã phủ kín. */
  function setFilter(name) {
    if (name === activeFilter) return;
    activeFilter = name;
    filtersEl.querySelectorAll(".wn-filter").forEach(function (btn) {
      var on = btn.getAttribute("data-filter") === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var newList = name === "All" ? PROJECTS.slice()
      : PROJECTS.filter(function (p) { return p.tag === name; });
    if (!newList.length) newList = PROJECTS.slice();

    pendingStep = 0;
    measure();
    layer.classList.add("is-moving");
    var oldBigId = list[current] ? list[current].id : null;
    list = newList;
    current = 0;

    var OUT_DUR = reduceMotion ? 0 : 0.4;
    var IN_AT = reduceMotion ? 0 : 0.25;       // stack mới bắt đầu trượt vào
    var IN_DUR = reduceMotion ? 0 : 0.55;
    var target = cards[list[0].id];
    var targetDirect = target.kind === "thumb" || target.kind === "reserve" || target.kind === "deck" || target.kind === "big";
    var flyAt = targetDirect ? 0.1 : IN_AT + IN_DUR * 0.7;  // lúc bắt đầu bay lên ảnh lớn
    if (reduceMotion) flyAt = 0;
    var landAt = flyAt + DUR;

    PROJECTS.forEach(function (p) {
      var c = cards[p.id];
      var idx = list.indexOf(p);
      resetTilt(c);

      // Không thuộc filter: đi ra.
      if (idx < 0) {
        if (c.kind === "out") return;
        if (c.kind === "thumb" || c.kind === "reserve") {
          gsap.to(c.el, { y: "+=40", x: "-=24", opacity: 0, duration: OUT_DUR, ease: "power2.in",
            overwrite: "auto", onComplete: function () { applyKind(c, "out"); } });
        } else {
          // Ảnh lớn / deck cũ: nằm dưới, mờ đi khi ảnh mới đã phủ kín.
          gsap.set(c.el, { zIndex: c.kind === "big" ? 90 : 80 });
          gsap.to(c.el, { opacity: 0, duration: 0.3, delay: landAt - 0.05, ease: "power1.out",
            overwrite: "auto", onComplete: function () { applyKind(c, "out"); } });
        }
        c.el.style.pointerEvents = "none";
        return;
      }

      var s = stateFor(idx);
      var finalVars = vars(s, { duration: DUR, ease: EASE, overwrite: "auto",
        onComplete: function () { gsap.set(c.el, { zIndex: s.z }); } });

      if (c.kind === "out") {
        // Chưa có trên màn hình: trượt vào từ bên phải vào đúng slot.
        var entry = s.kind === "big" ? stateFor(1) : s;
        gsap.set(c.el, vars(entry, { x: entry.r.x + 60, opacity: 0, zIndex: s.kind === "big" ? 120 : s.z,
          transformOrigin: "50% 100%" }));
        c.el.style.visibility = "";
        gsap.to(c.el, vars(entry, { duration: IN_DUR, ease: "power3.out",
          delay: IN_AT + (s.kind === "big" ? 0 : FOLLOW_DELAY * idx), overwrite: "auto" }));
        if (s.kind === "big") {
          finalVars.delay = flyAt;
          gsap.to(c.el, finalVars);
        }
      } else {
        // Đã có trên màn hình: chạy thẳng tới vị trí mới.
        var wasUp = c.kind === "big" || c.kind === "deck";
        if (wasUp && s.kind === "reserve") {
          // Ảnh lớn/deck cũ thành card dự trữ (ẩn sau back): nằm yên
          // dưới ảnh mới, đợi ảnh mới phủ kín rồi mới chuyển chỗ, để
          // khung ảnh lớn không bao giờ bị trống.
          gsap.set(c.el, { zIndex: 85 });
          gsap.delayedCall(landAt, function () {
            if (list.indexOf(c.p) < 0) return;
            var s2 = stateFor(list.indexOf(c.p) - current);
            gsap.set(c.el, vars(s2, { zIndex: s2.z }));
          });
        } else {
          gsap.set(c.el, { zIndex: s.kind === "big" ? 120 : (c.kind === "big" ? 150 : s.z) });
          if (s.kind === "big") finalVars.delay = flyAt;
          else if (wasUp) finalVars.delay = flyAt;   // bay về stack cùng lúc ảnh mới bay lên
          else if (s.kind === "thumb") finalVars.delay = IN_AT * 0.5 + FOLLOW_DELAY * idx;
          gsap.to(c.el, finalVars);
        }
      }
      applyKind(c, s.kind);
    });

    // Card ảnh lớn cũ vẫn thuộc filter mới (thành thumbnail) thì đã
    // được xử lý ở trên: nó thu về slot của nó, không mờ đi.
    if (oldBigId && list[0].id === oldBigId) flyAt = 0;
    animateInfo(Math.max(0, flyAt + 0.05), 1);
    var total = (landAt + 0.1) * 1000;
    busyUntil = now() + total;
    clearTimeout(goTo._t);
    goTo._t = setTimeout(afterMove, total);
  }

  filtersEl.innerHTML = FILTERS.map(function (name) {
    return '<li><button type="button" class="wn-filter' + (name === "All" ? " is-active" : "") +
      '" data-filter="' + name + '" aria-pressed="' + (name === "All") + '">' + name + "</button></li>";
  }).join("");
  filtersEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".wn-filter");
    if (!btn) return;
    var name = btn.getAttribute("data-filter");
    setFilter(activeFilter === name ? "All" : name);
  });

  /* ---------- Bấm card ---------- */
  layer.addEventListener("click", function (event) {
    var el = event.target.closest(".wn-card");
    if (!el) return;
    var c = cards[el.getAttribute("data-id")];
    if (!c) return;
    if (c.kind === "big") { openLightbox(); return; }
    var idx = list.indexOf(c.p);
    if (idx >= 0) { pendingStep = 0; goTo(idx); }
  });

  /* ---------- Hover nghiêng theo chuột (ảnh lớn VÀ thumbnail) ---------- */
  if (finePointer && !reduceMotion) {
    PROJECTS.forEach(function (p) {
      var c = cards[p.id];
      c.el.addEventListener("mousemove", function (event) {
        layer.classList.remove("no-hover");
        if (c.kind !== "big" && c.kind !== "thumb") return;
        if (layer.classList.contains("is-moving")) return;
        var r = c.el.getBoundingClientRect();
        var px = (event.clientX - r.left) / r.width - 0.5;
        var py = (event.clientY - r.top) / r.height - 0.5;
        var amt = c.kind === "big" ? 8 : 14;      // thumbnail nhỏ nên nghiêng mạnh hơn
        c.tilt.ry(px * amt);
        c.tilt.rx(-py * amt);
        c.tilt.y(c.kind === "big" ? -6 : -4);
        if (cursorEl) cursorEl.classList.toggle("cursor--open", c.kind === "big");
      });
      c.el.addEventListener("mouseleave", function () {
        resetTilt(c);
        if (cursorEl) cursorEl.classList.remove("cursor--open");
      });
    });
  }

  /* ---------- Lăn chuột: 1 cử chỉ = 1 dự án ----------
     Trackpad và Magic Mouse bắn hàng chục sự kiện wheel liên tục
     (cả phần quán tính) cho một lần vuốt. Bản cũ coi mỗi sự kiện vượt
     ngưỡng là một lần lăn và xếp hàng, nên một lần vuốt chạy hết 7 dự
     án. Giờ: sự kiện đầu tiên của cử chỉ chuyển 1 dự án, các sự kiện
     sau bị bỏ qua cho tới khi wheel im lặng >= 200ms (hết cử chỉ). Nếu
     người dùng lăn cử chỉ MỚI khi animation chưa xong thì giữ lại đúng
     1 bước để chạy tiếp. */
  var WHEEL_GAP = 200;
  var lastWheel = 0;
  var gestureUsed = false;
  var wheelAccum = 0;

  function onWheel(event) {
    if (!isPinnedLayout()) return;
    if (lightbox && !lightbox.hidden) return;
    event.preventDefault();
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

  /* ---------- iPad / màn cảm ứng ngang: vuốt dọc = 1 dự án ---------- */
  var touchY = null, touchX = null, touchDone = false;
  viewer.addEventListener("touchstart", function (e) {
    if (!isPinnedLayout() || e.touches.length !== 1) return;
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

  function isPinnedLayout() { return window.innerWidth > 900; }

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

  /* ---------- Lightbox xem ảnh full ---------- */
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
      PROJECTS.forEach(function (p) { resetTilt(cards[p.id]); });
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
      PROJECTS.forEach(function (p) { gsap.killTweensOf(cards[p.id].el); });
      placeAll();
    });
  });

  /* ---------- Khởi tạo ---------- */
  renderInfo();
  placeAll();
  // Font tải xong có thể đổi chiều cao chữ -> đo lại khung.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAll);
  window.addEventListener("load", placeAll);
  requestAnimationFrame(function () { viewer.classList.add("is-ready"); });
})();
