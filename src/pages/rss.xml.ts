/**
 * RSS 订阅源
 *
 * 基于 @astrojs/rss 生成博客文章的 RSS feed，供读者订阅。
 * @route /rss.xml
 */
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPublishedPosts } from "@/lib/blog";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: "Homepage · 博客",
    description: "字里行间的裂隙——技术、设计与生活的记录",
    site: context.site ?? "https://example.com",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
