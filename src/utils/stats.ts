import { STAT_KEYS } from "@/types";
import type {
  EntityStats,
  HandlingFilter,
  SpeedFilter,
  StatKey,
  StatRecord,
  StatType,
  SummaryMaxStats,
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
 * 依篩選器從欄位最大值中取出四大能力值的最大值
 */
export const pickSummaryMax = (
  maxima: StatRecord,
  speedFilter: SpeedFilter,
  handlingFilter: HandlingFilter,
): SummaryMaxStats => ({
  speed: maxima[SPEED_KEY_BY_FILTER[speedFilter]],
  acceleration: maxima.acceleration,
  weight: maxima.weight,
  handling: maxima[HANDLING_KEY_BY_FILTER[handlingFilter]],
});

/**
 * 依指定欄位由高到低排序（Decorate-Sort-Undecorate）
 *
 * 先一次性取出排序鍵，避免 comparator 內重複查找；
 * 同分時保持原始順序（穩定排序）。時間 O(n log n)。
 */
export const sortByStatDesc = <T extends EntityStats>(
  entities: readonly T[],
  key: StatKey,
): T[] => {
  if (entities.length <= 1) return entities.slice();

  const decorated = entities.map((entity, index) => ({
    entity,
    index,
    value: entity[key],
  }));

  decorated.sort((a, b) => b.value - a.value || a.index - b.index);

  return decorated.map((item) => item.entity);
};

/**
 * 計算進度條百分比（四捨五入）
 */
export const getStatPercentage = (value: number, maxValue: number): number =>
  maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

/**
 * 計算統計條寬度（最小寬度 MIN_PROGRESS_WIDTH%）
 * @example getStatBarWidth(7, 10) // "70%"
 */
export const getStatBarWidth = (value: number, maxValue: number): string =>
  `${Math.max(getStatPercentage(value, maxValue), APP_CONSTANTS.MIN_PROGRESS_WIDTH)}%`;
