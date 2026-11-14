import { STAT_KEYS } from "@/types";
import type {
  EntityStats,
  PlayStyle,
  SpeedFilter,
  Standing,
  StatGroup,
  StatKey,
  StatRecord,
  StatTraits,
  StatType,
  TerrainType,
  WeightClass,
} from "@/types";
import {
  HANDLING_KEY_BY_FILTER,
  SPEED_KEY_BY_FILTER,
  getSortKey,
} from "@/utils/stats";
import { TERRAINS } from "@/utils/recommendation";

// ==========================================
// 設定
// ==========================================

/** 雷達圖與卡片使用的四個能力軸（順時針：上、右、下、左） */
export const PROFILE_AXES: readonly StatType[] = [
  "speed",
  "acceleration",
  "weight",
  "handling",
];

/** 速度與加速度相差達此值時判定為速度型或加速型 */
const PLAY_STYLE_GAP = 3;

/** 強項門檻 60%、弱項門檻 30%（以十分比整數比較，避免浮點誤差） */
const STRONG_TENTHS = 6;
const WEAK_TENTHS = 3;
const MAX_TRAITS = 2;

// ==========================================
// 分類
// ==========================================

export const getPlayStyle = (stats: StatRecord): PlayStyle => {
  const gap = stats.displaySpeed - stats.acceleration;
  if (gap >= PLAY_STYLE_GAP) return "speed";
  if (gap <= -PLAY_STYLE_GAP) return "acceleration";
  return "balanced";
};

/** 重量三等分：比例 < 1/3 為輕量、< 2/3 為中量，其餘為重量（整數運算） */
export const getWeightClass = (
  weight: number,
  maxWeight: number,
): WeightClass => {
  if (weight * 3 < maxWeight) return "light";
  if (weight * 3 < maxWeight * 2) return "medium";
  return "heavy";
};

/** 能力值簽章：所有欄位依固定順序串接，數值相同即簽章相同 */
export const statSignature = (stats: StatRecord): string =>
  STAT_KEYS.map((key) => stats[key]).join(",");

/**
 * 把數值完全相同的實體合併成群組（Hash Map 分組，O(n·k)）
 *
 * 群組依重量遞增、加速度遞減排序；Array.prototype.sort 為穩定排序，
 * 同分時保留資料中首次出現的順序。
 */
export const groupByStats = <T extends EntityStats>(
  entities: readonly T[],
): StatGroup<T>[] => {
  let maxWeight = 1;
  const membersByKey = new Map<string, T[]>();

  for (const entity of entities) {
    if (entity.weight > maxWeight) maxWeight = entity.weight;

    const key = statSignature(entity);
    const members = membersByKey.get(key);
    if (members) members.push(entity);
    else membersByKey.set(key, [entity]);
  }

  const groups: StatGroup<T>[] = [];
  for (const [key, members] of membersByKey) {
    const lead = members[0];
    groups.push({
      key,
      lead,
      members,
      playStyle: getPlayStyle(lead),
      weightClass: getWeightClass(lead.weight, maxWeight),
    });
  }

  return groups.sort(
    (a, b) =>
      a.lead.weight - b.lead.weight || b.lead.acceleration - a.lead.acceleration,
  );
};

// ==========================================
// 強弱項與賽道
// ==========================================

/** 依賽道篩選器取得某能力軸的欄位 */
export const axisKey = (axis: StatType, filter: SpeedFilter): StatKey =>
  getSortKey(axis, filter, filter);

/** 依賽道篩選器取出四個能力軸的數值（雷達圖使用） */
export const axisValues = (stats: StatRecord, filter: SpeedFilter): number[] =>
  PROFILE_AXES.map((axis) => stats[axisKey(axis, filter)]);

/**
 * 挑出最多兩個強項（≥ 60%）與兩個弱項（≤ 30%）
 *
 * 比例以交叉相乘比較（a/m₁ vs b/m₂ ⇔ a·m₂ vs b·m₁），全程整數運算。
 */
export const getTraits = (
  stats: StatRecord,
  maxima: StatRecord,
  filter: SpeedFilter,
): StatTraits => {
  const ranked = PROFILE_AXES.map((axis) => {
    const key = axisKey(axis, filter);
    return { axis, value: stats[key], max: maxima[key] };
  }).sort((a, b) => b.value * a.max - a.value * b.max);

  const strong = ranked
    .filter(({ value, max }) => value * 10 >= max * STRONG_TENTHS)
    .slice(0, MAX_TRAITS)
    .map(({ axis }) => axis);

  const weak = ranked
    .filter(({ value, max }) => value * 10 <= max * WEAK_TENTHS)
    .slice(-MAX_TRAITS)
    .map(({ axis }) => axis);

  return { strong, weak };
};

/** 取分數最高的賽道；同分時依 TERRAINS 順序取第一個 */
const argmaxTerrain = (score: (terrain: TerrainType) => number) => {
  let best = TERRAINS[0];
  let bestScore = score(best);
  for (const terrain of TERRAINS.slice(1)) {
    const value = score(terrain);
    if (value > bestScore) {
      best = terrain;
      bestScore = value;
    }
  }
  return best;
};

/** 速度最快的賽道（角色、載具焦點區使用） */
export const getFastestTerrain = (stats: StatRecord): TerrainType =>
  argmaxTerrain((terrain) => stats[SPEED_KEY_BY_FILTER[terrain]]);

/** 最適合的賽道：速度權重 2、操控權重 1（組合使用） */
export const getBestTerrain = (stats: StatRecord): TerrainType =>
  argmaxTerrain(
    (terrain) =>
      2 * stats[SPEED_KEY_BY_FILTER[terrain]] +
      stats[HANDLING_KEY_BY_FILTER[terrain]],
  );

// ==========================================
// 組合間比較
// ==========================================

/**
 * 標出每個組合在各欄位是否為「唯一最高」或「唯一最低」
 *
 * 每個欄位單次走訪記錄最大值、最小值與出現次數，O(n·k)，
 * 取代對每個組合再掃描其他組合的 O(n²·k) 寫法。
 */
export const compareStandings = (
  statsList: readonly StatRecord[],
  keys: readonly StatKey[],
): Standing[][] => {
  const standings: Standing[][] = statsList.map(() => keys.map(() => null));
  if (statsList.length < 2) return standings;

  keys.forEach((key, column) => {
    let max = -Infinity;
    let min = Infinity;
    let maxCount = 0;
    let minCount = 0;

    for (const stats of statsList) {
      const value = stats[key];
      if (value > max) {
        max = value;
        maxCount = 1;
      } else if (value === max) {
        maxCount++;
      }
      if (value < min) {
        min = value;
        minCount = 1;
      } else if (value === min) {
        minCount++;
      }
    }

    if (max === min) return;
    statsList.forEach((stats, row) => {
      if (stats[key] === max && maxCount === 1) standings[row][column] = "best";
      else if (stats[key] === min && minCount === 1)
        standings[row][column] = "worst";
    });
  });

  return standings;
};
