/**
 * uapis.cn 一言客户端（浏览器端）
 *
 * 使用官方浏览器 SDK `uapi-browser-sdk` 直接在浏览器中请求 uapis.cn。
 * uapis.cn 已支持浏览器 CORS，无需服务端代理，站点可保持纯静态部署。
 *
 * SDK 文档：https://uapis.cn/docs/sdk/browser
 * 一言接口：https://uapis.cn/docs/api-reference/get-saying
 *
 * @module lib/uapis
 */
import { UapiClient } from "uapi-browser-sdk";

/** uapis.cn 端点基址 */
const BASE_URL = "https://uapis.cn";

/** 单次请求超时（毫秒），避免网络挂起阻塞打字动画 */
const REQUEST_TIMEOUT = 8000;

// 一言接口为免费 visitor credits，无需 API Key
const client = new UapiClient(BASE_URL);

export interface SayingResponse {
  /** 一言正文 */
  text: string;
}

/** 一言：随机返回一句话 */
export async function getSaying(): Promise<SayingResponse> {
  const data = await withTimeout(client.poem.getSaying(), REQUEST_TIMEOUT);
  return { text: data.text?.trim() ?? "" };
}

/** 为不支持 AbortSignal 的 SDK 调用附加超时保护 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("uapis /saying 请求超时")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}
