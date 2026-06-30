/**
 * BlogExplorer —— 博客列表交互核心
 *
 * 在一个 React 岛屿中实现标签筛选、实时搜索与分页，状态同步到 URL（?tag / ?q / ?page），
 * 便于分享与刷新保持。静态构建下，初始状态（无筛选、第 1 页）由 Astro SSR 渲染，
 * 挂载后再读取 URL 参数应用筛选，因此首屏 HTML 完整、对 SEO 友好，且无水合不匹配。
 *
 * 注意：本组件运行在客户端，不能直接 import `@/lib/blog`（其依赖 `astro:content`）。
 * 文章数据由列表页在构建期序列化为 PostSummary[] 传入；类型以 `import type` 引入，
 * 编译期擦除，不会把 astro:content 带入客户端 bundle。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { PostSummary, TagCount } from "@/lib/blog";
import PostCard from "./PostCard";

interface Props {
  posts: PostSummary[];
  tags: TagCount[];
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 6;

/** 解析当前 URL 查询参数为初始状态 */
function readUrl(): { tag: string; q: string; page: number } {
  if (typeof window === "undefined") return { tag: "", q: "", page: 1 };
  const params = new URLSearchParams(window.location.search);
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    tag: params.get("tag") ?? "",
    q: params.get("q") ?? "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** 将状态写回 URL（replaceState，不污染历史栈） */
function writeUrl(tag: string, q: string, page: number): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q.trim()) params.set("q", q.trim());
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  const url = search ? `?${search}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

/** 生成分页页码列表，总页数较多时带省略号 */
function getPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export default function BlogExplorer({
  posts,
  tags,
  pageSize = DEFAULT_PAGE_SIZE,
}: Props) {
  // 初始为默认状态（与 SSR 渲染一致），挂载后再读取 URL
  const [tag, setTag] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // 挂载时读取 URL → 应用筛选
  useEffect(() => {
    const { tag: t, q, page: p } = readUrl();
    setTag(t);
    setQuery(q);
    setPage(p);
    setHydrated(true);
  }, []);

  // 状态变更 → 写回 URL（仅在 hydration 之后，避免覆盖初始 URL 读取）
  useEffect(() => {
    if (hydrated) writeUrl(tag, query, page);
  }, [tag, query, page, hydrated]);

  // 过滤
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (tag && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, tag, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  /** 选择标签：重置到第 1 页 */
  const selectTag = (next: string) => {
    setTag(next);
    setPage(1);
  };

  /** 输入搜索：重置到第 1 页 */
  const onSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  /** 清除全部筛选 */
  const clearFilters = () => {
    setTag("");
    setQuery("");
    setPage(1);
    searchRef.current?.focus();
  };

  /** 全局 "/" 快捷键聚焦搜索框 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (el?.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasFilters = tag !== "" || query.trim() !== "";
  const total = posts.length;

  return (
    <div>
      {/* ===== 搜索 ===== */}
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="relative mb-6"
      >
        <Search
          size={15}
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/70"
        />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onSearch("");
            }
          }}
          placeholder="在裂隙中搜索文章…"
          aria-label="搜索文章"
          className="w-full border-b border-border/60 bg-transparent pb-2 pl-6 pr-16 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
        />
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={() => onSearch("")}
              aria-label="清除搜索"
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <X size={13} />
            </button>
          )}
          <kbd className="hidden rounded border border-border/50 bg-card/60 px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground/80 sm:inline-block">
            /
          </kbd>
        </div>
      </form>

      {/* ===== 标签筛选 ===== */}
      {tags.length > 0 && (
        <div
          role="group"
          aria-label="按标签筛选"
          className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/40 pb-4"
        >
          <TagButton
            label="全部"
            count={total}
            active={tag === ""}
            onClick={() => selectTag("")}
          />
          {tags.map(({ tag: t, count }) => (
            <TagButton
              key={t}
              label={t}
              count={count}
              active={tag === t}
              onClick={() => selectTag(tag === t ? "" : t)}
            />
          ))}
        </div>
      )}

      {/* ===== 结果计数 ===== */}
      <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {hasFilters
            ? `匹配 ${filtered.length} / ${total} 篇`
            : `共 ${total} 篇`}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded text-muted-foreground transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* ===== 文章列表 ===== */}
      {total === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          还没有文章，敬请期待。
        </p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            没有匹配「{query.trim() || tag}」的文章。
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md border border-border/60 bg-card/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent/60 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            清除筛选，查看全部
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {pageItems.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      {/* ===== 分页 ===== */}
      {totalPages > 1 && filtered.length > 0 && (
        <nav
          aria-label="文章分页"
          className="mt-10 flex items-center justify-center gap-1 text-sm"
        >
          <PageButton
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            aria-label="上一页"
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">较新</span>
          </PageButton>

          {getPageList(currentPage, totalPages).map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`e-${i}`}
                className="px-1.5 text-muted-foreground/60"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <PageButton
                key={p}
                active={p === currentPage}
                onClick={() => setPage(p)}
                aria-label={`第 ${p} 页`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </PageButton>
            ),
          )}

          <PageButton
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            aria-label="下一页"
          >
            <span className="hidden sm:inline">较旧</span>
            <ChevronRight size={14} />
          </PageButton>
        </nav>
      )}
    </div>
  );
}

/** 标签按钮 —— 激活态带裂隙下划线 */
function TagButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "relative text-xs uppercase tracking-[0.1em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded " +
        (active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      <span>
        {label}
        <span className="ml-1 font-sans normal-case tracking-normal opacity-60">
          {count}
        </span>
      </span>
      {active && <span className="rift-underline" aria-hidden="true" />}
    </button>
  );
}

/** 分页按钮 */
function PageButton({
  children,
  active,
  disabled,
  onClick,
  ...aria
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  "aria-label"?: string;
  "aria-current"?: "page";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "relative inline-flex h-8 min-w-8 items-center justify-center gap-0.5 rounded-md px-2 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-30 " +
        (active
          ? "text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground")
      }
      {...aria}
    >
      {children}
      {active && <span className="rift-underline" aria-hidden="true" />}
    </button>
  );
}
