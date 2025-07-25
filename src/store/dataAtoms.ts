import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { CharacterStats, VehicleStats, CombinationStats, StatType, SpeedType, HandlingType, SearchResultItem } from '@/types';
import { parseMarioKartCSV } from '@/utils/csvParser';
import { combinationsAtom } from '@/store/combinations';

// 資料載入狀態 atom
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

// 原始資料 atoms (不需要持久化，每次啟動重新載入)
export const charactersAtom = atom<CharacterStats[]>([]);
export const vehiclesAtom = atom<VehicleStats[]>([]);

// 過濾和排序狀態 atoms (會話級別，不需要持久化)
export const sortByAtom = atom<StatType>('speed');
export const speedFilterAtom = atom<SpeedType | 'display'>('display');
export const handlingFilterAtom = atom<HandlingType | 'display'>('display');
export const currentPageAtom = atom<'characters' | 'vehicles' | 'combinations' | 'recommendations'>('characters');

export const searchModalOpenAtom = atom<boolean>(false);
export const searchQueryAtom = atom<string>('');
export const searchResultsAtom = atom<SearchResultItem[]>([]);
export const searchLoadingAtom = atom<boolean>(false);
export const searchHistoryVisibleAtom = atom<boolean>(false);

// 語系相關 atoms
export type SupportedLanguage = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko';

// 語系選擇 atom (自動持久化到 localStorage)
export const languageAtom = atomWithStorage<SupportedLanguage>('mario-kart-language', 'zh-TW');

// ==========================================
// 型別定義與常數
// ==========================================

/** 統計資料項目的所有屬性名稱 */
const STAT_PROPERTIES = [
  'displaySpeed', 'roadSpeed', 'terrainSpeed', 'waterSpeed',
  'acceleration', 'weight',
  'displayHandling', 'roadHandling', 'terrainHandling', 'waterHandling'
] as const;

/** 預設最大值，當沒有資料時使用 */
const DEFAULT_MAX_STATS = {
  speed: 1,
  acceleration: 1,
  weight: 1,
  handling: 1,
} as const;

// ==========================================
// 工具函數
// ==========================================

/**
 * 計算單一實體（角色或載具）的所有統計最大值
 * @param entities 角色或載具陣列
 * @returns 包含所有統計項目最大值的物件
 */
const calculateEntityMaxStats = <T extends CharacterStats | VehicleStats>(entities: T[]) => {
  const maxStats = {
    displaySpeed: 1,
    roadSpeed: 1,
    terrainSpeed: 1,
    waterSpeed: 1,
    acceleration: 1,
    weight: 1,
    displayHandling: 1,
    roadHandling: 1,
    terrainHandling: 1,
    waterHandling: 1,
  };

  for (const entity of entities) {
    for (const property of STAT_PROPERTIES) {
      maxStats[property] = Math.max(maxStats[property], entity[property]);
    }
  }

  return maxStats;
};

// 合併兩個最大值物件，取每個屬性的最大值
type MaxStats = {
  [K in typeof STAT_PROPERTIES[number]]: number;
};

const mergeMaxStats = (stats1: MaxStats, stats2: MaxStats): MaxStats => {
  const merged = { ...stats1 };
  
  for (const property of STAT_PROPERTIES) {
    merged[property] = Math.max(stats1[property], stats2[property]);
  }
  
  return merged;
};

// 根據篩選器類型取得對應的統計值
const getStatByFilter = <T extends CharacterStats | VehicleStats>(
  entity: T,
  statType: 'speed' | 'handling',
  filter: SpeedType | HandlingType | 'display'
): number => {
  if (statType === 'speed') {
    switch (filter) {
      case 'road': return entity.roadSpeed;
      case 'terrain': return entity.terrainSpeed;
      case 'water': return entity.waterSpeed;
      default: return entity.displaySpeed;
    }
  } else {
    switch (filter) {
      case 'road': return entity.roadHandling;
      case 'terrain': return entity.terrainHandling;
      case 'water': return entity.waterHandling;
      default: return entity.displayHandling;
    }
  }
};

// 根據排序類型和篩選器取得實體的排序值 
const getSortValue = <T extends CharacterStats | VehicleStats>(
  entity: T,
  sortBy: StatType,
  speedFilter: SpeedType | 'display',
  handlingFilter: HandlingType | 'display'
): number => {
  switch (sortBy) {
    case 'speed':
      return getStatByFilter(entity, 'speed', speedFilter);
    case 'acceleration':
      return entity.acceleration;
    case 'weight':
      return entity.weight;
    case 'handling':
      return getStatByFilter(entity, 'handling', handlingFilter);
    default:
      return 0;
  }
};

