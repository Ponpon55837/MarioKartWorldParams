// CSS 模組類型宣告
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// CSS 副作用匯入
declare module '@/app/globals.css';

// 其他資源類型宣告
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.gif' {
  const content: any;
  export default content;
}

declare module '*.webp' {
  const content: any;
  export default content;
}
