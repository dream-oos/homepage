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
  comments: CommentsConfig;
}

/** 评论系统配置 */
export interface CommentsConfig {
  /** 启用的评论服务：waline | twikoo | none */
  provider: "waline" | "twikoo" | "none";
  /** Waline 配置（provider 为 waline 时生效） */
  waline: {
    /** Waline 服务端地址，如 https://your-waline.vercel.app */
    serverURL: string;
  };
  /** Twikoo 配置（provider 为 twikoo 时生效） */
  twikoo: {
    /** Twikoo 环境 ID，腾讯云填 envId，Vercel 部署填地址，如 https://your-twikoo.vercel.app */
    envId: string;
  };
}

let cached: SiteConfig | null = null;

/** 评论系统默认配置（未在 site.yaml 声明时回退使用） */
const defaultComments: CommentsConfig = {
  provider: "none",
  waline: { serverURL: "" },
  twikoo: { envId: "" },
};

/** 读取并解析站点配置（带缓存） */
export function getSiteConfig(): SiteConfig {
  if (cached) return cached;
  const parsed = parse(yamlRaw) as Partial<SiteConfig>;
  const merged = {
    ...parsed,
    comments: {
      ...defaultComments,
      ...parsed.comments,
      waline: { ...defaultComments.waline, ...parsed.comments?.waline },
      twikoo: { ...defaultComments.twikoo, ...parsed.comments?.twikoo },
    },
  } as SiteConfig;
  cached = merged;
  return cached;
}
