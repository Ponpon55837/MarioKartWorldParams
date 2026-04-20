# Tanstack Query + Jotai 完整架構指南

> **文件版本**: 1.0.0  
> **更新日期**: 2026-04-20  
> **適用專案**: Next.js 16 App Router + TypeScript

## 📋 目錄

- [概述](#概述)
- [核心概念](#核心概念)
- [套件說明](#套件說明)
- [認證系統架構](#認證系統架構)
- [表單驗證架構](#表單驗證架構)
- [資料流程模式](#資料流程模式)
- [實戰範例](#實戰範例)
- [最佳實踐](#最佳實踐)
- [常見問題](#常見問題)

---

## 概述

### 為什麼需要兩個狀態管理庫？

Tanstack Query 和 Jotai **不是競爭關係，而是互補的**：

```
┌─────────────────────────────────────┐
│         Tanstack Query              │
│    管理伺服器端資料                    │
│  • API 資料獲取與快取                 │
│  • 自動重新驗證                       │
│  • 背景更新與同步                     │
│  • 錯誤重試機制                       │
└─────────────────────────────────────┘
              ↕
         直接使用 data
              ↕
┌─────────────────────────────────────┐
│      React Components               │
└─────────────────────────────────────┘
              ↕
         讀寫 UI 狀態
              ↕
┌─────────────────────────────────────┐
│            Jotai                    │
│      管理客戶端 UI 狀態                │
│  • 頁面導航狀態                       │
│  • 排序/過濾條件                      │
│  • 表單輸入值                         │
│  • 主題、語言設定                     │
│  • Token 與用戶資料                   │
└─────────────────────────────────────┘
```

### 關鍵原則

> ⚠️ **重要**：Tanstack Query 的資料**不要**存到 Jotai！

- Tanstack Query 本身就是狀態管理器（針對伺服器資料）
- Jotai 的狀態可以作為 queryKey 參數傳給 Tanstack Query
- 兩者是**平行**的，不是**串接**的關係

---

## 核心概念

### Tanstack Query vs Jotai

| 特性         | Jotai              | Tanstack Query                 |
| ------------ | ------------------ | ------------------------------ |
| **狀態類型** | 客戶端 UI 狀態     | 伺服器端資料狀態               |
| **資料來源** | 應用程式內部       | API / 後端服務                 |
| **快取策略** | 基本（需手動實現） | 內建智能快取與自動重新驗證     |
| **資料同步** | 不處理             | 自動背景更新、輪詢             |
| **錯誤處理** | 手動處理           | 內建錯誤重試、錯誤邊界         |
| **載入狀態** | 手動管理           | 自動提供 isLoading、isFetching |
| **樂觀更新** | 可實現但需手寫     | 內建樂觀更新機制               |

### 使用場景對照

#### ✅ Jotai 適合

```typescript
// UI 狀態
const currentPageAtom = atom('characters');
const searchQueryAtom = atom('');
const selectedThemeAtom = atom('light');

// 用戶偏好設定（持久化）
const languageAtom = atomWithStorage('language', 'zh-TW');

// 表單輸入
const formDataAtom = atom({ name: '', email: '' });

// Token 管理
const accessTokenAtom = atomWithStorage('access-token', null);
```

#### ✅ Tanstack Query 適合

```typescript
// API 資料獲取
const { data, isLoading } = useQuery({
  queryKey: ['characters'],
  queryFn: () => fetch('/api/characters').then((r) => r.json()),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true
});

// 資料變更
const mutation = useMutation({
  mutationFn: (data) =>
    fetch('/api/characters', {
      method: 'POST',
      body: JSON.stringify(data)
    })
});
```

---

## 套件說明

### 需要安裝的套件

```json
{
  "dependencies": {
    "jotai": "^2.16.0", // ✅ 已有
    "next": "16.2.3", // ✅ 已有
    "react": "^18.3.1", // ✅ 已有
    "@tanstack/react-query": "^5.0.0" // ⭐ 需新增
  }
}
```

### 安裝指令

```bash
pnpm add @tanstack/react-query
```

### ⚠️ 不需要的套件

- ❌ **jotai-persist** - 第三方套件（不推薦）
- ✅ **jotai/utils** - Jotai 官方內建（已有，無需安裝）

```typescript
// ❌ 錯誤：使用第三方套件
import { atomWithStorage } from 'jotai-persist';

// ✅ 正確：使用 Jotai 官方工具
import { atomWithStorage } from 'jotai/utils';
```

---

## 認證系統架構

### 1. Token 管理（Jotai）

```typescript
// store/authAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 持久化 tokens
export const accessTokenAtom = atomWithStorage<string | null>('mario-kart-access-token', null);

export const refreshTokenAtom = atomWithStorage<string | null>('mario-kart-refresh-token', null);

export const tokenExpiryAtom = atomWithStorage<number | null>('mario-kart-token-expiry', null);

// 用戶資料
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export const userAtom = atomWithStorage<User | null>('mario-kart-user', null);

// 認證狀態（派生 atom）
export const isAuthenticatedAtom = atom((get) => {
  const token = get(accessTokenAtom);
  const user = get(userAtom);
  return !!token && !!user;
});

// 是否可以刷新 token（10 分鐘緩衝期）
export const canRefreshTokenAtom = atom((get) => {
  const refreshToken = get(refreshTokenAtom);
  const expiry = get(tokenExpiryAtom);

  if (!refreshToken || !expiry) return false;

  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  // token 過期但在 10 分鐘內
  return expiry < now && now - expiry < tenMinutes;
});

// 登出 action
export const logoutAtom = atom(null, (get, set) => {
  set(accessTokenAtom, null);
  set(refreshTokenAtom, null);
  set(tokenExpiryAtom, null);
  set(userAtom, null);
});

// 設定認證資料 action
export const setAuthDataAtom = atom(
  null,
  (
    get,
    set,
    data: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: User;
    }
  ) => {
    set(accessTokenAtom, data.accessToken);
    set(refreshTokenAtom, data.refreshToken);
    set(tokenExpiryAtom, Date.now() + data.expiresIn * 1000);
    set(userAtom, data.user);
  }
);
```

### 2. 認證 Fetch 工具

```typescript
// utils/authFetch.ts
import { getDefaultStore } from 'jotai';
import { accessTokenAtom, refreshTokenAtom, canRefreshTokenAtom, logoutAtom, setAuthDataAtom } from '@/store/authAtoms';

const store = getDefaultStore();

// Token 刷新鎖（防止多個請求同時刷新）
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * 刷新 Access Token
 */
async function refreshAccessToken(): Promise<string> {
  // 如果已經在刷新中，返回同一個 Promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const refreshToken = store.get(refreshTokenAtom);

      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      // 更新認證資料
      store.set(setAuthDataAtom, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        user: data.user
      });

      console.log('✅ Token 刷新成功');
      return data.accessToken;
    } catch (error) {
      console.error('❌ Token 刷新失敗:', error);
      store.set(logoutAtom);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * 帶認證的 Fetch（自動處理 token 刷新）
 */
export async function authFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  let accessToken = store.get(accessTokenAtom);

  const makeRequest = async (token: string | null) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
  };

  // 第一次請求
  let response = await makeRequest(accessToken);

  // 處理 401 - 嘗試刷新 token
  if (response.status === 401 && store.get(canRefreshTokenAtom)) {
    try {
      console.log('🔄 Token 過期，嘗試刷新...');
      accessToken = await refreshAccessToken();

      // 使用新 token 重試
      response = await makeRequest(accessToken);
    } catch (error) {
      // 刷新失敗，拋出錯誤讓 Provider 處理
      throw { status: 401, message: '登入已過期，請重新登入' };
    }
  }

  // 處理其他錯誤狀態
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorData.message || response.statusText,
      data: errorData
    };
  }

  return response.json();
}
```

### 3. AuthProvider（核心）

```typescript
// providers/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useRouter, usePathname } from 'next/navigation'
import {
  isAuthenticatedAtom,
  userAtom,
  logoutAtom,
  User
} from '@/store/authAtoms'

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

// 不需要認證的公開路徑
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

const isPublicPath = (path: string) => {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const user = useAtomValue(userAtom)
  const logout = useSetAtom(logoutAtom)

  const [isLoading, setIsLoading] = React.useState(true)

  // 檢查認證狀態
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // 路由保護
  useEffect(() => {
    if (isLoading) return

    const isPublic = isPublicPath(pathname)

    // 未登入且訪問受保護頁面 → 導向登入頁
    if (!isAuthenticated && !isPublic) {
      console.log('🔒 未登入，導向登入頁')
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }

    // 已登入且訪問登入頁 → 導向首頁
    if (isAuthenticated && isPublic) {
      console.log('✅ 已登入，導向首頁')
      router.push('/')
    }
  }, [isAuthenticated, pathname, isLoading, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // 載入中顯示載入畫面
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mario-red" />
      </div>
    )
  }

  // 未登入且訪問受保護頁面，不渲染內容
  if (!isAuthenticated && !isPublicPath(pathname)) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        logout: handleLogout,
        isLoading: false
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// 自定義 Hook
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
```

### 4. Layout 整合

```typescript
// app/layout.tsx
'use client'

import { JotaiProvider } from '@/providers/JotaiProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 401 錯誤不重試（已由 authFetch 處理）
        if (error?.status === 401) return false
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 分鐘
      refetchOnWindowFocus: true
    }
  }
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <JotaiProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {children}
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </JotaiProvider>
      </body>
    </html>
  )
}
```

---

## 表單驗證架構

### 為什麼選擇 React Hook Form + Zod？

**React Hook Form** 提供高性能的表單狀態管理：

- ✅ 基於非受控元件，減少重渲染
- ✅ 與 Tanstack Query 的 mutation 完美整合
- ✅ TypeScript 完整支援，型別推斷精確

**Zod** 提供 TypeScript-first 的驗證方案：

- ✅ Schema 定義即文檔，易於維護
- ✅ 自動型別推斷，前後端共用
- ✅ 錯誤訊息完全可自訂，支援多語言

### 架構整合圖

```
┌─────────────────────────────────────┐
│    Zod Schema (驗證規則)              │
│  • 型別定義                           │
│  • 驗證邏輯                           │
│  • 錯誤訊息                           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  React Hook Form (表單狀態)          │
│  • register() - 註冊欄位              │
│  • handleSubmit() - 提交處理          │
│  • formState.errors - 錯誤狀態        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Tanstack Query Mutation (API)      │
│  • 提交資料到伺服器                    │
│  • 處理成功/失敗                       │
│  • 更新快取                           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Jotai (可選 - 草稿持久化)             │
│  • atomWithStorage                  │
│  • 自動儲存表單草稿                    │
└─────────────────────────────────────┘
```

### 1. 定義驗證 Schema

```typescript
// schemas/authSchemas.ts
import { z } from 'zod';

// 登入表單
export const loginSchema = z.object({
  email: z.string().min(1, '請輸入電子郵件').email('電子郵件格式不正確'),
  password: z.string().min(8, '密碼至少 8 個字元').regex(/[A-Z]/, '密碼必須包含至少一個大寫字母').regex(/[0-9]/, '密碼必須包含至少一個數字')
});

// 從 Schema 推斷型別
export type LoginFormData = z.infer<typeof loginSchema>;

// 註冊表單（跨欄位驗證）
export const registerSchema = z
  .object({
    name: z.string().min(2, '姓名至少 2 個字元'),
    email: z.string().email('電子郵件格式不正確'),
    password: z.string().min(8, '密碼至少 8 個字元'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密碼不一致',
    path: ['confirmPassword']
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### 2. 基礎表單實現

```typescript
// components/LoginForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { loginSchema, type LoginFormData } from '@/schemas/authSchemas'

export default function LoginForm() {
  // 1️⃣ React Hook Form 設定
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur' // 失焦時驗證
  })

  // 2️⃣ Tanstack Query Mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('登入失敗')
      return response.json()
    }
  })

  // 3️⃣ 提交處理
  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? '登入中...' : '登入'}
      </button>
    </form>
  )
}
```

### 3. 進階驗證模式

#### 模式 1: 非同步驗證

```typescript
const emailSchema = z.string().refine(
  async (email) => {
    const response = await fetch(`/api/check-email?email=${email}`);
    const { available } = await response.json();
    return available;
  },
  { message: '此電子郵件已被註冊' }
);
```

#### 模式 2: 動態欄位（陣列）

```typescript
import { useFieldArray } from 'react-hook-form'

const teamSchema = z.object({
  teamName: z.string().min(2),
  members: z.array(z.object({
    name: z.string(),
    role: z.enum(['leader', 'member'])
  })).min(2, '至少需要 2 位成員')
})

function TeamForm() {
  const { control, register } = useForm({
    resolver: zodResolver(teamSchema)
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members'
  })

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`members.${index}.name`)} />
          <button onClick={() => remove(index)}>刪除</button>
        </div>
      ))}
      <button onClick={() => append({ name: '', role: 'member' })}>
        新增成員
      </button>
    </form>
  )
}
```

#### 模式 3: 表單草稿持久化

```typescript
// store/formDraftAtoms.ts
import { atomWithStorage } from 'jotai/utils'

