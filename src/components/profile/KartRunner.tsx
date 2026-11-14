import { forwardRef } from "react";
import { Kart } from "@/components/profile/Kart";

interface KartRunnerProps {
  color: string;
  /** 0–100，車子在軌道上的位置 */
  percent?: number;
  scale?: number;
  trail?: boolean;
  /** 位置改變時是否以過渡動畫移動（逐幀動畫時需關閉） */
  smooth?: boolean;
}

/**
 * 在軌道上移動的卡丁車
 *
 * 外層寬度等於軌道，translateX 的百分比以自身寬度計算，
 * 因此 translateX(p%) 剛好移動軌道長度的 p%，只動 transform、不觸發版面重排。
 * 動畫時由父層透過 ref 直接更新 transform，避免每一幀重新渲染。
 */
export const KartRunner = forwardRef<HTMLDivElement, KartRunnerProps>(
  function KartRunner(
    { color, percent = 0, scale = 1, trail = false, smooth = true },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={`relative h-full w-full ${smooth ? "transition-transform duration-500 ease-out" : ""}`}
        style={{ transform: `translateX(${percent}%)` }}
      >
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <Kart color={color} scale={scale} trail={trail} />
        </span>
      </div>
    );
  },
);
