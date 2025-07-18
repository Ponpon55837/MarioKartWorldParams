import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
        <div className="min-h-screen bg-pattern">
          <header className="mario-gradient text-white p-4 shadow-2xl">
            <div className="container mx-auto">
              <h1 className="text-3xl font-bold text-center text-shadow">
                🏁 Mario Kart World 🏁
              </h1>
              <p className="text-center mt-1 text-base opacity-90">
                瑪利歐賽車筆記 - 角色與載具能力值查詢
              </p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="bg-gray-800 text-white p-6 mt-12">
            <div className="container mx-auto text-center">
              <p>&copy; 2024 Mario Kart World 筆記系統</p>
              <p className="text-sm opacity-70 mt-1">
                基於官方資料製作的非官方工具
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
