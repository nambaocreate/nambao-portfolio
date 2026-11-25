/**
 * Hero Wheel Gallery — vòng ảnh 3D tự quay cho section hero.
 *  - Ảnh xếp quanh một trục đứng (kiểu cánh quạt / cửa xoay) và tự quay liên tục.
 *  - Rê chuột: cả cụm nghiêng theo con trỏ.
 *  - Cuộn chuột / vuốt: quay nhanh hơn rồi chậm dần về tốc độ gốc.
 *
 * Phụ thuộc: GSAP core (gsap.ticker). Truyền vào qua options.gsap hoặc dùng window.gsap.
 *
 * HTML cần có:
 * <div class="hero-wheel">
 *   <div class="hw-tilt">
 *     <div class="hw-spin">
 *       <figure class="hw-item"><img src="..." alt=""></figure>
 *       ...
 *     </div>
 *   </div>
 * </div>
 */

const DEFAULTS = {
  layout: 'blades',          // 'blades' = cánh quạt (giống video tham khảo) | 'cylinder' = ảnh dán quanh trụ, mặt hướng ra ngoài
  gap: 0.14,                 // blades: khoảng hở giữa trục và mép ảnh, tính theo bề rộng ảnh
  radiusScale: 1.0,          // cylinder: hệ số bán kính (1 = các ảnh vừa chạm mép nhau)
  speed: 16,                 // tốc độ quay gốc, độ/giây
  direction: 1,              // 1 hoặc -1
  tilt: { x: -14, z: -10 }, // độ nghiêng sẵn của cả cụm (độ)
  pointerTilt: { x: 12, y: 22 }, // biên độ nghiêng theo chuột (độ)
  pointerEase: 5,            // độ "mượt" khi nghiêng theo chuột (càng lớn càng bám nhanh)
  wheelBoost: 0.9,           // độ/giây cộng thêm cho mỗi px cuộn
  maxBoost: 540,             // giới hạn tốc độ cộng thêm
  boostDecay: 2.2,           // tốc độ hãm về tốc độ gốc (1/giây)
  intro: true,               // ảnh bung ra khi vào trang
  backface: 'visible',       // 'visible' | 'hidden'
  pauseOffscreen: true,      // dừng tính toán khi hero ra khỏi màn hình
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
  };

  const tiltEl = root.querySelector('.hw-tilt');
  const spinEl = root.querySelector('.hw-spin');
  const items = Array.from(root.querySelectorAll('.hw-item'));
  if (!tiltEl || !spinEl || items.length === 0) {
    console.warn('[heroWheel] thiếu .hw-tilt / .hw-spin / .hw-item');
    return { destroy() {} };
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = gsap.utils.clamp(-o.maxBoost, o.maxBoost);

  root.classList.toggle('hw-backface-hidden', o.backface === 'hidden');

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

  // ---------- Trạng thái chuyển động ----------
  const state = {
    angle: 0,
    boost: 0,
    px: 0, py: 0,   // vị trí chuột mục tiêu (-1..1)
    cx: 0, cy: 0,   // vị trí chuột đã làm mượt
    speed: reduceMotion ? o.speed * 0.25 : o.speed,
  };

  function render() {
    spinEl.style.transform = `rotateY(${state.angle}deg)`;
    const rx = o.tilt.x - state.cy * o.pointerTilt.x;
    const ry = state.cx * o.pointerTilt.y;
    tiltEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${o.tilt.z}deg)`;
  }

  function tick(_time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.1);
    state.boost *= Math.exp(-o.boostDecay * dt);
    state.angle += (state.speed * o.direction + state.boost) * dt;
    const k = 1 - Math.exp(-o.pointerEase * dt);
    state.cx += (state.px - state.cx) * k;
    state.cy += (state.py - state.cy) * k;
    render();
  }

  // ---------- Input ----------
  function addBoost(px) {
    if (reduceMotion) return;
    state.boost = clamp(state.boost + px * o.wheelBoost * o.direction);
  }

  function onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    state.px = (e.clientX / window.innerWidth) * 2 - 1;
    state.py = (e.clientY / window.innerHeight) * 2 - 1;
  }
  function onPointerLeave() { state.px = 0; state.py = 0; }

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

  if (!reduceMotion) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
  }
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  // ---------- Chạy / dừng ----------
  let running = false;
  function start() { if (!running) { gsap.ticker.add(tick); running = true; } }
  function stop() { if (running) { gsap.ticker.remove(tick); running = false; } }

  let io = null;
  if (o.pauseOffscreen && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(root);
  } else {
    start();
  }

  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => layout());
    ro.observe(root);
  }

  // ---------- Intro ----------
  let introTl = null;
  render();
  if (o.intro && !reduceMotion) {
    const media = items.map((el) => el.firstElementChild || el);
    introTl = gsap.timeline();
    introTl
      .fromTo(media,
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: { each: 0.06, from: 'random' } })
      .add(() => { state.boost = 260 * o.direction; }, 0);
  }

  return {
    /** Thêm vòng quay tức thời (độ/giây), ví dụ khi bấm nút */
    boost(v) { addBoost(v / o.wheelBoost); },
    /** Đổi tốc độ gốc (độ/giây) */
    setSpeed(v) { state.speed = v; },
    /** Tính lại bố cục, gọi sau khi thêm/bớt ảnh */
    refresh() { layout(); },
    destroy() {
      stop();
      io && io.disconnect();
      ro && ro.disconnect();
      introTl && introTl.kill();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    },
  };
}

export default initHeroWheel;
