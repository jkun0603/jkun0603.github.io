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

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initActiveNav();
  initScrollAnimations();
  initContactForm();
  initBlogList();
  initProjects();
});
