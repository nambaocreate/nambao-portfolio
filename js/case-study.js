// Nam Bao Portfolio — renderer trang case study (dùng chung)
// Đọc slug từ <main id="cs-root" data-study="...">, lấy dữ liệu từ
// js/case-study-data.js (window.CASE_STUDIES) rồi vẽ toàn bộ trang:
// hero, tiêu đề + meta, intro, từng section, credits, next project.
// Thêm dự án mới không cần sửa file này, chỉ thêm dữ liệu + ảnh.
// Ảnh luôn hiện ở tỉ lệ gốc (width/height thật, CSS chỉ giới hạn
// chiều rộng hiển thị), không crop.
//
// Chuyển trang: bấm ảnh lớn bên /work sẽ chạy hiệu ứng mở rộng
// bằng tay (xem js/work-new.js, overlay phóng to rồi mới chuyển
// trang, chỉ chuyển khi ảnh hero đích đã tải và giải mã xong),
// không dùng View Transitions API nữa, để chắc chắn mượt trên
// mọi trình duyệt và không bị chớp trắng.

(function () {
  "use strict";

  var root = document.getElementById("cs-root");
  if (!root) return;
  var slug = root.getAttribute("data-study");
  var data = (window.CASE_STUDIES || {})[slug];
  if (!data) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.title = data.title + " — Nam Bảo";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Một ảnh + caption (caption là <p> dưới ảnh, theo đúng Figma).
  // eager chỉ dùng cho hero, còn lại lazy để trang nhẹ.
  // Mỗi ảnh reveal riêng (cs-reveal trên figure), không reveal
  // cả section, để đường wipe quét qua từng ảnh đang hiện rõ.
  function figure(img, caption, eager) {
    var f = el("figure", "cs-figure cs-reveal");
    var im = document.createElement("img");
    im.src = img.src;
    im.alt = img.alt || "";
    im.width = img.width;
    im.height = img.height;
    im.loading = eager ? "eager" : "lazy";
    im.decoding = "async";
    if (eager) im.setAttribute("fetchpriority", "high");
    f.appendChild(im);
    if (caption) f.appendChild(el("figcaption", "cs-caption", caption));
    return f;
  }

  // Cột chữ reveal riêng (cs-reveal trên cột), không reveal cả
  // section, để mỗi khối chữ có motion wipe riêng khi cuộn tới.
  function textBlocks(blocks) {
    var col = el("div", "cs-textcol cs-reveal");
    (blocks || []).forEach(function (b) {
      if (b.t === "h") {
        col.appendChild(el("h2", "cs-texthead", b.text));
      } else {
        var p = el("p", "cs-body", b.text);
        if (b.w) p.style.maxWidth = b.w + "px";
        col.appendChild(p);
      }
    });
    return col;
  }

  /* ---------- Hero: ảnh tràn full chiều rộng, nav đè lên trên ----------
     Ảnh rộng 100%, cao tự động theo đúng tỉ lệ gốc, không crop,
     kéo xuống dưới fold (xem css/case-study.css). */
  var hero = el("header", "cs-hero");
  var heroImg = document.createElement("img");
  heroImg.className = "cs-hero-img";
  heroImg.src = data.hero.src;
  heroImg.alt = data.hero.alt || "";
  heroImg.width = data.hero.width;
  heroImg.height = data.hero.height;
  heroImg.loading = "eager";
  heroImg.decoding = "async";
  heroImg.setAttribute("fetchpriority", "high");
  hero.appendChild(heroImg);
  var nav = document.querySelector(".cs-nav");
  if (nav) hero.appendChild(nav);
  root.appendChild(hero);

  /* ---------- Tiêu đề + Meta ---------- */
  var head = el("section", "cs-head");
  var titleBox = el("div", "cs-titlebox cs-reveal");
  titleBox.appendChild(el("h1", "cs-title", data.title));
  if (data.subtitle) titleBox.appendChild(el("p", "cs-subtitle", data.subtitle));
  head.appendChild(titleBox);
  var meta = el("dl", "cs-meta cs-reveal");
  data.meta.forEach(function (m) {
    var item = el("div", "cs-meta-item");
    item.appendChild(el("dt", "cs-meta-label", m.label));
    item.appendChild(el("dd", "cs-meta-value", m.value));
    meta.appendChild(item);
  });
  head.appendChild(meta);
  root.appendChild(head);

  /* ---------- Intro ---------- */
  if (data.intro) {
    var intro = el("section", "cs-intro");
    intro.appendChild(el("h2", "cs-label cs-reveal", data.intro.label));
    var paras = el("div", "cs-intro-paras cs-reveal");
    data.intro.paragraphs.forEach(function (t) {
      paras.appendChild(el("p", "cs-intro-p", t));
    });
    intro.appendChild(paras);
    root.appendChild(intro);
  }

  /* ---------- Sections ---------- */
  data.sections.forEach(function (s) {
    var sec;
    if (s.type === "full") {
      sec = el("section", "cs-sec cs-full");
      sec.appendChild(figure(s.image, s.caption));
    } else if (s.type === "trio") {
      sec = el("section", "cs-sec cs-trio");
      s.images.forEach(function (im) { sec.appendChild(figure(im, im.caption)); });
    } else if (s.type === "duo") {
      sec = el("section", "cs-sec cs-duo");
      s.images.forEach(function (im) { sec.appendChild(figure(im, im.caption)); });
    } else if (s.type === "pair") {
      sec = el("section", "cs-sec cs-pair");
      s.images.forEach(function (im) {
        var f = figure(im, im.caption);
        if (im.w) f.style.width = im.w + "px";
        sec.appendChild(f);
      });
    } else if (s.type === "portrait") {
      sec = el("section", "cs-sec cs-portrait");
      sec.appendChild(figure(s.image, s.caption));
    } else if (s.type === "text-image") {
      sec = el("section", "cs-sec cs-textimage" + (s.align === "center" ? " cs-textimage--center" : ""));
      var imgFig = figure(s.image, s.image.caption);
      // Ảnh co lại khi màn hẹp (max-width = số đo Figma), không đè cột chữ.
      imgFig.style.maxWidth = (s.imageWidth || 1220) + "px";
      var col = textBlocks(s.text);
      // Cột chữ giữ đúng rộng Figma (293, hoặc textWidth riêng), không co lại:
      // đặt cả width lẫn min-width để không bao giờ co dưới rộng Figma,
      // ảnh bên cạnh nhận hết phần co (xem css .cs-textimage .cs-figure).
      var colW = (s.textWidth || 293) + "px";
      col.style.width = colW;
      col.style.minWidth = colW;
      // Figma đặt ảnh trái hay phải theo từng section (xem data).
      if (s.imageSide === "left") { sec.appendChild(imgFig); sec.appendChild(col); }
      else { sec.appendChild(col); sec.appendChild(imgFig); }
    } else if (s.type === "text") {
      sec = el("section", "cs-sec cs-textsec");
      sec.appendChild(el("h2", "cs-texthead cs-reveal", s.heading));
      var body = el("div", "cs-textbody cs-reveal");
      s.paragraphs.forEach(function (t) { body.appendChild(el("p", "cs-body", t)); });
      sec.appendChild(body);
    } else {
      return;
    }
    // Không reveal cả section nữa: từng ảnh (figure) và từng khối
    // chữ (textcol, texthead, textbody) đã có cs-reveal riêng.
    root.appendChild(sec);
  });

  /* ---------- Credits (chỉ dự án có) ---------- */
  if (data.credits) {
    var cred = el("section", "cs-sec cs-credits cs-reveal");
    cred.appendChild(el("h2", "cs-label", data.credits.label));
    data.credits.lines.forEach(function (line) {
      cred.appendChild(el("p", "cs-credit", line));
    });
    root.appendChild(cred);
  }

  /* ---------- Next Project: Work Card có ảnh cover kèm tên ---------- */
  if (data.next && data.next.length) {
    var next = el("section", "cs-next");
    next.appendChild(el("h2", "cs-label cs-reveal", "Next Project"));
    var row = el("div", "cs-next-row");
    data.next.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "cs-next-card cs-reveal";
      a.href = p.href;
      if (p.cover) {
        var cover = el("span", "cs-next-cover");
        var cimg = document.createElement("img");
        cimg.src = p.cover.src;
        cimg.alt = p.cover.alt || "";
        cimg.width = p.cover.width;
        cimg.height = p.cover.height;
        cimg.loading = "lazy";
        cimg.decoding = "async";
        cover.appendChild(cimg);
        a.appendChild(cover);
      }
      var trow = el("span", "cs-next-titlerow");
      trow.appendChild(el("span", "cs-next-title", p.title));
      if (p.tag) trow.appendChild(el("span", "cs-next-tag", p.tag));
      a.appendChild(trow);
      row.appendChild(a);
    });
    next.appendChild(row);
    root.appendChild(next);
    // Hover card Next Project thì con trỏ hiện đĩa đen chữ Open
    // (cùng hệ con trỏ của trang Work, xem main.js). Chỉ trên
    // thiết bị có chuột và không giảm chuyển động.
    if (finePointer && !reduceMotion) {
      var cursorEl = document.querySelector(".cursor");
      if (cursorEl) {
        row.querySelectorAll(".cs-next-card").forEach(function (card) {
          card.addEventListener("mouseenter", function () { cursorEl.classList.add("cursor--open"); });
          card.addEventListener("mouseleave", function () { cursorEl.classList.remove("cursor--open"); });
        });
      }
    }
  }

  /* ---------- Footer (dùng chung markup với trang chủ) ---------- */
  var footer = el("footer", "footer cs-footer cs-reveal");
  footer.id = "contact";
  footer.innerHTML =
    '<div class="footer-top">' +
      '<p class="footer-copy">©2026 NAM BAO</p>' +
      '<div class="footer-cols">' +
        '<ul class="footer-socials"><li>Instagram</li><li>Facebook</li><li>LinkedIn</li><li>Behance</li></ul>' +
        '<div class="footer-touch"><h2 class="footer-touch-title">Get in touch</h2>' +
        '<a class="footer-email" href="mailto:nambao.create@gmail.com">nambao.create@gmail.com</a></div>' +
      '</div>' +
    '</div>' +
    '<img class="footer-logo" src="../assets/logo-footer.svg" alt="nam bao" width="1784" height="384">';
  root.appendChild(footer);

  /* ---------- Nav: trắng trên hero, đen khi cuộn qua hero ----------
     Nav cố định trên cùng (xem css/case-study.css). Khi hero còn
     hiện thì nav trắng, đọc được trên ảnh tối; cuộn qua hero sang
     section tiếp theo thì nav đổi sang đen, đọc được trên nền sáng.
     Đổi bằng class theo vị trí cuộn, không dùng mix-blend-mode. */
  (function navMode() {
    var navEl = document.querySelector(".cs-nav");
    if (!navEl || !hero) return;
    // Scrim sau nav, chỉ trang TH28 (nền hồng nhạt ở đầu hero làm chữ
    // trắng khó đọc). Tạo một lần, bật/tắt cùng lúc với màu nav.
    var scrim = null;
    if (slug === "tuoi-hong-28") {
      scrim = document.createElement("div");
      scrim.className = "cs-nav-scrim";
      scrim.setAttribute("aria-hidden", "true");
      document.body.appendChild(scrim);
    }
    var ticking = false;
    function update() {
      ticking = false;
      // Đáy hero vừa qua đáy nav (70px) thì nav đen, còn không thì
      // nav trắng. Đo bằng rect của hero cho chắc, không dựa vào
      // offsetHeight (sai khi ảnh hero chưa tải xong).
      var past = hero.getBoundingClientRect().bottom <= 70;
      navEl.classList.toggle("cs-nav--dark", past);
      if (scrim) scrim.classList.toggle("is-on", !past);
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  })();

  /* ---------- Reveal khi cuộn: clip-path, không fade, không slide ----------
     Mỗi ảnh và mỗi khối chữ (không phải cả section) bắt đầu bị cắt
     100% từ trên (xem css .cs-reveal), khi vào khung nhìn thì clip
     mở về 0, vùng hiện mở rộng dần từ dưới lên như một đường vô
     hình chạy lên. Không áp cho hero (nav cố định nằm trong hero).
     Nếu người dùng giảm chuyển động thì hiện hết ngay, không để
     nội dung bị ẩn.
     Vì sao đợt trước không thấy motion: reveal làm theo từng section
     (khối cao 800-1100px) và kích hoạt khi đỉnh section vừa chạm đáy
     viewport (92%). Wipe lộ từ dưới lên, mà đáy section nằm xa dưới
     viewport nên gần như toàn bộ đường wipe chạy ngoài màn hình, chỉ
     thấy phần cuối rất ngắn, lẫn với chuyển động cuộn nên không nhận
     ra. Cách sửa: reveal theo từng ảnh và từng khối chữ (nhỏ hơn,
     vừa khung nhìn hơn) và kích hoạt khi đỉnh phần tử đã vào sâu
     trong viewport (70%), để đường wipe quét qua phần tử đang hiện
     rõ trên màn hình.
     Không dùng IntersectionObserver: phần tử bị clip-path cắt về
     diện tích 0 nên observer không bao giờ thấy nó giao nhau (vòng
     lặp bế tắc). Chỉ dùng bộ kiểm tra theo vị trí hình học
     (getBoundingClientRect, không bị clip-path ảnh hưởng), chạy khi
     cuộn, đổi kích thước, lúc tải trang, và lặp lại trong vài giây
     đầu. Nhờ vậy nội dung không bao giờ bị ẩn vĩnh viễn. */
  (function reveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".cs-reveal"));
    if (!els.length) return;
    if (reduceMotion) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    // Danh sách phần tử chưa hiện; rút ngắn dần khi từng cái hiện ra.
    var pending = els.slice();
    function inView(el) {
      // getBoundingClientRect trả về khung layout, không bị clip-path
      // ảnh hưởng, nên đo được dù phần tử đang bị cắt ẩn.
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // Đã cuộn qua rồi (đáy nằm trên mép viewport) thì hiện luôn,
      // không để ẩn mãi. Còn không thì hiện khi đỉnh đã vào sâu
      // trong viewport (70%) để đường wipe quét qua phần tử đang
      // hiện rõ, không chạy ngoài màn hình.
      if (r.bottom <= 0) return true;
      return r.top < vh * 0.7 && r.bottom > 0;
    }
    function check() {
      if (!pending.length) return;
      pending = pending.filter(function (el) {
        if (inView(el)) { el.classList.add("is-in"); return false; }
        return true;
      });
    }
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { ticking = false; check(); });
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Hoãn lần kiểm tra đầu sang frame sau để trình duyệt vẽ xong
    // trạng thái cắt ẩn trước, rồi mới thêm is-in thì transition
    // clip-path mới chạy; nếu thêm ngay trong cùng tác vụ vẽ thì
    // phần tử hiện luôn mà không có chuyển động.
    requestAnimationFrame(check);
    // Lưới an toàn: lặp lại trong 5 giây đầu, phòng khi sự kiện cuộn
    // bị lỡ; sau 5 giây thì dừng để không chạy mãi.
    var guard = setInterval(function () {
      check();
      if (!pending.length) { clearInterval(guard); }
    }, 400);
    setTimeout(function () { clearInterval(guard); }, 5000);
  })();
})();
