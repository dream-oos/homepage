# 项目架构 · Homepage

> 本文档记录 Homepage 个人站点的整体架构、核心设计决策与数据流。
> 快速上手与命令请见 [根目录 README](../README.md)；优化建议请见 [OPTIMIZATION.md](./OPTIMIZATION.md)。

## 1. 项目概览

Homepage 是一个基于 **Astro 7 + React 19 + Tailwind v4** 构建的个人主页与博客站点，以「维度裂隙（Dimension Rift）」为视觉主题——暗色虚空、红色裂隙光环、青色点缀、CRT 扫描线纹理。

- **输出形态**：纯静态（`output: 'static'`），构建产物可直接托管于 Vercel / Cloudflare Pages / Netlify。
- **核心页面**：个人中心首页 `/` 与博客板块 `/blog`（列表 + 详情）。
- **配置驱动**：首页展示的所有内容由 `src/config/site.yaml` 配置，修改配置无需改动代码。

## 2. 技术栈

| 层      | 技术                           | 版本   | 说明                                                    |
| :------ | :----------------------------- | :----- | :------------------------------------------------------ |
| 框架    | Astro                          | ^7.0.3 | 静态生成 + Content Collections（content layer API）     |
| 交互    | React                          | ^19.2  | 经 `@astrojs/react` 集成，以岛屿形式挂载                |
| 样式    | Tailwind CSS                   | ^4.3   | 经 `@tailwindcss/vite` 接入，配合 `tw-animate-css` 动画 |
| UI 体系 | shadcn                         | ^4.12  | `base-nova` 风格，组件落地于 `src/components/react/ui/` |
| 图标    | lucide-react                   | ^1.21  | 品牌图标（如 Github）因 lucide 1.x 移除而自定义补充     |
| 字体    | Geist Variable + Space Grotesk | —      | 正文 Geist，标题 Space Grotesk（经 Google Fonts CDN）   |
| 内容    | Markdown + glob loader         | —      | 文章源文件 `src/content/blog/*.md`                      |
| 评论    | Waline / Twikoo                | —      | 双服务可切换，按需懒加载                                |
| 搜索    | pinyin-pro                     | ^3.28  | 拼音模糊匹配（全拼 / 首字母 / 部分）                    |
| 配置    | yaml                           | ^2.9   | YAML 文本经 Vite `?raw` 内联，构建期解析                |
| 一言    | uapi-browser-sdk               | ^0.1   | 浏览器端直连 uapis.cn，无需服务端代理                   |
| 类型    | TypeScript                     | ^6.0   | `astro/tsconfigs/strict` 严格模式                       |
| 包管理  | pnpm                           | —      | 工作区见 `pnpm-workspace.yaml`                          |

## 3. 目录结构

