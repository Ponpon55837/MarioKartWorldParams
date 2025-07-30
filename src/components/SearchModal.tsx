import React, { useEffect, useRef, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { SearchModalProps, SearchResult, CharacterStats, VehicleStats } from '@/types';
import CharacterCard from '@/components/CharacterCard';
import VehicleCard from '@/components/VehicleCard';
import { useDebounce } from '@/hooks/usePerformance';
import { useTranslation } from 'react-i18next';
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem, type SearchHistoryItem } from '@/utils/searchHistory';
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
  handlingFilterAtom
} from '@/store/dataAtoms';

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
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 優化的搜尋算法 - 使用 useMemo 避免重複計算
  const searchAlgorithm = useMemo(() => {
    const calculateScore = (name: string, englishName: string, query: string): number => {
      const lowerQuery = query.toLowerCase();
      const lowerName = name.toLowerCase();
      const lowerEnglishName = englishName.toLowerCase();

      // 完全匹配得分最高
      if (lowerName === lowerQuery || lowerEnglishName === lowerQuery) return 100;

      // 開頭匹配得分較高
      if (lowerName.startsWith(lowerQuery) || lowerEnglishName.startsWith(lowerQuery)) return 80;

      // 包含匹配得分中等
      if (lowerName.includes(lowerQuery) || lowerEnglishName.includes(lowerQuery)) return 60;

      // 模糊匹配得分較低
      const similarity = calculateSimilarity(lowerQuery, lowerName) || calculateSimilarity(lowerQuery, lowerEnglishName);
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

    const results: SearchResult[] = [];

    // 搜尋角色
    characters.forEach((character) => {
      const score = searchAlgorithm.calculateScore(character.name, character.englishName, query);
      if (score > 20) {
        // 只顯示相關性較高的結果
        results.push({
          type: 'character',
          data: character,
          score
        });
      }
    });

    // 搜尋載具
    vehicles.forEach((vehicle) => {
      const score = searchAlgorithm.calculateScore(vehicle.name, vehicle.englishName, query);
      if (score > 20) {
        // 只顯示相關性較高的結果
        results.push({
          type: 'vehicle',
          data: vehicle,
          score
        });
      }
    });

    // 按相關性排序
    results.sort((a, b) => b.score - a.score);

    // 限制結果數量
    const limitedResults = results.slice(0, 20);

    // 轉換為符合 SearchResultItem 格式
    const finalResults = limitedResults.map((result) => ({
      type: result.type,
      data: result.data
    }));
    setSearchResults(finalResults);
    setIsLoading(false);

    // 保存搜尋歷史
    if (finalResults.length > 0) {
      addSearchHistory(query, finalResults.length);
      setSearchHistory(getSearchHistory());
    }
  }, 300);

  // 處理搜尋輸入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // 選擇搜尋建議
  const handleSelectSuggestion = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
    inputRef.current?.focus();
  };

  // 清空搜尋
  const clearSearch = React.useCallback(() => {
    setSearchQuery('');
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
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      // 防止背景滾動
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      // 自動聚焦到搜尋輸入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // 恢復背景滾動
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 清理時恢復滾動
      document.body.style.overflow = 'unset';
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
      className="fixed bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-4 mx-4 overflow-hidden min-h-[400px] max-h-[calc(100vh-2rem)]">
        {/* 搜尋標題列 */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t('search.modal.title')}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 搜尋輸入框 */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white sticky top-12 sm:top-16 z-10">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('search.inputPlaceholder')}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mario-blue focus:border-transparent text-sm sm:text-base"
            />
            <div className="absolute right-3 top-3">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mario-blue"></div>
              ) : searchQuery ? (
                <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* 搜尋結果 */}
        <div className="p-3 sm:p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
          {showHistory && !searchQuery ? (
            <div className="space-y-4">
              {/* 搜尋歷史 */}
              {searchHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('search.modal.recentSearches')}</h3>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        <button onClick={() => handleSelectSuggestion(item.query)} className="flex-1 text-left px-3 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                          <span className="font-medium">{item.query}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {item.resultCount} {t('search.modal.resultsCount')}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            removeSearchHistoryItem(item.query);
                            setSearchHistory(getSearchHistory());
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 使用提示 */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 text-sm">💡</span>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">{t('search.modal.searchTips')}</p>
                    <ul className="space-y-1 text-xs">
                      <li>{t('search.modal.tip1')}</li>
                      <li>{t('search.modal.tip2')}</li>
                      <li>{t('search.modal.tip3')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : !searchQuery ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-lg">{t('search.modal.startSearch')}</p>
              <p className="text-sm mt-2">{t('search.modal.supportBoth')}</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mario-blue mx-auto mb-4"></div>
              <p className="text-gray-500">{t('search.loading')}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🤔</div>
              <p className="text-lg">{t('search.modal.noResultsFor', { query: searchQuery })}</p>
              <p className="text-sm mt-2">{t('search.modal.tryOther')}</p>
              <div className="mt-4 text-xs text-gray-400">
                <p>{t('search.modal.searchTipTitle')}</p>
                <p>{t('search.modal.searchTip1')}</p>
                <p>{t('search.modal.searchTip2')}</p>
                <p>{t('search.modal.searchTip3')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 搜尋結果統計 */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{t('search.modal.foundResults', { count: searchResults.length })}</span>
                <span className="text-xs">
                  {t('search.modal.searchQuery', { query: searchQuery })} {t('search.modal.searchTime')} {searchQuery.length > 0 ? '~' : ''}0.1{t('search.modal.seconds')}
                </span>
              </div>

              {/* 搜尋結果列表 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {searchResults.map((result, index) => (
                  <div key={`${result.type}-${index}`} className="relative">
                    {/* 類型標籤 */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${result.type === 'character' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {result.type === 'character' ? t('types.character') : t('types.vehicle')}
                      </span>
                    </div>

                    {/* 渲染卡片 */}
                    {result.type === 'character' ? (
                      <CharacterCard character={result.data as CharacterStats} maxStats={maxStats} speedFilter={speedFilter} handlingFilter={handlingFilter} />
                    ) : (
                      <VehicleCard vehicle={result.data as VehicleStats} maxStats={maxStats} speedFilter={speedFilter} handlingFilter={handlingFilter} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作區域 */}
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 sticky bottom-0">
          {/* 導航按鈕 */}
          {onNavigate && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <button
                onClick={() => {
                  onNavigate('characters');
                  handleClose();
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
              >
                {t('search.modal.viewAllCharacters')}
              </button>
              <button
                onClick={() => {
                  onNavigate('vehicles');
                  handleClose();
                }}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
              >
                {t('search.modal.viewAllVehicles')}
              </button>
              <button
                onClick={() => {
                  onNavigate('recommendations');
                  handleClose();
                }}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-sm"
              >
                {t('search.modal.recommendedCombos')}
              </button>
            </div>
          )}

          {/* 快捷鍵說明 */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 mb-2 sm:mb-0">
              <span className="text-xs mb-1 sm:mb-0">{t('search.modal.supportHint')}</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">Esc</kbd>
                <span className="text-xs">{t('search.modal.escClose')}</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="flex items-center space-x-1">
                <kbd className="px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">Ctrl</kbd>
                <span className="text-xs">+</span>
                <kbd className="px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">K</kbd>
                <span className="text-xs">{t('search.modal.ctrlKOpen')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
