"use client";

import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  themeStateAtom,
  systemThemePreferenceAtom,
  toggleThemeAtom,
} from "@/store/dataAtoms";
import { ThemeMode } from "@/types";

/**
 * 主題提供者組件
 *
 * 處理主題初始化、系統主題偵測和 DOM 屬性設定
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeState = useAtomValue(themeStateAtom);
  const [, setSystemPreference] = useAtom(systemThemePreferenceAtom);
  const [, toggleTheme] = useAtom(toggleThemeAtom);

  useEffect(() => {
    // 偵測系統主題偏好
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemPreference = (
      e: MediaQueryListEvent | MediaQueryList,
    ) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    // 初始設定
    updateSystemPreference(mediaQuery);

    // 監聽系統主題變化
    mediaQuery.addEventListener("change", updateSystemPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateSystemPreference);
    };
  }, [setSystemPreference]);

  useEffect(() => {
    // 更新 HTML 元素的主題屬性
    const root = document.documentElement;

    // 設定主題類別
    root.classList.remove("light", "dark");
    root.classList.add(themeState.resolvedTheme);

    // 設定 color-scheme 屬性
    root.style.setProperty("color-scheme", themeState.resolvedTheme);

    // 設定主題資料屬性（供 CSS 使用）
    root.setAttribute("data-theme", themeState.resolvedTheme);
    root.setAttribute("data-theme-mode", themeState.mode);
  }, [themeState]);

  // 主題變更時提供過渡效果
  useEffect(() => {
    const root = document.documentElement;

    // 添加過渡類別
    root.classList.add("theme-transitioning");

    // 移除過渡類別（短暫延遲以確保過渡效果）
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 300);

    return () => clearTimeout(timeout);
  }, [themeState.resolvedTheme]);

  return <>{children}</>;
}
