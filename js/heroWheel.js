/**
 * Hero Wheel Gallery v2 — vòng ảnh 3D tự quay cho section hero.
 *  - Ảnh xếp quanh một trục đứng (kiểu cánh quạt / cửa xoay) và tự quay liên tục.
 *  - Rê chuột: cả cụm nghiêng theo con trỏ trên cả 3 trục X / Y / Z, chuyển động
 *    kiểu lò xo (có quán tính, hơi vượt rồi bật lại). Vẩy chuột nhanh thì trục Z lắc theo.
 *  - Cuộn chuột / vuốt: quay nhanh hơn rồi chậm dần về tốc độ gốc.
 *  - Mặt sau mỗi card hiện ảnh đúng chiều (không bị lật gương).
 *  - Hover vào card: card nhấc lên, vòng quay chậm lại, hai bên hero hiện tên + tagline.
 *
 * Phụ thuộc: GSAP core. Truyền vào qua options.gsap hoặc dùng window.gsap.
 *
 * HTML tối thiểu (JS tự bọc thêm .hw-card / .hw-face):
 * <div class="hero-wheel">
 *   <div class="hw-tilt">
 *     <div class="hw-spin">
 *       <figure class="hw-item"
 *               data-title="Vore"
 *               data-category="Food & beverage"
 *               data-tagline="Một dòng mô tả ngắn"
 *               data-href="/work/vore">            <!-- data-href không bắt buộc -->
 *         <img src="..." alt="">
 *       </figure>
 *       ...
 *     </div>
 *   </div>
 * </div>
 */

const DEFAULTS = {
  layout: 'blades',              // 'blades' = cánh quạt | 'cylinder' = ảnh dán quanh trụ
  gap: 0.14,                     // blades: khoảng hở giữa trục và mép ảnh (theo bề rộng ảnh)
  radiusScale: 1.0,              // cylinder: hệ số bán kính
  speed: 16,                     // tốc độ quay gốc, độ/giây
  direction: 1,                  // 1 hoặc -1
  tilt: { x: -14, z: -10 },      // độ nghiêng sẵn của cả cụm (độ)
  pointerTilt: { x: 14, y: 24, z: 12 }, // biên độ nghiêng theo chuột trên từng trục (độ)
  sway: 0.9,                     // độ lắc trục Z khi vẩy chuột nhanh (0 = tắt)
  spring: { stiffness: 55, damping: 8 }, // lò xo cho độ nghiêng: damping thấp = nảy nhiều hơn
  wheelBoost: 0.9,               // độ/giây cộng thêm cho mỗi px cuộn
  maxBoost: 540,
  boostDecay: 2.2,
  intro: true,
  backface: 'visible',           // 'visible' = mặt sau hiện ảnh đúng chiều | 'mirror' = lật gương (kiểu cũ) | 'hidden'
  hover: true,                   // bật hiệu ứng hover + caption
  hoverLift: 34,                 // px nhấc lên khi hover
  hoverOut: 26,                  // px card trượt ra xa trục khi hover
  hoverScale: 1.06,
  hoverSpeed: 0.08,              // tốc độ quay khi đang hover (x tốc độ gốc)
  dimOthers: 0.35,               // độ mờ các card còn lại khi hover (1 = không mờ)
  taglineFallback: 'Tagline placeholder — one line about the project',
  pauseOffscreen: true,
};

