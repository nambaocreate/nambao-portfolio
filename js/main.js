// Nam Bao Portfolio — v2
// Motion tham khảo noho.ink (xem rồi tự viết lại, không copy code):
// 1. Chữ cuộn từng ký tự khi hover (nav, hàng Awards).
// 2. Mọi element hiện dần khi cuộn vào khung nhìn.
// 3. Con trỏ tròn "Read" trên thẻ Press.
// Tôn trọng prefers-reduced-motion và thiết bị cảm ứng.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover)").matches;

  /* ---------- 1. Chữ cuộn từng ký tự ---------- */
  document.querySelectorAll("[data-roll]").forEach(function (el) {
    var text = el.textContent;
    el.textContent = "";
    var buildCopy = function (hidden) {
      var copy = document.createElement("span");
      copy.className = "roll-copy";
      if (hidden) copy.setAttribute("aria-hidden", "true");
      Array.from(text).forEach(function (ch, i) {
        var letter = document.createElement("span");
        letter.className = "roll-letter";
        letter.style.setProperty("--i", i);
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

  /* ---------- 3. Con trỏ "Read" trên thẻ Press ---------- */
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

    document.querySelectorAll(".press-card").forEach(function (card) {
      card.addEventListener("mouseenter", function () { cursor.classList.add("cursor--read"); });
      card.addEventListener("mouseleave", function () { cursor.classList.remove("cursor--read"); });
    });
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
