/**
 * 演算法測試：以暴力解（Brute Force）作為正確性基準（Oracle），
 * 驗證最佳化後的演算法在真實資料與隨機資料下結果完全一致。
 *
 * 執行：pnpm test（需 Node.js 22.18+，使用內建 TypeScript 型別剝除）
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { BinaryHeap, topK } from "@/utils/heap";
import {
  computeMaxCombinedStats,
  computeRecommendations,
  getTopCombinations,
  TERRAINS,
} from "@/utils/recommendation";
import { buildSearchIndex, searchEntities } from "@/utils/search";
import { parseCSVLine, parseMarioKartCSV } from "@/utils/csvParser";
import {
  combineStats,
  computeFieldMaxima,
  getSortKey,
  sortByStatDesc,
} from "@/utils/stats";
import { validateMarioKartData } from "@/utils/dataValidation";
import type { EntityStats, TerrainType } from "@/types";

const readPublic = (file: string) =>
  readFileSync(new URL(`../public/${file}`, import.meta.url), "utf8");

const realData = JSON.parse(readPublic("mario-kart-data.json")).data as {
  characters: EntityStats[];
  vehicles: EntityStats[];
};

// ==========================================
// 測試輔助
// ==========================================

/** 可重現的亂數產生器（mulberry32） */
const createRandom = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const random = createRandom(20260927);
const randomInt = (max: number) => Math.floor(random() * max);

const makeEntity = (prefix: string, index: number): EntityStats => ({
  name: `${prefix}${index}`,
  englishName: `${prefix}${index}`,
  displaySpeed: randomInt(8),
  roadSpeed: randomInt(8),
  terrainSpeed: randomInt(8),
  waterSpeed: randomInt(8),
  acceleration: randomInt(8),
  weight: randomInt(8),
  displayHandling: randomInt(8),
  roadHandling: randomInt(8),
  terrainHandling: randomInt(8),
  waterHandling: randomInt(8),
});

const makeEntities = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => makeEntity(prefix, i));

const TERRAIN_FIELDS = {
  road: ["roadSpeed", "roadHandling"],
  terrain: ["terrainSpeed", "terrainHandling"],
  water: ["waterSpeed", "waterHandling"],
} as const;

/**
 * 重構前的推薦演算法（暴力解）：列舉全部 C × V 組合、整體排序後做多樣性篩選
 */
const bruteForceTopCombinations = (
  characters: EntityStats[],
  vehicles: EntityStats[],
  terrain: TerrainType,
): string[] => {
  const [speedKey, handlingKey] = TERRAIN_FIELDS[terrain];
  const all: Array<{ c: EntityStats; v: EntityStats; score: number }> = [];

  for (const c of characters) {
    for (const v of vehicles) {
      const score =
        4 * (c[speedKey] + v[speedKey]) +
        3 * (c[handlingKey] + v[handlingKey]) +
        2 * (c.acceleration + v.acceleration) -
        (c.weight + v.weight);
      all.push({ c, v, score });
    }
  }
  all.sort((a, b) => b.score - a.score);

  const usage = new Map<string, number>();
  const seen = new Set<string>();
  const result: typeof all = [];

  for (const combo of all) {
    const count = usage.get(combo.v.name) ?? 0;
    if (count < 3) {
      result.push(combo);
      usage.set(combo.v.name, count + 1);
      seen.add(`${combo.c.name}-${combo.v.name}`);
    }
    if (result.length >= 10) break;
  }
  for (const combo of all) {
    if (result.length >= 10) break;
    const key = `${combo.c.name}-${combo.v.name}`;
    if (!seen.has(key)) {
      result.push(combo);
      seen.add(key);
    }
  }

  return result.map(({ c, v }) => `${c.name}+${v.name}`);
};

const fastTopCombinations = (
  characters: EntityStats[],
  vehicles: EntityStats[],
  terrain: TerrainType,
) =>
  getTopCombinations(characters, vehicles, terrain).map(
    (r) => `${r.character.name}+${r.vehicle.name}`,
  );

