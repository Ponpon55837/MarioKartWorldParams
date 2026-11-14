import type { ReactNode } from "react";
import type { TerrainType } from "@/types";
import { LANE_CLASS } from "@/constants/terrain";

interface TrackLaneProps {
  terrain: TerrainType;
  label: string;
  /** 高亮目前篩選中的賽道 */
  active?: boolean;
  size?: "md" | "lg";
  /** 車子所在的軌道內容（通常是 KartRunner） */
  children: ReactNode;
  /** 右側附加資訊，例如名次 */
  trailing?: ReactNode;
}

const HEIGHT_CLASS = { md: "h-10", lg: "h-[60px]" } as const;
/** 標籤固定寬度，確保同組賽道的起跑線對齊 */
const LABEL_WIDTH_CLASS = { md: "w-20", lg: "w-36 sm:w-56" } as const;

/**
 * 一條賽道：材質背景、左側標籤、右側終點格紋
 * 軌道區域從標籤之後開始，右側預留車身寬度，子元素以百分比定位
 */
export function TrackLane({
  terrain,
  label,
  active = false,
  size = "md",
  children,
  trailing,
}: TrackLaneProps) {
  return (
    <div
      className={`relative flex items-stretch overflow-hidden rounded-xl border-2 border-black/25 ${LANE_CLASS[terrain]} ${HEIGHT_CLASS[size]} ${
        active ? "outline outline-2 outline-offset-2 outline-foreground" : ""
      }`}
    >
      <span className={`flex shrink-0 items-center pl-3 pr-2 ${LABEL_WIDTH_CLASS[size]}`}>
        <span className="truncate font-display text-[13px] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]">
          {label}
        </span>
      </span>
      <div className="relative mr-[66px] flex-1">{children}</div>
      <span className="finish-line absolute inset-y-0 right-0 w-3" aria-hidden="true" />
      {trailing}
    </div>
  );
}
