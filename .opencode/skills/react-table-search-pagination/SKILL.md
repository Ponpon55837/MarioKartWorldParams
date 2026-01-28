# React/Next.js 專案開發指南 (SKILL.md)

## 概述

本指南整合了 React/Next.js 專案開發中的核心技術實作與最佳實踐，涵蓋資料處理、效能優化、使用者體驗提升等關鍵領域。

---

## 目錄

1. [競態條件處理 (Race Condition)](#1-競態條件處理-race-condition)
2. [搜尋系統實作](#2-搜尋系統實作)
3. [分頁系統實作](#3-分頁系統實作)
4. [動態加載與無限捲動](#4-動態加載與無限捲動)
5. [列表資料 CRUD 同步](#5-列表資料-crud-同步)
6. [Intersection Observer API](#6-intersection-observer-api)
7. [狀態管理選擇指南](#7-狀態管理選擇指南)

---

## 1. 競態條件處理 (Race Condition)

### 1.1 核心問題

當短時間內觸發多次非同步請求時，由於網路環境波動，請求的回傳順序可能與發送順序不一致，導致畫面顯示錯誤資料。

### 1.2 常見情境

#### 搜尋自動完成
```
使用者快速輸入 A -> Ap -> App -> Apple
結果：搜尋 A 的結果最慢回傳，覆蓋了 Apple 的結果
```

#### 分頁快速點擊
```
使用者連續點擊「下一頁」
結果：第 2 頁資料比第 3 頁慢回傳，覆蓋了正確的資料
```

#### 多重篩選條件
```
使用者快速切換過濾條件
結果：舊條件的資料覆蓋新條件的結果
```

### 1.3 解決方案

#### 方案 A：閉包標記法 (Boolean Flag)

**適用情境**：基礎場景，不需額外 API

```javascript
useEffect(() => {
  let isCurrent = true; // 標記請求是否「新鮮」
  
  const fetchData = async () => {
    const data = await api.getData(id);
    if (isCurrent) {
      setData(data); // 只有新鮮的請求才能更新 State
    }
  };
  
  fetchData();
  
  return () => {
    isCurrent = false; // 標記為「舊」
  };
}, [id]);
```

**優點**：
- 邏輯簡單，易於理解
- 不需依賴額外 API

**缺點**：
- 舊請求仍會佔用網路資源
- 不適合大量資料傳輸場景

#### 方案 B：AbortController (推薦)

**適用情境**：正式專案、需要節省資源

```javascript
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      const data = await response.json();
      setData(data);
    } catch (err) {
      if (err.name === 'AbortError') return; // 忽略主動取消的錯誤
      // 處理真正的網路錯誤
      setError(err);
    }
  };
  
  fetchData();
  
  return () => controller.abort(); // 直接切斷連線
}, [url]);
```

**優點**：
- 節省使用者流量
- 減輕後端壓力
- 是目前最正規的寫法

**AbortController 進階用法：清除多個事件監聽器**

```javascript
const controller = new AbortController();

// 同時監聽多個事件
window.addEventListener('resize', handleResize, { 
  signal: controller.signal 
});
window.addEventListener('scroll', handleScroll, { 
  signal: controller.signal 
});

// 一次性清除所有監聽器
controller.abort();
```

#### 方案 C：宣告式資料管理 (TanStack Query / SWR)

**適用情境**：企業級專案、複雜快取邏輯

**TanStack Query 範例**：
```javascript
const { data, isLoading } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
```

**SWR 範例**：
```javascript
import useSWR from 'swr';

function Profile({ id }) {
  const { data, error, isLoading } = useSWR(
    `/api/user/${id}`, 
    fetcher
  );
  
  if (isLoading) return <div>Loading...</div>;
  return <div>Hello {data.name}!</div>;
}
```

**優點**：
- 內建競態條件處理
- 自動快取與重新驗證
- 減少樣板代碼

### 1.4 最佳實踐

| 情境 | 推薦方案 | 理由 |
|------|---------|------|
| 簡單資料抓取 | Boolean Flag | 簡單直觀，學習成本低 |
| 正式專案 | AbortController | 效能最佳，資源節省 |
| 企業級應用 | TanStack Query/SWR | 功能完整，開發效率高 |

---

## 2. 搜尋系統實作

### 2.1 核心挑戰與解決方案

| 開發階段 | 問題點 | 技術方案 | 達成目標 |
|---------|--------|---------|---------|
| **輸入中** | 每輸入一個字就發送 API | Debounce (防抖) | 減少 API 請求頻率 |
| **非同步** | 舊請求覆蓋新請求 | AbortController | 解決競態條件 |
| **輸入法** | 中/日/韓文拼音觸發無效搜尋 | Composition Events | 優化亞洲語系體驗 |
| **點擊時** | 連點按鈕導致重複搜尋 | Loading State + Disabled | UI 層面阻隔重複操作 |
| **快取** | 重複搜尋產生多餘請求 | useRef Cache 或 React Query | 提升回訪速度 |
| **分享** | 無法透過 URL 分享搜尋結果 | URL SearchParams | URL 即狀態 (Source of Truth) |

### 2.2 自動完成 (Autocomplete)

**完整實作範例**：

```javascript
import { useState, useEffect } from 'react';

export function useAutocomplete(searchTerm) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // 1. 建立 AbortController
    const controller = new AbortController();
    
    // 2. 設定防抖 (300ms)
    const timer = setTimeout(async () => {
      if (!searchTerm) {
        setResults([]);
        return;
      }
      
      try {
        const response = await fetch(
          `/api/search?q=${searchTerm}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        setResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    }, 300);
    
    // 3. 清除函數：取消 Timer 和 API 請求
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);
  
  return results;
}
```

### 2.3 輸入法優化 (Composition Events)

**問題**：中文輸入時，`onChange` 會在選字過程中觸發，發送如「ㄋㄧ」的無意義請求。

**解決方案**：

```javascript
const SearchInput = ({ onSearch }) => {
  const isComposing = useRef(false);
  
  const handleChange = (e) => {
    if (!isComposing.current) {
      onSearch(e.target.value);
    }
  };
  
  return (
    <input
      onChange={handleChange}
      onCompositionStart={() => {
        isComposing.current = true;
      }}
      onCompositionEnd={(e) => {
        isComposing.current = false;
        // 選字結束後主動觸發一次搜尋
        onSearch(e.target.value);
      }}
    />
  );
};
```

### 2.4 點擊防護 (Loading State)

**防止連點的正規寫法**：

```javascript
const SearchButtonAction = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    if (loading) return; // 物理鎖定
    
    setLoading(true);
    try {
      await fetchSearchAPI();
    } catch (error) {
      // 錯誤處理
    } finally {
      // 確保無論成功失敗，都要解鎖
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleSearch} 
      disabled={loading}
    >
      {loading ? '搜尋中...' : '搜尋'}
    </button>
  );
};
```

### 2.5 URL 狀態管理 (Source of Truth)

**將搜尋狀態存放在 URL 中**：

```javascript
import { useSearchParams } from 'react-router-dom';

const SearchContainer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 從 URL 取得參數
  const currentParams = {
    query: searchParams.get('q') || '',
    page: searchParams.get('page') || '1',
    category: searchParams.get('cat') || 'all'
  };
  
  const updateSearch = (newParams) => {
    // 1. 合併新舊參數
    const mergedParams = { ...currentParams, ...newParams };
    
    // 2. 清理無效值
    const cleanParams = Object.fromEntries(
      Object.entries(mergedParams)
        .filter(([_, v]) => v && v !== 'all')
    );
    
    // 3. 更新 URL
    setSearchParams(cleanParams);
  };
  
  return (
    <input
      value={currentParams.query}
      onChange={(e) => updateSearch({ 
        query: e.target.value, 
        page: '1' // 搜尋時回到第一頁
      })}
    />
  );
};
```

**優點**：
- 可分享：使用者複製 URL 後，他人打開看到相同結果
- 可書籤：使用者可以收藏搜尋結果頁面
- 重新整理後狀態保留

---

## 3. 分頁系統實作

### 3.1 完整實作範例

結合防抖、AbortController、快取、URL 同步：

```javascript
import { useState, useEffect, useRef } from 'react';

