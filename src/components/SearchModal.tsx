import React, { useState, useEffect, useRef } from 'react';
import { CharacterStats, VehicleStats } from '@/types';
import CharacterCard from './CharacterCard';
import VehicleCard from './VehicleCard';
import { useDebounce } from '@/hooks/usePerformance';
import { 
  getSearchHistory, 
  addSearchHistory, 
  removeSearchHistoryItem,
  type SearchHistoryItem 
} from '@/utils/searchHistory';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterStats[];
  vehicles: VehicleStats[];
  maxStats: {
    speed: number;
    acceleration: number;
    weight: number;
    handling: number;
  };
  speedFilter: any;
  handlingFilter: any;
  onNavigate?: (type: 'characters' | 'vehicles') => void;
}

interface SearchResult {
  type: 'character' | 'vehicle';
  item: CharacterStats | VehicleStats;
  score: number;
}

export default function SearchModal({
  isOpen,
  onClose,
  characters,
  vehicles,
  maxStats,
  speedFilter,
  handlingFilter,
  onNavigate
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 計算搜尋相關性分數
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
    characters.forEach(character => {
      const score = calculateScore(character.name, character.englishName, query);
      if (score > 20) { // 只顯示相關性較高的結果
        results.push({
          type: 'character',
          item: character,
          score
        });
      }
    });

    // 搜尋載具
    vehicles.forEach(vehicle => {
      const score = calculateScore(vehicle.name, vehicle.englishName, query);
      if (score > 20) { // 只顯示相關性較高的結果
        results.push({
          type: 'vehicle',
          item: vehicle,
          score
        });
      }
    });

    // 按相關性排序
    results.sort((a, b) => b.score - a.score);
    
    // 限制結果數量
    const finalResults = results.slice(0, 20);
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
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsLoading(false);
    setShowHistory(true);
  };

  // 關閉模態框
  const handleClose = () => {
    clearSearch();
    setShowHistory(false);
    onClose();
  };

  // 載入搜尋歷史
  useEffect(() => {
    if (isOpen) {
      setSearchHistory(getSearchHistory());
      setShowHistory(true);
    }
  }, [isOpen]);

  // 鍵盤事件處理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSearch();
        onClose();
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
  }, [isOpen, onClose]);

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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">🔍 搜尋角色與載具</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
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
              placeholder="輸入角色或載具名稱..."
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mario-blue focus:border-transparent text-sm sm:text-base"
            />
            <div className="absolute right-3 top-3">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mario-blue"></div>
              ) : searchQuery ? (
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">🕐 最近搜尋</h3>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        <button
                          onClick={() => handleSelectSuggestion(item.query)}
                          className="flex-1 text-left px-3 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium">{item.query}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {item.resultCount} 個結果
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
                    <p className="font-medium mb-1">搜尋技巧：</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 支援中文和英文名稱搜尋</li>
                      <li>• 可以搜尋部分名稱，如「瑪利」會找到「瑪利歐」</li>
                      <li>• 搜尋結果會按相關性排序</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : !searchQuery ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-lg">開始輸入來搜尋角色或載具</p>
              <p className="text-sm mt-2">支援中文名稱和英文名稱搜尋</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mario-blue mx-auto mb-4"></div>
              <p className="text-gray-500">正在搜尋...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🤔</div>
              <p className="text-lg">找不到「{searchQuery}」的結果</p>
              <p className="text-sm mt-2">試試其他關鍵字，或檢查拼寫</p>
              <div className="mt-4 text-xs text-gray-400">
                <p>搜尋技巧：</p>
                <p>• 嘗試使用更短的關鍵字</p>
                <p>• 使用中文或英文名稱</p>
                <p>• 檢查是否有拼寫錯誤</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 搜尋結果統計 */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>找到 {searchResults.length} 個結果</span>
                <span className="text-xs">
                  搜尋「{searchQuery}」用時 {searchQuery.length > 0 ? '~' : ''}0.1秒
                </span>
              </div>

              {/* 搜尋結果列表 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {searchResults.map((result, index) => (
                  <div key={`${result.type}-${index}`} className="relative">
                    {/* 類型標籤 */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.type === 'character' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.type === 'character' ? '角色' : '載具'}
                      </span>
                    </div>

                    {/* 渲染卡片 */}
                    {result.type === 'character' ? (
                      <CharacterCard
                        character={result.item as CharacterStats}
                        maxStats={maxStats}
                        speedFilter={speedFilter}
                        handlingFilter={handlingFilter}
                      />
                    ) : (
                      <VehicleCard
                        vehicle={result.item as VehicleStats}
                        maxStats={maxStats}
                        speedFilter={speedFilter}
                        handlingFilter={handlingFilter}
                      />
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
                查看所有角色
              </button>
              <button
                onClick={() => {
                  onNavigate('vehicles');
                  handleClose();
                }}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
              >
                查看所有載具
              </button>
            </div>
          )}
          
          {/* 快捷鍵說明 */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 mb-2 sm:mb-0">
              <span className="text-xs mb-1 sm:mb-0">💡 支援中文和英文名稱搜尋</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">Esc</kbd>
                <span className="text-xs">關閉</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="flex items-center space-x-1">
                <kbd className="px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">Ctrl</kbd>
                <span className="text-xs">+</span>
                <kbd className="px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-xs">K</kbd>
                <span className="text-xs">開啟搜尋</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