```text
homepage/
├── public/                          # 静态资源（原样拷贝到产物根）
│   ├── avatar.webp                  # 默认头像
│   ├── favicon.svg
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── astro/                   # Astro 组件（SSR，无 hydration）
│   │   │   ├── BlogNav.astro        # 博客页固定顶栏（标题 + 博客链接 + 主题切换）
│   │   │   └── ThemeToggle.astro    # 主题切换按钮（Sun/Moon 旋转 + is:inline 脚本）
│   │   └── react/                   # React 岛屿组件
│   │       ├── ui/                  # shadcn 基础组件
│   │       │   └── button.tsx
│   │       ├── BlogExplorer.tsx     # 博客列表交互核心（筛选/搜索/分页/URL 同步）
│   │       ├── PostCard.tsx         # 文章卡片（含搜索高亮渲染）
│   │       ├── Comments.tsx         # 评论系统（Waline/Twikoo 懒加载 + 重试）
│   │       ├── CodeBlockEnhancer.tsx# 代码块增强（复制按钮 + 长块折叠遮罩）
│   │       ├── ReadingNav.tsx       # 阅读导航（悬浮 TOC + 进度 + 回到顶部）
│   │       ├── InfoCard.tsx         # 首页信息词条卡片
│   │       ├── SocialLinks.tsx      # 社交链接（页脚）
│   │       └── Typewriter.tsx       # 一言打字效果（循环打字 / 删除）
│   ├── config/
│   │   └── site.yaml                # 站点配置（首页内容、评论、一言、社交链接）
│   ├── content/
│   │   └── blog/                    # 博客 Markdown 文章
│   ├── content.config.ts            # Content Collections 定义（glob loader + zod schema）
│   ├── env.d.ts                     # 环境类型声明（yaml?raw、waline style 模块）
│   ├── layouts/
│   │   └── Layout.astro             # 基础 HTML 外壳（全局背景层 + 防闪烁主题脚本）
│   ├── lib/                         # 工具与配置加载
│   │   ├── blog.ts                  # 博客查询 / 阅读时间 / 日期 / 摘要序列化
│   │   ├── site.ts                  # 站点配置加载器（YAML 解析 + 类型 + 缓存）
│   │   ├── pinyin.ts                # 拼音模糊匹配 + 命中索引 + 片段拆分（高亮用）
│   │   ├── uapis.ts                 # 一言客户端（浏览器 SDK + 超时保护）
│   │   ├── icons.tsx                # 图标注册表（名称 → 组件映射）
│   │   └── utils.ts                 # cn() 工具（clsx + tailwind-merge）
│   ├── pages/
│   │   ├── index.astro              # 首页 /
│   │   └── blog/
│   │       ├── index.astro          # 博客列表页 /blog
│   │       └── [...slug].astro      # 文章详情页 /blog/:slug（含 prose-rift 样式）
│   └── styles/
│       └── global.css               # 主题变量 + Tailwind + 全局裂隙动画
├── astro.config.mjs                 # Astro 配置（静态输出 + react + tailwindcss 插件）
├── components.json                  # shadcn 配置（base-nova 风格）
├── tsconfig.json                    # TS 严格模式 + @/* 路径别名
└── package.json
```

## 4. 核心设计决策

### 4.1 Astro Content Collections（content layer API）

博客内容基于 Astro 7 的 content layer API，定义于 `src/content.config.ts`：

```ts
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});
```

- `glob` loader 在构建期扫描 Markdown 文件，**文件名即为 URL slug**（`welcome.md` → `/blog/welcome`）。
- `zod` schema 校验 frontmatter，`pubDate` 自动 coerce 为 `Date`，`tags` / `draft` 有默认值。
- `getStaticPaths()` 为每篇已发布文章（`draft !== true`）生成静态详情页。

### 4.2 SSR 优先 + 渐进增强（岛屿架构）

站点遵循 Astro 的「岛屿架构」：页面主体在构建期由 Astro SSR 渲染为完整 HTML，仅在需要交互的位置挂载 React 岛屿。

**博客列表页是这一模式的典型**：

1. 构建期：`index.astro` 调用 `getPublishedPosts()` 获取全部文章，经 `toSummary()` 序列化为纯数据 `PostSummary[]`，连同标签列表 `TagCount[]` 传入 `BlogExplorer` 岛屿。
2. 初始状态（无筛选、第 1 页）经 SSR 渲染进 HTML，保证首屏内容完整、对 SEO 友好。
3. 客户端挂载后（`client:load`），`BlogExplorer` 通过 `useEffect` 读取 URL 的 `?tag` / `?q` / `?page` 应用筛选——因此无水合不匹配，且直接访问带参数链接也能正确呈现。
4. 状态变更通过 `history.replaceState` 写回 URL，不污染历史栈，可复制链接分享筛选结果。

### 4.3 PostSummary 序列化模式

**关键约束**：React 客户端组件**不能**直接 `import @/lib/blog`，因为后者依赖 `astro:content`（仅构建期可用，运行时会报错）。

解决方案：

- `lib/blog.ts` 定义纯数据接口 `PostSummary`（标题、描述、ISO 日期字符串、标签数组、阅读分钟数），不依赖任何 Astro 运行时。
- 列表页在构建期调用 `toSummary(post)` 将 `CollectionEntry` 映射为 `PostSummary`。
- 客户端组件以 `import type { PostSummary }` 引入类型——`import type` 在编译期被擦除，不会把 `astro:content` 带入客户端 bundle。