const SearchSystem = ({ query, page, pageSize }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 快取機制：使用 useRef 存儲
  const cache = useRef({});
  const abortControllerRef = useRef(null);
  
  useEffect(() => {
    // 1. 防抖機制：設定 300ms 延遲
    const timer = setTimeout(async () => {
      // 生成唯一的快取 Key
      const cacheKey = `${query}-${page}-${pageSize}`;
      
      // 2. 檢查快取
      if (cache.current[cacheKey]) {
        setData(cache.current[cacheKey]);
        return;
      }
      
      // 3. 非同步防護：中斷上一次未完成的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      // 4. 防連點機制：進入 Loading 狀態
      setIsLoading(true);
      
      try {
        const response = await fetch(
          `/api/data?q=${query}&page=${page}&size=${pageSize}`,
          { signal: abortControllerRef.current.signal }
        );
        const result = await response.json();
        
        // 5. 更新快取並設置資料
        cache.current[cacheKey] = result;
        setData(result);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("API Error:", err);
      } finally {
        // 6. 解鎖 Loading 狀態
        setIsLoading(false);
      }
    }, 300);
    
    // 清除函數：取消 timer 和進行中的請求
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, page, pageSize]);
  
  return (
    <div>
      <button disabled={isLoading}>
        {isLoading ? '載入中...' : '下一頁'}
      </button>
    </div>
  );
};
```

### 3.2 分頁組件行為規範

**必須遵守的規範**：

1. **回到首頁**：點擊「搜尋」或「切換每頁筆數」時，強制 `page = 1`
2. **非法頁碼處理**：若 URL 上的 `page` 超過總頁數，自動重導向至最後一頁
3. **物理邊界**：
   - 第一頁時：「首頁」與「上一頁」按鈕必須為 `disabled`
   - 最後一頁時：「末頁」與「下一頁」按鈕必須為 `disabled`

### 3.3 快取失效策略

**快取管理範例**：

```javascript
// 帶有時間戳記的快取管理
const setCache = (key, value) => {
  cache.current[key] = {
    data: value,
    timestamp: Date.now()
  };
};

const getCache = (key) => {
  const entry = cache.current[key];
  if (!entry) return null;
  
  // 超過 5 分鐘則失效
  if (Date.now() - entry.timestamp > 300000) {
    delete cache.current[key];
    return null;
  }
  
  return entry.data;
};
```

**快取清除時機**：
- **手動清除**：使用者執行 CRUD 操作時，立即清空 `cache.current = {}`
- **容量控制**：快取超過 100 筆時，自動刪除最早的快取 (FIFO)
- **時間過期**：超過 5 分鐘的資料視為失效

### 3.4 異常處理

#### 空結果處理

```javascript
if (data.length === 0) {
  return (
    <div className="empty-state">
      <p>找不到與「{query}」相關的結果</p>
      <button onClick={clearFilters}>
        清除過濾條件
      </button>
    </div>
  );
}
```

#### API 錯誤回退

```javascript
try {
  const response = await fetch(url);
  const data = await response.json();
  setData(data);
} catch (error) {
  // 保留當前畫面資料，顯示錯誤提示
  toast.error('網路不穩定，請稍後再試');
  // 不執行 setData，避免列表崩潰
}
```

#### 非法分頁請求處理

```javascript
const sanitizeParams = (page, totalPages) => {
  const p = parseInt(page);
  if (isNaN(p) || p < 1) return 1;
  if (p > totalPages) return totalPages;
  return p;
};

// 使用
const safePage = sanitizeParams(
  searchParams.get('page'), 
  totalPages
);
```

### 3.5 效能優化

#### 虛擬滾動 (Virtual List)

**使用情境**：單頁筆數 > 100 且每筆資料包含複雜 DOM

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualList = ({ items }) => {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // 每個項目的估計高度
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 預抓取 (Prefetching)

```javascript
const onHoverNext = () => {
  const nextKey = `${query}-${page + 1}-${pageSize}`;
  
  if (!cache.current[nextKey]) {
    // 背景預抓取，不顯示 Loading 狀態
    prefetchApi(query, page + 1, pageSize)
      .then(data => {
        cache.current[nextKey] = data;
      });
  }
};

return (
  <button 
    onMouseEnter={onHoverNext}
    onClick={goToNextPage}
  >
    下一頁
  </button>
);
```

### 3.6 與狀態管理庫整合

當搜尋、分頁狀態需要在多個組件間共享時，建議使用專門的狀態管理方案。

#### 方案 A：TanStack Query (推薦用於資料獲取)

```javascript
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('size') || '20');
  
  // TanStack Query 自動處理：
  // - 競態條件
  // - 快取管理
  // - 重新驗證
  // - Loading 狀態
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, page, pageSize],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/search?q=${query}&page=${page}&size=${pageSize}`,
        { signal } // 自動處理 AbortController
      );
      return response.json();
    },
    // 快取 5 分鐘
    staleTime: 5 * 60 * 1000,
    // 啟用快取持久化
    gcTime: 10 * 60 * 1000,
  });
  
  const updateParams = (newParams) => {
    const merged = { 
      q: query, 
      page: page.toString(), 
      size: pageSize.toString(),
      ...newParams 
    };
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v)
    );
    setSearchParams(cleaned);
  };
  
  return (
    <div>
      <SearchInput 
        value={query}
        onChange={(value) => updateParams({ q: value, page: '1' })}
      />
      
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      
      <SearchResults data={data?.items || []} />
      
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={(newPage) => updateParams({ page: newPage.toString() })}
      />
    </div>
  );
};
```

**TanStack Query 的優勢**：
- 自動處理 AbortController
- 內建快取與失效策略
- 自動重試與錯誤處理
- 樂觀更新支援
- DevTools 支援

#### 方案 B：Zustand (推薦用於 UI 狀態)

```javascript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 創建 store
const useSearchStore = create(
  devtools((set, get) => ({
    // 狀態
    query: '',
    page: 1,
    pageSize: 20,
    items: [],
    isLoading: false,
    error: null,
    totalPages: 1,
    
    // Actions
    setQuery: (query) => set({ query, page: 1 }), // 搜尋時回到第一頁
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    
    // 獲取資料
    fetchData: async () => {
      const { query, page, pageSize } = get();
      
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch(
          `/api/search?q=${query}&page=${page}&size=${pageSize}`
        );
        const data = await response.json();
        
        set({ 
          items: data.items,
          totalPages: data.totalPages,
          isLoading: false 
        });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },
    
    // 重置
    reset: () => set({
      query: '',
      page: 1,
      items: [],
      error: null
    })
  }))
);

// 使用 store
const SearchPage = () => {
  const { 
    query, 
    page, 
    items, 
    isLoading,
    totalPages,
    setQuery, 
    setPage, 
    fetchData 
  } = useSearchStore();
  
  useEffect(() => {
    fetchData();
  }, [query, page, fetchData]);
  
  return (
    <div>
      <SearchInput 
        value={query}
        onChange={setQuery}
      />
      
      {isLoading && <LoadingSpinner />}
      <SearchResults data={items} />
      
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

// 其他組件也可以訪問相同的狀態
const SearchSummary = () => {
  const { query, items } = useSearchStore();
  
  return (
    <div>
      搜尋「{query}」找到 {items.length} 筆結果
    </div>
  );
};
```

**Zustand 的優勢**：
- 極簡 API，學習成本低
- 無需 Context Provider
- 支援 DevTools
- TypeScript 友善
- 效能優異（精確訂閱）

#### 方案 C：Jotai (原子化狀態管理)

**適用情境**：需要細粒度狀態更新、避免不必要的重渲染

```javascript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { useSearchParams } from 'react-router-dom';

// 1. 定義 atoms
// URL 參數 atoms（衍生自 URL）
const searchParamsAtom = atom((get) => {
  const [searchParams] = useSearchParams();
  return {
    query: searchParams.get('q') || '',
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('size') || '20'),
  };
});

// 資料查詢 atom（使用 jotai-tanstack-query）
const searchDataAtom = atomWithQuery((get) => {
  const params = get(searchParamsAtom);
  return {
    queryKey: ['search', params.query, params.page, params.pageSize],
    queryFn: async () => {
      const response = await fetch(
        `/api/search?q=${params.query}&page=${params.page}&size=${params.pageSize}`
      );
      return response.json();
    },
    // TanStack Query 選項
    staleTime: 5 * 60 * 1000,
  };
});

// UI 狀態 atoms
const isModalOpenAtom = atom(false);
const selectedIdsAtom = atom([]);
const viewModeAtom = atom('grid'); // 'grid' | 'list'

// 衍生 atom：計算選中數量
const selectedCountAtom = atom((get) => get(selectedIdsAtom).length);

// 寫入 atom：切換選擇
const toggleSelectAtom = atom(
  null,
  (get, set, id) => {
    const current = get(selectedIdsAtom);
    set(
      selectedIdsAtom,
      current.includes(id)
        ? current.filter(i => i !== id)
        : [...current, id]
    );
  }
);

// 2. 使用 atoms
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 讀取資料（自動訂閱）
  const { data, isLoading, error } = useAtomValue(searchDataAtom);
  
  // 讀取 UI 狀態
  const [isModalOpen, setIsModalOpen] = useAtom(isModalOpenAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const selectedCount = useAtomValue(selectedCountAtom);
  const toggleSelect = useSetAtom(toggleSelectAtom);
  
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams);
    const merged = { ...current, ...newParams };
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v)
    );
    setSearchParams(cleaned);
  };
  
  return (
    <div>
      <SearchInput
        value={searchParams.get('q') || ''}
        onChange={(value) => updateParams({ q: value, page: '1' })}
      />
      
      <div className="toolbar">
        <ViewToggle value={viewMode} onChange={setViewMode} />
        <span>已選擇 {selectedCount} 項</span>
      </div>
      
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      
      <SearchResults
        data={data?.items || []}
        viewMode={viewMode}
        onToggleSelect={toggleSelect}
      />
      
      <button onClick={() => setIsModalOpen(true)}>
        打開設定
      </button>
      
      {isModalOpen && (
        <SettingsModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

// 3. 在其他組件中也可以訂閱相同的 atoms
const SearchSummary = () => {
  const params = useAtomValue(searchParamsAtom);
  const selectedCount = useAtomValue(selectedCountAtom);
  
  return (
    <div>
      搜尋「{params.query}」，已選擇 {selectedCount} 項
    </div>
  );
};
```

