# Copilot Instructions - 瑪利歐賽車世界參數工具

## 專案概述

這是一個使用 Next.js 16 App Router 建立的瑪利歐賽車角色與載具統計分析工具，提供多語言支援、智能推薦系統和資料持久化功能。請嚴格遵守以下指引。

## 此文件的介紹

- 本文件是為了幫助 GitHub Copilot 和各種 AI 工具更容易理解此倉庫的上下文。
- 在實施新功能時，請以這裡示範的技術選擇、設計方針和模組結構為前提。
- 若有不確定之處，請探索倉庫的檔案，並詢問使用者「這是這樣的意思嗎?」

## 前提條件

- 回應必須使用**繁體中文 (zh-TW)**。
- 在進行變更時，如果變更量有可能超過 300 行，請事先確認「這個指示的變更量可能會超過 300 行，您是否要執行？」
- 對於大的變更，首先制定計畫，然後告訴使用者「我打算這樣進行計畫。」如果使用者要求修正計畫，請進行調整後再提議。
- **每次修改檔案後必須進行驗證**：完成任何檔案的修改後，必須立即驗證修改結果是否正確，確保語法無誤、功能正常運作。避免在錯誤的基礎上繼續進行後續修改。驗證方式包括：
  - 讀取修改後的檔案內容確認變更正確
  - 執行 `pnpm dev` 確認專案可以正常啟動
  - 檢查是否有 TypeScript 編譯錯誤
  - 檢查是否有 ESLint 錯誤
  - 必要時執行相關測試確保功能正常

## 允許使用的套件

### 核心依賴

- **Next.js**: `^16.0.10` - 必須使用 App Router 模式
- **React**: `^18.3.1` 和 `react-dom`: `^18.3.1`
- **Jotai**: `^2.16.0` - 用於狀態管理
- **Tailwind CSS**: `^3.4.19` - 用於樣式設計
- **TypeScript**: `^5.9.3`
- **i18next**: `^25.7.3` - 國際化核心
- **react-i18next**: `^15.7.4` - React 國際化綁定
- **i18next-browser-languagedetector**: `^8.2.0` - 瀏覽器語言檢測

### 開發依賴

- `@types/node`, `@types/react`, `@types/react-dom`
- `eslint`, `eslint-config-next`
- `postcss`, `autoprefixer`
- `jotai-devtools`: `^0.13.0` - Jotai 開發工具
- `prettier`: `^3.7.4` - 程式碼格式化

### 監控與分析

- `@vercel/speed-insights`: `^1.3.1` - 性能監控

## 嚴格禁止的套件

❌ **不要使用以下套件或建議安裝**：

- Redux、Redux Toolkit、Zustand、Recoil（已使用 Jotai）
- styled-components、emotion、CSS-in-JS 庫（已使用 Tailwind CSS）
- Next.js Pages Router 相關寫法
- Class Components（使用 Function Components）
- Material-UI、Ant Design、Chakra UI 等 UI 框架（使用 Tailwind CSS）
- axios（使用原生 fetch）
- i18next 以外的國際化方案（如 next-intl、next-i18next）

## 必須遵守的寫法

### 1. Next.js App Router 規則

✅ **正確寫法**：

```typescript
// app/page.tsx
export default function Page() {
  return <div>Home</div>;
}

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
```

❌ **禁止使用 Pages Router 寫法**：

```typescript
// 不要使用 pages/ 目錄
// 不要使用 getServerSideProps、getStaticProps
// 不要使用 _app.tsx、_document.tsx
```

### 2. 客戶端元件標記

所有使用 hooks 或瀏覽器 API 的元件必須標記 `'use client'`：

```typescript
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}
```

### 3. 狀態管理方針

本專案使用 **Jotai** 進行全局狀態管理，所有狀態定義都在 `src/store/` 目錄中。

#### 定義 Jotai 原子

✅ **正確寫法**：

```typescript
// store/dataAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 一般狀態
export const charactersAtom = atom<CharacterStats[]>([]);
export const vehiclesAtom = atom<VehicleStats[]>([]);
export const currentPageAtom = atom<'characters' | 'vehicles' | 'combinations' | 'recommendations'>('characters');

// 持久化狀態（自動儲存到 localStorage）
export const languageAtom = atomWithStorage<SupportedLanguage>('mario-kart-language', 'zh-TW');
```

