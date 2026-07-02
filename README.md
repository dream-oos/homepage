# Homepage · 个人站点

基于 Astro 7 + React + Tailwind v4 构建的个人主页与博客，以「维度裂隙（Dimension Rift）」为视觉主题——暗色虚空、红色裂隙光环、CRT 扫描线纹理。

## ✨ 特性

- **个人中心首页** (`/`) — 头像、信息词条、一言打字效果、社交链接、主题切换
- **博客板块** (`/blog`) — 基于 Astro Content Collections 的 Markdown 博客
  - **标签筛选** — 按标签过滤，状态同步 URL，支持分享与刷新保持
  - **实时搜索** — 按标题 / 描述 / 标签全文匹配，支持拼音（全拼 / 首字母），`/` 键聚焦、`Esc` 清空
  - **分页** — 文章数超过单页时自动分页（默认每页 6 篇），状态写入 URL
  - **评论系统** — 兼容 Waline 与 Twikoo，滚动进入视口后懒加载
  - **代码块增强** — 一键复制；超长块（>14 行）默认折叠，附「展开 / 折叠」按钮
  - **阅读导航** — 右下角悬浮目录（TOC），跟随滚动高亮当前章节，附阅读进度与回到顶部
- **视觉系统** — 双主题（浅色 Ivory & Crimson / 深色 Void & Teal）无缝切换，统一的全局背景与遮罩、Space Grotesk 标题、Geist Variable 正文、响应式 CRT 扫描线
- **响应式 & 无障碍** — 移动端适配，尊重 `prefers-reduced-motion`

> 项目架构、设计决策、数据流、组件清单与详细优化建议已抽离到 [`docs/`](./docs/)：

| 文档                                             | 说明                                                   |
| :----------------------------------------------- | :----------------------------------------------------- |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | 技术栈、目录结构、核心设计决策、数据流、配置系统、部署 |
| [`docs/OPTIMIZATION.md`](./docs/OPTIMIZATION.md) | 按优先级分组的可落地优化清单                           |
| [`docs/INDEX.md`](./docs/INDEX.md)               | 文档索引                                               |

## 🚀 快速开始

```sh
pnpm install        # 安装依赖
pnpm dev            # 启动开发服务器 localhost:4321
pnpm build          # 构建生产站点到 ./dist/
pnpm preview        # 本地预览构建产物
pnpm exec astro check   # 类型检查
```

## ✍️ 写博客

博客基于 Astro Content Collections（content layer API），文章位于 `src/content/blog/`，使用 Markdown 编写。文件名即为 URL slug（`welcome.md` → `/blog/welcome`），无需改动代码。

**frontmatter 字段**：

```yaml
---
title: "文章标题"
description: "一句话摘要，用于列表展示与 SEO"
pubDate: 2026-06-29 # 发布日期
updatedDate: 2026-06-30 # 可选，更新日期
tags: ["标签1", "标签2"] # 可选，默认空数组
draft: false # 可选，true 时不会发布
---
正文使用 Markdown 编写……
```

新增文章：在 `src/content/blog/` 下新建 `.md` 文件即可。集合定义见 `src/content.config.ts`，查询与阅读时间逻辑见 `src/lib/blog.ts`。

**评论系统**：文章详情页底部按 `site.yaml` 的 `comments` 配置懒加载评论服务（`client:visible`，滚动进入视口才加载脚本）：

```yaml
comments:
  provider: "waline" # waline | twikoo | none
  waline:
    serverURL: "https://your-waline.vercel.app"
  twikoo:
    envId: "https://your-twikoo.vercel.app"
```

## 🛠️ 站点配置

首页展示的所有信息（头像、背景、信息词条、社交链接、一言、评论）均在 `src/config/site.yaml` 中配置，修改后无需改动代码。字段类型定义见 `src/lib/site.ts`。

## 🧞 命令

| 命令           | 动作                                |
| :------------- | :---------------------------------- |
| `pnpm install` | 安装依赖                            |
| `pnpm dev`     | 启动本地开发服务器 `localhost:4321` |
| `pnpm build`   | 构建生产站点到 `./dist/`            |
| `pnpm preview` | 本地预览构建产物                    |
| `pnpm check`   | 类型检查（`astro check`）           |
| `pnpm lint`    | 类型检查 + 代码格式检查             |
| `pnpm format`  | 自动格式化全仓库代码                |

## 📖 相关文档

- [项目文档](./docs/INDEX.md)
- [Astro 文档](https://docs.astro.build)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro 组件](https://docs.astro.build/en/basics/astro-components/)
- [Tailwind 样式](https://docs.astro.build/en/guides/styling/)