**Jotai 的優勢**：
- 原子化設計：每個 atom 獨立，組件只訂閱需要的 atom
- 零樣板代碼：不需要 Provider、Context、reducer
- 與 TanStack Query 完美整合（jotai-tanstack-query）
- TypeScript 自動推導類型
- 支援 React Suspense
- 效能極佳：精確訂閱，最小化重渲染

**進階：Jotai 的 atomFamily（動態 atoms）**

```javascript
import { atomFamily } from 'jotai/utils';

// 為每個商品 ID 創建獨立的 atom
const productAtomFamily = atomFamily((productId) =>
  atomWithQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  })
);

// 使用
const ProductCard = ({ productId }) => {
  const { data, isLoading } = useAtomValue(productAtomFamily(productId));
  
  if (isLoading) return <Skeleton />;
  return <div>{data.name}</div>;
};
```

**Jotai 與其他庫對比**：

| 特性 | Jotai | Zustand | Redux Toolkit |
|------|-------|---------|---------------|
| 學習曲線 | 低 | 低 | 中 |
| 樣板代碼 | 極少 | 少 | 中等 |
| 重渲染優化 | 自動（原子化） | 手動選擇器 | 手動選擇器 |
| DevTools | 有 | 有 | 極佳 |
| 適用場景 | 中小型複雜狀態 | 通用場景 | 大型應用 |

#### 方案 D：URL + Context (輕量級方案)

```javascript
import { createContext, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('size') || '20');
  
  const abortControllerRef = useRef(null);
  const cache = useRef({});
  
  const updateParams = (newParams) => {
    const merged = { 
      q: query, 
      page: page.toString(), 
      size: pageSize.toString(),
      ...newParams 
    };
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v)
    );
    setSearchParams(cleaned);
  };
  
  useEffect(() => {
    const cacheKey = `${query}-${page}-${pageSize}`;
    
    if (cache.current[cacheKey]) {
      setData(cache.current[cacheKey]);
      return;
    }
    
    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      
      try {
        const response = await fetch(
          `/api/search?q=${query}&page=${page}&size=${pageSize}`,
          { signal: abortControllerRef.current.signal }
        );
        const result = await response.json();
        
        cache.current[cacheKey] = result;
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, page, pageSize]);
  
  const value = {
    query,
    page,
    pageSize,
    data,
    isLoading,
    updateParams
  };
  
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

// 使用
const SearchPage = () => {
  const { query, data, isLoading, updateParams } = useSearch();
  
  return (
    <div>
      <SearchInput 
        value={query}
        onChange={(value) => updateParams({ q: value, page: '1' })}
      />
      {isLoading && <LoadingSpinner />}
      <SearchResults data={data} />
    </div>
  );
};
```

#### 方案 E：Redux Toolkit (大型應用)

**適用情境**：大型應用、需要嚴格的狀態管理規範、時間旅行調試

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

// 1. 定義 async thunk
export const fetchSearchResults = createAsyncThunk(
  'search/fetchResults',
  async ({ query, page, pageSize }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/search?q=${query}&page=${page}&size=${pageSize}`
      );
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. 定義 slice
const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    page: 1,
    pageSize: 20,
    items: [],
    totalPages: 1,
    isLoading: false,
    error: null,
    viewMode: 'grid',
    selectedIds: [],
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
      state.page = 1; // 搜尋時回到第一頁
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    toggleSelect: (state, action) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter(i => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setQuery,
  setPage,
  setPageSize,
  setViewMode,
  toggleSelect,
  clearSelection,
} = searchSlice.actions;

// 3. Selectors
export const selectSearchQuery = (state) => state.search.query;
export const selectSearchPage = (state) => state.search.page;
export const selectSearchItems = (state) => state.search.items;
export const selectSearchIsLoading = (state) => state.search.isLoading;
export const selectViewMode = (state) => state.search.viewMode;
export const selectSelectedIds = (state) => state.search.selectedIds;
export const selectSelectedCount = (state) => state.search.selectedIds.length;

export default searchSlice.reducer;

// 4. 使用
const SearchPage = () => {
  const dispatch = useDispatch();
  
  const query = useSelector(selectSearchQuery);
  const page = useSelector(selectSearchPage);
  const pageSize = useSelector((state) => state.search.pageSize);
  const items = useSelector(selectSearchItems);
  const isLoading = useSelector(selectSearchIsLoading);
  const viewMode = useSelector(selectViewMode);
  const selectedIds = useSelector(selectSelectedIds);
  
  useEffect(() => {
    dispatch(fetchSearchResults({ query, page, pageSize }));
  }, [dispatch, query, page, pageSize]);
  
  return (
    <div>
      <SearchInput
        value={query}
        onChange={(value) => dispatch(setQuery(value))}
      />
      
      <ViewToggle
        value={viewMode}
        onChange={(mode) => dispatch(setViewMode(mode))}
      />
      
      {isLoading && <LoadingSpinner />}
      
      <SearchResults
        data={items}
        viewMode={viewMode}
        selectedIds={selectedIds}
        onToggleSelect={(id) => dispatch(toggleSelect(id))}
      />
      
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={(newPage) => dispatch(setPage(newPage))}
      />
    </div>
  );
};
```

**Redux Toolkit 的優勢**：
- 時間旅行調試：可以回溯任何狀態變更
- 嚴格的狀態管理規範：適合大型團隊
- Redux DevTools 極佳：完整的狀態追蹤
- Immer 內建：簡化不可變更新
- 豐富的中間件生態

**進階：RTK Query（推薦搭配使用）**

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 定義 API
export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Search'],
  endpoints: (builder) => ({
    getSearchResults: builder.query({
      query: ({ q, page, pageSize }) => 
        `search?q=${q}&page=${page}&size=${pageSize}`,
      providesTags: ['Search'],
    }),
  }),
});

export const { useGetSearchResultsQuery } = searchApi;

// 使用（更簡潔）
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('size') || '20');
  
  const { data, isLoading } = useGetSearchResultsQuery({
    q: query,
    page,
    pageSize,
  });
  
  return (
    <div>
      <SearchInput
        value={query}
        onChange={(value) => setSearchParams({ q: value, page: '1' })}
      />
      
      {isLoading && <LoadingSpinner />}
      <SearchResults data={data?.items || []} />
    </div>
  );
};
```

**RTK Query 優勢**：
- 自動快取管理
- 自動重新獲取
- 樂觀更新與回滾
- 與 Redux DevTools 完美整合
- 減少 90% 的樣板代碼

#### 選擇建議

| 情境 | 推薦方案 | 理由 |
|------|---------|------|
| **主要是資料獲取** | TanStack Query | 自動處理快取、重試、失效 |
| **複雜 UI 狀態** | Zustand | 簡單、高效、易維護 |
| **需要細粒度更新** | Jotai | 原子化設計，精確訂閱，避免不必要渲染 |
| **簡單專案** | URL + Context | 輕量級，無額外依賴 |
| **大型應用** | Redux Toolkit | 時間旅行、中間件生態、團隊規範 |
| **資料 + UI 混合** | TanStack Query + Jotai | 資料與 UI 狀態分離管理 |

### 3.7 完整流程圖

```
使用者輸入
    ↓
Debounce (300ms)
    ↓
IME 檢查
    ↓
檢查快取 → 有 → 直接渲染
    ↓ 無
發送請求
    ↓
AbortController (取消舊請求)
    ↓
Loading Lock (防連點)
    ↓
回傳結果
    ↓
寫入快取 + 同步 URL
    ↓
解除 Loading
```

---

## 4. 動態加載與無限捲動

### 4.1 開發重點檢查清單

| 功能項目 | 問題點 | 技術方案 | 目標 |
|---------|--------|---------|------|
| **觸底偵測** | 頻繁監聽 scroll 事件消耗效能 | Intersection Observer | 效能優化，精確偵測 |
| **併發防護** | 捲動過快導致多次請求 | isLoading 鎖定 + AbortController | 資料不重複、不亂序 |
| **位置保存** | 回上一頁後列表回到最頂端 | sessionStorage + scrollTo | 完美的瀏覽連貫性 |
| **終點判斷** | 後端無資料時應停止偵測 | hasMore 狀態位 | 避免無意義的空請求 |

### 4.2 完整實作範例

```javascript
import { useEffect, useRef, useState } from "react";

