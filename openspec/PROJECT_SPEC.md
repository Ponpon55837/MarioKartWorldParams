# OpenSpec 專案規格

## 專案概述

這是一個瑪利歐賽車世界參數分析工具，提供角色和載具統計資料比較、智能推薦系統和多語言支援。

## 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript 5.9 (嚴格模式)
- **狀態管理**: Jotai 2.16
- **樣式**: Tailwind CSS 3.4
- **國際化**: i18next 25.7
- **套件管理**: pnpm

## 核心功能

1. **資料分析**: 角色和載具統計資料展示
2. **智能推薦**: 基於不同地形的最佳組合推薦
3. **搜尋系統**: 支援中英文搜尋角色和載具
4. **多語言**: 支援繁中、簡中、英文、日文、韓文
5. **響應式設計**: 適配桌面和行動裝置

## 開發規範

- 遵循 TypeScript 嚴格模式
- 使用 Jotai 進行狀態管理
- 實作 SSR 和 SSO 最佳實踐
- 確保無障礙性 (a11y) 標準
- 採用測試驅動開發 (TDD)

## 專案結構

```
src/
├── app/                 # Next.js App Router 頁面
├── components/          # React 元件
│   ├── home/           # 首頁元件
│   ├── search/         # 搜尋相關元件
│   └── ...
├── store/              # Jotai 狀態管理
├── utils/              # 工具函數
├── hooks/              # React Hooks
├── types/              # TypeScript 型別定義
├── i18n/               # 國際化配置
└── constants/          # 常數定義
```

## API 端點

- `/api/mario-kart-data` - 獲取瑪利歐賽車資料
- `/api/sync-data` - 同步資料
- `/api/data-status` - 資料狀態檢查

## 部署

- **平台**: Vercel (推薦)
- **環境變數**: 見 `.env.example`
- **建置命令**: `pnpm build`
- **開發命令**: `pnpm dev`

## 效能最佳化

- 實作動態元件載入
- 使用 Jotai 快取機制
- 圖片優化和懶載入
- Service Worker 快取策略

## 無障礙性

- 遵循 WCAG 2.1 AA 標準
- 完整的鍵盤導航支援
- 螢幕閱讀器優化
- 適當的 ARIA 標籤

## 測試策略

- 單元測試: Jest + React Testing Library
- 整合測試: Jest + React Testing Library
- E2E 測試: Playwright
- 測試覆蓋率目標: 80%+

## 安全性

- HTTPS 強制
- CSP (Content Security Policy)
- 速率限制
- 輸入驗證和清理

## 效能指標

- Lighthouse 分數目標: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.0s

## 版本控制

- 遵循語意化版本 (SemVer)
- 使用 Conventional Commits
- 自動化發布流程
- 變更日誌自動生成
