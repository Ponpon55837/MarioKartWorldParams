import { atomWithStorage } from 'jotai/utils';
import { CombinationStats } from '@/types';

/**
 * 組合資料 atom
 * 使用 atomWithStorage 自動處理 localStorage 持久化
 * - 自動同步到 localStorage
 * - 自動處理 SSR（伺服器端渲染）場景
 * - 頁面重載時自動恢復資料
 */
export const combinationsAtom = atomWithStorage<CombinationStats[]>('mario-kart-combinations', []);
