"use client";

import { useTranslation } from "react-i18next";
import EntityCard from "@/components/EntityCard";
import type {
  SearchResultItem,
  SpeedFilter,
  HandlingFilter,
  SummaryMaxStats,
} from "@/types";

interface SearchResultsProps {
  results: SearchResultItem[];
  searchQuery: string;
  maxStats: SummaryMaxStats;
  speedFilter: SpeedFilter;
  handlingFilter: HandlingFilter;
  isLoading: boolean;
}

export function SearchResults({
  results,
  searchQuery,
  maxStats,
  speedFilter,
  handlingFilter,
  isLoading,
}: SearchResultsProps) {
  const { t } = useTranslation();

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mario-blue mx-auto mb-4"></div>
        <p className="text-muted">{t("search.loading")}</p>
      </div>
    );
  }

  // 無結果狀態
  if (results.length === 0 && searchQuery) {
    return (
      <div className="text-center py-8 text-muted">
        <div className="text-6xl mb-4">🤔</div>
        <p className="text-lg">
          {t("search.modal.noResultsFor", { query: searchQuery })}
        </p>
        <p className="text-sm mt-2">{t("search.modal.tryOther")}</p>
        <div className="mt-4 text-xs text-muted">
          <p>{t("search.modal.searchTipTitle")}</p>
          <p>{t("search.modal.searchTip1")}</p>
          <p>{t("search.modal.searchTip2")}</p>
          <p>{t("search.modal.searchTip3")}</p>
        </div>
      </div>
    );
  }

  // 有結果，顯示結果列表
  if (results.length > 0) {
    return (
      <div className="space-y-4">
        {/* 搜尋結果統計 */}
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {t("search.modal.foundResults", {
              count: results.length,
            })}
          </span>
          <span className="text-xs">
            {t("search.modal.searchQuery", { query: searchQuery })}{" "}
            {t("search.modal.searchTime")} {searchQuery.length > 0 ? "~" : ""}
            0.1
            {t("search.modal.seconds")}
          </span>
        </div>

        {/* 搜尋結果列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {results.map((result) => (
            <div
              key={`${result.type}-${"id" in result.data ? result.data.id : result.data.name}`}
              className="relative"
            >
              {/* 類型標籤 */}
              <div className="absolute -top-2 -right-2 z-10">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${result.type === "character" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                >
                  {result.type === "character"
                    ? t("types.character")
                    : t("types.vehicle")}
                </span>
              </div>

              {/* 渲染卡片 */}
              {result.type !== "combination" && (
                <EntityCard
                  entity={result.data}
                  maxStats={maxStats}
                  speedFilter={speedFilter}
                  handlingFilter={handlingFilter}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 預設空狀態（沒有搜尋詞）
  return (
    <div className="text-center py-8 text-muted">
      <div className="text-6xl mb-4">🎮</div>
      <p className="text-lg">{t("search.modal.startSearch")}</p>
      <p className="text-sm mt-2">{t("search.modal.supportBoth")}</p>
    </div>
  );
}
