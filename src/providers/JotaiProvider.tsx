'use client';

import { Provider } from 'jotai';
import dynamic from 'next/dynamic';
import '@/i18n/config'; // 初始化 i18n

interface JotaiProviderProps {
  children: React.ReactNode;
}

// 動態導入 DevTools，僅在開發環境載入
const DevTools = dynamic(() => import('jotai-devtools').then((mod) => mod.DevTools), {
  ssr: false
});

export default function JotaiProvider({ children }: JotaiProviderProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Provider>
      {isDevelopment && <DevTools />}
      {children}
    </Provider>
  );
}
