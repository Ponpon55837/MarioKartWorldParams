export interface CharacterStats {
  name: string;
  englishName: string;
  displaySpeed: number;
  roadSpeed: number;
  terrainSpeed: number;
  waterSpeed: number;
  unknownSpeed: number;
  acceleration: number;
  weight: number;
  displayHandling: number;
  roadHandling: number;
  terrainHandling: number;
  waterHandling: number;
  unknownHandling: number;
}

export interface VehicleStats {
  name: string;
  englishName: string;
  displaySpeed: number;
  roadSpeed: number;
  terrainSpeed: number;
  waterSpeed: number;
  unknownSpeed: number;
  acceleration: number;
  weight: number;
  displayHandling: number;
  roadHandling: number;
  terrainHandling: number;
  waterHandling: number;
  unknownHandling: number;
}

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

export interface MarioKartData {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
}

export type StatType = 'speed' | 'acceleration' | 'weight' | 'handling';
export type SpeedType = 'road' | 'terrain' | 'water';
export type HandlingType = 'road' | 'terrain' | 'water';
