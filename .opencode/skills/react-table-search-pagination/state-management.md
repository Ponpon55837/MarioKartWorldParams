# React 狀態管理選擇指南

## 概述

本指南提供 React/Next.js 應用中狀態管理的決策框架，幫助開發者根據專案規模和需求選擇最適合的狀態管理方案。

---

## 目錄

1. [核心原則：狀態分類](#1-核心原則狀態分類)
2. [決策樹](#2-決策樹)
3. [實戰組合策略](#3-實戰組合策略)
4. [最佳實踐](#4-最佳實踐)
5. [效能優化](#5-效能優化)
6. [工具選擇總結](#6-工具選擇總結)
7. [遷移建議](#7-遷移建議)

---

## 1. 核心原則：狀態分類

在 React/Next.js 應用中，狀態可以分為三種類型：

| 狀態類型       | 說明                 | 存儲位置                   | 範例                         |
| -------------- | -------------------- | -------------------------- | ---------------------------- |
| **伺服器狀態** | 來自 API 的資料      | TanStack Query / SWR       | 搜尋結果、用戶資料、列表     |
| **URL 狀態**   | 可分享、可書籤的狀態 | URL SearchParams           | 搜尋關鍵字、分頁、篩選條件   |
| **客戶端狀態** | UI 相關的本地狀態    | useState / Zustand / Jotai | Modal 開關、選中項、編輯模式 |

---

## 2. 決策樹

```
你的狀態需要...
│
├─ 從 API 獲取資料？
│  ├─ 是 → 使用 TanStack Query 或 SWR
│  └─ 否 → 繼續
│
├─ 需要 URL 分享/書籤？
│  ├─ 是 → 使用 URL SearchParams
│  └─ 否 → 繼續
│
├─ 跨多個組件共享？
│  ├─ 是 →
│  │  ├─ 簡單狀態 → Context API
│  │  └─ 複雜邏輯 → Zustand / Jotai
│  └─ 否 → 使用 useState / useReducer
```

---

## 3. 實戰組合策略

### 策略 A：小型專案（< 10 個頁面）

```javascript
// 組合：URL + useState + Context

// 1. URL 管理搜尋和分頁
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);

  const query = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";

  // 本地狀態管理 UI
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <SearchBar
        value={query}
        onChange={(v) => setSearchParams({ q: v, page: "1" })}
      />
      <ResultsList data={data} />
    </div>
  );
};
```

**適用場景**：

- 團隊小，React 經驗豐富
- 功能簡單，狀態互動少
- 不需要複雜的快取策略

### 策略 B：中型專案（10-50 個頁面）

```javascript
// 組合：TanStack Query + URL + Zustand

// 1. TanStack Query 處理資料獲取
const { data, isLoading } = useQuery({
  queryKey: ["search", query, page],
  queryFn: () => fetchSearch(query, page),
});

// 2. URL 管理可分享狀態
const [searchParams, setSearchParams] = useSearchParams();

// 3. Zustand 管理 UI 狀態
const useUIStore = create((set) => ({
  selectedIds: [],
  viewMode: "grid",
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
```

**適用場景**：

- 中等規模團隊
- 需要複雜的資料管理
- 有批量操作、選擇等互動

### 策略 C：大型專案（> 50 個頁面）

```javascript
// 組合：TanStack Query + URL + Zustand + Feature-based Store

// 特性：按功能模塊拆分 Store
// stores/search.js
export const useSearchStore = create((set) => ({
  filters: {},
  sortBy: "relevance",
  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy }),
}));

// stores/table.js
export const useTableStore = create((set) => ({
  selectedRows: [],
  expandedRows: [],
  toggleRow: (id) =>
    set((state) => ({
      selectedRows: state.selectedRows.includes(id)
        ? state.selectedRows.filter((i) => i !== id)
        : [...state.selectedRows, id],
    })),
}));

// 使用時按需導入
import { useSearchStore } from "@/stores/search";
import { useTableStore } from "@/stores/table";
```

**適用場景**：

- 大型團隊協作
- 多個複雜功能模塊
- 需要嚴格的狀態管理規範

---

## 4. 最佳實踐

### 原則 1：伺服器狀態與客戶端狀態分離

```javascript
// ❌ 錯誤：混在一起
const [state, setState] = useState({
  userData: null, // 伺服器狀態
  isModalOpen: false, // 客戶端狀態
  searchResults: [], // 伺服器狀態
  selectedId: null, // 客戶端狀態
});

// ✅ 正確：分離管理
// 伺服器狀態
const { data: userData } = useQuery({
  queryKey: ["user"],
  queryFn: fetchUser,
});
const { data: searchResults } = useQuery({
  queryKey: ["search", query],
  queryFn: () => fetchSearch(query),
});

// 客戶端狀態
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedId, setSelectedId] = useState(null);
```

### 原則 2：URL 作為 Source of Truth

```javascript
// ✅ 正確：URL 驅動狀態
const [searchParams] = useSearchParams();
const page = searchParams.get("page") || "1";
const query = searchParams.get("q") || "";

// 使用 URL 參數獲取資料
const { data } = useQuery({
  queryKey: ["items", page, query],
  queryFn: () => fetchItems({ page, query }),
});

// ❌ 錯誤：本地狀態與 URL 不同步
const [page, setPage] = useState(1); // 本地狀態
const [searchParams] = useSearchParams(); // URL 狀態
// 兩者可能不一致！
```

### 原則 3：避免過度全局化

```javascript
// ❌ 錯誤：所有狀態都放全局
const useGlobalStore = create((set) => ({
  userData: null,
  modalOpen: false,
  searchQuery: "",
  currentPage: 1,
  selectedItems: [],
  // ... 100+ 個狀態
}));

// ✅ 正確：按功能拆分
const useUserStore = create((set) => ({
  userData: null,
  updateUser: (data) => set({ userData: data }),
}));

const useSearchStore = create((set) => ({
  query: "",
  filters: {},
  setQuery: (q) => set({ query: q }),
}));
```

---

## 5. 效能優化

### 使用選擇器避免不必要的重渲染

```javascript
// ❌ 錯誤：訂閱整個 store
const Component = () => {
  const store = useStore(); // 任何狀態改變都會重渲染
  return <div>{store.specificValue}</div>;
};

// ✅ 正確：精確訂閱
const Component = () => {
  const specificValue = useStore((state) => state.specificValue);
  return <div>{specificValue}</div>;
};
```

### TanStack Query 的精確快取控制

```javascript
// 細粒度的快取控制
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 分鐘內視為新鮮
  gcTime: 10 * 60 * 1000, // 10 分鐘後回收
  refetchOnWindowFocus: false, // 視窗聚焦時不自動重抓
  refetchOnMount: false, // 組件掛載時不自動重抓
});
```

---

## 6. 工具選擇總結

| 工具               | 適用場景                 | 學習曲線 | 生態系統                   |
| ------------------ | ------------------------ | -------- | -------------------------- |
| **TanStack Query** | 所有需要資料獲取的專案   | 中       | 極佳（DevTools、插件豐富） |
| **SWR**            | 輕量級資料獲取           | 低       | 良好                       |
| **Zustand**        | 客戶端狀態管理           | 低       | 良好                       |
| **Jotai**          | 原子化狀態管理           | 中       | 中等                       |
| **Redux Toolkit**  | 超大型應用、需要時間旅行 | 高       | 極佳                       |
| **Context API**    | 簡單的狀態共享           | 低       | React 內建                 |

---

## 7. 遷移建議

如果你正在使用舊的狀態管理方案，建議的遷移路徑：

```
Redux → Redux Toolkit（漸進式）
       → Zustand（重構時）

useContext + useReducer → Zustand（中小型）
                        → Redux Toolkit（大型）

Prop Drilling → TanStack Query（伺服器狀態）
              → Zustand（客戶端狀態）
```

---

## 狀態管理組合推薦

| 專案特徵               | 推薦組合                                       | 理由               |
| ---------------------- | ---------------------------------------------- | ------------------ |
| **小型（< 10 頁）**    | URL + useState + Context                       | 輕量、快速         |
| **中型（10-30 頁）**   | TanStack Query + URL + Zustand                 | 平衡功能與複雜度   |
| **中大型（30-50 頁）** | TanStack Query + URL + Zustand (Feature-based) | 成熟穩定、易維護   |
| **大型（> 50 頁）**    | TanStack Query + URL + Redux Toolkit           | 完整生態、團隊規範 |
| **複雜狀態邏輯**       | TanStack Query + Jotai                         | 原子化細粒度控制   |
| **簡單 CRUD**          | SWR + Context                                  | 無需額外依賴       |

---

## 開發檢查清單

| 檢查項目       | 關鍵細節                         | 預期結果           |
| -------------- | -------------------------------- | ------------------ |
| **狀態分離**   | 伺服器狀態與客戶端狀態是否分離？ | 清晰的狀態架構     |
| **URL 同步**   | 可分享狀態是否存入 URL？         | 支援書籤和分享     |
| **全局狀態**   | 是否避免過度使用全局狀態？       | 減少不必要的重渲染 |
| **選擇器使用** | 是否使用選擇器精確訂閱？         | 效能優化           |
| **快取策略**   | 是否有合理的快取機制？           | 提升使用者體驗     |

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
