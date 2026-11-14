/**
 * 組合賽跑的簡化物理模型
 *
 * 速度從 0 以指數方式趨近極速 v（加速常數 a）：
 *   速度   s(t) = v · (1 − e^(−a·t))
 *   位置   p(t) = v·t − (v/a) · (1 − e^(−a·t))
 *
 * p(t) 為封閉解，動畫每一幀 O(1) 取得位置，不需預先逐步模擬軌跡；
 * p(t) 嚴格遞增，完賽時間以二分搜尋求解（Binary Search on Answer）。
 */

/** 賽道長度（任意單位） */
export const RACE_DISTANCE = 10;

/** 極速 = 1 + 0.6 × 速度比例；加速常數 = 0.5 + 2 × 加速比例 */
const BASE_VELOCITY = 1;
const VELOCITY_RANGE = 0.6;
const BASE_ACCELERATION = 0.5;
const ACCELERATION_RANGE = 2;

/** 二分搜尋的時間精度 */
const TIME_EPSILON = 1e-6;

export interface RaceRunner {
  velocity: number;
  acceleration: number;
  finishTime: number;
}

/** 時間 t 時已前進的距離 */
export const distanceAt = (
  velocity: number,
  acceleration: number,
  time: number,
): number =>
  time <= 0
    ? 0
    : velocity * time -
      (velocity / acceleration) * (1 - Math.exp(-acceleration * time));

/**
 * 求 p(T) = distance 的完賽時間
 *
 * 因 v·t − v/a ≤ p(t) ≤ v·t，答案必落在 [d/v, d/v + 1/a]，
 * 區間寬度 1/a，約 log₂(1/(a·ε)) 次迭代即收斂。
 */
export const solveFinishTime = (
  velocity: number,
  acceleration: number,
  distance: number = RACE_DISTANCE,
): number => {
  let low = distance / velocity;
  let high = low + 1 / acceleration;

  while (high - low > TIME_EPSILON) {
    const mid = (low + high) / 2;
    if (distanceAt(velocity, acceleration, mid) < distance) low = mid;
    else high = mid;
  }
  return high;
};

/** 依能力值建立參賽者；比例以參賽者共用的最大值計算 */
export const createRunner = (
  speed: number,
  acceleration: number,
  maxSpeed: number,
  maxAcceleration: number,
): RaceRunner => {
  const velocity =
    BASE_VELOCITY + (VELOCITY_RANGE * speed) / Math.max(maxSpeed, 1);
  const accelerationRate =
    BASE_ACCELERATION +
    (ACCELERATION_RANGE * acceleration) / Math.max(maxAcceleration, 1);

  return {
    velocity,
    acceleration: accelerationRate,
    finishTime: solveFinishTime(velocity, accelerationRate),
  };
};

/** 時間 t 時的完成比例（0 到 1） */
export const progressAt = (runner: RaceRunner, time: number): number =>
  Math.min(
    1,
    distanceAt(runner.velocity, runner.acceleration, time) / RACE_DISTANCE,
  );

/** 依完賽時間排出名次，回傳參賽者索引；同時間保留原順序 */
export const rankRunners = (runners: readonly RaceRunner[]): number[] =>
  runners
    .map((runner, index) => ({ index, time: runner.finishTime }))
    .sort((a, b) => a.time - b.time)
    .map(({ index }) => index);
