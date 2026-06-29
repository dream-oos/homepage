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
  const delay = 300 + index * 100;
  const animationClass =
    side === "left"
      ? "animate-in fade-in slide-in-from-left-6 duration-600 ease-out fill-mode-both"
      : "animate-in fade-in slide-in-from-right-6 duration-600 ease-out fill-mode-both";

  const inner = (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-accent/15 group-hover:text-accent">
        <Icon size={16} />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {item.label}
        </span>
        <span className="text-sm font-medium text-foreground/85 transition-colors duration-300 group-hover:text-foreground">
          {item.value}
        </span>
      </span>
    </div>
  );

  const cls =
    "group rounded-lg border border-border/40 bg-card/50 px-4 py-3 transition-all duration-300 " +
    "hover:border-primary/40 hover:bg-card/80 " +
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
