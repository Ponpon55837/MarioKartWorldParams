"use client";

import { useTranslation } from "react-i18next";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
import type { SupportedLanguage } from "@/store/dataAtoms";
import { Icon } from "@/components/ui/Icon";
import { ICON_ONLY_MOBILE_CLASS, NAV_ROW_CLASS } from "@/components/layout/NavRow";

/** 語言名稱固定以各自的語言顯示，方便使用者辨認 */
const LANGUAGE_OPTIONS: ReadonlyArray<{ value: SupportedLanguage; label: string }> = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "zh-CN", label: "简体中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

/**
 * 側邊欄的語言選單：外觀與其他列一致，
 * 實際互動交給覆蓋其上的原生 <select>（鍵盤與螢幕閱讀器皆可用）
 */
export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguagePersistence();
  const current = LANGUAGE_OPTIONS.find((option) => option.value === language);

  return (
    <label
      className={`${NAV_ROW_CLASS} ${ICON_ONLY_MOBILE_CLASS.row} relative cursor-pointer text-secondary hover:bg-foreground/5 hover:text-foreground focus-within:ring-2 focus-within:ring-kart-blue`}
    >
      <Icon name="globe" className="h-4 w-4 text-muted" />
      <span className={`flex-1 ${ICON_ONLY_MOBILE_CLASS.text}`}>{t("sidebar.language")}</span>
      <span className={`text-xs opacity-80 ${ICON_ONLY_MOBILE_CLASS.text}`}>
        {current?.label}
      </span>
      <select
        value={language}
        onChange={(event) =>
          changeLanguage(event.target.value as SupportedLanguage)
        }
        aria-label={t("sidebar.language")}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LANGUAGE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
