/**
 * 图标注册表
 *
 * 将配置文件中使用的图标名（字符串）映射为可渲染的组件。
 * lucide 1.x 移除了品牌图标（如 Github），这里用自定义 SVG 补充。
 * 扩展新图标：在下方 import 或新增自定义组件后，加入 icons 表即可。
 */
import {
  Code2,
  CodeXml,
  MapPin,
  Mail,
  Layers,
  Sparkles,
  Briefcase,
  Globe,
  Send,
  Heart,
  Star,
  Zap,
  Rocket,
  Coffee,
  Book,
  Award,
  Link as LinkIcon,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

type IconComponent = ComponentType<LucideProps>;

/** GitHub 品牌图标（lucide 1.x 已移除品牌图标，自定义补充） */
function Github(props: LucideProps) {
  const { size = 24, className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...rest}
    >
      <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.583-4.042-1.583-.546-1.361-1.335-1.725-1.335-1.725-1.087-.734.084-.72.084-.72 1.205.083 1.838 1.213 1.838 1.213 1.07 1.802 2.806 1.281 3.49.98.108-.762.417-1.282.76-1.577-2.665-.297-5.467-1.302-5.467-5.804 0-1.281.465-2.327 1.235-3.149-.124-.297-.535-1.493.117-3.112 0 0 1.007-.316 3.3 1.203a11.504 11.504 0 0 1 3-.397c1.02.005 2.045.135 3.003.397 2.29-1.519 3.296-1.203 3.296-1.203.653 1.619.242 2.815.12 3.112.77.822 1.232 1.868 1.232 3.149 0 4.513-2.806 5.505-5.48 5.797.43.36.815 1.07.815 2.158 0 1.558-.014 2.813-.014 3.193 0 .314.216.682.825.566C20.565 21.917 24 17.5 24 12.292 24 5.78 18.627.5 12 .5z" />
    </svg>
  );
}

export const icons: Record<string, IconComponent> = {
  Code2,
  CodeXml,
  Code: CodeXml,
  MapPin,
  Mail,
  Layers,
  Sparkles,
  Briefcase,
  Globe,
  Send,
  Heart,
  Star,
  Zap,
  Rocket,
  Coffee,
  Book,
  Award,
  Link: LinkIcon,
  Github,
};

/** 根据图标名获取组件，找不到时回退到 Sparkles */
export function getIcon(name: string): IconComponent {
  return icons[name] ?? Sparkles;
}
