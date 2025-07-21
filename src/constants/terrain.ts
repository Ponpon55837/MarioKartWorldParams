import { useTranslation } from 'react-i18next';

/**
 * 地形配置常數
 */
export const TERRAIN_CONFIG = {
  road: {
    icon: '🏁'
  },
  terrain: {
    icon: '🌄'
  },
  water: {
    icon: '🌊'
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
 * 獲取地形名稱 (需要在組件中使用)
 */
export const useTerrainName = () => {
  const { t } = useTranslation();
  
  return (terrain: string): string => {
    return t(`terrain.${terrain}.name`) || t('terrain.road.name');
  };
};

/**
 * 獲取地形描述 (需要在組件中使用)
 */
export const useTerrainDescription = () => {
  const { t } = useTranslation();
  
  return (terrain: string): string => {
    return t(`terrain.${terrain}.description`) || t('terrain.road.description');
  };
};

// 兼容性函數 (會在下個版本移除)
export const getTerrainName = (terrain: string): string => {
  console.warn('getTerrainName is deprecated, use useTerrainName hook instead');
  // Fallback to English or provide a more extensible solution
  const fallbacks = {
    terrain: 'Terrain',
    water: 'Water',
    road: 'Road'
  };
  return fallbacks[terrain as keyof typeof fallbacks] || fallbacks.road;
};

export const getTerrainDescription = (terrain: string): string => {
  console.warn('getTerrainDescription is deprecated, use useTerrainDescription hook instead');
  const fallbacks = {
    terrain: '適合越野和沙地賽道',
    water: '適合水上和濕滑路面',
    road: '適合一般賽道和柏油路面'
  };
  return fallbacks[terrain as keyof typeof fallbacks] || fallbacks.road;
}