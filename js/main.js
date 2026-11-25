// Nam Bao Portfolio — v7
// 1. Chữ cuộn từng ký tự khi hover (nav, tên dự án và tag
//    trên trang Work), theo nav của brandonyasin.com và
//    motion gốc noho.ink (xem trực tiếp, không copy code):
//    mỗi ký tự cuộn 0,3 giây, KHÔNG stagger, mọi chữ
//    cuộn CÙNG LÚC như một khối (delay 0ms cho mọi ký
//    tự). Đã bỏ ở các hàng Awards trên homepage và mọi
//    chỗ khác.
// 2. Mọi element hiện dần khi cuộn vào khung nhìn.
// 3. Con trỏ tròn "Read" trên thẻ Press, "Open" trên ảnh
//    trang Work.
// 4. Press là hàng ngang ghim theo cuộn như Noho Stories
//    (section cao 200vh, khung trong sticky 100svh, cuộn
//    dọc trượt hàng thẻ sang trái, gap 0, tất cả card có
//    mặt từ trạng thái ban đầu, không hiện dần từng cái).
// Tôn trọng prefers-reduced-motion và thiết bị cảm ứng.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover)").matches;

  /* ---------- 1. Chữ cuộn từng ký tự (cùng lúc) ---------- */
  document.querySelectorAll("[data-roll]").forEach(function (el) {
    var text = el.textContent;
    el.textContent = "";
    var buildCopy = function (hidden) {
      var copy = document.createElement("span");
      copy.className = "roll-copy";
      if (hidden) copy.setAttribute("aria-hidden", "true");
      Array.from(text).forEach(function (ch) {
        var letter = document.createElement("span");
        letter.className = "roll-letter";
        letter.textContent = ch === " " ? " " : ch;
        copy.appendChild(letter);
      });
      return copy;
    };
    el.appendChild(buildCopy(false));
    el.appendChild(buildCopy(true));
  });

  /* ---------- 2. Hiện dần khi cuộn ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal--fade, .reveal-clip");

  // Stagger tự động: các con trong [data-stagger] lệch nhau 90ms.
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.from(group.children).forEach(function (child, i) {
      if (!child.style.getPropertyValue("--d")) {
        child.style.setProperty("--d", i * 90 + "ms");
      }
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 3. Con trỏ "Read" / "Open" ---------- */
  var cursor = document.querySelector(".cursor");
  if (cursor && finePointer && !reduceMotion) {
    var tx = -100, ty = -100, cx = -100, cy = -100, shown = false, raf = null;

    var place = function () {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      cursor.style.transform = "translate(" + cx + "px, " + cy + "px) translate(-50%, -50%)";
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(place);
      } else {
        raf = null;
      }
    };

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        cx = tx;
        cy = ty;
        cursor.classList.add("is-on");
      }
      if (!raf) raf = requestAnimationFrame(place);
    });

    document.addEventListener("mouseleave", function () {
      shown = false;
      cursor.classList.remove("is-on");
    });

    // Thẻ Press thì đĩa hiện chữ Read.
    document.querySelectorAll(".press-card").forEach(function (card) {
      card.addEventListener("mouseenter", function () { cursor.classList.add("cursor--read"); });
      card.addEventListener("mouseleave", function () { cursor.classList.remove("cursor--read"); });
    });

    // Ảnh trên trang Work thì đĩa hiện chữ Open. Chỉ hover
    // đúng vào ảnh mới hiện, hover tên hay tag thì không.
    // (work.js vẽ card trước main.js nên .work-media đã có.)
    document.querySelectorAll(".work-media").forEach(function (media) {
      media.addEventListener("mouseenter", function () { cursor.classList.add("cursor--open"); });
      media.addEventListener("mouseleave", function () { cursor.classList.remove("cursor--open"); });
    });
  }

  /* ---------- 4. Press ghim ngang theo cuộn ---------- */
  var press = document.querySelector(".press");
  var pressRow = document.querySelector(".press-row");
  var pressTicking = false;

  function updatePress() {
    pressTicking = false;
    if (!press || !pressRow) return;
    if (reduceMotion || window.innerWidth <= 900) {
      pressRow.style.transform = "";
      return;
    }
    var total = press.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var rect = press.getBoundingClientRect();
    var progress = Math.min(Math.max(-rect.top / total, 0), 1);
    // Tính điểm dừng từ mép phải của thẻ cuối + lề phải 40px,
    // không dùng scrollWidth vì flex container bỏ qua padding
    // phải khi tính vùng cuộn, làm thẻ cuối dừng sát mép màn hình.
    var last = pressRow.lastElementChild;
    var padRight = parseFloat(window.getComputedStyle(pressRow).paddingRight) || 0;
    var maxX = last.offsetLeft + last.offsetWidth + padRight - pressRow.clientWidth;
    if (maxX <= 0) return;
    pressRow.style.transform = "translate3d(" + (-progress * maxX).toFixed(1) + "px, 0, 0)";
  }

  function requestPress() {
    if (!pressTicking) {
      pressTicking = true;
      requestAnimationFrame(updatePress);
    }
  }

  if (press && pressRow) {
    window.addEventListener("scroll", requestPress, { passive: true });
    window.addEventListener("resize", requestPress);
    updatePress();
  }

  /* ---------- Cuộn mượt tới anchor ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
})();
