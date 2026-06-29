/**
 * 信息词条卡片
 *
 * 纯展示组件，服务端渲染为静态 HTML，无需客户端 hydration。
 * 入场动画通过 CSS（tw-animate-css）在页面加载时自动播放。
 */
import { getIcon } from "@/lib/icons";
import type { InfoItem } from "@/lib/site";

interface Props {
  item: InfoItem;
  /** 该词条所在侧，决定滑入方向 */
  side: "left" | "right";
  /** 序号，用于错开动画延迟 */
  index: number;
}

export default function InfoCard({ item, side, index }: Props) {
  const Icon = getIcon(item.icon);
  const delay = 200 + index * 120;
  const animationClass =
    side === "left"
      ? "animate-in fade-in slide-in-from-left-8 duration-700 ease-out fill-mode-both"
      : "animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both";

  const inner = (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-foreground/80 transition-colors">
        <Icon size={18} />
      </span>
      <span className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {item.label}
        </span>
        <span className="text-sm font-medium text-foreground/90">
          {item.value}
        </span>
      </span>
    </div>
  );

  const cls =
    "group rounded-2xl border border-border/50 bg-card/40 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:border-border hover:bg-card/60 hover:-translate-y-0.5 " +
    animationClass;

  return (
    <li
      className={cls}
      style={{ animationDelay: `${delay}ms` }}
    >
      {item.href ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}
