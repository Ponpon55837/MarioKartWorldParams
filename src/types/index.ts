// 角色統計資料接口
export interface CharacterStats {
  name: string;
  englishName: string;
  displaySpeed: number;
  roadSpeed: number;
  terrainSpeed: number;
  waterSpeed: number;
  acceleration: number;
  weight: number;
  displayHandling: number;
  roadHandling: number;
  terrainHandling: number;
  waterHandling: number;
}

// 載具統計資料接口
export interface VehicleStats {
  name: string;
  englishName: string;
  displaySpeed: number;
  roadSpeed: number;
  terrainSpeed: number;
  waterSpeed: number;
  acceleration: number;
  weight: number;
  displayHandling: number;
  roadHandling: number;
  terrainHandling: number;
  waterHandling: number;
}

// 組合統計資料接口
export interface CombinationStats {
  id: string;
  character: CharacterStats;
  vehicle: VehicleStats;
  combinedStats: {
    displaySpeed: number;
    roadSpeed: number;
    terrainSpeed: number;
    waterSpeed: number;
    acceleration: number;
    weight: number;
    displayHandling: number;
    roadHandling: number;
    terrainHandling: number;
    waterHandling: number;
  };
}

// 瑪利歐賽車數據接口
export interface MarioKartData {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
}

// 統計類型
export type StatType = 'speed' | 'acceleration' | 'weight' | 'handling';
export type SpeedType = 'road' | 'terrain' | 'water';
export type HandlingType = 'road' | 'terrain' | 'water';
