# Tanstack Table + Tanstack Query + Jotai 完整整合指南

> **文件版本**: 1.0.0  
> **更新日期**: 2026-04-21  
> **適用專案**: Next.js 16 App Router + TypeScript  
> **前置閱讀**: [Tanstack Query + Jotai 完整架構指南](./tanstack-query-jotai-guide.md)

## 📋 目錄

- [概述](#概述)
- [套件說明與安裝](#套件說明與安裝)
- [核心概念](#核心概念)
- [基礎整合](#基礎整合)
- [伺服器端功能](#伺服器端功能)
- [進階功能](#進階功能)
- [實戰範例](#實戰範例)
- [效能優化](#效能優化)
- [最佳實踐](#最佳實踐)
- [常見問題](#常見問題)

---

## 概述

### 為什麼選擇 Tanstack Table？

Tanstack Table (原 React Table) 是一個**無頭 (Headless)** 的表格函式庫，提供強大的表格邏輯但不限制 UI 實現。

**核心優勢**：

- ✅ **無頭設計** - 完全掌控 UI，使用 Tailwind CSS 自由設計
- ✅ **TypeScript First** - 完整的型別推斷與型別安全
- ✅ **效能優化** - 虛擬滾動、記憶化、最小重渲染
- ✅ **功能豐富** - 排序、過濾、分頁、分組、展開、選擇
- ✅ **框架無關** - 核心邏輯可用於 React、Vue、Solid
- ✅ **完美整合** - 與 Tanstack Query 和 Jotai 無縫配合

### 三層架構整合

```
┌─────────────────────────────────────────────────┐
│         Tanstack Table v8                       │
│         表格 UI 與邏輯層                          │
│  • Column Definition                            │
│  • Table Instance (useReactTable)              │
│  • 排序/過濾/分頁邏輯                             │
│  • 行選擇、展開、可見性控制                       │
└─────────────────────────────────────────────────┘
                      ↕ (使用 data)
┌─────────────────────────────────────────────────┐
│         Tanstack Query                          │
│         伺服器資料管理層                          │
│  • useQuery - 獲取表格資料                       │
│  • useMutation - 更新/刪除資料                   │
│  • 快取管理、背景更新                             │
│  • queryKey 依賴 Jotai 狀態                     │
└─────────────────────────────────────────────────┘
                      ↕ (queryKey 參數)
┌─────────────────────────────────────────────────┐
│            Jotai                                │
│            UI 狀態管理層                          │
│  • 分頁狀態 (pageIndex, pageSize)               │
│  • 排序狀態 (sortBy, sortDirection)             │
│  • 過濾條件 (filters, searchQuery)              │
│  • 選擇狀態 (selectedRowIds)                    │
│  • 列可見性 (columnVisibility)                  │
└─────────────────────────────────────────────────┘
                      ↕ (可選 - 行內編輯)
┌─────────────────────────────────────────────────┐
│         React Hook Form + Zod                   │
│         行內編輯表單層                            │
│  • 欄位驗證                                      │
│  • 批量更新                                      │
└─────────────────────────────────────────────────┘
```

### 資料流程

```
使用者操作 (點擊排序/翻頁/過濾)
    ↓
Jotai 狀態更新 (setSortBy / setPageIndex)
    ↓
Tanstack Query 偵測 queryKey 變化
    ↓
自動發送 API 請求 (帶新參數)
    ↓
Tanstack Table 接收新資料
    ↓
UI 自動更新
```

---

## 套件說明與安裝

### 需要安裝的套件

```json
{
  "dependencies": {
    // 表格核心
    "@tanstack/react-table": "^8.20.0", // ⭐ 需新增

    // 資料管理（已在前置文件說明）
    "@tanstack/react-query": "^5.0.0",
    "jotai": "^2.16.0", // ✅ 已有

    // 表單驗證（行內編輯用）
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",

    // 圖示（可選）
    "lucide-react": "^0.400.0" // 或使用其他圖示庫
  }
}
```

### 安裝指令

```bash
# 核心套件
pnpm add @tanstack/react-table

# 圖示庫（可選）
pnpm add lucide-react
```

### 開發工具（可選）

```bash
# Tanstack Table DevTools（開發階段）
pnpm add -D @tanstack/react-table-devtools
```

---

## 核心概念

### 1. Column Definition（欄位定義）

Tanstack Table 使用 **Column Definitions** 定義表格結構。

```typescript
import { ColumnDef } from '@tanstack/react-table'

interface Character {
  id: string
  name: string
  speed: number
  acceleration: number
  weight: number
}

const columns: ColumnDef<Character>[] = [
  {
    accessorKey: 'name', // 資料欄位
    header: '角色名稱', // 表頭文字
    cell: (info) => info.getValue(), // 自訂渲染
  },
  {
    accessorKey: 'speed',
    header: '速度',
    cell: (info) => <span>{info.getValue()}/10</span>,
  },
]
```

**Column 類型**：

- **Accessor Column** - 直接對應資料欄位
- **Display Column** - 不對應資料，用於操作按鈕
- **Grouping Column** - 用於分組功能

### 2. Table Instance（表格實例）

使用 `useReactTable` Hook 創建表格實例。

```typescript
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

const table = useReactTable({
  data: characters, // 資料
  columns, // 欄位定義
  getCoreRowModel: getCoreRowModel() // 核心模型
});
```

**Table Instance 提供的方法**：

```typescript
table.getHeaderGroups(); // 取得表頭群組
table.getRowModel(); // 取得行資料模型
table.getState(); // 取得目前狀態
table.setPageIndex(0); // 設定頁碼
```

### 3. Row Model（行模型）

Tanstack Table 使用 **可組合的 Row Models** 處理不同功能。

```typescript
import {
  getCoreRowModel, // 核心模型（必須）
  getSortedRowModel, // 排序模型
  getFilteredRowModel, // 過濾模型
  getPaginationRowModel // 分頁模型
} from '@tanstack/react-table';

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(), // 啟用排序
  getFilteredRowModel: getFilteredRowModel(), // 啟用過濾
  getPaginationRowModel: getPaginationRowModel() // 啟用分頁
});
```

### 4. State Management（狀態管理）

Tanstack Table 支援**受控**和**非受控**狀態。

#### 非受控模式（Table 內部管理）

```typescript
const table = useReactTable({
  data,
  columns
  // Table 自己管理狀態
});
```

#### 受控模式（外部管理，推薦用 Jotai）

```typescript
const [sorting, setSorting] = useAtom(sortingAtom);
const [pagination, setPagination] = useAtom(paginationAtom);

const table = useReactTable({
  data,
  columns,
  state: {
    sorting, // 外部狀態
    pagination
  },
  onSortingChange: setSorting, // 狀態更新
  onPaginationChange: setPagination
});
```

---

## 基礎整合

### 模式 1: 靜態資料表格

最簡單的 Tanstack Table 實現。

```typescript
// components/BasicTable.tsx
'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'

interface Character {
  id: string
  name: string
  speed: number
  acceleration: number
}

const data: Character[] = [
  { id: '1', name: 'Mario', speed: 8, acceleration: 6 },
  { id: '2', name: 'Luigi', speed: 7, acceleration: 7 },
  { id: '3', name: 'Peach', speed: 6, acceleration: 8 },
]

export default function BasicTable() {
  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '角色',
      },
      {
        accessorKey: 'speed',
        header: '速度',
        cell: (info) => `${info.getValue()}/10`,
      },
      {
        accessorKey: 'acceleration',
        header: '加速',
        cell: (info) => `${info.getValue()}/10`,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-3 text-sm text-gray-900 border-b"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 模式 2: 與 Tanstack Query 整合

使用 API 資料源。

```typescript
// hooks/useCharactersTable.ts
import { useQuery } from '@tanstack/react-query'
import { authFetch } from '@/utils/authFetch'
import type { Character } from '@/types'

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: () => authFetch<Character[]>('/api/characters'),
    staleTime: 5 * 60 * 1000,
  })
}

// components/CharactersTable.tsx
'use client'

import { useMemo } from 'react'
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from '@tanstack/react-table'
import { useCharacters } from '@/hooks/useCharactersTable'
import type { Character } from '@/types'

export default function CharactersTable() {
  const { data: characters, isLoading, error } = useCharacters()

  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '角色名稱',
      },
      {
        accessorKey: 'speed',
        header: '速度',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(info.getValue() as number) * 10}%` }}
              />
            </div>
            <span className="text-sm">{info.getValue() as number}</span>
          </div>
        ),
      },
      {
        accessorKey: 'acceleration',
        header: '加速',
      },
    ],
    []
  )

  const table = useReactTable({
    data: characters ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">載入失敗：{error.message}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 模式 3: 與 Jotai 整合（狀態驅動）

使用 Jotai 管理表格 UI 狀態。

```typescript
// store/tableAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { SortingState, PaginationState, ColumnFiltersState } from '@tanstack/react-table';

// 排序狀態
export const sortingAtom = atom<SortingState>([]);

// 分頁狀態
export const paginationAtom = atom<PaginationState>({
  pageIndex: 0,
  pageSize: 10
});

// 過濾狀態
export const columnFiltersAtom = atom<ColumnFiltersState>([]);

// 列可見性（持久化）
export const columnVisibilityAtom = atomWithStorage<Record<string, boolean>>('mario-kart-column-visibility', {});

// 選擇的行
export const rowSelectionAtom = atom<Record<string, boolean>>({});
```

```typescript
// components/StatefulCharactersTable.tsx
'use client'

import { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { useCharacters } from '@/hooks/useCharactersTable'
import { sortingAtom, paginationAtom } from '@/store/tableAtoms'
import type { Character } from '@/types'

export default function StatefulCharactersTable() {
  const { data: characters } = useCharacters()
  const [sorting, setSorting] = useAtom(sortingAtom)
  const [pagination, setPagination] = useAtom(paginationAtom)

  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '角色名稱',
      },
      {
        accessorKey: 'speed',
        header: '速度',
        enableSorting: true, // 啟用排序
      },
      {
        accessorKey: 'acceleration',
        header: '加速',
        enableSorting: true,
      },
    ],
    []
  )

  const table = useReactTable({
    data: characters ?? [],
    columns,
    state: {
      sorting,       // ⭐ 受控狀態
      pagination,
    },
    onSortingChange: setSorting,       // ⭐ 狀態更新
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),     // 啟用排序
    getPaginationRowModel: getPaginationRowModel(), // 啟用分頁
    manualPagination: false, // 客戶端分頁
    manualSorting: false,    // 客戶端排序
  })

  return (
    <div className="space-y-4">
      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-2'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分頁控制 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          顯示 {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} 到{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          筆，共 {table.getFilteredRowModel().rows.length} 筆
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'<'}
          </button>
          <span className="text-sm">
            第 {table.getState().pagination.pageIndex + 1} 頁，共{' '}
            {table.getPageCount()} 頁
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 伺服器端功能

### 為什麼需要伺服器端處理？

**客戶端處理**的限制：

- ❌ 大量資料會拖慢效能（10,000+ 筆）
- ❌ 需要一次載入所有資料
- ❌ 無法利用資料庫索引優化

**伺服器端處理**的優勢：

- ✅ 只傳輸當前頁資料
- ✅ 利用資料庫查詢優化
- ✅ 支援無限滾動

### 架構圖

```
┌─────────────────────────────────────┐
│  Jotai - UI 狀態                     │
│  { pageIndex: 2,                    │
│    pageSize: 10,                    │
│    sortBy: 'speed',                 │
│    sortOrder: 'desc',               │
│    filters: { search: 'Mario' }     │
│  }                                  │
└─────────────────────────────────────┘
              ↓ (作為 queryKey)
┌─────────────────────────────────────┐
│  Tanstack Query                     │
│  queryKey: ['characters', {         │
│    page: 2,                         │
│    pageSize: 10,                    │
│    sortBy: 'speed',                 │
│    sortOrder: 'desc',               │
│    search: 'Mario'                  │
│  }]                                 │
└─────────────────────────────────────┘
              ↓ (發送 HTTP 請求)
┌─────────────────────────────────────┐
│  API Route                          │
│  GET /api/characters?               │
│    page=2&                          │
│    pageSize=10&                     │
│    sortBy=speed&                    │
│    sortOrder=desc&                  │
│    search=Mario                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Database Query                     │
│  SELECT * FROM characters           │
│  WHERE name LIKE '%Mario%'          │
│  ORDER BY speed DESC                │
│  LIMIT 10 OFFSET 10                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  API Response                       │
│  {                                  │
│    data: [...10 characters],        │
│    pageCount: 15,                   │
│    totalCount: 150                  │
│  }                                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Tanstack Table                     │
│  渲染當前頁資料                       │
└─────────────────────────────────────┘
```

### 1. 伺服器端分頁

#### Jotai 狀態定義

```typescript
// store/serverTableAtoms.ts
import { atom } from 'jotai';

// 分頁狀態
export const pageIndexAtom = atom(0);
export const pageSizeAtom = atom(10);

// 排序狀態
export const sortByAtom = atom<string | null>(null);
export const sortOrderAtom = atom<'asc' | 'desc'>('asc');

// 搜尋狀態
export const searchQueryAtom = atom('');

// 組合查詢參數（派生 atom）
export const queryParamsAtom = atom((get) => ({
  page: get(pageIndexAtom),
  pageSize: get(pageSizeAtom),
  sortBy: get(sortByAtom),
  sortOrder: get(sortOrderAtom),
  search: get(searchQueryAtom)
}));
```

#### API Route 實現

```typescript
// app/api/characters/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface QueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const params: QueryParams = {
    page: parseInt(searchParams.get('page') || '0'),
    pageSize: parseInt(searchParams.get('pageSize') || '10'),
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    search: searchParams.get('search') || undefined
  };

  try {
    // 模擬資料庫查詢
    let query = db.characters.query();

    // 搜尋過濾
    if (params.search) {
      query = query.where('name', 'like', `%${params.search}%`);
    }

    // 排序
    if (params.sortBy) {
      query = query.orderBy(params.sortBy, params.sortOrder);
    }

    // 總筆數
    const totalCount = await query.count();

    // 分頁
    const offset = params.page * params.pageSize;
    const data = await query.limit(params.pageSize).offset(offset).execute();

    return NextResponse.json({
      data,
      pageCount: Math.ceil(totalCount / params.pageSize),
      totalCount
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}
```

#### 自訂 Hook

```typescript
// hooks/useServerCharacters.ts
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { queryParamsAtom } from '@/store/serverTableAtoms';
import { authFetch } from '@/utils/authFetch';

interface ServerResponse<T> {
  data: T[];
  pageCount: number;
  totalCount: number;
}

export function useServerCharacters() {
  const params = useAtomValue(queryParamsAtom);

  return useQuery({
    queryKey: ['characters', params], // ⭐ 參數變化自動重新請求
    queryFn: async () => {
      const queryString = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
        ...(params.sortBy && { sortBy: params.sortBy }),
        sortOrder: params.sortOrder,
        ...(params.search && { search: params.search })
      }).toString();

      return authFetch<ServerResponse<Character>>(`/api/characters?${queryString}`);
    },
    keepPreviousData: true, // ⭐ 保留上一頁資料，避免閃爍
    staleTime: 30 * 1000
  });
}
```

#### 元件實現

```typescript
// components/ServerPaginatedTable.tsx
'use client'

import { useMemo } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { useServerCharacters } from '@/hooks/useServerCharacters'
import {
  pageIndexAtom,
  pageSizeAtom,
  sortByAtom,
  sortOrderAtom,
  searchQueryAtom,
} from '@/store/serverTableAtoms'
import type { Character } from '@/types'

export default function ServerPaginatedTable() {
  const { data, isLoading, isFetching, error } = useServerCharacters()

  const [pageIndex, setPageIndex] = useAtom(pageIndexAtom)
  const [pageSize, setPageSize] = useAtom(pageSizeAtom)
  const setSortBy = useSetAtom(sortByAtom)
  const setSortOrder = useSetAtom(sortOrderAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)

  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '角色名稱',
      },
      {
        accessorKey: 'speed',
        header: '速度',
      },
      {
        accessorKey: 'acceleration',
        header: '加速',
      },
      {
        accessorKey: 'weight',
        header: '重量',
      },
    ],
    []
  )

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? -1, // ⭐ 伺服器回傳的總頁數
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPageIndex(newPagination.pageIndex)
      setPageSize(newPagination.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // ⭐ 伺服器端分頁
  })

  // 處理排序
  const handleSort = (columnId: string) => {
    setSortBy((prev) => {
      if (prev === columnId) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortOrder('asc')
      }
      return columnId
    })
  }

  return (
    <div className="space-y-4">
      {/* 搜尋框 */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPageIndex(0) // 重置到第一頁
          }}
          placeholder="搜尋角色名稱..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            載入中...
          </div>
        )}
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">載入失敗</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={() => handleSort(header.column.id)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分頁控制 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          共 {data?.totalCount ?? 0} 筆資料
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            第一頁
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            上一頁
          </button>
          <span className="text-sm">
            第 {pageIndex + 1} 頁，共 {table.getPageCount()} 頁
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            下一頁
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            最後一頁
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPageIndex(0)
            }}
            className="px-2 py-1 border rounded"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                每頁 {size} 筆
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
```

### 2. 伺服器端過濾

#### 進階過濾狀態

```typescript
// store/filterAtoms.ts
import { atom } from 'jotai';

// 單一欄位過濾
export interface ColumnFilter {
  id: string;
  value: any;
}

export const columnFiltersAtom = atom<ColumnFilter[]>([]);

// 全域搜尋
export const globalFilterAtom = atom('');

// 進階過濾器
export interface AdvancedFilter {
  speedRange?: { min: number; max: number };
  accelerationRange?: { min: number; max: number };
  weightRange?: { min: number; max: number };
  category?: string[];
}

export const advancedFiltersAtom = atom<AdvancedFilter>({});
```

#### 過濾元件

```typescript
// components/TableFilters.tsx
'use client'

import { useAtom } from 'jotai'
import { globalFilterAtom, advancedFiltersAtom } from '@/store/filterAtoms'

export default function TableFilters() {
  const [globalFilter, setGlobalFilter] = useAtom(globalFilterAtom)
  const [advancedFilters, setAdvancedFilters] = useAtom(advancedFiltersAtom)

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* 全域搜尋 */}
      <div>
        <label className="block text-sm font-medium mb-1">搜尋</label>
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="搜尋所有欄位..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* 速度範圍 */}
      <div>
        <label className="block text-sm font-medium mb-1">速度範圍</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="10"
            value={advancedFilters.speedRange?.min ?? 0}
            onChange={(e) =>
              setAdvancedFilters((prev) => ({
                ...prev,
                speedRange: {
                  min: Number(e.target.value),
                  max: prev.speedRange?.max ?? 10,
                },
              }))
            }
            className="w-20 px-2 py-1 border rounded"
          />
          <span>到</span>
          <input
            type="number"
            min="0"
            max="10"
            value={advancedFilters.speedRange?.max ?? 10}
            onChange={(e) =>
              setAdvancedFilters((prev) => ({
                ...prev,
                speedRange: {
                  min: prev.speedRange?.min ?? 0,
                  max: Number(e.target.value),
                },
              }))
            }
            className="w-20 px-2 py-1 border rounded"
          />
        </div>
      </div>

      {/* 清除過濾 */}
      <button
        onClick={() => {
          setGlobalFilter('')
          setAdvancedFilters({})
        }}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        清除所有過濾
      </button>
    </div>
  )
}
```

---

## 進階功能

### 1. 行選擇（Row Selection）

#### 啟用行選擇

```typescript
// store/selectionAtoms.ts
import { atom } from 'jotai';

export const rowSelectionAtom = atom<Record<string, boolean>>({});
```

```typescript
// components/SelectableTable.tsx
'use client'

import { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { rowSelectionAtom } from '@/store/selectionAtoms'
import type { Character } from '@/types'

export default function SelectableTable({ data }: { data: Character[] }) {
  const [rowSelection, setRowSelection] = useAtom(rowSelectionAtom)

  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-gray-300"
          />
        ),
      },
      {
        accessorKey: 'name',
        header: '角色名稱',
      },
      {
        accessorKey: 'speed',
        header: '速度',
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true, // ⭐ 啟用行選擇
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedRows = table.getSelectedRowModel().rows

  return (
    <div className="space-y-4">
      {/* 批量操作工具列 */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-700">
            已選擇 {selectedRows.length} 筆資料
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              批量編輯
            </button>
            <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              批量刪除
            </button>
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={row.getIsSelected() ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### 2. 行內編輯（Inline Editing）

結合 React Hook Form 實現可編輯表格。

```typescript
// components/EditableTable.tsx
'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { z } from 'zod'
import { authFetch } from '@/utils/authFetch'
import type { Character } from '@/types'

const editSchema = z.object({
  name: z.string().min(1),
  speed: z.number().min(0).max(10),
  acceleration: z.number().min(0).max(10),
})

type EditFormData = z.infer<typeof editSchema>

interface EditableCellProps {
  row: any
  column: any
  value: any
  onSave: (rowId: string, columnId: string, value: any) => void
}

function EditableCell({ row, column, value, onSave }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)

  if (isEditing) {
    return (
      <input
        type={typeof value === 'number' ? 'number' : 'text'}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={() => {
          onSave(row.id, column.id, currentValue)
          setIsEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSave(row.id, column.id, currentValue)
            setIsEditing(false)
          }
          if (e.key === 'Escape') {
            setCurrentValue(value)
            setIsEditing(false)
          }
        }}
        autoFocus
        className="w-full px-2 py-1 border rounded"
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
    >
      {value}
    </div>
  )
}

export default function EditableTable({ initialData }: { initialData: Character[] }) {
  const [data, setData] = useState(initialData)
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Character> }) => {
      return authFetch(`/api/characters/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['characters'])
    },
  })

  const handleCellSave = (rowId: string, columnId: string, value: any) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, [columnId]: value } : row
      )
    )

    updateMutation.mutate({
      id: rowId,
      updates: { [columnId]: value },
    })
  }

  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '角色名稱',
        cell: ({ row, column, getValue }) => (
          <EditableCell
            row={row}
            column={column}
            value={getValue()}
            onSave={handleCellSave}
          />
        ),
      },
      {
        accessorKey: 'speed',
        header: '速度',
        cell: ({ row, column, getValue }) => (
          <EditableCell
            row={row}
            column={column}
            value={getValue()}
            onSave={handleCellSave}
          />
        ),
      },
      {
        accessorKey: 'acceleration',
        header: '加速',
        cell: ({ row, column, getValue }) => (
          <EditableCell
            row={row}
            column={column}
            value={getValue()}
            onSave={handleCellSave}
          />
        ),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('確定要刪除嗎？')) {
                  // 刪除邏輯
                }
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              刪除
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      {updateMutation.isPending && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">儲存中...</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        💡 提示：點擊儲存格可直接編輯，按 Enter 儲存，按 Esc 取消
      </p>
    </div>
  )
}
```

### 3. 列可見性控制（Column Visibility）

```typescript
// components/ColumnVisibilityControl.tsx
'use client'

import { useAtom } from 'jotai'
import { columnVisibilityAtom } from '@/store/tableAtoms'

interface ColumnConfig {
  id: string
  label: string
}

const availableColumns: ColumnConfig[] = [
  { id: 'name', label: '角色名稱' },
  { id: 'speed', label: '速度' },
  { id: 'acceleration', label: '加速' },
  { id: 'weight', label: '重量' },
  { id: 'handling', label: '操控' },
]

export default function ColumnVisibilityControl() {
  const [columnVisibility, setColumnVisibility] = useAtom(columnVisibilityAtom)

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium mb-3">顯示欄位</h3>
      <div className="space-y-2">
        {availableColumns.map((column) => (
          <label key={column.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={columnVisibility[column.id] !== false}
              onChange={(e) =>
                setColumnVisibility((prev) => ({
                  ...prev,
                  [column.id]: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">{column.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
```

```typescript
// 在表格中使用
const [columnVisibility] = useAtom(columnVisibilityAtom);

const table = useReactTable({
  data,
  columns,
  state: {
    columnVisibility // ⭐ 受控的列可見性
  },
  onColumnVisibilityChange: setColumnVisibility,
  getCoreRowModel: getCoreRowModel()
});
```

### 4. 展開行（Expandable Rows）

用於顯示巢狀或詳細資訊。

```typescript
// components/ExpandableTable.tsx
'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import type { Character } from '@/types'

export default function ExpandableTable({ data }: { data: Character[] }) {
  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="px-2 py-1 text-sm"
          >
            {row.getIsExpanded() ? '▼' : '▶'}
          </button>
        ),
      },
      {
        accessorKey: 'name',
        header: '角色名稱',
      },
      {
        accessorKey: 'speed',
        header: '速度',
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // ⭐ 啟用展開功能
  })

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-3 text-left">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <>
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={row.getVisibleCells().length} className="px-6 py-4 bg-gray-50">
                    {/* 展開的詳細內容 */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">詳細資訊</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">速度:</span>{' '}
                          <span className="font-medium">{row.original.speed}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">加速:</span>{' '}
                          <span className="font-medium">{row.original.acceleration}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">重量:</span>{' '}
                          <span className="font-medium">{row.original.weight}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 實戰範例

### 範例 1: 完整功能的角色管理表格

結合所有功能的完整實現。

```typescript
// app/characters/page.tsx
'use client'

import { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { authFetch } from '@/utils/authFetch'
import {
  sortingAtom,
  columnFiltersAtom,
  columnVisibilityAtom,
  paginationAtom,
} from '@/store/tableAtoms'
import ColumnVisibilityControl from '@/components/ColumnVisibilityControl'
import type { Character } from '@/types'

export default function CharactersManagementPage() {
  const [sorting, setSorting] = useAtom(sortingAtom)
  const [columnFilters, setColumnFilters] = useAtom(columnFiltersAtom)
  const [columnVisibility, setColumnVisibility] = useAtom(columnVisibilityAtom)
  const [pagination, setPagination] = useAtom(paginationAtom)

  const { data: characters, isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => authFetch<Character[]>('/api/characters'),
  })

  const columns = useMemo<ColumnDef<Character>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '角色名稱',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {info.getValue<string>()[0]}
            </div>
            <span className="font-medium">{info.getValue<string>()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'speed',
        header: '速度',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(info.getValue() as number) * 10}%` }}
              />
            </div>
            <span className="text-sm font-medium">{info.getValue() as number}/10</span>
          </div>
        ),
      },
      {
        accessorKey: 'acceleration',
        header: '加速',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(info.getValue() as number) * 10}%` }}
              />
            </div>
            <span className="text-sm font-medium">{info.getValue() as number}/10</span>
          </div>
        ),
      },
      {
        accessorKey: 'weight',
        header: '重量',
      },
      {
        accessorKey: 'handling',
        header: '操控',
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
              編輯
            </button>
            <button className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
              刪除
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: characters ?? [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 頁首 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">角色管理</h1>
          <p className="text-gray-600">瑪利歐賽車角色統計資料</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 側邊欄 - 過濾與設定 */}
          <div className="space-y-4">
            {/* 搜尋 */}
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium mb-2">搜尋角色</label>
              <input
                type="text"
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
                placeholder="輸入角色名稱..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 列可見性控制 */}
            <div className="bg-white p-4 rounded-lg shadow">
              <ColumnVisibilityControl />
            </div>
          </div>

          {/* 主要內容 - 表格 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 工具列 */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">
                共 {table.getFilteredRowModel().rows.length} 筆資料
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                新增角色
              </button>
            </div>

            {/* 表格 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className={
                                  header.column.getCanSort()
                                    ? 'cursor-pointer select-none flex items-center gap-2'
                                    : ''
                                }
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{
                                  asc: ' 🔼',
                                  desc: ' 🔽',
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分頁 */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  顯示 {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} 到{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  筆
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    第一頁
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    上一頁
                  </button>
                  <span className="text-sm">
                    第 {table.getState().pagination.pageIndex + 1} 頁，共 {table.getPageCount()} 頁
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    下一頁
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    最後一頁
                  </button>

                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value))
                    }}
                    className="px-2 py-1 border rounded"
                  >
                    {[10, 20, 30, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        每頁 {pageSize} 筆
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 範例 2: 伺服器端分頁的使用者管理表格

完整的 CRUD 操作範例。

```typescript
// app/users/page.tsx
'use client'

import { useMemo, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '@/utils/authFetch'
import {
  pageIndexAtom,
  pageSizeAtom,
  searchQueryAtom,
  sortByAtom,
  sortOrderAtom,
} from '@/store/serverTableAtoms'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  createdAt: string
}

export default function UsersManagementPage() {
  const queryClient = useQueryClient()
  const [pageIndex, setPageIndex] = useAtom(pageIndexAtom)
  const [pageSize, setPageSize] = useAtom(pageSizeAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)
  const setSortBy = useSetAtom(sortByAtom)
  const setSortOrder = useSetAtom(sortOrderAtom)

  // 獲取使用者資料
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', { pageIndex, pageSize, searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
      })

      return authFetch<{
        data: User[]
        pageCount: number
        totalCount: number
      }>(`/api/users?${params}`)
    },
    keepPreviousData: true,
  })

  // 刪除使用者
  const deleteMutation = useMutation({
    mutationFn: (id: string) => authFetch(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
    },
  })

  // 更新狀態
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      authFetch(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
    },
  })

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '姓名',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
              {info.getValue<string>()[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{info.getValue<string>()}</div>
              <div className="text-sm text-gray-500">{info.row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: '角色',
        cell: (info) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              info.getValue() === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {info.getValue() === 'admin' ? '管理員' : '使用者'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: '狀態',
        cell: (info) => (
          <button
            onClick={() =>
              updateStatusMutation.mutate({
                id: info.row.original.id,
                status: info.getValue() === 'active' ? 'inactive' : 'active',
              })
            }
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              info.getValue() === 'active'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {info.getValue() === 'active' ? '啟用' : '停用'}
          </button>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '建立日期',
        cell: (info) => new Date(info.getValue<string>()).toLocaleDateString('zh-TW'),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // 編輯邏輯
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              編輯
            </button>
            <button
              onClick={() => {
                if (confirm('確定要刪除此使用者嗎？')) {
                  deleteMutation.mutate(row.original.id)
                }
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              刪除
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation, updateStatusMutation]
  )

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPageIndex(newPagination.pageIndex)
      setPageSize(newPagination.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 頁首 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">使用者管理</h1>
            <p className="text-gray-600">管理系統使用者帳號</p>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <span>+</span>
            新增使用者
          </button>
        </div>

        {/* 搜尋與過濾 */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPageIndex(0)
              }}
              placeholder="搜尋姓名或 Email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
              載入中...
            </div>
          )}
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分頁 */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  共 {data?.totalCount ?? 0} 筆資料
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    第一頁
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    上一頁
                  </button>
                  <span className="text-sm">
                    第 {pageIndex + 1} 頁，共 {table.getPageCount()} 頁
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    下一頁
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    最後一頁
                  </button>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setPageIndex(0)
                    }}
                    className="px-2 py-1 border rounded"
                  >
                    {[10, 20, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        每頁 {size} 筆
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 效能優化

### 1. useMemo 避免重新計算

```typescript
// ✅ 使用 useMemo 快取欄位定義
const columns = useMemo<ColumnDef<Character>[]>(
  () => [
    // 欄位定義
  ],
  [] // 空依賴，只計算一次
);

// ✅ 快取複雜計算
const sortedData = useMemo(() => data.sort((a, b) => a.speed - b.speed), [data]);
```

### 2. React.memo 避免重渲染

```typescript
// 將 Cell 元件包裝為 memo
const StatCell = React.memo(({ value }: { value: number }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span>{value}/10</span>
    </div>
  )
})
```

### 3. 虛擬滾動（大量資料）

使用 `@tanstack/react-virtual` 處理大量資料。

```bash
pnpm add @tanstack/react-virtual
```

```typescript
// components/VirtualizedTable.tsx
'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'

export default function VirtualizedTable({ data }: { data: Character[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // 每行高度
    overscan: 10, // 預載行數
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex border-b"
            >
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="px-4 py-2 flex-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 4. 分頁策略選擇

| 資料量       | 推薦策略            | 原因                     |
| ------------ | ------------------- | ------------------------ |
| < 1,000      | 客戶端分頁          | 簡單、快速、無 API 延遲  |
| 1,000-10,000 | 客戶端分頁+虛擬滾動 | 平衡效能與複雜度         |
| > 10,000     | 伺服器端分頁        | 減少記憶體使用、提升效能 |

---

## 最佳實踐

### 1. 型別安全

```typescript
// ✅ 定義明確的型別
interface TableData {
  id: string;
  name: string;
  value: number;
}

const columns: ColumnDef<TableData>[] = [
  // TypeScript 會檢查 accessorKey 是否正確
  {
    accessorKey: 'name' // ✅ 正確
    // accessorKey: 'invalid', // ❌ TypeScript 錯誤
  }
];

// ✅ 使用型別推斷
const table = useReactTable({
  data, // TypeScript 會推斷為 TableData[]
  columns,
  getCoreRowModel: getCoreRowModel()
});
```

### 2. 狀態管理最佳實踐

```typescript
// ✅ 使用 Jotai 管理所有 UI 狀態
const sortingAtom = atom<SortingState>([]);
const paginationAtom = atom<PaginationState>({ pageIndex: 0, pageSize: 10 });

// ✅ 持久化重要狀態
const columnVisibilityAtom = atomWithStorage<VisibilityState>('table-column-visibility', {});

// ❌ 不要在 Table 內部管理狀態（非受控）
// const [sorting, setSorting] = useState<SortingState>([])
```

### 3. 錯誤處理

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['characters'],
  queryFn: fetchCharacters,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})

if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="font-medium text-red-800">載入失敗</h3>
      <p className="text-sm text-red-600">{error.message}</p>
      <button
        onClick={() => queryClient.invalidateQueries(['characters'])}
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
      >
        重試
      </button>
    </div>
  )
}
```

### 4. 響應式設計

```typescript
// ✅ 使用 Tailwind 響應式 class
<div className="overflow-x-auto"> {/* 小螢幕可橫向滾動 */}
  <table className="min-w-full">
    {/* 表格內容 */}
  </table>
</div>

// ✅ 在小螢幕隱藏次要欄位
const columns: ColumnDef<Character>[] = [
  {
    accessorKey: 'name',
    header: '角色',
    meta: {
      className: '', // 始終顯示
    },
  },
  {
    accessorKey: 'details',
    header: '詳細資訊',
    meta: {
      className: 'hidden lg:table-cell', // 大螢幕才顯示
    },
  },
]
```

### 5. 可及性（Accessibility）

```typescript
// ✅ 語意化 HTML
<table role="table" aria-label="角色統計表格">
  <thead>
    <tr>
      <th scope="col">角色名稱</th>
    </tr>
  </thead>
</table>

// ✅ 鍵盤導航
<button
  onClick={row.getToggleSelectedHandler()}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      row.toggleSelected()
    }
  }}
  aria-label={`選擇 ${row.original.name}`}
