# React 競態條件處理指南

## 概述

本指南專注於解決 React/Next.js 應用中的競態條件問題，提供多種解決方案和最佳實踐。

---

## 目錄

1. [核心問題](#1-核心問題)
2. [常見情境](#2-常見情境)
3. [解決方案](#3-解決方案)
4. [最佳實踐](#4-最佳實踐)

---

## 1. 核心問題

當短時間內觸發多次非同步請求時，由於網路環境波動，請求的回傳順序可能與發送順序不一致，導致畫面顯示錯誤資料。

---

## 2. 常見情境

### 搜尋自動完成

```
使用者快速輸入 A -> Ap -> App -> Apple
結果：搜尋 A 的結果最慢回傳，覆蓋了 Apple 的結果
```

### 分頁快速點擊

```
使用者連續點擊「下一頁」
結果：第 2 頁資料比第 3 頁慢回傳，覆蓋了正確的資料
```

### 多重篩選條件

```
使用者快速切換過濾條件
結果：舊條件的資料覆蓋新條件的結果
```

---

## 3. 解決方案

### 方案 A：閉包標記法 (Boolean Flag)

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

### 方案 B：AbortController (推薦)

**適用情境**：正式專案、需要節省資源

```javascript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (err) {
      if (err.name === "AbortError") return; // 忽略主動取消的錯誤
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
window.addEventListener("resize", handleResize, {
  signal: controller.signal,
});
window.addEventListener("scroll", handleScroll, {
  signal: controller.signal,
});

// 一次性清除所有監聽器
controller.abort();
```

### 方案 C：宣告式資料管理 (TanStack Query / SWR)

**適用情境**：企業級專案、複雜快取邏輯

**TanStack Query 範例**：

```javascript
const { data, isLoading } = useQuery({
  queryKey: ["user", id],
  queryFn: () => fetchUser(id),
});
```

**SWR 範例**：

```javascript
import useSWR from "swr";

function Profile({ id }) {
  const { data, error, isLoading } = useSWR(`/api/user/${id}`, fetcher);

  if (isLoading) return <div>Loading...</div>;
  return <div>Hello {data.name}!</div>;
}
```

**優點**：

- 內建競態條件處理
- 自動快取與重新驗證
- 減少樣板代碼

---

## 4. 最佳實踐

| 情境         | 推薦方案           | 理由                 |
| ------------ | ------------------ | -------------------- |
| 簡單資料抓取 | Boolean Flag       | 簡單直觀，學習成本低 |
| 正式專案     | AbortController    | 效能最佳，資源節省   |
| 企業級應用   | TanStack Query/SWR | 功能完整，開發效率高 |

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
