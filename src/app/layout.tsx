import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import JotaiProvider from '@/providers/JotaiProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mario Kart World',
  description: 'Mario Kart character and vehicle stats reference system'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
