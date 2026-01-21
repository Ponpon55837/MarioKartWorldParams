# 🏎️ 瑪利歐賽車世界參數工具 (Mario Kart World Parameters)

一個功能豐富的 React/Next.js 應用程式，用於分析和比較瑪利歐賽車角色與載具統計資料，提供智能推薦系統和高性能的使用者體驗。

## 🌟 功能特色

### 🌍 多語言支援

- **五種語言**: 繁體中文、簡體中文、英文、日文、韓文
- **語言持久化**: 自動記住使用者選擇的語言設定
- **即時切換**: 無需重新載入頁面即可切換語言

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

### 核心技術

- **Framework**: Next.js 14.2.5 (App Router)
- **UI Library**: React 18.3.1
- **狀態管理**: Jotai 2.12.5 + 本地持久化
- **樣式框架**: Tailwind CSS 3.4.0
- **開發語言**: TypeScript 5.8.3
- **套件管理**: pnpm

### 多國語系

- **i18n Framework**: react-i18next 15.1.2
- **語言檢測**: i18next-browser-languagedetector 8.0.0
- **SSR 支援**: 完整的伺服器端渲染國際化
- **語言持久化**: localStorage + 智能語言檢測

## 📁 專案結構

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # 資料同步頁面
│   │   └── page.tsx              # 同步管理介面
│   ├── api/                      # API 路由
│   │   └── sync-data/            # 資料同步端點
│   │       └── route.ts          # Google Sheets 同步 API
│   ├── globals.css               # 全域樣式
│   ├── layout.tsx                # 根版面配置
│   └── page.tsx                  # 首頁
├── components/                   # React 組件庫
│   ├── CharacterCard.tsx         # 角色卡片組件
│   ├── VehicleCard.tsx           # 載具卡片組件
│   ├── CombinationCard.tsx       # 組合卡片組件
│   ├── RecommendationCard.tsx    # 推薦卡片組件
│   ├── RecommendationsPage.tsx   # 推薦頁面
│   ├── StatBar.tsx               # 統計條組件
│   ├── CustomSelect.tsx          # 自定義下拉選單
│   ├── LanguageSelector.tsx      # 語言選擇器
│   ├── ClientOnlyWrapper.tsx     # 客戶端包裝組件
│   ├── LayoutContent.tsx         # 版面內容組件
│   ├── SearchModal.tsx           # 搜索模態框
│   ├── SearchButton.tsx          # 搜索按鈕
│   ├── PageControls.tsx          # 頁面控制元件
│   ├── CombinationSelector.tsx   # 組合選擇器
│   ├── DebugDataLoading.tsx      # 偵錯元件
│   └── TestPersistence.tsx       # 持久化測試元件
├── hooks/                        # 自定義 Hooks
│   ├── useClientMounted.ts       # 客戶端掛載檢查
│   ├── useMarioKartData.ts       # 瑪利歐賽車資料管理
│   ├── useMarioKartStore.ts      # Jotai 狀態管理
│   └── useLanguagePersistence.ts # 語言持久化管理
├── i18n/                         # 國際化系統
│   ├── config.ts                 # i18next 配置
│   └── locales/                  # 語言文件
│       ├── zh-TW.json            # 繁體中文
│       ├── zh-CN.json            # 簡體中文
│       ├── en.json               # 英文
│       ├── ja.json               # 日文
│       └── ko.json               # 韓文
├── providers/                    # Context Providers
│   └── JotaiProvider.tsx         # Jotai Provider 配置
├── store/                        # 狀態管理
│   ├── atoms.ts                  # Jotai atoms 定義
│   └── combinations.ts           # 組合狀態管理
├── utils/                        # 工具函數
│   └── csvParser.ts              # CSV 解析和資料處理
├── types/                        # TypeScript 類型定義
│   └── index.ts                  # 應用程式類型定義
└── constants/                    # 應用程式常數
    └── index.ts                  # 通用常數
