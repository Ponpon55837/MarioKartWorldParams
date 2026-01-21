---
name: code-standards
description: Next.js App Router 與 TypeScript 編碼規範。包含嚴格的 TypeScript 配置、Jotai 狀態管理最佳實踐、Tailwind CSS 使用規範、元件設計原則、效能優化指南，以及強制性的開發測試流程。確保程式碼品質、一致性和可維護性。
license: MIT
---

## 我的功能

- 提供 Next.js 16 App Router 專案的編碼標準
- 確保 TypeScript 嚴格模式和型別安全
- 統一元件設計、狀態管理和樣式撰寫方式
- 維持程式碼品質和一致性

## 何時使用我

在以下情況下使用此技能：

- 撰寫新的 React 元件時
- 進行程式碼審查 (Code Review)
- 需要確認程式碼是否符合專案規範
- 重構現有程式碼時
- 處理型別定義和介面設計

## 核心技術棧

### 必須使用的套件

- **Next.js**: `^16.0.10` (App Router 模式)
- **React**: `^18.3.1`
- **Jotai**: `^2.16.0` (狀態管理)
- **Tailwind CSS**: `^3.4.19` (樣式)
- **TypeScript**: `^5.9.3` (嚴格模式)
- **i18next**: `^25.7.3` (國際化)
- **pnpm**: 套件管理器

### 禁止使用的套件

❌ Redux、Zustand、Recoil (已使用 Jotai)
❌ styled-components、emotion (已使用 Tailwind CSS)
❌ Material-UI、Ant Design (使用 Tailwind CSS)
❌ axios (使用原生 fetch)
❌ next-intl、next-i18next (已使用 react-i18next)

## Next.js App Router 規範

### 檔案結構

```
src/app/
├── layout.tsx          # 根佈局
├── page.tsx            # 首頁
├── globals.css         # 全域樣式
└── api/                # API 路由
    └── route.ts
```

### 正確寫法

```typescript
// app/page.tsx - Server Component (預設)
export default function Page() {
  return <div>Home</div>;
}

// app/layout.tsx - 根佈局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
```

### Client Component 標記

所有使用 hooks 或瀏覽器 API 的元件必須標記 `'use client'`:

```typescript
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## TypeScript 規範

### 優先使用 interface

```typescript
// ✅ 正確 - 使用 interface 定義物件結構
interface CharacterStats {
  name: string;
  englishName: string;
  displaySpeed: number;
  acceleration: number;
  weight: number;
}

// ✅ 正確 - 元件 Props
interface CharacterCardProps {
  character: CharacterStats;
  onClick?: () => void;
}
```

### 何時使用 type

```typescript
// ✅ Union types
export type StatType = "speed" | "acceleration" | "weight" | "handling";
export type SupportedLanguage = "zh-TW" | "zh-CN" | "en" | "ja" | "ko";

// ✅ 聯合型別物件
export type SearchResultItem =
  | { type: "character"; data: CharacterStats }
  | { type: "vehicle"; data: VehicleStats };
```

### 避免使用 any

```typescript
// ❌ 錯誤
function processData(data: any) {}

// ✅ 正確 - 使用 unknown
function processData(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
}

// ✅ 正確 - 使用具體型別
function processCharacter(character: CharacterStats) {
  return character.name;
}
```

## Jotai 狀態管理

### 核心原則

**⭐ 優先使用全域狀態管理，避免 Props Drilling**

當數據已經在全域狀態（Jotai atoms）中管理時，元件應該直接使用 atoms，而不是透過 props 傳遞。

#### ❌ 錯誤做法：Props Drilling

```typescript
// ❌ 不好：透過 props 傳遞已在全域狀態中的數據
function ParentComponent() {
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);

  return (
    <ChildComponent
      characters={characters}  // ❌ 不需要傳遞
      vehicles={vehicles}      // ❌ 不需要傳遞
    />
  );
}

interface ChildComponentProps {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
}

function ChildComponent({ characters, vehicles }: ChildComponentProps) {
  // 使用 characters 和 vehicles
}
```

#### ✅ 正確做法：直接使用全域狀態

```typescript
// ✅ 好：元件直接從 atoms 讀取數據
function ParentComponent() {
  return <ChildComponent />;  // ✅ 簡潔，無需傳遞 props
}

function ChildComponent() {
  // ✅ 直接使用全域狀態
  const characters = useAtomValue(charactersAtom);
  const vehicles = useAtomValue(vehiclesAtom);

  // 使用 characters 和 vehicles
}
```

### 何時使用 Props vs 全域狀態

| 情境                         | 使用方式      | 原因                          |
| ---------------------------- | ------------- | ----------------------------- |
| 數據已在 atoms 中            | ✅ 使用 atoms | 避免 props drilling，減少耦合 |
| 元件特定的配置               | ✅ 使用 props | 提高元件可重用性              |
| 回調函數（簡單）             | ✅ 使用 props | 清晰的數據流向                |
| 回調函數（已有 atom action） | ✅ 使用 atoms | 統一狀態管理                  |
| 樣式或 className             | ✅ 使用 props | 元件外觀配置                  |

### 定義 Atoms

```typescript
// store/dataAtoms.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// 一般狀態
export const charactersAtom = atom<CharacterStats[]>([]);
export const vehiclesAtom = atom<VehicleStats[]>([]);

