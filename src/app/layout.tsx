import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/app/globals.css';
import JotaiProvider from '@/providers/JotaiProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '瑪利歐賽車世界參數工具',
  description: '分析和比較瑪利歐賽車角色與載具統計資料，提供智能推薦系統和多語言支援'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <JotaiProvider>{children}</JotaiProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
