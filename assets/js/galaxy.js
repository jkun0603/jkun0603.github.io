function initSnow() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const container = document.createElement('div');
  container.className = 'galaxy-canvas-wrap';
  overlay.prepend(container);

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H;
  const particles = [];
  const COUNT = 160;

  function resize() {
    W = container.clientWidth;
    H = container.clientHeight;
    if (W === 0 || H === 0) return;
    canvas.width = W;
    canvas.height = H;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function createParticle(reset) {
    return {
      x: rand(0, W),
      y: reset ? rand(-10, 0) : rand(0, H),
      r: rand(1.5, 5),
      speed: rand(0.4, 1.6),
      sway: rand(0.3, 1.2),
      swaySpeed: rand(0.005, 0.02),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.5, 1),
    };
  }

  resize();
  for (let i = 0; i < COUNT; i++) particles.push(createParticle(false));

  let rafId;
  let isVisible = true;

  function loop() {
    rafId = requestAnimationFrame(loop);

    const hidden = overlay.style.visibility === 'hidden';
    if (hidden) {
      if (isVisible) {
        isVisible = false;
        ctx.clearRect(0, 0, W, H);
      }
      return;
    }
    if (!isVisible) {
      isVisible = true;
      resize();
    }

    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.y += p.speed;
      p.x += Math.sin(p.phase) * 0.3;

      if (p.y > H + 10) {
        Object.assign(p, createParticle(true));
        p.x = rand(0, W);
      }

      p.phase += p.swaySpeed;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();
    }
  }
  loop();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });

  return function destroy() {
    cancelAnimationFrame(rafId);
    container.remove();
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSnow);
} else {
  initSnow();
}
