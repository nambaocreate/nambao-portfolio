// Nam Bao Portfolio — trang Work MỚI, BẢN STAGING (work-new.html)
// Theo Figma Frame 26 (Section 1, node 1685:596) và các note
// của Bảo trong section. File RIÊNG, không động tới trang
// /work đang live (work.html, css/work.css, js/work.js) hay
// js/work-data.js (chỉ đọc để lấy dữ liệu gốc).
//
// Dữ liệu: đúng 7 dự án và thứ tự đã chốt (Vore, EGG:01,
// RMIT25, Đô Thành Cổ Tích, Tad.atelier, VIBE Expo,
// Tuổi Hồng 28), ảnh cover trong assets/work/.
// Năm: RMIT25 là 2025 (Figma), EGG:01 là 2025 (theo yêu cầu
// sửa, cần Bảo xác nhận), Tuổi Hồng 28 là 2024 (alt text),
// VIBE Expo là 2026 (tên dự án "VIBE 2026"). Vore, Đô Thành
// Cổ Tích, Tad.atelier CHƯA có năm trên record nên để trống
// (meta chỉ hiện category, không bịa năm).
// Tag: VIẾT HOA, thể hiện scope dự án (không thể hiện sector),
// mỗi dự án 3-5 tag. RMIT25 đã xác nhận từ Figma (logo design,
// identity design, event design); các dự án còn lại là tag đề
// xuất theo mô tả dự án, cần Bảo xác nhận sau.
//
// Cơ chế (bản staging v3):
// - Viewer là một màn hình cố định (track chỉ 100vh, trang không
//   cuộn); lăn chuột 1 lần thì sang đúng 1 dự án. Các lần lăn
//   trong lúc khóa được xếp hàng (wheelQueue) rồi chuyển tiếp
//   sau khi animation xong, nên lăn nhanh 3 lần thì qua đúng
//   3 dự án, không bị mất nhịp. Bấm thumbnail hoặc phím mũi tên
//   cũng chuyển được.
// - Khi sang dự án tiếp theo, thumbnail của dự án đó slide và
//   phóng to để chồng lên ảnh lớn bên phải (bay bằng GSAP, 0.7
//   giây); đồng thời thumbnail theo sau phóng to và dịch lên
//   trước cùng nhịp để lấp khoảng trống, không bị giật. Stack
//   luôn có sẵn 1 thumbnail dự trữ (reserve) ẩn sau thumbnail
//   back nên không tụt xuống 2 rồi mới thêm cái thứ 3.
// - Filter theo industry: chỉ còn dự án thuộc sector đó (cả khi
//   lăn chuột lẫn thumbnail); nút All để về tất cả. Bấm filter
//   thì thumbnail của dự án đích cũng bay lên ảnh lớn như khi
//   scroll (chạy được khi chạm trên iPad/mobile).
// - Số thứ tự đổi cùng lúc với tiêu đề, meta, tag và ảnh (lúc
//   đang mờ nên không thấy), không chạy trước nội dung.
// - Ảnh cũ mờ dần hoặc trượt đi mượt, không nháy thành khung xám
//   (nền container trong suốt) hay crop phóng to giữa chừng
//   (xóa style inline khi xong để về lại scale CSS).
// - Hover ảnh lớn: tương tác như thẻ (nhấc lên, nghiêng 3D theo
//   chuột, bóng đổ, ảnh trong zoom nhẹ), theo note "giống mục
//   selected work của radiance.family". Khi vừa chuyển dự án hoặc
//   vừa đóng lightbox, hover tạm tắt cho tới khi chuột thực sự
//   di chuyển trên ảnh.
// - Bấm ảnh lớn: ảnh phóng full màn hình (xem full ảnh); bản
//   staging chưa có trang case study nên chưa nối sang đó, sẽ
//   nối tiếp khi trang case study được xây.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover)").matches;
  var hasGsap = typeof window.gsap !== "undefined";

  /* ---------- Dữ liệu dự án (thứ tự đã chốt) ---------- */
  var PROJECTS = [
    {
      id: "vore", title: "Vore", year: "", tag: "Food & beverage",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION", "PRINT DESIGN"],
      image: "assets/work/vore.jpg",
      alt: "Ba poster của Vore treo trên tường",
      width: 1600, height: 900
    },
    {
      id: "egg01", title: "EGG:01", year: "2025", tag: "Food & beverage",
      tags: ["BRAND IDENTITY", "PACKAGING DESIGN", "PRODUCT DESIGN", "ART DIRECTION"],
      image: "assets/work/egg01.jpg",
      alt: "Hộp bạc EGG:01 cạnh chai thủy tinh gân sóng có lòng đỏ cam",
      width: 1400, height: 1356
    },
    {
      id: "rmit25", title: "RMIT 25th Anniversary Logo", year: "2025", tag: "Education",
      tags: ["LOGO DESIGN", "IDENTITY DESIGN", "EVENT DESIGN"],
      image: "assets/work/rmit25.jpg",
      alt: "Billboard 25 Years Of Progress trên mặt tiền gỗ",
      width: 1920, height: 1080
    },
    {
      id: "dothanh", title: "Đô Thành Cổ Tích", year: "", tag: "Art",
      tags: ["BRAND IDENTITY", "ILLUSTRATION", "WEB DESIGN", "ART DIRECTION"],
      image: "assets/work/dothanh.jpg",
      alt: "Laptop chạy website Phố Việt Cổ Truyện",
      width: 1393, height: 853
    },
    {
      id: "tad", title: "Tad.atelier", year: "", tag: "Architecture",
      tags: ["BRAND IDENTITY", "LOGO DESIGN", "ART DIRECTION"],
      image: "assets/work/tad.jpg",
      alt: "Board tổng hợp các dự án của Tad.atelier",
      width: 1400, height: 989
    },
    {
      id: "vibe", title: "VIBE Expo", year: "2026", tag: "Architecture",
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "EXHIBITION DESIGN", "STAGE DESIGN"],
      image: "assets/work/vibe.jpg",
      alt: "Render 3D sảnh expo cam của VIBE",
      width: 1000, height: 558
    },
    {
      id: "th28", title: "Tuổi Hồng 28", year: "2024", tag: "Entertainment",
      tags: ["BRAND IDENTITY", "EVENT DESIGN", "POSTER DESIGN", "ART DIRECTION"],
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
  var animating = null; // timeline GSAP đang chạy (để hủy khi chuyển nhanh)
  var flyClone = null; // bản sao thumbnail đang bay
  var tiltXFn = null, tiltYFn = null, liftYFn = null; // quickTo nghiêng ảnh lớn (để reset hover)

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

  // Hiệu ứng bay khi bấm filter: thumbnail của dự án đích (đầu danh
  // sách mới) bay từ vị trí thumbnail lên khung ảnh lớn, giống như
  // khi scroll. Chạy được khi chạm (bấm filter là sự kiện chạm trên
  // iPad/mobile), không chỉ khi lăn chuột. Stack cũ mờ dần rồi stack
  // mới hiện dần để số lượng không đổi đột ngột.
  function flyToFilter(thumb) {
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
    flyClone.style.willChange = "left, top, width, height";
    document.body.appendChild(flyClone);
    thumb.style.visibility = "hidden";

    var infoEls = [titleEl, metaEl, tagsEl, countEl];
    var tl = gsap.timeline({
      onComplete: function () {
        animating = null;
        if (flyClone) { flyClone.remove(); flyClone = null; }
        renderMedia();
        renderThumbs();
        // Stack mới hiện dần để số lượng không đổi đột ngột.
        if (hasGsap && !reduceMotion) {
          gsap.fromTo(thumbsEl, { opacity: 0 }, {
            opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "opacity"
          });
        }
        drainWheelQueue();
      }
    });
    animating = tl;
    // 0: thumbnail bay về khung ảnh lớn (0.7s).
    tl.to(flyClone, {
      left: to.left, top: to.top, width: to.width, height: to.height,
      borderRadius: 10, duration: 0.7, ease: "power3.inOut"
    }, 0);
    // 0.15: thông tin cũ và stack cũ mờ dần. Không dùng stagger:
    // số thứ tự, tiêu đề, meta và tag phải cùng một nhịp mờ, cùng
    // độ mờ ở mọi khung (stagger làm số chạy trước tiêu đề một nhịp).
    tl.to(infoEls, {
      y: -20, opacity: 0, duration: 0.25, ease: "power2.in"
    }, 0.15);
    tl.to(thumbsEl, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0.15);
    // 0.42: đổi nội dung sau khi TẤT CẢ đã mờ hẳn (mờ xong lúc 0.4),
    // lúc đang mờ nên không thấy, số mới không lộ ra khi còn mờ.
    tl.add(function () { renderInfo(); }, 0.42);
    // 0.45: thông tin mới trượt lên từ dưới, cùng một nhịp, không stagger.
    tl.fromTo(infoEls, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.45, ease: "power3.out",
      clearProps: "transform,opacity"
    }, 0.45);
    // 0.7: đổi ảnh lớn (lúc clone đã phủ kín khung) rồi dọn.
    tl.add(function () { renderMedia(); }, 0.7);
  }

  function setFilter(name) {
    activeFilter = name;
    filtersEl.querySelectorAll(".wn-filter").forEach(function (btn) {
      var on = btn.getAttribute("data-filter") === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    // Danh sách mới: chỉ còn dự án thuộc sector (All thì đủ 7).
    var newList = name === "All"
      ? PROJECTS.slice()
      : PROJECTS.filter(function (p) { return p.tag === name; });
    if (!newList.length) newList = PROJECTS.slice();
    var target = newList[0];
    var oldCurrent = projectAt(current);
    // Tìm thumbnail của dự án đích trong stack hiện tại (theo id, vì
    // index trong danh sách cũ khác danh sách mới). Nếu có thì làm
    // hiệu ứng bay từ thumbnail lên ảnh lớn như khi scroll; nếu
    // không có thì crossfade.
    var thumb = null;
    if (target && oldCurrent && target.id !== oldCurrent.id) {
      var oldIndex = -1;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === target.id) { oldIndex = i; break; }
      }
      if (oldIndex >= 0) {
        thumb = thumbsEl.querySelector('.wn-thumb[data-index="' + oldIndex + '"]');
      }
    }
    // Đổi filter thì xóa các lần lăn đang xếp hàng (danh sách đã đổi).
    wheelQueue = 0;
    cancelTransition();
    list = newList;
    current = 0;
    resetMediaHover();
    mediaEl.classList.add("wn-media--no-hover");
    setTrackHeight();
    window.scrollTo(0, 0);
    if (!target) { renderAll(); return; }
    if (oldCurrent && target.id === oldCurrent.id) {
      // Dự án đích đã là dự án đang xem (chỉ đổi danh sách), không
      // cần hiệu ứng, vẽ lại ngay.
      renderAll();
      return;
    }
    if (thumb && hasGsap && !reduceMotion) {
      flyToFilter(thumb);
    } else if (hasGsap && !reduceMotion) {
      crossfadeTo(0, 1);
    } else {
      renderAll();
    }
  }

  function setTrackHeight() {
    // Không còn track cuộn dài: viewer là một màn hình cố định,
    // chuyển dự án bằng sự kiện wheel (1 lần lăn = 1 dự án). Track
    // chỉ cao 100vh để trang không cuộn được. Mobile thì CSS đè
    // thành auto nên trang vẫn cuộn bình thường.
    track.style.height = "100vh";
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
    // 4 thumbnail: 3 cái hiện (front, mid, back) và 1 cái dự trữ
    // (reserve) đã đặt sẵn ở vị trí back, ẩn sau thumbnail back
    // (opacity 0, z-index 0). Khi thumbnail trước bay đi, reserve
    // đã có sẵn nên stack không tụt xuống 2 rồi mới thêm cái thứ 3
    // (đó là nguồn của flash ở bản trước). Reserve tải ngay (không
    // lazy) để sẵn sàng khi hiện ra, và không bấm/tab được.
    var next = [];
    for (var k = 1; k <= 4; k++) {
      var p = list[current + k];
      if (p) next.push({ p: p, index: current + k });
    }
    thumbsEl.classList.toggle("is-empty", next.length === 0);
    var cls = ["wn-thumb--front", "wn-thumb--mid", "wn-thumb--back", "wn-thumb--reserve"];
    thumbsEl.innerHTML = next.map(function (item, i) {
      var p = item.p;
      var isReserve = (i === 3);
      var loading = isReserve ? "" : ' loading="lazy"';
      var extra = isReserve ? ' tabindex="-1" aria-hidden="true"' : "";
      return '<button type="button" class="wn-thumb ' + cls[i] + '" data-index="' +
        item.index + '" aria-label="Tới dự án: ' + p.title + '"' + extra + '>' +
        '<img src="' + p.image + '" alt=""' + loading + ' decoding="async">' +
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
    // Bấm thumbnail là chuyển chủ động, xóa các lần lăn đang xếp hàng
    // để không nhảy thêm sau khi đã nhảy tới dự án này.
    wheelQueue = 0;
    goTo(index);
    // Mobile: viewer không ghim nên về đầu trang để thấy viewer.
    if (window.innerWidth <= 900) window.scrollTo(0, 0);
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
    // Trả lại trạng thái cho stack thumbnail (xóa style inline mà GSAP
    // đã đặt khi bay, và opacity của container khi fade).
    thumbsEl.style.opacity = "";
    thumbsEl.querySelectorAll(".wn-thumb").forEach(function (t) {
      t.style.visibility = "";
      t.style.opacity = "";
      t.style.transform = "";
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

    // Vừa đổi dự án thì tắt hover trên ảnh lớn cho tới khi chuột thực
    // sự di chuyển (tránh dự án mới hiện ra đã ở trạng thái hover chỉ
    // vì con trỏ đang ở giữa viewport, nằm trên mép trái ảnh).
    resetMediaHover();
    mediaEl.classList.add("wn-media--no-hover");

    if (thumb && hasGsap && !reduceMotion) {
      flyTo(index, thumb);
    } else {
      crossfadeTo(index, dir);
    }
    // Số thứ tự KHÔNG cập nhật ngay ở đây nữa: renderInfo() sẽ đổi
    // số cùng lúc với tiêu đề, meta và tag trong lúc hiệu ứng (lúc
    // đang mờ nên không thấy), tránh số chạy trước nội dung.
  }

  // Hiệu ứng bay: clone thumbnail rồi phóng to về đúng khung ảnh lớn.
  // Animate left/top/width/height để tỉ lệ khung đổi dần từ 1.3
  // (thumbnail) sang 1.66 (ảnh lớn) nên ảnh crop lại mượt, giống
  // thumbnail "lớn lên" thành ảnh lớn. Đồng thời thumbnail theo sau
  // (mid, back) phóng to và dịch lên trước cùng nhịp 0.7 giây để
  // lấp khoảng trống, không bị giật cụt. Bản trước không thấy bay
  // vì cơ chế cuộn cũ gọi goTo liên tục làm hủy timeline đang chạy;
  // giờ chuyển bằng wheel có khóa 0.8 giây nên hiệu ứng chạy trọn.
  function flyTo(index, thumb) {
    var from = thumb.getBoundingClientRect();
    var to = mediaEl.getBoundingClientRect();

    // Thumbnail theo sau: mid sẽ thành front, back sẽ thành mid,
    // reserve (đã đặt sẵn ở vị trí back, ẩn sau back) sẽ hiện ra ở
    // vị trí back để stack luôn đủ, không tụt xuống 2 rồi mới thêm 3.
    var midThumb = thumbsEl.querySelector(".wn-thumb--mid");
    var backThumb = thumbsEl.querySelector(".wn-thumb--back");
    var reserveThumb = thumbsEl.querySelector(".wn-thumb--reserve");

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
    flyClone.style.willChange = "left, top, width, height";
    document.body.appendChild(flyClone);
    thumb.style.visibility = "hidden";

    // Tắt transition CSS trên thumbnail theo sau để GSAP điều khiển
    // (tránh CSS transition làm trễ/chồng với GSAP).
    if (midThumb) midThumb.style.transition = "none";
    if (backThumb) backThumb.style.transition = "none";
    if (reserveThumb) reserveThumb.style.transition = "none";

    var infoEls = [titleEl, metaEl, tagsEl, countEl];
    var tl = gsap.timeline({
      onComplete: function () {
        animating = null;
        if (flyClone) { flyClone.remove(); flyClone = null; }
        renderMedia();
        renderThumbs();
        // Reserve mới đã có sẵn trong stack vừa vẽ (ẩn sau back),
        // không cần fade in cái back mới nữa (đó là nguồn của flash
        // 2 lên 3 ở bản trước). Xử lý các lần lăn đang xếp hàng.
        drainWheelQueue();
      }
    });
    animating = tl;
    // 0: thumbnail bay về khung ảnh lớn (0.7s).
    tl.to(flyClone, {
      left: to.left, top: to.top, width: to.width, height: to.height,
      borderRadius: 10, duration: 0.7, ease: "power3.inOut"
    }, 0);
    // 0: thumbnail theo sau phóng to và dịch lên trước, cùng nhịp 0.7s
    // (mid thành front: x 39 thành 118, rộng 136 thành 153;
    // back thành mid: x 0 thành 39, rộng 118 thành 136).
    if (midThumb) {
      tl.to(midThumb, {
        x: 118, y: 0, width: 153, duration: 0.7, ease: "power3.inOut"
      }, 0);
    }
    if (backThumb) {
      tl.to(backThumb, {
        x: 39, y: 0, width: 136, duration: 0.7, ease: "power3.inOut"
      }, 0);
    }
    // 0: reserve hiện dần ở vị trí back (đã đặt sẵn sau back).
    if (reserveThumb) {
      tl.to(reserveThumb, {
        opacity: 1, duration: 0.7, ease: "power3.inOut"
      }, 0);
    }
    // 0.15: thông tin cũ trượt lên và mờ đi. Không dùng stagger:
    // số thứ tự, tiêu đề, meta và tag phải cùng một nhịp mờ, cùng
    // độ mờ ở mọi khung (stagger làm số chạy trước tiêu đề một nhịp).
    tl.to(infoEls, {
      y: -20, opacity: 0, duration: 0.25, ease: "power2.in"
    }, 0.15);
    // 0.42: đổi nội dung sau khi TẤT CẢ đã mờ hẳn (mờ xong lúc 0.4),
    // lúc đang mờ nên không thấy, số mới không lộ ra khi còn mờ.
    tl.add(function () { renderInfo(); }, 0.42);
    // 0.45: thông tin mới trượt lên từ dưới, cùng một nhịp, không stagger.
    tl.fromTo(infoEls, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.45, ease: "power3.out",
      clearProps: "transform,opacity"
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
      drainWheelQueue();
      return;
    }
    var tl = gsap.timeline({
      onComplete: function () {
        animating = null;
        renderThumbs();
        // Stack mới hiện dần để số lượng thumbnail không đổi đột ngột.
        if (hasGsap && !reduceMotion) {
          gsap.fromTo(thumbsEl, { opacity: 0 }, {
            opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "opacity"
          });
        }
        drainWheelQueue();
      }
    });
    animating = tl;
    // Ảnh cũ và thông tin mờ dần (không nháy thành khung xám: nền
    // container đã trong suốt nên lúc mờ chỉ thấy nền trang).
    // Không dùng stagger: số thứ tự, tiêu đề, meta, tag và ảnh phải
    // cùng một nhịp mờ, cùng độ mờ ở mọi khung.
    tl.to([imgEl].concat(infoEls), {
      opacity: 0, y: dir > 0 ? -18 : 18, duration: 0.25, ease: "power2.in"
    }, 0);
    // Stack cũ mờ dần cùng lúc để số lượng không đổi đột ngột.
    tl.to(thumbsEl, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0);
    tl.add(function () {
      renderInfo();
      renderMedia();
    }, 0.28);
    tl.fromTo([imgEl].concat(infoEls), { opacity: 0, y: dir > 0 ? 18 : -18 }, {
      opacity: 1, y: 0, duration: 0.5, ease: "power3.out",
      // Xóa style inline khi xong để ảnh lớn về lại scale CSS (1.02)
      // và hover zoom (1.07) không bị kẹt ở crop phóng to.
      clearProps: "transform,opacity"
    }, 0.3);
  }

  /* ---------- Lăn chuột để chuyển dự án: 1 lần lăn = 1 dự án ----------
     Trước đây dùng track cuộn dài (mỗi dự án 100vh) nên phải lăn
     3 lần mới đủ 100vh để qua dự án tiếp theo, người dùng không
     hiểu ngay. Giờ viewer là một màn hình cố định (track chỉ
     100vh, trang không cuộn), bắt sự kiện wheel: một lần lăn
     (deltaY vượt ngưỡng nhỏ) thì chuyển đúng một dự án, kèm khóa
     0.8 giây để không nhảy cóc khi lăn nhanh. Khóa cũng ngăn hiệu
     ứng bay đang chạy bị hủy bởi lần lăn tiếp theo. Mobile thì
     không dùng wheel (viewer không ghim, trang cuộn bình thường,
     chuyển dự án bằng thumbnail và filter). */
  var wheelLockUntil = 0;
  var wheelQueue = 0; // số bước lăn đang xếp hàng (dương = xuống, âm = lên)
  var WHEEL_THRESHOLD = 12; // ngưỡng deltaY (px) để tính là một lần lăn
  var WHEEL_LOCK_MS = 800; // khóa sau mỗi lần chuyển

  // Xử lý các lần lăn đang xếp hàng sau khi animation xong: mỗi lần
  // chỉ chuyển 1 dự án, đặt lại khóa rồi chuyển tiếp nếu còn xếp hàng.
  // Nhờ vậy lăn nhanh 3 lần thì qua đúng 3 dự án, không bị mất nhịp.
  function drainWheelQueue() {
    if (wheelQueue === 0) return;
    var dir = wheelQueue > 0 ? 1 : -1;
    wheelQueue -= dir;
    wheelLockUntil = Date.now() + WHEEL_LOCK_MS;
    goTo(Math.min(Math.max(current + dir, 0), list.length - 1));
  }

  function onWheel(event) {
    if (window.innerWidth <= 900) return; // mobile: để trang cuộn bình thường
    if (lightbox && !lightbox.hidden) return; // lightbox đang mở thì không chuyển
    var dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16; // delta theo dòng thì đổi ra px
    else if (event.deltaMode === 2) dy *= window.innerHeight; // delta theo trang
    if (Math.abs(dy) < WHEEL_THRESHOLD) return;
    event.preventDefault();
    var dir = dy > 0 ? 1 : -1;
    var now = Date.now();
    if (now < wheelLockUntil) {
      // Đang khóa: xếp hàng thay vì bỏ qua. Chỉ xếp nếu còn dự án
      // ở hướng đó (tính theo vị trí hiện tại cộng số bước đã xếp).
      var projected = current + wheelQueue + dir;
      if (projected >= 0 && projected <= list.length - 1) {
        wheelQueue += dir;
      }
      return;
    }
    wheelLockUntil = now + WHEEL_LOCK_MS;
    goTo(Math.min(Math.max(current + dir, 0), list.length - 1));
  }

  window.addEventListener("wheel", onWheel, { passive: false });

  // Bàn phím: mũi tên xuống/lên để chuyển dự án (chỉ desktop,
  // khi viewer đang ghim).
  document.addEventListener("keydown", function (event) {
    if (lightbox && !lightbox.hidden) return; // lightbox tự xử lý phím
    if (window.innerWidth <= 900) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      wheelQueue = 0;
      goTo(Math.min(current + 1, list.length - 1));
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      wheelQueue = 0;
      goTo(Math.max(current - 1, 0));
    }
  });

  /* ---------- Hover ảnh lớn: tương tác như thẻ ----------
     Nhấc lên, nghiêng 3D theo chuột (rotateX/rotateY), bóng
     đổ mềm; ảnh bên trong zoom nhẹ bằng CSS. Khi rời chuột
     thì trở về thẳng. Chỉ chạy trên thiết bị có chuột. */
  function resetMediaHover() {
    // Đưa ảnh lớn về trạng thái thẳng, không nghiêng/nhấc (dùng khi
    // vừa đổi dự án hoặc vừa đóng lightbox, để không dính zoom).
    if (tiltXFn) tiltXFn(0);
    if (tiltYFn) tiltYFn(0);
    if (liftYFn) liftYFn(0);
  }

  if (finePointer && !reduceMotion && hasGsap) {
    gsap.set(mediaEl, { transformPerspective: 1200 });
    tiltXFn = gsap.quickTo(mediaEl, "rotationY", { duration: 0.5, ease: "power2.out" });
    tiltYFn = gsap.quickTo(mediaEl, "rotationX", { duration: 0.5, ease: "power2.out" });
    liftYFn = gsap.quickTo(mediaEl, "y", { duration: 0.5, ease: "power2.out" });
    mediaEl.addEventListener("mousemove", function (event) {
      var r = mediaEl.getBoundingClientRect();
      var px = (event.clientX - r.left) / r.width - 0.5;
      var py = (event.clientY - r.top) / r.height - 0.5;
      tiltXFn(px * 8);
      tiltYFn(-py * 8);
      liftYFn(-6);
    });
    mediaEl.addEventListener("mouseleave", function () {
      resetMediaHover();
    });
  }

  // Chuột thực sự di chuyển trên ảnh thì bật lại hover (gỡ class
  // wn-media--no-hover mà goTo/closeLightbox đã thêm).
  mediaEl.addEventListener("mousemove", function () {
    mediaEl.classList.remove("wn-media--no-hover");
  });

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
      // Trả ảnh inline về khung bình thường: reset nghiêng/nhấc và tắt
      // hover cho tới khi chuột thực sự di chuyển (tránh dính zoom sau
      // khi đóng, và tránh bóng ma do hover kẹt).
      resetMediaHover();
      mediaEl.classList.add("wn-media--no-hover");
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
