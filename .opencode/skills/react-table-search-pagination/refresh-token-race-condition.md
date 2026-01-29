# Refresh Token 機制與競態條件處理

## 概述

本文整理了 Refresh Token 機制在 React/Next.js 應用中的實作方式，特別針對列表、搜尋、分頁功能中可能遇到的 Token 過期與競態條件問題提供完整的解決方案。

---

## 目錄

1. [核心挑戰：當列表 API 遇到 401](#1-核心挑戰當列表-api-遇到-401)
2. [基礎建設：Axios 攔截器與請求佇列](#2-基礎建設axios-攔截器與請求佇列)
3. [進階整合：主流 Data Fetching 函式庫](#3-進階整合主流-data-fetching-函式庫)
4. [實務情境分析](#4-實務情境分析)
5. [當 Refresh Token 遇上競態條件](#5-當-refresh-token-遇上競態條件)
6. [解決方案：Axios 攔截器與 AbortController](#6-解決方案axios-攔截器與-abortcontroller)
7. [TanStack Query vs SWR 實作差異](#7-tanstack-query-vs-swr-實作差異)
8. [最佳實踐總結](#8-最佳實踐總結)

---

## 1. 核心挑戰：當列表 API 遇到 401

在「分頁」或「無限捲動」的列表架構中，若使用者停留頁面過長導致 Access Token 過期：

1. **問題**：使用者發送 `Update` 請求卻回傳 `401 Unauthorized`。
2. **目標**：自動換發 Token 並「重試（retry）」該請求，讓使用者完全感覺不到驗證失敗。

---

## 2. 基礎建設：Axios 攔截器與請求佇列

這是最底層的實作方式，適用於任何框架。核心在於利用 **Promise 佇列** 處理併發請求。

```javascript
import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshAccessTokenAPI() // 呼叫後端 Refresh 接口
          .then((newToken) => {
            axios.defaults.headers.common["Authorization"] =
              "Bearer " + newToken;
            processQueue(null, newToken);
            resolve(axios(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  },
);
```

---

## 3. 進階整合：主流 Data Fetching 函式庫

當我們使用 TanStack Query 或 SWR 管理列表時，實作機制略有不同：

### 3.1 TanStack Query (React Query)

TanStack Query 本身不處理驗證，但它的 retry 與 mutation 機制能與上述 Axios 攔截器完美配合。

- **機制**：當 useMutation 執行列表更新時，若底層 Axios 觸發了攔截器並成功重發，useMutation 的 onSuccess 只會在「第二次成功」後才觸發。
- **優勢**：你可以設定 retry: false 給 Mutation，因為 Axios 攔截器已經幫你處理掉「暫時性驗證失敗」的重試。

```javascript
// 列表更新範例
const mutation = useMutation({
  mutationFn: (updatedData) => axios.patch("/api/list", updatedData),
  onSuccess: () => {
    // 只有在 Token 刷新並重發成功後，才會執行 query 刷新
    queryClient.invalidateQueries(["list"]);
  },
});
```

### 3.2 SWR (Stale-While-Revalidate)

SWR 的核心是 fetcher。要在 SWR 中實作 Refresh Token，建議在 SWRConfig 的 onErrorRetry 或是封裝一層 useSWRMutation。

- **機制**：SWR 較傾向於「全域錯誤處理」。如果 fetcher 拋出 401，可以透過 onError 觸發全域重新驗證。
- **實作技巧**：在 fetcher 內部封裝 Axios，讓 SWR 根本感覺不到 Token 曾經過期。

```javascript
const fetcher = (url) => axios.get(url).then((res) => res.data);

// 在組件中使用
const { data, mutate } = useSWR("/api/list", fetcher);

const handleUpdate = async (newItem) => {
  // 透過 axios 更新，若 401 會被攔截器處理
  await axios.post("/api/list", newItem);

  // 手動觸發 SWR 局部更新 (Optimistic UI)
  mutate(newItem, { revalidate: false });
};
```

---

## 4. 實務情境分析

### 4.1 初始狀態

使用者 小明 登入了一套電商後台管理系統，正在瀏覽「商品列表」。

- `Access Token`：有效期 15 分鐘（即將過期）。
- `Refresh Token`：儲存在瀏覽器的 `HttpOnly Cookie` 中，同時後端 `Redis` 也紀錄了這份對應的 Token 狀態。

### 4.2 觸發操作（停留與編輯）

小明打開了「商品 A」的編輯視窗，開始撰寫詳盡的商品描述。由於撰寫時間較長，超過了 15 分鐘，此時小明的 `Access Token` 已經在後端失效。

撰寫完畢後，小明點擊「儲存並更新列表」按鈕。

### 4.3 衝突發生：發送 API 與 401 錯誤

- 前端執行 `PATCH /api/products/A`。
- 請求層：`Axios` 發出請求，`Header` 帶著已過期的 `Access Token`。
- 後端層：伺服器驗證失敗，回傳 `401 Unauthorized` 狀態碼。

### 4.4 攔截與靜默刷新（無感處理）

此時，前端的 `Axios Response Interceptor`（攔截器）偵測到 `401` 錯誤，開始以下自動化流程：

1. **掛起請求**：攔截器暫時「擋住」小明的儲存請求，將其存入一個 `failedQueue`（失敗佇列）中。
2. **換發 Token**：前端自動發送一個隱藏的 `POST /api/auth/refresh` 請求。
3. **後端 Redis 比對**：後端接收到 `Refresh Token`，去 `Redis` 查詢發現該 `Session` 仍然合法，於是生成一組全新的 `Access Token` 回傳。
4. **更新狀態**：前端收到新 Token，更新Token管理機制，並呼叫 processQueue。

### 4.5 自動重發與資料同步

攔截器使用新的 `Token` 自動重新發送剛才被擋下的「商品 A」儲存請求。

- **對小明而言**：他只看到按鈕轉了一圈（Loading），並沒有被踢回登入頁。
- **API 結果**：第二次請求成功，後端回傳 200 OK。

### 4.6 UI 最終更新（結合列表更新策略）

當重發的 API 成功回傳後，原始程式碼中的 `.then()` 或 `await` 才被觸發：

1. **資料同步**：根據原本的策略，系統執行 `setItems` 進行局部更新（Local Update），將商品列表中的「商品 A」名稱同步為新資訊。
2. **反饋**：右上方跳出「商品更新成功」的 `Toast` 訊息。

---

## 5. 當 Refresh Token 遇上競態條件

### 5.1 實際情境：無感刷新與競態條件的衝突

當「無感刷新」與「競態條件」同時發生時，會出現以下錯誤鏈：

1. **觸發刷新**：使用者點擊「第一頁」，API A 發生 401 被掛起，進入 Refresh 佇列等待。
2. **快速切換**：使用者立刻點擊「第二頁」，API B 再次發生 401 並排隊。
3. **換發成功**：Token 拿到後，API A 與 API B 的重發請求同時被送出。
4. **競態爆發**：若 API A（第一頁）的重發結果比 API B（第二頁）慢回傳，畫面會發生 **「資料跳回第一頁，但分頁標籤在第二頁」** 的嚴重錯誤。

---

## 6. 解決方案：Axios 攔截器與 AbortController

要同時解決這兩個問題，必須在重發請求時，依然保留「取消舊請求」的能力。

```javascript
import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Axios 實例配置
const api = axios.create();

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            // 關鍵：重發時必須帶著原始的 signal，以便在競態發生時被取消
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshAccessToken() // 呼叫後端 Redis 驗證的 Refresh API
          .then((newToken) => {
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            window.location.href = "/login"; // Refresh 也失效則登出
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  },
);
```

---

## 7. TanStack Query vs SWR 實作差異

### 7.1 TanStack Query (推薦做法)

利用內建的 signal 進行自動化處理。

```javascript
const { data } = useQuery({
  queryKey: ["products", page],
  queryFn: ({ signal }) => {
    // TanStack Query 會在 page 改變時自動觸發 signal.abort()
    // 即使請求在 Refresh 佇列中，一旦 signal 中斷，重發就不會執行
    return api.get("/products", { params: { page }, signal });
  },
});
```

### 7.2 SWR

SWR 需要手動結合 `AbortController` 或是透過封裝 `fetcher` 來達成。

```javascript
// 封裝 fetcher
const fetcher = (url, signal) =>
  api.get(url, { signal }).then((res) => res.data);

const { data } = useSWR(`/api/products?page=${page}`, (url) => {
  const controller = new AbortController();
  return fetcher(url, controller.signal);
});
```

### 7.3 TanStack Query vs SWR 特性對比表

| 特性             | TanStack Query                                     | SWR                                           |
| :--------------- | :------------------------------------------------- | :-------------------------------------------- |
| **競態處理**     | 內建 `signal` 注入，自動化程度極高。               | 需手動管理 `AbortController` 或依賴內部快取。 |
| **Refresh 聯動** | 與 `queryKey` 生命週期掛鉤，重發結果會被自動過濾。 | 需要在 `mutate` 層確保請求順序正確。          |
| **適用場景**     | 複雜分頁、過濾、大量異動的後台系統。               | 簡單的數據獲取、較輕量的應用。                |

---

## 8. 最佳實踐總結

### 8.1 核心原則

1. **無感刷新**：使用 Axios 攔截器處理 401 錯誤，讓使用者感覺不到 Token 過期。
2. **競態控制**：結合 AbortController 確保過時請求不會影響當前狀態。
3. **佇列管理**：使用 Promise 佇列處理併發的刷新請求。
4. **自動重發**：Token 刷新成功後自動重發原始請求。

### 8.2 實作建議

#### 選擇 TanStack Query 的理由

- **自動化競態處理**：內建的 signal 機制自動處理請求取消
- **完善的快取機制**：與 Refresh Token 機制完美整合
- **TypeScript 友好**：完整的型別支援
- **豐富的 DevTools**：便於調試複雜的狀態變化

#### 選擇 SWR 的理由

- **輕量級**：較小的 bundle size
- **簡單易用**：學習曲線較平緩
- **靈活性高**：可自訂各種行為

### 8.3 錯誤處理策略

```javascript
// 完整的錯誤處理流程
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    // 1. 嘗試刷新 Token
    return refreshAccessToken()
      .then(() => {
        // 2. 刷新成功，重發原始請求
        return originalRequest;
      })
      .catch(() => {
        // 3. 刷新失敗，導向登入頁
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(new Error("Session expired"));
      });
  }
  return Promise.reject(error);
};
```

### 8.4 效能優化建議

1. **請求去重**：避免重複的刷新請求
2. **快取策略**：合理設定 TanStack Query 的 staleTime 和 cacheTime
3. **預載機制**：在使用者操作前預先刷新可能過期的 Token
4. **監控與日誌**：記錄刷新失敗的情況，便於問題排查

---

## 參考資源

- [TanStack Query 官方文件](https://tanstack.com/query/latest)
- [SWR 官方文件](https://swr.vercel.app/)
- [Axios 攔截器文件](https://axios-http.com/docs/interceptors)
- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

**版本**：1.0  
**最後更新**：2025-01-29  
**適用範圍**：React 18+, Next.js 13+, TanStack Query, SWR
