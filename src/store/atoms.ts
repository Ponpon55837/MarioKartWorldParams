import { atom } from 'jotai';
import { CharacterStats, VehicleStats, CombinationStats, StatType, SpeedType, HandlingType } from '@/types';
import { parseMarioKartCSV } from '@/utils/csvParser';
import { combinationsAtom } from './combinations';

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
export const currentPageAtom = atom<'characters' | 'vehicles' | 'combinations'>('characters');

// 計算最大值的 atom (依賴於角色和載具資料)

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
      const response = await fetch('/mario-kart-data.csv');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      // 使用已存在的 CSV 解析器
      const data = parseMarioKartCSV(csvText);
      
      if (data.characters.length === 0) {
        throw new Error('未找到角色資料');
      }
      if (data.vehicles.length === 0) {
        throw new Error('未找到載具資料');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ 載入完成：${data.characters.length} 個角色，${data.vehicles.length} 個載具`);
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