// ==========================================
// 測試
// ==========================================

describe("BinaryHeap / topK", () => {
  it("依比較函數依序彈出", () => {
    const heap = new BinaryHeap<number>((a, b) => a - b);
    const values = Array.from({ length: 200 }, () => randomInt(1000));
    values.forEach((v) => heap.push(v));

    const popped: number[] = [];
    while (heap.size > 0) popped.push(heap.pop()!);
    assert.deepEqual(
      popped,
      [...values].sort((a, b) => a - b),
    );
    assert.equal(heap.pop(), undefined);
  });

  it("topK 與排序後切片結果一致", () => {
    for (let i = 0; i < 500; i++) {
      const values = Array.from({ length: randomInt(40) }, () => randomInt(20));
      const k = randomInt(12);
      assert.deepEqual(
        topK(values, k, (a, b) => b - a),
        [...values].sort((a, b) => b - a).slice(0, k),
      );
    }
  });
});

describe("推薦演算法（K 路合併）", () => {
  it("真實資料：三種地形結果與暴力解完全一致", () => {
    for (const terrain of TERRAINS) {
      assert.deepEqual(
        fastTopCombinations(realData.characters, realData.vehicles, terrain),
        bruteForceTopCombinations(
          realData.characters,
          realData.vehicles,
          terrain,
        ),
      );
    }
  });

  it("隨機資料（含觸發補齊階段的小資料集）與暴力解一致", () => {
    for (let i = 0; i < 1000; i++) {
      const characters = makeEntities("c", 1 + randomInt(12));
      const vehicles = makeEntities("v", 1 + randomInt(6));
      for (const terrain of TERRAINS) {
        assert.deepEqual(
          fastTopCombinations(characters, vehicles, terrain),
          bruteForceTopCombinations(characters, vehicles, terrain),
        );
      }
    }
  });

  it("每個載具最多出現 3 次、排名連續", () => {
    const { road } = computeRecommendations(
      realData.characters,
      realData.vehicles,
    );
    assert.equal(road.length, 10);
    road.forEach((r, i) => assert.equal(r.rank, i + 1));

    const usage = new Map<string, number>();
    for (const r of road) {
      usage.set(r.vehicle.name, (usage.get(r.vehicle.name) ?? 0) + 1);
    }
    assert.ok([...usage.values()].every((count) => count <= 3));
  });

  it("分數與原始浮點公式一致", () => {
    for (const r of getTopCombinations(
      realData.characters,
      realData.vehicles,
      "water",
    )) {
      const expected =
        r.totalSpeed * 0.4 +
        r.totalHandling * 0.3 +
        r.totalAcceleration * 0.2 -
        r.totalWeight * 0.1;
      assert.ok(Math.abs(r.score - expected) < 1e-9);
    }
  });

  it("max(c + v) = max(c) + max(v)，與列舉全部組合一致", () => {
    for (let i = 0; i < 300; i++) {
      const characters = makeEntities("c", 1 + randomInt(10));
      const vehicles = makeEntities("v", 1 + randomInt(10));

      const expected = { speed: 0, acceleration: 0, weight: 0, handling: 0 };
      for (const c of characters) {
        for (const v of vehicles) {
          for (const terrain of TERRAINS) {
            const [s, h] = TERRAIN_FIELDS[terrain];
            expected.speed = Math.max(expected.speed, c[s] + v[s]);
            expected.handling = Math.max(expected.handling, c[h] + v[h]);
          }
          expected.acceleration = Math.max(
            expected.acceleration,
            c.acceleration + v.acceleration,
          );
          expected.weight = Math.max(expected.weight, c.weight + v.weight);
        }
      }
      assert.deepEqual(computeMaxCombinedStats(characters, vehicles), expected);
    }
  });

  it("空資料回傳空結果", () => {
    const result = computeRecommendations([], realData.vehicles);
    assert.deepEqual(result.road, []);
    assert.deepEqual(result.maxCombinedStats, {
      speed: 1,
      acceleration: 1,
      weight: 1,
      handling: 1,
    });
  });
});

