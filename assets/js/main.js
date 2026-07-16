/* ===== Theme ===== */
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

/* ===== Mobile Menu ===== */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
    }
  });
}

/* ===== Scroll Animations (Intersection Observer) ===== */
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => observer.observe(el));
}

/* ===== Active Nav Link ===== */
function initActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ===== Contact Form ===== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '发送中...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Simulate sending (replace with actual API endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    form.style.display = 'none';
    document.querySelector('.form-success').style.display = 'block';

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

/* ===== Dynamic Blog Posts (for blog listing page) ===== */
function initBlogList() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  // Blog posts data — add/edit your posts here
  const posts = [
    {
      title: '我的第一篇博客文章',
      date: '2026-07-15',
      summary: '这是我个人网站的第一篇文章，分享一下搭建个人站的过程和心得。',
      tags: ['随笔', '生活'],
      emoji: '🚀',
      link: '/blog/getting-started.html',
    },
    {
      title: '理解现代 CSS 布局',
      date: '2026-07-10',
      summary: '深入探讨 Flexbox 和 Grid 布局的核心概念与实际应用场景。',
      tags: ['技术', 'CSS'],
      emoji: '🎨',
      link: '/blog/css-layout.html',
    },
    {
      title: '2026 年中技术总结',
      date: '2026-06-30',
      summary: '回顾上半年学习的技术和新掌握的工具，以及下半年的学习计划。',
      tags: ['技术', '总结'],
      emoji: '📝',
      link: '/blog/mid-year-review.html',
    },
  ];

  posts.forEach((post, i) => {
    const card = document.createElement('article');
    card.className = `blog-card fade-in fade-in-d${(i % 4) + 1}`;
    card.innerHTML = `
      <div class="blog-card-image">${post.emoji}</div>
      <div class="blog-card-body">
        <div class="blog-card-meta">${post.date}</div>
        <h3><a href="${post.link}">${post.title}</a></h3>
        <p>${post.summary}</p>
        <div class="blog-card-tags">
          ${post.tags.map((t) => `<span class="blog-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Observe new cards
  initScrollAnimations();
}

/* ===== Dynamic Projects (for projects page) ===== */
function initProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const projects = [
    {
      title: '个人品牌网站',
      summary: '使用纯 HTML/CSS/JS 构建的响应式个人品牌站，支持深色模式与动画交互。',
      tags: ['HTML', 'CSS', 'JavaScript'],
      emoji: '🌐',
      links: [{ label: '在线预览', url: '#' }],
    },
    {
      title: '待添加项目',
      summary: '这里是你的下一个精彩项目，准备好展示给世界吧。',
      tags: ['待定'],
      emoji: '💡',
      links: [],
    },
    {
      title: '待添加项目',
      summary: '这里是你的下一个精彩项目，准备好展示给世界吧。',
      tags: ['待定'],
      emoji: '✨',
      links: [],
    },
  ];

  projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = `project-card fade-in fade-in-d${(i % 4) + 1}`;
    card.innerHTML = `
      <div class="project-card-image">${p.emoji}</div>
      <div class="project-card-body">
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <div class="project-tags">
          ${p.tags.map((t) => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          ${p.links.map((l) => `<a href="${l.url}" target="_blank">${l.label} →</a>`).join('')}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  initScrollAnimations();
}

/* ===== Intro Scroll Reveal ===== */
function initIntroReveal() {
  const overlay = document.getElementById('intro-overlay');
  const spacer = document.querySelector('.intro-spacer');
  if (!overlay || !spacer) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    const revealPoint = spacer.offsetHeight || window.innerHeight * 0.85;

    // Linear mapping: at scrollY=0 → progress=0, at scrollY=revealPoint → progress=1
    const rawProgress = Math.min(scrollY / revealPoint, 1);

    // Ease-out quad for smoother feel
    const progress = rawProgress < 1 ? rawProgress : 1;

    overlay.style.transform = `translateY(-${scrollY}px)`;
    // Fade out faster so overlay is transparent before reaching hero content
    overlay.style.opacity = Math.max(0, 1 - progress * 1.4);

    // Once fully hidden, stop painting
    if (progress >= 1) {
      overlay.style.visibility = 'hidden';
      if (!window._fallingTextStarted) {
        window._fallingTextStarted = true;
        initFallingText('.hero-content p');
      }
    } else {
      overlay.style.visibility = '';
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Set initial state
  update();
}

/* ===== Variable Proximity for Intro Letters ===== */
function initVariableProximity() {
  const letters = document.querySelectorAll('.intro-letter');
  const overlay = document.getElementById('intro-overlay');
  if (!letters.length || !overlay) return;

  const radius = 100;
  const fromWeight = 400;
  const toWeight = 700;
  let mouseX = -9999;
  let mouseY = -9999;
  let frameId = null;

  function update() {
    if (overlay.style.visibility === 'hidden') {
      frameId = null;
      return;
    }

    const overlayRect = overlay.getBoundingClientRect();

    letters.forEach(letter => {
      const rect = letter.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 - overlayRect.left;
      const centerY = rect.top + rect.height / 2 - overlayRect.top;

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= radius) {
        letter.style.fontVariationSettings = `'wght' ${fromWeight}`;
        return;
      }

      const norm = 1 - dist / radius;
      const falloff = 1 - Math.pow(1 - norm, 2); // ease-out quad
      const weight = Math.round(fromWeight + (toWeight - fromWeight) * falloff);
      letter.style.fontVariationSettings = `'wght' ${weight}`;
    });

    frameId = null;
  }

  function startLoop() {
    if (frameId) return;
    frameId = requestAnimationFrame(function tick() {
      update();
      frameId = requestAnimationFrame(tick);
    });
  }

  function stopLoop() {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function handleMove(clientX, clientY) {
    mouseX = clientX;
    mouseY = clientY;
  }

  window.addEventListener('mousemove', e => {
    handleMove(e.clientX, e.clientY);
    if (!frameId) startLoop();
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    if (!frameId) startLoop();
  }, { passive: true });

  // Stop loop when overlay is hidden (scrolled past)
  const scrollObserver = new MutationObserver(() => {
    if (overlay.style.visibility === 'hidden') {
      stopLoop();
    }
  });
  scrollObserver.observe(overlay, { attributes: true, attributeFilter: ['style'] });
}
/* ===== Intro Scrolling Strip ===== */
function initIntroStrip() {
  const container = document.querySelector('.intro-strip');
  if (!container) return;

  // 在这里增减图标和链接
  const items = [
    { label: 'GitHub', url: 'https://github.com', icon: 'github' },
    { label: 'HTML5', url: 'https://html.spec.whatwg.org', icon: 'html5' },
    { label: 'CSS3', url: 'https://www.w3.org/Style/CSS/', icon: 'css3' },
    { label: 'JavaScript', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript', icon: 'javascript' },
    { label: 'React', url: 'https://react.dev', icon: 'react' },
    { label: 'Node.js', url: 'https://nodejs.org', icon: 'nodedotjs' },
    { label: 'TypeScript', url: 'https://www.typescriptlang.org', icon: 'typescript' },
    { label: 'VS Code', url: 'https://code.visualstudio.com', icon: 'visualstudiocode' },
    { label: 'Figma', url: 'https://www.figma.com', icon: 'figma' },
    { label: 'Git', url: 'https://git-scm.com', icon: 'git' },
  ];

  const GAP = 48;
  const SPEED = 0.6;
  const iconSrc = name => `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${name}.svg`;

  const track = document.createElement('div');
  track.className = 'strip-track';
  container.appendChild(track);

  let setWidth = 0; // 一组完整内容的宽度

  function buildItems() {
    track.innerHTML = '';
    setWidth = 0;
    const containerW = container.clientWidth || 800;

    // 先测量单个 item 宽度
    const temp = document.createElement('div');
    temp.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;display:flex;gap:48px;align-items:center;';
    const tempItems = items.map(item => {
      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.className = 'strip-item';
      a.innerHTML = `
        <img src="${iconSrc(item.icon)}" alt="${item.label}" width="18" height="18" onerror="this.style.display='none'">
        <span>${item.label}</span>
      `;
      temp.appendChild(a);
      return a;
    });
    document.body.appendChild(temp);
    const widths = tempItems.map(el => el.offsetWidth + GAP);
    setWidth = widths.reduce((s, w) => s + w, 0);
    document.body.removeChild(temp);

    // 填充到至少 3 倍容器宽度，确保无缝循环
    const copies = Math.ceil((containerW * 3) / setWidth) + 1;
    for (let c = 0; c < copies; c++) {
      for (let i = 0; i < items.length; i++) {
        const a = document.createElement('a');
        a.href = items[i].url;
        a.target = '_blank';
        a.rel = 'noreferrer noopener';
        a.className = 'strip-item';
        a.innerHTML = `
          <img src="${iconSrc(items[i].icon)}" alt="${items[i].label}" width="18" height="18" onerror="this.style.display='none'">
          <span>${items[i].label}</span>
        `;
        track.appendChild(a);
      }
    }
  }

  buildItems();

  let offset = 0;
  let rafId;
  let lastTime = 0;
  const overlay = document.getElementById('intro-overlay');

  function loop(time) {
    if (!rafId) return; // stopped

    if (overlay && overlay.style.visibility === 'hidden') {
      rafId = requestAnimationFrame(loop);
      return;
    }

    if (!lastTime) lastTime = time;
    const dt = Math.min(time - lastTime, 50);
    lastTime = time;

    offset += SPEED * (dt / 16.67);

    // 滚完一组宽度后，直接减去一组宽度，视觉无跳跃
    if (setWidth > 0 && offset >= setWidth) {
      offset -= setWidth;
    }

    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildItems();
      offset = 0;
      lastTime = 0;
    }, 200);
  });
}

/* ===== Intro Wheel (left-side curved picker) 开场屏左边轮===== */
function initIntroWheel() {
  const container = document.querySelector('.intro-wheel');
  if (!container) return;

  const labels = [
    '个人资料', '博客', '作品集', '音乐',
    '风景', '联系方式', '日记', '健身'
  ];

  const state = {
    selected: 0,
    target: 0,
    rafId: null,
    lastTime: 0,
    dragging: false,
    dragStart: 0,
    dragStartY: 0,
    rowH: 0,
  };

  // Create items
  const items = labels.map((text, i) => {
    const el = document.createElement('div');
    el.className = 'intro-wheel__item';
    el.textContent = text;
    container.appendChild(el);
    return el;
  });

  function layout(now) {
    const dt = Math.min((now - state.lastTime) / 1000, 0.05);
    state.lastTime = now;

    // Smooth toward target
    const tau = 0.15; // seconds
    const k = 1 - Math.exp(-dt / tau);
    state.selected += (state.target - state.selected) * k;
    if (Math.abs(state.target - state.selected) < 0.001) state.selected = state.target;

    const n = items.length;
    const mid = n / 2;
    const baseH = items[0]?.offsetHeight || 24;
    const rowH = baseH * 1.6;
    state.rowH = rowH;
    const tiltAmt = 0.35; // radians curve
    const maxDist = n;

    for (let i = 0; i < n; i++) {
      const d = i - state.selected;
      const dist = Math.abs(d);
      const ang = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, d * 0.12));

      const x = -(1 - Math.cos(ang)) * 40;
      const y = d * rowH;
      const rot = -ang * 18;
      const opacity = Math.max(0.08, 1 - dist * 0.18);
      const blurPx = Math.min(3, dist * 0.5);

      items[i].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      items[i].style.opacity = opacity.toFixed(3);
      items[i].style.filter = blurPx > 0.01 ? `blur(${blurPx.toFixed(2)}px)` : 'none';
      items[i].classList.toggle('--sel', Math.abs(d) < 0.5);
    }

    state.rafId = null;
  }

  function startLoop() {
    if (state.rafId) return;
    state.lastTime = performance.now();
    function tick(now) {
      layout(now);
      state.rafId = requestAnimationFrame(tick);
    }
    state.rafId = requestAnimationFrame(tick);
  }

  function snap() {
    state.target = Math.round(state.target);
    state.selected = state.target;
    if (!state.rafId) startLoop();
  }

  // Wheel scroll
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    state.target = Math.max(0, Math.min(labels.length - 1, state.target + dir));
    if (!state.rafId) startLoop();
  }, { passive: false });

  // Pointer drag
  container.addEventListener('pointerdown', (e) => {
    state.dragging = true;
    state.dragStartY = e.clientY;
    state.dragStart = state.target;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!state.dragging) return;
    const dy = e.clientY - state.dragStartY;
    const rowH = state.rowH || 28;
    const delta = -dy / rowH;
    state.target = Math.max(0, Math.min(labels.length - 1, state.dragStart + delta));
    if (!state.rafId) startLoop();
  });

  container.addEventListener('pointerup', () => {
    state.dragging = false;
    snap();
  });

  container.addEventListener('pointercancel', () => {
    state.dragging = false;
    snap();
  });

  // Initial layout
  startLoop();
}

/* ===== Falling Text (Matter.js physics) ===== */
function initFallingText(selector) {
  const el = document.querySelector(selector);
  if (!el || el._ftInited) return;
  el._ftInited = true;

  const text = el.textContent.trim();
  if (!text) return;
  el.dataset.origHTML = el.innerHTML;

  const words = text.split(/\s+/);
  const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter;

  // Turn container into a positioned holder
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.style.marginBottom = '0';

  // 1) Measure each word's natural inline position
  el.innerHTML = words.map((w, i) =>
    `<span class="ft-word">${w}${i < words.length - 1 ? ' ' : ''}</span>`
  ).join('');

  const spans = [...el.querySelectorAll('.ft-word')];
  const contRect = el.getBoundingClientRect();
  const w = contRect.width || 200;
  const origH = contRect.height;
  const canvasH = origH + 60;

  const pos = spans.map(s => {
    const r = s.getBoundingClientRect();
    return { x: r.left - contRect.left + r.width / 2, y: r.top - contRect.top + r.height / 2, w: r.width, h: r.height };
  });

  // 2) Absolute-position them at those spots
  el.style.height = origH + 'px';
  spans.forEach((s, i) => {
    s.style.cssText = `
      position:absolute; left:${pos[i].x}px; top:${pos[i].y}px;
      transform:translate(-50%,-50%);
      white-space:nowrap; pointer-events:none;
      font:inherit; color:inherit;
    `;
  });

  // 3) Physics engine
  const engine = Engine.create();
  engine.world.gravity.y = 1.2;

  const render = Render.create({
    element: el, engine,
    options: { width: w, height: canvasH, background: 'transparent', wireframes: false }
  });
  render.canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:auto;';

  // Walls
  const wallOpts = { isStatic: true, render: { fillStyle: 'transparent' } };
  World.add(engine.world, [
    Bodies.rectangle(w / 2, canvasH + 25, w, 50, wallOpts),
    Bodies.rectangle(-25, canvasH / 2, 50, canvasH, wallOpts),
    Bodies.rectangle(w + 25, canvasH / 2, 50, canvasH, wallOpts),
  ]);

  // Word bodies
  const bodyMap = pos.map(p => {
    const body = Bodies.rectangle(p.x, p.y, Math.max(p.w, 10), Math.max(p.h, 10), {
      render: { fillStyle: 'transparent' },
      restitution: 0.7, frictionAir: 0.015, friction: 0.2
    });
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 1 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);
    return body;
  });

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse, constraint: { stiffness: 0.2, render: { visible: false } }
  });
  render.mouse = mouse;

  World.add(engine.world, [mouseConstraint, ...bodyMap]);

  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  // 4) Sync DOM positions
  let running = true;
  (function sync() {
    if (!running) return;
    bodyMap.forEach((body, i) => {
      spans[i].style.left = body.position.x + 'px';
      spans[i].style.top = body.position.y + 'px';
      spans[i].style.transform = `translate(-50%,-50%) rotate(${body.angle}rad)`;
    });
    requestAnimationFrame(sync);
  })();

  el._ftCleanup = () => {
    running = false;
    Render.stop(render);
    Runner.stop(runner);
    render.canvas.parentNode?.removeChild(render.canvas);
    World.clear(engine.world);
    Engine.clear(engine);
  };
}

/* ===== Tilted Cards (3D hover) ===== */
function initTiltedCards() {
  const cards = document.querySelectorAll('.project-card, .blog-card');

  cards.forEach((card) => {
    if (card.dataset.tiltInited) return;
    card.dataset.tiltInited = '1';

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 2 * 10;
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -2 * 10;
      card.style.transition = 'none';
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = '';
      card.style.transform = '';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initIntroReveal();
  initIntroStrip();
  initIntroWheel();
  initVariableProximity();
  initMobileMenu();
  initActiveNav();
  initScrollAnimations();
  initContactForm();
  initBlogList();
  initProjects();
  initTiltedCards();
});
