/**
 * uapis.cn API 客户端
 *
 * 文档：https://uapis.cn/docs/api-reference/get-saying
 * 后续如需接入更多 uapis 接口，在此扩展即可。
 *
 * @module lib/uapis
 */

const BASE_URL = "https://uapis.cn/api/v1";

export interface SayingResponse {
  /** 一言正文 */
  text: string;
}

/** 一言：随机返回一句话 */
export async function getSaying(
  signal?: AbortSignal
): Promise<SayingResponse> {
  const res = await fetch(`${BASE_URL}/saying`, { signal });
  if (!res.ok) {
    throw new Error(`uapis /saying 请求失败：${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as SayingResponse;
  return data;
}