// ==========================================
// 計算統計最大值的 Atom
// ==========================================
export const maxStatsAtom = atom((get) => {
  const characters = get(charactersAtom);
  const vehicles = get(vehiclesAtom);
  
  // 快速返回：當沒有資料時
  if (characters.length === 0 && vehicles.length === 0) {
    return {
      ...DEFAULT_MAX_STATS,
      _internal: {
        displaySpeed: 1, roadSpeed: 1, terrainSpeed: 1, waterSpeed: 1,
        displayHandling: 1, roadHandling: 1, terrainHandling: 1, waterHandling: 1,
      }
    };
  }

  // 分別計算角色和載具的最大值
  const characterMaxStats = calculateEntityMaxStats(characters);
  const vehicleMaxStats = calculateEntityMaxStats(vehicles);
  
  // 合併所有最大值
  const allMaxStats = mergeMaxStats(characterMaxStats, vehicleMaxStats);
  
  return {
    // 對外提供的簡化最大值（向後兼容）
    speed: Math.max(
      allMaxStats.displaySpeed,
      allMaxStats.roadSpeed,
      allMaxStats.terrainSpeed,
      allMaxStats.waterSpeed
    ),
    acceleration: allMaxStats.acceleration,
    weight: allMaxStats.weight,
    handling: Math.max(
      allMaxStats.displayHandling,
      allMaxStats.roadHandling,
      allMaxStats.terrainHandling,
      allMaxStats.waterHandling
    ),
    
    // 內部使用的詳細最大值
    _internal: allMaxStats
  };
});

// ==========================================
// 動態最大值計算 Atom
// ==========================================
export const dynamicMaxStatsAtom = atom((get) => {
  const maxStats = get(maxStatsAtom);
  const speedFilter = get(speedFilterAtom);
  const handlingFilter = get(handlingFilterAtom);
  
  // 安全檢查：確保內部資料存在
  if (!maxStats._internal) {
    return DEFAULT_MAX_STATS;
  }

  const { _internal } = maxStats;
  
  // 根據篩選器選擇對應的最大值
  const speedMax = (() => {
    switch (speedFilter) {
      case 'road': return _internal.roadSpeed;
      case 'terrain': return _internal.terrainSpeed;
      case 'water': return _internal.waterSpeed;
      default: return _internal.displaySpeed;
    }
  })();

  const handlingMax = (() => {
    switch (handlingFilter) {
      case 'road': return _internal.roadHandling;
      case 'terrain': return _internal.terrainHandling;
      case 'water': return _internal.waterHandling;
      default: return _internal.displayHandling;
    }
  })();

  return {
    speed: speedMax,
    acceleration: maxStats.acceleration,
    weight: maxStats.weight,
    handling: handlingMax,
  };
});

// ==========================================
// 排序邏輯 Atoms
// ==========================================

const createSortedEntitiesAtom = <T extends CharacterStats | VehicleStats>(
  entitiesAtom: any,
  entityName: string
) => atom((get): T[] => {
  const entities = get(entitiesAtom) as T[];
  const sortBy = get(sortByAtom);
  const speedFilter = get(speedFilterAtom);
  const handlingFilter = get(handlingFilterAtom);

  // 快速返回：空陣列情況
  if (entities.length === 0) {
    return entities;
  }

  // 建立排序函數（避免在 sort 中重複建立）
  const sortValueGetter = (entity: T): number => 
    getSortValue(entity, sortBy, speedFilter, handlingFilter);

  // 執行排序（高到低）
  return [...entities].sort((a, b) => sortValueGetter(b) - sortValueGetter(a));
});

/**
 * 排序後的角色列表
 * 根據當前排序設定和篩選器自動更新
 */
export const sortedCharactersAtom = createSortedEntitiesAtom<CharacterStats>(
  charactersAtom,
  'characters'
);

// 排序後的載具列表 根據當前排序設定和篩選器自動更新
export const sortedVehiclesAtom = createSortedEntitiesAtom<VehicleStats>(
  vehiclesAtom,
  'vehicles'
);

// 日誌輔助函數
const logDev = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

const logDevError = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, ...args);
  }
};

