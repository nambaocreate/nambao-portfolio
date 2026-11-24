// Nam Bao Portfolio — trang Work (/work)
// Vẽ lưới dự án từ WORK_PROJECTS (js/work-data.js) và xử lý
// filter theo ngành. Chạy trước js/main.js để main.js kịp
// gắn motion dùng chung (reveal, chữ cuộn, con trỏ) lên các
// card vừa vẽ xong. Không động vào Figma, chỉ làm phần web.

(function () {
  "use strict";

  var projects = window.WORK_PROJECTS || [];
  var filters = window.WORK_FILTERS || [];
  var grid = document.getElementById("work-grid");
  var filterList = document.getElementById("work-filter-list");
  if (!grid || !projects.length) return;

  var activeFilter = "All"; // "All" = hiện tất cả (mục mặc định)
  var hideTimers = new Map(); // card -> timeout chờ mờ xong mới display:none

  /* ---------- Vẽ filter ---------- */
  if (filterList) {
    filterList.innerHTML = filters
      .map(function (name) {
        return (
          '<li><button type="button" class="work-filter" data-filter="' +
          name +
          '" aria-pressed="false">' +
          name +
          "</button></li>"
        );
      })
      .join("");

    filterList.addEventListener("click", function (event) {
      var btn = event.target.closest(".work-filter");
      if (!btn) return;
      var name = btn.getAttribute("data-filter");
      // Bấm mục đang chọn thì về All, hiện tất cả.
      setFilter(activeFilter === name ? "All" : name);
    });
  }

  /* ---------- Vẽ lưới card ---------- */
  grid.innerHTML = projects
    .map(function (p, i) {
      var eager = i < 2; // 2 card đầu ở trên màn hình đầu tiên
      return (
        '<article class="work-card reveal' +
        (p.wide ? " work-card--wide" : "") +
        '" data-tag="' +
        p.tag +
        '">' +
        '<div class="work-media" style="--ar: ' +
        p.aspect +
        '">' +
        '<img src="' +
        p.image +
        '" alt="' +
        p.alt +
        '" width="' +
        p.width +
        '" height="' +
        p.height +
        '" loading="' +
        (eager ? "eager" : "lazy") +
        '" decoding="async"' +
        (i === 0 ? ' fetchpriority="high"' : "") +
        ">" +
        "</div>" +
        '<div class="work-meta">' +
        '<h3 class="work-card-title"><span data-roll">' +
        p.title +
        "</span></h3>" +
        '<span class="work-tag"><span data-roll">' +
        p.tag +
        "</span></span>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");

  /* ---------- Filter ---------- */
  function showCard(card) {
    var timer = hideTimers.get(card);
    if (timer) {
      clearTimeout(timer);
      hideTimers.delete(card);
    }
    card.classList.remove("is-hidden");
    // Ép trình duyệt tính lại layout rồi mới bỏ class mờ,
    // để card hiện dần lên thay vì bật ra ngay.
    void card.offsetWidth;
    card.classList.remove("is-hiding");
  }

  function hideCard(card) {
    card.classList.add("is-hiding");
    var timer = setTimeout(function () {
      card.classList.add("is-hidden");
      hideTimers.delete(card);
    }, 350);
    hideTimers.set(card, timer);
  }

  function setFilter(name) {
    activeFilter = name;
    // Cập nhật trạng thái nút bấm ("All" cũng là một nút,
    // đang chọn All thì nút All sáng).
    if (filterList) {
      filterList.querySelectorAll(".work-filter").forEach(function (btn) {
        var on = btn.getAttribute("data-filter") === name;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    // Hiện/ẩn từng card theo tag ("All" thì hiện tất cả).
    grid.querySelectorAll(".work-card").forEach(function (card) {
      var match = name === "All" || card.getAttribute("data-tag") === name;
      if (match) showCard(card);
      else hideCard(card);
    });
  }

  // Trạng thái ban đầu: All đang chọn, hiện đủ 7 dự án.
  setFilter("All");
})();
