/**
 * 測試共用工具：真實資料、可重現亂數與隨機實體產生器
 */
import { readFileSync } from "node:fs";

import type { EntityStats, MarioKartData } from "@/types";

export const readPublic = (file: string) =>
  readFileSync(new URL(`../public/${file}`, import.meta.url), "utf8");

export const realData = JSON.parse(readPublic("mario-kart-data.json"))
  .data as MarioKartData;

/** 可重現的亂數產生器（mulberry32） */
const createRandom = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** 以固定種子建立亂數工具，同一種子每次產生相同資料 */
export const createFixtures = (seed: number) => {
  const random = createRandom(seed);
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

  return { random, randomInt, makeEntities };
};
