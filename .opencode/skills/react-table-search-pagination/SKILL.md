---
name: react-table-search-pagination
description: |
  React/Next.js 專案中表格、搜尋、分頁功能的完整開發指南。涵蓋競態條件處理、搜尋系統實作、分頁系統、無限捲動、CRUD 同步、Intersection Observer API、狀態管理選擇等核心技術。

  主要功能：
  - 處理非同步請求的競態條件問題
  - 實作高效能的搜尋與自動完成功能
  - 建立專業級分頁系統與快取策略
  - 開發流暢的無限捲動體驗
  - 確保 CRUD 操作的資料一致性
  - 選擇最適合的狀態管理方案

  適用場景：
  - 需要搜尋與分頁功能的 React/Next.js 應用
  - 處理大量資料的列表展示和 CRUD 操作
  - 需要高效能的無限捲動或虛擬化列表
  - 面臨競態條件、狀態同步等複雜資料管理問題
  - 需要選擇合適狀態管理方案的專案
license: MIT
---

# React Table Search Pagination

## 描述

這是一個專門處理 React/Next.js 專案中表格、搜尋、分頁功能的完整開發指南。涵蓋了從基礎的競態條件處理到複雜的狀態管理選擇等所有核心技術實作與最佳實踐。

## 適用場景

- 需要實作搜尋與分頁功能的 React/Next.js 應用
- 處理大量資料的列表展示和 CRUD 操作
- 需要高效能的無限捲動或虛擬化列表
- 面臨競態條件、狀態同步等複雜資料管理問題
- 需要選擇合適的狀態管理方案的專案

---

## 📚 指南結構

本指南已拆分為多個專門文件，便於查閱和維護：

### 🔗 核心技術指南

| 文件                                                                 | 描述                      | 主要內容                                      |
| -------------------------------------------------------------------- | ------------------------- | --------------------------------------------- |
| [race-condition.md](./race-condition.md)                             | 競態條件處理              | AbortController、Boolean Flag、TanStack Query |
| [search-system.md](./search-system.md)                               | 搜尋系統實作              | 自動完成、輸入法優化、防護機制                |
| [pagination-system.md](./pagination-system.md)                       | 分頁系統實作              | 快取策略、異常處理、效能優化                  |
| [infinite-scroll.md](./infinite-scroll.md)                           | 動態加載與無限捲動        | Intersection Observer、位置保存               |
| [intersection-observer.md](./intersection-observer.md)               | Intersection Observer API | 懶加載、動畫觸發、廣告追蹤                    |
| [crud-sync.md](./crud-sync.md)                                       | 列表資料 CRUD 同步        | 同步策略、狀態管理整合                        |
| [state-management.md](./state-management.md)                         | 狀態管理選擇指南          | 決策樹、工具對比、最佳實踐                    |
| [refresh-token-race-condition.md](./refresh-token-race-condition.md) | Refresh Token 與競態條件  | 無感刷新、Axios攔截器、TanStack Query/SWR整合 |

---

## 🚀 快速導航

### 快速開始

如果你是新專案，建議閱讀順序：

1. **[state-management.md](./state-management.md)** - 了解狀態管理決策框架
2. **[race-condition.md](./race-condition.md)** - 掌握非同步請求處理
3. **[search-system.md](./search-system.md)** - 實作搜尋功能
4. 根據需求選擇：
   - 分頁系統 → [pagination-system.md](./pagination-system.md)
   - 無限捲動 → [infinite-scroll.md](./infinite-scroll.md)
   - CRUD 操作 → [crud-sync.md](./crud-sync.md)

### 專案檢查清單

完整開發檢查清單請參考各專門文件末尾的「開發檢查清單」章節。

---

## 🛠️ 技術棧推薦

### 狀態管理組合

| 專案規模             | 推薦組合                             | 理由                       |
| -------------------- | ------------------------------------ | -------------------------- |
| **小型（< 10 頁）**  | URL + useState + Context             | 輕量、快速開發、零依賴     |
| **中型（10-30 頁）** | TanStack Query + URL + Zustand/Jotai | 平衡功能與複雜度           |
| **大型（> 30 頁）**  | TanStack Query + URL + Redux Toolkit | 完整生態、團隊規範         |
| **高性能要求**       | TanStack Query + Zustand             | 極簡 API、最高效能         |
| **複雜狀態依賴**     | TanStack Query + Jotai               | 原子化細粒度控制、自動優化 |

### 核心工具庫

| 類型           | 工具                                 | 推薦理由                 |
| -------------- | ------------------------------------ | ------------------------ |
| **資料獲取**   | TanStack Query                       | 自動快取、重試、樂觀更新 |
| **客戶端狀態** | Zustand/Jotai                        | 極簡 API、高效能/原子化  |
| **路由管理**   | React Router v6 / Next.js App Router | 標準方案、型別安全       |
| **表單管理**   | React Hook Form                      | 效能優異、驗證整合       |
| **UI 增強**    | @tanstack/react-virtual              | 虛擬滾動、長列表優化     |

---

## 🎯 最佳實踐核心原則

### 1. 效能優先

- 使用 `Intersection Observer` 替代 `scroll` 事件
- 實作 `AbortController` 避免無效請求
- 使用 `debounce` 減少 API 呼叫頻率

### 2. 資料一致性

- 妥善處理競態條件
- 正確管理快取失效
- CRUD 操作後確保 UI 同步

