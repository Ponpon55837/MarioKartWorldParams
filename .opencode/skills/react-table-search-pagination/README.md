# React/Next.js 專案開發指南 (SKILL.md)

## 概述

本指南整合了 React/Next.js 專案開發中的核心技術實作與最佳實踐，涵蓋資料處理、效能優化、使用者體驗提升等關鍵領域。

---

## 指南結構

本指南已拆分為多個專門文件，便於查閱和維護：

### 🔗 核心技術指南

| 文件                                                   | 描述                      | 主要內容                                      |
| ------------------------------------------------------ | ------------------------- | --------------------------------------------- |
| [race-condition.md](./race-condition.md)               | 競態條件處理              | AbortController、Boolean Flag、TanStack Query |
| [search-system.md](./search-system.md)                 | 搜尋系統實作              | 自動完成、輸入法優化、防護機制                |
| [pagination-system.md](./pagination-system.md)         | 分頁系統實作              | 快取策略、異常處理、效能優化                  |
| [infinite-scroll.md](./infinite-scroll.md)             | 動態加載與無限捲動        | Intersection Observer、位置保存               |
| [intersection-observer.md](./intersection-observer.md) | Intersection Observer API | 懶加載、動畫觸發、廣告追蹤                    |
| [crud-sync.md](./crud-sync.md)                         | 列表資料 CRUD 同步        | 同步策略、狀態管理整合                        |
| [state-management.md](./state-management.md)           | 狀態管理選擇指南          | 決策樹、工具對比、最佳實踐                    |

---

## 快速導航

### 🚀 快速開始

如果你是新專案，建議閱讀順序：

1. **[state-management.md](./state-management.md)** - 了解狀態管理決策框架
2. **[race-condition.md](./race-condition.md)** - 掌握非同步請求處理
3. **[search-system.md](./search-system.md)** - 實作搜尋功能
4. 根據需求選擇：
   - 分頁系統 → [pagination-system.md](./pagination-system.md)
   - 無限捲動 → [infinite-scroll.md](./infinite-scroll.md)
   - CRUD 操作 → [crud-sync.md](./crud-sync.md)

### 📋 專案檢查清單

完整開發檢查清單請參考各專門文件末尾的「開發檢查清單」章節。

---

## 技術棧推薦

### 狀態管理組合

| 專案規模             | 推薦組合                             | 理由               |
| -------------------- | ------------------------------------ | ------------------ |
| **小型（< 10 頁）**  | URL + useState + Context             | 輕量、快速開發     |
| **中型（10-30 頁）** | TanStack Query + URL + Zustand       | 平衡功能與複雜度   |
| **大型（> 30 頁）**  | TanStack Query + URL + Redux Toolkit | 完整生態、團隊規範 |

### 核心工具庫

| 類型           | 工具                                 | 推薦理由                 |
| -------------- | ------------------------------------ | ------------------------ |
| **資料獲取**   | TanStack Query                       | 自動快取、重試、樂觀更新 |
| **客戶端狀態** | Zustand                              | 極簡 API、高效能         |
| **路由管理**   | React Router v6 / Next.js App Router | 標準方案、型別安全       |
| **表單管理**   | React Hook Form                      | 效能優異、驗證整合       |
| **UI 增強**    | @tanstack/react-virtual              | 虛擬滾動、長列表優化     |

---

## 最佳實踐核心原則

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

## 開發工具推薦

### DevTools 必備

| 工具                        | 用途     | 安裝方式                                     |
| --------------------------- | -------- | -------------------------------------------- |
| **React DevTools**          | 組件檢查 | 瀏覽器擴充                                   |
| **TanStack Query DevTools** | 查詢調試 | `npm install @tanstack/react-query-devtools` |
| **Redux DevTools**          | 狀態調試 | 瀏覽器擴充 + `@reduxjs/toolkit`              |
| **Zustand DevTools**        | 狀態調試 | 使用 `devtools` 中間件                       |

### 效能監控

| 工具               | 監控目標     |
| ------------------ | ------------ |
| **React Profiler** | 組件渲染效能 |
| **Lighthouse**     | 整體網頁效能 |
| **Web Vitals**     | 核心網頁指標 |

---

## 版本資訊

**版本**：2.0 (重構版本)  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)

---

## 更新日誌

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

## 貢獻指南

若要更新或新增內容，請：

1. 確定修改的專門文件
2. 保持程式碼範例的一致性
3. 更新對應的檢查清單
4. 確保版本資訊同步更新

---

**相關連結**：

- [React 官方文檔](https://react.dev/)
- [Next.js 官方文檔](https://nextjs.org/docs)
- [TanStack Query 文檔](https://tanstack.com/query/latest)
- [Zustand 文檔](https://docs.pmnd.rs/zustand)

---

## ✍️ 寫作風格指南（繁體中文）

為了保持本指南內容的一致性與可讀性，以下為推薦的文字與格式規範（僅適用於文件文字內容；程式碼區塊保留原格式）：

- 用詞統一（推薦）：
  - 「使用者」優先（替代「用戶」）；例如：使用者資料、使用者體驗
  - 「前端」優先（替代「客戶端」），視情境選用

- UI 文案與按鈕字詞：
  - 程式中呈現給使用者的狀態文字請使用中文優先，例如「載入中…」、「搜尋中…」、「下一頁」
  - 省略號統一為中文省略號「…」

- 中英文混寫與標註：
  - 技術名詞或函式保留英文（例如 `AbortController`、`useQuery`），可在第一次出現時以「中文（英文）」括注說明：例如「圖片懶加載（Lazy Loading）」
  - 標題或內文中的英文括注請使用全形括號「（英文）」

- 標點與格式：
  - 正文使用全形標點（，。：；「」等）以符合繁體中文閱讀習慣
  - 程式碼區塊內保留 ASCII 標點與原始格式

- Emoji 與變更日誌：
  - 允許在更新日誌或版本紀錄使用 emoji，但正文技術說明內盡量避免，以維持專業風格

- 變更流程（文件文字修正）：
  1. 在議題或 PR 中提出文字修改建議並附上對應檔案與行號
  2. 經作者或維護者確認後，統一以補丁方式修改並記錄在更新日誌

以上規範為建議性指引，若團隊有既有慣例請以團隊約定為準。如需我幫忙將整個檔案庫依此規範自動檢查與修正，可回覆要執行的範圍（例如：只檢查 UI 字串 / 全檔案掃描）。
請參考完整寫作風格細則：`STYLEGUIDE.md`（本目錄內）。
