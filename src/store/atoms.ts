import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { CharacterStats, VehicleStats, CombinationStats, StatType, SpeedType, HandlingType } from '@/types';
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

// 搜尋相關 atoms
export const searchModalOpenAtom = atom<boolean>(false);
export const searchQueryAtom = atom<string>('');
export const searchResultsAtom = atom<any[]>([]);
export const searchLoadingAtom = atom<boolean>(false);
export const searchHistoryVisibleAtom = atom<boolean>(false);

// 語系相關 atoms
export type SupportedLanguage = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko';

// 語系選擇 atom (自動持久化到 localStorage)
export const languageAtom = atomWithStorage<SupportedLanguage>('mario-kart-language', 'zh-TW');

// 計算最大值的 atom (依賴於角色和載具資料)
export const maxStatsAtom = atom((get) => {
  const characters = get(charactersAtom);
  const vehicles = get(vehiclesAtom);
  
  if (characters.length === 0 && vehicles.length === 0) {
    return {
      speed: 1,
      acceleration: 1,
      weight: 1,
      handling: 1,
    };
  }

  // 使用單次遍歷來計算所有最大值，避免重複遍歷
  let maxDisplaySpeed = 1;
  let maxRoadSpeed = 1;
  let maxTerrainSpeed = 1;
  let maxWaterSpeed = 1;
  let maxAcceleration = 1;
  let maxWeight = 1;
  let maxDisplayHandling = 1;
  let maxRoadHandling = 1;
  let maxTerrainHandling = 1;
  let maxWaterHandling = 1;

  // 遍歷角色
  for (const character of characters) {
    maxDisplaySpeed = Math.max(maxDisplaySpeed, character.displaySpeed);
    maxRoadSpeed = Math.max(maxRoadSpeed, character.roadSpeed);
    maxTerrainSpeed = Math.max(maxTerrainSpeed, character.terrainSpeed);
    maxWaterSpeed = Math.max(maxWaterSpeed, character.waterSpeed);
    maxAcceleration = Math.max(maxAcceleration, character.acceleration);
    maxWeight = Math.max(maxWeight, character.weight);
    maxDisplayHandling = Math.max(maxDisplayHandling, character.displayHandling);
    maxRoadHandling = Math.max(maxRoadHandling, character.roadHandling);
    maxTerrainHandling = Math.max(maxTerrainHandling, character.terrainHandling);
    maxWaterHandling = Math.max(maxWaterHandling, character.waterHandling);
  }

  // 遍歷載具
  for (const vehicle of vehicles) {
    maxDisplaySpeed = Math.max(maxDisplaySpeed, vehicle.displaySpeed);
    maxRoadSpeed = Math.max(maxRoadSpeed, vehicle.roadSpeed);
    maxTerrainSpeed = Math.max(maxTerrainSpeed, vehicle.terrainSpeed);
    maxWaterSpeed = Math.max(maxWaterSpeed, vehicle.waterSpeed);
    maxAcceleration = Math.max(maxAcceleration, vehicle.acceleration);
    maxWeight = Math.max(maxWeight, vehicle.weight);
    maxDisplayHandling = Math.max(maxDisplayHandling, vehicle.displayHandling);
    maxRoadHandling = Math.max(maxRoadHandling, vehicle.roadHandling);
    maxTerrainHandling = Math.max(maxTerrainHandling, vehicle.terrainHandling);
    maxWaterHandling = Math.max(maxWaterHandling, vehicle.waterHandling);
  }

  return {
    speed: Math.max(maxDisplaySpeed, maxRoadSpeed, maxTerrainSpeed, maxWaterSpeed),
    acceleration: maxAcceleration,
    weight: maxWeight,
    handling: Math.max(maxDisplayHandling, maxRoadHandling, maxTerrainHandling, maxWaterHandling),
    // 額外提供細分的最大值供動態計算使用
    _internal: {
      displaySpeed: maxDisplaySpeed,
      roadSpeed: maxRoadSpeed,
      terrainSpeed: maxTerrainSpeed,
      waterSpeed: maxWaterSpeed,
      displayHandling: maxDisplayHandling,
      roadHandling: maxRoadHandling,
      terrainHandling: maxTerrainHandling,
      waterHandling: maxWaterHandling,
    }
  };
});

// 動態最大值計算 atom - 根據當前篩選器計算對應的最大值
export const dynamicMaxStatsAtom = atom((get) => {
  const maxStats = get(maxStatsAtom);
  const speedFilter = get(speedFilterAtom);
  const handlingFilter = get(handlingFilterAtom);
  
  // 檢查 _internal 是否存在
  if (!maxStats._internal) {
    return {
      speed: 1,
      acceleration: 1,
      weight: 1,
      handling: 1,
    };
  }

  // 直接使用預計算的最大值，避免重複計算
  const getSpeedMax = () => {
    switch (speedFilter) {
      case 'road':
        return maxStats._internal!.roadSpeed;
      case 'terrain':
        return maxStats._internal!.terrainSpeed;
      case 'water':
        return maxStats._internal!.waterSpeed;
      default: // 'display'
        return maxStats._internal!.displaySpeed;
    }
  };

  const getHandlingMax = () => {
    switch (handlingFilter) {
      case 'road':
        return maxStats._internal!.roadHandling;
      case 'terrain':
        return maxStats._internal!.terrainHandling;
      case 'water':
        return maxStats._internal!.waterHandling;
      default: // 'display'
        return maxStats._internal!.displayHandling;
    }
  };

  return {
    speed: getSpeedMax(),
    acceleration: maxStats.acceleration,
    weight: maxStats.weight,
    handling: getHandlingMax(),
  };
});

