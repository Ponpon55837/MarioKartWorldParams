# 🏎️ 瑪利歐賽車世界參數工具 (Mario Kart World Parameters)

一個功能豐富的 React/Next.js 應用程式，用於分析和比較瑪利歐賽車角色與載具統計資料，提供智能推薦系統和高性能的使用者體驗。

## 🌟 功能特色

### 📊 資料分析與展示
- **詳細統計顯示**: 查看所有角色和載具的完整能力值
- **地形特化分析**: 道路、地形、水面三種地形的專門數值
- **視覺化統計**: 彩色進度條和動態圖表顯示相對強度

### 🔍 篩選與搜索
- **多維度排序**: 依據速度、加速度、重量、操控性進行排序
- **即時搜索**: 快速搜索角色和載具
- **高級篩選**: 複合條件篩選和範圍選擇
- **排序記憶**: 自動記住使用者的篩選偏好

### 💾 資料持久化
- **本地儲存**: 用戶組合和偏好自動儲存到 localStorage
- **即時同步**: 資料變更即時反映到 UI
- **跨設備同步**: 支援未來雲端同步功能
- **備份恢復**: 支援資料備份和恢復

## 🚀 技術架構

### 核心技術棧
- **Framework**: Next.js 14.2.5 (App Router)
- **UI Library**: React 18.3.1
- **狀態管理**: Jotai 2.12.5 + 本地持久化
- **樣式框架**: Tailwind CSS 3.4.0
- **開發語言**: TypeScript 5.8.3
- **套件管理**: pnpm

## 📁 專案結構

```
src/
├── app/                         # Next.js App Router
│   ├── admin/                   # 管理後台
│   │   └── page.tsx             # 資料同步管理頁面
│   ├── globals.css              # 全域樣式
│   ├── layout.tsx               # 根版面配置
│   └── page.tsx                 # 首頁
├── components/                  # React 組件庫
│   ├── CharacterCard.tsx        # 角色卡片組件
│   ├── VehicleCard.tsx          # 載具卡片組件
│   ├── CombinationCard.tsx      # 組合卡片組件
│   ├── RecommendationCard.tsx   # 推薦卡片組件
│   ├── RecommendationsPage.tsx  # 推薦頁面
│   ├── StatBar.tsx              # 統計條組件
│   ├── CustomSelect.tsx         # 自定義下拉選單
│   ├── SearchModal.tsx          # 搜索模態框
│   ├── SearchButton.tsx         # 搜索按鈕
│   ├── PageControls.tsx         # 頁面控制元件
│   ├── FilterControls.tsx       # 篩選控制元件
│   ├── CombinationSelector.tsx  # 組合選擇器
│   ├── VirtualizedList.tsx      # 虛擬化列表
│   ├── DebugDataLoading.tsx     # 偵錯元件
│   └── TestPersistence.tsx      # 持久化測試元件
├── hooks/                       # 自定義 Hooks
│   ├── useClientMounted.ts      # 客戶端掛載檢查
│   ├── useMarioKartData.ts      # 瑪利歐賽車資料管理
│   ├── useMarioKartStore.ts     # Jotai 狀態管理
│   ├── usePerformance.ts        # 性能監控
│   └── usePerformanceMonitor.ts # 性能監控工具
├── providers/                   # Context Providers
│   └── JotaiProvider.tsx        # Jotai Provider 配置
├── store/                       # 狀態管理
│   ├── atoms.ts                 # Jotai atoms 定義
│   └── combinations.ts          # 組合狀態管理
├── utils/                       # 工具函數
│   └── csvParser.ts             # CSV 解析和資料處理
├── types/                       # TypeScript 類型定義
│   └── index.ts                 # 應用程式類型定義
└── constants/                   # 應用程式常數
    ├── index.ts                 # 通用常數
    └── terrain.ts               # 地形配置常數

## 🛠️ 安裝與執行

### 系統需求
- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本

### 1. 複製專案
```bash
git clone https://github.com/Ponpon55837/MarioKartWorldParams.git
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
應用程式將在 http://localhost:3000 啟動

### 4. 建置生產版本
```bash
pnpm build
```

### 5. 啟動生產伺服器
```bash
pnpm start
```

### 6. 程式碼檢查
```bash
pnpm lint
```

## 📊 資料格式

應用程式從 `public/mario-kart-data.csv` 讀取瑪利歐賽車資料，包含：

