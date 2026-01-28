# React 搜尋系統實作指南

## 概述

本指南專注於建立高效能、用戶體驗優良的搜尋系統，涵蓋自動完成、輸入法優化、防護機制等核心技術。

---

## 目錄

1. [核心挑戰與解決方案](#1-核心挑戰與解決方案)
2. [自動完成 (Autocomplete)](#2-自動完成-autocomplete)
3. [輸入法優化 (Composition Events)](#3-輸入法優化-composition-events)
4. [點擊防護 (Loading State)](#4-點擊防護-loading-state)
5. [URL 狀態管理](#5-url-狀態管理)

---

## 1. 核心挑戰與解決方案

| 開發階段   | 問題點                     | 技術方案                    | 達成目標                     |
| ---------- | -------------------------- | --------------------------- | ---------------------------- |
| **輸入中** | 每輸入一個字就發送 API     | Debounce (防抖)             | 減少 API 請求頻率            |
| **非同步** | 舊請求覆蓋新請求           | AbortController             | 解決競態條件                 |
| **輸入法** | 中/日/韓文拼音觸發無效搜尋 | Composition Events          | 優化亞洲語系體驗             |
| **點擊時** | 連點按鈕導致重複搜尋       | Loading State + Disabled    | UI 層面阻隔重複操作          |
| **快取**   | 重複搜尋產生多餘請求       | useRef Cache 或 React Query | 提升回訪速度                 |
| **分享**   | 無法透過 URL 分享搜尋結果  | URL SearchParams            | URL 即狀態 (Source of Truth) |

---

## 2. 自動完成 (Autocomplete)

**完整實作範例**：

```javascript
import { useState, useEffect } from "react";

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
        const response = await fetch(`/api/search?q=${searchTerm}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setResults(data);
      } catch (err) {
        if (err.name !== "AbortError") {
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

---

## 3. 輸入法優化 (Composition Events)

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

---

## 4. 點擊防護 (Loading State)

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
    <button onClick={handleSearch} disabled={loading}>
      {loading ? "搜尋中..." : "搜尋"}
    </button>
  );
};
```

---

## 5. URL 狀態管理 (Source of Truth)

**將搜尋狀態存放在 URL 中**：

```javascript
import { useSearchParams } from "react-router-dom";

const SearchContainer = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 從 URL 取得參數
  const currentParams = {
    query: searchParams.get("q") || "",
    page: searchParams.get("page") || "1",
    category: searchParams.get("cat") || "all",
  };

  const updateSearch = (newParams) => {
    // 1. 合併新舊參數
    const mergedParams = { ...currentParams, ...newParams };

    // 2. 清理無效值
    const cleanParams = Object.fromEntries(
      Object.entries(mergedParams).filter(([_, v]) => v && v !== "all"),
    );

    // 3. 更新 URL
    setSearchParams(cleanParams);
  };

  return (
    <input
      value={currentParams.query}
      onChange={(e) =>
        updateSearch({
          query: e.target.value,
          page: "1", // 搜尋時回到第一頁
        })
      }
    />
  );
};
```

**優點**：

- 可分享：使用者複製 URL 後，他人打開看到相同結果
- 可書籤：使用者可以收藏搜尋結果頁面
- 重新整理後狀態保留

---

## 開發檢查清單

| 檢查項目       | 關鍵細節                             | 預期結果              |
| -------------- | ------------------------------------ | --------------------- |
| **防抖機制**   | 輸入延遲是否設定 300ms？             | 減少不必要的 API 請求 |
| **競態防護**   | useEffect 中是否有 AbortController？ | 避免舊請求覆蓋新結果  |
| **輸入法優化** | 是否實作 Composition Events？        | 中日韓文輸入體驗良好  |
| **點擊防護**   | 按鈕是否有 disabled 狀態？           | 防止重複提交          |
| **URL 同步**   | 搜尋參數是否正確更新 URL？           | 支援分享與書籤功能    |

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