const InfiniteList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const sentinelRef = useRef(null); // 隱形錨點
  const abortControllerRef = useRef(null); // 請求控制器
  
  // A. 觸底偵測邏輯
  useEffect(() => {
    // 防護措施：如果正在載入或已無資料，則不啟動偵測
    if (isLoading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      {
        threshold: 0.5,
        rootMargin: "200px" // 提早 200px 觸發預加載
      }
    );
    
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    
    return () => observer.disconnect();
  }, [isLoading, hasMore]);
  
  // B. 資料抓取與請求防護
  useEffect(() => {
    // 1. 防護措施：中斷上一次未完成的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    const loadData = async () => {
      // 2. 進入 Loading 狀態鎖定
      setIsLoading(true);
      
      try {
        const res = await fetch(`/api/data?page=${page}`, {
          signal: abortControllerRef.current.signal
        });
        const newData = await res.json();
        
        if (newData.length === 0) {
          setHasMore(false);
        } else {
          // 3. 資料合併
          setItems(prev => [...prev, ...newData]);
        }
      } catch (err) {
        // 4. 忽略 AbortError
        if (err.name !== 'AbortError') {
          console.error("Fetch error:", err);
        }
      } finally {
        // 5. 解除鎖定
        setIsLoading(false);
      }
    };
    
    loadData();
    
    return () => abortControllerRef.current?.abort();
  }, [page]);
  
  return (
    <div className="list-container">
      {items.map(item => (
        <div key={item.id} className="list-item">
          {item.name}
        </div>
      ))}
      
      {/* 隱形錨點與狀態顯示器 */}
      <div 
        ref={sentinelRef} 
        style={{ height: "50px", textAlign: "center" }}
      >
        {isLoading && <p>資料載入中...</p>}
        {!hasMore && <p>— 已經到底囉 —</p>}
      </div>
    </div>
  );
};
```

### 4.3 捲動位置保存 (Scroll Restoration)

#### 儲存機制 (離開前)

```javascript
const saveScrollState = () => {
  const state = {
    items,
    page,
    scrollTop: document.documentElement.scrollTop || 
              document.body.scrollTop
  };
  sessionStorage.setItem(
    'SEARCH_CACHE_V1', 
    JSON.stringify(state)
  );
};

// 在離開頁面前呼叫
useEffect(() => {
  return () => saveScrollState();
}, [items, page]);
```

#### 回復機制 (進入後)

```javascript
useEffect(() => {
  const savedState = sessionStorage.getItem('SEARCH_CACHE_V1');
  
  if (savedState) {
    const { items, page, scrollTop } = JSON.parse(savedState);
    setItems(items);
    setPage(page);
    
    // 確保在 DOM 渲染完成後才執行捲動
    requestAnimationFrame(() => {
      window.scrollTo({ 
        top: scrollTop, 
        behavior: 'instant' 
      });
    });
  }
}, []);
```

#### 禁用瀏覽器自動回溯

```javascript
useEffect(() => {
  // 禁用瀏覽器內建的捲動恢復功能
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
}, []);
```

### 4.4 防護：異常情況處理

#### 請求連打防護 (Debounced Trigger)

```javascript
useEffect(() => {
  if (isLoading || !hasMore) return;
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isLoading) {
        // 加入小幅度的 setTimeout 緩衝
        setTimeout(() => {
          setPage(prev => prev + 1);
        }, 100);
      }
    },
    { threshold: 0.5, rootMargin: "200px" }
  );
  
  if (sentinelRef.current) {
    observer.observe(sentinelRef.current);
  }
  
  return () => observer.disconnect();
}, [isLoading, hasMore]);
```

#### 資料唯一性檢查 (Data Deduplication)

```javascript
const loadData = async () => {
  setIsLoading(true);
  
  try {
    const res = await fetch(`/api/data?page=${page}`);
    const newData = await res.json();
    
    if (newData.length === 0) {
      setHasMore(false);
    } else {
      // 使用 Map 去重，防止資料重複
      setItems(prev => {
        const merged = [...prev, ...newData];
        const uniqueMap = new Map(
          merged.map(item => [item.id, item])
        );
        return Array.from(uniqueMap.values());
      });
    }
  } finally {
    setIsLoading(false);
  }
};
```

### 4.5 方案對比

| 方案 | 適用情境 | 優點 | 缺點 |
|------|---------|------|------|
| **自動無限捲動** | 社群動態、新聞串 | 體驗流暢，增加用戶黏著度 | 使用者點不到 Footer；難以掌握終點 |
| **手動「載入更多」** | 搜尋結果、電商列表 | 高度可控性，對 SEO 友善 | 增加使用者操作成本 |

---

## 5. 列表資料 CRUD 同步

### 5.1 同步策略決策矩陣

| 策略名稱 | 操作方式 | 效能表現 | 使用者體驗 | 適用場景 |
|---------|---------|---------|-----------|---------|
| **重新獲取** | 呼叫 API 重新抓取整份列表 | 低（需重新傳輸） | 一般（畫面可能跳動） | 分頁系統、資料結構極度複雜 |
| **局部更新** | 透過 setState 僅修改特定項目 | 高（零網路延遲） | 優（無縫更新） | 無限捲動、修改單一欄位、刪除 |
| **樂觀更新** | 先假定成功並更新 UI，失敗再回滾 | 極高（立即回饋） | 極優（體感零延遲） | 按讚、收藏、狀態開關 |

### 5.2 核心狀態控制器

```javascript
const TableManager = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});
  
  // 統一抓取資料的函數
  const fetchData = useCallback(async (targetPage) => {
    const data = await api.getList({ 
      page: targetPage, 
      ...searchParams 
    });
    setItems(data.list);
    setPage(targetPage);
  }, [searchParams]);
  
  // 處理刪除與新增 (行為：回第一頁)
  const handleResetAction = async () => {
    await api.executeChange();
    fetchData(1); // 強制回歸第一頁
  };
  
  // 處理編輯 (行為：留在原頁面)
  const handleUpdateAction = async (id, updatedFields) => {
    await api.updateItem(id, updatedFields);
    
    // 做法 A：局部更新 (效能最佳，不閃爍)
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updatedFields } : item
    ));
    
    // 做法 B：原地重新抓取 (若需要後端計算結果)
    // fetchData(page);
  };
  
  return (
    <Table 
      data={items} 
      currentPage={page}
      onUpdate={handleUpdateAction}
      onDelete={handleResetAction}
    />
  );
};
```

### 5.3 為什麼「刪除與新增」建議回到第一頁？

**防範「數據位移漏洞」**：

1. **刪除位移**：
   - 在第 10 頁刪除 1 筆資料
   - 後端的 Offset 會改變
   - 原本應出現在第 11 頁的第 1 筆資料會「跳進」第 10 頁
   - 若不重新整理，使用者會漏看資料

2. **新增位移**：
   - 新資料通常置頂
   - 若在第 10 頁新增，第一頁的資料會往後擠
   - 導致每一頁的資料都發生變動

**解決方案**：透過 `fetchData(1)` 重整全體狀態，是維持資料一致性最穩定且開發成本最低的方案。

### 5.4 空頁面處理

```javascript
const handleDelete = async (id) => {
  await api.deleteItem(id);
  
  // 如果刪除後該頁沒有資料了
  if (items.length === 1 && page > 1) {
    // 自動跳轉到上一頁
    fetchData(page - 1);
  } else {
    // 回到第一頁
    fetchData(1);
  }
};
```

### 5.5 渲染防護機制

#### 編輯中的狀態鎖定 (Row Locking)

```javascript
const [editingId, setEditingId] = useState(null);

const handleEdit = async (id, newData) => {
  setEditingId(id); // 鎖定該列
  
  try {
    await api.updateItem(id, newData);
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...newData } : item
    ));
  } finally {
    setEditingId(null); // 解鎖
  }
};

// 在 UI 中禁用正在編輯的列
<TableRow 
  isDisabled={editingId === item.id}
/>
```

#### 捲動位置保存 (Scroll Anchor)

```javascript
// 使用 key 確保 React 精確 DOM Diffing
{items.map(item => (
  <TableRow 
    key={item.id}  // 重要：使用唯一 ID
    data={item}
  />
))}
```

#### 操作後的反饋 (Feedback)

```javascript
const handleCreate = async (newItem) => {
  await api.createItem(newItem);
  fetchData(1);
  
  // 顯示成功訊息
  toast.success('新增成功！');
  
  // 高亮顯示新資料 (3 秒後移除)
  setHighlightId(newItem.id);
  setTimeout(() => setHighlightId(null), 3000);
};
```

### 5.6 與狀態管理庫整合

對於複雜的列表管理，建議使用狀態管理庫來處理 CRUD 操作。

#### 使用 TanStack Query 管理 CRUD

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TablePage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});
  
  // 查詢資料
  const { data, isLoading } = useQuery({
    queryKey: ['items', page, searchParams],
    queryFn: () => api.getList({ page, ...searchParams }),
  });
  
  // 新增 Mutation
  const createMutation = useMutation({
    mutationFn: api.createItem,
    onSuccess: () => {
      // 使所有相關查詢失效，觸發重新獲取
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setPage(1); // 回到第一頁
      toast.success('新增成功！');
    },
  });
  
  // 更新 Mutation (樂觀更新)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateItem(id, data),
    // 樂觀更新：立即更新 UI
    onMutate: async ({ id, data }) => {
      // 取消進行中的查詢
      await queryClient.cancelQueries({ queryKey: ['items'] });
      
      // 保存當前資料（用於回滾）
      const previousData = queryClient.getQueryData(['items', page, searchParams]);
      
      // 樂觀更新
      queryClient.setQueryData(['items', page, searchParams], (old) => ({
        ...old,
        list: old.list.map(item => 
          item.id === id ? { ...item, ...data } : item
        )
      }));
      
      return { previousData };
    },
    // 如果失敗，回滾
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['items', page, searchParams],
        context.previousData
      );
      toast.error('更新失敗！');
    },
    // 無論成功失敗，都重新驗證
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
  
  // 刪除 Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteItem,
    onSuccess: (_, deletedId) => {
      const currentData = queryClient.getQueryData(['items', page, searchParams]);
      
      // 如果刪除後該頁沒資料了，且不是第一頁
      if (currentData.list.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setPage(1);
      }
      
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('刪除成功！');
    },
  });
  
  return (
    <div>
      <button onClick={() => createMutation.mutate(newItem)}>
        新增
      </button>
      
      <Table
        data={data?.list || []}
        currentPage={page}
        onUpdate={(id, updatedFields) => 
          updateMutation.mutate({ id, data: updatedFields })
        }
        onDelete={(id) => deleteMutation.mutate(id)}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
      
      <Pagination
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
};
```