export const registerDraftAtom = atomWithStorage<Partial<RegisterFormData>>(
  'mario-kart-register-draft',
  {}
)

// 使用
function RegisterForm() {
  const [draft, setDraft] = useAtom(registerDraftAtom)

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: draft
  })

  // 自動儲存草稿
  const formValues = form.watch()
  useEffect(() => {
    const timer = setTimeout(() => setDraft(formValues), 1000)
    return () => clearTimeout(timer)
  }, [formValues, setDraft])

  const onSubmit = async (data) => {
    await submitData(data)
    setDraft({}) // 清除草稿
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

### 使用時機判斷

#### ✅ 使用 React Hook Form + Zod

- 有 3 個以上輸入欄位的表單
- 需要複雜驗證規則（格式、條件式、跨欄位）
- 需要前後端共用驗證邏輯
- 需要型別安全的表單處理
- 需要整合 API 提交（與 Tanstack Query）

#### ❌ 不需要使用

- 單一輸入欄位（如：搜尋框）→ 直接用 useState
- 簡單的開關切換 → 直接用 Jotai atom
- 靜態資料選擇（無驗證需求）

---

## 資料流程模式

### 模式 1: 狀態驅動查詢

Jotai 的狀態作為 Tanstack Query 的查詢參數。

```typescript
// ✅ 正確模式：狀態驅動查詢
function CharactersPage() {
  // Jotai 管理過濾/排序的 UI 狀態
  const [sortBy] = useAtom(sortByAtom)
  const [speedFilter] = useAtom(speedFilterAtom)
  const [searchQuery] = useAtom(searchQueryAtom)

  // Tanstack Query 使用這些狀態作為查詢參數
  const { data: characters, isLoading } = useQuery({
    queryKey: ['characters', sortBy, speedFilter, searchQuery],
    //          ↑ 狀態變化時會自動重新獲取
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy,
        speedFilter,
        search: searchQuery
      })

      const response = await authFetch(`/api/characters?${params}`)
      return response
    },
    staleTime: 30 * 1000, // 30秒快取
  })

  return <div>{/* 使用 characters */}</div>
}
```

**流程**：

```
用戶改變排序 → setSortBy('acceleration')
    ↓
Jotai 更新狀態
    ↓
sortBy 值改變
    ↓
Tanstack Query 偵測到 queryKey 變化
    ↓
自動呼叫 queryFn 重新獲取資料
    ↓
新資料回傳，UI 自動更新
```

### 模式 2: 串聯式依賴查詢

適用於下拉選單、多層級資料結構。

```typescript
// store/organizationAtoms.ts
export const selectedDepartmentIdAtom = atom<string | null>(null);
export const selectedGroupIdAtom = atom<string | null>(null);
export const selectedPersonIdAtom = atom<string | null>(null);

// 選擇部門時清空下層
export const setDepartmentAtom = atom(null, (get, set, departmentId: string | null) => {
  set(selectedDepartmentIdAtom, departmentId);
  set(selectedGroupIdAtom, null);
  set(selectedPersonIdAtom, null);
});

// hooks/useOrganization.ts
// 1️⃣ 部門列表（無依賴）
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => authFetch<Department[]>('/api/departments')
  });
}

// 2️⃣ 組別列表（依賴部門）
export function useGroups() {
  const departmentId = useAtomValue(selectedDepartmentIdAtom);

  return useQuery({
    queryKey: ['groups', departmentId],
    queryFn: () => authFetch<Group[]>(`/api/departments/${departmentId}/groups`),
    enabled: !!departmentId // ⭐ 只有選擇部門後才執行
  });
}

// 3️⃣ 人員列表（依賴組別）
export function usePersons() {
  const groupId = useAtomValue(selectedGroupIdAtom);

  return useQuery({
    queryKey: ['persons', groupId],
    queryFn: () => authFetch<Person[]>(`/api/groups/${groupId}/persons`),
    enabled: !!groupId
  });
}

// 4️⃣ 人員詳情（依賴人員）
export function usePersonDetail() {
  const personId = useAtomValue(selectedPersonIdAtom);

  return useQuery({
    queryKey: ['person', personId],
    queryFn: () => authFetch<PersonDetail>(`/api/persons/${personId}`),
    enabled: !!personId
  });
}
```

### 模式 3: Mutation 與快取更新

```typescript
// 新增角色
function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewCharacter) =>
      authFetch('/api/characters', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (newCharacter) => {
      // 方法 1: 讓相關查詢失效並重新獲取
      queryClient.invalidateQueries(['characters']);

      // 方法 2: 直接更新快取（樂觀更新）
      queryClient.setQueryData(['characters'], (old: Character[]) => [...old, newCharacter]);
    }
  });
}
```

---

## 最佳實踐

### 1. QueryKey 命名規範

```typescript
// ✅ 好的命名
['characters'][('characters', sortBy)][('characters', { sortBy, filter })][('departments', deptId, 'groups')][('user', userId, 'posts', { page: 1 })][ // 單一資源 // 帶參數 // 多參數（物件） // 巢狀資源 // 複雜結構
  // ❌ 不好的命名
  'data'
]['getAllCharacters']; // 太模糊 // 不要用函式名稱
```

### 2. 錯誤處理

```typescript
// API 錯誤類別
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 使用
const { data, error } = useQuery({
  queryKey: ['characters'],
  queryFn: async () => {
    const response = await fetch('/api/characters');
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.message, errorData);
    }
    return response.json();
  }
});
```

### 3. 防抖搜尋

```typescript
import { useDebounce } from 'use-debounce';

function SearchComponent() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounce(searchText, 500);

  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => authFetch(`/api/search?q=${debouncedSearch}`),
    enabled: debouncedSearch.length > 0
  });
}
```

### 4. 樂觀更新

```typescript
function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (character: Character) =>
      authFetch(`/api/characters/${character.id}`, {
        method: 'PUT',
        body: JSON.stringify(character)
      }),
    onMutate: async (newCharacter) => {
      await queryClient.cancelQueries(['characters']);
      const previousCharacters = queryClient.getQueryData(['characters']);

      queryClient.setQueryData(['characters'], (old: Character[]) => old.map((c) => (c.id === newCharacter.id ? newCharacter : c)));

      return { previousCharacters };
    },
    onError: (err, newCharacter, context) => {
      queryClient.setQueryData(['characters'], context.previousCharacters);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['characters']);
    }
  });
}
```

---

## 常見問題

### Q1: useEffect 還需要用嗎？

**A**: 使用 Tanstack Query 後，**95% 的資料獲取相關 useEffect 都可以移除**。

```typescript
// ❌ 不再需要
useEffect(() => {
  fetch('/api/characters')
    .then((r) => r.json())
    .then(setData);
}, []);

// ✅ 使用 useQuery
const { data } = useQuery({
  queryKey: ['characters'],
  queryFn: () => authFetch('/api/characters')
});
```

### Q2: 如何處理競態條件？

**A**: Tanstack Query 自動處理！過期的請求結果會被自動丟棄。

### Q3: Tanstack Query 的資料要存到 Jotai 嗎？

**A**: ❌ **不要！** 這是常見誤解。

```typescript
// ❌ 錯誤做法
const [characters, setCharacters] = useAtom(charactersAtom);
const { data } = useQuery(['characters'], fetchCharacters);
useEffect(() => {
  if (data) setCharacters(data); // 不必要的重複存儲
}, [data]);

// ✅ 正確做法：直接使用 data
const { data: characters } = useQuery(['characters'], fetchCharacters);
```

### Q4: 如何在多個元件共享查詢資料？

**A**: Tanstack Query 自動去重和共享！相同 queryKey 的查詢只會發送一次請求。

### Q5: Refresh Token 刷新後會重試原始請求嗎？

**A**: ✅ **會！** `authFetch` 內建重試邏輯：

```
1. 發送請求（舊 token）→ 401
2. 刷新 token → 成功
3. 使用新 token 重試原始請求 → 成功
4. 返回資料給元件
```

### Q6: 如何防止多個請求同時刷新 token？

**A**: 使用鎖機制（已在 `authFetch` 中實現），多個請求會共享同一個刷新 Promise。

---

## 總結

### 核心原則

1. **分工明確** - Jotai 管理 UI 狀態，Tanstack Query 管理伺服器資料
2. **不要重複存儲** - Tanstack Query 的資料不要存到 Jotai
3. **狀態驅動查詢** - Jotai 狀態作為 queryKey 參數
4. **自動化優先** - 讓 Tanstack Query 處理快取、重試、競態

### 架構優勢

✅ 使用者無感刷新 - Token 過期自動處理  
✅ 自動快取 - 切換頁面瞬間顯示  
✅ 背景更新 - 視窗重新聚焦時自動同步  
✅ 錯誤重試 - 網路錯誤自動重試  
✅ 型別安全 - TypeScript 完整支援  
✅ 開發體驗 - React Query DevTools 視覺化偵錯

---

**參考資源**:

- [Tanstack Query 官方文檔](https://tanstack.com/query/latest)
- [Jotai 官方文檔](https://jotai.org)
- [Next.js App Router](https://nextjs.org/docs/app)