// 持久化狀態 (localStorage)
export const languageAtom = atomWithStorage<SupportedLanguage>(
  "mario-kart-language",
  "zh-TW",
);

// 操作 Atom（write-only）
export const addItemAtom = atom(null, (get, set, newItem: Item) => {
  const items = get(itemsAtom);
  set(itemsAtom, [...items, newItem]);
});
```

### 在元件中使用

```typescript
'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { charactersAtom, languageAtom, addItemAtom } from '@/store/dataAtoms';

export default function Component() {
  // 讀取和寫入
  const [characters, setCharacters] = useAtom(charactersAtom);

  // 只讀取
  const language = useAtomValue(languageAtom);

  // 只寫入（操作）
  const addItem = useSetAtom(addItemAtom);

  return (
    <div>
      <p>Current Language: {language}</p>
      <button onClick={() => addItem(newItem)}>Add Item</button>
    </div>
  );
}
```

## Tailwind CSS 樣式

### 正確寫法

```typescript
export default function Component() {
  return (
    <div className="flex items-center justify-center p-4 bg-mario-red text-white rounded-lg hover:bg-red-600 transition-colors">
      Content
    </div>
  );
}
```

### 響應式設計 (Mobile First)

```typescript
export default function ResponsiveComponent() {
  return (
    <div className="w-full px-4 py-2 text-sm sm:px-6 sm:text-base md:px-8 md:py-4 lg:max-w-7xl lg:mx-auto lg:px-12 lg:py-6 lg:text-lg">
      <h1 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
        響應式標題
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {/* 卡片內容 */}
      </div>
    </div>
  );
}
```

### 禁止使用

❌ inline styles (除非動態計算)
❌ CSS Modules
❌ styled-components
❌ CSS-in-JS

## 路徑別名

使用 `@/` 作為 `src/` 的別名:

```typescript
import { charactersAtom } from "@/store/dataAtoms";
import CharacterCard from "@/components/CharacterCard";
import { CharacterStats } from "@/types";
import { parseMarioKartCSV } from "@/utils/csvParser";
```

## React 元件設計

### 元件大小限制

- 單一元件不超過 200 行
- 超過時應拆分為多個子元件

### 函式元件優先

```typescript
// ✅ 正確 - 函式元件
export default function CharacterCard({ character }: CharacterCardProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-lg bg-white shadow-md">
      <h2>{character.name}</h2>
      <p>{t('stats.speed')}: {character.displaySpeed}</p>
    </div>
  );
}

// ❌ 錯誤 - Class Component
class CharacterCard extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

### Hooks 使用規則

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

### 列表渲染

```typescript
// ✅ 使用唯一 ID
{characters.map((character) => (
  <CharacterCard
    key={character.englishName}
    character={character}
  />
))}

// ❌ 避免使用索引
{characters.map((character, index) => (
  <CharacterCard
    key={index}
    character={character}
  />
))}
```

## 性能最佳化

### React 最佳化

```typescript
// 使用 React.memo
const CharacterCard = React.memo(({ character }: CharacterCardProps) => {
  return <div>{character.name}</div>;
});

// 使用 useMemo
const sortedCharacters = useMemo(() => {
  return characters.sort((a, b) => b.speed - a.speed);
}, [characters]);

// 使用 useCallback
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### Next.js 最佳化

```typescript
// 動態導入
import dynamic from 'next/dynamic';

const SearchModal = dynamic(() => import('@/components/SearchModal'), {
  loading: () => <p>載入中...</p>,
  ssr: false,
});

// Metadata 優化
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '瑪利歐賽車世界參數工具',
  description: '分析和比較瑪利歐賽車角色與載具統計資料',
};
```

## 引入順序規範

```typescript
// 1. React / Next.js 相關
import { useState, useEffect } from "react";
import Image from "next/image";
import type { Metadata } from "next";

// 2. 外部函式庫
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

// 3. 內部模組
import { charactersAtom, languageAtom } from "@/store/dataAtoms";
import { parseMarioKartCSV } from "@/utils/csvParser";
import CharacterCard from "@/components/CharacterCard";

// 4. 型別定義
import type { CharacterStats, VehicleStats } from "@/types";

// 5. 樣式
import "./styles.css";
```

## 非同步處理規範

### async/await 優先

```typescript
// ✅ 使用 async/await
async function loadCharacters() {
  try {
    const data = await parseMarioKartCSV();
    return data.characters;
  } catch (error) {
    console.error("Failed to load characters:", error);
    throw error;
  }
}
```

### 錯誤處理

```typescript
'use client';