**TanStack Query CRUD 優勢**：
- 自動管理 loading 狀態
- 內建樂觀更新與回滾機制
- 自動重試失敗的請求
- 減少樣板代碼

#### 使用 Jotai 管理 CRUD 狀態

```javascript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query';
import { atomWithDefault, atomFamily } from 'jotai/utils';

// 1. 分頁和搜尋參數 atoms
const pageAtom = atom(1);
const searchParamsAtom = atom({});

// 2. 查詢參數組合 atom（衍生 atom）
const queryParamsAtom = atom((get) => ({
  page: get(pageAtom),
  ...get(searchParamsAtom),
}));

// 3. 資料查詢 atom
const itemsQueryAtom = atomWithQuery((get) => {
  const params = get(queryParamsAtom);
  return {
    queryKey: ['items', params],
    queryFn: () => api.getList(params),
  };
});

// 4. UI 狀態 atoms
const editingIdAtom = atom(null);
const highlightIdAtom = atom(null);
const selectedIdsAtom = atom([]);

// 5. Mutation atoms
// 新增 mutation
const createItemMutationAtom = atomWithMutation((get) => ({
  mutationFn: api.createItem,
  onSuccess: () => {
    // 重新獲取資料並回到第一頁
    get(pageAtom);
    set(pageAtom, 1);
  },
}));

// 更新 mutation（樂觀更新）
const updateItemMutationAtom = atomWithMutation((get) => ({
  mutationFn: ({ id, data }) => api.updateItem(id, data),
  onMutate: ({ id }) => {
    // 設定編輯中狀態
    set(editingIdAtom, id);
  },
  onSuccess: () => {
    set(editingIdAtom, null);
  },
  onError: () => {
    set(editingIdAtom, null);
  },
}));

// 刪除 mutation
const deleteItemMutationAtom = atomWithMutation((get) => ({
  mutationFn: api.deleteItem,
  onSuccess: () => {
    const currentPage = get(pageAtom);
    const items = get(itemsQueryAtom).data?.list || [];
    
    // 如果刪除後該頁沒資料了
    if (items.length === 1 && currentPage > 1) {
      set(pageAtom, currentPage - 1);
    } else {
      set(pageAtom, 1);
    }
  },
}));

// 6. 動作 atoms（寫入專用）
const createItemAtom = atom(
  null,
  async (get, set, newItem) => {
    const mutation = get(createItemMutationAtom);
    await mutation.mutate(newItem);
    
    // 高亮新項目
    set(highlightIdAtom, newItem.id);
    setTimeout(() => set(highlightIdAtom, null), 3000);
  }
);

const updateItemAtom = atom(
  null,
  async (get, set, { id, data }) => {
    const mutation = get(updateItemMutationAtom);
    await mutation.mutate({ id, data });
  }
);

const deleteItemAtom = atom(
  null,
  async (get, set, id) => {
    const mutation = get(deleteItemMutationAtom);
    await mutation.mutate(id);
  }
);

// 7. 切換選擇 atom
const toggleSelectAtom = atom(
  null,
  (get, set, id) => {
    const current = get(selectedIdsAtom);
    set(
      selectedIdsAtom,
      current.includes(id)
        ? current.filter(i => i !== id)
        : [...current, id]
    );
  }
);

// 8. 使用
const TablePage = () => {
  // 讀取資料
  const { data, isLoading } = useAtomValue(itemsQueryAtom);
  
  // 讀取狀態
  const [page, setPage] = useAtom(pageAtom);
  const editingId = useAtomValue(editingIdAtom);
  const highlightId = useAtomValue(highlightIdAtom);
  const selectedIds = useAtomValue(selectedIdsAtom);
  
  // 獲取動作函數
  const createItem = useSetAtom(createItemAtom);
  const updateItem = useSetAtom(updateItemAtom);
  const deleteItem = useSetAtom(deleteItemAtom);
  const toggleSelect = useSetAtom(toggleSelectAtom);
  
  return (
    <div>
      <button onClick={() => createItem({ name: 'New Item' })}>
        新增
      </button>
      
      <Table
        data={data?.list || []}
        currentPage={page}
        onUpdate={(id, fields) => updateItem({ id, data: fields })}
        onDelete={(id) => deleteItem(id)}
        onToggleSelect={toggleSelect}
        editingId={editingId}
        highlightId={highlightId}
        selectedIds={selectedIds}
        isLoading={isLoading}
      />
      
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
};

// 9. 其他組件也可以訂閱相同的 atoms
const TableSummary = () => {
  const selectedIds = useAtomValue(selectedIdsAtom);
  const page = useAtomValue(pageAtom);
  
  return (
    <div>
      第 {page} 頁，已選擇 {selectedIds.length} 項
    </div>
  );
};
```

**Jotai CRUD 優勢**：
- 原子化：每個狀態獨立，組件精確訂閱
- 與 TanStack Query 無縫整合（jotai-tanstack-query）
- 衍生 atom：自動計算，無需手動更新
- 寫入 atom：封裝複雜邏輯，保持組件簡潔
- TypeScript 自動推導，類型安全

**進階：Jotai 的 atomFamily 處理動態列表**

```javascript
import { atomFamily } from 'jotai/utils';

// 為每個項目創建獨立的編輯狀態
const itemEditStateFamily = atomFamily((itemId) =>
  atom({
    isEditing: false,
    draftData: null,
  })
);

// 使用
const TableRow = ({ item }) => {
  const [editState, setEditState] = useAtom(itemEditStateFamily(item.id));
  
  return (
    <tr>
      {editState.isEditing ? (
        <input
          value={editState.draftData?.name || item.name}
          onChange={(e) =>
            setEditState((prev) => ({
              ...prev,
              draftData: { ...prev.draftData, name: e.target.value },
            }))
          }
        />
      ) : (
        <span>{item.name}</span>
      )}
      <button
        onClick={() =>
          setEditState((prev) => ({
            isEditing: !prev.isEditing,
            draftData: prev.isEditing ? null : item,
          }))
        }
      >
        {editState.isEditing ? '取消' : '編輯'}
      </button>
    </tr>
  );
};
```

#### 使用 Redux Toolkit (RTK) 管理 CRUD

**適用情境**：大型應用、需要時間旅行調試、嚴格的狀態管理規範

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

