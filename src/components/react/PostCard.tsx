/**
 * 博客文章卡片（React 版）
 *
 * BlogExplorer 的列表子项，样式与站点裂隙主题对齐。
 * 支持搜索高亮：传入 query 后，标题 / 描述 / 标签中的命中字符会以裂隙红高亮。
 * 通过 `import type` 引入类型，类型在编译期被擦除，不会把 `astro:content`
 * 的运行时依赖带入客户端 bundle。
 */
import type { PostSummary } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { matchedIndices, splitByHits } from "@/lib/pinyin";

interface Props {
  post: PostSummary;
  /** 序号，用于错开入场动画延迟 */
  index: number;
  /** 当前搜索词，用于高亮命中片段；为空时不高亮 */
  query?: string;
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
            className="bg-primary/20 text-primary rounded-[2px] px-0.5"
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
      className="group border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 animate-in fade-in slide-in-from-bottom-4 fill-mode-both block rounded-xl border p-5 transition-all duration-300 duration-600"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
        <time dateTime={post.pubDate}>{formatDate(post.pubDate)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.minutes} 分钟阅读</span>
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="border-border/40 bg-card text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] tracking-[0.08em] uppercase"
              >
                <Highlighted text={tag} query={query} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <h2 className="font-heading text-foreground group-hover:text-primary mt-2 text-lg font-semibold transition-colors duration-300">
        <Highlighted text={post.title} query={query} />
      </h2>
      <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
        <Highlighted text={post.description} query={query} />
      </p>
    </a>
  );
}
