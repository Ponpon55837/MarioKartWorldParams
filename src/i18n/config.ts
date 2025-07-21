import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻譯資源
import zhTW from './locales/zh-TW.json';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

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
