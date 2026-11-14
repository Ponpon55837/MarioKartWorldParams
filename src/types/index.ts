// ==========================================
// 能力值基礎型別
// ==========================================

/** 所有數值型能力值欄位（角色、載具、組合共用） */
export const STAT_KEYS = [
  "displaySpeed",
  "roadSpeed",
  "terrainSpeed",
  "waterSpeed",
  "acceleration",
  "weight",
  "displayHandling",
  "roadHandling",
  "terrainHandling",
  "waterHandling",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

/** 能力值表：每個欄位對應一個數值 */
export type StatRecord = Record<StatKey, number>;

/** 角色與載具共用的實體結構 */
export interface EntityStats extends StatRecord {
  name: string;
  englishName: string;
}

// 角色統計資料接口
export type CharacterStats = EntityStats;

// 載具統計資料接口
export type VehicleStats = EntityStats;

// 組合統計資料接口
export interface CombinationStats {
  id: string;
  character: CharacterStats;
  vehicle: VehicleStats;
  combinedStats: StatRecord;
}

// 瑪利歐賽車資料接口
export interface MarioKartData {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
}

// 統計類型
export type StatType = "speed" | "acceleration" | "weight" | "handling";
export type TerrainType = "road" | "terrain" | "water";
export type SpeedType = TerrainType;
export type HandlingType = TerrainType;
export type SpeedFilter = SpeedType | "display";
export type HandlingFilter = HandlingType | "display";
export type PageType =
  | "characters"
  | "vehicles"
  | "combinations"
  | "recommendations";

// ==========================================
// 性能輪廓型別
// ==========================================

/** 跑法：依遊戲顯示速度與加速度的差距判斷 */
export type PlayStyle = "speed" | "balanced" | "acceleration";
export type PlayStyleFilter = PlayStyle | "all";

/** 體型：依重量占最大值的比例判斷 */
export type WeightClass = "light" | "medium" | "heavy";

/** 角色或載具瀏覽頁 */
export type EntityKind = "characters" | "vehicles";

/** 數值完全相同的一組角色或載具 */
export interface StatGroup<T extends EntityStats = EntityStats> {
  /** 能力值簽章，作為群組唯一鍵 */
  key: string;
  /** 群組代表（資料中最先出現的成員） */
  lead: T;
  members: T[];
  playStyle: PlayStyle;
  weightClass: WeightClass;
}

/** 強弱項：依能力值占最大值的比例挑出 */
export interface StatTraits {
  strong: StatType[];
  weak: StatType[];
}

/** 組合間比較結果：該項是否為唯一最高或唯一最低 */
export type Standing = "best" | "worst" | null;

/** 四大能力值的最大值（用於進度條比例） */
export interface SummaryMaxStats {
  speed: number;
  acceleration: number;
  weight: number;
  handling: number;
}

// ==========================================
// 推薦系統型別
// ==========================================

export interface RecommendedCombination {
  id: string;
  rank: number;
  character: CharacterStats;
  vehicle: VehicleStats;
  terrain: TerrainType;
  score: number;
  totalSpeed: number;
  totalHandling: number;
  totalAcceleration: number;
  totalWeight: number;
}

export type RecommendationResult = Record<
  TerrainType,
  RecommendedCombination[]
> & {
  maxCombinedStats: SummaryMaxStats;
};

// 搜尋結果的聯合型別
export type SearchResultItem =
  | {
      type: "character";
      data: CharacterStats;
    }
  | {
      type: "vehicle";
      data: VehicleStats;
    };

// ==========================================
// Admin 頁面相關型別
// ==========================================

/**
 * 資料同步結果
 */
export interface SyncResult {
  success: boolean;
  /** 資料是否已寫入伺服器檔案；唯讀環境（如 Vercel）為 false，需手動下載 JSON */
  persisted?: boolean;
  message?: string;
  error?: string;
  csvData?: string;
  jsonData?: unknown;
  timestamp?: string;
  metadata?: {
    characterCount: number;
    vehicleCount: number;
    dataSize: {
      csv: number;
      json: number;
    };
  };
}

/**
 * 資料狀態
 */
export interface DataStatus {
  success: boolean;
  hasData: boolean;
  metadata?: {
    characterCount: number;
    vehicleCount: number;
    source: string;
  };
  lastUpdate?: string;
  version?: string;
}

// ==========================================
// 主題系統相關型別
// ==========================================

export type ThemeMode = "light" | "dark";
