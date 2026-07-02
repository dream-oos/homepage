# 优化建议 · Homepage

> 基于对全站源码的审阅整理的优化清单，按优先级与类别分组。每项给出**问题**、**影响**、**建议方案**。
> 架构背景请见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 实施状态

本清单已全部落地，`astro check` 达 **0 errors / 0 warnings / 0 hints**，`pnpm build` 通过。

| 编号 | 优先级 | 标题                      | 状态      |
| :--- | :----- | :------------------------ | :-------- |
| 1.1  | P0     | zod deprecation 适配      | ✅ 已完成 |
| 1.2  | P1     | rift-spin keyframe 统一   | ✅ 已完成 |
| 1.3  | P1     | 抽离详情页内联样式        | ✅ 已完成 |
| 1.4  | P2     | withTimeout 改 async      | ✅ 已完成 |
| 1.5  | P2     | env.d.ts 重复声明合并     | ✅ 已完成 |
| 1.6  | P2     | formatDate 统一           | ✅ 已完成 |
| 2.1  | P1     | 背景图本地兜底            | ✅ 已完成 |
| 2.2  | P1     | Space Grotesk 字体本地化  | ✅ 已完成 |
| 2.3  | P2     | 移除未使用 twikoo 依赖    | ✅ 已完成 |
| 3.1  | P1     | RSS 订阅源                | ✅ 已完成 |
| 3.2  | P1     | sitemap                   | ✅ 已完成 |
| 3.3  | P1     | Open Graph / Twitter Card | ✅ 已完成 |
| 3.4  | P2     | canonical 链接            | ✅ 已完成 |
| 4.1  | P1     | ThemeToggle aria 状态     | ✅ 已完成 |
| 4.2  | P2     | 代码块复制 aria-live      | ✅ 已完成 |
| 5.1  | P1     | 社交链接占位符修正        | ✅ 已完成 |
| 6.1  | P2     | View Transitions          | ✅ 已完成 |
| 6.2  | P2     | 文章上下篇导航            | ✅ 已完成 |
| 6.3  | P2     | 背景遮罩配置失效修复      | ✅ 已完成 |
| 7.1  | P1     | Prettier 格式化配置       | ✅ 已完成 |
| 7.2  | P2     | CI 流水线                 | ✅ 已完成 |

## 优先级图例

- **P0 · 立即处理**：潜在运行错误、升级隐患或安全风险
- **P1 · 建议处理**：影响性能、SEO 或用户体验
- **P2 · 锦上添花**：代码整洁度、可维护性、功能增强

---

## 一、代码质量与可维护性

### 1.1 [P0] ✅ zod deprecation —— 为 Astro 7 升级做适配

**问题**：`src/content.config.ts` 从 `astro:content` 导入 `z`，`astro check` 报 `ts(6385) 'z' is deprecated`。Astro 7 的 content layer 已将 `z` 标记为废弃，未来版本可能移除。