### 3. 使用者體驗

- 提供適當的 Loading 狀態
- 保存捲動位置
- 實作樂觀更新
- 清晰的錯誤處理與反饋

### 4. 可維護性

- 將 URL 作為 Source of Truth
- 封裝可重用的自定義 Hook
- 遵循清晰的命名規範
- 提供完整的錯誤邊界處理

---

## 📖 詳細指南

### 競態條件處理 ([race-condition.md](./race-condition.md))

學習如何處理非同步請求的競態條件，包括：

- AbortController 使用方法
- Boolean Flag 模式
- TanStack Query/SWR 自動處理

### 搜尋系統實作 ([search-system.md](./search-system.md))

建立高效能搜尋系統：

- 自動完成功能
- 輸入法優化（中日韓文）
- 防抖與防護機制
- URL 狀態同步

### 分頁系統實作 ([pagination-system.md](./pagination-system.md))

實作專業級分頁系統：

- 快取策略與失效
- 異常處理與邊界情況
- 虛擬滾動優化
- 狀態管理整合

### 動態加載與無限捲動 ([infinite-scroll.md](./infinite-scroll.md))

流暢的無限捲動體驗：

- Intersection Observer 實作
- 捲動位置保存
- 資料去重與併發防護

### Intersection Observer API ([intersection-observer.md](./intersection-observer.md))

掌握高效能監測技術：

- 圖片懶加載
- 動畫觸發
- 廣告曝光追蹤
- React Hook 封裝

### 列表 CRUD 同步 ([crud-sync.md](./crud-sync.md))

確保資料操作的一致性：

- 同步策略選擇
- 樂觀更新實作
- 狀態管理庫整合
- 開發防護機制

### 狀態管理選擇 ([state-management.md](./state-management.md))

選擇最適合的狀態管理方案：

- 狀態分類框架
- 決策樹指導
- 工具對比分析
- 遷移路徑建議

### Refresh Token 與競態條件處理 ([refresh-token-race-condition.md](./refresh-token-race-condition.md))

處理複雜驗證場景的最佳實踐：

- Refresh Token 無感刷新機制
- Axios 攔截器與請求佇列
- TanStack Query/SWR 整合方案
- 競態條件自動處理
- 實務情境分析與解決方案

---

## 🛠️ 開發工具推薦

### DevTools 必備

| 工具                        | 用途     | 安裝方式                                     |
| --------------------------- | -------- | -------------------------------------------- |
| **React DevTools**          | 組件檢查 | 瀏覽器擴充                                   |
| **TanStack Query DevTools** | 查詢調試 | `npm install @tanstack/react-query-devtools` |
| **Redux DevTools**          | 狀態調試 | 瀏覽器擴充 + `@reduxjs/toolkit`              |
| **Zustand DevTools**        | 狀態調試 | 使用 `devtools` 中間件                       |
| **Jotai DevTools**          | 狀態調試 | 使用 `jotai-devtools` 擴充                   |

### 效能監控

| 工具               | 監控目標     |
| ------------------ | ------------ |
| **React Profiler** | 組件渲染效能 |
| **Lighthouse**     | 整體網頁效能 |
| **Web Vitals**     | 核心網頁指標 |

---

## 📋 版本資訊

**版本**：2.0 (重構版本)  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)

---

## 📝 更新日誌

### v2.2 (2025-01-29)

- 🎯 新增 Refresh Token 與競態條件處理專門指南
- 🔄 完整整理 Axios 攔截器實作方案
- ⚡ 補充 TanStack Query/SWR 整合策略
- 🛡️ 增加實務情境分析與解決方案
- 📋 更新技術指南清單，新增驗證相關內容

### v2.1 (2025-01-28)

- ✨ 新增 Jotai 狀態管理支援與詳細對比
- 📚 更新狀態管理組合推薦表格
- 🛠️ 增加 Jotai 範例程式碼與最佳實踐
- 🔧 補充 Jotai DevTools 工具說明

### v2.0 (2025-01-28)

- 🔄 重新拆分單一文件為多個專門指南
- ✨ 新增 Intersection Observer 專門文件
- 📚 優化狀態管理決策框架
- 🛠️ 更新所有範例程式碼
- 📋 增加詳細的檢查清單

### v1.0 (原始版本)

- 🎉 建立完整的 React/Next.js 開發指南
- 📄 涵蓋競態條件、搜尋、分頁、CRUD 等核心功能

---

## 🤝 貢獻指南

若要更新或新增內容，請：

1. 確定修改的專門文件
2. 保持程式碼範例的一致性
3. 更新對應的檢查清單
4. 確保版本資訊同步更新

---

## 🔗 相關連結

- [React 官方文檔](https://react.dev/)
- [Next.js 官方文檔](https://nextjs.org/docs)
- [TanStack Query 文檔](https://tanstack.com/query/latest)
- [Zustand 文檔](https://docs.pmnd.rs/zustand)

---

## ✍️ 寫作風格指南（繁體中文）

本專案的寫作風格指南已移至本目錄的 `README.md` 中，請參考 `README.md` 的「寫作風格指南（繁體中文）」章節，該章節包含用詞統一、UI 文案規則、標點與中英混寫策略，以及文件變更流程等內容。

- [Jotai 文檔](https://jotai.org/)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

_本指南持續更新中，歡迎提供回饋與建議。_
