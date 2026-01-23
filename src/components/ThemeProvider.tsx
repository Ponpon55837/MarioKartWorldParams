"use client";

import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { themeStateAtom } from "@/store/dataAtoms";
import { useTranslation } from "react-i18next";

/**
 * 主題提供者組件
 *
 * 處理主題 DOM 屬性設定和整體主題應用
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeState = useAtomValue(themeStateAtom);

  useEffect(() => {
    // 更新 HTML 和 body 元素的主題
    const html = document.documentElement;
    const body = document.body;

    // 移除所有主題類別
    html.classList.remove("light", "dark");
    body.classList.remove("light", "dark");

    // 設定當前主題類別
    const currentTheme = themeState.mode;
    html.classList.add(currentTheme);
    body.classList.add(currentTheme);

    // 設定 color-scheme 屬性
    html.style.setProperty("color-scheme", currentTheme);
    body.style.setProperty("color-scheme", currentTheme);

    // 設定主題資料屬性
    html.setAttribute("data-theme", currentTheme);
    html.setAttribute("data-theme-mode", currentTheme);
    body.setAttribute("data-theme", currentTheme);

    // 強制重繪確保主題立即生效
    html.style.display = "none";
    html.offsetHeight; // 觸發重繪
    html.style.display = "";
  }, [themeState]);

  return <>{children}</>;
}
