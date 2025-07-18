/**
 * 搜尋歷史管理工具
 */

const SEARCH_HISTORY_KEY = 'mario-kart-search-history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

/**
 * 獲取搜尋歷史
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

/**
 * 添加搜尋歷史
 */
export function addSearchHistory(query: string, resultCount: number): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const history = getSearchHistory();
    
    // 移除重複項目
    const filteredHistory = history.filter(item => item.query !== query);
    
    // 添加新項目到開頭
    const newHistory = [
      { query, timestamp: Date.now(), resultCount },
      ...filteredHistory
    ].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * 清除搜尋歷史
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * 移除特定搜尋歷史項目
 */
export function removeSearchHistoryItem(query: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getSearchHistory();
    const newHistory = history.filter(item => item.query !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to remove search history item:', error);
  }
}
