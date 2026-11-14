# 變更日誌

本文檔記錄 MarioKartWorldParams 專案的所有重要變更。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/) 並且本專案遵循 [語意化版本](https://semver.org/lang/zh-TW/)。

## [0.1.1] - 2026-11-14

### 改善

- **介面改版**：依 unslop 原則改為賽道遊戲風格，色彩集中在角色焦點區與組合賽跑（詳見 `openspec/changes/20261114-playful-ui-redesign.md`）
- **性能分組與跑法**：相同數值的角色／載具合併，依速度與加速分成速度型／平衡型／加速型
- **組合賽跑**：紅綠燈倒數、賽跑模擬（封閉解 + 二分搜尋）與頒獎台
- **手機體驗**：頂部導覽固定在畫面上；點選卡片或搜尋結果後自動捲到焦點區
- **README**：改為與網站一致的視覺風格，附上實際畫面截圖
- 新增 favicon 與 Apple touch icon

### 修正

- 開發環境主控台的 Jotai DevTools 棄用警告與 Speed Insights CSP 錯誤

## [未發布]

### 新增

- 完整的 OpenSpec 文件架構
- 專案發展藍圖 (`openspec/ROADMAP.md`) - 規劃 v1.5.0 到 v2.5.0 的功能路線
- 貢獻者指南 (`openspec/CONTRIBUTING.md`) - 完整的開發流程和社群準則
- 部署指南 (`openspec/DEPLOYMENT.md`) - 多平台部署方案和故障排除
- 資料驗證和錯誤處理機制 (`dataValidation.ts`, `retryFetch.ts`, `fetchWithRetry.ts`)
- 新增 `LanguageProvider` 組件處理客戶端語言初始化
- 動態元件載入優化 (`RecommendationsPage.tsx`)
- 無障礙性標記增強 (ARIA labels, role 屬性)

### 改善

- **完整暗色模式系統**: 新增完整的亮色/暗色主題切換功能
- **主題優化**: 所有組件支援暗色模式，包括搜尋框、導航欄和卡片
- **文字對比度改善**: 暗色模式下優化文字顏色，確保清晰可讀
- **主題持久化**: 使用者主題偏好自動儲存到本地
- **平滑過渡效果**: 主題切換時有流暢的動畫過渡
- **搜尋體驗**: 搜尋相關組件完整適配暗色模式
- **導航優化**: mario-gradient 支援暗色模式版本
- **推薦系統效能優化**: 使用 Map 和更高效算法優化 `recommendedCombinationsAtom` 計算
- **型別安全**: 統一搜尋結果型別定義，完全移除已棄用的 SearchResult
- **語言系統**: 修正動態語言屬性設定，確保 SSR/CSR 一致性
- **無障礙性**: 為 CustomSelect 組件添加完整的 ARIA 支援和鍵盤導航
- **錯誤處理**: 增強重試機制，包含超時控制、指數退避和 AbortController 支援

### 修復

- 修正 SearchModal.tsx 中 SearchResultItem vs SearchResult 型別混用問題
- 解決 `fetchWithRetry.ts` 循環依賴錯誤，重構為 `retryFetch.ts` + `fetchWithRetry.ts`
- 修復 TypeScript 嚴格模式下的型別警告
- 修復 layout.tsx 語言提供者架構問題
- 修正 import 路徑和型別定義錯誤

---

## [1.0.0] - 2024-01-XX

### 新增

- Next.js 16 App Router 架構
- TypeScript 嚴格模式支援
- Jotai 狀態管理系統
- Tailwind CSS 樣式系統
- i18next 多語言支援 (5種語言)
- 瑪利歐賽車資料展示
- 智能推薦系統
- 搜尋功能
- 響應式設計
- 管理後台
- 資料同步 API

### 技術棧

- Next.js 16.0.10
- React 18.3.1
- TypeScript 5.9.3
- Jotai 2.16.0
- Tailwind CSS 3.4.19
- i18next 25.7.3
- pnpm

### 功能特色

- 角色和載具統計資料比較
- 基於地形的最佳組合推薦
- 中英文搜尋支援
- 多樣性推薦算法
- 本地儲存持久化
- 錯誤邊界處理
- 效能監控

### OpenSpec 整合

- 專案規格文件 (`openspec/PROJECT_SPEC.md`)
- 發展藍圖 (`openspec/ROADMAP.md`)
- 貢獻指南 (`openspec/CONTRIBUTING.md`)
- 部署指南 (`openspec/DEPLOYMENT.md`)
- 變更日誌 (`openspec/CHANGELOG.md`)
- OpenSpec 配置 (`openspec/openspec.json`)