>
  選擇
</button>
```

---

## 常見問題

### Q1: 何時使用客戶端 vs 伺服器端分頁？

**A**: 根據資料量決定：

- **< 1,000 筆** → 客戶端分頁（`manualPagination: false`）
- **> 1,000 筆** → 伺服器端分頁（`manualPagination: true`）

### Q2: 如何與現有的 Tanstack Query 整合？

**A**: 使用 Jotai 狀態作為 queryKey：

```typescript
const [pagination] = useAtom(paginationAtom);
const [sorting] = useAtom(sortingAtom);

const { data } = useQuery({
  queryKey: ['characters', pagination, sorting], // ⭐ 依賴狀態
  queryFn: () => fetchCharacters(pagination, sorting)
});
```

### Q3: 表格重渲染過多怎麼辦？

**A**: 使用 `useMemo` 和 `React.memo`：

```typescript
// 快取欄位定義
const columns = useMemo(() => [...], [])

// 快取資料
const memoizedData = useMemo(() => data, [data])

// 包裝 Cell 元件
const MemoizedCell = React.memo(CellComponent)
```

### Q4: 如何實現行內編輯？

**A**: 使用 `EditableCell` 元件搭配狀態管理：

```typescript
function EditableCell({ value, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)

  if (isEditing) {
    return (
      <input
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={() => {
          onSave(currentValue)
          setIsEditing(false)
        }}
      />
    )
  }

  return <div onClick={() => setIsEditing(true)}>{value}</div>
}
```

### Q5: 如何處理大量資料（10,000+ 筆）？

**A**: 使用虛擬滾動或伺服器端分頁：

```typescript
// 方案 1: 虛擬滾動（客戶端）
import { useVirtualizer } from '@tanstack/react-virtual';

