"use client";

import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { themeModeAtom } from "@/store/dataAtoms";

/**
 * 主題提供者：把目前主題同步到 <html> 的 class，
 * 色彩 token 由 globals.css 的 :root / .dark 決定
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAtomValue(themeModeAtom);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return <>{children}</>;
}
