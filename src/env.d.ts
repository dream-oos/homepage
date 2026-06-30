/// <reference types="astro/client" />

declare module "*.yaml?raw" {
  const content: string;
  export default content;
}

declare module "*.yml?raw" {
  const content: string;
  export default content;
}

// Waline 客户端样式子路径（动态导入 CSS，无类型声明）
declare module "@waline/client/style";

// Waline 客户端样式（动态 import 时的副作用模块，无类型声明）
declare module "@waline/client/style";

// @waline/client 的样式子路径（仅 CSS 副作用导入，无导出）
declare module "@waline/client/style";
