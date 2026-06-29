/**
 * 博客工具函数
 *
 * 提供博客列表查询、阅读时间估算、日期格式化等辅助功能。
 * @module lib/blog
 */

import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

/** 博客文章类型 */
export type BlogPost = CollectionEntry<"blog">;

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
  const posts = await getCollection("blog", ({ data }: { data: { draft?: boolean } }) => !data.draft);
  return posts.sort(
    (a: BlogPost, b: BlogPost) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

/**
 * 将日期格式化为中文长格式。
 * @param date - 日期对象
 * @returns 格式化后的日期字符串，例如 "2026年6月29日"
 */
export function formatDate(date: Date): string {
  return Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
