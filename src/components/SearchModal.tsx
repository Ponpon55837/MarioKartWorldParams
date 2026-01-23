"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  SearchModalProps,
  SearchResultItem,
  CharacterStats,
  VehicleStats,
} from "@/types";
import { useDebounce } from "@/hooks/usePerformance";
import { useTranslation } from "react-i18next";
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  type SearchHistoryItem,
} from "@/utils/searchHistory";
import {
  searchModalOpenAtom,
  searchQueryAtom,
  searchResultsAtom,
  searchLoadingAtom,
  searchHistoryVisibleAtom,
  charactersAtom,
  vehiclesAtom,
  dynamicMaxStatsAtom,
  speedFilterAtom,
  handlingFilterAtom,
} from "@/store/dataAtoms";
import { SearchModalHeader } from "@/components/search/SearchModalHeader";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchHistory } from "@/components/search/SearchHistory";
import { SearchResults } from "@/components/search/SearchResults";

export default function SearchModal({ onNavigate }: SearchModalProps) {
  const { t } = useTranslation();

  // 使用全域狀態管理
  const [isOpen, setIsOpen] = useAtom(searchModalOpenAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [searchResults, setSearchResults] = useAtom(searchResultsAtom);
  const [isLoading, setIsLoading] = useAtom(searchLoadingAtom);
  const [showHistory, setShowHistory] = useAtom(searchHistoryVisibleAtom);

  // 從全域狀態獲取資料
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);
  const maxStats = useAtomValue(dynamicMaxStatsAtom);
  const speedFilter = useAtomValue(speedFilterAtom);
  const handlingFilter = useAtomValue(handlingFilterAtom);

  // 本地狀態（不需要全域管理）
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>(
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // 優化的搜尋算法 - 使用 useMemo 避免重複計算
  const searchAlgorithm = useMemo(() => {
    const calculateScore = (
      name: string,
      englishName: string,
      query: string,
    ): number => {
      const lowerQuery = query.toLowerCase();
      const lowerName = name.toLowerCase();
      const lowerEnglishName = englishName.toLowerCase();

      // 完全匹配得分最高
      if (lowerName === lowerQuery || lowerEnglishName === lowerQuery)
        return 100;

      // 開頭匹配得分較高
      if (
        lowerName.startsWith(lowerQuery) ||
        lowerEnglishName.startsWith(lowerQuery)
      )
        return 80;

      // 包含匹配得分中等
      if (
        lowerName.includes(lowerQuery) ||
        lowerEnglishName.includes(lowerQuery)
      )
        return 60;

      // 模糊匹配得分較低
      const similarity =
        calculateSimilarity(lowerQuery, lowerName) ||
        calculateSimilarity(lowerQuery, lowerEnglishName);
      return similarity * 40;
    };

    // 簡單的字符串相似度計算
    const calculateSimilarity = (str1: string, str2: string): number => {
      const len1 = str1.length;
      const len2 = str2.length;
      const maxLen = Math.max(len1, len2);

      if (maxLen === 0) return 1;

      let matches = 0;
      for (let i = 0; i < Math.min(len1, len2); i++) {
        if (str1[i] === str2[i]) matches++;
      }

      return matches / maxLen;
    };

    return { calculateScore };
  }, []);

  // 防抖搜尋函數
  const debouncedSearch = useDebounce((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      setShowHistory(true);
      return;
    }

    setIsLoading(true);
    setShowHistory(false);

    const results: SearchResultItem[] = [];

    // 搜尋角色
    const characterResults: Array<{
      type: "character";
      data: CharacterStats;
      score: number;
    }> = [];
    characters.forEach((character) => {
      const score = searchAlgorithm.calculateScore(
        character.name,
        character.englishName,
        query,
      );
      if (score > 20) {
        // 只顯示相關性較高的結果
        characterResults.push({
          type: "character",
          data: character,
          score,
        });
      }
    });

    // 搜尋載具
    const vehicleResults: Array<{
      type: "vehicle";
      data: VehicleStats;
      score: number;
    }> = [];
    vehicles.forEach((vehicle) => {
      const score = searchAlgorithm.calculateScore(
        vehicle.name,
        vehicle.englishName,
        query,
      );
      if (score > 20) {
        // 只顯示相關性較高的結果
        vehicleResults.push({
          type: "vehicle",
          data: vehicle,
          score,
        });
      }
    });

    // 合併所有結果並按相關性排序
    const allResults = [...characterResults, ...vehicleResults];
    const sortedResults = allResults.sort((a, b) => b.score - a.score);

    // 轉換為 SearchResultItem 格式並限制結果數量
    const finalResults: SearchResultItem[] = sortedResults
      .slice(0, 20)
      .map(({ score, ...result }) => result);
    setSearchResults(finalResults);
    setIsLoading(false);

    // 保存搜尋歷史
    if (finalResults.length > 0) {
      addSearchHistory(query, finalResults.length);
      setSearchHistory(getSearchHistory());
    }
  }, 300);

  // 處理搜尋輸入
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // 選擇搜尋建議
  const handleSelectSuggestion = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
    inputRef.current?.focus();
  };

  // 處理移除歷史項目
  const handleRemoveHistoryItem = (query: string) => {
    removeSearchHistoryItem(query);
    setSearchHistory(getSearchHistory());
  };

  // 清空搜尋
  const clearSearch = React.useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsLoading(false);
    setShowHistory(true);
  }, [setSearchQuery, setSearchResults, setIsLoading, setShowHistory]);

  // 關閉模態框
  const handleClose = React.useCallback(() => {
    clearSearch();
    setShowHistory(false);
    setIsOpen(false);
  }, [clearSearch, setShowHistory, setIsOpen]);

  // 載入搜尋歷史
  useEffect(() => {
    if (isOpen) {
      setSearchHistory(getSearchHistory());
      setShowHistory(true);
    }
  }, [isOpen, setShowHistory]);

  // 鍵盤事件處理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      // 防止背景滾動
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      // 自動聚焦到搜尋輸入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // 恢復背景滾動
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // 清理時恢復滾動
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  // 點擊背景關閉
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 w-screen h-screen m-0 p-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="theme-card rounded-lg shadow-2xl w-full max-w-4xl my-4 mx-4 overflow-hidden min-h-[400px] max-h-[calc(100vh-2rem)]">
        {/* 搜尋標題列 */}
        <SearchModalHeader onClose={handleClose} />

        {/* 搜尋輸入框 */}
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={clearSearch}
          isLoading={isLoading}
          inputRef={inputRef}
        />

        {/* 搜尋結果區域 */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {showHistory && !searchQuery ? (
            <SearchHistory
              history={searchHistory}
              onSelectItem={handleSelectSuggestion}
              onRemoveItem={handleRemoveHistoryItem}
            />
          ) : (
            <SearchResults
              results={searchResults}
              searchQuery={searchQuery}
              maxStats={maxStats}
              speedFilter={speedFilter}
              handlingFilter={handlingFilter}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* 底部操作區域 */}
        <div className="border-t border-border p-3 sm:p-4 bg-muted sticky bottom-0">
          {/* 導航按鈕 */}
          {onNavigate && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <button
                onClick={() => {
                  onNavigate("characters");
                  handleClose();
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
              >
                {t("search.modal.viewAllCharacters")}
              </button>
              <button
                onClick={() => {
                  onNavigate("vehicles");
                  handleClose();
                }}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
              >
                {t("search.modal.viewAllVehicles")}
              </button>
              <button
                onClick={() => {
                  onNavigate("recommendations");
                  handleClose();
                }}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-sm"
              >
                {t("search.modal.recommendedCombos")}
              </button>
            </div>
          )}

          {/* 快捷鍵說明 */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted">
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 mb-2 sm:mb-0">
              <span className="text-xs mb-1 sm:mb-0">
                {t("search.modal.supportHint")}
              </span>
              <div className="flex items-center space-x-1">
                <kbd className="px-1 sm:px-2 py-1 theme-input border border-border rounded text-foreground font-mono text-xs">
                  Escape
                </kbd>
                <span className="text-xs">{t("search.modal.escClose")}</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="flex items-center space-x-1">
                <kbd className="px-1 sm:px-2 py-1 theme-input border border-border rounded text-foreground font-mono text-xs">
                  Ctrl
                </kbd>
                <span className="text-xs">+</span>
                <kbd className="px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">
                  K
                </kbd>
                <span className="text-xs">{t("search.modal.ctrlKOpen")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
