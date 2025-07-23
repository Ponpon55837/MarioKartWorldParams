import { useAtom } from 'jotai';
import { useEffect, useState, useCallback } from 'react';
import { languageAtom, SupportedLanguage } from '@/store/atoms';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'] as const;
const DEFAULT_LANGUAGE = 'zh-TW';
const STORAGE_KEY = 'mario-kart-language';

export function useLanguagePersistence() {
  const [language, setLanguage] = useAtom(languageAtom);
  const { i18n } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化語言設定
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedLanguage = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      
      if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        setLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
        document.documentElement.lang = savedLanguage;
      } else {
        localStorage.setItem(STORAGE_KEY, DEFAULT_LANGUAGE);
        setLanguage(DEFAULT_LANGUAGE);
        i18n.changeLanguage(DEFAULT_LANGUAGE);
        document.documentElement.lang = DEFAULT_LANGUAGE;
      }
      
      setIsInitialized(true);
    }
  }, [i18n, setLanguage, isInitialized]);

  // 語言切換函數
  const changeLanguage = useCallback(async (newLanguage: SupportedLanguage) => {
    if (typeof window !== 'undefined') {
      setLanguage(newLanguage);
      localStorage.setItem(STORAGE_KEY, newLanguage);
      await i18n.changeLanguage(newLanguage);
      document.documentElement.lang = newLanguage;
    }
  }, [setLanguage, i18n]);

  return { 
    language, 
    changeLanguage,
    isInitialized
  };
}
