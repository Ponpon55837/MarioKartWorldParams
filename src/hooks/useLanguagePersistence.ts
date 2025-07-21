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
    let isMounted = true;

    const initializeLanguage = async () => {
      if (typeof window !== 'undefined' && !isInitialized) {
        try {
          const savedLanguage = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
          
          if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
            if (i18n.language !== savedLanguage) {
              setLanguage(savedLanguage);
              await i18n.changeLanguage(savedLanguage);
            } else {
              setLanguage(savedLanguage);
            }
          } else {
            const currentLang = i18n.language as SupportedLanguage;
            const defaultLang = SUPPORTED_LANGUAGES.includes(currentLang) ? currentLang : DEFAULT_LANGUAGE;
            
            setLanguage(defaultLang);
            localStorage.setItem(STORAGE_KEY, defaultLang);
            
            if (i18n.language !== defaultLang) {
              await i18n.changeLanguage(defaultLang);
            }
          }
        } catch (error) {
          console.error('Language initialization error:', error);
          setLanguage(DEFAULT_LANGUAGE);
          localStorage.setItem(STORAGE_KEY, DEFAULT_LANGUAGE);
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

  // 當語言變更時，同步更新 localStorage 和 i18n
  const changeLanguage = useCallback((newLanguage: SupportedLanguage) => {
    if (typeof window !== 'undefined') {
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
      localStorage.setItem(STORAGE_KEY, newLanguage);
    }
  }, [setLanguage, i18n]);

  return { 
    language, 
    changeLanguage,
    isInitialized
  };
}
