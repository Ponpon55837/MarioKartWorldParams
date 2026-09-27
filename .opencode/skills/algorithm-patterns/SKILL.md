---
name: algorithm-patterns
description: |
  LeetCode 式演算法與資料結構優化指南。說明本專案在推薦、搜尋、排序、CSV 解析、資料驗證中採用的演算法模式（Hash Map 查表、堆積 Top-K、K 路合併、可分解最大值、Decorate-Sort-Undecorate、雙指標掃描、請求去重），以及「暴力解 Oracle + 隨機測試」的驗證流程。

  觸發時機：新增或修改任何涉及大量資料計算、排序、搜尋、組合列舉、推薦評分的程式碼；在 Jotai 衍生 atom 中加入計算邏輯；進行效能優化或重構 src/utils 下的純函數時。
license: MIT
---

# 演算法模式（LeetCode 做法）

## 我的功能

- 提供本專案已採用的演算法模式與其所在位置
- 指導如何把 O(n²) / O(n log n) 的暴力寫法改寫成更佳的複雜度
- 規範「純函數放 `src/utils/`、以暴力解為 Oracle 撰寫測試」的驗證流程

## 何時使用我

- 撰寫會隨資料量成長的計算邏輯（組合列舉、排序、搜尋、統計）
- 在 `src/store/dataAtoms.ts` 新增衍生 atom 時
- 修改 `src/utils/` 下的演算法檔案時
- Code Review 發現巢狀迴圈、comparator 中重複計算、`Array.find` 反覆查找時

## 核心原則

1. **計算與 UI 分離**：演算法一律寫成 `src/utils/` 下的純函數，Jotai 衍生 atom 只負責「組合依賴 + 呼叫純函數」，元件只負責渲染。
2. **先寫暴力解，再最佳化**：暴力解保留在 `tests/` 中作為 Oracle，最佳化版本必須與它在真實資料與隨機資料下結果完全一致。
3. **不要自己做快取**：Jotai 衍生 atom 會依依賴自動快取，不需要模組層級的 `Map` 快取（容易產生失效錯誤與記憶體洩漏）。
4. **分數用整數**：加權評分放大成整數運算（例如權重 ×10），避免浮點誤差造成同分排序不穩定，顯示時再除回來。

## 專案中的演算法模式

| 模式                                | LeetCode 對應          | 位置                                           | 複雜度                             |
| ----------------------------------- | ---------------------- | ---------------------------------------------- | ---------------------------------- |
| Hash Map 查表取代 switch            | 1. Two Sum             | `utils/stats.ts` `SPEED_KEY_BY_FILTER`         | O(1)                               |
| 名稱 → 實體 Map                     | 1. Two Sum             | `CombinationSelector.tsx`                      | O(1) 查找                          |
| 二元堆積                            | 堆積基礎               | `utils/heap.ts` `BinaryHeap`                   | push/pop O(log n)                  |
| Top-K 堆積                          | 215 / 347              | `utils/heap.ts` `topK`、`utils/search.ts`      | O(n log K)                         |
| K 路合併                            | 23 / 373 Find K Pairs  | `utils/recommendation.ts` `getTopCombinations` | O(C log C + V log V + (V+K) log V) |
| 可分解最大值 max(a+b)=max(a)+max(b) | —                      | `computeMaxCombinedStats`                      | O(C + V)，原為 O(C·V)              |
| Decorate-Sort-Undecorate            | 穩定排序               | `utils/stats.ts` `sortByStatDesc`              | O(n log n)，鍵只取一次             |
| 單次走訪求多欄最大值                | 一次遍歷               | `utils/stats.ts` `computeFieldMaxima`          | O(n·k)                             |
| 雙指標 + slice                      | 字串掃描               | `utils/csvParser.ts` `parseCSVLine`            | O(n)，不逐字串接                   |
| Set 偵測重複                        | 217 Contains Duplicate | `utils/dataValidation.ts`                      | O(n)                               |
| 預先建立索引                        | 前處理                 | `searchIndexAtom`（名稱預先轉小寫）            | 每次查詢省去 O(n) 轉換             |
| 進行中請求去重                      | —                      | `store/dataAtoms.ts` `inflightRequest`         | 同時多次呼叫只發一次請求           |
| LRU 歷史                            | 146 LRU Cache（簡化）  | `utils/searchHistory.ts`                       | 最近使用移到最前                   |

### 推薦演算法重點（K 路合併）

評分是線性函數，可拆成「角色分數 + 載具分數」：

```text
score(c, v) = f(c) + f(v)
```

1. 角色、載具各自依分數排序（同分依原始索引）
2. 每個載具視為一條「依角色分數遞減」的已排序串列
3. 以堆積做 K 路合併，每次彈出全域最高分組合
4. 多樣性限制（同一載具最多 3 次）＝每條串列只取前 3 個
5. 湊不滿 10 個時，從每條串列第 4 個之後繼續合併補齊

真實資料（50 角色 × 40 載具）約快 19 倍；500 × 500 時約快 250 倍。

## 撰寫新演算法的流程

1. 在 `src/utils/` 新增純函數，參數使用 `readonly` 陣列，不修改輸入
2. 在 `tests/algorithms.test.mts` 先寫暴力解，再以固定種子的亂數資料做屬性測試
3. 在衍生 atom 中呼叫純函數，不在元件內 `useMemo` 重複計算
4. 執行驗證：

```bash
pnpm test
pnpm type-check
pnpm lint
pnpm build
```

## 反模式

```typescript
// ❌ comparator 內重複查找 / switch
list.sort((a, b) => getValue(b, filter) - getValue(a, filter));

// ✅ 先查表取得欄位，再 Decorate-Sort-Undecorate
const key = getSortKey(sortBy, speedFilter, handlingFilter);
sortByStatDesc(list, key);

// ❌ 列舉全部組合後整體排序，只為取前 10 名
const all = characters.flatMap((c) => vehicles.map((v) => score(c, v)));
all.sort((a, b) => b - a).slice(0, 10);

// ✅ 可分解評分 → K 路合併 / 需要前 K 名 → 堆積 topK
getTopCombinations(characters, vehicles, terrain);
topK(candidates, 20, (a, b) => b.score - a.score);

// ❌ 在迴圈中反覆 Array.find
selected.map((name) => characters.find((c) => c.name === name));

// ✅ 先建 Map
const byName = new Map(characters.map((c) => [c.name, c]));
```

## 相關技能

- [`code-standards`](../code-standards/SKILL.md) - 編碼規範與驗證指令
- [`react-best-practices`](../react-best-practices/SKILL.md) - `js-set-map-lookups`、`js-min-max-loop` 等 JS 效能規則
- [`state-management`](../../../.github/skills/state-management/SKILL.md) - Jotai 衍生 atom 架構
