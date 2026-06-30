# Homepage · 个人站点

基于 Astro 7 + React + Tailwind v4 构建的个人主页与博客，以「维度裂隙（Dimension Rift）」为视觉主题——暗色虚空、红色裂隙光环、CRT 扫描线纹理。

## ✨ 特性

- **个人中心首页** (`/`) — 头像、信息词条、一言打字效果、社交链接、主题切换
- **博客板块** (`/blog`) — 基于 Astro Content Collections 的 Markdown 博客
  - **标签筛选** — 按标签过滤文章，状态同步到 URL（`?tag=...`），支持分享与刷新保持
  - **实时搜索** — 按标题 / 描述 / 标签全文匹配，`/` 键聚焦、`Esc` 清空
  - **分页** — 文章数超过单页时自动分页（默认每页 6 篇），状态写入 URL（`?page=...`）
  - **评论系统** — 文章详情页底部，兼容 **Waline** 与 **Twikoo** 两种已部署服务，滚动进入视口后懒加载
- **视觉系统** — 统一的全局背景图与遮罩（根据浅色/深色主题智能调整）、Space Grotesk 标题、Geist Variable 正文、响应式 CRT 扫描线
- **主题切换** — 原生支持浅色（Ivory & Crimson）与深色（Void & Teal）主题无缝切换，并持久化本地存储
- **响应式 & 无障碍** — 移动端适配，尊重 `prefers-reduced-motion`

## 📁 项目结构

```text
/
├── public/                  # 静态资源（头像、favicon）
├── src/
│   ├── components/
│   │   ├── astro/            # Astro 组件
│   │   │   ├── BlogNav.astro
│   │   │   └── ThemeToggle.astro
│   │   └── react/            # React 组件
│   │       ├── ui/           # shadcn 基础组件
│   │       │   └── button.tsx
│   │       ├── BlogExplorer.tsx   # 博客列表交互（筛选 / 搜索 / 分页）
│   │       ├── PostCard.tsx       # 列表卡片（React 版）
│   │       ├── Comments.tsx       # 评论系统（Waline / Twikoo 懒加载）
│   │       ├── InfoCard.tsx
│   │       ├── SocialLinks.tsx
│   │       └── Typewriter.tsx
│   ├── config/
│   │   └── site.yaml        # 站点配置（首页内容）
│   ├── content/
│   │   └── blog/            # ← 博客 Markdown 文章
│   ├── content.config.ts    # Content Collections 定义
│   ├── layouts/
│   │   └── Layout.astro     # 基础 HTML 外壳
│   ├── lib/                 # 工具与配置加载
│   │   ├── blog.ts          # 博客查询 / 阅读时间 / 日期
│   │   ├── site.ts          # 站点配置加载器
│   │   ├── icons.tsx
│   │   └── uapis.ts         # 一言客户端（浏览器 SDK）
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── index.astro          # 博客列表页 /blog
│   │   │   └── [...slug].astro      # 文章详情页 /blog/:slug
│   │   └── index.astro      # 首页 /
│   └── styles/global.css    # 主题与 Tailwind
├── astro.config.mjs
├── components.json          # shadcn 配置
└── package.json
```

## 🚀 快速开始

```sh
pnpm install        # 安装依赖
pnpm dev             # 启动开发服务器 localhost:4321
pnpm build          # 构建生产站点到 ./dist/
pnpm preview        # 本地预览构建产物
```

## ✍️ 写博客

博客基于 Astro Content Collections（content layer API），文章位于 `src/content/blog/`，使用 Markdown 编写。

**frontmatter 字段**：

```yaml
---
title: "文章标题"
description: "一句话摘要，用于列表展示与 SEO"
pubDate: 2026-06-29            # 发布日期
updatedDate: 2026-06-30         # 可选，更新日期
tags: ["标签1", "标签2"]        # 可选，默认空数组
draft: false                    # 可选，true 时不会发布
---

正文使用 Markdown 编写……
```

**相关文件**：

