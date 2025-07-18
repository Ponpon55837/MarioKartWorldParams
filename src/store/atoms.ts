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

  return {
    speed: Math.max(
      1,
      ...characters.map(c => c.displaySpeed),
      ...vehicles.map(v => v.displaySpeed)
    ),
    acceleration: Math.max(
      1,
      ...characters.map(c => c.acceleration),
      ...vehicles.map(v => v.acceleration)
    ),
    weight: Math.max(
      1,
      ...characters.map(c => c.weight),
      ...vehicles.map(v => v.weight)
    ),
    handling: Math.max(
      1,
      ...characters.map(c => c.displayHandling),
      ...vehicles.map(v => v.displayHandling)
    ),
  };
});

// 排序後的角色 atom
export const sortedCharactersAtom = atom((get) => {
  const characters = get(charactersAtom);
  const sortBy = get(sortByAtom);
  const speedFilter = get(speedFilterAtom);
  const handlingFilter = get(handlingFilterAtom);

  const getSortValue = (character: CharacterStats): number => {
    switch (sortBy) {
      case 'speed':
        if (speedFilter === 'display') return character.displaySpeed;
        if (speedFilter === 'road') return character.roadSpeed;
        if (speedFilter === 'terrain') return character.terrainSpeed;
        return character.waterSpeed;
      case 'acceleration':
        return character.acceleration;
      case 'weight':
        return character.weight;
      case 'handling':
        if (handlingFilter === 'display') return character.displayHandling;
        if (handlingFilter === 'road') return character.roadHandling;
        if (handlingFilter === 'terrain') return character.terrainHandling;
        return character.waterHandling;
      default:
        return 0;
    }
  };

  return [...characters].sort((a, b) => getSortValue(b) - getSortValue(a));
});

// 排序後的載具 atom
export const sortedVehiclesAtom = atom((get) => {
  const vehicles = get(vehiclesAtom);
  const sortBy = get(sortByAtom);
  const speedFilter = get(speedFilterAtom);
  const handlingFilter = get(handlingFilterAtom);

  const getSortValue = (vehicle: VehicleStats): number => {
    switch (sortBy) {
      case 'speed':
        if (speedFilter === 'display') return vehicle.displaySpeed;
        if (speedFilter === 'road') return vehicle.roadSpeed;
        if (speedFilter === 'terrain') return vehicle.terrainSpeed;
        return vehicle.waterSpeed;
      case 'acceleration':
        return vehicle.acceleration;
      case 'weight':
        return vehicle.weight;
      case 'handling':
        if (handlingFilter === 'display') return vehicle.displayHandling;
        if (handlingFilter === 'road') return vehicle.roadHandling;
        if (handlingFilter === 'terrain') return vehicle.terrainHandling;
        return vehicle.waterHandling;
      default:
        return 0;
    }
  };

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
      console.log('資料已存在，跳過載入');
      return;
    }

    console.log('開始載入資料...');
    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      console.log('正在請求 CSV 文件...');
      const response = await fetch('/mario-kart-data.csv');
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('正在讀取 CSV 內容...');
      const csvText = await response.text();
      console.log('CSV 內容長度:', csvText.length);
      
      // 使用已存在的 CSV 解析器
      console.log('正在解析 CSV...');
      const data = parseMarioKartCSV(csvText);
      console.log('解析結果:', { 
        characters: data.characters.length, 
        vehicles: data.vehicles.length,
        firstCharacter: data.characters[0]?.name,
        firstVehicle: data.vehicles[0]?.name
      });
      
      if (data.characters.length === 0) {
        throw new Error('未找到角色資料');
      }
      if (data.vehicles.length === 0) {
        throw new Error('未找到載具資料');
      }

      console.log(`✅ 載入完成：${data.characters.length} 個角色，${data.vehicles.length} 個載具`);
      
      set(charactersAtom, data.characters);
      set(vehiclesAtom, data.vehicles);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '載入資料時發生未知錯誤';
      console.error('❌ 載入資料錯誤:', error);
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
