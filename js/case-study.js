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
     kéo xuống dưới fold (xem css/case-study.css). Hero đã viết
     sẵn trong HTML (work/egg-01.html, work/tuoi-hong-28.html)
     để frame đầu tiên đã có ảnh, không nháy; ở đây chỉ dùng lại,
     chỉ tạo mới khi mở trang mà không có hero sẵn. */
  var hero = document.getElementById("cs-hero");
  if (!hero) {
    hero = el("header", "cs-hero");
    hero.id = "cs-hero";
    var heroImg = document.createElement("img");
    heroImg.className = "cs-hero-img";
    heroImg.src = data.hero.src;
    heroImg.alt = data.hero.alt || "";
    heroImg.width = data.hero.width;
    heroImg.height = data.hero.height;
    heroImg.loading = "eager";
    heroImg.decoding = "sync";
    heroImg.setAttribute("fetchpriority", "high");
    hero.appendChild(heroImg);
    var nav = document.querySelector(".cs-nav");
    if (nav) hero.appendChild(nav);
    root.insertBefore(hero, root.firstChild);
  }

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
      // Grid: ảnh 5 cột (1530px) mặc định, riêng section chữ rộng
      // (TH28 slot cuối) là 4 cột (1220px). Ảnh co lại khi màn
      // hẹp để không đè cột chữ.
      imgFig.style.maxWidth = (s.imageWidth || 1530) + "px";
      var col = textBlocks(s.text);
      // Grid: cột chữ 1 cột (290px) mặc định, riêng section chữ
      // rộng là 2 cột (600px). Đặt cả width lẫn min-width để cột
      // không bao giờ co dưới rộng grid; ảnh bên cạnh nhận hết
      // phần co. Khoảng cách chữ tới ảnh là gutter 20px (xem css
      // .cs-textimage), nhất quán ở mọi section.
      var colW = (s.textWidth || 290) + "px";
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
    '<p class="footer-logo footer-draw" aria-hidden="true">' +
            '<svg class="footer-logo-svg" viewBox="0 0 9382.8 2048" aria-hidden="true" focusable="false">' +
      '  <g class="fl-letter" style="--dd:0.00s;--dur:0.39s">' +
      '    <path pathLength="1" d="M1113.0,1123.0 Q1113.0,1214.0 1166.0,1214.0 Q1296.0,1214.0 1504.0,1038.0 L1531.0,1015.0 Q1612.0,961.0 1662.5,961.0 Q1713.0,961.0 1726.5,976.0 Q1740.0,991.0 1740.0,1024.0 Q1740.0,1098.0 1665.0,1181.0 Q1553.0,1317.0 1358.0,1439.0 Q1132.0,1581.0 953.0,1581.0 Q828.0,1581.0 796.0,1442.0 Q787.0,1406.0 783.0,1373.0 Q773.0,1293.0 762.0,1284.0 Q751.0,1275.0 718.5,1285.5 Q686.0,1296.0 641.5,1320.5 Q597.0,1345.0 543.0,1380.0 Q257.0,1570.0 214.0,1597.0 Q111.0,1661.0 75.0,1661.0 Q39.0,1661.0 4.5,1646.0 Q-30.0,1631.0 -56.0,1608.0 Q-110.0,1557.0 -110.0,1504.0 Q-110.0,1201.0 22.0,974.0 Q110.0,821.0 238.0,762.0 Q303.0,731.0 378.0,731.0 Q515.0,731.0 515.0,821.0 Q515.0,876.0 450.0,1001.0 L420.0,1060.0 Q388.0,1121.0 389.0,1129.0 Q395.0,1159.0 416.0,1159.0 Q439.0,1159.0 484.0,1125.0 L668.0,988.0 L760.0,924.0 Q919.0,820.0 994.0,820.0 Q1034.0,820.0 1067.0,852.0 Q1128.0,910.0 1128.0,953.0 Q1128.0,967.0 1125.5,987.0 Q1123.0,1007.0 1120.0,1030.0 L1116.0,1077.0 Q1113.0,1101.0 1113.0,1123.0 Z"/>' +
      '  </g>' +
      '  <g class="fl-letter" style="--dd:0.39s;--dur:0.46s">' +
      '    <path pathLength="1" d="M3206.6,909.0 Q3238.6,909.0 3238.6,963.0 Q3238.6,1056.0 3108.6,1204.0 L3051.6,1262.0 Q2792.6,1521.0 2563.6,1607.0 Q2421.6,1660.0 2359.6,1602.0 Q2308.6,1553.0 2278.6,1444.0 L2254.6,1357.0 L2041.6,1488.0 L1918.6,1558.0 Q1698.6,1678.0 1588.6,1678.0 Q1447.6,1678.0 1353.6,1569.0 Q1263.6,1466.0 1263.6,1330.0 Q1263.6,1196.0 1370.6,1091.0 Q1523.6,941.0 1853.6,816.0 Q2165.6,699.0 2357.6,699.0 Q2422.6,699.0 2422.6,763.0 Q2422.6,807.0 2405.6,829.0 Q2388.6,851.0 2335.6,874.0 L2209.6,928.0 Q1929.6,1045.0 1799.6,1171.0 Q1762.6,1206.0 1762.6,1239.0 Q1762.6,1272.0 1815.6,1272.0 Q1867.6,1272.0 2057.6,1160.0 L2140.6,1111.0 Q2333.6,995.0 2463.6,995.0 Q2573.6,995.0 2609.6,1092.0 Q2618.6,1118.0 2626.6,1144.5 Q2634.6,1171.0 2642.6,1192.0 Q2660.6,1241.0 2675.1,1241.0 Q2689.6,1241.0 2716.6,1226.5 Q2743.6,1212.0 2776.1,1189.5 Q2808.6,1167.0 2843.6,1140.0 L2964.6,1043.0 Q3125.6,909.0 3206.6,909.0 Z"/>' +
      '  </g>' +
      '  <g class="fl-letter" style="--dd:0.85s;--dur:0.62s">' +
      '    <path pathLength="1" d="M4836.1,1112.0 Q4836.1,1259.0 4928.1,1259.0 Q4992.1,1259.0 5149.1,1147.0 Q5291.1,1042.0 5318.1,1015.0 Q5380.1,963.0 5448.1,963.0 Q5477.1,963.0 5497.6,982.5 Q5518.1,1002.0 5518.1,1041.0 Q5518.1,1080.0 5499.1,1112.0 Q5480.1,1144.0 5450.6,1178.0 Q5421.1,1212.0 5377.6,1254.0 Q5334.1,1296.0 5278.1,1342.5 Q5222.1,1389.0 5155.6,1435.0 Q5089.1,1481.0 5018.1,1518.0 Q4858.1,1600.0 4729.1,1600.0 Q4581.1,1600.0 4528.1,1466.0 Q4497.1,1389.0 4497.1,1281.0 L4206.1,1478.0 Q3907.1,1688.0 3850.1,1701.0 Q3821.1,1708.0 3791.6,1708.0 Q3762.1,1708.0 3736.1,1702.5 Q3710.1,1697.0 3690.1,1684.0 Q3644.1,1657.0 3644.1,1604.0 Q3644.1,1583.0 3672.1,1502.0 L3758.1,1266.0 Q3798.1,1152.0 3798.1,1129.0 Q3798.1,1121.0 3788.1,1121.0 Q3778.1,1121.0 3751.1,1142.0 Q3724.1,1163.0 3686.1,1196.0 L3448.1,1404.0 L3323.1,1508.0 Q3131.1,1661.0 3010.1,1661.0 Q2953.1,1661.0 2895.1,1610.0 Q2832.1,1556.0 2832.1,1480.0 Q2832.1,1404.0 2846.6,1314.0 Q2861.1,1224.0 2888.1,1140.5 Q2915.1,1057.0 2955.1,983.5 Q2995.1,910.0 3046.1,856.0 Q3156.1,738.0 3305.6,738.0 Q3455.1,738.0 3455.1,826.0 Q3455.1,864.0 3414.1,942.0 Q3327.1,1114.0 3327.1,1127.5 Q3327.1,1141.0 3335.6,1148.5 Q3344.1,1156.0 3354.1,1156.0 Q3375.1,1156.0 3414.1,1122.0 Q3671.1,897.0 3737.6,843.0 Q3804.1,789.0 3866.1,748.0 Q4008.1,655.0 4092.1,655.0 Q4161.1,655.0 4204.1,677.0 Q4279.1,716.0 4279.1,765.0 Q4279.1,814.0 4265.6,876.0 Q4252.1,938.0 4236.1,996.0 L4206.1,1098.0 Q4192.1,1142.0 4192.1,1165.5 Q4192.1,1189.0 4212.1,1189.0 Q4260.1,1189.0 4403.1,1053.0 L4500.1,962.0 Q4667.1,812.0 4753.1,812.0 Q4794.1,812.0 4826.1,844.0 Q4882.1,900.0 4882.1,942.0 Q4882.1,965.0 4866.1,1004.0 Q4836.1,1077.0 4836.1,1112.0 Z"/>' +
      '  </g>' +
      '  <g class="fl-letter" style="--dd:1.47s;--dur:0.49s">' +
      '    <path pathLength="1" d="M5707.7,1206.0 Q5578.7,1279.0 5532.2,1317.5 Q5485.7,1356.0 5456.2,1385.0 Q5426.7,1414.0 5397.7,1438.0 Q5329.7,1494.0 5294.7,1494.0 Q5259.7,1494.0 5231.7,1482.5 Q5203.7,1471.0 5180.7,1450.0 Q5126.7,1399.0 5126.7,1329.0 Q5126.7,1205.0 5345.7,842.0 Q5439.7,686.0 5527.7,567.5 Q5615.7,449.0 5696.7,365.5 Q5777.7,282.0 5851.7,224.0 Q6003.7,105.0 6093.7,105.0 Q6119.7,105.0 6136.7,124.0 Q6153.7,143.0 6153.7,165.0 Q6153.7,215.0 6122.2,268.5 Q6090.7,322.0 6038.7,403.0 L5825.7,726.0 Q5725.7,880.0 5721.2,898.5 Q5716.7,917.0 5716.7,925.0 Q5716.7,933.0 5727.7,933.0 Q5738.7,933.0 5789.7,910.0 Q5789.7,910.0 5917.7,852.0 Q6206.7,726.0 6384.7,726.0 Q6485.7,726.0 6553.7,819.0 Q6616.7,906.0 6616.7,1007.0 Q6616.7,1108.0 6585.7,1181.0 Q6554.7,1254.0 6494.2,1296.0 Q6433.7,1338.0 6373.7,1374.0 L6245.7,1450.0 Q5882.7,1653.0 5718.7,1653.0 Q5491.7,1653.0 5491.7,1535.0 Q5491.7,1471.0 5553.7,1440.0 Q6124.7,1131.0 6149.7,1115.0 Q6201.7,1082.0 6201.7,1052.0 Q6201.7,1022.0 6159.7,1022.0 Q6117.7,1022.0 6067.7,1038.0 Q6017.7,1054.0 5957.7,1080.0 Q5897.7,1106.0 5832.7,1139.0 Q5767.7,1172.0 5707.7,1206.0 Z"/>' +
      '  </g>' +
      '  <g class="fl-letter" style="--dd:1.96s;--dur:0.46s">' +
      '    <path pathLength="1" d="M8291.2,909.0 Q8323.2,909.0 8323.2,963.0 Q8323.2,1056.0 8193.2,1204.0 L8136.2,1262.0 Q7877.2,1521.0 7648.2,1607.0 Q7506.2,1660.0 7444.2,1602.0 Q7393.2,1553.0 7363.2,1444.0 L7339.2,1357.0 L7126.2,1488.0 L7003.2,1558.0 Q6783.2,1678.0 6673.2,1678.0 Q6532.2,1678.0 6438.2,1569.0 Q6348.2,1466.0 6348.2,1330.0 Q6348.2,1196.0 6455.2,1091.0 Q6608.2,941.0 6938.2,816.0 Q7250.2,699.0 7442.2,699.0 Q7507.2,699.0 7507.2,763.0 Q7507.2,807.0 7490.2,829.0 Q7473.2,851.0 7420.2,874.0 L7294.2,928.0 Q7014.2,1045.0 6884.2,1171.0 Q6847.2,1206.0 6847.2,1239.0 Q6847.2,1272.0 6900.2,1272.0 Q6952.2,1272.0 7142.2,1160.0 L7225.2,1111.0 Q7418.2,995.0 7548.2,995.0 Q7658.2,995.0 7694.2,1092.0 Q7703.2,1118.0 7711.2,1144.5 Q7719.2,1171.0 7727.2,1192.0 Q7745.2,1241.0 7759.7,1241.0 Q7774.2,1241.0 7801.2,1226.5 Q7828.2,1212.0 7860.7,1189.5 Q7893.2,1167.0 7928.2,1140.0 L8049.2,1043.0 Q8210.2,909.0 8291.2,909.0 Z"/>' +
      '  </g>' +
      '  <g class="fl-letter" style="--dd:2.42s;--dur:0.39s">' +
      '    <path pathLength="1" d="M9082.8,1044.0 Q9082.8,1098.0 9174.8,1098.0 Q9242.8,1098.0 9352.8,1032.0 L9432.8,988.0 Q9469.8,967.0 9497.3,967.0 Q9524.8,967.0 9540.8,984.0 Q9556.8,1001.0 9556.8,1031.0 Q9556.8,1061.0 9536.8,1100.5 Q9516.8,1140.0 9481.8,1183.5 Q9446.8,1227.0 9399.8,1269.5 Q9352.8,1312.0 9298.8,1346.0 Q9178.8,1421.0 9075.8,1421.0 Q8966.8,1421.0 8901.8,1384.0 Q8881.8,1372.0 8862.8,1359.0 Q8755.8,1481.0 8552.8,1583.0 Q8336.8,1691.0 8175.8,1691.0 Q8006.8,1691.0 7908.8,1558.0 Q7829.8,1450.0 7829.8,1339.0 Q7829.8,1179.0 8000.8,1034.0 Q8126.8,928.0 8244.3,873.0 Q8361.8,818.0 8456.8,788.0 Q8657.8,725.0 8818.8,725.0 Q8890.8,725.0 8947.3,752.5 Q9003.8,780.0 9030.8,808.0 Q9094.8,871.0 9094.8,969.0 Q9094.8,998.0 9088.8,1014.0 Q9082.8,1030.0 9082.8,1044.0 Z"/>' +
      '    <path pathLength="1" d="M8264.8,1233.0 L8263.8,1236.0 L8263.8,1237.0 Q8263.8,1280.0 8282.8,1293.0 Q8328.8,1321.0 8379.8,1307.5 Q8430.8,1294.0 8476.8,1274.0 Q8590.8,1225.0 8682.8,1150.0 Q8666.8,1118.0 8666.8,1084.0 Q8666.8,1012.0 8729.8,940.0 Q8649.8,940.0 8513.8,1015.0 Q8363.8,1098.0 8288.8,1186.0 Q8264.8,1216.0 8264.8,1233.0 Z"/>' +
      '  </g>' +
      '</svg></p>';
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
     đầu. Nhờ vậy nội dung không bao giờ bị ẩn vĩnh viễn.
     Ảnh bị pop vì sao: ảnh trong figure dùng loading="lazy" và
     figure bị clip về diện tích 0 nên trình duyệt không tải ảnh
     cho tới khi clip mở ra; wipe 0.9s chạy xong trước khi ảnh tải
     về, nên wipe chỉ lộ ra khung trống rồi ảnh hiện đột ngột. Cách
     sửa: khi figure sắp vào viewport (1.5 chiều cao màn hình) thì
     tải trước ảnh, và chỉ wipe khi ảnh đã sẵn (tải xong hoặc lỗi),
     quá 4 giây thì hiện luôn để không ẩn mãi. */
  (function reveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".cs-reveal"));
    if (!els.length) return;
    if (reduceMotion) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    // Ảnh bị pop vì sao: ảnh trong figure dùng loading="lazy" và
    // figure bị clip-path cắt về diện tích 0 nên trình duyệt không
    // tải ảnh cho tới khi clip mở ra. Wipe 0.9s chạy xong trước khi
    // ảnh tải về (mỗi ảnh 70-650KB), nên wipe chỉ lộ ra khung trống
    // (nền trang), rồi ảnh hiện đột ngột khi tải xong. Cách sửa: khi
    // figure sắp vào viewport (trong 1.5 chiều cao màn hình) thì tải
    // trước ảnh (đưa vào HTTP cache) và chỉ bắt đầu wipe khi ảnh đã
    // sẵn, để wipe lộ ra ảnh thật. Khối chữ (không có ảnh) thì reveal
    // ngay như cũ. Ảnh lỗi hoặc quá chậm thì hiện luôn sau 4 giây,
    // không để nội dung bị ẩn vĩnh viễn.
    var preloadCache = {};
    var pending = els.slice();
    var WAIT_MS = 4000;
    function preloadFor(img) {
      if (!img || !img.src) return null;
      var src = img.src;
      if (preloadCache[src]) return preloadCache[src];
      if (img.complete) {
        preloadCache[src] = { ready: true };
        return preloadCache[src];
      }
      // Chuyển img trong DOM sang eager để nó bắt đầu tải ngay
      // (best-effort; trình duyệt nào không nhận thì preload dưới
      // đây vẫn đưa ảnh vào HTTP cache).
      try { img.loading = "eager"; } catch (e) {}
      var entry = { ready: false };
      preloadCache[src] = entry;
      var pre = new Image();
      pre.onload = function () { entry.ready = true; check(); };
      pre.onerror = function () { entry.ready = true; check(); };
      pre.src = src;
      return entry;
    }
    function imgReady(el) {
      var img = el.querySelector("img");
      if (!img) return true;
      // complete là true cả khi tải xong lẫn khi lỗi; lỗi thì coi
      // như sẵn để hiện luôn chứ không ẩn mãi.
      if (img.complete) return true;
      var entry = preloadCache[img.src];
      if (entry && entry.ready) return true;
      return false;
    }
    function check() {
      if (!pending.length) return;
      var now = Date.now();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        // Đã cuộn qua rồi thì hiện luôn, không đợi ảnh (người dùng
        // đã qua khỏi, không còn thấy wipe nữa).
        if (r.bottom <= 0) { el.classList.add("is-in"); return false; }
        // Sắp vào viewport (trong 1.5 chiều cao màn hình) thì bắt
        // đầu tải ảnh trước để khi tới lượt wipe thì ảnh đã sẵn.
        if (r.top < vh * 1.5) {
          var img = el.querySelector("img");
          if (img) preloadFor(img);
        }
        // Vào sâu trong viewport (70%) và ảnh đã sẵn thì mới wipe,
        // để wipe lộ ra ảnh thật chứ không phải khung trống.
        if (r.top < vh * 0.7 && r.bottom > 0) {
          if (imgReady(el)) { el.classList.add("is-in"); return false; }
          // Quá 4 giây mà ảnh vẫn chưa sẵn thì hiện luôn, tránh
          // để trống mãi vì mạng chậm hoặc ảnh lỗi.
          if (!el._trigSince) el._trigSince = now;
          if (now - el._trigSince > WAIT_MS) { el.classList.add("is-in"); return false; }
        } else {
          el._trigSince = null;
        }
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

  /* ---------- Lightbox xem ảnh lớn ----------
     Bấm bất kỳ ảnh nào trong trang case study (hero + mọi ảnh
     nội dung trong .cs-figure) thì mở pop up xem ảnh đó ở độ
     phân giải đầy đủ (dùng đúng URL ảnh gốc, đã cache sẵn).
     Không tính ảnh cover Next Project: đó là link sang dự án
     khác, bấm vào vẫn chuyển trang như cũ. Overlay tạo bằng JS
     một lần, nằm ngoài .cs-root nên không động tới reveal
     clip-path khi cuộn hay View Transition khi vào/ra trang.
     Đóng bằng nút Close, bấm ra ngoài ảnh (nền overlay hoặc
     chính ảnh, đúng như lightbox cũ của trang Work), hoặc Esc.
     Mũi tên hai bên và phím mũi tên trái/phải chuyển qua lại
     giữa các ảnh trong cùng case study (quay vòng), kèm số thứ
     tự và caption (figcaption nếu có, không thì alt của ảnh).
     Mở lightbox thì khóa cuộn nền, đóng thì trả lại; focus
     chuyển vào nút Close khi mở và trả về ảnh đã bấm khi đóng.
     Hover ảnh thì con trỏ hiện đĩa đen chữ View, cùng hệ con
     trỏ Read/Open/coming soon của site (xem js/main.js). */
  (function lightbox() {
    var imgs = Array.prototype.slice.call(
      root.querySelectorAll(".cs-hero-img, .cs-figure img")
    );
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
      // Thêm is-open ở frame sau để transition opacity chạy;
      // thêm ngay trong cùng tác vụ thì overlay hiện luôn mà
      // không có hiệu ứng mờ vào.
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
    // Bấm ra ngoài ảnh (nền overlay) hoặc bấm chính ảnh thì
    // đóng, đúng như lightbox cũ của trang Work.
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target === lbImg) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
    });
    // Rời trang (kể cả bấm Back) thì đóng ngay để ảnh chụp
    // chuyển trang không dính overlay tối.
    window.addEventListener("pagehide", function () { close(true); });

    // Hover ảnh trong case study thì con trỏ hiện đĩa đen chữ
    // View, cùng hệ con trỏ Read/Open/coming soon của site.
    // Chỉ trên thiết bị có chuột và không giảm chuyển động,
    // giống handler Next Project ở trên.
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
