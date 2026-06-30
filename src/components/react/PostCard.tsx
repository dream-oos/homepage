/**
 * 博客文章卡片（React 版）
 *
 * BlogExplorer 的列表子项，样式与站点裂隙主题对齐。
 * 支持搜索高亮：传入 query 后，标题 / 描述 / 标签中的命中字符会以裂隙红高亮。
 * 通过 `import type` 引入类型，类型在编译期被擦除，不会把 `astro:content`
 * 的运行时依赖带入客户端 bundle。
 */
import type { PostSummary } from "@/lib/blog";
import { matchedIndices, splitByHits } from "@/lib/pinyin";

interface Props {
  post: PostSummary;
  /** 序号，用于错开入场动画延迟 */
  index: number;
  /** 当前搜索词，用于高亮命中片段；为空时不高亮 */
  query?: string;
}

/** 客户端日期格式化：与 lib/blog.formatDate 输出一致的中文长格式 */
function formatDate(iso: string): string {
  return Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/** 渲染带高亮片段的文本 */
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const hits = matchedIndices(text, query);
  const parts = splitByHits(text, hits);
  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark
            key={i}
            className="rounded-[2px] bg-primary/20 px-0.5 text-primary"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export default function PostCard({ post, index, query = "" }: Props) {
  return (
    <a
      href={`/blog/${post.id}`}
      className="group block rounded-xl border border-border/40 bg-card/50 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card/80 animate-in fade-in slide-in-from-bottom-4 duration-600 fill-mode-both"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <time dateTime={post.pubDate}>{formatDate(post.pubDate)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.minutes} 分钟阅读</span>
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border/40 bg-card px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
              >
                <Highlighted text={tag} query={query} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <h2 className="mt-2 font-heading text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
        <Highlighted text={post.title} query={query} />
      </h2>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
        <Highlighted text={post.description} query={query} />
      </p>
    </a>
  );
}
