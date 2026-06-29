/**
 * 站点配置加载器
 *
 * 读取 src/config/site.yaml 并返回类型化的配置对象。
 * YAML 文本通过 Vite 的 ?raw 导入，在构建时内联进产物，
 * 无运行时文件读取，兼容预渲染与 SSR。
 * @module lib/site
 */

import { parse } from "yaml";
import yamlRaw from "../config/site.yaml?raw";

/** 社交链接 */
export interface SocialLink {
  name: string;
  icon: string;
  href: string;
}

/** 信息词条 */
export interface InfoItem {
  label: string;
  value: string;
  icon: string;
  href?: string;
}

/** 头像配置 */
export interface AvatarConfig {
  src: string;
  alt: string;
  name: string;
  tagline: string;
}

/** 背景配置 */
export interface BackgroundConfig {
  src: string;
  overlay: number;
}

/** 一言配置 */
export interface HitokotoConfig {
  enabled: boolean;
  placeholder: string;
  fallback: string;
  typeSpeed: number;
  deleteSpeed: number;
  holdAfterTyped: number;
  holdAfterDeleted: number;
}

/** 完整站点配置 */
export interface SiteConfig {
  site: {
    title: string;
    subtitle: string;
  };
  avatar: AvatarConfig;
  background: BackgroundConfig;
  info: {
    left: InfoItem[];
    right: InfoItem[];
  };
  hitokoto: HitokotoConfig;
  social: SocialLink[];
}

let cached: SiteConfig | null = null;

/** 读取并解析站点配置（带缓存） */
export function getSiteConfig(): SiteConfig {
  if (cached) return cached;
  cached = parse(yamlRaw) as SiteConfig;
  return cached;
}
