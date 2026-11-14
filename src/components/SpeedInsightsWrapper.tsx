"use client";

import dynamic from "next/dynamic";

// 延遲載入 SpeedInsights 以改善初始載入效能
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

/**
 * 只在正式環境回報效能數據：開發環境的 debug 腳本來自外部網域，
 * 會被 next.config.js 的 CSP（script-src 'self'）擋下並在主控台報錯
 */
export function SpeedInsightsWrapper() {
  if (process.env.NODE_ENV !== "production") return null;
  return <SpeedInsights />;
}