// 1. 定義 async thunks
export const fetchItems = createAsyncThunk(
  'table/fetchItems',
  async ({ page, searchParams }, { rejectWithValue }) => {
    try {
      const response = await api.getList({ page, ...searchParams });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createItem = createAsyncThunk(
  'table/createItem',
  async (newItem, { dispatch, rejectWithValue }) => {
    try {
      const result = await api.createItem(newItem);
      // 新增後回到第一頁
      dispatch(fetchItems({ page: 1, searchParams: {} }));
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItem = createAsyncThunk(
  'table/updateItem',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await api.updateItem(id, data);
      return { id, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'table/deleteItem',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      await api.deleteItem(id);
      const { items, page } = getState().table;
      
      // 如果刪除後該頁沒資料了
      if (items.length === 1 && page > 1) {
        dispatch(fetchItems({ page: page - 1, searchParams: {} }));
      } else {
        dispatch(fetchItems({ page: 1, searchParams: {} }));
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. 定義 slice
const tableSlice = createSlice({
  name: 'table',
  initialState: {
    items: [],
    page: 1,
    totalPages: 1,
    searchParams: {},
    isLoading: false,
    error: null,
    editingId: null,
    highlightId: null,
    selectedIds: [],
  },
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSearchParams: (state, action) => {
      state.searchParams = action.payload;
      state.page = 1; // 搜尋時回到第一頁
    },
    setEditingId: (state, action) => {
      state.editingId = action.payload;
    },
    setHighlightId: (state, action) => {
      state.highlightId = action.payload;
    },
    toggleSelect: (state, action) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter(i => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchItems
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.list;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // createItem
      .addCase(createItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // 高亮新項目
        state.highlightId = action.payload.id;
      })
      .addCase(createItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateItem（樂觀更新）
      .addCase(updateItem.pending, (state, action) => {
        state.editingId = action.meta.arg.id;
        // 樂觀更新
        const index = state.items.findIndex(
          item => item.id === action.meta.arg.id
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.meta.arg.data,
          };
        }
      })
      .addCase(updateItem.fulfilled, (state) => {
        state.editingId = null;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.editingId = null;
        state.error = action.payload;
        // 回滾：重新獲取資料
        // 需要在組件中處理
      })
      // deleteItem
      .addCase(deleteItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteItem.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPage,
  setSearchParams,
  setEditingId,
  setHighlightId,
  toggleSelect,
  clearSelection,
} = tableSlice.actions;

export default tableSlice.reducer;

// 3. Selectors
export const selectItems = (state) => state.table.items;
export const selectPage = (state) => state.table.page;
export const selectIsLoading = (state) => state.table.isLoading;
export const selectEditingId = (state) => state.table.editingId;
export const selectHighlightId = (state) => state.table.highlightId;
export const selectSelectedIds = (state) => state.table.selectedIds;
export const selectSelectedCount = (state) => state.table.selectedIds.length;

// 4. 使用
const TablePage = () => {
  const dispatch = useDispatch();
  
  // 讀取狀態
  const items = useSelector(selectItems);
  const page = useSelector(selectPage);
  const isLoading = useSelector(selectIsLoading);
  const editingId = useSelector(selectEditingId);
  const highlightId = useSelector(selectHighlightId);
  const selectedIds = useSelector(selectSelectedIds);
  
  // 初次載入
  useEffect(() => {
    dispatch(fetchItems({ page, searchParams: {} }));
  }, [dispatch, page]);
  
  // 處理高亮
  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => {
        dispatch(setHighlightId(null));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, dispatch]);
  
  return (
    <div>
      <button onClick={() => dispatch(createItem({ name: 'New Item' }))}>
        新增
      </button>
      
      <Table
        data={items}
        currentPage={page}
        onUpdate={(id, data) => dispatch(updateItem({ id, data }))}
        onDelete={(id) => dispatch(deleteItem(id))}
        onToggleSelect={(id) => dispatch(toggleSelect(id))}
        editingId={editingId}
        highlightId={highlightId}
        selectedIds={selectedIds}
        isLoading={isLoading}
      />
      
      <Pagination
        currentPage={page}
        onPageChange={(newPage) => dispatch(setPage(newPage))}
      />
    </div>
  );
};
```

**Redux Toolkit CRUD 優勢**：
- 時間旅行調試：可以回溯任何狀態變更
- 中間件生態豐富：redux-saga、redux-observable 等
- 嚴格的狀態管理規範：適合大型團隊
- Redux DevTools 極佳：完整的狀態追蹤
- Immer 內建：簡化不可變更新

**RTK Query（推薦搭配 RTK 使用）**：

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 定義 API
export const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Items'],
  endpoints: (builder) => ({
    getItems: builder.query({
      query: ({ page, searchParams }) => 
        `items?page=${page}&${new URLSearchParams(searchParams)}`,
      providesTags: ['Items'],
    }),
    createItem: builder.mutation({
      query: (newItem) => ({
        url: 'items',
        method: 'POST',
        body: newItem,
      }),
      invalidatesTags: ['Items'],
    }),
    updateItem: builder.mutation({
      query: ({ id, data }) => ({
        url: `items/${id}`,
        method: 'PUT',
        body: data,
      }),
      // 樂觀更新
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          itemsApi.util.updateQueryData('getItems', undefined, (draft) => {
            const item = draft.list.find(i => i.id === id);
            if (item) Object.assign(item, data);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteItem: builder.mutation({
      query: (id) => ({
        url: `items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Items'],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemsApi;

// 使用（更簡潔）
const TablePage = () => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useGetItemsQuery({ page, searchParams: {} });
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  
  return (
    <Table
      data={data?.list || []}
      onUpdate={(id, data) => updateItem({ id, data })}
      onDelete={(id) => deleteItem(id)}
      isLoading={isLoading}
    />
  );
};
```

**RTK Query 優勢**：
- 自動快取管理
- 自動重新獲取
- 樂觀更新與回滾
- 與 Redux DevTools 完美整合
- 減少 90% 的樣板代碼

#### 使用 Zustand 管理 CRUD 狀態

```javascript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useTableStore = create(
  devtools(
    immer((set, get) => ({
      // 狀態
      items: [],
      page: 1,
      searchParams: {},
      isLoading: false,
      editingId: null,
      highlightId: null,
      
      // 獲取資料
      fetchData: async (targetPage) => {
        set({ isLoading: true });
        
        try {
          const { searchParams } = get();
          const data = await api.getList({ 
            page: targetPage || get().page, 
            ...searchParams 
          });
          
          set({ 
            items: data.list, 
            page: targetPage || get().page,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          toast.error('載入失敗');
        }
      },
      
      // 新增
      createItem: async (newItem) => {
        try {
          await api.createItem(newItem);
          await get().fetchData(1); // 回到第一頁
          
          // 高亮新項目
          set({ highlightId: newItem.id });
          setTimeout(() => set({ highlightId: null }), 3000);
          
          toast.success('新增成功！');
        } catch (error) {
          toast.error('新增失敗');
        }
      },
      
      // 更新（樂觀更新）
      updateItem: async (id, updatedFields) => {
        set({ editingId: id });
        
        // 樂觀更新 UI
        set((state) => {
          state.items = state.items.map(item =>
            item.id === id ? { ...item, ...updatedFields } : item
          );
        });
        
        try {
          await api.updateItem(id, updatedFields);
          toast.success('更新成功！');
        } catch (error) {
          // 失敗時重新獲取資料
          await get().fetchData();
          toast.error('更新失敗');
        } finally {
          set({ editingId: null });
        }
      },
      
      // 刪除
      deleteItem: async (id) => {
        try {
          await api.deleteItem(id);
          
          const { items, page } = get();
          
          // 如果刪除後該頁沒資料了
          if (items.length === 1 && page > 1) {
            await get().fetchData(page - 1);
          } else {
            await get().fetchData(1);
          }
          
          toast.success('刪除成功！');
        } catch (error) {
          toast.error('刪除失敗');
        }
      },
      
      // 設定搜尋參數
      setSearchParams: (params) => {
        set({ searchParams: params, page: 1 });
      },
      
      // 重置
      reset: () => set({
        items: [],
        page: 1,
        searchParams: {},
        editingId: null,
        highlightId: null
      })
    }))
  )
);

// 使用
const TablePage = () => {
  const { 
    items, 
    page, 
    isLoading,
    editingId,
    highlightId,
    fetchData,
    createItem,
    updateItem,
    deleteItem 
  } = useTableStore();
  
  useEffect(() => {
    fetchData();
  }, [page, fetchData]);
  
  return (
    <div>
      <button onClick={() => createItem(newItem)}>
        新增
      </button>
      
      <Table
        data={items}
        currentPage={page}
        onUpdate={updateItem}
        onDelete={deleteItem}
        editingId={editingId}
        highlightId={highlightId}
      />
    </div>
  );
};
```

**Zustand CRUD 優勢**：
- 使用 Immer 簡化不可變更新
- 狀態集中管理，邏輯清晰
- 支援 DevTools 調試
- 跨組件狀態共享簡單

#### 混合方案對比

**方案 A：TanStack Query + Zustand**

```javascript
// Zustand 管理 UI 狀態
const useUIStore = create((set) => ({
  editingId: null,
  selectedIds: [],
  viewMode: 'grid',
  setEditingId: (id) => set({ editingId: id }),
  toggleSelect: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(i => i !== id)
      : [...state.selectedIds, id]
  }))
}));

// TanStack Query 管理資料
const TablePage = () => {
  const { editingId, toggleSelect } = useUIStore();
  const { data } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems
  });
  
  return <Table data={data} editingId={editingId} onToggle={toggleSelect} />;
};
```

**適用場景**：
- 中型專案
- 團隊熟悉 TanStack Query
- 需要複雜的快取策略

---

**方案 B：TanStack Query + Jotai**

```javascript
// Jotai atoms 管理 UI 狀態
const editingIdAtom = atom(null);
const selectedIdsAtom = atom([]);
const viewModeAtom = atom('grid');

// 資料查詢 atom
const itemsQueryAtom = atomWithQuery(() => ({
  queryKey: ['items'],
  queryFn: fetchItems
}));

// 使用
const TablePage = () => {
  const { data } = useAtomValue(itemsQueryAtom);
  const [editingId, setEditingId] = useAtom(editingIdAtom);
  const [selectedIds, setSelectedIds] = useAtom(selectedIdsAtom);
  
  return (
    <Table
      data={data}
      editingId={editingId}
      selectedIds={selectedIds}
      onToggle={(id) => setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      )}
    />
  );
};
```

**適用場景**：
- 需要精細的重渲染控制
- 狀態邏輯較複雜
- 喜歡原子化設計

---

**方案 C：RTK Query + Redux Toolkit**

```javascript
// RTK Query 處理資料
const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => 'items',
    }),
  }),
});

