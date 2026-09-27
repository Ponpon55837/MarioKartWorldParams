import type {
  CharacterStats,
  EntityStats,
  RecommendationResult,
  RecommendedCombination,
  StatKey,
  SummaryMaxStats,
  TerrainType,
  VehicleStats,
} from "@/types";
import { BinaryHeap } from "@/utils/heap";

// ==========================================
// 推薦演算法設定
// ==========================================

export const TERRAINS: readonly TerrainType[] = ["road", "terrain", "water"];

/** 每個地形推薦的組合數量 */
export const RECOMMENDATION_LIMIT = 10;

/** 同一載具在單一地形最多出現的次數（多樣性控制） */
export const MAX_SAME_VEHICLE = 3;

/**
 * 綜合評分權重（放大 10 倍的整數）
 *
 * 評分 = 速度 × 0.4 + 操控性 × 0.3 + 加速度 × 0.2 − 重量 × 0.1
 * 以整數運算避免浮點誤差，比較同分時結果穩定；顯示時再除以 SCORE_SCALE。
 */
const SCORE_WEIGHTS = {
  speed: 4,
  handling: 3,
  acceleration: 2,
  weight: -1,
} as const;
const SCORE_SCALE = 10;

const TERRAIN_KEYS: Readonly<
  Record<TerrainType, { speed: StatKey; handling: StatKey }>
> = {
  road: { speed: "roadSpeed", handling: "roadHandling" },
  terrain: { speed: "terrainSpeed", handling: "terrainHandling" },
  water: { speed: "waterSpeed", handling: "waterHandling" },
};

// ==========================================
// 核心演算法
// ==========================================

interface RankedEntity<T extends EntityStats> {
  entity: T;
  /** 在原始陣列中的位置，用於同分時的穩定排序 */
  index: number;
  /** 單一實體對總分的貢獻（整數） */
  key: number;
}

/**
 * 評分是線性函數，可拆成「角色分數 + 載具分數」：
 *   score(c, v) = f(c) + f(v)
 * 因此只需對角色、載具分別排序，就能以 K 路合併依序產生高分組合，
 * 不必計算並排序全部 C × V 個組合。
 */
const rankEntities = <T extends EntityStats>(
  entities: readonly T[],
  terrain: TerrainType,
): RankedEntity<T>[] => {
  const { speed, handling } = TERRAIN_KEYS[terrain];

  return entities
    .map((entity, index) => ({
      entity,
      index,
      key:
        entity[speed] * SCORE_WEIGHTS.speed +
        entity[handling] * SCORE_WEIGHTS.handling +
        entity.acceleration * SCORE_WEIGHTS.acceleration +
        entity.weight * SCORE_WEIGHTS.weight,
    }))
    .sort((a, b) => b.key - a.key || a.index - b.index);
};

/** 堆積節點：第 vehiclePos 個載具與第 characterPos 個角色的組合 */
interface PairNode {
  characterPos: number;
  vehiclePos: number;
  key: number;
}

/**
 * 取得單一地形的前 N 名組合
 *
 * 演算法：K 路合併（LeetCode 23 Merge k Sorted Lists / 373 Find K Pairs）
 * - 每個載具對應一條「依角色分數遞減」的已排序串列
 * - 用堆積同時追蹤每條串列的目前最大值，每次彈出全域最大組合
 * - 多樣性限制：每條串列（每個載具）最多只取前 MAX_SAME_VEHICLE 個
 * - 若因多樣性限制湊不滿 N 個，再從各串列剩餘部分補齊
 *
 * 複雜度：O(C log C + V log V + (V + N) log V)
 * 對比暴力法：O(C·V · log(C·V))
 */
