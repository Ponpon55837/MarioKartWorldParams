import type { CharacterStats, SearchResultItem, VehicleStats } from "@/types";
import { topK } from "@/utils/heap";

/** 搜尋結果上限 */
export const SEARCH_RESULT_LIMIT = 20;

/** 相關性門檻：分數需大於此值才會顯示 */
export const SEARCH_MIN_SCORE = 20;

const SCORE = {
  EXACT: 100,
  PREFIX: 80,
  CONTAINS: 60,
  FUZZY_WEIGHT: 40,
} as const;

/**
 * 搜尋索引項目
 * 預先將名稱轉成小寫，查詢時不必對每個實體重複 toLowerCase。
 */
export interface SearchIndexEntry {
  item: SearchResultItem;
  name: string;
  englishName: string;
}

/**
 * 建立搜尋索引（資料變更時重建一次，O(n)）
 */
export const buildSearchIndex = (
  characters: readonly CharacterStats[],
  vehicles: readonly VehicleStats[],
): SearchIndexEntry[] => {
  const index: SearchIndexEntry[] = [];

  for (const data of characters) {
    index.push({
      item: { type: "character", data },
      name: data.name.toLowerCase(),
      englishName: data.englishName.toLowerCase(),
    });
  }
  for (const data of vehicles) {
    index.push({
      item: { type: "vehicle", data },
      name: data.name.toLowerCase(),
      englishName: data.englishName.toLowerCase(),
    });
  }

  return index;
};

/**
 * 逐位比對相似度：相同位置字元相符的比例
 * 時間 O(min(m, n))
 */
const positionalSimilarity = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  const minLen = Math.min(a.length, b.length);
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    if (a.charCodeAt(i) === b.charCodeAt(i)) matches++;
  }
  return matches / maxLen;
};

/**
 * 計算單一名稱的相關性分數（query 需為小寫）
 */
const scoreName = (name: string, query: string): number => {
  if (name === query) return SCORE.EXACT;
  if (name.startsWith(query)) return SCORE.PREFIX;
  if (name.includes(query)) return SCORE.CONTAINS;
  return positionalSimilarity(query, name) * SCORE.FUZZY_WEIGHT;
};

/**
 * 計算索引項目的相關性分數：取中文名與英文名兩者的最高分
 */
export const scoreEntry = (entry: SearchIndexEntry, query: string): number =>
  Math.max(scoreName(entry.name, query), scoreName(entry.englishName, query));

interface ScoredEntry {
  item: SearchResultItem;
  score: number;
  order: number;
}

/**
 * 搜尋角色與載具
 *
 * 使用大小為 limit 的堆積取 Top-K（LeetCode 347 模式），
 * 時間 O(n log K)，同分時保持索引中的原始順序。
 */
export const searchEntities = (
  index: readonly SearchIndexEntry[],
  rawQuery: string,
  limit: number = SEARCH_RESULT_LIMIT,
  minScore: number = SEARCH_MIN_SCORE,
): SearchResultItem[] => {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const candidates: ScoredEntry[] = [];
  index.forEach((entry, order) => {
    const score = scoreEntry(entry, query);
    if (score > minScore) candidates.push({ item: entry.item, score, order });
  });

  return topK(
    candidates,
    limit,
    (a, b) => b.score - a.score || a.order - b.order,
  ).map(({ item }) => item);
};