```

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

應用程式從 `public/mario-kart-data.csv` `public/mario-kart-data.json` 讀取瑪利歐賽車資料，包含：

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

### 1. 語言設定

- 點擊右上角的語言選擇器切換語言
- 支援繁體中文、簡體中文、英文、日文、韓文
- 語言設定會自動儲存，重新載入後保持選擇

### 2. 瀏覽和篩選

- 使用頁面頂部的控制項切換角色/載具/組合頁面
- 利用篩選控制項根據不同統計類型排序
- 使用搜索功能快速找到特定角色或載具

### 3. 建立組合

- 在組合頁面點擊「新增組合」按鈕
- 選擇角色和載具建立新組合
- 查看組合的詳細統計資料和能力值

### 4. 推薦系統

- 切換到推薦頁面查看推薦組合
- 選擇不同地形查看特化推薦
- 根據排名和評分選擇最適合的組合

### 5. 資料分析

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

### 雙系統 Agent Skills 整合

本專案開發了創新的**軟路由共享機制**，讓 OpenCode 和 GitHub Copilot 兩個 AI 系統共享同一套技能庫，避免重複維護。

#### 🔄 軟路由共享機制

```
.github/skills/          # GitHub Copilot Agent Skills
│   ├── code-standards -> ../../.opencode/skills/code-standards
│   ├── git-workflow -> ../../.opencode/skills/git-workflow
│   ├── i18n-workflow -> ../../.opencode/skills/i18n-workflow
│   ├── react-best-practices -> ../../.opencode/skills/react-best-practices
│   ├── web-design-guidelines -> ../../.opencode/skills/web-design-guidelines
│   └── readme-maintenance/  # 新技能：README 維護指南
│
.opencode/skills/         # OpenCode Agent Skills
│   ├── code-standards/
│   ├── git-workflow/
│   ├── i18n-workflow/
│   ├── react-best-practices/
│   ├── web-design-guidelines/
│   └── readme-maintenance -> ../../.github/skills/readme-maintenance
```

**🎯 優勢**：

- ✅ **單一維護點**：修改一次，兩個系統同步更新
- ✅ **無縫整合**：兩個 AI 系統都能存取完整的技能庫
- ✅ **自動同步**：透過符號連結實現即時同步
- ✅ **節省時間**：避免重複維護相同內容

#### 🛠️ 可用的 Skills

**專案自訂 Skills：**

- **git-workflow**: Git 分支命名與工作流程規範
  - 標準化的分支命名格式 (`<type>/<name>/<description>`)
  - 分支類型: feat, fix, refactor, docs, style, test, chore
  - Git 工作流程最佳實踐
  - 支援中文 commit message 規範

- **code-standards**: Next.js App Router 與 TypeScript 編碼規範
  - Next.js 16 App Router 規範
  - TypeScript 嚴格模式與型別定義
  - Jotai 狀態管理規範（優先使用 atoms，避免 props drilling）
  - Tailwind CSS 樣式規範
  - 開發測試流程與強制性驗證步驟

- **i18n-workflow**: 多語言國際化開發流程
  - 五語言支援 (繁中、簡中、英、日、韓)
  - i18next 使用方式
  - 翻譯檔案管理流程
  - 語言持久化實現

- **readme-maintenance**: README.md 維護與文檔同步指南 🆕
  - 技術棧版本自動同步檢查
  - 專案結構變更更新流程
  - 功能變更文檔化規範
  - 雙系統技能整合驗證
  - 自動化檢查腳本範本

**Vercel Labs Skills：**

- **react-best-practices**: React 與 Next.js 性能優化指南 (來自 Vercel Engineering)
  - 40+ 條規則，涵蓋 8 大類別，按影響程度分級
  - **消除 Waterfalls** (關鍵): 非同步操作優化、Promise.all()、Suspense 邊界
  - **Bundle Size 優化** (關鍵): 避免 barrel imports、動態匯入、延遲載入
  - **伺服器端效能** (高): React.cache()、LRU 快取、平行資料獲取
  - **客戶端資料獲取** (中高): SWR、事件監聽器去重
  - **Re-render 優化** (中): memo、衍生狀態、transitions
  - **渲染效能** (中): SVG 優化、content-visibility、靜態 JSX
  - **JavaScript 效能** (低中): 快取優化、Set/Map 查找、迴圈優化
  - **進階模式** (低): useLatest、事件處理器 refs

- **web-design-guidelines**: Web 介面設計最佳實踐檢查
  - 100+ 條 UI/UX 規則，用於審查前端程式碼
  - **無障礙性**: aria-labels、語義化 HTML、鍵盤處理
  - **焦點狀態**: 可見的焦點、focus-visible 模式
  - **表單**: autocomplete、驗證、錯誤處理
  - **動畫**: prefers-reduced-motion、compositor-friendly transforms
  - **排版**: 彎引號、省略號、tabular-nums
  - **圖片**: 尺寸、延遲載入、alt 文字
  - **效能**: 虛擬化、避免 layout thrashing、preconnect
  - **導航與狀態**: URL 反映狀態、深度連結
  - **深色模式與主題**: color-scheme、theme-color meta
  - **觸控與互動**: touch-action、tap-highlight
  - **本地化與 i18n**: Intl.DateTimeFormat、Intl.NumberFormat

#### 🎯 如何使用 Agent Skills

**OpenCode AI 使用者：**

```bash
# OpenCode 會自動載入專案中的 skills
# 在對話中提及相關主題時，AI 會自動參考對應的 skill
```

**GitHub Copilot 使用者：**

- GitHub Copilot 會自動偵測 `.github/skills/` 目錄中的技能
- 在相關開發任務中，Copilot 會自動載入對應的技能指南
- 支援 VS Code、Copilot CLI 和 GitHub.com 中的 agent 模式

#### 📁 雙系統配置結構

```
.opencode/                      # OpenCode 配置
├── README.md                   # AI 助手必讀檔案
├── config.yaml                 # 專案配置規則
├── hooks/
│   └── pre-modify.sh          # 檔案修改前檢查
└── skills/
    ├── git-workflow/           # Git 規範
    ├── code-standards/         # 程式碼標準
    ├── i18n-workflow/         # 多語言流程
    ├── react-best-practices/   # React 效能最佳化
    ├── web-design-guidelines/   # UI/UX 最佳實踐
    └── readme-maintenance/ -> ../../.github/skills/readme-maintenance

