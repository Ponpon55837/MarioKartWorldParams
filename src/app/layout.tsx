import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import JotaiProvider from '@/providers/JotaiProvider'
import LayoutContent from '@/components/LayoutContent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mario Kart World - 瑪利歐賽車筆記',
  description: '瑪利歐賽車角色與載具能力值查詢系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <JotaiProvider>
          {children}
        </JotaiProvider>
      </body>
    </html>
  )
}