// Redux slice 處理 UI 狀態
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    editingId: null,
    selectedIds: [],
  },
  reducers: {
    setEditingId: (state, action) => {
      state.editingId = action.payload;
    },
    toggleSelect: (state, action) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter(i => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
  },
});

// 配置 store
const store = configureStore({
  reducer: {
    [itemsApi.reducerPath]: itemsApi.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(itemsApi.middleware),
});
```

**適用場景**：
- 大型應用
- 需要嚴格的規範
- 團隊已經在使用 Redux

---

**方案 D：SWR + Jotai（輕量級）**

```javascript
// Jotai atoms
const selectedIdsAtom = atom([]);

// 使用 SWR
const TablePage = () => {
  const { data } = useSWR('/api/items', fetcher);
  const [selectedIds, setSelectedIds] = useAtom(selectedIdsAtom);
  
  return <Table data={data} selectedIds={selectedIds} />;
};
```

**適用場景**：
- 小型專案
- 快速原型開發
- 喜歡極簡 API

---

**混合方案選擇建議**：

| 專案特徵 | 推薦組合 | 理由 |
|---------|---------|------|
| **小型（< 10 頁）** | SWR + Jotai | 輕量、快速 |
| **中型（10-30 頁）** | TanStack Query + Jotai | 平衡功能與複雜度 |
| **中大型（30-50 頁）** | TanStack Query + Zustand | 成熟穩定、易維護 |
| **大型（> 50 頁）** | RTK Query + Redux Toolkit | 完整生態、團隊規範 |
| **複雜狀態邏輯** | TanStack Query + Jotai | 原子化細粒度控制 |
| **簡單 CRUD** | SWR + Context | 無需額外依賴 |

### 5.7 開發防護與 QA 檢查清單

| 檢查項目 | 關鍵細節 | 預期結果 |
|---------|---------|---------|
| **分頁重設** | 刪除後 `setPage(1)` 是否正確執行？ | 使用者應看見第一頁最新列表 |
| **靜態緩存同步** | 若使用 sessionStorage，是否已同步更新？ | 重新整理後不應回到已刪除資料的舊分頁 |
| **空頁面處理** | 刪除該頁最後一筆資料時的處理 | 應自動跳轉至 `page - 1` |
| **API 競態防護** | fetchData 前是否加上 AbortController？ | 防止舊 API 回傳覆蓋新資料 |

---

## 6. Intersection Observer API

### 6.1 核心概念

Intersection Observer 是一項強大的 Web API，能在不消耗大量 CPU 效能的情況下，偵測元素與視窗或特定祖先元素的重疊狀態，解決了過往監聽 `scroll` 事件導致頁面卡頓的效能問題。

### 6.2 原生 JavaScript 實作

#### 圖片懶加載 (Lazy Loading)

**應用場景**：當使用者滑動到圖片附近時才開始下載，節省初始流量。

```javascript
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // 切換為真實路徑
        img.onload = () => img.classList.add('fade-in');
        observer.unobserve(img); // 載入後停止觀測
      }
    });
  },
  { 
    rootMargin: '0px 0px 200px 0px' // 提前 200px 預載
  }
);

lazyImages.forEach(img => imageObserver.observe(img));
```

**關鍵細節**：
- 使用 `data-src` 存放路徑，觸發後再轉入 `src`
- `rootMargin: '0px 0px 200px 0px'` 提前 200px 預載，提升體驗
- 載入完成後 `unobserve`，釋放資源

#### 影片自動播放/暫停 (Video Control)

**應用場景**：類似社群媒體動態牆，影片進入視線時自動播放。

```javascript
const video = document.querySelector('video');

const videoObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      entry.target.play().catch(() => {}); // 靜音才能自動播放
    } else {
      entry.target.pause();
    }
  },
  { threshold: 0.5 } // 露出 50% 面積才執行
);

videoObserver.observe(video);
```

#### 吸附式導覽列切換 (Sticky Header)

**應用場景**：當頁面下滑超過一定距離後，導覽列固定於頂部並改變樣式。

```javascript
// 在 Header 上方放一個 1px 的隱形哨兵 (Sentinel)
const sentinel = document.querySelector('.sentinel');
const header = document.querySelector('.main-header');

const stickyObserver = new IntersectionObserver(([entry]) => {
  // 當哨兵「離開」視窗時，表示頁面已下捲超過該點
  header.classList.toggle('is-sticky', !entry.isIntersecting);
});

stickyObserver.observe(sentinel);
```

### 6.3 React 實作

#### 通用自定義 Hook：useIntersection

```javascript
import { useState, useEffect, useRef } from 'react';

export const useIntersection = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );
    
    const currentTarget = targetRef.current;
    if (currentTarget) observer.observe(currentTarget);
    
    // 務必 Cleanup：防止記憶體洩漏
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [options]);
  
  return [targetRef, isIntersecting];
};
```

#### 滾動觸發動畫 (Scroll Animation)

**應用場景**：內容隨著捲動逐一淡入呈現，增加視覺質感。

```javascript
const ScrollReveal = ({ children }) => {
  const [ref, isVisible] = useIntersection({ threshold: 0.2 });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      setHasAnimated(true); // 觸發後即固定狀態
    }
  }, [isVisible]);
  
  return (
    <div 
      ref={ref} 
      className={`box ${hasAnimated ? 'reveal' : ''}`}
    >
      {children}
    </div>
  );
};
```

#### 廣告有效曝光追蹤 (Ad Viewability)

**應用場景**：計算廣告是否被真正看見（顯示 50% 以上且停留 1 秒）。

```javascript
const AdComponent = ({ adId }) => {
  const [ref, isVisible] = useIntersection({ threshold: 0.5 });
  
  useEffect(() => {
    let timer;
    
    if (isVisible) {
      timer = setTimeout(() => {
        // 執行追蹤 API
        console.log(`Ad ${adId} tracked successfully!`);
      }, 1000);
    }
    
    // 移出視窗即重計，避免無效曝光
    return () => clearTimeout(timer);
  }, [isVisible, adId]);
  
  return (
    <div ref={ref} className="ad-unit">
      廣告內容
    </div>
  );
};
```

#### 文章目錄導覽自動高亮 (Active Nav)

**應用場景**：長文章側邊欄隨閱讀進度切換 Highlight。

```javascript
const Documentation = () => {
  const [activeId, setActiveId] = useState("");
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // 當標題進入視窗上方特定範圍時更新
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-10% 0px -80% 0px' // 上方 10%，下方 80%
      }
    );
    
    document.querySelectorAll('h2[id]').forEach(el => 
      observer.observe(el)
    );
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <nav>
      <a 
        className={activeId === 'sec1' ? 'active' : ''} 
        href="#sec1"
      >
        第一章
      </a>
      <a 
        className={activeId === 'sec2' ? 'active' : ''} 
        href="#sec2"
      >
        第二章
      </a>
    </nav>
  );
};
```

### 6.4 開發注意事項 (Checklist)

| 項目 | 關鍵細節 | 備註 |
|------|---------|------|
| **效能防護** | 執行一次後立即調用 `unobserve()` | 適用於懶加載與單次顯示動畫 |
| **Cleanup** | React useEffect 中務必執行 `disconnect()` | 避免 SPA 切換頁面後殘留監聽器 |
| **Threshold** | 設定 `1.0` 代表元素需 100% 露出才觸發 | 通常設定 `0.1 ~ 0.2` 體感最佳 |
| **rootMargin** | 格式為 `"上 右 下 左"` (例如 `"100px 0px"`) | 可用於「預加載」機制 |

---

## 7. 狀態管理選擇指南

### 7.1 核心原則：狀態分類

在 React/Next.js 應用中，狀態可以分為三種類型：

| 狀態類型 | 說明 | 存儲位置 | 範例 |
|---------|------|---------|------|
| **伺服器狀態** | 來自 API 的資料 | TanStack Query / SWR | 搜尋結果、用戶資料、列表 |
| **URL 狀態** | 可分享、可書籤的狀態 | URL SearchParams | 搜尋關鍵字、分頁、篩選條件 |
| **客戶端狀態** | UI 相關的本地狀態 | useState / Zustand / Jotai | Modal 開關、選中項、編輯模式 |

### 7.2 決策樹

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

### 7.3 實戰組合策略

#### 策略 A：小型專案（< 10 個頁面）

```javascript
// 組合：URL + useState + Context

// 1. URL 管理搜尋和分頁
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  
  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';
  
  // 本地狀態管理 UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <SearchBar 
        value={query}
        onChange={(v) => setSearchParams({ q: v, page: '1' })}
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

#### 策略 B：中型專案（10-50 個頁面）

```javascript
// 組合：TanStack Query + URL + Zustand

// 1. TanStack Query 處理資料獲取
const { data, isLoading } = useQuery({
  queryKey: ['search', query, page],
  queryFn: () => fetchSearch(query, page)
});

// 2. URL 管理可分享狀態
const [searchParams, setSearchParams] = useSearchParams();

// 3. Zustand 管理 UI 狀態
const useUIStore = create((set) => ({
  selectedIds: [],
  viewMode: 'grid',
  toggleSelect: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(i => i !== id)
      : [...state.selectedIds, id]
  })),
  setViewMode: (mode) => set({ viewMode: mode })
}));
```

