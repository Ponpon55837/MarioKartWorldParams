"use client";

import { Provider } from "jotai";
import dynamic from "next/dynamic";
import "@/i18n/config"; // 初始化 i18n

interface JotaiProviderProps {
  children: React.ReactNode;
}

/**
 * Jotai DevTools 改為手動開啟：設定 NEXT_PUBLIC_JOTAI_DEVTOOLS=true 才載入。
 * jotai-devtools 在開發環境每次渲染都會印出 tree-shaking 棄用警告，
 * 預設不載入可保持主控台乾淨，需要除錯狀態時再開。
 */
const ENABLE_DEVTOOLS =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_JOTAI_DEVTOOLS === "true";

const DevTools = ENABLE_DEVTOOLS
  ? dynamic(() => import("jotai-devtools").then((mod) => mod.DevTools), {
      ssr: false,
    })
  : null;

export default function JotaiProvider({ children }: JotaiProviderProps) {
  return (
    <Provider>
      {DevTools && <DevTools />}
      {children}
    </Provider>
  );
}
