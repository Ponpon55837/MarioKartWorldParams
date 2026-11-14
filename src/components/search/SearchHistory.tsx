"use client";

import { useTranslation } from "react-i18next";
import type { SearchHistoryItem } from "@/utils/searchHistory";
import { Icon } from "@/components/ui/Icon";

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectItem: (query: string) => void;
  onRemoveItem: (query: string) => void;
}

const VISIBLE_HISTORY = 5;

export function SearchHistory({ history, onSelectItem, onRemoveItem }: SearchHistoryProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {history.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm text-secondary">{t("search.modal.recentSearches")}</h3>
          <ul className="space-y-1">
            {history.slice(0, VISIBLE_HISTORY).map((item) => (
              <li key={item.query} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelectItem(item.query)}
                  className="flex-1 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-raised"
                >
                  {item.query}
                  <span className="ml-2 font-mono text-xs text-muted">
                    {item.resultCount} {t("search.modal.resultsCount")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.query)}
                  className="rounded-md p-1 text-muted opacity-0 transition-opacity duration-150 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                  aria-label={t("search.modal.removeHistory", { query: item.query })}
                >
                  <Icon name="x" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl bg-raised p-3 text-sm text-secondary">
        <p className="mb-1">{t("search.modal.searchTips")}</p>
        <ul className="space-y-1 text-xs text-muted">
          <li>{t("search.modal.tip1")}</li>
          <li>{t("search.modal.tip2")}</li>
          <li>{t("search.modal.tip3")}</li>
        </ul>
      </section>
    </div>
  );
}
