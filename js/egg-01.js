// EGG:01 — trang Claude (nambaocreate.github.io/egg01) tích hợp vào site chính.
// Phần đầu là main.js của Claude giữ nguyên: Lenis smooth scroll +
// tách chữ theo dòng + reveal theo data-reveal. Phần sau là code của
// site chính: nav trắng/đen theo vị trí cuộn (như js/case-study.js)
// và lightbox xem ảnh lớn (tái dùng CSS .cs-lightbox ở css/case-study.css).
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Claude: Lenis smooth scroll ---------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    window.__eggLenis = lenis;
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ---------- Claude: tách chữ theo dòng + reveal ---------- */
  document.documentElement.classList.add("js");

  var splitLines = function (el) {
    var text = el.dataset.src != null ? el.dataset.src : el.textContent.trim();
    el.dataset.src = text;
    el.innerHTML = text.split(/\s+/).map(function (w) {
      return '<span class="w">' + w + "</span>";
    }).join(" ");
    var lines = [];
    var top = null;
    el.querySelectorAll(".w").forEach(function (w) {
      if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.innerHTML = lines.map(function (l, i) {
      return '<span class="ln"><span style="--i:' + i + '">' + l.join(" ") + "</span></span>";
    }).join("");
  };

  var texts = Array.prototype.slice.call(document.querySelectorAll('[data-reveal="text"]'));
  var run = function () { texts.forEach(splitLines); };

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    run();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

    var w = window.innerWidth, t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { if (window.innerWidth !== w) { w = window.innerWidth; run(); } }, 200);
    });
  });

  /* ---------- Site: nav trắng trên hero, đen khi cuộn qua hero ----------
     Như js/case-study.js (navMode). Nav cố định trên cùng (xem
     css/case-study.css .cs-hero .nav). Đáy hero vừa qua đáy nav
     (70px) thì nav đen, còn không thì nav trắng. */
  (function navMode() {
    var navEl = document.querySelector(".cs-nav");
    var hero = document.getElementById("cs-hero");
    if (!navEl || !hero) return;
    var ticking = false;
    function update() {
      ticking = false;
      var past = hero.getBoundingClientRect().bottom <= 70;
      navEl.classList.toggle("cs-nav--dark", past);
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  })();

  /* ---------- Site: lightbox xem ảnh lớn ----------
     Bấm bất kỳ ảnh nào trong trang (hero + mọi ảnh nội dung) thì mở
     pop up xem ảnh đó ở độ phân giải đầy đủ. Không tính ảnh ở mục
     Other projects: đó là link sang dự án khác, bấm vào vẫn chuyển
     trang như cũ. Tái dùng đúng lightbox của site (xem
     js/case-study.js): nền tối 0.94, ảnh object-fit contain, nút
     Close, mũi tên hai bên, số thứ tự, caption. */
  (function lightbox() {
    var imgs = Array.prototype.slice.call(
      document.querySelectorAll(".cs-hero-img, .egg .media img")
    ).filter(function (img) { return !img.closest(".others a"); });
    if (!imgs.length) return;
    var total = imgs.length;

    function captionOf(img) {
      var fig = img.closest("figure");
      var cap = fig ? fig.querySelector("figcaption") : null;
      if (cap && cap.textContent) return cap.textContent;
      return img.alt || "";
    }

    var box = document.createElement("div");
    box.className = "cs-lightbox";
    box.setAttribute("hidden", "");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Xem ảnh lớn");
    box.innerHTML =
      '<div class="cs-lightbox-frame"><img alt=""></div>' +
      '<button type="button" class="cs-lightbox-close">Close</button>' +
      '<button type="button" class="cs-lightbox-prev" aria-label="Ảnh trước">‹</button>' +
      '<button type="button" class="cs-lightbox-next" aria-label="Ảnh sau">›</button>' +
      '<p class="cs-lightbox-cap"></p>' +
      '<p class="cs-lightbox-count"></p>';
    document.body.appendChild(box);

    var lbImg = box.querySelector(".cs-lightbox-frame img");
    var lbCap = box.querySelector(".cs-lightbox-cap");
    var lbCount = box.querySelector(".cs-lightbox-count");
    var lbClose = box.querySelector(".cs-lightbox-close");
    var lbPrev = box.querySelector(".cs-lightbox-prev");
    var lbNext = box.querySelector(".cs-lightbox-next");

    var current = 0;
    var isOpen = false;
    var lastFocus = null;
    var hideTimer = null;
    var prevBodyOverflow = "";

    function preload(i) {
      var pre = new Image();
      pre.src = imgs[(i + total) % total].src;
    }

    function show(i) {
      current = (i + total) % total;
      var img = imgs[current];
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      lbImg.width = img.width;
      lbImg.height = img.height;
      lbCap.textContent = captionOf(img);
      lbCount.textContent = (current + 1) + " / " + total;
      preload(current + 1);
      preload(current - 1);
    }

    function open(i) {
      if (isOpen) { show(i); return; }
      isOpen = true;
      lastFocus = document.activeElement;
      show(i);
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      box.hidden = false;
      prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (window.__eggLenis) window.__eggLenis.stop();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { box.classList.add("is-open"); });
      });
      lbClose.focus();
    }

    function close(instant) {
      if (!isOpen) return;
      isOpen = false;
      box.classList.remove("is-open");
      document.body.style.overflow = prevBodyOverflow;
      if (window.__eggLenis) window.__eggLenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      if (instant || reduceMotion) {
        box.hidden = true;
      } else {
        hideTimer = setTimeout(function () { box.hidden = true; }, 320);
      }
    }

    imgs.forEach(function (img, i) {
      img.addEventListener("click", function () { open(i); });
    });
    lbClose.addEventListener("click", function () { close(); });
    lbPrev.addEventListener("click", function (e) { e.stopPropagation(); show(current - 1); });
    lbNext.addEventListener("click", function (e) { e.stopPropagation(); show(current + 1); });
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target === lbImg) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
    });
    window.addEventListener("pagehide", function () { close(true); });

    // Hover ảnh thì con trỏ hiện đĩa đen chữ View, cùng hệ con trỏ
    // Read/Open/coming soon của site (xem js/main.js).
    if (finePointer && !reduceMotion) {
      var cursorEl = document.querySelector(".cursor");
      if (cursorEl) {
        imgs.forEach(function (img) {
          img.addEventListener("mouseenter", function () { cursorEl.classList.add("cursor--view"); });
          img.addEventListener("mouseleave", function () { cursorEl.classList.remove("cursor--view"); });
        });
      }
    }
  })();
})();
