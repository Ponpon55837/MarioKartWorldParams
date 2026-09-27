/**
 * 搜尋歷史管理工具
 */

const SEARCH_HISTORY_KEY = "mario-kart-search-history";
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
  if (typeof window === "undefined") return [];

  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed: unknown = history ? JSON.parse(history) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 添加搜尋歷史
 */
/**
 * 添加搜尋歷史（最近使用優先，LRU 概念）
 * 已存在的查詢會移到最前面，超過上限時淘汰最舊的項目
 * @returns 更新後的歷史列表，呼叫端無需再次讀取 localStorage
 */
export function addSearchHistory(
  query: string,
  resultCount: number,
): SearchHistoryItem[] {
  if (typeof window === "undefined" || !query.trim()) return getSearchHistory();

  const history = getSearchHistory();
  const newHistory = [
    { query, timestamp: Date.now(), resultCount },
    ...history.filter((item) => item.query !== query),
  ].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save search history:", error);
  }
  return newHistory;
}

/**
 * 清除搜尋歷史
 */
export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear search history:", error);
  }
}

/**
 * 移除特定搜尋歷史項目
 */
export function removeSearchHistoryItem(query: string): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];

  const newHistory = getSearchHistory().filter((item) => item.query !== query);
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to remove search history item:", error);
  }
  return newHistory;
}