export const getTopCombinations = (
  characters: readonly CharacterStats[],
  vehicles: readonly VehicleStats[],
  terrain: TerrainType,
  limit: number = RECOMMENDATION_LIMIT,
  maxSameVehicle: number = MAX_SAME_VEHICLE,
): RecommendedCombination[] => {
  if (characters.length === 0 || vehicles.length === 0 || limit <= 0) {
    return [];
  }

  const rankedCharacters = rankEntities(characters, terrain);
  const rankedVehicles = rankEntities(vehicles, terrain);
  const characterCount = rankedCharacters.length;

  // 分數高者優先；同分時依原始順序（角色、再載具）
  const heap = new BinaryHeap<PairNode>(
    (a, b) =>
      b.key - a.key ||
      rankedCharacters[a.characterPos].index -
        rankedCharacters[b.characterPos].index ||
      rankedVehicles[a.vehiclePos].index - rankedVehicles[b.vehiclePos].index,
  );

  const pushPair = (characterPos: number, vehiclePos: number) => {
    heap.push({
      characterPos,
      vehiclePos,
      key: rankedCharacters[characterPos].key + rankedVehicles[vehiclePos].key,
    });
  };

  const selected: PairNode[] = [];

  /** 從每條串列的 start 位置開始合併，直到 end（不含）或湊滿 limit */
  const mergeRange = (start: number, end: number) => {
    if (start >= end) return;

    for (let v = 0; v < rankedVehicles.length; v++) pushPair(start, v);

    while (heap.size > 0 && selected.length < limit) {
      const node = heap.pop()!;
      selected.push(node);

      const next = node.characterPos + 1;
      if (next < end) pushPair(next, node.vehiclePos);
    }
  };

  const diverseEnd = Math.min(maxSameVehicle, characterCount);

  // 第一階段：多樣性限制下的前 N 名
  mergeRange(0, diverseEnd);

  // 第二階段：多樣性組合不足時（此時堆積已清空），以剩餘的高分組合補齊
  if (selected.length < limit) {
    mergeRange(diverseEnd, characterCount);
  }

  const { speed, handling } = TERRAIN_KEYS[terrain];

  return selected.map((node, index) => {
    const character = rankedCharacters[node.characterPos].entity;
    const vehicle = rankedVehicles[node.vehiclePos].entity;

    return {
      id: `${terrain}-${character.name}-${vehicle.name}`,
      rank: index + 1,
      character,
      vehicle,
      terrain,
      score: node.key / SCORE_SCALE,
      totalSpeed: character[speed] + vehicle[speed],
      totalHandling: character[handling] + vehicle[handling],
      totalAcceleration: character.acceleration + vehicle.acceleration,
      totalWeight: character.weight + vehicle.weight,
    };
  });
};

/** 取得陣列中某欄位的最大值，O(n) */
const maxOf = (entities: readonly EntityStats[], key: StatKey): number => {
  let max = 0;
  for (const entity of entities) {
    if (entity[key] > max) max = entity[key];
  }
  return max;
};

/**
 * 所有組合中每項能力值的最大值
 *
 * 由於角色與載具可自由搭配，max(c + v) = max(c) + max(v)，
 * 只需 O(C + V) 而非走訪全部 C × V 組合。
 */
export const computeMaxCombinedStats = (
  characters: readonly CharacterStats[],
  vehicles: readonly VehicleStats[],
): SummaryMaxStats => {
  const maxPairSum = (key: StatKey) =>
    maxOf(characters, key) + maxOf(vehicles, key);

  let speed = 0;
  let handling = 0;
  for (const terrain of TERRAINS) {
    speed = Math.max(speed, maxPairSum(TERRAIN_KEYS[terrain].speed));
    handling = Math.max(handling, maxPairSum(TERRAIN_KEYS[terrain].handling));
  }

  return {
    speed,
    acceleration: maxPairSum("acceleration"),
    weight: maxPairSum("weight"),
    handling,
  };
};

/**
 * 計算三種地形的推薦組合
 */
export const computeRecommendations = (
  characters: readonly CharacterStats[],
  vehicles: readonly VehicleStats[],
): RecommendationResult => {
  if (characters.length === 0 || vehicles.length === 0) {
    return {
      road: [],
      terrain: [],
      water: [],
      maxCombinedStats: { speed: 1, acceleration: 1, weight: 1, handling: 1 },
    };
  }

  return {
    road: getTopCombinations(characters, vehicles, "road"),
    terrain: getTopCombinations(characters, vehicles, "terrain"),
    water: getTopCombinations(characters, vehicles, "water"),
    maxCombinedStats: computeMaxCombinedStats(characters, vehicles),
  };
};
