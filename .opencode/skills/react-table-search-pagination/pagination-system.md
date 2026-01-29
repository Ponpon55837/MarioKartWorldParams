# React 分頁系統實作指南

## 概述

本指南專注於建立高效能、使用者體驗優良的分頁系統，涵蓋基礎實作、快取策略、異常處理、效能優化等核心技術。

---

## 目錄

1. [完整實作範例](#1-完整實作範例)
2. [分頁組件行為規範](#2-分頁組件行為規範)
3. [快取失效策略](#3-快取失效策略)
4. [異常處理](#4-異常處理)
5. [效能優化](#5-效能優化)
6. [與狀態管理庫整合](#6-與狀態管理庫整合)

---

## 1. 完整實作範例

結合防抖、AbortController、快取、URL 同步：

```javascript
import { useState, useEffect, useRef } from "react";

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
          { signal: abortControllerRef.current.signal },
        );
        const result = await response.json();

        // 5. 更新快取並設置資料
        cache.current[cacheKey] = result;
        setData(result);
      } catch (err) {
        if (err.name === "AbortError") return;
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
      <button disabled={isLoading}>{isLoading ? "載入中…" : "下一頁"}</button>
    </div>
  );
};
```

---

## 2. 分頁組件行為規範

**必須遵守的規範**：

1. **回到首頁**：點擊「搜尋」或「切換每頁筆數」時，強制 `page = 1`
2. **非法頁碼處理**：若 URL 上的 `page` 超過總頁數，自動重導向至最後一頁
3. **物理邊界**：
   - 第一頁時：「首頁」與「上一頁」按鈕必須為 `disabled`
   - 最後一頁時：「末頁」與「下一頁」按鈕必須為 `disabled`

---

## 3. 快取失效策略

**快取管理範例**：

```javascript
// 帶有時間戳記的快取管理
const setCache = (key, value) => {
  cache.current[key] = {
    data: value,
    timestamp: Date.now(),
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

---

## 4. 異常處理

### 空結果處理

```javascript
if (data.length === 0) {
  return (
    <div className="empty-state">
      <p>找不到與「{query}」相關的結果</p>
      <button onClick={clearFilters}>清除過濾條件</button>
    </div>
  );
}
```

### API 錯誤回退

```javascript
try {
  const response = await fetch(url);
  const data = await response.json();
  setData(data);
} catch (error) {
  // 保留當前畫面資料，顯示錯誤提示
  toast.error("網路不穩定，請稍後再試");
  // 不執行 setData，避免列表崩潰
}
```

### 非法分頁請求處理

```javascript
const sanitizeParams = (page, totalPages) => {
  const p = parseInt(page);
  if (isNaN(p) || p < 1) return 1;
  if (p > totalPages) return totalPages;
  return p;
};

// 使用
const safePage = sanitizeParams(searchParams.get("page"), totalPages);
```

---

## 5. 效能優化

### 虛擬滾動 (Virtual List)

**使用情境**：單頁筆數 > 100 且每筆資料包含複雜 DOM

```javascript
import { useVirtualizer } from "@tanstack/react-virtual";

const VirtualList = ({ items }) => {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // 每個項目的估計高度
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
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

### 預抓取 (Prefetching)

```javascript
const onHoverNext = () => {
  const nextKey = `${query}-${page + 1}-${pageSize}`;

  if (!cache.current[nextKey]) {
    // 背景預抓取，不顯示 Loading 狀態
    prefetchApi(query, page + 1, pageSize).then((data) => {
      cache.current[nextKey] = data;
    });
  }
};

return (
  <button onMouseEnter={onHoverNext} onClick={goToNextPage}>
    下一頁
  </button>
);
```

---

## 6. 與狀態管理庫整合

### 使用 TanStack Query

```javascript
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("size") || "20");

  // TanStack Query 自動處理：
  // - 競態條件
  // - 快取管理
  // - 重新驗證
  // - Loading 狀態
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", query, page, pageSize],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/search?q=${query}&page=${page}&size=${pageSize}`,
        { signal }, // 自動處理 AbortController
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
      ...newParams,
    };
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v),
    );
    setSearchParams(cleaned);
  };

  return (
    <div>
      <SearchInput
        value={query}
        onChange={(value) => updateParams({ q: value, page: "1" })}
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

---

## 完整流程圖

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

## 開發檢查清單

| 檢查項目     | 關鍵細節                               | 預期結果              |
| ------------ | -------------------------------------- | --------------------- |
| **防抖機制** | 是否設定 300ms 延遲？                  | 減少不必要的 API 請求 |
| **競態防護** | 是否使用 AbortController？             | 避免舊請求覆蓋新結果  |
| **快取策略** | 是否實作快取機制？                     | 提升回訪速度          |
| **URL 同步** | 分頁參數是否正確更新 URL？             | 支援分享與書籤功能    |
| **邊界處理** | 第一頁/最後一頁按鈕是否正確 disabled？ | 防止無效操作          |
| **空狀態**   | 是否處理空結果情況？                   | 提供友善的使用者提示  |

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