**在元件中使用**：

```typescript
'use client';
import { useAtom } from 'jotai';
import { charactersAtom, languageAtom } from '@/store/dataAtoms';

export default function Component() {
  const [characters] = useAtom(charactersAtom);
  const [language, setLanguage] = useAtom(languageAtom);

  return <div>Current Language: {language}</div>;
}
```

#### 持久化狀態管理

使用 Jotai 的 `atomWithStorage` 工具實現持久化：

✅ **正確寫法**：

```typescript
// store/dataAtoms.ts
import { atomWithStorage } from 'jotai/utils';

// 語言設定 - 持久化到 localStorage
export const languageAtom = atomWithStorage<SupportedLanguage>('mario-kart-language', 'zh-TW');

// 使用者組合 - 持久化到 localStorage
export const userCombinationsAtom = atomWithStorage<CombinationStats[]>('mario-kart-combinations', []);
```

**持久化注意事項**：

- `atomWithStorage` 會自動將狀態同步到 `localStorage`
- 第一個參數是 localStorage 的 key，建議使用 `mario-kart-` 前綴
- 第二個參數是預設值
- 確保只在 Client Component 中使用持久化 atom

❌ **不要使用**：

- 其他狀態管理方案（Redux、Zustand、Recoil）
- 自行實現 localStorage 同步邏輯
- 第三方持久化套件（如 redux-persist）

### 4. 國際化 (i18n) 規範

本專案支援五種語言：**繁體中文 (zh-TW)**、**簡體中文 (zh-CN)**、**英文 (en)**、**日文 (ja)**、**韓文 (ko)**。

#### 語言文件結構

所有翻譯文件都放在 `src/i18n/locales/` 目錄：

```
src/i18n/locales/
├── zh-TW.json  # 繁體中文（預設語言）
├── zh-CN.json  # 簡體中文
├── en.json     # 英文
├── ja.json     # 日文
└── ko.json     # 韓文
```

#### 使用 i18next

✅ **正確寫法**：

```typescript
'use client';
import { useTranslation } from 'react-i18next';

export default function Component() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('stats.speed')}</p>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

#### 語言切換

```typescript
'use client';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { languageAtom } from '@/store/dataAtoms';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useAtom(languageAtom);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang as SupportedLanguage);
  };

  return (
    <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
      <option value="zh-TW">繁體中文</option>
      <option value="zh-CN">简体中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
    </select>
  );
}
```

#### 新增翻譯

當需要新增翻譯時，**必須同時更新所有五個語言文件**：

```json
// zh-TW.json
{
  "newFeature": {
    "title": "新功能標題",
    "description": "新功能說明"
  }
}

// zh-CN.json
{
  "newFeature": {
    "title": "新功能标题",
    "description": "新功能说明"
  }
}

// en.json
{
  "newFeature": {
    "title": "New Feature Title",
    "description": "New Feature Description"
  }
}

// ja.json
{
  "newFeature": {
    "title": "新機能タイトル",
    "description": "新機能の説明"
  }
}

// ko.json
{
  "newFeature": {
    "title": "새 기능 제목",
    "description": "새 기능 설명"
  }
}
```

**國際化原則**：

1. 所有使用者可見文字必須透過 `t()` 函式翻譯
2. 翻譯 key 使用點號分隔的命名空間（如 `stats.speed`、`actions.save`）
3. 新增翻譯必須同時更新所有語言文件
4. 語言設定自動持久化到 localStorage
5. 預設語言為繁體中文 (zh-TW)

❌ **不要使用**：

- 硬編碼的文字（除 console.log 或開發用途）
- next-intl 或 next-i18next
- 只更新單一語言文件

### 5. Tailwind CSS 樣式

本專案使用 Tailwind CSS，並有自定義瑪利歐主題色。

✅ **正確寫法**：

```typescript
export default function Component() {
  return (
    <div className="flex items-center justify-center p-4 bg-mario-red text-white rounded-lg hover:bg-red-600 transition-colors">
      Content
    </div>
  );
}
```

#### 自定義主題色

```typescript
// tailwind.config.js 已定義的瑪利歐主題色
colors: {
  mario: {
    red: '#FF0000',
    blue: '#0066CC',
    yellow: '#FFD700',
    green: '#00AA00'
  }
}

