/**
 * 地形配置常數
 */
export const TERRAIN_CONFIG = {
  road: {
    icon: '🏁',
    name: '道路',
    description: '適合一般賽道和柏油路面'
  },
  terrain: {
    icon: '🌄',
    name: '地形',
    description: '適合越野和沙地賽道'
  },
  water: {
    icon: '🌊',
    name: '水面',
    description: '適合水上和濕滑路面'
  }
} as const;

export type TerrainType = keyof typeof TERRAIN_CONFIG;

/**
 * 獲取地形圖標
 */
export const getTerrainIcon = (terrain: string): string => {
  return TERRAIN_CONFIG[terrain as TerrainType]?.icon || '🏁';
};

/**
 * 獲取地形名稱
 */
export const getTerrainName = (terrain: string): string => {
  return TERRAIN_CONFIG[terrain as TerrainType]?.name || '道路';
};

/**
 * 獲取地形描述
 */
export const getTerrainDescription = (terrain: string): string => {
  return TERRAIN_CONFIG[terrain as TerrainType]?.description || '適合一般賽道和柏油路面';
};