// JSON 資料載入器
const loadJSONData = async () => {
  logDev('🚀 嘗試載入 JSON 格式資料...');
  
  const jsonResponse = await fetch('/mario-kart-data.json');
  
  if (!jsonResponse.ok) {
    throw new Error(`JSON 檔案回應錯誤: ${jsonResponse.status}`);
  }
  
  const jsonData = await jsonResponse.json();
  
  if (!jsonData.data?.characters || !jsonData.data?.vehicles) {
    throw new Error('JSON 資料格式不正確');
  }
  
  const data = jsonData.data;
  
  logDev(`✅ JSON 格式載入成功！${data.characters.length} 個角色，${data.vehicles.length} 個載具`);
  logDev('📊 資料版本:', jsonData.version);
  logDev('🕐 最後更新:', jsonData.lastUpdate);
  
  return data;
};

// CSV 資料載入器
const loadCSVData = async () => {
  const csvResponse = await fetch('/mario-kart-data.csv');
  
  if (!csvResponse.ok) {
    throw new Error(`CSV 檔案也無法載入: ${csvResponse.status}`);
  }
  
  const csvText = await csvResponse.text();
  const data = parseMarioKartCSV(csvText);
  
  logDev(`✅ CSV 格式載入完成：${data.characters.length} 個角色，${data.vehicles.length} 個載具`);
  
  return data;
};

// 資料驗證函數
const validateData = (data: any) => {
  if (data.characters.length === 0) {
    throw new Error('未找到角色資料');
  }
  if (data.vehicles.length === 0) {
    throw new Error('未找到載具資料');
  }
};

// 資料載入 action atom
export const loadDataAtom = atom(
  null,
  async (get, set) => {
    // 檢查是否已有有效資料
    const characters = get(charactersAtom);
    const vehicles = get(vehiclesAtom);
    const error = get(errorAtom);
    
    const hasValidData = characters.length > 0 && vehicles.length > 0 && !error;
    
    if (hasValidData) {
      logDev('資料已存在，跳過載入');
      return;
    }

    logDev('開始載入資料...');
    
    // 初始化載入狀態
    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      let data;
      
      // 優先嘗試 JSON，失敗則回退到 CSV
      try {
        data = await loadJSONData();
      } catch (jsonError) {
        logDev('⚠️ JSON 載入失敗，回退到 CSV 格式:', jsonError);
        data = await loadCSVData();
      }
      
      // 驗證載入的資料
      validateData(data);
      
      // 原子性更新狀態
      set(charactersAtom, data.characters);
      set(vehiclesAtom, data.vehicles);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '載入資料時發生未知錯誤';
      logDevError('❌ 載入資料錯誤:', error);
      set(errorAtom, errorMessage);
    } finally {
      set(loadingAtom, false);
    }
  }
);

// 新增組合 action atom
export const addCombinationAtom = atom(
  null,
  (get, set, { character, vehicle }: { character: CharacterStats; vehicle: VehicleStats }) => {
    const currentCombinations = get(combinationsAtom) as CombinationStats[];
    const id = `${character.name}-${vehicle.name}-${Date.now()}`;
    
    const newCombination: CombinationStats = {
      id,
      character,
      vehicle,
      combinedStats: {
        displaySpeed: character.displaySpeed + vehicle.displaySpeed + 3,
        roadSpeed: character.roadSpeed + vehicle.roadSpeed + 3,
        terrainSpeed: character.terrainSpeed + vehicle.terrainSpeed + 3,
        waterSpeed: character.waterSpeed + vehicle.waterSpeed + 3,
        acceleration: character.acceleration + vehicle.acceleration + 3,
        weight: character.weight + vehicle.weight + 3,
        displayHandling: character.displayHandling + vehicle.displayHandling + 3,
        roadHandling: character.roadHandling + vehicle.roadHandling + 3,
        terrainHandling: character.terrainHandling + vehicle.terrainHandling + 3,
        waterHandling: character.waterHandling + vehicle.waterHandling + 3,
      },
    };
    
    set(combinationsAtom, [...currentCombinations, newCombination]);
  }
);

// 移除組合 action atom
export const removeCombinationAtom = atom(
  null,
  (get, set, id: string) => {
    const currentCombinations = get(combinationsAtom) as CombinationStats[];
    set(combinationsAtom, currentCombinations.filter((combo: CombinationStats) => combo.id !== id));
  }
);

// 清除所有組合 action atom
export const clearAllCombinationsAtom = atom(
  null,
  (get, set) => {
    set(combinationsAtom, []);
  }
);