**实施**：改为从 `astro/zod` 导入（Astro 推荐的稳定路径），无需额外安装 zod 包。

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
```

### 1.2 [P1] ✅ rift-spin keyframe 重复定义四处

**问题**：`@keyframes rift-spin` 在 `global.css`、`index.astro`、`blog/index.astro`、`blog/[...slug].astro` 各定义一份。

**实施**：在 `global.css` 增加全局 `.rift-line` 类与 `rift-spin` keyframe 作为唯一真源；移除 `blog/index.astro` 与 `[...slug].astro` 中的重复定义；`index.astro` 因 scoped 改写需保留本地 keyframe，加注释指向全局真源。

### 1.3 [P1] ✅ `[...slug].astro` 样式抽离

**问题**：文章详情页单文件 408 行，近 280 行内联 `<style>`。

**实施**：将 `.prose-rift` 正文样式与代码块增强样式抽到 `src/styles/prose.css`，评论主题适配抽到 `src/styles/comments.css`，由 `global.css` 统一 `@import`。详情页精简至约 140 行。

### 1.4 [P2] ✅ withTimeout 改 async

**问题**：`src/lib/uapis.ts` 的 `withTimeout` 被 `astro check` 提示可转为 async 函数。

**实施**：改为 `async function`。

### 1.5 [P2] ✅ env.d.ts 重复声明合并

**问题**：`declare module "@waline/client/style"` 出现 3 次。

**实施**：合并为一条声明。

### 1.6 [P2] ✅ formatDate 统一

**问题**：`lib/blog.ts` 与 `PostCard.tsx` 各有一份 `formatDate`，逻辑相同签名不同。

**实施**：新建 `src/lib/format.ts` 导出接受 `Date | string` 的统一 `formatDate`，`blog.ts` 再导出，`PostCard.tsx` 复用。注意不能放 `lib/blog.ts`（客户端不能 import astro:content）。

---

## 二、性能优化

### 2.1 [P1] ✅ 外部随机图床影响 LCP 与稳定性

**问题**：背景图指向第三方随机图床，LCP 不可控、宕机则背景空白。

**实施**：新建 `public/bg-fallback.svg`（符合裂隙主题的暗色虚空 + 红色裂隙 SVG）；`Layout.astro` 用 `error` 事件监听（替代内联 onerror 避免 astro check 误报）在图床失败时回退到本地 SVG。

### 2.2 [P1] ✅ Google Fonts 未本地化

**问题**：Space Grotesk 经 `fonts.googleapis.com` CDN 加载，首屏 FOUT 或阻塞。

**实施**：安装 `@fontsource/space-grotesk`，在 `global.css` 按字重 `@import`；移除 `Layout.astro` 的 Google Fonts `<link>`。构建产物内联字体文件，无外部依赖。

### 2.3 [P2] ✅ 移除未使用 twikoo 依赖

**问题**：Twikoo 走 CDN 注入，但 `twikoo` npm 包仍在 `dependencies`。

**实施**：`pnpm remove twikoo`，从依赖移除。

## 三、SEO 与可发现性

### 3.1 [P1] ✅ RSS 订阅源

**问题**：博客无 RSS feed，读者无法订阅。

**实施**：安装 `@astrojs/rss`，新建 `src/pages/rss.xml.ts`，基于 `getPublishedPosts()` 生成 feed，包含标题、描述、pubDate、链接与标签分类。`Layout.astro` 添加 `<link rel="alternate">` 便于发现。

### 3.2 [P1] ✅ sitemap

**问题**：无 `sitemap.xml`，搜索引擎抓取效率低。

**实施**：安装 `@astrojs/sitemap` 集成接入 `astro.config.mjs`，配置 `site` URL 自动生成 sitemap；`Layout.astro` 添加 `<link rel="sitemap">`。

### 3.3 [P1] ✅ Open Graph / Twitter Card

**问题**：`<head>` 仅有 `description`，无社交分享元信息，分享无预览卡片。

**实施**：`Layout.astro` 新增 `og:title` / `og:description` / `og:url` / `og:image` / `og:site_name` 与 `twitter:card` / `twitter:title` / `twitter:description` / `twitter:image`。各页面通过 `<Layout title description>` 传入对应内容自动消费。

### 3.4 [P2] ✅ canonical 链接

**问题**：无 `<link rel="canonical">`，带查询参数 URL 可能被视为重复内容。

**实施**：`Layout.astro` 基于 `Astro.site` + `Astro.url.pathname` 生成 canonical 绝对链接。

---

## 四、可访问性（A11y）

### 4.1 [P1] ✅ ThemeToggle aria 状态同步

**问题**：切换按钮未声明当前主题状态，屏幕阅读器用户无法得知深/浅色。

**实施**：`ThemeToggle.astro` 的 `is:inline` 脚本中根据 `.dark` 类动态设置 `aria-pressed` 与语义化 `aria-label`（如「切换到浅色模式（当前深色）」），并在 `theme-change` 事件时同步所有按钮状态。

### 4.2 [P2] ✅ 代码块复制反馈 aria-live

**问题**：复制成功仅视觉变化，无屏幕阅读器播报。

**实施**：`CodeBlockEnhancer.tsx` 在工具栏添加 `role="status"` + `aria-live="polite"` 的 `.sr-only` 元素，复制成功时写入「已复制」文本；`global.css` 新增 `.sr-only` 工具类。同时复制按钮 `aria-label` 同步切换。

---

## 五、配置与内容

### 5.1 [P1] ✅ 社交链接占位符修正

**问题**：`site.yaml` 的 `social` 为占位符（`github.com/yourname`），与 `info` 区的 `@dream-oos` 不一致。

**实施**：统一为真实地址 `https://github.com/dream-oos` 与 `mailto:3448104699@qq.com`，与 info 区保持一致。

