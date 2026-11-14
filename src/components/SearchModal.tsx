"use client";

import React, { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { EntityKind } from "@/types";
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
  searchIndexAtom,
  focusEntityAtom,
} from "@/store/dataAtoms";
import { SearchModalHeader } from "@/components/search/SearchModalHeader";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchHistory } from "@/components/search/SearchHistory";
import { SearchResults } from "@/components/search/SearchResults";
import { searchEntities } from "@/utils/search";

export function SearchModal() {
  const { t } = useTranslation();

  // 使用全域狀態管理
  const [isOpen, setIsOpen] = useAtom(searchModalOpenAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [searchResults, setSearchResults] = useAtom(searchResultsAtom);
  const [isLoading, setIsLoading] = useAtom(searchLoadingAtom);
  const [showHistory, setShowHistory] = useAtom(searchHistoryVisibleAtom);

  // 從全域狀態獲取資料
  const searchIndex = useAtomValue(searchIndexAtom);
  const focusEntity = useSetAtom(focusEntityAtom);

  // 本地狀態（不需要全域管理）
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>(
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // 防抖搜尋：搜尋邏輯與索引皆在 utils/search.ts 與 searchIndexAtom 中
  const debouncedSearch = useDebounce((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      setShowHistory(true);
      return;
    }

    setShowHistory(false);

    const results = searchEntities(searchIndex, query);
    setSearchResults(results);
    setIsLoading(false);

    // 保存搜尋歷史
    if (results.length > 0) {
      setSearchHistory(addSearchHistory(query, results.length));
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
    setSearchHistory(removeSearchHistoryItem(query));
  };

  // 清空搜尋（同時取消尚未執行的防抖搜尋，避免舊結果覆蓋）
  const clearSearch = React.useCallback(() => {
    debouncedSearch.cancel();
    setSearchQuery("");
    setSearchResults([]);
    setIsLoading(false);
    setShowHistory(true);
  }, [
    debouncedSearch,
    setSearchQuery,
    setSearchResults,
    setIsLoading,
    setShowHistory,
  ]);

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

  // 選擇結果：切到對應頁面並聚焦該角色／載具
  const handleSelect = (kind: EntityKind, name: string) => {
    focusEntity({ kind, name });
    handleClose();
  };

  // ⌘K / Ctrl+K 開啟搜尋
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [setIsOpen]);

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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-scrim/55 p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border-2 border-ink bg-card shadow-stage"
      >
        <SearchModalHeader onClose={handleClose} />
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={clearSearch}
          inputRef={inputRef}
        />
        <div className="flex-1 overflow-y-auto p-4">
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
              isLoading={isLoading}
              onSelect={handleSelect}
            />
          )}
        </div>
        <p className="flex items-center gap-2 border-t-2 border-line px-4 py-2.5 text-xs text-muted">
          <kbd className="rounded border border-b-2 border-line-strong bg-raised px-1.5 font-mono">
            Esc
          </kbd>
          {t("search.modal.escClose")}
        </p>
      </div>
    </div>
  );
}
