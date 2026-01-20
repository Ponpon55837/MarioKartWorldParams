"use client";

import dynamic from "next/dynamic";

// 延遲載入 SpeedInsights 以改善初始載入效能
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

export function SpeedInsightsWrapper() {
  return <SpeedInsights />;
}
