---
name: state-management
description: Tanstack Query + Jotai 狀態管理完整架構指南。提供 AI 代理關於伺服器狀態與客戶端狀態管理的最佳實踐，包含認證系統、資料流程、依賴查詢等完整實現方案。
license: MIT
---

# Tanstack Query + Jotai 狀態管理架構

## 我的功能

- 提供伺服器狀態（Tanstack Query）與客戶端狀態（Jotai）的分工指導
- 實現完整的 JWT 認證系統（含 Token 刷新機制）
- 處理 API 資料獲取、快取、同步與錯誤重試
- 實現串聯式依賴查詢（如部門 → 組別 → 人員）
- 提供樂觀更新、預載資料等進階模式
- 自動處理競態條件與請求去重

## 何時使用我

在以下情況下使用此技能：

- 需要實現 API 資料獲取與快取時
- 建立認證系統（登入、登出、Token 刷新）時
- 處理需要依賴關係的多層級查詢時（如下拉選單串接）
- 需要狀態驅動的 API 查詢時（排序、過濾、搜尋）
- 實現資料變更（Mutation）與快取更新時
- **建立表單驗證系統時（React Hook Form + Zod）**
- **需要處理複雜表單（多步驟、動態欄位、檔案上傳）時**
- 決定某個狀態應該用 Jotai 還是 Tanstack Query 時
- 遇到「是否要將 API 資料存到狀態管理器」的疑問時
- 需要處理 Token 過期與自動刷新的情境時

## 核心原則

### ⚠️ 關鍵概念

> **Tanstack Query 的資料不要存到 Jotai！**

兩者是**互補**的，不是競爭或串接關係：

- **Tanstack Query** = 伺服器狀態管理（API 資料、快取、同步）
- **Jotai** = 客戶端 UI 狀態管理（表單、選擇、主題、Token）

### 狀態分工

```
✅ Jotai 管理：
- UI 狀態（頁面、選單開關、主題）
- 表單輸入值
- 排序/過濾條件
- Token 與用戶資料（持久化）
- 語言設定

✅ Tanstack Query 管理：
- API 資料獲取
- 資料快取與同步
- 背景更新
- 錯誤重試
- 樂觀更新
```

### 資料流程

```
Jotai 狀態 → 作為 queryKey 參數 → Tanstack Query
     ↓                                      ↓
  UI 互動                              API 資料獲取
     ↓                                      ↓
  狀態改變                             自動重新查詢
```

## 必須安裝的套件

### 新增套件

```bash
# 資料獲取與快取
pnpm add @tanstack/react-query
pnpm add @tanstack/react-query-devtools  # 開發工具（可選）

# 表單驗證（完整套件）
pnpm add react-hook-form zod @hookform/resolvers
```

### 已有套件

- ✅ `jotai` - 已安裝
- ✅ `jotai/utils` (atomWithStorage) - 內建於 jotai，無需額外安裝

### ❌ 不需要的套件

- `jotai-persist` - 第三方套件，使用官方的 `jotai/utils` 即可
- `formik` 或 `redux-form` - 已選擇 React Hook Form

## 快速開始

### 1. 設定 Layout

```typescript
// app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3
    }
  }
})

export default function RootLayout({ children }) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </JotaiProvider>
  )
}
```

### 2. 基本使用

```typescript
// Jotai: UI 狀態
const [sortBy] = useAtom(sortByAtom);

// Tanstack Query: API 資料（狀態驅動）
const { data, isLoading } = useQuery({
  queryKey: ['characters', sortBy], // sortBy 改變會自動重新查詢
  queryFn: () => fetch(`/api/characters?sort=${sortBy}`).then((r) => r.json())
});
```

## 架構詳解

完整的架構說明、認證系統實現、資料流程模式、最佳實踐和常見問題解答，請參考 [`AGENTS.md`](./AGENTS.md) 檔案。

## 主要模式

### 模式 1: 狀態驅動查詢

Jotai 狀態作為 queryKey 參數，狀態改變自動觸發 API 重新查詢。

### 模式 2: 串聯式依賴查詢

適用於多層級下拉選單（部門 → 組別 → 人員），使用 `enabled` 控制查詢時機。

### 模式 3: Mutation 與快取更新

資料變更後自動更新快取或使查詢失效。

### 模式 4: 認證與 Token 刷新

自動處理 401 錯誤、刷新 Token 並重試原始請求。

### 模式 5: 表單驗證與提交

React Hook Form + Zod 進行型別安全的表單驗證，整合 Tanstack Query Mutation 提交資料。

## 使用時機判斷

### ✅ 使用 React Hook Form + Zod

- 有 3 個以上輸入欄位的表單
- 需要複雜驗證規則（格式、條件式、跨欄位）
- 需要前後端共用驗證邏輯
- 需要型別安全的表單處理

### ❌ 不需要使用

- 單一輸入欄位（如：搜尋框）→ 直接用 useState
- 簡單的開關切換 → 直接用 Jotai atom
- 靜態資料選擇（無驗證需求）

## 表單驗證快速範例

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'

// 1. 定義驗證 Schema
const loginSchema = z.object({
  email: z.string().email('電子郵件格式不正確'),
  password: z.string().min(8, '密碼至少 8 個字元')
})

type LoginFormData = z.infer<typeof loginSchema>

// 2. 使用
function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  })

  return (
    <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={loginMutation.isPending}>
        登入
      </button>
    </form>
  )
}
```

## 反模式警告

### ❌ 不要這樣做

```typescript
// 將 Tanstack Query 資料存到 Jotai
const [data, setData] = useAtom(dataAtom);
const { data: queryData } = useQuery(['data'], fetchData);
useEffect(() => {
  setData(queryData);
}, [queryData]); // ❌ 錯誤！
```

### ✅ 正確做法

```typescript
// 直接使用 Tanstack Query 的資料
const { data } = useQuery(['data'], fetchData); // ✅ 正確
```

## 相關資源

- [Tanstack Query 官方文檔](https://tanstack.com/query/latest)
- [Jotai 官方文檔](https://jotai.org)
- [React Hook Form 官方文檔](https://react-hook-form.com)
- [Zod 官方文檔](https://zod.dev)
- 專案內部文檔：`docs/architecture/tanstack-query-jotai-guide.md`
