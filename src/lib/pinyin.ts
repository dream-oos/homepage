/**
 * 拼音模糊匹配
 *
 * 基于 `pinyin-pro` 的 `match()`，支持全拼（sheji）、首字母（sj）、
 * 部分输入（shej）以及中文直接匹配（设计）。拉丁字符与数字走原生
 * 子串匹配（更快、且对英文标题更符合直觉），仅对含 CJK 的文本启用拼音。
 *
 * 该模块运行在客户端（BlogExplorer 岛屿），不依赖 `astro:content`。
 */
import { match } from "pinyin-pro";

/** 文本是否含 CJK 汉字（仅这类文本才需要走拼音匹配） */
const CJK_RE = /[\u4e00-\u9fff]/;

/** 去除空格并转小写，统一拉丁输入的形态 */
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * 判断 query 是否命中 text。
 *
 * 优先级：原生子串（处理拉丁字符与精确中文）→ 拼音模糊（处理 CJK 文本的
 * 全拼 / 首字母 / 部分输入）。命中返回 true，否则 false。
 *
 * @param text - 被搜索的文本（标题、描述、标签）
 * @param query - 用户输入的查询词
 */
export function pinyinMatch(text: string, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const t = text ?? "";
  // 1. 原生子串匹配：英文、数字、精确中文均适用，且最快
  if (t.toLowerCase().includes(q)) return true;
  // 2. 仅当文本含 CJK 时才走拼音匹配，避免对纯英文文本做无谓计算
  if (!CJK_RE.test(t)) return false;
  return match(t, q) !== null;
}

/**
 * 命中的字符索引集合（基于 0）。
 *
 * 用于高亮渲染：子串匹配返回连续区间，拼音匹配返回 pinyin-pro 的
 * 命中字符索引数组。未命中返回空集合。
 *
 * @param text - 被搜索的文本
 * @param query - 用户输入的查询词
 */
export function matchedIndices(text: string, query: string): Set<number> {
  const q = normalize(query);
  const t = (text ?? "").toLowerCase();
  const indices = new Set<number>();
  if (!q) return indices;
  // 1. 子串匹配：标记连续区间
  const start = t.indexOf(q);
  if (start !== -1) {
    for (let i = start; i < start + q.length; i++) indices.add(i);
    return indices;
  }
  // 2. 拼音匹配：pinyin-pro 返回命中字符的索引数组（如 [0,1,2,3]），未命中返回 null
  const src = text ?? "";
  if (!CJK_RE.test(src)) return indices;
  const m = match(src, q);
  if (!m) return indices;
  for (const idx of m) indices.add(idx as number);
  return indices;
}

/**
 * 将文本按命中索引拆分为片段，供 React 渲染高亮。
 *
 * @param text - 原始文本
 * @param hits - matchedIndices 返回的命中索引集合
 * @returns 片段数组：{ text, highlight }
 */
export function splitByHits(
  text: string,
  hits: Set<number>,
): { text: string; highlight: boolean }[] {
  if (hits.size === 0) return [{ text, highlight: false }];
  const result: { text: string; highlight: boolean }[] = [];
  let buffer = "";
  let bufferHighlight = false;
  for (let i = 0; i < text.length; i++) {
    const hit = hits.has(i);
    if (i === 0) {
      buffer = text[i];
      bufferHighlight = hit;
      continue;
    }
    if (hit === bufferHighlight) {
      buffer += text[i];
    } else {
      result.push({ text: buffer, highlight: bufferHighlight });
      buffer = text[i];
      bufferHighlight = hit;
    }
  }
  if (buffer) result.push({ text: buffer, highlight: bufferHighlight });
  return result;
}
