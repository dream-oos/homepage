/**
 * 一言代理端点
 *
 * uapis.cn 不支持浏览器 CORS，故在此转发请求。
 * 后续如需扩展更多 uapis 接口，在 src/lib/uapis.ts 添加方法，
 * 再新增对应的 /api/<name>.ts 端点即可。
 */
import type { APIRoute } from "astro";
import { getSaying } from "@/lib/uapis";

export const prerender = false;

export const GET: APIRoute = async () => {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);
  try {
    const data = await getSaying(ac.signal);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "内部错误";
    return new Response(JSON.stringify({ text: "", error: message }), {
      status: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } finally {
    clearTimeout(timer);
  }
};
