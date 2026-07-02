---
title: "裂隙美学：站点的视觉设计笔记"
description: "从「维度裂隙」的概念出发，聊聊这个站点视觉风格背后的设计思路——暗色虚空、红色裂隙、以及 CRT 纹理的复古质感。"
pubDate: 2026-06-29
tags: ["设计", "前端"]
draft: false
---

## 设计原点

这个站点的视觉灵感来源于一个意象：**维度裂隙（Dimension Rift）**——想象在深邃的虚空中，一道发光的裂隙缓缓旋转，连接着两个不同的世界。

由此衍生出三组核心色彩：

| 角色                  | 色值                   | 含义                   |
| --------------------- | ---------------------- | ---------------------- |
| **Void（虚空）**      | `oklch(0.13 0.02 270)` | 深蓝黑背景，无尽深邃   |
| **Webline（网线红）** | `oklch(0.58 0.22 18)`  | 裂隙的红色光芒，主色调 |
| **Dimension（维度）** | `oklch(0.72 0.12 180)` | 青色点缀，交互反馈     |

## 裂隙光环的实现

头像周围的旋转光环是页面的视觉重心。它使用 CSS `conic-gradient` 配合 `@property` 自定义属性实现平滑动画：

```css
@property --rift-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.rift-border {
  background: conic-gradient(
    from var(--rift-angle, 0deg),
    oklch(0.58 0.22 18),
    oklch(0.72 0.12 180),
    oklch(0.58 0.22 18)
  );
  animation: rift-spin 8s linear infinite;
}

@keyframes rift-spin {
  to {
    --rift-angle: 360deg;
  }
}
```

关键技巧在于 `mask` 属性——通过径向渐变只保留外圈 3px 的环形，让中间的背景透出来。

## 扫描线纹理

为了增加一点复古 CRT 屏幕的质感，页面叠加了一层扫描线纹理：

```css
.scan-lines {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.04) 3px,
    rgba(0, 0, 0, 0.04) 4px
  );
  mix-blend-mode: multiply;
}
```

这层纹理非常微妙——在深色背景上几乎不可见，但在浅色区域会浮现出细微的横线，像是老式显示器的扫描线。

## 可访问性考量

对于偏好减少动画的用户，通过 `prefers-reduced-motion` 媒体查询禁用了所有旋转动画和扫描线纹理：

```css
@media (prefers-reduced-motion: reduce) {
  .rift-border {
    animation: none;
  }
  .scan-lines {
    display: none;
  }
}
```

> 好的设计不仅是好看的，更是包容的。
