import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { languageAtom, SupportedLanguage } from '@/store/atoms';
import { useTranslation } from 'react-i18next';

export function useLanguagePersistence() {
  const [language, setLanguage] = useAtom(languageAtom);
  const { i18n } = useTranslation();

  // 從 localStorage 載入語言設定
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 優先從 localStorage 取得語言設定
      const savedLanguage = localStorage.getItem('i18nextLng') as SupportedLanguage;
      
      if (savedLanguage && ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'].includes(savedLanguage)) {
        // 如果有有效的儲存語言，使用儲存的語言
        if (language !== savedLanguage) {
          setLanguage(savedLanguage);
        }
        if (i18n.language !== savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }
      } else {
        // 如果沒有儲存的語言設定，使用預設的繁體中文
        setLanguage('zh-TW');
        i18n.changeLanguage('zh-TW');
        localStorage.setItem('i18nextLng', 'zh-TW');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件初始化時執行一次

  // 當語言變更時，同步到 localStorage 和 i18n
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', language);
      if (i18n.language !== language) {
        i18n.changeLanguage(language);
      }
    }
  }, [language, i18n]);

  return { language, setLanguage };
}
