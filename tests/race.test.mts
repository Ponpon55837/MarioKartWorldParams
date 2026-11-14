/**
 * 賽跑模型測試：以逐步模擬（Euler 積分）為 Oracle 驗證封閉解與二分搜尋
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  RACE_DISTANCE,
  createRunner,
  distanceAt,
  progressAt,
  rankRunners,
  solveFinishTime,
} from "@/utils/race";

import { createFixtures } from "./helpers.mts";

const { random } = createFixtures(42);

/** 暴力解：以極小步長逐步累積速度，直到抵達終點 */
const simulateFinishTime = (velocity: number, acceleration: number) => {
  const dt = 1e-4;
  let time = 0;
  let distance = 0;
  while (distance < RACE_DISTANCE) {
    const speed = velocity * (1 - Math.exp(-acceleration * (time + dt / 2)));
    distance += speed * dt;
    time += dt;
  }
  return time;
};

describe("賽跑模型", () => {
  it("二分搜尋完賽時間與逐步模擬一致", () => {
    for (let round = 0; round < 20; round++) {
      const velocity = 1 + random() * 0.6;
      const acceleration = 0.5 + random() * 2;
      const expected = simulateFinishTime(velocity, acceleration);
      assert.ok(
        Math.abs(solveFinishTime(velocity, acceleration) - expected) < 1e-3,
      );
    }
  });

  it("完賽時的距離等於賽道長度", () => {
    const runner = createRunner(5, 3, 10, 10);
    assert.ok(
      Math.abs(
        distanceAt(runner.velocity, runner.acceleration, runner.finishTime) -
          RACE_DISTANCE,
      ) < 1e-5,
    );
  });

  it("進度單調遞增並在完賽後固定為 1", () => {
    const runner = createRunner(2, 8, 10, 10);
    let previous = 0;
    for (let t = 0; t <= runner.finishTime + 2; t += 0.1) {
      const progress = progressAt(runner, t);
      assert.ok(progress >= previous && progress <= 1);
      previous = progress;
    }
    assert.equal(progressAt(runner, runner.finishTime + 1), 1);
    assert.equal(progressAt(runner, -1), 0);
  });

  it("速度、加速都較高者先完賽；名次依完賽時間排序", () => {
    const slow = createRunner(2, 2, 10, 10);
    const fast = createRunner(9, 9, 10, 10);
    const middle = createRunner(6, 6, 10, 10);
    assert.deepEqual(rankRunners([slow, fast, middle]), [1, 2, 0]);
  });

  it("最大值為 0 時不會除以 0", () => {
    const runner = createRunner(0, 0, 0, 0);
    assert.ok(Number.isFinite(runner.finishTime));
  });
});