// 方案 2: 伺服器端分頁（推薦）
const table = useReactTable({
  data,
  columns,
  pageCount: serverPageCount,
  manualPagination: true
});
```

### Q6: 如何整合搜尋功能？

**A**: 使用 Column Filters：

```typescript
const [columnFilters, setColumnFilters] = useAtom(columnFiltersAtom)

// 搜尋輸入
<input
  value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
  onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
/>

// Table 設定
const table = useReactTable({
  state: { columnFilters },
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
})
```

### Q7: 如何自訂排序邏輯？

**A**: 使用 `sortingFn`：

```typescript
const columns: ColumnDef<Character>[] = [
  {
    accessorKey: 'name',
    header: '角色',
    sortingFn: (rowA, rowB, columnId) => {
      // 自訂排序邏輯
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;
      return a.localeCompare(b, 'zh-TW');
    }
  }
];
```

### Q8: 如何匯出表格資料？

**A**: 使用表格的資料模型：

```typescript
function exportToCSV() {
  const rows = table.getRowModel().rows;
  const csv = rows
    .map((row) => {
      return row
        .getVisibleCells()
        .map((cell) => cell.getValue())
        .join(',');
    })
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'export.csv';
  link.click();
}
```

### Q9: 表格狀態如何持久化？

**A**: 使用 Jotai 的 `atomWithStorage`：

```typescript
import { atomWithStorage } from 'jotai/utils';

