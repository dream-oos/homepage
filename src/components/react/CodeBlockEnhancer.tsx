/**
 * CodeBlockEnhancer —— 代码块增强器
 *
 * 在客户端增强 `.prose-rift` 内的 `<pre>` 代码块：
 * 1. 右上角添加复制按钮，点击复制代码内容
 * 2. 较长的代码块（超过阈值行数）支持折叠 / 展开：
 *    - 折叠时限制可见高度，底部以半透明遮罩隐约透出下方代码
 *    - 遮罩上居中放置「展开 / 折叠」按钮，便于发现与操作
 *
 * 由于代码块由 Astro 在构建期通过 Markdown 渲染为静态 HTML，
 * 此组件通过 DOM 操作增强已有元素，而非重新渲染。
 * 按钮样式参照 shadcn/ui ghost 变体，保持视觉一致。
 */
import { useEffect } from "react";

/** 超过此行数的代码块启用折叠 */
const COLLAPSE_THRESHOLD = 14;

/* ---- 内联 SVG 图标（lucide 风格） ---- */
const ICON_COPY = /* html */ `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const ICON_CHECK = /* html */ `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const ICON_CHEVRON_DOWN = /* html */ `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const ICON_CHEVRON_UP = /* html */ `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`;

/** 复制按钮基础样式 —— 参照 shadcn/ui ghost 按钮风格 */
const COPY_BTN_CLASS =
  "inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground/50 transition-all hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

/** 折叠按钮 —— 居中悬浮于底部半透明遮罩之上 */
const TOGGLE_BTN_CLASS =
  "code-block-toggle absolute bottom-3 left-1/2 z-20 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/85 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-lg shadow-black/20 backdrop-blur-md transition-colors hover:border-border hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

let toggleIdSeq = 0;

function createButton(
  className: string,
  title: string,
  iconHtml: string,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.title = title;
  btn.setAttribute("aria-label", title);
  btn.className = className;
  btn.innerHTML = iconHtml;
  return btn;
}

export default function CodeBlockEnhancer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLPreElement>(".prose-rift pre");
    const cleanups: (() => void)[] = [];

    blocks.forEach((pre) => {
      // 避免重复增强（如 Astro View Transitions 重新挂载时）
      if (pre.dataset.enhanced === "true") return;
      pre.dataset.enhanced = "true";

      const code = pre.querySelector("code");
      if (!code) return;

      const codeText = code.textContent ?? "";
      const lineCount = codeText.replace(/\n+$/, "").split("\n").length;
      const canCollapse = lineCount > COLLAPSE_THRESHOLD;

      /* ---- 1. 包装 pre 为带工具栏的容器 ---- */
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper relative group/pre";
      if (canCollapse) wrapper.classList.add("is-collapsible");
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      /* ---- 2. 右上角工具栏（复制） ---- */
      const toolbar = document.createElement("div");
      toolbar.className =
        "code-block-toolbar absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5";
      wrapper.appendChild(toolbar);

      const copyBtn = createButton(COPY_BTN_CLASS, "复制代码", ICON_COPY);
      toolbar.appendChild(copyBtn);

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          copyBtn.innerHTML = ICON_CHECK;
          copyBtn.style.color = "var(--accent)";
          copyBtn.title = "已复制";
          window.setTimeout(() => {
            copyBtn.innerHTML = ICON_COPY;
            copyBtn.style.color = "";
            copyBtn.title = "复制代码";
          }, 2000);
        } catch (err) {
          console.error("[CodeBlockEnhancer] 复制失败:", err);
        }
      };
      copyBtn.addEventListener("click", handleCopy);

      /* ---- 3. 折叠 / 展开（仅长代码块） ---- */
      if (!canCollapse) {
        cleanups.push(() => copyBtn.removeEventListener("click", handleCopy));
        return;
      }

      // 半透明遮罩 —— 折叠时隐约透出下方代码
      const fade = document.createElement("div");
      fade.className = "code-block-fade";
      wrapper.appendChild(fade);

      // 为可访问性关联按钮与代码区
      const regionId = `code-region-${++toggleIdSeq}`;
      pre.id = regionId;

      const toggleBtn = createButton(
        TOGGLE_BTN_CLASS,
        "展开代码",
        ICON_CHEVRON_DOWN,
      );
      toggleBtn.setAttribute("aria-controls", regionId);
      wrapper.appendChild(toggleBtn);

      let collapsed = true;
      const syncToggle = () => {
        wrapper.classList.toggle("is-collapsed", collapsed);
        const icon = collapsed ? ICON_CHEVRON_DOWN : ICON_CHEVRON_UP;
        const label = collapsed ? "展开代码" : "折叠代码";
        toggleBtn.innerHTML = `${icon}<span>${label}</span>`;
        toggleBtn.title = label;
        toggleBtn.setAttribute("aria-label", label);
        toggleBtn.setAttribute("aria-expanded", String(!collapsed));
      };
      syncToggle();

      const handleToggle = () => {
        collapsed = !collapsed;
        syncToggle();
      };
      toggleBtn.addEventListener("click", handleToggle);

      cleanups.push(() => {
        copyBtn.removeEventListener("click", handleCopy);
        toggleBtn.removeEventListener("click", handleToggle);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
