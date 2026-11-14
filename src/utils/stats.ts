import { STAT_KEYS } from "@/types";
import type {
  HandlingFilter,
  SpeedFilter,
  StatKey,
  StatRecord,
  StatType,
} from "@/types";
import { APP_CONSTANTS } from "@/constants";

// ==========================================
// 查表（Hash Map）取代 switch 分支
// ==========================================

/** 速度篩選器 → 能力值欄位 */
export const SPEED_KEY_BY_FILTER: Readonly<Record<SpeedFilter, StatKey>> = {
  display: "displaySpeed",
  road: "roadSpeed",
  terrain: "terrainSpeed",
  water: "waterSpeed",
};

/** 操控性篩選器 → 能力值欄位 */
export const HANDLING_KEY_BY_FILTER: Readonly<Record<HandlingFilter, StatKey>> =
  {
    display: "displayHandling",
    road: "roadHandling",
    terrain: "terrainHandling",
    water: "waterHandling",
  };

/**
 * 依排序類型與篩選器取得對應的能力值欄位（O(1) 查表）
 */
export const getSortKey = (
  sortBy: StatType,
  speedFilter: SpeedFilter,
  handlingFilter: HandlingFilter,
): StatKey => {
  switch (sortBy) {
    case "speed":
      return SPEED_KEY_BY_FILTER[speedFilter];
    case "handling":
      return HANDLING_KEY_BY_FILTER[handlingFilter];
    default:
      return sortBy;
  }
};

// ==========================================
// 計算函數
// ==========================================

/**
 * 計算角色 + 載具的組合能力值（含遊戲加成）
 * 單一迴圈走訪所有欄位，O(k)，k = 欄位數
 */
export const combineStats = (
  character: StatRecord,
  vehicle: StatRecord,
  bonus: number = APP_CONSTANTS.COMBINATION_BONUS,
): StatRecord => {
  const combined = {} as StatRecord;
  for (const key of STAT_KEYS) {
    combined[key] = character[key] + vehicle[key] + bonus;
  }
  return combined;
};

/**
 * 單次走訪計算多組實體的每個欄位最大值
 * 時間 O(n·k)，空間 O(k)；最小值為 1 以避免除以 0
 */
export const computeFieldMaxima = (
  ...groups: ReadonlyArray<readonly StatRecord[]>
): StatRecord => {
  const maxima = {} as StatRecord;
  for (const key of STAT_KEYS) maxima[key] = 1;

  for (const group of groups) {
    for (const entity of group) {
      for (const key of STAT_KEYS) {
        if (entity[key] > maxima[key]) maxima[key] = entity[key];
      }
    }
  }
  return maxima;
};

/**
 * 計算進度條百分比（四捨五入）
 */
export const getStatPercentage = (value: number, maxValue: number): number =>
  maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
