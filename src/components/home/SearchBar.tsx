"use client";

import { useTranslation } from "react-i18next";
import { useSetAtom, useAtomValue } from "jotai";
import SearchButton, { SearchShortcutHint } from "@/components/SearchButton";
import {
  searchModalOpenAtom,
  charactersAtom,
  vehiclesAtom,
} from "@/store/dataAtoms";

export function SearchBar() {
  const { t } = useTranslation();

  // 使用全域狀態
  const setIsSearchModalOpen = useSetAtom(searchModalOpenAtom);
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);

  return (
    <div className="theme-card rounded-lg shadow-md p-4 theme-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SearchButton onClick={() => setIsSearchModalOpen(true)} />
          <SearchShortcutHint onClick={() => setIsSearchModalOpen(true)} />
        </div>
        <div className="text-sm text-muted">
          {t("stats.total", {
            charactersCount: characters.length,
            vehiclesCount: vehicles.length,
          })}
        </div>
      </div>
    </div>
  );
}