describe("能力值工具", () => {
  it("sortByStatDesc 為穩定的遞減排序", () => {
    for (let i = 0; i < 200; i++) {
      const entities = makeEntities("e", randomInt(30));
      assert.deepEqual(
        sortByStatDesc(entities, "terrainHandling"),
        [...entities].sort((a, b) => b.terrainHandling - a.terrainHandling),
      );
    }
  });

  it("getSortKey 查表", () => {
    assert.equal(getSortKey("speed", "water", "display"), "waterSpeed");
    assert.equal(getSortKey("handling", "road", "terrain"), "terrainHandling");
    assert.equal(getSortKey("weight", "road", "road"), "weight");
  });

  it("combineStats 加上遊戲加成", () => {
    const [c] = realData.characters;
    const [v] = realData.vehicles;
    const combined = combineStats(c, v);
    assert.equal(combined.roadSpeed, c.roadSpeed + v.roadSpeed + 3);
    assert.equal(combined.weight, c.weight + v.weight + 3);
  });

  it("computeFieldMaxima 最小值為 1", () => {
    assert.equal(computeFieldMaxima([]).displaySpeed, 1);
    const maxima = computeFieldMaxima(realData.characters, realData.vehicles);
    const all = [...realData.characters, ...realData.vehicles];
    assert.equal(maxima.roadSpeed, Math.max(1, ...all.map((e) => e.roadSpeed)));
  });
});

describe("搜尋", () => {
  const index = buildSearchIndex(realData.characters, realData.vehicles);

  const topEnglishName = (query: string) => {
    const [first] = searchEntities(index, query);
    assert.ok(first && first.type !== "combination");
    return first.data.englishName;
  };

  it("完全比對排在最前面，中英文皆可搜尋", () => {
    assert.equal(topEnglishName("Mario"), "Mario");
    assert.equal(topEnglishName("瑪利歐"), "Mario");
  });

  it("空白查詢與無相關結果回傳空陣列", () => {
    assert.deepEqual(searchEntities(index, "   "), []);
    assert.deepEqual(searchEntities(index, "zzzzzz"), []);
  });

  it("結果數量不超過上限", () => {
    assert.ok(searchEntities(index, "a", 5).length <= 5);
  });
});

describe("CSV 解析", () => {
  it("public CSV 解析結果與 JSON 資料一致", () => {
    assert.deepEqual(
      parseMarioKartCSV(readPublic("mario-kart-data.csv")),
      realData,
    );
  });

  it("支援引號欄位、跳脫引號與 CRLF", () => {
    assert.deepEqual(parseCSVLine('a,"b,c", d ,'), ["a", "b,c", "d", ""]);
    assert.deepEqual(parseCSVLine('"say ""hi"""'), ['say "hi"']);
    assert.deepEqual(parseCSVLine(""), [""]);
    const { characters } = parseMarioKartCSV(
      "h1\r\nh2\r\n,瑪利歐,Mario,1,2,3,4,0,5,6,7,8,9,10\r\n",
    );
    assert.equal(characters[0].englishName, "Mario");
    assert.equal(characters[0].waterHandling, 10);
  });
});

describe("資料驗證", () => {
  it("真實資料通過驗證", () => {
    assert.equal(validateMarioKartData(realData).isValid, true);
  });

  it("偵測重複名稱與無效數值", () => {
    const [first] = realData.characters;
    const result = validateMarioKartData({
      characters: [first, { ...first, roadSpeed: -1 }],
      vehicles: realData.vehicles,
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes("重複的角色名稱")));
    assert.ok(result.errors.some((e) => e.includes("roadSpeed 不能為負數")));
  });
});
