/**
 * ReadingNav —— 文章阅读导航
 *
 * 右下角悬浮控件，为长文提供三件事：
 * 1. 目录（TOC）：展开后列出二级及以下标题，点击平滑滚动定位
 * 2. 当前章节高亮：跟随滚动，用一道旋转裂隙条标记所在位置
 * 3. 回到顶部：向下滚动一段后出现
 *
 * 顶部还附一条窄进度条 + 百分比读数，反映整体阅读进度。
 *
 * 这是次级导航，设计上保持克制：圆形玻璃按钮 + 一块面板，
 * 唯一的「签名」是活动项左侧那道与站点裂隙同源的旋转光条。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUp, List, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Astro render() 返回的标题结构 */
export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  headings: TocHeading[];
}

/** 固定顶栏高度（48px）+ 一点呼吸空间，用于锚点定位偏移 */
const NAV_OFFSET = 64;
/** 回到顶部按钮出现的滚动阈值 */
const TOP_THRESHOLD = 400;

/** 按标题层级缩进（h2 顶格，逐级加深） */
function indentClass(depth: number): string {
  switch (depth) {
    case 2:
      return "pl-3";
    case 3:
      return "pl-6";
    default:
      return "pl-9";
  }
}

export default function ReadingNav({ headings }: Props) {
  // 只收录二级及以下标题，忽略文章标题（h1）
  const items = useMemo(
    () => headings.filter((h) => h.depth >= 2 && h.depth <= 4),
    [headings],
  );

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  /* ---- 滚动监听：进度 + 回到顶可见性 + 当前章节（rAF 节流） ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => el !== null);

    let ticking = false;
    const update = () => {
      ticking = false;
      const docEl = document.documentElement;
      const docHeight = docEl.scrollHeight - window.innerHeight;
      const p =
        docHeight > 0
          ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100))
          : 0;
      setProgress(p);
      setShowTop(window.scrollY > TOP_THRESHOLD);

      // 当前章节 = 最后一个已滚过顶栏的标题
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top - NAV_OFFSET <= 0) current = el.id;
        else break;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  /* ---- Esc 关闭面板 ---- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const reduceMotion = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  /* ---- 点击目录项：平滑滚动定位 ---- */
  const goTo = (slug: string) => {
    const el = document.getElementById(slug);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: reduceMotion() ? "auto" : "smooth" });
    history.replaceState(null, "", `#${slug}`);
    setActiveId(slug);
    // 移动端跳转后收起面板，桌面端保持展开便于继续浏览
    if (window.matchMedia("(max-width: 640px)").matches) setOpen(false);
  };

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
  };

  const roundBtn =
    "inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:text-foreground hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:size-11";

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
      {/* 目录面板 */}
      {open && items.length > 0 && (
        <nav
          aria-label="文章目录"
          className="border-border/60 bg-card/90 pointer-events-auto w-[min(80vw,17rem)] overflow-hidden rounded-xl border shadow-xl shadow-black/30 backdrop-blur-xl"
        >
          {/* 顶部阅读进度条（克制：纯主色，不参与裂隙动画） */}
          <div
            className="bg-primary/80 h-[2px] transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
          {/* 头部：标题 + 百分比 */}
          <div className="flex h-9 items-center justify-between px-3">
            <span className="font-heading text-foreground text-xs font-medium tracking-wide">
              目录
            </span>
            <span className="text-muted-foreground text-[10px] tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          {/* 标题列表 */}
          <ul className="max-h-[min(50vh,20rem)] overflow-y-auto p-1.5">
            {items.map((h) => {
              const active = h.slug === activeId;
              return (
                <li key={h.slug}>
                  <a
                    href={`#${h.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(h.slug);
                    }}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "relative block truncate rounded-md py-1.5 pr-2 text-xs transition-colors",
                      indentClass(h.depth),
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span
                        className="toc-rift-bar absolute top-1 bottom-1 left-0 w-[2px] rounded-full"
                        aria-hidden="true"
                      />
                    )}
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* 按钮簇 */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "收起目录" : "展开目录"}
            aria-expanded={open}
            className={roundBtn}
          >
            {open ? (
              <X className="size-[18px]" />
            ) : (
              <List className="size-[18px]" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={toTop}
          aria-label="回到顶部"
          className={cn(
            roundBtn,
            !showTop && "pointer-events-none translate-y-1 opacity-0",
          )}
        >
          <ArrowUp className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