// 使用範例
<div className="bg-mario-red text-mario-yellow border-mario-blue">
  Mario Theme
</div>
```

#### RWD 響應式設計

所有元件必須支援響應式設計：

✅ **RWD 正確寫法範例**：

```typescript
export default function ResponsiveComponent() {
  return (
    <div
      className="
      w-full px-4 py-2 text-sm
      sm:px-6 sm:text-base
      md:px-8 md:py-4
      lg:max-w-7xl lg:mx-auto lg:px-12 lg:py-6 lg:text-lg
    "
    >
      <h1 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">響應式標題</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">{/* 卡片內容 */}</div>
    </div>
  );
}
```

**RWD 開發原則**：

1. 採用 **Mobile First** 設計（預設樣式為手機版）
2. 使用斷點前綴漸進增強（`sm:`、`md:`、`lg:`）
3. 確保 Web 版有適當的最大寬度（`max-w-*`）和置中（`mx-auto`）
4. 文字大小、間距、佈局都要有響應式變化

❌ **不要使用**：

- inline styles（除非動態計算的值）
- CSS Modules
- styled-components
- CSS-in-JS 方案

### 6. 路徑別名

使用 `@/` 作為 `src/` 的別名：

```typescript
import { charactersAtom } from '@/store/dataAtoms';
import CharacterCard from '@/components/CharacterCard';
import { CharacterStats } from '@/types';
import { parseMarioKartCSV } from '@/utils/csvParser';
```

### 7. TypeScript 嚴格模式與型別定義

所有程式碼必須符合 TypeScript 嚴格模式，並遵循以下型別定義規範。

#### 優先使用 interface

✅ **正確寫法 - 使用 interface**：

```typescript
// types/index.ts
// 角色統計資料
interface CharacterStats {
  name: string;
  englishName: string;
  displaySpeed: number;
  roadSpeed: number;
  terrainSpeed: number;
  waterSpeed: number;
  acceleration: number;
  weight: number;
  displayHandling: number;
  roadHandling: number;
  terrainHandling: number;
  waterHandling: number;
}

// 載具統計資料
interface VehicleStats {
  name: string;
  englishName: string;
  displaySpeed: number;
  roadSpeed: number;
  terrainSpeed: number;
  waterSpeed: number;
  acceleration: number;
  weight: number;
  displayHandling: number;
  roadHandling: number;
  terrainHandling: number;
  waterHandling: number;
}

// 元件 Props
interface CharacterCardProps {
  character: CharacterStats;
  onClick?: () => void;
}
```

#### 何時使用 type

只在以下情況使用 `type`：

```typescript
// Union types
export type StatType = 'speed' | 'acceleration' | 'weight' | 'handling';
export type SpeedType = 'road' | 'terrain' | 'water';
export type SupportedLanguage = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko';

// 搜尋結果的聯合型別
export type SearchResultItem =
  | {
      type: 'character';
      data: CharacterStats;
    }
  | {
      type: 'vehicle';
      data: VehicleStats;
    };
```

**型別定義原則**：

1. **優先 interface** - 物件結構、類別定義、元件 Props
2. **描述性命名** - `CharacterStats` 而非 `CS`，`VehicleStats` 而非 `VS`
3. **避免 any** - 使用 `unknown` 或具體類型
4. **統一放置** - 所有型別定義放在 `src/types/index.ts`

❌ **避免的寫法**：

```typescript
// ❌ 不要使用 type 定義物件結構（除非需要 union）
type Props = {
  title: string;
};

// ❌ 不要使用模糊的名稱
interface P {
  t: string;
}

// ❌ 不要使用 any
function process(data: any) {}
```

### 8. 資料獲取與處理

#### CSV 資料解析

本專案的資料來源是 CSV 檔案，使用自定義的 CSV Parser：

✅ **正確寫法**：

```typescript
// utils/csvParser.ts
import { MarioKartData } from '@/types';

