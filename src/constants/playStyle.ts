import type { PlayStyle, PlayStyleFilter } from "@/types";

/** 跑法篩選器選項順序 */
export const PLAY_STYLE_FILTERS: readonly PlayStyleFilter[] = [
  "all",
  "speed",
  "balanced",
  "acceleration",
];

/** 跑法代表色：同一色系用在色塊、文字、雷達圖與卡丁車 */
export const PLAY_STYLE_TONE: Readonly<
  Record<PlayStyle, { bg: string; text: string; color: string }>
> = {
  speed: {
    bg: "bg-kart-red",
    text: "text-kart-red",
    color: "rgb(var(--kart-red))",
  },
  balanced: {
    bg: "bg-kart-blue",
    text: "text-kart-blue",
    color: "rgb(var(--kart-blue))",
  },
  acceleration: {
    bg: "bg-kart-green",
    text: "text-kart-green",
    color: "rgb(var(--kart-green))",
  },
};

/** 組合賽跑中各參賽組合的顏色（依加入順序循環） */
export const RACER_COLORS: readonly string[] = [
  "rgb(var(--kart-red))",
  "rgb(var(--kart-blue))",
  "rgb(var(--gold))",
  "rgb(var(--kart-green))",
];
