"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { themeModeAtom, toggleThemeAtom } from "@/store/dataAtoms";
import { NavRow } from "@/components/layout/NavRow";

/** 側邊欄的深色模式開關 */
export function ThemeToggle() {
  const { t } = useTranslation();
  const isDark = useAtomValue(themeModeAtom) === "dark";
  const toggleTheme = useSetAtom(toggleThemeAtom);

  return (
    <NavRow
      icon="moon"
      label={t("sidebar.darkMode")}
      meta={isDark ? t("sidebar.on") : t("sidebar.off")}
      iconOnlyOnMobile
      onClick={() => toggleTheme()}
    />
  );
}