export async function parseMarioKartCSV(): Promise<MarioKartData> {
  // CSV 解析邏輯
}

// 在 atom 中使用
import { atom } from 'jotai';
import { parseMarioKartCSV } from '@/utils/csvParser';

export const loadDataAtom = atom(null, async (get, set) => {
  set(loadingAtom, true);
  try {
    const data = await parseMarioKartCSV();
    set(charactersAtom, data.characters);
    set(vehiclesAtom, data.vehicles);
  } catch (error) {
    set(errorAtom, error.message);
  } finally {
    set(loadingAtom, false);
  }
});
```

#### API 路由

✅ **使用原生 fetch**：

```typescript
// app/api/sync-data/route.ts
export async function GET() {
  try {
    const data = await fetch('https://api.example.com/data');
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// 在 Client Component 中呼叫
async function syncData() {
  const response = await fetch('/api/sync-data');
  const data = await response.json();
  return data;
}
```

❌ **不要使用 axios 或其他 HTTP 客戶端**

### 9. 套件管理器

✅ **必須使用 pnpm**：

```bash
pnpm add package-name
pnpm remove package-name
pnpm install
```

❌ **不要使用**：

```bash
npm install
yarn add
```

### 10. 性能最佳化

#### React 元件最佳化

```typescript
// 使用 React.memo 避免不必要的重渲染
const CharacterCard = React.memo(({ character }: CharacterCardProps) => {
  return <div>{character.name}</div>;
});

// 使用 useMemo 快取計算結果
const sortedCharacters = useMemo(() => {
  return characters.sort((a, b) => b.speed - a.speed);
}, [characters]);

// 使用 useCallback 快取函式
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

#### Next.js 專屬最佳化

```typescript
// 動態導入
import dynamic from 'next/dynamic';

const SearchModal = dynamic(() => import('@/components/SearchModal'), {
  loading: () => <p>載入中...</p>,
  ssr: false
});

// Metadata 優化
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '瑪利歐賽車世界參數工具',
  description: '分析和比較瑪利歐賽車角色與載具統計資料'
};
```

#### 監控與分析

專案已整合 Vercel Speed Insights：

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 11. 可及性 (Accessibility)

```typescript
// ✅ 語意化 HTML
<button onClick={handleClick}>提交</button>
<nav><a href="/characters">角色列表</a></nav>

// ✅ ARIA 屬性
<button aria-label="關閉搜尋視窗" onClick={handleClose}>
  <CloseIcon />
</button>

// ✅ 焦點管理
<button className="focus-visible:ring-2 focus-visible:ring-mario-blue">
  按鈕
</button>
```

## 專案結構規範

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根佈局（包含 i18n 初始化）
│   ├── page.tsx                  # 首頁（主要資料展示）
│   ├── globals.css               # 全域樣式
│   ├── admin/                    # 管理頁面
│   │   └── page.tsx              # 資料同步管理
│   └── api/                      # API 路由
│       └── sync-data/            # 資料同步 API
│           └── route.ts
├── components/                   # React 元件
│   ├── CharacterCard.tsx         # 角色卡片元件
│   ├── VehicleCard.tsx           # 載具卡片元件
│   ├── CombinationCard.tsx       # 組合卡片元件
│   ├── RecommendationCard.tsx    # 推薦卡片元件
│   ├── RecommendationsPage.tsx   # 推薦頁面元件
│   ├── StatBar.tsx               # 統計條元件
│   ├── CustomSelect.tsx          # 自定義下拉選單
│   ├── LanguageSelector.tsx      # 語言選擇器
│   ├── SearchModal.tsx           # 搜尋模態框
│   ├── SearchButton.tsx          # 搜尋按鈕
│   ├── PageControls.tsx          # 頁面控制元件
│   ├── CombinationSelector.tsx   # 組合選擇器
│   ├── ClientOnlyWrapper.tsx     # 客戶端包裝元件
│   └── LayoutContent.tsx         # 版面內容元件
├── store/                        # Jotai 狀態管理
│   ├── dataAtoms.ts              # 資料相關 atoms
│   └── combinations.ts           # 組合相關 atoms
├── hooks/                        # 自定義 Hooks
│   ├── useClientMounted.ts       # 客戶端掛載檢查
│   ├── useMarioKartStore.ts      # Jotai 狀態 hook
│   ├── useLanguagePersistence.ts # 語言持久化 hook
│   └── usePerformance.ts         # 性能監控 hook
├── i18n/                         # 國際化系統
│   ├── config.ts                 # i18next 配置
│   └── locales/                  # 翻譯文件
│       ├── zh-TW.json            # 繁體中文
│       ├── zh-CN.json            # 簡體中文
│       ├── en.json               # 英文
│       ├── ja.json               # 日文
│       └── ko.json               # 韓文
├── types/                        # TypeScript 型別定義
│   ├── index.ts                  # 主要型別定義
│   └── globals.d.ts              # 全域型別宣告
├── utils/                        # 工具函式
│   ├── csvParser.ts              # CSV 解析器
│   ├── searchHistory.ts          # 搜尋歷史管理
│   └── performance.ts            # 性能工具
├── constants/                    # 常數定義
│   ├── index.ts                  # 通用常數
│   └── terrain.ts                # 地形相關常數
└── providers/                    # Context Providers
    └── JotaiProvider.tsx         # Jotai Provider
```

## 程式碼風格與規範

### TypeScript 規範

#### 嚴格模式配置

- **strict: true**: 在 `tsconfig.json` 中已啟用嚴格模式
- **禁止 any**: 使用 `unknown` 替代
- **型別推論優先**: 避免不必要的型別註解

```typescript
// ✅ 好的寫法
const count = 0; // 自動推論為 number
const character: CharacterStats = { name: 'Mario', ... };

// ✅ 使用 unknown 而非 any
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
}

// ✅ 使用聯合型別
type Status = 'idle' | 'loading' | 'success' | 'error';
```

### React 規範

#### 元件設計

- **函式元件優先**: 不使用 Class Components
- **元件大小限制**: 單一元件不超過 200 行
- **避免 Prop Drilling**: 使用 Jotai

```typescript
// ✅ 適當大小的元件
export default function CharacterCard({ character }: CharacterCardProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-lg bg-white shadow-md">
      <h2>{character.name}</h2>
      <p>{t('stats.speed')}: {character.displaySpeed}</p>
    </div>
  );
}
```

#### Hooks 使用規則

```typescript
'use client';

