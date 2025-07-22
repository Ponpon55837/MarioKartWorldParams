'use client';

import { Provider } from 'jotai';
import { DevTools } from 'jotai-devtools';
import '@/i18n/config'; // 初始化 i18n

interface JotaiProviderProps {
  children: React.ReactNode;
}

export default function JotaiProvider({ children }: JotaiProviderProps) {
  return (
    <Provider>
      {process.env.NODE_ENV === 'development' && <DevTools />}
      {children}
    </Provider>
  );
}
