import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TerrainType } from "@/types";

export type { TerrainType };

/**
 * 地形配置常數
 */
export const TERRAIN_CONFIG: Readonly<Record<TerrainType, { icon: string }>> = {
  road: { icon: "🏁" },
  terrain: { icon: "🌄" },
  water: { icon: "🌊" },
};

/**
 * 獲取地形圖標
 */
export const getTerrainIcon = (terrain: string): string =>
  TERRAIN_CONFIG[terrain as TerrainType]?.icon ?? TERRAIN_CONFIG.road.icon;

/**
 * 獲取地形名稱 (需要在組件中使用)
 * 回傳的函數以 useCallback 穩定化，可安全作為 memo 依賴
 */
export const useTerrainName = () => {
  const { t } = useTranslation();

  return useCallback(
    (terrain: string): string =>
      t(`terrain.${terrain}.name`) || t("terrain.road.name"),
    [t],
  );
};

/**
 * 獲取地形描述 (需要在組件中使用)
 */
export const useTerrainDescription = () => {
  const { t } = useTranslation();

  return useCallback(
    (terrain: string): string =>
      t(`terrain.${terrain}.description`) || t("terrain.road.description"),
    [t],
  );
};
