"use client";

import { useAtom, useAtomValue } from "jotai";
import { themeModeAtom, toggleThemeAtom } from "@/store/dataAtoms";
import { useTranslation } from "react-i18next";

/**
 * 主題切換器組件
 *
 * 直接點擊切換亮色/深色主題
 */
export function ThemeToggle() {
  const { t } = useTranslation();
  const themeMode = useAtomValue(themeModeAtom);
  const [, toggleTheme] = useAtom(toggleThemeAtom);

  const handleToggle = () => {
    toggleTheme();
  };

  // 當前主題圖示
  const currentIcon = themeMode === "light" ? "🌙" : "☀️";
  const currentLabel =
    themeMode === "light"
      ? t("theme.switchToDark", "切換到深色")
      : t("theme.switchToLight", "切換到亮色");

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="h-10 px-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors duration-200 flex items-center justify-center"
      title={currentLabel}
      aria-label={currentLabel}
    >
      <span className="text-lg" role="img" aria-hidden="true">
        {currentIcon}
      </span>
      {/* 當前主題指示器（可訪問性） */}
      <span className="sr-only">{currentLabel}</span>
    </button>
  );
}
