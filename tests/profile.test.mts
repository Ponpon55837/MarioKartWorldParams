/**
 * 性能輪廓測試：分組與組合比較以暴力解為 Oracle
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  PROFILE_AXES,
  compareStandings,
  getBestTerrain,
  getFastestTerrain,
  getPlayStyle,
  getTraits,
  getWeightClass,
  groupByStats,
  statSignature,
} from "@/utils/profile";
import { computeFieldMaxima } from "@/utils/stats";
import { STAT_KEYS } from "@/types";
import type { EntityStats, Standing, StatKey, StatRecord } from "@/types";

import { createFixtures, realData } from "./helpers.mts";

const { randomInt, makeEntities } = createFixtures(20261114);

/** 暴力解：兩兩比較所有欄位，O(n²·k) */
const bruteForceGroups = (entities: readonly EntityStats[]) => {
  const groups: EntityStats[][] = [];
  for (const entity of entities) {
    const group = groups.find(([lead]) =>
      STAT_KEYS.every((key) => lead[key] === entity[key]),
    );
    if (group) group.push(entity);
    else groups.push([entity]);
  }
  return groups;
};

const memberNames = (groups: readonly { members: EntityStats[] }[]) =>
  groups.map(({ members }) => members.map(({ name }) => name).join("|"));

/** 暴力解：每個組合與其他所有組合逐一比較 */
const bruteForceStandings = (
  list: readonly StatRecord[],
  keys: readonly StatKey[],
): Standing[][] =>
  list.map((stats, row) =>
    keys.map((key) => {
      const others = list.filter((_, i) => i !== row).map((s) => s[key]);
      if (others.length === 0) return null;
      if (others.every((value) => stats[key] > value)) return "best";
      if (others.every((value) => stats[key] < value)) return "worst";
      return null;
    }),
  );

describe("性能分組", () => {
  it("真實資料：50 位角色分成 20 種性能，成員總數不變", () => {
    const groups = groupByStats(realData.characters);
    assert.equal(groups.length, 20);
    assert.equal(
      groups.reduce((sum, { members }) => sum + members.length, 0),
      realData.characters.length,
    );
  });

  it("隨機資料：分組結果與兩兩比較的暴力解一致", () => {
    for (let round = 0; round < 50; round++) {
      // 數值範圍小，確保常出現相同簽章
      const entities = makeEntities("e", randomInt(40)).map((entity) => ({
        ...entity,
        roadSpeed: entity.roadSpeed % 2,
        terrainSpeed: 0,
        waterSpeed: 0,
        roadHandling: 0,
        terrainHandling: 0,
        waterHandling: 0,
      }));
      const fast = new Set(memberNames(groupByStats(entities)));
      const brute = new Set(
        memberNames(bruteForceGroups(entities).map((members) => ({ members }))),
      );
      assert.deepEqual(fast, brute);
    }
  });

  it("群組依重量遞增、加速度遞減排序", () => {
    const groups = groupByStats(realData.characters);
    for (let i = 1; i < groups.length; i++) {
      const prev = groups[i - 1].lead;
      const curr = groups[i].lead;
      assert.ok(
        prev.weight < curr.weight ||
          (prev.weight === curr.weight &&
            prev.acceleration >= curr.acceleration),
      );
    }
  });

  it("簽章相同 ⇔ 所有欄位相同", () => {
    const [a, b] = realData.characters;
    assert.equal(statSignature(a), statSignature({ ...a }));
    assert.notEqual(statSignature(a), statSignature({ ...b, roadSpeed: 99 }));
  });
});

describe("跑法與體型", () => {
  it("依速度與加速度差判斷跑法", () => {
    const base = realData.characters[0];
    assert.equal(
      getPlayStyle({ ...base, displaySpeed: 6, acceleration: 1 }),
      "speed",
    );
    assert.equal(
      getPlayStyle({ ...base, displaySpeed: 0, acceleration: 7 }),
      "acceleration",
    );
    assert.equal(
      getPlayStyle({ ...base, displaySpeed: 4, acceleration: 3 }),
      "balanced",
    );
  });

  it("重量三等分", () => {
    assert.equal(getWeightClass(0, 6), "light");
    assert.equal(getWeightClass(2, 6), "medium");
    assert.equal(getWeightClass(4, 6), "heavy");
  });
});

describe("強弱項與賽道", () => {
  const maxima = computeFieldMaxima(realData.characters);

  it("強項比例 ≥ 60%、弱項 ≤ 30%，各最多兩項且不重疊", () => {
    for (const entity of realData.characters) {
      const { strong, weak } = getTraits(entity, maxima, "display");
      assert.ok(strong.length <= 2 && weak.length <= 2);
      assert.ok(strong.every((axis) => !weak.includes(axis)));
      assert.ok(strong.every((axis) => PROFILE_AXES.includes(axis)));
    }
  });

  it("瓦利歐擅長速度與重量", () => {
    const wario = realData.characters.find(({ englishName }) => englishName === "Wario");
    assert.ok(wario);
    const { strong } = getTraits(wario, maxima, "display");
    assert.deepEqual([...strong].sort(), ["speed", "weight"]);
  });

  it("最快賽道與最佳賽道取最大分數，同分取第一個", () => {
    const base = realData.characters[0];
    assert.equal(
      getFastestTerrain({ ...base, roadSpeed: 1, terrainSpeed: 5, waterSpeed: 5 }),
      "terrain",
    );
    assert.equal(
      getBestTerrain({
        ...base,
        roadSpeed: 3,
        terrainSpeed: 3,
        waterSpeed: 2,
        roadHandling: 0,
        terrainHandling: 1,
        waterHandling: 4,
      }),
      "water",
    );
  });
});

describe("組合間比較", () => {
  const keys: StatKey[] = ["roadSpeed", "acceleration", "weight"];

  it("隨機資料：單次走訪與兩兩比較的暴力解一致", () => {
    for (let round = 0; round < 200; round++) {
      const list = makeEntities("c", randomInt(6));
      assert.deepEqual(
        compareStandings(list, keys),
        bruteForceStandings(list, keys),
      );
    }
  });

  it("少於兩個組合時全部為 null", () => {
    const [only] = realData.characters;
    assert.deepEqual(compareStandings([only], keys), [[null, null, null]]);
  });
});