**適用場景**：
- 中等規模團隊
- 需要複雜的資料管理
- 有批量操作、選擇等互動

#### 策略 C：大型專案（> 50 個頁面）

```javascript
// 組合：TanStack Query + URL + Zustand + Feature-based Store

// 特性：按功能模塊拆分 Store
// stores/search.js
export const useSearchStore = create((set) => ({
  filters: {},
  sortBy: 'relevance',
  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy })
}));

// stores/table.js
export const useTableStore = create((set) => ({
  selectedRows: [],
  expandedRows: [],
  toggleRow: (id) => set((state) => ({
    selectedRows: state.selectedRows.includes(id)
      ? state.selectedRows.filter(i => i !== id)
      : [...state.selectedRows, id]
  }))
}));

// 使用時按需導入
import { useSearchStore } from '@/stores/search';
import { useTableStore } from '@/stores/table';
```

**適用場景**：
- 大型團隊協作
- 多個複雜功能模塊
- 需要嚴格的狀態管理規範

### 7.4 最佳實踐

#### 原則 1：伺服器狀態與客戶端狀態分離

```javascript
// ❌ 錯誤：混在一起
const [state, setState] = useState({
  userData: null,        // 伺服器狀態
  isModalOpen: false,    // 客戶端狀態
  searchResults: [],     // 伺服器狀態
  selectedId: null       // 客戶端狀態
});

// ✅ 正確：分離管理
// 伺服器狀態
const { data: userData } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser
});
const { data: searchResults } = useQuery({
  queryKey: ['search', query],
  queryFn: () => fetchSearch(query)
});

// 客戶端狀態
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedId, setSelectedId] = useState(null);
```

#### 原則 2：URL 作為 Source of Truth

```javascript
// ✅ 正確：URL 驅動狀態
const [searchParams] = useSearchParams();
const page = searchParams.get('page') || '1';
const query = searchParams.get('q') || '';

// 使用 URL 參數獲取資料
const { data } = useQuery({
  queryKey: ['items', page, query],
  queryFn: () => fetchItems({ page, query })
});

// ❌ 錯誤：本地狀態與 URL 不同步
const [page, setPage] = useState(1);  // 本地狀態
const [searchParams] = useSearchParams();  // URL 狀態
// 兩者可能不一致！
```

#### 原則 3：避免過度全局化

```javascript
// ❌ 錯誤：所有狀態都放全局
const useGlobalStore = create((set) => ({
  userData: null,
  modalOpen: false,
  searchQuery: '',
  currentPage: 1,
  selectedItems: [],
  // ... 100+ 個狀態
}));

// ✅ 正確：按功能拆分
const useUserStore = create((set) => ({
  userData: null,
  updateUser: (data) => set({ userData: data })
}));

const useSearchStore = create((set) => ({
  query: '',
  filters: {},
  setQuery: (q) => set({ query: q })
}));
```

### 7.5 效能優化

#### 使用選擇器避免不必要的重渲染

```javascript
// ❌ 錯誤：訂閱整個 store
const Component = () => {
  const store = useStore();  // 任何狀態改變都會重渲染
  return <div>{store.specificValue}</div>;
};

// ✅ 正確：精確訂閱
const Component = () => {
  const specificValue = useStore((state) => state.specificValue);
  return <div>{specificValue}</div>;
};
```

#### TanStack Query 的精確快取控制

```javascript
// 細粒度的快取控制
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000,      // 5 分鐘內視為新鮮
  gcTime: 10 * 60 * 1000,        // 10 分鐘後回收
  refetchOnWindowFocus: false,    // 視窗聚焦時不自動重抓
  refetchOnMount: false,          // 組件掛載時不自動重抓
});
```

### 7.6 工具選擇總結

| 工具 | 適用場景 | 學習曲線 | 生態系統 |
|------|---------|---------|---------|
| **TanStack Query** | 所有需要資料獲取的專案 | 中 | 極佳（DevTools、插件豐富） |
| **SWR** | 輕量級資料獲取 | 低 | 良好 |
| **Zustand** | 客戶端狀態管理 | 低 | 良好 |
| **Jotai** | 原子化狀態管理 | 中 | 中等 |
| **Redux Toolkit** | 超大型應用、需要時間旅行 | 高 | 極佳 |
| **Context API** | 簡單的狀態共享 | 低 | React 內建 |

### 7.7 遷移建議

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

## 總結

### 最佳實踐核心原則

1. **效能優先**：
   - 使用 `Intersection Observer` 替代 `scroll` 事件
   - 實作 `AbortController` 避免無效請求
   - 使用 `debounce` 減少 API 呼叫頻率

2. **資料一致性**：
   - 妥善處理競態條件
   - 正確管理快取失效
   - CRUD 操作後確保 UI 同步

3. **使用者體驗**：
   - 提供適當的 Loading 狀態
   - 保存捲動位置
   - 實作樂觀更新
   - 清晰的錯誤處理與反饋

4. **可維護性**：
   - 將 URL 作為 Source of Truth
   - 封裝可重用的自定義 Hook
   - 遵循清晰的命名規範
   - 提供完整的錯誤邊界處理

### 推薦工具庫

#### 狀態管理

| 工具 | 適用場景 | 核心優勢 |
|------|---------|---------|
| **TanStack Query** | 伺服器狀態管理 | 自動快取、重試、失效；樂觀更新；DevTools 支援 |
| **SWR** | 輕量級資料獲取 | API 簡潔；自動重新驗證；極小體積 |
| **Zustand** | 客戶端狀態管理 | 極簡 API；無 Provider；高效能；TypeScript 友善 |
| **Jotai** | 原子化狀態管理 | 細粒度更新；無樣板代碼；React Suspense 支援 |
| **Redux Toolkit** | 大型應用狀態管理 | 時間旅行調試；中間件生態；團隊規範強制 |

#### 路由管理

| 工具 | 適用場景 | 核心優勢 |
|------|---------|---------|
| **React Router v6** | SPA 路由 | 標準方案；Hooks API；嵌套路由；Loader/Action |
| **Next.js App Router** | SSR/SSG 應用 | 文件系統路由；伺服器組件；自動代碼分割 |
| **TanStack Router** | 類型安全路由 | 完整 TypeScript 支援；搜尋參數驗證 |

#### UI 增強

| 工具 | 適用場景 | 核心優勢 |
|------|---------|---------|
| **@tanstack/react-virtual** | 長列表優化 | 虛擬滾動；支援各種佈局；效能極佳 |
| **react-intersection-observer** | 懶加載/無限捲動 | 簡化 Intersection Observer API；Hooks 友善 |
| **react-window** | 虛擬列表（輕量級） | 體積小；API 簡單；廣泛使用 |

#### 表單管理

| 工具 | 適用場景 | 核心優勢 |
|------|---------|---------|
| **React Hook Form** | 複雜表單 | 效能優異；減少重渲染；驗證整合 |
| **Formik** | 傳統表單 | 成熟穩定；社群支援好 |
| **Zod** | 表單驗證 | TypeScript 優先；運行時驗證；類型推導 |

#### 開發工具

| 工具 | 用途 | 核心優勢 |
|------|-----|---------|
| **React DevTools** | 組件檢查 | 官方工具；必備 |
| **TanStack Query DevTools** | 查詢調試 | 查看快取狀態；網路請求 |
| **Zustand DevTools** | 狀態調試 | 時間旅行；狀態快照 |
| **Million.js** | 效能優化 | 虛擬 DOM 加速；相容 React |

### 開發檢查清單

在完成功能開發後，請確認以下項目：

**基礎防護**：
- [ ] 所有非同步請求都有 AbortController
- [ ] 實作了適當的防抖/節流機制
- [ ] 處理了所有邊界情況（空結果、錯誤、極端值）
- [ ] Loading 狀態正確顯示與解除
- [ ] 組件卸載時正確清理資源
- [ ] 無記憶體洩漏（檢查 useEffect cleanup）

**狀態管理**：
- [ ] 伺服器狀態與客戶端狀態已分離
- [ ] 可分享的狀態已存入 URL
- [ ] 快取機制正確實作與失效
- [ ] URL 參數與 UI 狀態同步
- [ ] 沒有過度使用全局狀態
- [ ] 使用選擇器避免不必要的重渲染

**資料同步**：
- [ ] CRUD 操作後 UI 正確同步
- [ ] 樂觀更新有正確的回滾機制
- [ ] 分頁/搜尋參數變更時資料正確更新
- [ ] 快取失效策略符合業務需求

**使用者體驗**：
- [ ] 行動裝置體驗良好
- [ ] 無障礙性考量（Accessibility）
- [ ] 提供清晰的錯誤提示
- [ ] 操作反饋及時（Loading、Toast）

**效能優化**：
- [ ] 長列表使用虛擬滾動
- [ ] 圖片使用懶加載
- [ ] 避免不必要的 API 請求
- [ ] 使用 React.memo 或 useMemo 優化重渲染

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
