---
title: "个人品牌网站"
slug: personal-website
date: "2026-07-17"
tags: ["HTML", "CSS", "JS", "全栈项目"]
emoji: "🌐"
summary: "纯 HTML/CSS/JS 响应式个人站，支持深色模式。"
image: "https://picsum.photos/seed/personal-site/600/300"
---

## 项目概述

这是一个完全由原生 HTML、CSS 和 JavaScript 构建的响应式个人品牌网站。没有使用任何前端框架或构建工具，追求极致的加载速度和可控性。

网站集成了作品集展示、博客系统、联系表单等功能模块，同时包含了丰富的动效交互，如 Three.js 3D 场景、物理模拟粒子效果、滚动动画等。

## 核心功能

- **响应式设计** — 适配移动端、平板和桌面端
- **深色/浅色主题** — 支持系统偏好检测和手动切换
- **3D 动效** — 使用 Three.js 实现 Lanyard 学生卡交互效果
- **物理模拟** — Matter.js 驱动的标签下落与拖拽效果
- **滚动动画** — Intersection Observer 驱动的渐入动画
- **开场屏** — 带变宽字效和滚动条的车轮式导航
- **联系表单** — 带交互反馈的响应式表单

## 技术栈

<span class="project-tag">HTML5</span>
<span class="project-tag">CSS3</span>
<span class="project-tag">JavaScript</span>
<span class="project-tag">Three.js</span>
<span class="project-tag">Matter.js</span>
<span class="project-tag">响应式设计</span>

## 设计亮点

### 开场体验

进入网站时，首先看到的是一个带有变宽字效的开场屏。鼠标在字母间移动时，字重会随距离动态变化，营造出独特的交互感受。左侧的轮盘导航支持滚轮和拖拽操作。

### Lanyard 学生卡

滚动到"最近项目"区域时，会触发一个带有弹簧物理模拟的学生卡动效。卡片通过 Verlet 积分模拟的绳子连接，用户可以拖拽卡片并释放，绳子会产生真实的弹性和回弹效果。

### 深色模式

通过 CSS 自定义变量实现了完整的深色/浅色主题切换体系。所有颜色在两种主题下都有对应的设计，确保在任何环境下都有良好的阅读体验。

## 项目总结

这个项目展示了如何使用纯前端技术构建一个功能完整、体验流畅的个人品牌网站。通过精心设计的交互细节和视觉风格，打造出了独具个性的在线形象。