// 推薦組合相關 atoms
export const recommendedCombinationsAtom = atom((get) => {
  const characters = get(charactersAtom);
  const vehicles = get(vehiclesAtom);
  
  if (characters.length === 0 || vehicles.length === 0) {
    return {
      road: [],
      terrain: [],
      water: [],
      maxCombinedStats: {
        speed: 1,
        acceleration: 1,
        weight: 1,
        handling: 1,
      }
    };
  }

  // 計算所有可能組合的最大值
  let maxCombinedSpeed = 0;
  let maxCombinedAcceleration = 0;
  let maxCombinedWeight = 0;
  let maxCombinedHandling = 0;

  // 計算每個角色與載具的組合分數
  const calculateCombinationScore = (character: CharacterStats, vehicle: VehicleStats, terrain: 'road' | 'terrain' | 'water') => {
    let characterSpeed = 0;
    let vehicleSpeed = 0;
    let characterHandling = 0;
    let vehicleHandling = 0;

    // 根據地形選擇對應的數值
    switch (terrain) {
      case 'road':
        characterSpeed = character.roadSpeed;
        vehicleSpeed = vehicle.roadSpeed;
        characterHandling = character.roadHandling;
        vehicleHandling = vehicle.roadHandling;
        break;
      case 'terrain':
        characterSpeed = character.terrainSpeed;
        vehicleSpeed = vehicle.terrainSpeed;
        characterHandling = character.terrainHandling;
        vehicleHandling = vehicle.terrainHandling;
        break;
      case 'water':
        characterSpeed = character.waterSpeed;
        vehicleSpeed = vehicle.waterSpeed;
        characterHandling = character.waterHandling;
        vehicleHandling = vehicle.waterHandling;
        break;
    }

    // 組合總分數計算（速度 + 操控性 + 加速度，權重可調整）
    const totalSpeed = characterSpeed + vehicleSpeed;
    const totalHandling = characterHandling + vehicleHandling;
    const totalAcceleration = character.acceleration + vehicle.acceleration;
    const totalWeight = character.weight + vehicle.weight;

    // 更新最大值
    maxCombinedSpeed = Math.max(maxCombinedSpeed, totalSpeed);
    maxCombinedHandling = Math.max(maxCombinedHandling, totalHandling);
    maxCombinedAcceleration = Math.max(maxCombinedAcceleration, totalAcceleration);
    maxCombinedWeight = Math.max(maxCombinedWeight, totalWeight);

    // 計算綜合分數：速度40% + 操控性30% + 加速度20% - 重量10%（重量越高分數越低）
    const score = (totalSpeed * 0.4) + (totalHandling * 0.3) + (totalAcceleration * 0.2) - (totalWeight * 0.1);
    
    return {
      character,
      vehicle,
      score,
      totalSpeed,
      totalHandling,
      totalAcceleration,
      totalWeight,
      terrain
    };
  };

  // 為每個地形計算所有組合並取前10名
  const getTopCombinations = (terrain: 'road' | 'terrain' | 'water') => {
    const combinations = [];
    
    for (const character of characters) {
      for (const vehicle of vehicles) {
        combinations.push(calculateCombinationScore(character, vehicle, terrain));
      }
    }
    
    // 按分數降序排列
    const sorted = combinations.sort((a, b) => b.score - a.score);
    
    // 增加多樣性：確保前10名中不會有太多相同載具
    const diverseCombinations = [];
    const usedVehicles = new Set();
    const maxSameVehicle = 3; // 最多允許3個相同載具
    
    for (const combo of sorted) {
      const vehicleCount = diverseCombinations.filter(c => c.vehicle.name === combo.vehicle.name).length;
      
      if (vehicleCount < maxSameVehicle) {
        diverseCombinations.push(combo);
      }
      
      if (diverseCombinations.length >= 10) break;
    }
    
    // 如果多樣性篩選後不足10個，補充剩餘的高分組合
    if (diverseCombinations.length < 10) {
      for (const combo of sorted) {
        if (!diverseCombinations.some(c => c.character.name === combo.character.name && c.vehicle.name === combo.vehicle.name)) {
          diverseCombinations.push(combo);
          if (diverseCombinations.length >= 10) break;
        }
      }
    }
    
    return diverseCombinations
      .slice(0, 10)
      .map((combo, index) => ({
        ...combo,
        rank: index + 1,
        id: `${terrain}-${combo.character.name}-${combo.vehicle.name}`
      }));
  };

  return {
    road: getTopCombinations('road'),
    terrain: getTopCombinations('terrain'),
    water: getTopCombinations('water'),
    maxCombinedStats: {
      speed: maxCombinedSpeed,
      acceleration: maxCombinedAcceleration,
      weight: maxCombinedWeight,
      handling: maxCombinedHandling,
    }
  };
});