| 文件 | 作用 |
| :--- | :--- |
| `src/content.config.ts` | 集合定义，`glob` loader + 字段 schema |
| `src/lib/blog.ts` | `getPublishedPosts()`、`toSummary()`、`getTagsWithCount()`、`readingTime()`、`formatDate()`、`BlogPost` / `PostSummary` 类型 |
| `src/pages/blog/index.astro` | 博客列表页 `/blog`，将文章序列化为 `PostSummary[]` 传入 `BlogExplorer` |
| `src/components/react/BlogExplorer.tsx` | 列表交互核心：标签筛选 + 搜索 + 分页 + URL 同步 + 空状态 |
| `src/components/react/PostCard.tsx` | 列表卡片（React 版，样式与 `BlogPostCard.astro` 对齐） |
| `src/components/react/Comments.tsx` | 评论系统，按配置懒加载 Waline 或 Twikoo |
| `src/pages/blog/[...slug].astro` | 文章详情页，正文样式位于 `.prose-rift`，底部嵌入评论 |
| `src/components/astro/BlogNav.astro` | 博客页顶部导航栏，集成了主题切换按钮 |
| `src/components/astro/ThemeToggle.astro` | 主题切换组件，支持 Sun/Moon 旋转动画与状态同步 |

**筛选 / 搜索 / 分页**：列表页由 `BlogExplorer`（React 岛屿）承担交互。初始状态（无筛选、第 1 页）经 SSR 渲染进 HTML，保证首屏内容完整、对 SEO 友好；挂载后读取 URL 的 `?tag` / `?q` / `?page` 应用筛选。状态变更通过 `history.replaceState` 写回 URL，不污染历史栈，可直接复制链接分享筛选结果。

**评论系统**：文章详情页底部按 `site.yaml` 的 `comments` 配置懒加载评论服务（`client:visible`，滚动进入视口才加载脚本，不阻塞首屏）：

```yaml
comments:
  provider: "waline"        # waline | twikoo | none
  waline:
    serverURL: "https://your-waline.vercel.app"
  twikoo:
    envId: "https://your-twikoo.vercel.app"
```

- **Waline**：经 npm 包 `@waline/client` 动态导入，样式随脚本懒加载。
- **Twikoo**：经 CDN 注入脚本后调用 `twikoo.init`（其 npm 包为 UMD，故按官方推荐方式接入）。
- 两者均传入 `dark: 'html.dark'`，跟随站点主题切换；并通过对齐的 CSS 变量与裂隙配色统一。
- `provider: none` 时不渲染评论区；地址未配置时显示方向性错误提示与「重试」按钮。

**新增一篇文章**：在 `src/content/blog/` 下新建 `.md` 文件即可，文件名即为 URL slug（`welcome.md` → `/blog/welcome`），无需改动代码。首页（`src/pages/index.astro`）在社交链接下方已链接到 `/blog`。

**视觉约定**：网站采用「维度裂隙（Dimension Rift）」主题，支持双主题切换：
- **深色模式**：暗色虚空背景（oklch 270）、红色主色（oklch 18）、青色点缀（oklch 180）、全局背景图片 + 暗色遮罩、CRT 扫描线。
- **浅色模式**：象牙柔白背景（oklch 90）、深红主色（oklch 18）、深青点缀（oklch 180）、全局背景图片 + 高亮度遮罩（确保深色文字可读性）。

## 🛠️ 站点配置

首页展示的所有信息（头像、背景、信息词条、社交链接、一言）均在 `src/config/site.yaml` 中配置，修改后无需改动代码。字段类型定义见 `src/lib/site.ts`。

## 🧞 命令

| 命令               | 动作                                  |
| :----------------- | :------------------------------------ |
| `pnpm install`    | 安装依赖                              |
| `pnpm dev`         | 启动本地开发服务器 `localhost:4321`  |
| `pnpm build`       | 构建生产站点到 `./dist/`             |
| `pnpm preview`     | 本地预览构建产物                      |
| `pnpm astro ...`   | 运行 CLI，如 `astro check`            |

## 📖 相关文档

- [Astro 文档](https://docs.astro.build)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro 组件](https://docs.astro.build/en/basics/astro-components/)
- [Tailwind 样式](https://docs.astro.build/en/guides/styling/)