### 4.4 URL 状态同步

`BlogExplorer` 内部封装了 URL 读写：

| 函数         | 作用                                                                        |
| :----------- | :-------------------------------------------------------------------------- |
| `readUrl()`  | 挂载时从 `window.location.search` 解析 `?tag` / `?q` / `?page` 为初始状态   |
| `writeUrl()` | 状态变更时以 `history.replaceState` 写回（仅保留非空参数，`page=1` 不写入） |

- 用 `hydrated` 标志位确保「先读后写」，避免覆盖初始 URL 读取。
- `/` 快捷键聚焦搜索框，`Esc` 清空搜索——交互细节完整。

### 4.5 主题系统与 FOUC 防护

站点支持浅色（Ivory & Crimson）与深色（Void & Teal）双主题切换：

- **防闪烁（FOUC）**：`Layout.astro` 头部内联一段 `is:inline` 脚本，在首次绘制前读取 `localStorage.theme`（回退到 `prefers-color-scheme`），为 `<html>` 添加 / 移除 `.dark` 类。
- **切换**：`ThemeToggle.astro` 用 `is:inline` 脚本绑定点击事件，切换 `.dark` 类并写 `localStorage`，同时派发 `theme-change` 自定义事件。
- **CSS 变量驱动**：`global.css` 的 `:root`（浅色）与 `.dark`（深色）分别定义全套 oklch 色彩变量，所有组件通过 `bg-background`、`text-foreground` 等 Tailwind 语义类消费，无需在组件层判断主题。
- **评论系统跟随**：Waline / Twikoo 初始化时传入 `dark: 'html.dark'`，自动随站点主题切换。

### 4.6 视觉签名系统（裂隙）

全站复用一套「裂隙」视觉语言，核心是 `@property --rift-angle` + `conic-gradient`：

```css
@property --rift-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
@keyframes rift-spin {
  to {
    --rift-angle: 360deg;
  }
}
```

裂隙签名在以下位置复用，保持视觉统一：

| 位置                        | 实现                                                        |
| :-------------------------- | :---------------------------------------------------------- |
| 首页头像旋转光环            | `index.astro` 内 `.rift-glow` + `.rift-border`（mask 留环） |
| 博客页眉 / 文章头部分隔线   | `.rift-line`（各页面 scoped `<style>`）                     |
| 激活的标签 / 分页按钮下划线 | `global.css` 的 `.rift-underline`                           |
| TOC 当前章节左侧标记条      | `global.css` 的 `.toc-rift-bar`                             |
| 文章正文 `<hr>` 分隔        | `[...slug].astro` 内 `.prose-rift hr`                       |

> 注：因 Astro scoped `<style>` 会改写 keyframe 名，`global.css` 提供一份全局 `rift-spin`，各页面局部另有同名定义互不冲突。所有动画均在 `prefers-reduced-motion: reduce` 下禁用。

### 4.7 评论系统懒加载

文章详情页底部评论区由 `Comments.tsx` 承担，以 `client:visible` 挂载——滚动进入视口才加载脚本，不阻塞首屏：

- **Waline**：`import("@waline/client")` 动态导入（纯 ESM，构建期按需分包），样式随脚本懒加载。返回的实例带 `destroy()`，卸载时正确清理。
- **Twikoo**：npm 包为 UMD（依赖浏览器全局变量），按官方推荐经 CDN 注入 `<script>` 后调用 `window.twikoo.init`。
- 两者均传 `dark: 'html.dark'` 跟随主题；`[...slug].astro` 的全局 `<style>` 通过 CSS 变量对齐 Waline / Twikoo 配色与站点裂隙主题。
- `provider: none` 时不渲染；地址未配置或加载失败时显示方向性错误提示与「重试」按钮（点击自增 `retry` 触发 effect 重挂载）。

### 4.8 代码块增强

`CodeBlockEnhancer.tsx` 以 DOM 增强方式工作（代码块由 Astro 构建期渲染为静态 HTML，组件在客户端操作 DOM）：

