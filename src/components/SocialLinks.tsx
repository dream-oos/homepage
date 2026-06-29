/**
 * 社交链接（页脚）
 *
 * 纯展示组件，服务端渲染为静态 HTML。
 */
import { getIcon } from "@/lib/icons";
import type { SocialLink } from "@/lib/site";

interface Props {
  links: SocialLink[];
}

export default function SocialLinks({ links }: Props) {
  return (
    <nav className="flex items-center justify-center gap-2">
      {links.map((link) => {
        const Icon = getIcon(link.icon);
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card/40 text-muted-foreground backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:text-foreground hover:bg-card/70"
          >
            <Icon size={18} />
          </a>
        );
      })}
    </nav>
  );
}