---

## 六、功能增强

### 6.2 [P2] ✅ 文章上下篇导航

**问题**：详情页底部只有「返回博客」，读者需返回列表才能看下一篇，跳出率高。

**实施**：`lib/blog.ts` 新增 `getAdjacentPosts(posts, current)` 返回较新/较旧文章；`[...slug].astro` 底部渲染上一篇/下一篇卡片导航，两端无文章时占位保持布局对齐。

### 6.3 [P2] ✅ 背景遮罩配置失效修复

**问题**：`Layout.astro` 用 `!important` 硬编码覆盖 `site.yaml` 的 `background.overlay`，配置项实际失效。

**实施**：`BackgroundConfig` 改为 `overlayLight` / `overlayDark` 双字段（`site.ts` 类型与默认值 + 旧 `overlay` 向后兼容）；`site.yaml` 配置双遮罩值；`Layout.astro` 通过 inline `<style>` 注入 `--bg-overlay-light` / `--bg-overlay-dark` CSS 变量，移除 `!important`。

---

## 七、工程化与开发者体验

### 7.1 [P1] ✅ Prettier 格式化配置

**问题**：无格式化与 Lint 配置，代码风格依赖人工保持。

**实施**：安装 `prettier` + `prettier-plugin-astro` + `prettier-plugin-tailwindcss`（devDependencies）；新建 `.prettierrc.json`（含 Tailwind class 自动排序）与 `.prettierignore`；`package.json` 新增 `check` / `lint` / `format` 脚本。

### 7.2 [P2] ✅ CI 流水线

**问题**：无 CI 配置，错误代码无自动拦截。

**实施**：新建 `.github/workflows/ci.yml`，push/PR 到 main 时触发，执行 install → `pnpm lint`（类型 + 格式）→ `pnpm build`，确保类型、格式与构建均通过。

---

## 八、功能增强（补充）

### 6.1 [P2] ✅ View Transitions

**问题**：页面间导航为整页刷新，背景图、顶栏等共享元素每次重新渲染有闪烁感。

**实施**：`Layout.astro` 引入 `<ClientRouter />`（来自 `astro:transitions`）启用 View Transitions API，实现页面间平滑过渡。

适配要点：

- 背景层加 `transition:persist`，导航时保留背景图不重新加载。
- `ThemeToggle.astro` 已监听 `astro:page-load` 重新绑定按钮（is:inline 脚本默认不重执行，靠事件驱动）。
- `CodeBlockEnhancer` 不 persist，导航时重新挂载，`useEffect` 重跑增强新页面代码块（`dataset.enhanced` 防重复）。
- `BlogExplorer` 不 persist，导航时重新挂载并读取 URL 恢复筛选状态（URL 状态同步设计正好支持）。
- `ReadingNav` 不 persist，每篇文章重新挂载获取新 headings。

## 九、部署提醒

- `astro.config.mjs` 的 `site: 'https://example.com'` 为占位域名，部署时改为实际域名以保证 RSS / sitemap 绝对链接正确。
- `site.yaml` 的 `avatar.name` / `avatar.tagline` 仍为占位文案，上线前替换为个人信息。
