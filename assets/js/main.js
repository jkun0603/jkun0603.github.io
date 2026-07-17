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

  const fallbackPosts = [
    {
      title: '我的第一篇博客文章',
      date: '2026-07-15',
      summary: '这是我个人网站的第一篇文章，分享一下搭建个人站的过程和心得。',
      tags: ['随笔', '生活'],
      emoji: '\u{1F680}',
      link: '/blog/getting-started.html',
    },
    {
      title: '理解现代 CSS 布局',
      date: '2026-07-10',
      summary: '深入探讨 Flexbox 和 Grid 布局的核心概念与实际应用场景。',
      tags: ['技术', 'CSS'],
      emoji: '\u{1F3A8}',
      link: '/blog/css-layout.html',
    },
    {
      title: '2026 年中技术总结',
      date: '2026-06-30',
      summary: '回顾上半年学习的技术和新掌握的工具，以及下半年的学习计划。',
      tags: ['技术', '总结'],
      emoji: '\u{1F4DD}',
      link: '/blog/mid-year-review.html',
    },
    {
      title: 'JavaScript 实用技巧',
      date: '2026-06-15',
      summary: '日常开发中积累的一些 JavaScript 实用技巧和最佳实践。',
      tags: ['技术', 'JS'],
      emoji: '⚡',
      link: '/blog/js-tips.html',
    },
    {
      title: '响应式设计实战',
      date: '2026-05-28',
      summary: '从移动优先到桌面端，系统学习响应式设计的方法与技巧。',
      tags: ['技术', 'CSS'],
      emoji: '\u{1F4F1}',
      link: '/blog/responsive-design.html',
    },
    {
      title: 'Three.js 入门笔记',
      date: '2026-05-10',
      summary: 'WebGL 与 Three.js 的基础概念，以及如何创建第一个 3D 场景。',
      tags: ['技术', 'WebGL'],
      emoji: '\u{1F30D}',
      link: '/blog/threejs-intro.html',
    },
  ];

  function renderPosts(posts) {
    // Sort by date descending
    posts.sort(function(a, b) { return b.date.localeCompare(a.date); });

    var hasToken = !!localStorage.getItem('gh_blog_token');

    posts.forEach(function(post, i) {
      var link = post.link || (post.slug ? '/blog/view.html?slug=' + post.slug : '#');
      var emoji = post.emoji || '\u{1F4DD}';
      var tags = post.tags || [];
      var summary = post.summary || '';
      var date = post.date || '';
      var deletable = hasToken && !post.link && post.slug;

      var card = document.createElement('article');
      card.className = 'blog-card fade-in fade-in-d' + ((i % 4) + 1);
      card.innerHTML =
        '<a href="' + link + '" class="card-link">' +
          '<div class="blog-card-image">' + emoji + '</div>' +
          '<div class="blog-card-body">' +
            '<div class="blog-card-meta">' + date + '</div>' +
            '<h3>' + post.title + '</h3>' +
            '<p>' + summary + '</p>' +
            '<div class="blog-card-tags">' +
              tags.map(function(t) { return '<span class="blog-tag">' + t + '</span>'; }).join('') +
            '</div>' +
          '</div>' +
        '</a>' +
        (deletable ? '<button class="blog-delete-btn" data-slug="' + post.slug + '" onclick="deleteBlogPost(this)" title="删除文章">\u{1F5D1}️</button>' : '');
      grid.appendChild(card);
    });

    initScrollAnimations();
  }

  // Try loading from JSON index (cache-bust for GitHub Pages CDN)
  fetch('/posts/posts.json?t=' + Date.now(), { cache: 'no-cache' })
    .then(function(r) {
      if (!r.ok) throw new Error('Failed to load');
      return r.json();
    })
    .then(function(data) {
      if (data && data.posts && data.posts.length) {
        renderPosts(data.posts);
      } else {
        renderPosts(fallbackPosts);
      }
    })
    .catch(function() {
      renderPosts(fallbackPosts);
    });
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
      link: '/projects/personal-website.html',
    },
    {
      title: '下一个精彩项目',
      summary: '灵感正在孵化中，下一个精彩项目即将到来。',
      tags: ['筹备中'],
      emoji: '💡',
      link: '/projects/next-project.html',
    },
    {
      title: '更多项目',
      summary: '更多精彩项目即将到来，敬请期待。',
      tags: ['筹备中'],
      emoji: '✨',
      link: '/projects/coming-soon.html',
    },
    {
      title: '更多项目',
      summary: '更多精彩项目即将到来，敬请期待。',
      tags: ['筹备中'],
      emoji: '🚧',
      link: '/projects/coming-soon.html',
    },
    {
      title: '更多项目',
      summary: '更多精彩项目即将到来，敬请期待。',
      tags: ['筹备中'],
      emoji: '🌟',
      link: '/projects/coming-soon.html',
    },
    {
      title: '更多项目',
      summary: '更多精彩项目即将到来，敬请期待。',
      tags: ['筹备中'],
      emoji: '🎯',
      link: '/projects/coming-soon.html',
    },
  ];

  projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = `project-card fade-in fade-in-d${(i % 4) + 1}`;
    card.innerHTML = `
      <a href="${p.link}" class="card-link">
        <div class="project-card-image">${p.emoji}</div>
        <div class="project-card-body">
          <h3>${p.title}</h3>
          <p>${p.summary}</p>
          <div class="project-tags">
            ${p.tags.map((t) => `<span class="project-tag">${t}</span>`).join('')}
          </div>
        </div>
      </a>
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
    } else {
      overlay.style.visibility = '';
    }

    // Trigger tags when about halfway through the reveal
    if (progress >= 0.55 && !window._fallingTagsStarted) {
      window._fallingTagsStarted = true;
      initFallingTags();
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

/* ===== Falling Tags (Matter.js physics) ===== 下降标签*/
function initFallingTags() {
  const container = document.getElementById('heroTags');
  if (!container || container._tagsInited) return;
  container._tagsInited = true;

  const tags = [
    '前端开发', 'React', 'TypeScript', 'JavaScript', 'CSS3',
    'HTML5', 'Vue.js', 'Node.js', 'UI/UX', '响应式设计',
    'WebGL', '动画', 'Git', 'Figma', '性能优化','KUN','🕶'
  ];

  const { Engine, Render, World, Bodies, Runner, Body, Query } = Matter;

  // Sizes
  const hero = container.parentElement;
  const heroRect = hero.getBoundingClientRect();
  const areaW = heroRect.width;
  const areaH = heroRect.height;

  container.style.cssText = 'position:absolute;inset:0;z-index:2;overflow:hidden;';

  // Create tag elements
  const tagEls = tags.map(text => {
    const el = document.createElement('span');
    el.textContent = text;
    el.style.cssText = `
      position:absolute; left:0; top:0;
      padding:6px 16px;
      background:var(--accent-light, rgba(138,158,158,0.15));
      color:var(--accent, #7A8E8E);
      border:1px solid var(--border-strong, #C5C2B5);
      border-radius:20px;
      font-size:0.82rem; font-weight:500;
      white-space:nowrap;
      transform:translate(-50%,-50%);
      pointer-events:auto;
      cursor:grab;
      user-select:none;
      will-change:transform;
    `;
    container.appendChild(el);
    return el;
  });

  // Engine — gentle gravity
  const engine = Engine.create();
  engine.world.gravity.y = 0.6;

  // Invisible canvas (needed for MouseConstraint hit detection)
  const render = Render.create({
    element: container, engine,
    options: { width: areaW, height: areaH, background: 'transparent', wireframes: false }
  });
  render.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';

  // Walls around the hero
  const wallOpts = { isStatic: true, render: { fillStyle: 'transparent' } };
  const pad = 40;
  const wallThick = 60;
  const floorY = areaH * 0.90;
  World.add(engine.world, [
    Bodies.rectangle(areaW / 2, floorY, areaW + 100, wallThick, wallOpts),
    Bodies.rectangle(0, floorY / 2, wallThick, floorY + 100, wallOpts),
    Bodies.rectangle(areaW, floorY / 2, wallThick, floorY + 100, wallOpts),
  ]);

  // Create bodies for each tag, starting from above viewport
  const bodyMap = tags.map((_, i) => {
    const x = 80 + Math.random() * (areaW - 160);
    const y = -40 - Math.random() * 120 - i * 10;
    const body = Bodies.rectangle(x, y, 100, 32, {
      render: { fillStyle: 'transparent' },
      restitution: 0.5,
      frictionAir: 0.03,
      friction: 0.3,
      density: 0.003,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);
    return body;
  });

  // Custom drag — no Mouse/MouseConstraint (avoids wheel blocking & lag)
  let draggedBody = null;
  let dragOffset = { x: 0, y: 0 };

  container.addEventListener('mousedown', (e) => {
    const contRect = container.getBoundingClientRect();
    const px = e.clientX - contRect.left;
    const py = e.clientY - contRect.top;
    const hit = Query.point(bodyMap, { x: px, y: py });
    if (hit.length) {
      draggedBody = hit[0];
      dragOffset.x = draggedBody.position.x - px;
      dragOffset.y = draggedBody.position.y - py;
      Body.setStatic(draggedBody, true);
    }
  });

  container.addEventListener('mousemove', (e) => {
    if (!draggedBody) return;
    const contRect = container.getBoundingClientRect();
    Body.setPosition(draggedBody, {
      x: e.clientX - contRect.left + dragOffset.x,
      y: e.clientY - contRect.top + dragOffset.y
    });
  });

  window.addEventListener('mouseup', () => {
    if (draggedBody) {
      Body.setStatic(draggedBody, false);
      draggedBody = null;
    }
  });

  World.add(engine.world, [...bodyMap]);

  const runner = Runner.create();
  Runner.run(runner, engine);

  // Sync DOM positions — no layout reads, just writes
  let running = true;
  (function sync() {
    if (!running) return;
    bodyMap.forEach((body, i) => {
      tagEls[i].style.left = body.position.x + 'px';
      tagEls[i].style.top = body.position.y + 'px';
      tagEls[i].style.transform = `translate(-50%,-50%) rotate(${body.angle}rad)`;
    });
    requestAnimationFrame(sync);
  })();

  container._tagsCleanup = () => {
    running = false;
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

/* ===== Blog post delete (GitHub API) ===== */
function deleteBlogPost(btn) {
  var pwd = prompt('\u{1F511} 请输入删除密码：');
  if (!pwd) return;
  if (pwd !== '2356383926') { alert('\u{1F6AB} 密码错误'); return; }
  var slug = btn.dataset.slug;
  if (!confirm('\u{1F4DD} 确定要永久删除这篇文章吗？')) return;
  btn.disabled = true;
  btn.textContent = '⏳';

  var REPO = 'jkun0603/jkun0603.github.io';
  var BRANCH = 'main';
  var token = localStorage.getItem('gh_blog_token');
  if (!token) { alert('\u{274C} 未找到 GitHub Token，请先访问 write.html 配置'); btn.disabled = false; btn.textContent = '\u{1F5D1}'; return; }

  function gh(endpoint, method, body) {
    var opts = {
      method: method || 'GET',
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' },
    };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch('https://api.github.com' + endpoint, opts).then(function(r) {
      if (!r.ok) return r.json().then(function(e) { throw new Error((e.message || '') + ' (HTTP ' + r.status + ')'); });
      return r.json().catch(function() { return {}; });
    });
  }
  function utf8ToBase64(str) { return btoa(unescape(encodeURIComponent(str))); }
  function getSha(path) {
    return gh('/repos/' + REPO + '/contents/' + path + '?ref=' + BRANCH)
      .then(function(d) { if (!d || !d.sha) throw new Error('File not found or no SHA'); return d.sha; });
  }

  var mdPath = 'posts/' + slug + '.md';
  var jsonPath = 'posts/posts.json';

  // Step 1: delete the markdown file (if exists)
  getSha(mdPath).then(function(sha) {
    return gh('/repos/' + REPO + '/contents/' + mdPath, 'DELETE', {
      message: 'delete: remove post ' + slug, sha: sha, branch: BRANCH
    });
  }).catch(function(err) {
    if (err.message && err.message.includes('Not Found')) {
      return; // file already gone, that's fine
    }
    throw err; // real error, propagate
  }).then(function() {
    // Step 2: fetch posts.json
    return gh('/repos/' + REPO + '/contents/' + jsonPath + '?ref=' + BRANCH);
  }).then(function(data) {
    if (!data || !data.content) throw new Error('\u{1F4C4} 无法读取 posts.json');
    var raw = atob(data.content.replace(/\n/g, ''));
    var content = decodeURIComponent(escape(raw));
    var json = JSON.parse(content);
    if (!json.posts) json.posts = [];
    json.posts = json.posts.filter(function(p) { return p.slug !== slug; });
    return gh('/repos/' + REPO + '/contents/' + jsonPath, 'PUT', {
      message: 'delete: remove ' + slug + ' from index',
      content: utf8ToBase64(JSON.stringify(json, null, 2)),
      sha: data.sha,
      branch: BRANCH,
    });
  }).then(function() {
    var card = btn.closest('.blog-card, article');
    if (card) card.remove();
  }).catch(function(err) {
    console.error('Delete failed:', err);
    btn.disabled = false;
    btn.textContent = '\u{1F5D1}';
    alert('\u{274C} 删除失败：' + err.message + '\n\n可能原因：\n1. Token 过期或权限不足\n2. GitHub API 限流\n3. 文件已被修改\n\n按 F12 查看控制台错误详情。');
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
