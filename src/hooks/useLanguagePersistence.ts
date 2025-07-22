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

  // 初始化語言設定 - 確保 SSR/CSR 一致性
  useEffect(() => {
    let isMounted = true;

    const initializeLanguage = async () => {
      if (typeof window !== 'undefined' && !isInitialized) {
        try {
          // 先設置為 fallback 語言，避免水合錯誤
          if (i18n.language !== DEFAULT_LANGUAGE) {
            await i18n.changeLanguage(DEFAULT_LANGUAGE);
          }

          const savedLanguage = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
          
          if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
            setLanguage(savedLanguage);
            if (savedLanguage !== DEFAULT_LANGUAGE) {
              await i18n.changeLanguage(savedLanguage);
            }
          } else {
            // 如果沒有儲存的語言，設為預設語言
            setLanguage(DEFAULT_LANGUAGE);
            localStorage.setItem(STORAGE_KEY, DEFAULT_LANGUAGE);
          }
          
          // 更新 HTML lang 屬性
          if (document.documentElement) {
            document.documentElement.lang = savedLanguage || DEFAULT_LANGUAGE;
          }
          
        } catch (error) {
          console.error('Language initialization error:', error);
          setLanguage(DEFAULT_LANGUAGE);
          localStorage.setItem(STORAGE_KEY, DEFAULT_LANGUAGE);
          if (document.documentElement) {
            document.documentElement.lang = DEFAULT_LANGUAGE;
          }
        } finally {
          if (isMounted) {
            setIsInitialized(true);
          }
        }
      }
    };
    
    initializeLanguage();

    return () => {
      isMounted = false;
    };
  }, [i18n, setLanguage, isInitialized]);

  // 當語言變更時，同步更新 localStorage、i18n 和 HTML lang 屬性
  const changeLanguage = useCallback((newLanguage: SupportedLanguage) => {
    if (typeof window !== 'undefined') {
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
      localStorage.setItem(STORAGE_KEY, newLanguage);
      
      // 更新 HTML lang 屬性
      if (document.documentElement) {
        document.documentElement.lang = newLanguage;
      }
    }
  }, [setLanguage, i18n]);

  return { 
    language, 
    changeLanguage,
    isInitialized
  };
}
