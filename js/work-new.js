// Nam Bao Portfolio — trang Work MỚI, BẢN STAGING (work-new.html)
// Theo Figma Frame 26 (Section 1, node 1685:596) và các note
// của Bảo trong section. File RIÊNG, không động tới trang
// /work đang live (work.html, css/work.css, js/work.js) hay
// js/work-data.js (chỉ đọc để lấy dữ liệu gốc).
//
// Dữ liệu: đúng 7 dự án và thứ tự đã chốt (Vore, EGG:01,
// RMIT25, Đô Thành Cổ Tích, Tad.atelier, VIBE Expo,
// Tuổi Hồng 28), ảnh cover trong assets/work/.
// Năm và tag: chỉ RMIT25 có đủ trong Figma (2025; logo
// design, identity design, event design). Tuổi Hồng 28 lấy
// năm 2024 từ alt text, VIBE Expo lấy năm 2026 từ tên dự
// án "VIBE 2026". Vore, EGG:01, Đô Thành Cổ Tích,
// Tad.atelier CHƯA có năm trên record nên để trống (meta
// chỉ hiện category, không bịa năm); tag của các dự án này
// tạm dùng category làm pill, cần Bảo xác nhận tag đúng.
//
// Cơ chế:
// - Viewer ghim (sticky 100svh) trong track cuộn dài; cuộn
//   xuống một màn hình thì sang dự án tiếp theo. Bấm
//   thumbnail cũng nhảy tới dự án đó.
// - Khi sang dự án tiếp theo, thumbnail của dự án đó slide
//   và phóng to (FLIP) để chồng lên ảnh lớn bên phải.
// - Filter theo industry: chỉ còn dự án thuộc sector đó
//   (cả khi cuộn lẫn thumbnail); nút All để về tất cả.
// - Hover ảnh lớn: tương tác như thẻ (nhấc lên, nghiêng 3D
//   theo chuột, bóng đổ, ảnh trong zoom nhẹ), theo note
//   "giống mục selected work của radiance.family".
// - Bấm ảnh lớn: ảnh phóng full màn hình (xem full ảnh);
//   bản staging chưa có trang case study nên chưa nối sang
//   đó, sẽ nối tiếp khi trang case study được xây.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover)").matches;
  var hasGsap = typeof window.gsap !== "undefined";

  /* ---------- Dữ liệu dự án (thứ tự đã chốt) ---------- */
  var PROJECTS = [
    {
      id: "vore", title: "Vore", year: "", tag: "Food & beverage",
      tags: ["Food & beverage"],
      image: "assets/work/vore.jpg",
      alt: "Ba poster của Vore treo trên tường",
      width: 1600, height: 900
    },
    {
      id: "egg01", title: "EGG:01", year: "", tag: "Food & beverage",
      tags: ["Food & beverage"],
      image: "assets/work/egg01.jpg",
      alt: "Hộp bạc EGG:01 cạnh chai thủy tinh gân sóng có lòng đỏ cam",
      width: 1400, height: 1356
    },
    {
      id: "rmit25", title: "RMIT 25th Anniversary Logo", year: "2025", tag: "Education",
      tags: ["logo design", "identity design", "event design"],
      image: "assets/work/rmit25.jpg",
      alt: "Billboard 25 Years Of Progress trên mặt tiền gỗ",
      width: 1920, height: 1080
    },
    {
      id: "dothanh", title: "Đô Thành Cổ Tích", year: "", tag: "Art",
      tags: ["Art"],
      image: "assets/work/dothanh.jpg",
      alt: "Laptop chạy website Phố Việt Cổ Truyện",
      width: 1393, height: 853
    },
    {
      id: "tad", title: "Tad.atelier", year: "", tag: "Architecture",
      tags: ["Architecture"],
      image: "assets/work/tad.jpg",
      alt: "Board tổng hợp các dự án của Tad.atelier",
      width: 1400, height: 989
    },
    {
      id: "vibe", title: "VIBE Expo", year: "2026", tag: "Architecture",
      tags: ["Architecture"],
      image: "assets/work/vibe.jpg",
      alt: "Render 3D sảnh expo cam của VIBE",
      width: 1000, height: 558
    },
    {
      id: "th28", title: "Tuổi Hồng 28", year: "2024", tag: "Entertainment",
      tags: ["Entertainment"],
      image: "assets/work/th28.jpg",
      alt: "Bốn poster Tuổi Hồng 28 năm 2024 trên nền sọc hồng",
      width: 1600, height: 1067
    }
  ];

  var FILTERS = ["All", "Food & beverage", "Education", "Architecture", "Art", "Entertainment"];

  /* ---------- DOM ---------- */
  var track = document.getElementById("wn-track");
  var viewer = document.getElementById("wn-viewer");
  var countEl = document.getElementById("wn-count");
  var titleEl = document.getElementById("wn-title");
  var metaEl = document.getElementById("wn-meta");
  var yearEl = document.getElementById("wn-year");
  var catEl = document.getElementById("wn-cat");
  var tagsEl = document.getElementById("wn-tags");
  var filtersEl = document.getElementById("wn-filters");
  var thumbsEl = document.getElementById("wn-thumbs");
  var mediaEl = document.getElementById("wn-media");
  var imgEl = document.getElementById("wn-img");
  var lightbox = document.getElementById("wn-lightbox");
  var lightboxImg = document.getElementById("wn-lightbox-img");
  var lightboxCap = document.getElementById("wn-lightbox-cap");
  var lightboxClose = document.getElementById("wn-lightbox-close");

  if (!track || !viewer || !PROJECTS.length) return;

  /* ---------- Trạng thái ---------- */
  var activeFilter = "All";
  var list = PROJECTS.slice(); // danh sách đang hiện (tất cả hoặc đã qua filter)
  var current = 0; // index trong list
  var animating = null; // timeline GSAP đang chạy (để hủy khi cuộn nhanh)
  var flyClone = null; // bản sao thumbnail đang bay
  var ticking = false;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function projectAt(i) { return list[i]; }

  /* ---------- Vẽ filter ---------- */
  filtersEl.innerHTML = FILTERS.map(function (name) {
    return '<li><button type="button" class="wn-filter" data-filter="' +
      name + '" aria-pressed="false">' + name + "</button></li>";
  }).join("");

  filtersEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".wn-filter");
    if (!btn) return;
    var name = btn.getAttribute("data-filter");
    // Bấm mục đang chọn thì về All, hiện tất cả.
    setFilter(activeFilter === name ? "All" : name);
  });

  function setFilter(name) {
    activeFilter = name;
    filtersEl.querySelectorAll(".wn-filter").forEach(function (btn) {
      var on = btn.getAttribute("data-filter") === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    // Danh sách chỉ còn dự án thuộc sector (All thì đủ 7).
    list = name === "All"
      ? PROJECTS.slice()
      : PROJECTS.filter(function (p) { return p.tag === name; });
    if (!list.length) list = PROJECTS.slice();
    // Về đầu danh sách mới, không làm hiệu ứng bay.
    cancelTransition();
    current = 0;
    setTrackHeight();
    window.scrollTo(0, 0);
    renderAll();
  }

  function setTrackHeight() {
    // Mỗi dự án chiếm đúng một màn hình cuộn.
    track.style.height = (list.length * 100) + "vh";
  }

  /* ---------- Vẽ thông tin dự án đang xem ---------- */
  function renderInfo() {
    var p = projectAt(current);
    if (!p) return;
    titleEl.textContent = p.title;
    yearEl.textContent = p.year || "";
    catEl.textContent = p.tag;
    metaEl.classList.toggle("wn-meta--no-year", !p.year);
    tagsEl.innerHTML = p.tags.map(function (t) {
      return '<li class="wn-tag">' + t + "</li>";
    }).join("");
    countEl.textContent = pad(current + 1) + "/" + pad(list.length);
  }

  function renderMedia() {
    var p = projectAt(current);
    if (!p) return;
    imgEl.src = p.image;
    imgEl.alt = p.alt;
    imgEl.width = p.width;
    imgEl.height = p.height;
    mediaEl.setAttribute("aria-label", "Xem ảnh lớn: " + p.title);
  }

  /* ---------- Vẽ thumbnail: 3 dự án TIẾP THEO theo thứ tự ----------
     Cái trước (dự án kế tiếp) to nhất, cái sau nhỏ dần và lệch
     trái/xuống, đúng kiểu xếp chồng trong Figma. Hết dự án thì
     stack trống (không vòng lại). */
  function renderThumbs() {
    var next = [];
    for (var k = 1; k <= 3; k++) {
      var p = list[current + k];
      if (p) next.push({ p: p, index: current + k });
    }
    thumbsEl.classList.toggle("is-empty", next.length === 0);
    var cls = ["wn-thumb--front", "wn-thumb--mid", "wn-thumb--back"];
    thumbsEl.innerHTML = next.map(function (item, i) {
      var p = item.p;
      return '<button type="button" class="wn-thumb ' + cls[i] + '" data-index="' +
        item.index + '" aria-label="Tới dự án: ' + p.title + '">' +
        '<img src="' + p.image + '" alt="" loading="lazy" decoding="async">' +
        "</button>";
    }).join("");
  }

  function renderAll() {
    renderInfo();
    renderMedia();
    renderThumbs();
  }

  thumbsEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".wn-thumb");
    if (!btn) return;
    var index = parseInt(btn.getAttribute("data-index"), 10);
    if (isNaN(index)) return;
    goTo(index);
    // Cuộn tới đúng vị trí của dự án đó để lần cuộn sau khớp
    // (chỉ khi viewer đang ghim; mobile thì về đầu viewer).
    if (window.innerWidth > 900) {
      window.scrollTo(0, index * window.innerHeight);
    } else {
      window.scrollTo(0, 0);
    }
  });

  /* ---------- Hủy hiệu ứng đang chạy (khi cuộn nhanh / đổi filter) ---------- */
  function cancelTransition() {
    if (animating) {
      animating.kill();
      animating = null;
    }
    if (flyClone) {
      flyClone.remove();
      flyClone = null;
    }
    // Trả lại trạng thái hiện cho các phần tử info (tránh kẹt mờ).
    [titleEl, metaEl, tagsEl, countEl, imgEl].forEach(function (el) {
      if (el) {
        el.style.opacity = "";
        el.style.transform = "";
      }
    });
    thumbsEl.querySelectorAll(".wn-thumb").forEach(function (t) {
      t.style.visibility = "";
    });
  }

  /* ---------- Chuyển dự án ----------
     Đi tới (forward) và thumbnail của dự án đó còn trong stack
     thì làm hiệu ứng bay: thumbnail slide và phóng to để chồng
     lên ảnh lớn bên phải. Các trường hợp còn lại (lùi lại,
     nhảy xa, không có thumbnail) thì crossfade + trượt nhẹ. */
  function goTo(index, opts) {
    index = Math.max(0, Math.min(index, list.length - 1));
    if (index === current) return;
    var dir = index > current ? 1 : -1;
    var target = projectAt(index);
    if (!target) return;

    // Tìm thumbnail của dự án đích trong stack hiện tại.
    var thumb = null;
    if (dir > 0) {
      thumb = thumbsEl.querySelector('.wn-thumb[data-index="' + index + '"]');
    }

    cancelTransition();
    var fromIndex = current;
    current = index;

    if (thumb && hasGsap && !reduceMotion) {
      flyTo(index, thumb);
    } else {
      crossfadeTo(index, dir);
    }
    // Cập nhật số thứ tự ngay (không chờ hiệu ứng xong).
    countEl.textContent = pad(current + 1) + "/" + pad(list.length);
  }

  // Hiệu ứng bay: clone thumbnail rồi phóng to về đúng khung ảnh lớn.
  function flyTo(index, thumb) {
    var p = projectAt(index);
    var from = thumb.getBoundingClientRect();
    var to = mediaEl.getBoundingClientRect();

    flyClone = thumb.cloneNode(true);
    flyClone.style.position = "fixed";
    flyClone.style.left = from.left + "px";
    flyClone.style.top = from.top + "px";
    flyClone.style.width = from.width + "px";
    flyClone.style.height = from.height + "px";
    flyClone.style.margin = "0";
    flyClone.style.transform = "none";
    flyClone.style.zIndex = "1500";
    flyClone.style.pointerEvents = "none";
    flyClone.style.transition = "none";
    document.body.appendChild(flyClone);
    thumb.style.visibility = "hidden";

    var infoEls = [titleEl, metaEl, tagsEl, countEl];
    var tl = gsap.timeline({
      onComplete: function () {
        animating = null;
        if (flyClone) { flyClone.remove(); flyClone = null; }
        renderMedia();
        renderThumbs();
      }
    });
    animating = tl;
    // 0: thumbnail bay về khung ảnh lớn (0.7s).
    tl.to(flyClone, {
      left: to.left, top: to.top, width: to.width, height: to.height,
      borderRadius: 10, duration: 0.7, ease: "power3.inOut"
    }, 0);
    // 0.15: thông tin cũ trượt lên và mờ đi.
    tl.to(infoEls, {
      y: -20, opacity: 0, duration: 0.25, ease: "power2.in", stagger: 0.03
    }, 0.15);
    // 0.4: đổi nội dung (lúc đang mờ nên không thấy).
    tl.add(function () { renderInfo(); }, 0.4);
    // 0.45: thông tin mới trượt lên từ dưới.
    tl.fromTo(infoEls, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.05
    }, 0.45);
    // 0.7: đổi ảnh lớn (lúc clone đã phủ kín khung) rồi dọn.
    tl.add(function () { renderMedia(); }, 0.7);
  }

  // Crossfade + trượt nhẹ (lùi lại, nhảy xa, không có thumbnail).
  function crossfadeTo(index, dir) {
    var infoEls = [titleEl, metaEl, tagsEl, countEl];
    if (!hasGsap || reduceMotion) {
      renderInfo();
      renderMedia();
      renderThumbs();
      return;
    }
    var tl = gsap.timeline({
      onComplete: function () {
        animating = null;
        renderThumbs();
      }
    });
    animating = tl;
    tl.to([imgEl].concat(infoEls), {
      opacity: 0, y: dir > 0 ? -18 : 18, duration: 0.25, ease: "power2.in", stagger: 0.02
    }, 0);
    tl.add(function () {
      renderInfo();
      renderMedia();
    }, 0.28);
    tl.fromTo([imgEl].concat(infoEls), { opacity: 0, y: dir > 0 ? 18 : -18 }, {
      opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.04
    }, 0.3);
  }

  /* ---------- Cuộn để chuyển dự án ----------
     Mỗi dự án chiếm một màn hình cuộn; index = vị trí cuộn
     chia cho chiều cao viewport. Dùng rAF để không tính
     lại liên tục trong từng sự kiện cuộn. */
  function indexFromScroll() {
    var vh = window.innerHeight || 1;
    var i = Math.floor(window.scrollY / vh);
    return Math.max(0, Math.min(i, list.length - 1));
  }

  function onScroll() {
    // Mobile: viewer không ghim nên cuộn trang không đổi dự án
    // (chuyển dự án bằng thumbnail và filter).
    if (window.innerWidth <= 900) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var i = indexFromScroll();
      if (i !== current) goTo(i);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // Đổi kích thước màn hình thì tính lại index theo vị trí cuộn.
  window.addEventListener("resize", function () {
    var i = indexFromScroll();
    if (i !== current) goTo(i);
  });

  // Bàn phím: mũi tên xuống/lên để chuyển dự án (chỉ desktop,
  // khi viewer đang ghim).
  document.addEventListener("keydown", function (event) {
    if (lightbox && !lightbox.hidden) return; // lightbox tự xử lý phím
    if (window.innerWidth <= 900) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      var next = Math.min(current + 1, list.length - 1);
      window.scrollTo(0, next * window.innerHeight);
      goTo(next);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      var prev = Math.max(current - 1, 0);
      window.scrollTo(0, prev * window.innerHeight);
      goTo(prev);
    }
  });

  /* ---------- Hover ảnh lớn: tương tác như thẻ ----------
     Nhấc lên, nghiêng 3D theo chuột (rotateX/rotateY), bóng
     đổ mềm; ảnh bên trong zoom nhẹ bằng CSS. Khi rời chuột
     thì trở về thẳng. Chỉ chạy trên thiết bị có chuột. */
  if (finePointer && !reduceMotion && hasGsap) {
    gsap.set(mediaEl, { transformPerspective: 1200 });
    var tiltX = gsap.quickTo(mediaEl, "rotationY", { duration: 0.5, ease: "power2.out" });
    var tiltY = gsap.quickTo(mediaEl, "rotationX", { duration: 0.5, ease: "power2.out" });
    var liftY = gsap.quickTo(mediaEl, "y", { duration: 0.5, ease: "power2.out" });
    mediaEl.addEventListener("mousemove", function (event) {
      var r = mediaEl.getBoundingClientRect();
      var px = (event.clientX - r.left) / r.width - 0.5;
      var py = (event.clientY - r.top) / r.height - 0.5;
      tiltX(px * 8);
      tiltY(-py * 8);
      liftY(-6);
    });
    mediaEl.addEventListener("mouseleave", function () {
      tiltX(0);
      tiltY(0);
      liftY(0);
    });
  }

  /* ---------- Bấm ảnh lớn: phóng full màn hình ----------
     Bản staging chưa có trang case study nên mở lightbox xem
     full ảnh; khi trang case study được xây, chỗ này sẽ nối
     sang trang đó thay vì mở lightbox. Đóng bằng cách bấm
     lại ảnh, bấm nút Close hoặc Esc. */
  function fullRect() {
    var p = projectAt(current);
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var maxW = Math.min(vw * 0.92, 1600);
    var maxH = vh * 0.86;
    var ar = (p && p.width && p.height) ? p.width / p.height : 16 / 9;
    var w = maxW;
    var h = w / ar;
    if (h > maxH) { h = maxH; w = h * ar; }
    return {
      left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h
    };
  }

  function openLightbox() {
    var p = projectAt(current);
    if (!p) return;
    lightboxImg.src = p.image;
    lightboxImg.alt = p.alt;
    lightboxCap.textContent = p.title + (p.year ? " — " + p.year : "") + " — " + p.tag;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";

    if (!hasGsap || reduceMotion) return;
    // Bay từ khung ảnh lớn ra full màn hình.
    var from = mediaEl.getBoundingClientRect();
    var to = fullRect();
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
    };
    if (!hasGsap || reduceMotion) { done(); return; }
    var from = mediaEl.getBoundingClientRect();
    var frame = lightbox.querySelector(".wn-lightbox-frame");
    var r = frame.getBoundingClientRect();
    gsap.to(frame, {
      x: from.left - r.left, y: from.top - r.top,
      scaleX: from.width / r.width, scaleY: from.height / r.height,
      transformOrigin: "0 0", duration: 0.5, ease: "power3.inOut"
    });
    gsap.to(lightbox, { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: function () {
      gsap.set(frame, { clearProps: "all" });
      gsap.set(lightbox, { clearProps: "opacity" });
      done();
    }});
  }

  mediaEl.addEventListener("click", openLightbox);
  mediaEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox();
    }
  });
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox || event.target === lightboxImg) closeLightbox();
  });
  lightboxClose.addEventListener("click", function (event) {
    event.stopPropagation();
    closeLightbox();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  /* ---------- Khởi tạo ---------- */
  setTrackHeight();
  setFilter("All");
  renderAll();
  // Hiện viewer dần khi tải xong.
  requestAnimationFrame(function () {
    viewer.classList.add("is-ready");
  });
})();
