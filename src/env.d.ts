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
