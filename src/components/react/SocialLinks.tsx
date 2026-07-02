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
    <nav className="flex items-center justify-center gap-3">
      {links.map((link) => {
        const Icon = getIcon(link.icon);
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="border-border/40 bg-card/40 text-muted-foreground hover:border-accent/50 hover:text-accent hover:bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 hover:-translate-y-0.5"
          >
            <Icon size={17} />
          </a>
        );
      })}
    </nav>
  );
}
