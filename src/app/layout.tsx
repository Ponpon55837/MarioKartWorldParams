import type { Metadata } from "next";
import { Geist, Geist_Mono, Huninn, Noto_Sans_TC } from "next/font/google";
import "@/app/globals.css";
import JotaiProvider from "@/providers/JotaiProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SpeedInsightsWrapper } from "@/components/SpeedInsightsWrapper";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
// 中文字體檔案依 unicode-range 分片，只在用到時下載，不預載
const huninn = Huninn({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-huninn",
  preload: false,
  // Google 未提供 Huninn 的字體度量值，無法產生 fallback 字體；
  // Turbopack 建置時仍會印出一次 "Failed to find font override values"，可忽略
  adjustFontFallback: false,
});
const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-noto-tc",
  preload: false,
});

const fontVariables = [geist, geistMono, huninn, notoSansTC]
  .map((font) => font.variable)
  .join(" ");

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
    <html lang="zh-TW" className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>
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