### 角色統計
- **基本能力**: 速度、加速度、重量、操控性
- **地形特化**: 道路、地形、水面各地形的專門數值
- **顯示數值**: 遊戲中顯示的簡化數值

### 載具統計
- **相同統計類別**: 與角色相同的能力值結構
- **載具類型**: 卡丁車、機車、ATV 等分類
- **特殊屬性**: 載具獨有的特性參數

### 組合計算
- **自動計算**: 角色 + 載具 + 3 點遊戲加成
- **最大值**: 理論最大值 20 (10+7+3)
- **百分比**: 相對於最大值的百分比顯示

## 🎮 使用方式

### 1. 瀏覽和篩選
- 使用頁面頂部的控制項切換角色/載具/組合頁面
- 利用篩選控制項根據不同統計類型排序
- 使用搜索功能快速找到特定角色或載具

### 2. 建立組合
- 在組合頁面點擊「新增組合」按鈕
- 選擇角色和載具建立新組合
- 查看組合的詳細統計資料和能力值

### 3. 推薦系統
- 切換到推薦頁面查看 AI 推薦組合
- 選擇不同地形查看特化推薦
- 根據排名和評分選擇最適合的組合

### 4. 資料分析
- 利用顏色編碼快速識別能力值優劣
- 查看詳細的統計條形圖和數值
- 比較不同組合的能力值差異

## 🎯 特色功能詳解

### 推薦組合計算
```typescript
綜合評分 = 速度 × 40% + 操控性 × 30% + 加速度 × 20% - 重量 × 10%
```

### 地形特化系統
- **道路** 🏁: 平坦賽道，注重速度和操控性平衡
- **地形** 🏔️: 越野賽道，更注重加速度和重量穩定性
- **水面** 🌊: 水上賽道，需要特殊的操控技巧

### 多樣性控制
- 每個地形最多推薦 3 種相同載具
- 確保推薦結果的多樣性和實用性
- 避免推薦清單過度集中於少數載具

## 🔧 開發指南

### 本地開發
```bash
# 開啟開發伺服器
pnpm dev

# 開啟開發者工具
# Jotai DevTools 會自動啟用
```

## 🚨 已知問題

### 開發環境警告
- TypeScript 5.8.3 版本超出官方支援範圍 (>=4.7.4 <5.5.0)
- jotai-devtools 將在未來版本中移除自動 tree-shaking
- 某些 pnpm 快取檔案可能導致編譯警告

### 解決方案
```bash
# 清除快取
rm -rf .next
pnpm dev

# 重設 pnpm 快取
pnpm store prune
```

## 🤝 貢獻指南

歡迎貢獻程式碼、回報問題或建議新功能！

## 🎨 設計特色

### 視覺設計
- **現代化界面**: 清潔、簡潔的設計風格
- **彩色編碼**: 直觀的顏色系統表示不同能力值
- **動畫效果**: 流暢的過渡和互動效果
- **圖標系統**: 豐富的表情符號和圖標

### 使用者體驗
- **直觀操作**: 簡單易懂的操作流程
- **即時反饋**: 操作後立即顯示結果
- **錯誤處理**: 友好的錯誤提示和處理
- **載入狀態**: 清晰的載入指示器

## 🔐 安全性

### 資料安全
- **本地儲存**: 所有資料僅存於用戶本地
- **無伺服器**: 純前端應用，無後端資料收集
- **隱私保護**: 不收集任何個人資訊
- **開源透明**: 程式碼完全開源，可供審核

## 📄 授權

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- 感謝 Nintendo 提供瑪利歐賽車系列遊戲
- 感謝 React 和 Next.js 社群的開源貢獻
- 感謝 Jotai 團隊提供優秀的狀態管理方案
- 感謝 Tailwind CSS 團隊提供強大的樣式框架
- 感謝 任天堂玩家社群分享的資料內容
- 感謝所有測試用戶的回饋和建議

---

**⭐ 如果此專案對你有幫助，請給我們一個 star！**

**🐛 發現問題？請在 [Issues](https://github.com/Ponpon55837/MarioKartWorldParams/issues) 中回報**

**💡 有好的建議？歡迎在 [Discussions](https://github.com/Ponpon55837/MarioKartWorldParams/discussions) 中分享**

**🚀 想要貢獻？查看我們的 [貢獻指南](#-貢獻指南)**
