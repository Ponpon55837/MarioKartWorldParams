import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import JotaiProvider from "@/providers/JotaiProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SpeedInsightsWrapper } from "@/components/SpeedInsightsWrapper";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

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
          <JotaiProvider>
            <ThemeProvider>
              <LanguageProvider>{children}</LanguageProvider>
            </ThemeProvider>
          </JotaiProvider>
        </ErrorBoundary>
        <SpeedInsightsWrapper />
      </body>
    </html>
  );
}