export default function Component({ id }: { id: string }) {
  // ✅ 在頂層呼叫
  const [data, setData] = useState(null);
  const { t } = useTranslation();

  // ✅ 準確的依賴陣列
  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]);

  return <div>{data}</div>;
}
```

#### 列表渲染

```typescript
// ✅ 使用唯一 ID
{
  characters.map((character) => <CharacterCard key={character.englishName} character={character} />);
}

// ❌ 避免使用索引
{
  characters.map((character, index) => <CharacterCard key={index} character={character} />);
}
```

### 非同步處理規範

#### async/await 優先

```typescript
// ✅ 使用 async/await
async function loadCharacters() {
  try {
    const data = await parseMarioKartCSV();
    return data.characters;
  } catch (error) {
    console.error('Failed to load characters:', error);
    throw error;
  }
}
```

#### 錯誤處理

```typescript
'use client';

export default function Component() {
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const response = await fetch('/api/data', {
          signal: controller.signal
        });
        const data = await response.json();
        // 處理資料
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request cancelled');
        } else {
          console.error('Error:', error);
        }
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  return <div>Component</div>;
}
```

### 引入順序規範

```typescript
// 1. React / Next.js 相關
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';

// 2. 外部函式庫
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

// 3. 內部模組
import { charactersAtom, languageAtom } from '@/store/dataAtoms';
import { parseMarioKartCSV } from '@/utils/csvParser';
import CharacterCard from '@/components/CharacterCard';

// 4. 型別定義
import type { CharacterStats, VehicleStats } from '@/types';

// 5. 樣式
import './styles.css';
```

### 註解規範

```typescript
/**
 * 計算角色和載具的組合統計
 * @param character - 角色統計資料
 * @param vehicle - 載具統計資料
 * @returns 組合後的統計資料
 */
