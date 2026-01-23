"use client";

import { useTranslation } from "react-i18next";
import { SearchHistoryItem } from "@/utils/searchHistory";

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectItem: (query: string) => void;
  onRemoveItem: (query: string) => void;
}

export function SearchHistory({
  history,
  onSelectItem,
  onRemoveItem,
}: SearchHistoryProps) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return (
      <div className="space-y-4">
        {/* 使用提示 */}
        <div className="mt-6 p-3 bg-accent/10 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-sm">💡</span>
            <div className="text-sm text-accent">
              <p className="font-medium mb-1">{t("search.modal.searchTips")}</p>
              <ul className="space-y-1 text-xs">
                <li>{t("search.modal.tip1")}</li>
                <li>{t("search.modal.tip2")}</li>
                <li>{t("search.modal.tip3")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 空狀態提示 */}
        <div className="text-center py-8 text-muted">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-lg">{t("search.modal.startSearch")}</p>
          <p className="text-sm mt-2">{t("search.modal.supportBoth")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜尋歷史 */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          {t("search.modal.recentSearches")}
        </h3>
        <div className="space-y-1">
          {history.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between group"
            >
              <button
                onClick={() => onSelectItem(item.query)}
                className="flex-1 text-left px-3 py-2 rounded text-sm text-muted hover:bg-muted transition-colors"
              >
                <span className="font-medium">{item.query}</span>
                <span className="text-xs text-muted ml-2">
                  {item.resultCount} {t("search.modal.resultsCount")}
                </span>
              </button>
              <button
                onClick={() => onRemoveItem(item.query)}
                className="p-1 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t("common.delete")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 使用提示 */}
      <div className="mt-6 p-3 bg-accent/10 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-blue-500 text-sm">💡</span>
          <div className="text-sm text-accent">
            <p className="font-medium mb-1">{t("search.modal.searchTips")}</p>
            <ul className="space-y-1 text-xs">
              <li>{t("search.modal.tip1")}</li>
              <li>{t("search.modal.tip2")}</li>
              <li>{t("search.modal.tip3")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
