"use client";

import { useTranslation } from "react-i18next";
import SearchButton, { SearchShortcutHint } from "@/components/SearchButton";

interface SearchBarProps {
  onSearchClick: () => void;
  charactersCount: number;
  vehiclesCount: number;
}

export function SearchBar({
  onSearchClick,
  charactersCount,
  vehiclesCount,
}: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SearchButton onClick={onSearchClick} />
          <SearchShortcutHint onClick={onSearchClick} />
        </div>
        <div className="text-sm text-gray-500">
          {t("stats.total", {
            charactersCount,
            vehiclesCount,
          })}
        </div>
      </div>
    </div>
  );
}