function calculateCombinationStats(character: CharacterStats, vehicle: VehicleStats): CombinationStats {
  // 實作...
}

// TODO: 需要優化排序演算法
function sortCharacters(characters: CharacterStats[]) {
  // 暫時的實作
}
```

## 反模式與最佳實踐

### 應避免的模式

#### 元件設計反模式

❌ **龐大元件**: 超過 300 行應拆分
❌ **Prop Drilling**: 使用 Jotai 解決
❌ **濫用 useEffect**: 資料獲取應在適當層級進行

#### 狀態管理反模式

❌ **過度全局狀態**: 只將真正需要共享的狀態放入 Jotai
❌ **直接修改狀態**: 保持不可變更新

```typescript
// ❌ 直接修改
const [character, setCharacter] = useState({ name: 'Mario', speed: 10 });
character.speed = 11; // 錯誤！
setCharacter(character);

// ✅ 不可變更新
setCharacter({ ...character, speed: 11 });
setCharacter((prev) => ({ ...prev, speed: 11 }));
```

#### 國際化反模式

❌ **硬編碼文字**: 所有使用者可見文字必須透過 `t()` 翻譯
❌ **只更新部分語言**: 新增翻譯必須同時更新所有語言文件

```typescript
// ❌ 硬編碼
<button>儲存</button>

// ✅ 使用翻譯
<button>{t('actions.save')}</button>
```

## 安全性與隱私

### 環境變數管理

```bash
# .env
DATABASE_URL=postgresql://...           # 僅伺服器端
NEXT_PUBLIC_API_URL=https://api.com    # 客戶端可存取
```

```typescript
// Server Component 可存取所有環境變數
const dbUrl = process.env.DATABASE_URL;

// Client Component 只能存取 NEXT_PUBLIC_ 前綴
('use client');
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### XSS 防護

```typescript
// ✅ React 自動轉義
<div>{userInput}</div>

// ✅ 驗證使用者輸入
function validateInput(input: string): boolean {
  return input.length > 0 && input.length < 100;
}
```

## 新增套件流程

在建議新增任何套件之前，請先確認：

1. ✅ 該功能是否可以用現有套件實現？
2. ✅ 是否可以用原生 JavaScript/TypeScript 實現？
3. ✅ 該套件是否與現有技術棧相容？
4. ✅ 是否真的需要這個套件？

如果確實需要新套件，請明確說明理由並等待用戶確認。

## 範例：完整的頁面元件

```typescript
// app/characters/page.tsx
'use client';

import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { charactersAtom, sortByAtom } from '@/store/dataAtoms';
import CharacterCard from '@/components/CharacterCard';
import type { CharacterStats } from '@/types';

export default function CharactersPage() {
  const { t } = useTranslation();
  const [characters] = useAtom(charactersAtom);
  const [sortBy] = useAtom(sortByAtom);

  const sortedCharacters = useMemo(() => {
    return [...characters].sort((a, b) => {
      switch (sortBy) {
        case 'speed':
          return b.displaySpeed - a.displaySpeed;
        case 'acceleration':
          return b.acceleration - a.acceleration;
        case 'weight':
          return b.weight - a.weight;
        case 'handling':
          return b.displayHandling - a.displayHandling;
        default:
          return 0;
      }
    });
  }, [characters, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('pages.characters.title')}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {sortedCharacters.map((character) => (
            <CharacterCard key={character.englishName} character={character} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 總結

請嚴格遵守以上指引，不要建議或使用專案中未包含的套件和寫法。保持程式碼簡潔、一致，並符合以下核心原則：

1. **Next.js 16 App Router** - 正確使用 Server/Client Components
2. **Jotai** - 全局狀態管理與持久化
3. **i18next** - 五語言支援（zh-TW、zh-CN、en、ja、ko）
4. **Tailwind CSS** - 響應式設計與瑪利歐主題色
5. **TypeScript** - 嚴格模式與型別安全
6. **pnpm** - 套件管理器
7. **性能優化** - React.memo、useMemo、動態導入
8. **可及性** - 語意化 HTML、ARIA 屬性

開發時始終考慮：多語言支援、響應式設計、型別安全、性能優化、使用者體驗。