export default function Component() {
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const response = await fetch('/api/data', {
          signal: controller.signal,
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

## 可及性 (Accessibility)

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

## 套件管理

### 必須使用 pnpm

```bash
# ✅ 正確
pnpm add package-name
pnpm remove package-name
pnpm install

# ❌ 錯誤
npm install
yarn add
```

## 開發測試流程

### ⚠️ 重要：每次修改後必須運行測試

**這是強制性的規則，任何程式碼修改後都必須立即測試！**

#### 為什麼要立即測試？

1. **及早發現錯誤**: 在錯誤累積之前就發現問題
2. **避免連鎖錯誤**: 防止在錯誤的基礎上繼續修改
3. **確保功能正常**: 保證每個變更都不會破壞現有功能
4. **節省時間**: 立即修正比事後修正更容易

#### 測試流程

**每次修改檔案後，立即執行以下步驟：**

```bash
# 1. 清除可能佔用的 port
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 2. 等待 port 釋放
sleep 2

# 3. 啟動開發伺服器
pnpm dev
```

**檢查項目：**

1. ✅ 專案能否成功啟動（無編譯錯誤）
2. ✅ 瀏覽器能否正常訪問 http://localhost:3000
3. ✅ 頁面能否正常顯示（無執行錯誤）
4. ✅ 修改的功能是否正常運作
5. ✅ 相關功能是否受到影響

**如果測試失敗：**

- 🛑 **立即停止**繼續修改
- 🔍 檢查錯誤訊息
- 🔧 修正問題
- ✅ 重新測試直到通過

#### 完成所有修改後的完整測試

在完成所有任務後，進行完整的測試：

```bash
# 1. 清除 port
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

# 2. 啟動開發伺服器
pnpm dev

# 3. 完整功能測試
```

**完整測試清單：**

- [ ] 首頁能正常載入
- [ ] 角色列表正常顯示
- [ ] 載具列表正常顯示
- [ ] 組合功能正常運作
- [ ] 推薦系統正常運作
- [ ] 搜尋功能正常運作
- [ ] 語言切換功能正常
- [ ] 所有頁面切換正常
- [ ] 無 console 錯誤
- [ ] 無 TypeScript 編譯錯誤
- [ ] 無 ESLint 警告（重要的）

#### 提交前的最終檢查

**⚠️ 絕不直接推送到遠端！**

完成所有修改和測試後：

1. ✅ 確認所有功能測試通過
2. ✅ 確認無編譯錯誤
3. ✅ 確認無執行錯誤
4. 📝 準備變更說明
5. ⏸️ **等待使用者檢查**
6. ✅ 使用者確認後才能推送

```bash
# ❌ 錯誤：直接推送
git push origin branch-name

# ✅ 正確：等待確認後才推送
# 1. 提交到本地
git add .
git commit -m "描述變更內容"

# 2. 告知使用者已完成，等待檢查
# 3. 使用者確認無誤後，才執行推送
git push origin branch-name
```

### 測試失敗的處理流程

```
修改程式碼
    ↓
執行測試
    ↓
測試失敗？
    ↓
 是 → 檢查錯誤 → 修正問題 → 重新測試
    ↓
測試通過
    ↓
繼續下一個修改
```

## 驗證清單

在提交程式碼前，請確認：

### 程式碼規範

- [ ] 使用 `'use client'` 標記 Client Components
- [ ] 使用 interface 定義物件結構
- [ ] 避免使用 any，使用 unknown 或具體型別
- [ ] 使用 Tailwind CSS 而非 inline styles
- [ ] 路徑使用 `@/` 別名
- [ ] 元件大小不超過 200 行
- [ ] 列表渲染使用唯一 key
- [ ] 引入順序正確
- [ ] 使用 pnpm 管理套件
- [ ] 符合響應式設計原則

### 狀態管理

- [ ] **優先使用 Jotai atoms 而非 props 傳遞已在全域狀態中的數據**
- [ ] 避免 props drilling（數據層層傳遞）
- [ ] 元件直接從 atoms 讀取所需數據
- [ ] 只在必要時使用 props（元件配置、樣式等）
- [ ] 使用 `useAtomValue` 進行只讀操作
- [ ] 使用 `useSetAtom` 進行只寫操作
- [ ] 使用 `useAtom` 進行讀寫操作

### 測試驗證

- [ ] 每次修改後都已運行 `pnpm run build` 測試
- [ ] 所有測試都已通過
- [ ] **已在瀏覽器 DevTools Console 確認無錯誤**
- [ ] 完整功能測試已完成
- [ ] 無編譯錯誤
- [ ] 無執行錯誤
- [ ] 已在本地確認所有功能正常

### 提交流程

- [ ] 已提交到本地分支
- [ ] **已通知使用者檢查**
- [ ] **等待使用者確認**
- [ ] 確認後才推送到遠端

## 參考資源

- [Next.js App Router 文件](https://nextjs.org/docs/app)
- [TypeScript 嚴格模式](https://www.typescriptlang.org/tsconfig#strict)
- [Jotai 文件](https://jotai.org/)
- [Tailwind CSS 文件](https://tailwindcss.com/)
- [React 最佳實踐](https://react.dev/)
