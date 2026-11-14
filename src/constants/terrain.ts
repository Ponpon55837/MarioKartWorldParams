import type { SpeedFilter, TerrainType } from "@/types";

/** 賽道篩選器選項順序（遊戲顯示 + 三種賽道） */
export const TRACK_FILTERS: readonly SpeedFilter[] = [
  "display",
  "road",
  "terrain",
  "water",
];

/** 賽道材質（globals.css 中的 lane-* 圖樣） */
export const LANE_CLASS: Readonly<Record<TerrainType, string>> = {
  road: "lane-road",
  terrain: "lane-terrain",
  water: "lane-water",
};

/** 篩選器前的小色塊 */
export const TRACK_SWATCH_CLASS: Readonly<Record<TerrainType, string>> = {
  road: "bg-road",
  terrain: "bg-dirt",
  water: "bg-water",
};
