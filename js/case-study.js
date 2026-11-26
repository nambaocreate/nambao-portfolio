// Nam Bao Portfolio — renderer trang case study (dùng chung)
// Đọc slug từ <main id="cs-root" data-study="...">, lấy dữ liệu từ
// js/case-study-data.js (window.CASE_STUDIES) rồi vẽ toàn bộ trang:
// hero, tiêu đề + meta, intro, từng section, credits, next project.
// Thêm dự án mới không cần sửa file này, chỉ thêm dữ liệu + ảnh.
// Ảnh luôn hiện ở tỉ lệ gốc (width/height thật, CSS chỉ giới hạn
// chiều rộng hiển thị), không crop.
//
// View transition: ảnh hero mang view-transition-name trùng với ảnh
// lớn của dự án đó bên trang /work (xem js/work-new.js), và cả hai
// trang đều bật `@view-transition { navigation: auto; }` nên bấm
// ảnh lớn bên /work sẽ morph thành hero ở đây. Trình duyệt không
// hỗ trợ thì chỉ là chuyển trang thường.

(function () {
  "use strict";

  var root = document.getElementById("cs-root");
  if (!root) return;
  var slug = root.getAttribute("data-study");
  var data = (window.CASE_STUDIES || {})[slug];
  if (!data) return;

  document.title = data.title + " — Nam Bảo";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Một ảnh + caption (caption là <p> dưới ảnh, theo đúng Figma).
  // eager chỉ dùng cho hero, còn lại lazy để trang nhẹ.
  function figure(img, caption, eager) {
    var f = el("figure", "cs-figure");
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

  function textBlocks(blocks) {
    var col = el("div", "cs-textcol");
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

  /* ---------- Hero: ảnh full-bleed, nav đè lên trên ---------- */
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
  var titleBox = el("div", "cs-titlebox");
  titleBox.appendChild(el("h1", "cs-title", data.title));
  if (data.subtitle) titleBox.appendChild(el("p", "cs-subtitle", data.subtitle));
  head.appendChild(titleBox);
  var meta = el("dl", "cs-meta");
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
    intro.appendChild(el("h2", "cs-label", data.intro.label));
    var paras = el("div", "cs-intro-paras");
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
      // Cột chữ giữ đúng rộng Figma (293, hoặc textWidth riêng), không co lại.
      col.style.width = (s.textWidth || 293) + "px";
      // Figma đặt ảnh trái hay phải theo từng section (xem data).
      if (s.imageSide === "left") { sec.appendChild(imgFig); sec.appendChild(col); }
      else { sec.appendChild(col); sec.appendChild(imgFig); }
    } else if (s.type === "text") {
      sec = el("section", "cs-sec cs-textsec");
      sec.appendChild(el("h2", "cs-texthead", s.heading));
      var body = el("div", "cs-textbody");
      s.paragraphs.forEach(function (t) { body.appendChild(el("p", "cs-body", t)); });
      sec.appendChild(body);
    } else {
      return;
    }
    root.appendChild(sec);
  });

  /* ---------- Credits (chỉ dự án có) ---------- */
  if (data.credits) {
    var cred = el("section", "cs-sec cs-credits");
    cred.appendChild(el("h2", "cs-label", data.credits.label));
    data.credits.lines.forEach(function (line) {
      cred.appendChild(el("p", "cs-credit", line));
    });
    root.appendChild(cred);
  }

  /* ---------- Next Project: Work Card có ảnh cover kèm tên ---------- */
  if (data.next && data.next.length) {
    var next = el("section", "cs-next");
    next.appendChild(el("h2", "cs-label", "Next Project"));
    var row = el("div", "cs-next-row");
    data.next.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "cs-next-card";
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
  }

  /* ---------- Footer (dùng chung markup với trang chủ) ---------- */
  var footer = el("footer", "footer cs-footer");
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
    var ticking = false;
    function update() {
      ticking = false;
      // Đáy hero vừa qua đáy nav thì nav đen, còn không thì nav trắng.
      var past = window.scrollY >= hero.offsetHeight - 70;
      navEl.classList.toggle("cs-nav--dark", past);
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  })();
})();
