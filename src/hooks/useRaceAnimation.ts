import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/utils/motion";
import { progressAt, type RaceRunner } from "@/utils/race";

export type RacePhase = "idle" | "countdown" | "racing" | "finished";

/** 倒數字樣：3、2、1、GO */
export const COUNTDOWN_STEPS = ["3", "2", "1", "GO"] as const;
const STEP_MS = 550;
const GO_MS = 350;
/** 冠軍抵達終點所需的動畫時間 */
const WINNER_MS = 2600;

/**
 * 賽跑動畫：倒數 → 逐幀更新位置 → 完賽
 *
 * 每一幀以封閉解 O(1) 計算每台車的進度，直接寫入 DOM 的 transform，
 * 不觸發 React 重新渲染；參賽者改變時回到起跑狀態。
 */
export function useRaceAnimation(runners: readonly RaceRunner[]) {
  const [phase, setPhase] = useState<RacePhase>("idle");
  const [step, setStep] = useState(0);
  const kartRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => setPhase("idle"), [runners]);

  // 回到起跑線：比賽中途被打斷時，位置是直接寫進 DOM 的，React 不會自動還原
  useEffect(() => {
    if (phase !== "idle" && phase !== "countdown") return;
    for (const kart of kartRefs.current) {
      if (kart) kart.style.transform = "translateX(0%)";
    }
  }, [phase]);

  const start = useCallback(() => {
    if (runners.length === 0) return;
    if (prefersReducedMotion()) {
      setPhase("finished");
      return;
    }
    setStep(0);
    setPhase("countdown");
  }, [runners.length]);

  // 倒數：每一步之後前進，GO 之後開跑
  useEffect(() => {
    if (phase !== "countdown") return;
    const isGo = step === COUNTDOWN_STEPS.length - 1;
    const timer = window.setTimeout(
      () => (isGo ? setPhase("racing") : setStep(step + 1)),
      isGo ? GO_MS : STEP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase, step]);

  // 比賽：模擬時間依冠軍完賽時間縮放成 WINNER_MS
  useEffect(() => {
    if (phase !== "racing") return;

    let winnerTime = Infinity;
    let lastTime = 0;
    for (const { finishTime } of runners) {
      winnerTime = Math.min(winnerTime, finishTime);
      lastTime = Math.max(lastTime, finishTime);
    }

    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const simTime = ((now - startedAt) / WINNER_MS) * winnerTime;
      runners.forEach((runner, index) => {
        const kart = kartRefs.current[index];
        if (kart) {
          kart.style.transform = `translateX(${progressAt(runner, simTime) * 100}%)`;
        }
      });
      if (simTime < lastTime) frame = requestAnimationFrame(tick);
      else setPhase("finished");
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, runners]);

  return { phase, step, start, kartRefs };
}
