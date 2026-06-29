/**
 * 一言打字效果组件
 *
 * 通过 uapis.cn 浏览器 SDK 获取一句话，循环「打字 → 停留 → 删除 → 停留 → 换句」。
 * 需要以 client:load 指令挂载。
 *
 * 设计要点：
 * - 数据请求与打字循环仅在挂载时启动一次。即便父组件重渲染（如开发模式 HMR、
 *   或传入的对象引用变化），也不会重新发起请求。
 * - 光标闪烁交由 CSS 动画驱动，不占用 JS 定时器与渲染周期。
 */
import { useEffect, useRef, useState } from "react";
import { getSaying } from "@/lib/uapis";

interface Props {
  placeholder?: string;
  fallback?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  holdAfterTyped?: number;
  holdAfterDeleted?: number;
}

type Phase = "loading" | "typing" | "holding" | "deleting" | "paused";

export default function Typewriter({
  placeholder = "加载中…",
  fallback = "世界那么大，我想去看看。",
  typeSpeed = 80,
  deleteSpeed = 40,
  holdAfterTyped = 2500,
  holdAfterDeleted = 500,
}: Props) {
  const [text, setText] = useState(placeholder);
  const [phase, setPhase] = useState<Phase>("loading");

  // 把配置存进 ref，effect 只在挂载时读取一次，避免依赖变化导致重新请求
  const configRef = useRef({ fallback, typeSpeed, deleteSpeed, holdAfterTyped, holdAfterDeleted });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const { fallback, typeSpeed, deleteSpeed, holdAfterTyped, holdAfterDeleted } = configRef.current;
    let active = true;

    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };

    async function fetchSaying(): Promise<void> {
      setPhase("loading");
      try {
        const data = await getSaying();
        const content = data.text || fallback;
        if (active) startTyping(content);
      } catch {
        if (active) startTyping(fallback);
      }
    }

    function startTyping(full: string): void {
      setPhase("typing");
      setText("");
      let i = 0;
      const tick = () => {
        if (!active) return;
        i += 1;
        setText(full.slice(0, i));
        if (i < full.length) {
          timer.current = setTimeout(tick, typeSpeed);
        } else {
          setPhase("holding");
          timer.current = setTimeout(() => startDeleting(full), holdAfterTyped);
        }
      };
      timer.current = setTimeout(tick, typeSpeed);
    }

    function startDeleting(full: string): void {
      setPhase("deleting");
      let i = full.length;
      const tick = () => {
        if (!active) return;
        i -= 1;
        setText(full.slice(0, i));
        if (i > 0) {
          timer.current = setTimeout(tick, deleteSpeed);
        } else {
          setPhase("paused");
          timer.current = setTimeout(fetchSaying, holdAfterDeleted);
        }
      };
      timer.current = setTimeout(tick, deleteSpeed);
    }

    fetchSaying();

    return () => {
      active = false;
      clear();
    };
  }, []);

  return (
    <span className="inline-flex items-center min-h-[1.5em]">
      <span className="text-foreground/90">{text}</span>
      <span
        aria-hidden="true"
        className={
          "typewriter-cursor ml-0.5 inline-block w-[2px] self-stretch bg-primary " +
          (phase === "typing" || phase === "holding" ? "" : "is-blink")
        }
      />
    </span>
  );
}
