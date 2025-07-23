import { useAtom } from 'jotai';
import { useEffect, useState, useCallback } from 'react';
import { languageAtom, SupportedLanguage } from '@/store/atoms';
import { useTranslation } from 'react-i18next';

// 常數定義
const SUPPORTED_LANGUAGES = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'] as const;

// 工具函數：檢查是否為有效語言
const isValidLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

// 工具函數：更新 DOM 語言屬性
const updateDocumentLanguage = (language: SupportedLanguage): void => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
};

/**
 * 語言持久化 Hook
 * 
 * 使用 Jotai 的 atomWithStorage 自動處理持久化，
 * 只需要同步 i18next 和 DOM 語言屬性
 */
export function useLanguagePersistence() {
  const [language, setLanguage] = useAtom(languageAtom);
  const { i18n } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeLanguage = async () => {
    try {
      // 確保使用 localStorage 中的值而不是 atom 的初始值
      const storedLanguage = typeof window !== 'undefined' 
        ? localStorage.getItem('mario-kart-language') as SupportedLanguage || 'zh-TW'
        : 'zh-TW';
      
      // 如果 localStorage 中的語言與當前 atom 不一致，更新 atom
      if (storedLanguage !== language && isValidLanguage(storedLanguage)) {
        setLanguage(storedLanguage);
      }
      
      // 使用存儲的語言同步到 i18next 和 DOM
      const targetLanguage = isValidLanguage(storedLanguage) ? storedLanguage : language;
      await i18n.changeLanguage(targetLanguage);
      updateDocumentLanguage(targetLanguage);
      setIsInitialized(true);
    } catch (error) {
      console.error('Language initialization failed:', error);
      setIsInitialized(true); // 即使失敗也要標記為已初始化
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      initializeLanguage();
    }
  }, [language, i18n, isInitialized, setLanguage]);

  // 語言切換函數
  const changeLanguage = useCallback(async (newLanguage: SupportedLanguage) => {
    if (!isValidLanguage(newLanguage)) {
      console.warn(`Invalid language: ${newLanguage}`);
      return;
    }

    try {
      // 更新 Jotai state (自動持久化到 localStorage)
      setLanguage(newLanguage);
      
      // 同步到 i18next 和 DOM
      await i18n.changeLanguage(newLanguage);
      updateDocumentLanguage(newLanguage);
      
    } catch (error) {
      console.error('Language change failed:', error);
    }
  }, [setLanguage, i18n]);

  return { 
    language, 
    changeLanguage,
    isInitialized,
    supportedLanguages: SUPPORTED_LANGUAGES,
    defaultLanguage: 'zh-TW' as const
  } as const;
}