- 包装每个 `<pre>` 为 `.code-block-wrapper`，右上角加复制按钮（`navigator.clipboard.writeText`，复制成功 2s 内显示对勾）。
- 超过 14 行的代码块标记 `is-collapsible`，默认折叠（`max-height: 300px`），底部半透明遮罩 + 居中「展开 / 折叠」按钮。
- 用 `dataset.enhanced` 标记防止重复增强（兼容未来 View Transitions 重新挂载）。
- 可访问性：折叠按钮带 `aria-controls` / `aria-expanded`，与代码区 `id` 关联。

### 4.9 阅读导航

`ReadingNav.tsx` 提供右下角悬浮控件：

- 展开 TOC 列出 h2–h4，点击平滑滚动定位（`scroll-margin-top` 预留顶栏高度避免遮挡）。
- 滚动监听用 `requestAnimationFrame` 节流，计算阅读进度百分比 + 当前章节（最后一个已滚过顶栏的标题）。
- 当前章节左侧以 `.toc-rift-bar` 裂隙条标记。
- 滚动超过 400px 显示「回到顶部」按钮；`Esc` 关闭面板；移动端跳转后自动收起。
- 尊重 `prefers-reduced-motion`：降级为 `auto` 即时滚动。

## 5. 数据流

### 5.1 站点配置流

```
src/config/site.yaml  ──(Vite ?raw 内联文本)──┐
                                               ▼
                        lib/site.ts  parse(yamlRaw) + 默认值合并 + 缓存
                                               │
                                  getSiteConfig(): SiteConfig
                                               │
              ┌────────────────┬───────────────┴───────────────┐
              ▼                ▼                               ▼
        Layout.astro      pages/index.astro              [...slug].astro
        (背景图)          (头像/信息/一言/社交)         (评论配置)
```

`getSiteConfig()` 带模块级缓存，多次调用只解析一次。评论配置 `CommentsConfig` 有完整默认值回退（未声明时 `provider: 'none'`）。

### 5.2 博客内容流

```
src/content/blog/*.md
        │  (content layer glob loader + zod schema)
        ▼
content.config.ts → CollectionEntry<"blog">
        │
        ▼
lib/blog.ts
  ├─ getPublishedPosts()  过滤草稿 + 按日期降序
  ├─ toSummary()          → PostSummary[]（可序列化，传客户端）
  ├─ getTagsWithCount()   → TagCount[]（按数量降序、名称升序）
  ├─ readingTime()        CJK 300字/分 + 拉丁 200词/分
  └─ formatDate()         中文长格式
        │
        ├─────────────────────────────────┐
        ▼                                 ▼
  blog/index.astro (列表页)          blog/[...slug].astro (详情页)
  SSR 渲染初始列表                   render(post) → Content + headings
  传入 BlogExplorer 岛屿             传入 CodeBlockEnhancer/ReadingNav/Comments
```

### 5.3 搜索与高亮流

```
用户输入 query
   │
   ▼
lib/pinyin.ts  pinyinMatch(text, query)
   ├─ 拉丁/数字/精确中文 → 原生子串 includes（最快）
   └─ 含 CJK 文本 → pinyin-pro match() 全拼/首字母/部分匹配
   │
   ▼
matchedIndices(text, query) → Set<number>  命中字符索引
   │
   ▼
splitByHits(text, hits) → {text, highlight}[]  拆分片段
   │
   ▼
PostCard <Highlighted> 渲染 <mark> 高亮
```

## 6. 配置系统

站点配置全部集中在 `src/config/site.yaml`，类型定义与加载逻辑在 `src/lib/site.ts`。

### 6.1 配置结构

```yaml
site: # 浏览器标签页标题与副标题
avatar: # 头像图片、alt、名字、签名
background: # 背景图 URL + 遮罩透明度 (0-1)
info: # 左右两侧信息词条（label/value/icon/href?）
hitokoto: # 一言打字效果（开关 + 速度 + 停留时长 + 兜底文案）
social: # 页脚社交链接（name/icon/href）
comments: # 评论系统（provider: waline|twikoo|none + 对应地址）
```

### 6.2 加载机制

