import { useEffect, useState } from 'react';

/**
 * 客戶端掛載狀態 hook
 * 用於避免 SSR 水化不匹配問題
 */
export const useClientMounted = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
