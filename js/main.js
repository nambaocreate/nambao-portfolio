// Nam Bao Portfolio — v13
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
// 4. Press chồng ngang từng card khi ghim, đúng kiểu Noho
//    Stories (wrapper ngoài cao 300vh, section trong
//    sticky 100svh, lúc đầu cuộn lên bình thường, tới khi
//    ghim thì card sau trượt sang trái đè lên card trước,
//    để lại dải mép, lần lượt từng card một, gap 0, tất cả
//    card có mặt từ trạng thái ban đầu, không hiện dần
//    từng cái).
// 5. Vòng ảnh 3D ở hero là code Claude (heroWheel.js +
//    hero-wheel.css, layout 'blades'): mỗi ảnh là một cánh
//    quạt đứng tỏa ra từ trục đứng như cửa xoay, ảnh đứng
//    thẳng chứ KHÔNG nằm phẳng, vòng tự quay liên tục
//    (16 độ/giây). Rê chuột làm cả cụm nghiêng theo con
//    trỏ có độ trễ mượt; cuộn chuột hoặc vuốt làm vòng quay
//    nhanh hơn rồi chậm dần về tốc độ gốc (listener passive
//    nên KHÔNG chặn cuộn, trang cuộn xuống About bình
//    thường); vào trang các ảnh bung ra theo thứ tự ngẫu
//    nhiên. Khởi tạo trong index.html (script module gọi
//    initHeroWheel), không còn logic wheel nào trong file
//    này.
// 6. Nav chữ đen cho mọi section: đã bỏ hẳn mix-blend-mode
//    difference và logic JS thêm class .nav-on-hero theo
//    scrollY (v10); nav luôn chữ đen trên mọi nền, logo là
//    SVG đen gốc, không cần filter invert.
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

  /* ---------- 4. Press chồng ngang từng card khi ghim ---------- */
  var pressWrap = document.querySelector(".press-wrap");
  var press = document.querySelector(".press");
  var pressRow = document.querySelector(".press-row");
  var pressCards = pressRow ? Array.from(pressRow.querySelectorAll(".press-card")) : [];
  var pressGeom = null; // { thresholds[], maxT }
  var pressTicking = false;

  // Đo hình học một lần (và mỗi lần đổi kích thước), không đo
  // trong từng khung cuộn để tránh layout thrashing.
  // Dải mép: 4 dải (card 1-4) + card áp cuối lộ 2 dải + card cuối
  // đủ rộng = 6 dải + cardW = chiều rộng khả dụng (W - 2*margin).
  // Ở viewport 1920, lề 40, card 520 thì dải mép = 220px, các
  // mép trái dừng ở x=40, 260, 480, 700, 920, card cuối ở
  // x=1360 (mép phải x=1880, cách mép phải viewport 40px).
  function measurePress() {
    pressGeom = null;
    if (!pressWrap || !press || !pressRow || pressCards.length < 2) return;
    var cardW = pressCards[0].offsetWidth;
    var width = press.clientWidth;
    var margin = parseFloat(window.getComputedStyle(pressRow).paddingLeft) || 0;
    if (!cardW || !width) return;
    var n = pressCards.length;
    var strip = (width - 2 * margin - cardW) / n;
    if (strip <= 0) return;
    var thresholds = pressCards.map(function (card, i) {
      var initialLeft = margin + i * cardW;
      var finalLeft = (i < n - 1) ? margin + i * strip : width - margin - cardW;
      return initialLeft - finalLeft;
    });
    pressGeom = { thresholds: thresholds, maxT: thresholds[n - 1] };
  }

  function updatePress() {
    pressTicking = false;
    if (!pressWrap || !pressRow || !pressCards.length) return;
    if (reduceMotion || window.innerWidth <= 900) {
      pressCards.forEach(function (card) { card.style.transform = ""; });
      return;
    }
    if (!pressGeom) measurePress();
    if (!pressGeom) return;
    // Tiến độ đo qua wrapper ngoài (cao 300vh): 0 khi wrapper
    // vừa chạm đỉnh viewport (section trong bắt đầu ghim),
    // 1 khi wrapper cuộn hết (section trong chuẩn bị nhả ghim
    // để Footer trượt lên đè nó). Lúc section trong đang trượt
    // lên đè Awards thì tiến độ vẫn là 0 nên card chưa chồng.
    var total = pressWrap.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var rect = pressWrap.getBoundingClientRect();
    var progress = Math.min(Math.max(-rect.top / total, 0), 1);
    // Chia tiến độ cuộn thành 5 đoạn bằng nhau, mỗi đoạn là một
    // lần đè (card 2 đè card 1, rồi card 3 đè card 2...). Mỗi đoạn
    // kết thúc đúng khi card đang đè tới vị trí dừng của nó.
    var n = pressCards.length;
    var seg = progress * (n - 1);
    var k = Math.min(Math.floor(seg), n - 2);
    var local = seg - k;
    var th = pressGeom.thresholds;
    var totalShift = th[k] + local * (th[k + 1] - th[k]);
    // Mỗi card trượt tối đa tới ngưỡng của nó rồi dừng; các card
    // chưa tới lượt vẫn trượt cùng nhau để hàng không bị hở,
    // card bị che đứng yên, card đang đè trượt lên nó.
    pressCards.forEach(function (card, i) {
      var shift = Math.min(totalShift, th[i]);
      card.style.transform = shift > 0
        ? "translate3d(" + (-shift).toFixed(1) + "px, 0, 0)"
        : "";
    });
  }

  function requestPress() {
    if (!pressTicking) {
      pressTicking = true;
      requestAnimationFrame(updatePress);
    }
  }

  if (pressWrap && pressRow && pressCards.length) {
    measurePress();
    window.addEventListener("scroll", requestPress, { passive: true });
    window.addEventListener("resize", function () { measurePress(); requestPress(); });
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
