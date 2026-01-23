"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  themeModeAtom,
  themeStateAtom,
  toggleThemeAtom,
} from "@/store/dataAtoms";
import { ThemeMode } from "@/types";
import { useTranslation } from "react-i18next";

/**
 * 主題切換器組件
 *
 * 提供主題切換功能，支援系統、亮色、深色三種模式
 */
export function ThemeToggle() {
  const { t } = useTranslation();
  const themeMode = useAtomValue(themeModeAtom);
  const themeState = useAtomValue(themeStateAtom);
  const [, toggleTheme] = useAtom(toggleThemeAtom);

  const handleThemeChange = (mode: ThemeMode) => {
    toggleTheme(mode);
  };

  // 主題選項配置
  const themeOptions = [
    {
      value: "system" as ThemeMode,
      label: t("theme.system", "系統"),
      icon: themeState.systemPreference === "dark" ? "🌙" : "☀️",
      description: t("theme.systemDescription", "跟隨系統設定"),
    },
    {
      value: "light" as ThemeMode,
      label: t("theme.light", "亮色"),
      icon: "☀️",
      description: t("theme.lightDescription", "固定使用亮色主題"),
    },
    {
      value: "dark" as ThemeMode,
      label: t("theme.dark", "深色"),
      icon: "🌙",
      description: t("theme.darkDescription", "固定使用深色主題"),
    },
  ];

  return (
    <div className="relative group">
      {/* 主題按鈕 */}
      <button
        type="button"
        onClick={() => toggleTheme()}
        className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors duration-200"
        title={t("theme.toggle", "切換主題")}
        aria-label={t("theme.toggle", "切換主題")}
      >
        <span className="text-xl" role="img" aria-hidden="true">
          {themeOptions.find((option) => option.value === themeMode)?.icon}
        </span>
      </button>

      {/* 主題選單 */}
      <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <div className="text-sm font-medium text-foreground mb-2">
            {t("theme.selectTheme", "選擇主題")}
          </div>

          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleThemeChange(option.value)}
              className={`w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors duration-200 ${
                themeMode === option.value
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
              aria-label={`${option.label} - ${option.description}`}
              aria-pressed={themeMode === option.value}
            >
              <span className="text-lg" role="img" aria-hidden="true">
                {option.icon}
              </span>
              <div className="text-left flex-1">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted">{option.description}</div>
              </div>
              {themeMode === option.value && (
                <div
                  className="w-2 h-2 bg-accent-foreground rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 當前主題指示器（可訪問性） */}
      <span className="sr-only">
        {t("theme.current", "當前主題")}:{" "}
        {themeOptions.find((option) => option.value === themeMode)?.label}
      </span>
    </div>
  );
}
