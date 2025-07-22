'use client';

import { useTranslation } from 'react-i18next';
import { useLanguagePersistence } from '@/hooks/useLanguagePersistence';
import LanguageSelector from '@/components/LanguageSelector';
import { SpeedInsights } from '@vercel/speed-insights/next';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const { t } = useTranslation();
  
  // 初始化語言持久化
  useLanguagePersistence();

  return (
    <div className="min-h-screen bg-pattern">
      <header className="mario-gradient text-white p-4 shadow-2xl">
        <div className="container mx-auto">
          {/* 手機版：垂直佈局，桌面版：水平佈局 */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-0">
            <div className="flex-1 text-center lg:text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-shadow">
                {t('app.title')}
              </h1>
              <p className="mt-1 text-sm md:text-base opacity-90">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end lg:ml-4">
              <LanguageSelector className="w-full max-w-[200px] lg:w-auto" />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
         <SpeedInsights />
      </main>
      <footer className="bg-gray-800 text-white p-6 mt-2">
        <div className="container mx-auto text-center">
          <p>{t('app.footer.copyright')}</p>
          <p className="text-sm opacity-70 mt-1">
            {t('app.footer.disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
