/** 使用者是否在系統設定中要求減少動態效果（僅能在瀏覽器呼叫） */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
