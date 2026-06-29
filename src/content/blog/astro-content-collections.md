---
title: "用 Astro Content Collections 组织内容"
description: "Astro 的 Content Collections 提供了一套类型安全的内容管理方案。本文记录如何用它搭建博客系统。"
pubDate: 2026-06-29
tags: ["Astro", "技术"]
draft: false
---

## 什么是 Content Collections

Astro 从 2.0 开始引入了 Content Collections，到 5.0 之后升级为 Content Layer，提供了统一的内容加载与查询接口。它解决了传统静态站点生成器中几个常见痛点：

- **类型安全** — 通过 Zod Schema 定义 frontmatter 结构，编辑器自动补全
- **统一查询** — 无论内容来源是本地文件还是远程 API，都用相同的 API 查询
- **按需过滤** — 支持在查询时过滤草稿、按日期排序等

## 定义集合

首先在 `src/content.config.ts` 中定义一个博客集合：

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

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

export const collections = { blog };
```

几点说明：

1. **`glob` 加载器** — 自动扫描 `src/content/blog/` 目录下的所有 `.md` 文件
2. **`z.coerce.date()`** — 允许 frontmatter 中写 `2026-06-29` 这样的字符串，自动转为 `Date` 对象
3. **`draft` 字段** — 设为 `true` 的文章在查询时会被过滤掉，不会出现在线上

## 查询与渲染

在页面中查询文章非常简单：

```typescript
import { getCollection, render } from "astro:content";

// 获取所有非草稿文章
const posts = await getCollection("blog", ({ data }) => !data.draft);

// 排序：最新的在前
posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

// 渲染单篇文章
const { Content } = await render(post);
```

> 注意：`render()` 返回的 `Content` 是一个 Astro 组件，直接在模板中用 `<Content />` 渲染即可。

## 动态路由

对于博客详情页，使用 `getStaticPaths` 为每篇文章生成独立页面：

```typescript
export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}
```

`post.id` 由 `glob` 加载器自动生成，等于文件相对于 `base` 目录的路径（不含扩展名）。例如 `src/content/blog/welcome.md` 的 id 就是 `welcome`。

## 小结

Content Collections 让内容管理变得可预测且类型安全。配合 Astro 的静态生成能力，可以轻松搭建一个功能完整的博客系统，而无需引入额外的 CMS 或数据库。
