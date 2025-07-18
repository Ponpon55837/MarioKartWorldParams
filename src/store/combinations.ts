import { atom } from 'jotai';
import { CombinationStats } from '@/types';

// 安全的 localStorage 操作
const getStoredCombinations = (): CombinationStats[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem('mario-kart-combinations');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('讀取 localStorage 失敗:', error);
  }
  
  return [];
};

const setStoredCombinations = (combinations: CombinationStats[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('mario-kart-combinations', JSON.stringify(combinations));
  } catch (error) {
    console.error('儲存到 localStorage 失敗:', error);
  }
};

// 基礎組合 atom
const baseCombinationsAtom = atom<CombinationStats[]>([]);

// 初始化 atom，只在客戶端執行
const initCombinationsAtom = atom(
  null,
  (get, set) => {
    if (typeof window !== 'undefined') {
      const stored = getStoredCombinations();
      set(baseCombinationsAtom, stored);
    }
  }
);

// 持久化組合 atom（讀寫分離）
export const combinationsAtom = atom(
  (get) => {
    // 確保初始化
    if (typeof window !== 'undefined') {
      const current = get(baseCombinationsAtom);
      if (current.length === 0) {
        const stored = getStoredCombinations();
        if (stored.length > 0) {
          return stored;
        }
      }
    }
    return get(baseCombinationsAtom);
  },
  (get, set, newCombinations: CombinationStats[]) => {
    set(baseCombinationsAtom, newCombinations);
    setStoredCombinations(newCombinations);
  }
);

// 初始化組合資料
export const initializeCombinationsAtom = initCombinationsAtom;
