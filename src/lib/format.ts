/**
 * 通用格式化工具
 *
 * 独立于 `astro:content`，可在客户端与构建期两端通用。
 * @module lib/format
 */

/**
 * 将日期格式化为中文长格式，例如 "2026年6月29日"。
 *
 * 同时接受 `Date`（来自构建期 CollectionEntry）与 ISO 字符串（来自序列化后的
 * PostSummary），客户端组件无需自行再做一次格式化。
 *
 * @param date - 日期对象或 ISO 字符串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
