/**
 * 一言打字效果组件
 *
 * 通过本地代理 /api/saying 获取一句话，循环「打字 → 停留 → 删除 → 停留 → 换句」。
 * 需要以 client:load 指令挂载。
 */
import { useEffect, useRef, useState } from "react";

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
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 串行化的状态机，避免多个 setTimeout 竞争
  useEffect(() => {
    let active = true;

    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };

    async function fetchSaying(): Promise<void> {
      setPhase("loading");
      try {
        const res = await fetch("/api/saying");
        if (!res.ok) throw new Error("请求失败");
        const data = (await res.json()) as { text?: string };
        const content = data.text?.trim() || fallback;
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

    // 光标闪烁：在 holding / typing 阶段保持常亮，其余阶段闪烁
    const blink = setInterval(() => {
      setVisible((v) => !v);
    }, 530);
    const reveal = () => {
      if (phase === "typing" || phase === "holding") setVisible(true);
    };
    reveal();

    return () => {
      active = false;
      clear();
      clearInterval(blink);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback, typeSpeed, deleteSpeed, holdAfterTyped, holdAfterDeleted]);

  return (
    <span className="inline-flex items-center min-h-[1.5em]">
      <span className="text-foreground/90">{text}</span>
      <span
        aria-hidden="true"
        className={
          "typewriter-cursor ml-0.5 inline-block w-[2px] self-stretch bg-foreground/80 " +
          (phase === "typing" || phase === "holding" ? "" : "is-blink")
        }
        style={{ opacity: visible ? 1 : 0 }}
      />
    </span>
  );
}
