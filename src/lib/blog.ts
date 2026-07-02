/**
 * 博客工具函数
 *
 * 提供博客列表查询、阅读时间估算、日期格式化等辅助功能。
 * @module lib/blog
 */

import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { formatDate } from "./format";

export { formatDate };
/** 博客文章类型 */
export type BlogPost = CollectionEntry<"blog">;

/**
 * 文章摘要 —— 序列化后的纯数据形式，可安全传入 React 客户端组件。
 *
 * React 客户端组件不能直接 import `@/lib/blog`（后者依赖 `astro:content`，
 * 仅在构建期可用），因此列表页在构建期将每篇文章映射为本类型后以 props 传入。
 */
export interface PostSummary {
  /** 文章 URL slug，即文件名（不含扩展名） */
  id: string;
  title: string;
  description: string;
  /** 发布时间的 ISO 字符串 */
  pubDate: string;
  tags: string[];
  /** 阅读分钟数 */
  minutes: number;
}

/**
 * 将一篇博客文章映射为可序列化的摘要对象。
 * @param post - 原始文章条目
 */
export function toSummary(post: BlogPost): PostSummary {
  return {
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate.toISOString(),
    tags: post.data.tags,
    minutes: readingTime(post.body ?? ""),
  };
}

/**
 * 标签 + 文章数量，按数量降序、名称升序排列。
 */
export interface TagCount {
  tag: string;
  count: number;
}

/**
 * 从文章列表中聚合所有标签及其出现次数。
 * @param posts - 已发布的文章列表
 */
export function getTagsWithCount(posts: BlogPost[]): TagCount[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort(
      (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-Hans-CN"),
    );
}

/**
 * 估算 Markdown 正文的阅读时间（分钟）。
 *
 * 中文字符（CJK）按 ~300 字/分钟，拉丁单词按 ~200 词/分钟分别估算后求和。
 * @param body - 文章原始 Markdown 正文
 * @returns 阅读分钟数，至少为 1
 */
export function readingTime(body: string): number {
  const cjkChars = body.match(/[\u4e00-\u9fff\u3040-\u30ff]/g)?.length ?? 0;
  const latinWords = body
    .replace(/[\u4e00-\u9fff\u3040-\u30ff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.ceil(cjkChars / 300 + latinWords / 200);
  return Math.max(1, minutes);
}

/**
 * 获取所有已发布的博客文章（非草稿），按发布日期降序排列。
 * @returns 已发布的文章列表
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection(
    "blog",
    ({ data }: { data: { draft?: boolean } }) => !data.draft,
  );
  return posts.sort(
    (a: BlogPost, b: BlogPost) =>
      b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

/**
 * 获取某篇文章的相邻文章（上一篇 / 下一篇）。
 *
 * 列表按发布日期降序（较新在前），因此「上一篇」是日期更晚者，
 * 「下一篇」是日期更早者。返回的对象仅包含列表展示所需的最小字段。
 *
 * @param posts - 已按日期降序排列的文章列表
 * @param current - 当前文章 id
 */
export function getAdjacentPosts(
  posts: BlogPost[],
  current: string,
): { newer: BlogPost | null; older: BlogPost | null } {
  const index = posts.findIndex((p) => p.id === current);
  if (index === -1) return { newer: null, older: null };
  // index - 1 为日期更晚（较新），index + 1 为日期更早（较旧）
  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
