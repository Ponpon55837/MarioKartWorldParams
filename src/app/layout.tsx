import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "@/app/globals.css";
import JotaiProvider from "@/providers/JotaiProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// 延遲載入 SpeedInsights 以改善初始載入效能
const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "瑪利歐賽車世界參數工具",
  description:
    "分析和比較瑪利歐賽車角色與載具統計資料，提供智能推薦系統和多語言支援",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <JotaiProvider>{children}</JotaiProvider>
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  );
}
