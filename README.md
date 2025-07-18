# 🏎️ 瑪利歐賽車世界參數工具

一個用於分析和比較瑪利歐賽車角色與載具統計資料的 React/Next.js 應用程式。

## ✨ 功能特色

- 📊 **詳細統計顯示**: 查看所有角色和載具的完整能力值
- 🔍 **智能篩選**: 依據速度、加速度、重量、操控性進行排序
- � **組合分析**: 建立並比較角色+載具組合
- � **響應式設計**: 支援各種螢幕尺寸
- ⚡ **高效能**: 使用 React Hooks 和 memoization 優化
- 🎨 **現代 UI**: 基於 Tailwind CSS 的清潔介面

## 🚀 技術架構

### 核心技術
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **樣式**: Tailwind CSS 3.4
- **語言**: TypeScript 5
- **套件管理**: pnpm

### 架構特點
- 📁 **模組化設計**: 清晰的檔案結構和關注點分離
- 🎣 **自定義 Hooks**: 可重用的邏輯封裝
- 🔧 **TypeScript**: 完整的型別安全
- 🎨 **設計系統**: 統一的樣式常數和組件
- ♻️ **性能優化**: useMemo, useCallback, 程式碼分割

## 📁 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全域樣式
│   ├── layout.tsx         # 根版面
│   └── page.tsx          # 首頁
├── components/            # React 組件
│   ├── CharacterCard.tsx # 角色卡片
│   ├── VehicleCard.tsx   # 載具卡片
│   ├── StatBar.tsx       # 統計條組件
│   └── ...               # 其他組件
├── hooks/                 # 自定義 Hooks
│   └── useMarioKartData.ts
├── utils/                 # 工具函數
│   └── csvParser.ts      # CSV 解析器
├── types/                 # TypeScript 類型定義
│   └── index.ts
└── constants/             # 應用程式常數
    └── index.ts
```

## 🛠️ 安裝與執行

### 1. 克隆專案
```bash
git clone <repository-url>
cd MarioKartWorldParams
```

### 2. 安裝依賴
```bash
pnpm install
```

### 3. 開發模式
```bash
pnpm dev
```

### 4. 建置生產版本
```bash
pnpm build
```

### 5. 啟動生產伺服器
```bash
pnpm start
```

## 📊 數據格式

應用程式從 `public/mario-kart-data.csv` 讀取數據，包含：

- **角色統計**: 速度、加速度、重量、操控性 (各地形類型)
- **載具統計**: 相同的統計類別
- **組合計算**: 自動計算角色+載具組合的總和 (+3 加成)

## 🎯 重構亮點

### ✅ 程式碼品質改善
- 移除未使用的程式碼和 imports
- 統一的錯誤處理
- 改善的型別安全性
- 更好的程式碼組織

### ⚡ 性能優化
- 使用 `useMemo` 優化計算
- `useCallback` 避免不必要的重新渲染
- 自定義 Hook 封裝數據邏輯
- 移除冗餘的 console.log

### 🎨 UI/UX 改善
- 統一的設計系統
- 可重用的組件
- 更好的載入狀態
- 改善的錯誤訊息

### 🏗️ 架構改善
- 清晰的關注點分離
- 更好的檔案組織
- 常數管理
- 型別定義優化

## 🎮 使用方式

1. **瀏覽角色/載具**: 使用篩選控制項排序和查看
2. **建立組合**: 選擇角色和載具建立組合
3. **比較統計**: 查看詳細的能力值比較
4. **分析數據**: 使用顏色編碼快速識別優劣

## 🌟 特色功能

- **動態排序**: 根據不同統計類型即時排序
- **地形特化**: 查看道路、地形、水面的專門數值
- **視覺化統計**: 彩色進度條顯示相對強度
- **組合管理**: 輕鬆新增/移除角色載具組合

## 📈 未來發展

- [ ] 更多統計分析功能
- [ ] 數據視覺化圖表
- [ ] 匯出功能
- [ ] 多語言支援
- [ ] PWA 支援

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License