- YAML 文本经 Vite `?raw` 在构建期内联进产物（无运行时文件读取，兼容预渲染与 SSR）。
- `getSiteConfig()` 用 `yaml` 包解析，与 `defaultComments` 深合并后返回类型化的 `SiteConfig`，并缓存于模块级变量。
- `env.d.ts` 声明了 `*.yaml?raw` 模块类型，保证 TS 识别。

### 6.3 图标映射

`site.yaml` 中图标以字符串名引用，`lib/icons.tsx` 维护 `icons` 注册表将名称映射为组件：

- 大部分图标来自 `lucide-react`。
- `Github` 品牌图标因 lucide 1.x 移除品牌图标而用自定义 SVG 补充。
- `getIcon(name)` 找不到时回退到 `Sparkles`，避免配置笔误导致崩溃。

## 7. 博客内容模型

### 7.1 frontmatter 字段

```yaml
---
title: "文章标题"
description: "一句话摘要，用于列表展示与 SEO"
pubDate: 2026-06-29 # 发布日期（必填）
updatedDate: 2026-06-30 # 可选，更新日期
tags: ["标签1", "标签2"] # 可选，默认空数组
draft: false # 可选，true 时不发布
---
```

### 7.2 阅读时间估算

`readingTime()` 对中英混排分别估算：

- CJK 字符（`\u4e00-\u9fff` 汉字、`\u3040-\u30ff` 假名）按 ~300 字/分钟。
- 拉丁单词按 ~200 词/分钟。
- 两者求和后向上取整，至少 1 分钟。

### 7.3 正文样式

文章正文包裹在 `.prose-rift` 中，样式集中在 `[...slug].astro` 的全局 `<style>`：标题带左侧裂隙色边框、引用块、代码块、表格、`<hr>` 裂隙分隔等，全部通过 CSS 变量适配双主题。锚点跳转预留 `scroll-margin-top: 4.5rem` 避免被固定顶栏遮挡。

## 8. 组件清单

### 8.1 Astro 组件（SSR，无 hydration）

| 组件                | 职责                                                                         |
| :------------------ | :--------------------------------------------------------------------------- |
| `Layout.astro`      | HTML 外壳：`<head>` 元信息、全局背景层、防闪烁主题脚本、`<slot />`           |
| `BlogNav.astro`     | 博客页固定顶栏：站点标题 + 博客链接（当前页高亮）+ `ThemeToggle`             |
| `ThemeToggle.astro` | 主题切换按钮：Sun/Moon 旋转动画 + `is:inline` 点击脚本 + localStorage 持久化 |

### 8.2 React 岛屿组件

| 组件                | 挂载方式             | 职责                                                    |
| :------------------ | :------------------- | :------------------------------------------------------ |
| `BlogExplorer`      | `client:load`        | 列表交互核心：标签筛选 + 搜索（拼音） + 分页 + URL 同步 |
| `PostCard`          | （由 Explorer 渲染） | 文章卡片 + 搜索高亮 `<mark>`                            |
| `Comments`          | `client:visible`     | Waline / Twikoo 懒加载 + 错误重试                       |
| `CodeBlockEnhancer` | `client:load`        | DOM 增强代码块：复制 + 长块折叠                         |
| `ReadingNav`        | `client:load`        | 悬浮 TOC + 阅读进度 + 回到顶部                          |
| `InfoCard`          | `client:load`        | 首页信息词条（纯展示，错开入场动画）                    |
| `SocialLinks`       | `client:load`        | 页脚社交链接（纯展示）                                  |
| `Typewriter`        | `client:load`        | 一言循环打字 / 删除，光标 CSS 闪烁                      |

## 9. 部署

- **构建**：`pnpm build` 输出纯静态文件到 `./dist/`。
- **托管**：适配 Vercel / Cloudflare Pages / Netlify 等静态托管平台，无需服务端运行时。
- **评论服务**：Waline / Twikoo 需独立部署（Vercel 函数或腾讯云），在 `site.yaml` 填入地址后切换 `provider` 启用。
- **一言**：浏览器端直连 uapis.cn，无需自建代理（接口已支持 CORS）。
- **背景图**：当前配置指向外部随机图床，可改为本地静态资源以提升稳定性与 LCP。
