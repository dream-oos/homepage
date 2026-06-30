/**
 * Comments —— 文章评论系统
 *
 * 兼容 Waline 与 Twikoo 两种已部署服务，由 site.yaml 的 comments.provider 决定启用哪个。
 * 通过 `client:visible` 挂载，滚动进入视口后才加载评论脚本，不阻塞首屏。
 *
 * - Waline：使用 npm 包 `@waline/client` 的动态 import（纯 ESM，构建期按需分包），
 *   样式随脚本一起懒加载。
 * - Twikoo：其 npm 包为 UMD（依赖浏览器全局变量），按官方推荐方式经 CDN 注入脚本后
 *   调用全局 `window.twikoo.init`。
 *
 * 两者均跟随站点主题切换：传 `dark: 'html.dark'`，ThemeToggle 切换 .dark 类时自动适配。
 */
import { useEffect, useRef, useState } from "react";
import type { CommentsConfig } from "@/lib/site";

interface Props {
  config: CommentsConfig;
}

type Status = "loading" | "ready" | "error";

const TWIKOO_CDN =
  "https://cdn.jsdelivr.net/npm/twikoo@1.7.13/dist/twikoo.min.js";

/** Waline init() 返回实例（带 destroy）的兼容形态 */
interface WalineInstance {
  destroy: () => void;
}

export default function Comments({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<WalineInstance | null>(null);
  const [status, setStatus] = useState<Status>(
    config.provider === "none" ? "ready" : "loading",
  );
  const [message, setMessage] = useState<string>("");
  // 内部重试计数，点击「重试」时自增以重新触发挂载 effect
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (config.provider === "none") {
      setStatus("ready");
      return;
    }
    if (!containerRef.current) return;

    let cancelled = false;
    setStatus("loading");
    setMessage("");

    async function mountWaline() {
      const serverURL = config.waline.serverURL.trim();
      if (!serverURL) {
        setStatus("error");
        setMessage(
          "未配置 Waline 服务地址。请在 site.yaml 填写 comments.waline.serverURL。",
        );
        return;
      }
      try {
        const [{ init }] = await Promise.all([
          import("@waline/client"),
          import("@waline/client/style"),
        ]);
        if (cancelled || !containerRef.current) return;
        const instance = init({
          el: containerRef.current,
          serverURL,
          dark: "html.dark",
          lang: "zh-CN",
          path: window.location.pathname,
          meta: ["nick", "mail", "link"],
          requiredMeta: ["nick"],
          pageSize: 10,
          search: false,
          noCopyright: true,
        }) as WalineInstance | null;
        instanceRef.current = instance;
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("[Comments] Waline 加载失败：", err);
        setStatus("error");
        setMessage("评论加载失败，请检查网络后重试。");
      }
    }

    function mountTwikoo() {
      const envId = config.twikoo.envId.trim();
      if (!envId) {
        setStatus("error");
        setMessage(
          "未配置 Twikoo 环境。请在 site.yaml 填写 comments.twikoo.envId。",
        );
        return;
      }
      const w = window as unknown as {
        twikoo?: { init: (opts: Record<string, unknown>) => void };
      };
      if (w.twikoo?.init) {
        doInitTwikoo(w.twikoo, envId);
        return;
      }
      const script = document.createElement("script");
      script.src = TWIKOO_CDN;
      script.async = true;
      script.onload = () => {
        if (cancelled) return;
        const tw = window as unknown as {
          twikoo?: { init: (opts: Record<string, unknown>) => void };
        };
        if (tw.twikoo?.init) {
          doInitTwikoo(tw.twikoo, envId);
        } else {
          setStatus("error");
          setMessage("Twikoo 脚本加载异常，请重试。");
        }
      };
      script.onerror = () => {
        if (cancelled) return;
        setStatus("error");
        setMessage("无法加载 Twikoo 脚本，请检查网络后重试。");
      };
      document.head.appendChild(script);
    }

    function doInitTwikoo(
      tw: { init: (opts: Record<string, unknown>) => void },
      envId: string,
    ) {
      if (cancelled || !containerRef.current) return;
      try {
        tw.init({
          envId,
          el: "#comments-container",
          lang: "zh-CN",
          dark: "html.dark",
          path: window.location.pathname,
        });
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("[Comments] Twikoo 初始化失败：", err);
        setStatus("error");
        setMessage("评论初始化失败，请重试。");
      }
    }

    if (config.provider === "waline") {
      mountWaline();
    } else if (config.provider === "twikoo") {
      mountTwikoo();
    }

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        try {
          instanceRef.current.destroy();
        } catch {
          /* 忽略卸载时的清理异常 */
        }
        instanceRef.current = null;
      }
      // 清空容器，避免 React 之外的内容残留
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [config, retry]);

  // 未启用评论：不渲染任何内容，保持文章页干净
  if (config.provider === "none") return null;

  return (
    <section className="comments-rift mt-16 border-t border-border/40 pt-10">
      {/* 区块标题 —— 与博客页眉保持一致的 eyebrow 处理 */}
      <div className="mb-6">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          评论 / Comments
        </p>
        <div className="rift-line h-0.5 w-full" aria-hidden="true" />
      </div>

      {/* 状态提示（容器被评论脚本接管前显示） */}
      {status === "loading" && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          正在加载评论…
        </p>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          <button
            type="button"
            onClick={() => setRetry((r) => r + 1)}
            className="rounded-md border border-border/60 bg-card/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent/60 hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            重试
          </button>
        </div>
      )}

      {/* 评论容器：由 Waline / Twikoo 接管内容，React 保持为空 */}
      <div
        ref={containerRef}
        id="comments-container"
        className="comments-container"
      />
    </section>
  );
}