// 排序後的角色 atom
export const sortedCharactersAtom = atom((get) => {
  const characters = get(charactersAtom);
  const sortBy = get(sortByAtom);
  const speedFilter = get(speedFilterAtom);
  const handlingFilter = get(handlingFilterAtom);

  // 快速路徑：如果沒有角色，直接返回
  if (characters.length === 0) return characters;

  // 預先計算排序函數，避免在排序過程中重複創建函數
  const getSortValue = (character: CharacterStats): number => {
    switch (sortBy) {
      case 'speed':
        switch (speedFilter) {
          case 'road': return character.roadSpeed;
          case 'terrain': return character.terrainSpeed;
          case 'water': return character.waterSpeed;
          default: return character.displaySpeed;
        }
      case 'acceleration':
        return character.acceleration;
      case 'weight':
        return character.weight;
      case 'handling':
        switch (handlingFilter) {
          case 'road': return character.roadHandling;
          case 'terrain': return character.terrainHandling;
          case 'water': return character.waterHandling;
          default: return character.displayHandling;
        }
      default:
        return 0;
    }
  };

  // 使用原地排序，避免不必要的複製
  return [...characters].sort((a, b) => getSortValue(b) - getSortValue(a));
});

// 排序後的載具 atom
export const sortedVehiclesAtom = atom((get) => {
  const vehicles = get(vehiclesAtom);
  const sortBy = get(sortByAtom);
  const speedFilter = get(speedFilterAtom);
  const handlingFilter = get(handlingFilterAtom);

  // 快速路徑：如果沒有載具，直接返回
  if (vehicles.length === 0) return vehicles;

  // 預先計算排序函數，避免在排序過程中重複創建函數
  const getSortValue = (vehicle: VehicleStats): number => {
    switch (sortBy) {
      case 'speed':
        switch (speedFilter) {
          case 'road': return vehicle.roadSpeed;
          case 'terrain': return vehicle.terrainSpeed;
          case 'water': return vehicle.waterSpeed;
          default: return vehicle.displaySpeed;
        }
      case 'acceleration':
        return vehicle.acceleration;
      case 'weight':
        return vehicle.weight;
      case 'handling':
        switch (handlingFilter) {
          case 'road': return vehicle.roadHandling;
          case 'terrain': return vehicle.terrainHandling;
          case 'water': return vehicle.waterHandling;
          default: return vehicle.displayHandling;
        }
      default:
        return 0;
    }
  };

  // 使用原地排序，避免不必要的複製
  return [...vehicles].sort((a, b) => getSortValue(b) - getSortValue(a));
});

// 資料載入 action atom
export const loadDataAtom = atom(
  null,
  async (get, set) => {
    // 如果已經有資料且沒有錯誤，就不重新載入
    const characters = get(charactersAtom);
    const vehicles = get(vehiclesAtom);
    const error = get(errorAtom);
    
    if (characters.length > 0 && vehicles.length > 0 && !error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('資料已存在，跳過載入');
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('開始載入資料...');
    }
    
    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      let data;
      
      // 優先嘗試載入 JSON 格式 (更快)
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 嘗試載入 JSON 格式資料...');
        }
        
        const jsonResponse = await fetch('/mario-kart-data.json');
        
        if (jsonResponse.ok) {
          const jsonData = await jsonResponse.json();
          
          if (jsonData.data && jsonData.data.characters && jsonData.data.vehicles) {
            data = jsonData.data;
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ JSON 格式載入成功！${data.characters.length} 個角色，${data.vehicles.length} 個載具`);
              console.log('📊 資料版本:', jsonData.version);
              console.log('🕐 最後更新:', jsonData.lastUpdate);
            }
          } else {
            throw new Error('JSON 資料格式不正確');
          }
        } else {
          throw new Error(`JSON 檔案回應錯誤: ${jsonResponse.status}`);
        }
      } catch (jsonError) {
        // JSON 載入失敗，回退到 CSV 格式
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ JSON 載入失敗，回退到 CSV 格式:', jsonError);
        }
        
        const csvResponse = await fetch('/mario-kart-data.csv');
        
        if (!csvResponse.ok) {
          throw new Error(`CSV 檔案也無法載入: ${csvResponse.status}`);
        }
        
        const csvText = await csvResponse.text();
        
        // 使用已存在的 CSV 解析器
        data = parseMarioKartCSV(csvText);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ CSV 格式載入完成：${data.characters.length} 個角色，${data.vehicles.length} 個載具`);
        }
      }
      
      if (data.characters.length === 0) {
        throw new Error('未找到角色資料');
      }
      if (data.vehicles.length === 0) {
        throw new Error('未找到載具資料');
      }
      
      // 批次更新狀態，減少重新渲染
      set(charactersAtom, data.characters);
      set(vehiclesAtom, data.vehicles);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '載入資料時發生未知錯誤';
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 載入資料錯誤:', error);
      }
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
