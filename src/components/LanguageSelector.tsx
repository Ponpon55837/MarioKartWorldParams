import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { languageAtom, SupportedLanguage } from '@/store/atoms';
import CustomSelect from './CustomSelect';

// 語言選項配置
const languageOptions = [
  { value: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
];

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useAtom(languageAtom);

  // 處理語言切換
  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as SupportedLanguage;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // 準備選項給 CustomSelect
  const selectOptions = languageOptions.map(option => ({
    value: option.value,
    label: `${option.flag} ${option.label}`
  }));

  const currentOption = languageOptions.find(option => option.value === language);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}>
      <label className="text-xs sm:text-sm font-medium text-white/90 whitespace-nowrap text-center sm:text-left">
        {t('language.selector')}
      </label>
      <CustomSelect
        value={language}
        onChange={handleLanguageChange}
        options={selectOptions}
        placeholder={`${currentOption?.flag || '🌐'} ${t('language.selector')}`}
        className="min-w-[120px] sm:min-w-[140px]"
      />
    </div>
  );
}
