# 🏎️ 瑪利歐賽車世界參數工具

一個用於分析和比較瑪利歐賽車角色與載具統計資料的 React/Next.js 應用程式。

## ✨ 功能特色

- 📊 **詳細統計顯示**: 查看所有角色和載具的完整能力值
- 🔍 **智能篩選**: 依據速度、加速度、重量、操控性進行排序
- 🧩 **組合分析**: 建立並比較角色+載具組合
- 📱 **響應式設計**: 支援各種螢幕尺寸
- ⚡ **高效能**: 使用 Jotai 全域狀態管理，避免重複載入
- 🎨 **現代 UI**: 基於 Tailwind CSS 的清潔介面
- 🔄 **數據自動同步**: 從 Google Sheets 自動抓取最新數據
- 💾 **持久化儲存**: 用戶組合自動儲存到 localStorage

## 🚀 技術架構

### 核心技術
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **狀態管理**: Jotai 2.12 + localStorage 持久化
- **樣式**: Tailwind CSS 3.4
- **語言**: TypeScript 5
- **套件管理**: pnpm

### 架構特點
- 📁 **模組化設計**: 清晰的檔案結構和關注點分離
- 🎣 **自定義 Hooks**: 可重用的邏輯封裝
- 🔧 **TypeScript**: 完整的型別安全
- 🎨 **設計系統**: 統一的樣式常數和組件
- ⚡ **全域狀態**: Jotai atoms 管理應用狀態
- 💾 **資料持久化**: 自動儲存用戶偏好和組合

## 📁 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # 資料同步管理頁面
│   ├── api/               # API 路由
│   ├── globals.css        # 全域樣式
│   ├── layout.tsx         # 根版面
│   └── page.tsx          # 首頁
├── components/            # React 組件
│   ├── CharacterCard.tsx # 角色卡片
│   ├── VehicleCard.tsx   # 載具卡片
│   ├── CombinationCard.tsx # 組合卡片
│   ├── CustomSelect.tsx   # 自定義下拉選單
│   ├── TestPersistence.tsx # 持久化測試
│   └── ...               # 其他組件
├── hooks/                 # 自定義 Hooks
│   ├── useMarioKartData.ts # 舊版資料 hook
│   └── useMarioKartStore.ts # Jotai 狀態管理
├── providers/             # Context Providers
│   └── JotaiProvider.tsx  # Jotai Provider
├── store/                 # 狀態管理
│   └── atoms.ts          # Jotai atoms 定義
├── utils/                 # 工具函數
│   ├── csvParser.ts      # CSV 解析器
│   └── dataSync.ts       # 資料同步工具
├── types/                 # TypeScript 類型定義
│   └── index.ts
└── constants/             # 應用程式常數
    └── index.ts
```

## 🛠️ 安裝與執行

### 1. 複製專案
```bash
git clone <repository-url>
cd MarioKartWorldParams
```

### 2. 安裝套件
```bash
pnpm install
```

### 3. 開發模式
```bash
pnpm dev
```

### 4. 建置正式版本
```bash
pnpm build
```

### 5. 啟動正式伺服器
```bash
pnpm start
```

## 📊 資料格式

應用程式從 `public/mario-kart-data.csv` 讀取資料，包含：

- **角色統計**: 速度、加速度、重量、操控性 (各地形類型)
- **載具統計**: 相同的統計類別
- **組合計算**: 自動計算角色+載具組合的總和 (+3 加成)

## 🎮 使用方式

1. **瀏覽角色/載具**: 使用篩選控制項排序和查看
2. **建立組合**: 選擇角色和載具建立組合
3. **比較統計**: 查看詳細的能力值比較
4. **分析資料**: 使用顏色編碼快速識別優劣

## 🌟 特色功能

- **動態排序**: 根據不同統計類型即時排序
- **地形特化**: 查看道路、地形、水面的專門數值
- **視覺化統計**: 彩色進度條顯示相對強度
- **組合管理**: 輕鬆新增/移除角色載具組合

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License