export function initHeroWheel(root, options = {}) {
  const gsap = options.gsap || (typeof window !== 'undefined' ? window.gsap : null);
  if (!root || !gsap) {
    console.warn('[heroWheel] thiếu root element hoặc GSAP');
    return { destroy() {} };
  }

  const o = {
    ...DEFAULTS,
    ...options,
    tilt: { ...DEFAULTS.tilt, ...(options.tilt || {}) },
    pointerTilt: { ...DEFAULTS.pointerTilt, ...(options.pointerTilt || {}) },
    spring: { ...DEFAULTS.spring, ...(options.spring || {}) },
  };

  const tiltEl = root.querySelector('.hw-tilt');
  const spinEl = root.querySelector('.hw-spin');
  const items = Array.from(root.querySelectorAll('.hw-item'));
  if (!tiltEl || !spinEl || items.length === 0) {
    console.warn('[heroWheel] thiếu .hw-tilt / .hw-spin / .hw-item');
    return { destroy() {} };
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clampBoost = gsap.utils.clamp(-o.maxBoost, o.maxBoost);
  const cleanups = [];

  root.classList.toggle('hw-backface-hidden', o.backface === 'hidden');
  root.classList.toggle('hw-backface-mirror', o.backface === 'mirror');
  root.style.setProperty('--hw-dim', String(o.dimOthers));

  // ---------- Dựng card 2 mặt ----------
  // figure.hw-item > .hw-card > .hw-face.hw-front (ảnh) + .hw-face.hw-back (bản sao, xoay 180°)
  const cards = items.map((item) => {
    let card = item.querySelector(':scope > .hw-card');
    if (!card) {
      card = document.createElement('div');
      card.className = 'hw-card';
      const front = document.createElement('div');
      front.className = 'hw-face hw-front';
      Array.from(item.childNodes).forEach((n) => front.appendChild(n));
      card.appendChild(front);
      item.appendChild(card);
    }
    const front = card.querySelector('.hw-front');
    let back = card.querySelector('.hw-back');
    if (!back && o.backface === 'visible') {
      back = front.cloneNode(true);
      back.className = 'hw-face hw-back';
      back.setAttribute('aria-hidden', 'true');
      back.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      card.appendChild(back);
    }
    if (back) back.hidden = o.backface !== 'visible';
    return card;
  });

  // ---------- Caption 2 bên ----------
  let caption = null;
  let capLeft = null;
  let capRight = null;
  if (o.hover) {
    caption = root.querySelector(':scope > .hw-caption');
    if (!caption) {
      caption = document.createElement('div');
      caption.className = 'hw-caption';
      caption.setAttribute('aria-live', 'polite');
      caption.innerHTML =
        '<div class="hw-cap hw-cap-left">' +
          '<span class="hw-cap-line"><span class="hw-cap-category"></span></span>' +
          '<span class="hw-cap-line"><span class="hw-cap-title"></span></span>' +
        '</div>' +
        '<div class="hw-cap hw-cap-right">' +
          '<span class="hw-cap-line"><span class="hw-cap-tagline"></span></span>' +
        '</div>';
      root.appendChild(caption);
      cleanups.push(() => caption.remove());
    }
    capLeft = caption.querySelector('.hw-cap-left');
    capRight = caption.querySelector('.hw-cap-right');
  }

  // ---------- Bố trí ảnh trong không gian 3D ----------
  function layout() {
    const n = items.length;
    const w = items[0].offsetWidth;
    const step = 360 / n;
    items.forEach((el, i) => {
      const a = i * step;
      if (o.layout === 'cylinder') {
        const r = ((w / 2) / Math.tan(Math.PI / n)) * o.radiusScale;
        el.style.transform = `rotateY(${a}deg) translateZ(${r}px)`;
      } else {
        el.style.transform = `rotateY(${a}deg) translateX(${w * o.gap + w / 2}px)`;
      }
    });
  }
  layout();

  // ---------- Trạng thái ----------
  const state = {
    angle: 0,
    boost: 0,
    speed: reduceMotion ? o.speed * 0.25 : o.speed,
    speedMul: 1,
    // vị trí chuột chuẩn hoá -1..1
    px: 0, py: 0, inside: false, clientX: -1, clientY: -1,
    // 3 lò xo cho góc nghiêng
    rx: { v: o.tilt.x, vel: 0 },
    ry: { v: 0, vel: 0 },
    rz: { v: o.tilt.z, vel: 0 },
    pvx: 0, // vận tốc ngang của chuột (đã làm mượt)
    hovered: null,
    capY: null,
    frame: 0,
  };

  function stepSpring(s, target, dt) {
    s.vel += (target - s.v) * o.spring.stiffness * dt;
    s.vel *= Math.exp(-o.spring.damping * dt);
    s.v += s.vel * dt;
  }

  function render() {
    spinEl.style.transform = `rotateY(${state.angle}deg)`;
    tiltEl.style.transform =
      `rotateX(${state.rx.v}deg) rotateY(${state.ry.v}deg) rotateZ(${state.rz.v}deg)`;
  }

  function tick(_time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    state.frame++;

    // quay
    const targetMul = state.hovered ? o.hoverSpeed : 1;
    state.speedMul += (targetMul - state.speedMul) * (1 - Math.exp(-6 * dt));
    state.boost *= Math.exp(-(state.hovered ? o.boostDecay * 4 : o.boostDecay) * dt);
    state.angle += (state.speed * o.direction + state.boost) * state.speedMul * dt;

    // nghiêng 3 trục
    if (reduceMotion) {
      state.rx.v = o.tilt.x; state.ry.v = 0; state.rz.v = o.tilt.z;
    } else {
      stepSpring(state.rx, o.tilt.x - state.py * o.pointerTilt.x, dt);
      stepSpring(state.ry, state.px * o.pointerTilt.y, dt);
      state.pvx *= Math.exp(-5 * dt);
      stepSpring(state.rz,
        o.tilt.z
          - state.px * o.pointerTilt.z                       // chuột trái/phải -> nghiêng Z
          + state.px * state.py * o.pointerTilt.z * 0.5      // góc màn hình -> nghiêng thêm
          - state.pvx * o.sway * 5,                          // vẩy nhanh -> lắc
        dt);
    }
    render();

    // hover: kiểm tra card dưới con trỏ (card vẫn quay dù chuột đứng yên)
    if (o.hover && state.inside && state.frame % 3 === 0) hitTest();
    if (state.hovered) positionCaption(dt);
  }

  // ---------- Hover ----------
  function hitTest() {
    if (state.clientX < 0) return;
    const el = document.elementFromPoint(state.clientX, state.clientY);
    const item = el && root.contains(el) ? el.closest('.hw-item') : null;
    if (item !== state.hovered) setHover(item);
  }

  function setText(sel, text) {
    const el = caption.querySelector(sel);
    el.textContent = text || '';
    el.parentElement.hidden = !text;
  }

  function setHover(item) {
    const prev = state.hovered;
    state.hovered = item;

    if (prev) {
      const c = prev.querySelector('.hw-card');
      prev.classList.remove('is-hover');
      gsap.to(c, { x: 0, y: 0, z: 0, scale: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    }

    root.classList.toggle('hw-has-hover', !!item);
    root.style.cursor = item && item.dataset.href ? 'pointer' : '';

    if (item) {
      item.classList.add('is-hover');
      const c = item.querySelector('.hw-card');
      const out = o.layout === 'cylinder' ? { z: o.hoverOut } : { x: o.hoverOut };
      gsap.to(c, { ...out, y: -o.hoverLift, scale: o.hoverScale, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });

      setText('.hw-cap-category', item.dataset.category);
      setText('.hw-cap-title', item.dataset.title || item.querySelector('img')?.alt);
      setText('.hw-cap-tagline', item.dataset.tagline || o.taglineFallback);
      state.capY = null;
      positionCaption(0);

      const lines = caption.querySelectorAll('.hw-cap-line > span');
      gsap.killTweensOf(lines);
      gsap.fromTo(lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05 });
      caption.classList.add('is-visible');
    } else if (caption) {
      const lines = caption.querySelectorAll('.hw-cap-line > span');
      gsap.killTweensOf(lines);
      gsap.to(lines, {
        yPercent: -110, duration: 0.35, ease: 'power2.in', stagger: 0.03,
        onComplete: () => { if (!state.hovered) caption.classList.remove('is-visible'); },
      });
    }
  }

  function positionCaption(dt) {
    if (!caption || !state.hovered) return;
    const rr = root.getBoundingClientRect();
    const cr = state.hovered.querySelector('.hw-front').getBoundingClientRect();
    const target = cr.top + cr.height / 2 - rr.top;
    state.capY = state.capY == null ? target : state.capY + (target - state.capY) * (1 - Math.exp(-8 * dt));
    caption.style.setProperty('--hw-cap-y', `${state.capY}px`);
  }

  // ---------- Input ----------
  function addBoost(px) {
    if (reduceMotion) return;
    state.boost = clampBoost(state.boost + px * o.wheelBoost * o.direction);
  }

  let lastMove = { x: 0, t: 0 };
  function onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    state.px = nx;
    state.py = (e.clientY / window.innerHeight) * 2 - 1;
    state.clientX = e.clientX;
    state.clientY = e.clientY;

    // vận tốc chuột theo trục ngang -> trục Z lắc theo
    const now = performance.now();
    const dtm = Math.max(now - lastMove.t, 8);
    if (lastMove.t && dtm < 120) {
      const v = gsap.utils.clamp(-3, 3, ((nx - lastMove.x) / dtm) * 1000); // màn hình / giây
      state.pvx += (v - state.pvx) * 0.35;
    }
    lastMove = { x: nx, t: now };

    const r = root.getBoundingClientRect();
    state.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (o.hover) {
      if (state.inside) hitTest();
      else if (state.hovered) setHover(null);
    }
  }
  function onPointerLeave() {
    state.px = 0; state.py = 0; state.inside = false; state.clientX = -1;
    if (state.hovered) setHover(null);
  }
  // Cảm ứng: chạm vào card để xem caption, chạm chỗ khác để ẩn
  function onPointerDown(e) {
    if (e.pointerType !== 'touch' || !o.hover) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const item = el && root.contains(el) ? el.closest('.hw-item') : null;
    setHover(item === state.hovered ? null : item);
  }
  function onClick(e) {
    const item = e.target.closest && e.target.closest('.hw-item');
    if (item && item === state.hovered && item.dataset.href) window.location.href = item.dataset.href;
  }

  function onWheel(e) {
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    addBoost(e.deltaY * unit);
  }

  let lastTouchY = null;
  function onTouchStart(e) { lastTouchY = e.touches[0].clientY; }
  function onTouchMove(e) {
    if (lastTouchY == null) return;
    const y = e.touches[0].clientY;
    addBoost((lastTouchY - y) * 1.5);
    lastTouchY = y;
  }
  function onTouchEnd() { lastTouchY = null; }

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  }
  listen(window, 'pointermove', onPointerMove, { passive: true });
  listen(document.documentElement, 'pointerleave', onPointerLeave);
  listen(root, 'pointerdown', onPointerDown);
  listen(root, 'click', onClick);
  listen(window, 'wheel', onWheel, { passive: true });
  listen(window, 'touchstart', onTouchStart, { passive: true });
  listen(window, 'touchmove', onTouchMove, { passive: true });
  listen(window, 'touchend', onTouchEnd, { passive: true });

  // ---------- Chạy / dừng ----------
  let running = false;
  function start() { if (!running) { gsap.ticker.add(tick); running = true; } }
  function stop() { if (running) { gsap.ticker.remove(tick); running = false; } }

  if (o.pauseOffscreen && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(root);
    cleanups.push(() => io.disconnect());
  } else {
    start();
  }

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => layout());
    ro.observe(root);
    cleanups.push(() => ro.disconnect());
  }

  // ---------- Intro ----------
  render();
  if (o.intro && !reduceMotion) {
    const faces = root.querySelectorAll('.hw-face');
    const tl = gsap.timeline();
    tl.fromTo(cards, { scale: 0.3 }, { scale: 1, duration: 1.4, ease: 'expo.out', stagger: { each: 0.06, from: 'random' } }, 0)
      .fromTo(faces, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out', clearProps: 'opacity' }, 0)
      .add(() => { state.boost = 260 * o.direction; }, 0);
    cleanups.push(() => tl.kill());
  }

  return {
    /** Thêm vòng quay tức thời (độ/giây) */
    boost(v) { addBoost(v / o.wheelBoost); },
    /** Đổi tốc độ gốc (độ/giây) */
    setSpeed(v) { state.speed = v; },
    /** Tính lại bố cục, gọi sau khi đổi kích thước card */
    refresh() { layout(); },
    destroy() {
      stop();
      if (state.hovered) {
        state.hovered.classList.remove('is-hover');
        gsap.set(state.hovered.querySelector('.hw-card'), { clearProps: 'transform' });
      }
      root.classList.remove('hw-has-hover');
      root.style.cursor = '';
      cleanups.forEach((fn) => fn());
    },
  };
}

export default initHeroWheel;
