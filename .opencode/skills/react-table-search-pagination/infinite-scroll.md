# React 動態加載與無限捲動指南

## 概述

本指南專注於實作高效能的動態加載與無限捲動功能，解決傳統分頁的使用者體驗問題，提供流暢的瀏覽體驗。

---

## 目錄

1. [開發重點檢查清單](#1-開發重點檢查清單)
2. [完整實作範例](#2-完整實作範例)
3. [捲動位置保存](#3-捲動位置保存)
4. [防護：異常情況處理](#4-防護異常情況處理)
5. [方案對比](#5-方案對比)

---

## 1. 開發重點檢查清單

| 功能項目     | 問題點                       | 技術方案                         | 目標               |
| ------------ | ---------------------------- | -------------------------------- | ------------------ |
| **觸底偵測** | 頻繁監聽 scroll 事件消耗效能 | Intersection Observer            | 效能優化，精確偵測 |
| **併發防護** | 捲動過快導致多次請求         | isLoading 鎖定 + AbortController | 資料不重複、不亂序 |
| **位置保存** | 回上一頁後列表回到最頂端     | sessionStorage + scrollTo        | 完美的瀏覽連貫性   |
| **終點判斷** | 後端無資料時應停止偵測       | hasMore 狀態位                   | 避免無意義的空請求 |

---

## 2. 完整實作範例

```javascript
import { useEffect, useRef, useState } from 'react';

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
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.5,
        rootMargin: '200px' // 提早 200px 觸發預加載
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
          setItems((prev) => [...prev, ...newData]);
        }
      } catch (err) {
        // 4. 忽略 AbortError
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
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
      {items.map((item) => (
        <div key={item.id} className="list-item">
          {item.name}
        </div>
      ))}

      {/* 隱形錨點與狀態顯示器 */}
      <div ref={sentinelRef} style={{ height: '50px', textAlign: 'center' }}>
        {isLoading && <p>資料載入中...</p>}
        {!hasMore && <p>— 已經到底囉 —</p>}
      </div>
    </div>
  );
};
```

---

## 3. 捲動位置保存 (Scroll Restoration)

### 儲存機制 (離開前)

```javascript
const saveScrollState = () => {
  const state = {
    items,
    page,
    scrollTop: document.documentElement.scrollTop || document.body.scrollTop
  };
  sessionStorage.setItem('SEARCH_CACHE_V1', JSON.stringify(state));
};

// 在離開頁面前呼叫
useEffect(() => {
  return () => saveScrollState();
}, [items, page]);
```

### 回復機制 (進入後)

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

### 禁用瀏覽器自動回溯

```javascript
useEffect(() => {
  // 禁用瀏覽器內建的捲動恢復功能
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
}, []);
```

---

## 4. 防護：異常情況處理

### 請求連打防護 (Debounced Trigger)

```javascript
useEffect(() => {
  if (isLoading || !hasMore) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isLoading) {
        // 加入小幅度的 setTimeout 緩衝
        setTimeout(() => {
          setPage((prev) => prev + 1);
        }, 100);
      }
    },
    { threshold: 0.5, rootMargin: '200px' }
  );

  if (sentinelRef.current) {
    observer.observe(sentinelRef.current);
  }

  return () => observer.disconnect();
}, [isLoading, hasMore]);
```

### 資料唯一性檢查 (Data Deduplication)

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
      setItems((prev) => {
        const merged = [...prev, ...newData];
        const uniqueMap = new Map(merged.map((item) => [item.id, item]));
        return Array.from(uniqueMap.values());
      });
    }
  } finally {
    setIsLoading(false);
  }
};
```

---

## 5. 方案對比

| 方案                 | 適用情境           | 優點                       | 缺點                              |
| -------------------- | ------------------ | -------------------------- | --------------------------------- |
| **自動無限捲動**     | 社群動態、新聞串   | 體驗流暢，增加使用者黏著度 | 使用者點不到 Footer；難以掌握終點 |
| **手動「載入更多」** | 搜尋結果、電商列表 | 高度可控性，對 SEO 友善    | 增加使用者操作成本                |

---

## 開發檢查清單

| 檢查項目     | 關鍵細節                         | 預期結果             |
| ------------ | -------------------------------- | -------------------- |
| **觸底偵測** | 是否使用 Intersection Observer？ | 效能優化，精確偵測   |
| **併發防護** | 是否有 isLoading 鎖定？          | 防止重複請求         |
| **請求取消** | 是否使用 AbortController？       | 避免舊請求覆蓋新結果 |
| **終點判斷** | 是否正確處理 hasMore 狀態？      | 避免無意義的空請求   |
| **位置保存** | 是否實作 sessionStorage 機制？   | 完美的瀏覽連貫性     |
| **資料去重** | 是否防止重複資料加入列表？       | 確保資料唯一性       |

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