.github/skills/                # GitHub Copilot 技能
├── git-workflow -> ../../.opencode/skills/git-workflow
├── code-standards -> ../../.opencode/skills/code-standards
├── i18n-workflow -> ../../.opencode/skills/i18n-workflow
├── react-best-practices -> ../../.opencode/skills/react-best-practices
├── web-design-guidelines -> ../../.opencode/skills/web-design-guidelines
└── readme-maintenance/        # README 維護指南
```

#### 🚨 關鍵規範自動執行

專案配置了以下自動檢查機制：

1. **`.opencode/README.md`** - AI 啟動時必讀
   - 包含最關鍵的操作規範
   - 防止在 main 分支上直接修改
   - 強制執行 Git 工作流程

2. **`.opencode/config.yaml`** - 專案行為配置
   - 定義 AI 的自動檢查規則
   - 設定 skills 自動載入時機
   - 配置檔案修改前後的檢查流程

3. **`.opencode/hooks/pre-modify.sh`** - 自動檢查腳本
   - 在修改任何檔案前自動執行
   - 驗證目前不在 main 分支
   - 確保分支命名符合規範

#### Skills 文件說明

每個 skill 都包含：

- 功能說明和使用時機
- 詳細的開發規範和範例
- 最佳實踐和注意事項
- 常見問題解答
- 相關參考資源

開發者可以直接閱讀這些檔案來了解專案規範，或者讓 OpenCode AI 自動參考這些 skills 來協助開發。

#### 🔒 防錯機制

本專案實施以下防錯措施：

- ✅ 禁止在 main 分支直接修改檔案
- ✅ 強制使用功能分支開發
- ✅ 自動檢查分支命名規範
- ✅ Commit message 必須使用繁體中文
- ✅ 推送前必須經過使用者確認
- ✅ 修改後必須進行測試

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