// 自動儲存到 localStorage
const columnVisibilityAtom = atomWithStorage<VisibilityState>('table-column-visibility', {});

const sortingAtom = atomWithStorage<SortingState>('table-sorting', []);
```

### Q10: 如何實現批量操作？

**A**: 結合行選擇與 Mutation：

```typescript
const selectedRows = table.getSelectedRowModel().rows
const selectedIds = selectedRows.map((row) => row.original.id)

const batchDeleteMutation = useMutation({
  mutationFn: (ids: string[]) => authFetch('/api/characters/batch-delete', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(['characters'])
    table.resetRowSelection()
  },
})

// 使用
<button onClick={() => batchDeleteMutation.mutate(selectedIds)}>
  刪除選中的 {selectedIds.length} 筆
</button>
```

---

## 總結

### 核心架構

```
Tanstack Table (UI 邏輯)
    ↕
Tanstack Query (資料管理)
    ↕
Jotai (狀態管理)
    ↕
React Hook Form (行內編輯)
```

### 關鍵優勢

✅ **型別安全** - 完整的 TypeScript 支援  
✅ **效能優化** - 虛擬滾動、智能快取、最小重渲染  
✅ **功能豐富** - 排序、過濾、分頁、選擇、編輯  
✅ **靈活整合** - 無縫結合 Tanstack Query 和 Jotai  
✅ **開發體驗** - 清晰的 API、豐富的文檔、活躍的社群

### 開始使用

1. 安裝套件: `pnpm add @tanstack/react-table`
2. 定義欄位: `const columns: ColumnDef<T>[] = [...]`
3. 建立表格: `const table = useReactTable({ data, columns, ... })`
4. 渲染 UI: 使用 `flexRender` 渲染表頭與儲存格
5. 整合狀態: 使用 Jotai 管理排序、分頁、過濾
6. 獲取資料: 使用 Tanstack Query 自動化資料獲取

### 參考資源

- [Tanstack Table 官方文檔](https://tanstack.com/table/latest)
- [Tanstack Query 整合指南](./tanstack-query-jotai-guide.md)
- [範例專案](https://github.com/TanStack/table/tree/main/examples)

---

**文件維護者**: AI Assistant  
**最後更新**: 2026-04-21
