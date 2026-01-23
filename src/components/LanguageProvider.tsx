"use client";

import { useEffect } from "react";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";

/**
 * 語言提供者組件
 *
 * 處理應用程式的語言初始化和持久化。
 * 這個組件確保在客戶端正確設定語言，
 * 並同步 i18next、DOM 屬性和 localStorage。
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useLanguagePersistence();

  useEffect(() => {
    // 語言初始化由 useLanguagePersistence hook 處理
    // 這裡我們只需要等待初始化完成
    if (isInitialized) {
      console.log("Language provider initialized successfully");
    }
  }, [isInitialized]);

  // 在語言初始化期間顯示簡單的載入狀態
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted">載入中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
