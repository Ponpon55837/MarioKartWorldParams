import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻譯資源
import zhTW from '@/i18n/locales/zh-TW.json';
import zhCN from '@/i18n/locales/zh-CN.json';
import en from '@/i18n/locales/en.json';
import ja from '@/i18n/locales/ja.json';
import ko from '@/i18n/locales/ko.json';

const resources = {
  'zh-TW': {
    translation: zhTW
  },
  'zh-CN': {
    translation: zhCN
  },
  en: {
    translation: en
  },
  ja: {
    translation: ja
  },
  ko: {
    translation: ko
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-TW',
    lng: typeof window !== 'undefined' ? localStorage.getItem('mario-kart-language') || 'zh-TW' : 'zh-TW',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'mario-kart-language',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
    },

    react: {
      useSuspense: false, // 避免 SSR 問題
    },
  });

export default i18n;
