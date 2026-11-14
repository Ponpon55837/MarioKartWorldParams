import type { CombinationStats } from "@/types";

/** 組合賽跑頁使用的組合：附上依加入順序分配的顏色 */
export interface RacerView extends CombinationStats {
  color: string;
}
