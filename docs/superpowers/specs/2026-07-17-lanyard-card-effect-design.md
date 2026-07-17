# Lanyard 学生卡动效设计

## 概述

为个人站首页"最近项目" section 添加一个装饰性的 Three.js 3D 学生卡悬挂动效。卡片作为背景/氛围元素，不承载具体内容，提供拖拽互动体验。

## 技术栈

- **Three.js** — CDN 加载（unpkg / cdnjs），非模块方式
- **弹簧质点系统** — 自实现简单物理模拟绳子
- **Canvas 2D → Texture** — 在 canvas 上绘制学生卡 UI，贴到 Three.js PlaneGeometry
- **IntersectionObserver** — 触发/重新触发动效
- **零构建工具** — 不引入 npm、React、Webpack/Vite，保持纯静态站原样

## 视觉设计

### 布局位置

- 卡片位于"最近项目" section 右上方，浮动在内容之上
- 使用 `position: absolute` 容器，相对于 section 定位
- 卡片尺寸：180 × 252 px（3:4 比例）
- 绳子长度：约 200 px
- 悬挂点：section 顶部边缘偏右位置

### 学生卡外观

```
┌──────────────┐
│  ┌────────┐  │
│  │ ▣▣▣▣▣▣  │  │  ← 抽象几何图案装饰（圆 + 三角形 + 线条）
│  │ ▣▣▣▣▣▣  │  │
│  │ ▣▣▣▣▣▣  │  │
│  └────────┘  │
│              │
│  ✦ 青桔      │  ← 昵称
│  学习创造     │  ← 标语第一行
│  戒骄戒躁     │  ← 标语第二行
│              │
│  ────────   │  ← 细装饰分割线
│  ID: 0001   │
│  2026-2027   │
└──────────────┘
```

- 卡片材质：半透明白色磨砂质感
- 圆角：8px
- 边框：暖白细边框，1px
- 照片区域背景：浅灰色到白色渐变，居中绘制抽象几何图案
- 字体颜色：深灰色，极简风格

### 绳子

- 颜色：暖白色 #F0EDE6
- 宽度：2-3 px（用 Three.js Line 或 TubeGeometry 渲染）
- 用 4 个质点 + 3 个弹簧约束模拟自然垂落

### 光照

- 环境光 AmbientLight（柔和照明）
- 一个 DirectionalLight 或 HemisphereLight 营造立体感
- 背景透明（alpha: true），与页面融合

## 交互流程

1. 页面加载时卡片隐藏（在视口外上方）
2. IntersectionObserver 检测到"最近项目" section 进入视口
3. 入场动画：卡片从顶部滑下 → 绳子自然垂落 → 卡片轻轻晃动 → 静止悬挂
4. 鼠标悬停：cursor 变为 grab
5. 鼠标拖拽：卡片跟随鼠标位置，绳子弹簧随之拉伸（质点系统驱动）
6. 松开鼠标：阻尼弹簧回弹到悬挂位置 → 稳定后卡片向上缩回消失
7. 重新触发：每次 section 再次进入视口都重新执行步骤 3-6

## 技术实现细节

### 物理模拟（弹簧质点）

```
固定点（悬挂点）
    │
  弹簧1
    │
  质点1
    │
  弹簧2
    │
  质点2
    │
  弹簧3
    │
  质点3 ← 卡片附着在此
```

每个质点有位置和速度，弹簧施加胡克定律力：
- F = -k * (x - restLength)
- 阻尼力：F = -b * v

### 卡片刚体

- 卡片作为"伪刚体"附着在末端质点
- 拖拽时将鼠标位置作为目标，计算弹簧位移
- 回弹时自然收敛到悬挂点正下方

### CanvasTexture 生成

用 Canvas 2D API 绘制学生卡的完整 UI（照片区、文字、分割线等），生成 Three.js CanvasTexture，贴到 PlaneGeometry 上。

这样不需要任何外部图片资源。

### CDN 加载

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

独立的 `<script type="module">` 文件，封装所有逻辑。

## 文件结构

```
assets/
  js/
    lanyard-card.js    ← Three.js 场景 + 物理 + 交互逻辑
```

HTML 中在 section 内添加容器元素：
```html
<div id="lanyard-container" style="position:absolute;top:0;right:40px;width:250px;height:400px;pointer-events:none;z-index:5;">
  <!-- Three.js canvas inside will set pointer-events:auto so card
       interaction works while empty container area doesn't block clicks -->
</div>
```

## 触发逻辑（IntersectionObserver）

- 监听 `#lanyard-container` 的父 section
- 进入视口比例 > 10% 时触发
- 每次进入都触发（`once: false`）
- 防止动画进行中重复触发（用状态锁）

## 成功标准

- 卡片在 Chrome/Firefox/Safari 最新版正常渲染
- 60fps 流畅运行
- 不影响页面滚动性能（requestAnimationFrame + 低开销物理）
- 移动端自动隐藏（触摸设备上交互无意义）
