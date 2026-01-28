# React 列表資料 CRUD 同步指南

## 概述

本指南專注於解決列表資料的 CRUD 操作同步問題，提供各種狀態管理方案的完整實作範例和最佳實踐。

---

## 目錄

1. [同步策略決策矩陣](#1-同步策略決策矩陣)
2. [核心狀態控制器](#2-核心狀態控制器)
3. [為什麼「刪除與新增」建議回到第一頁？](#3-為什麼刪除與新增建議回到第一頁)
4. [空頁面處理](#4-空頁面處理)
5. [渲染防護機制](#5-渲染防護機制)
6. [與狀態管理庫整合](#6-與狀態管理庫整合)
7. [混合方案對比](#7-混合方案對比)
8. [開發防護與 QA 檢查清單](#8-開發防護與-qa-檢查清單)

---

## 1. 同步策略決策矩陣

| 策略名稱     | 操作方式                        | 效能表現         | 使用者體驗           | 適用場景                     |
| ------------ | ------------------------------- | ---------------- | -------------------- | ---------------------------- |
| **重新獲取** | 呼叫 API 重新抓取整份列表       | 低（需重新傳輸） | 一般（畫面可能跳動） | 分頁系統、資料結構極度複雜   |
| **局部更新** | 透過 setState 僅修改特定項目    | 高（零網路延遲） | 優（無縫更新）       | 無限捲動、修改單一欄位、刪除 |
| **樂觀更新** | 先假定成功並更新 UI，失敗再回滾 | 極高（立即回饋） | 極優（體感零延遲）   | 按讚、收藏、狀態開關         |

---

## 2. 核心狀態控制器

```javascript
const TableManager = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});

  // 統一抓取資料的函數
  const fetchData = useCallback(
    async (targetPage) => {
      const data = await api.getList({
        page: targetPage,
        ...searchParams,
      });
      setItems(data.list);
      setPage(targetPage);
    },
    [searchParams],
  );

  // 處理刪除與新增 (行為：回第一頁)
  const handleResetAction = async () => {
    await api.executeChange();
    fetchData(1); // 強制回歸第一頁
  };

  // 處理編輯 (行為：留在原頁面)
  const handleUpdateAction = async (id, updatedFields) => {
    await api.updateItem(id, updatedFields);

    // 做法 A：局部更新 (效能最佳，不閃爍)
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item,
      ),
    );

    // 做法 B：原地重新抓取 (若需要後端計算結果)
    // fetchData(page);
  };

  return (
    <Table
      data={items}
      currentPage={page}
      onUpdate={handleUpdateAction}
      onDelete={handleResetAction}
    />
  );
};
```

---

## 3. 為什麼「刪除與新增」建議回到第一頁？

**防範「數據位移漏洞」**：

1. **刪除位移**：
   - 在第 10 頁刪除 1 筆資料
   - 後端的 Offset 會改變
   - 原本應出現在第 11 頁的第 1 筆資料會「跳進」第 10 頁
   - 若不重新整理，使用者會漏看資料

2. **新增位移**：
   - 新資料通常置頂
   - 若在第 10 頁新增，第一頁的資料會往後擠
   - 導致每一頁的資料都發生變動

**解決方案**：透過 `fetchData(1)` 重整全體狀態，是維持資料一致性最穩定且開發成本最低的方案。

---

## 4. 空頁面處理

```javascript
const handleDelete = async (id) => {
  await api.deleteItem(id);

  // 如果刪除後該頁沒有資料了
  if (items.length === 1 && page > 1) {
    // 自動跳轉到上一頁
    fetchData(page - 1);
  } else {
    // 回到第一頁
    fetchData(1);
  }
};
```

---

## 5. 渲染防護機制

### 編輯中的狀態鎖定 (Row Locking)

```javascript
const [editingId, setEditingId] = useState(null);

const handleEdit = async (id, newData) => {
  setEditingId(id); // 鎖定該列

  try {
    await api.updateItem(id, newData);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newData } : item)),
    );
  } finally {
    setEditingId(null); // 解鎖
  }
};

// 在 UI 中禁用正在編輯的列
<TableRow isDisabled={editingId === item.id} />;
```

### 捲動位置保存 (Scroll Anchor)

```javascript
// 使用 key 確保 React 精確 DOM Diffing
{
  items.map((item) => (
    <TableRow
      key={item.id} // 重要：使用唯一 ID
      data={item}
    />
  ));
}
```

### 操作後的反饋 (Feedback)

```javascript
const handleCreate = async (newItem) => {
  await api.createItem(newItem);
  fetchData(1);

  // 顯示成功訊息
  toast.success("新增成功！");

  // 高亮顯示新資料 (3 秒後移除)
  setHighlightId(newItem.id);
  setTimeout(() => setHighlightId(null), 3000);
};
```

---

## 6. 與狀態管理庫整合

### 使用 TanStack Query 管理 CRUD

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TablePage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});

  // 查詢資料
  const { data, isLoading } = useQuery({
    queryKey: ["items", page, searchParams],
    queryFn: () => api.getList({ page, ...searchParams }),
  });

  // 新增 Mutation
  const createMutation = useMutation({
    mutationFn: api.createItem,
    onSuccess: () => {
      // 使所有相關查詢失效，觸發重新獲取
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setPage(1); // 回到第一頁
      toast.success("新增成功！");
    },
  });

  // 更新 Mutation (樂觀更新)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateItem(id, data),
    // 樂觀更新：立即更新 UI
    onMutate: async ({ id, data }) => {
      // 取消進行中的查詢
      await queryClient.cancelQueries({ queryKey: ["items"] });

      // 保存當前資料（用於回滾）
      const previousData = queryClient.getQueryData([
        "items",
        page,
        searchParams,
      ]);

      // 樂觀更新
      queryClient.setQueryData(["items", page, searchParams], (old) => ({
        ...old,
        list: old.list.map((item) =>
          item.id === id ? { ...item, ...data } : item,
        ),
      }));

      return { previousData };
    },
    // 如果失敗，回滾
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["items", page, searchParams],
        context.previousData,
      );
      toast.error("更新失敗！");
    },
    // 無論成功失敗，都重新驗證
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  // 刪除 Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteItem,
    onSuccess: (_, deletedId) => {
      const currentData = queryClient.getQueryData([
        "items",
        page,
        searchParams,
      ]);

      // 如果刪除後該頁沒資料了，且不是第一頁
      if (currentData.list.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setPage(1);
      }

      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("刪除成功！");
    },
  });

  return (
    <div>
      <button onClick={() => createMutation.mutate(newItem)}>新增</button>

      <Table
        data={data?.list || []}
        currentPage={page}
        onUpdate={(id, updatedFields) =>
          updateMutation.mutate({ id, data: updatedFields })
        }
        onDelete={(id) => deleteMutation.mutate(id)}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      <Pagination currentPage={page} onPageChange={setPage} />
    </div>
  );
};
```

**TanStack Query CRUD 優勢**：

- 自動管理 loading 狀態
- 內建樂觀更新與回滾機制
- 自動重試失敗的請求
- 減少樣板代碼

### 使用 Jotai 管理 CRUD 狀態

```javascript
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithQuery, atomWithMutation } from "jotai-tanstack-query";

// 1. 分頁和搜尋參數 atoms
const pageAtom = atom(1);
const searchParamsAtom = atom({});

// 2. 查詢參數組合 atom（衍生 atom）
const queryParamsAtom = atom((get) => ({
  page: get(pageAtom),
  ...get(searchParamsAtom),
}));

// 3. 資料查詢 atom
const itemsQueryAtom = atomWithQuery((get) => {
  const params = get(queryParamsAtom);
  return {
    queryKey: ["items", params],
    queryFn: () => api.getList(params),
  };
});

// 4. UI 狀態 atoms
const editingIdAtom = atom(null);
const highlightIdAtom = atom(null);
const selectedIdsAtom = atom([]);

// 5. Mutation atoms
const createItemMutationAtom = atomWithMutation((get) => ({
  mutationFn: api.createItem,
  onSuccess: () => {
    // 重新獲取資料並回到第一頁
    get(pageAtom);
    set(pageAtom, 1);
  },
}));

// 更新 mutation（樂觀更新）
const updateItemMutationAtom = atomWithMutation((get) => ({
  mutationFn: ({ id, data }) => api.updateItem(id, data),
  onMutate: ({ id }) => {
    // 設定編輯中狀態
    set(editingIdAtom, id);
  },
  onSuccess: () => {
    set(editingIdAtom, null);
  },
  onError: () => {
    set(editingIdAtom, null);
  },
}));

// 刪除 mutation
const deleteItemMutationAtom = atomWithMutation((get) => ({
  mutationFn: api.deleteItem,
  onSuccess: () => {
    const currentPage = get(pageAtom);
    const items = get(itemsQueryAtom).data?.list || [];

    // 如果刪除後該頁沒資料了
    if (items.length === 1 && currentPage > 1) {
      set(pageAtom, currentPage - 1);
    } else {
      set(pageAtom, 1);
    }
  },
}));

// 6. 動作 atoms（寫入專用）
const createItemAtom = atom(null, async (get, set, newItem) => {
  const mutation = get(createItemMutationAtom);
  await mutation.mutate(newItem);

  // 高亮新項目
  set(highlightIdAtom, newItem.id);
  setTimeout(() => set(highlightIdAtom, null), 3000);
});

const updateItemAtom = atom(null, async (get, set, { id, data }) => {
  const mutation = get(updateItemMutationAtom);
  await mutation.mutate({ id, data });
});

const deleteItemAtom = atom(null, async (get, set, id) => {
  const mutation = get(deleteItemMutationAtom);
  await mutation.mutate(id);
});

// 7. 使用
const TablePage = () => {
  // 讀取資料
  const { data, isLoading } = useAtomValue(itemsQueryAtom);

  // 讀取狀態
  const [page, setPage] = useAtom(pageAtom);
  const editingId = useAtomValue(editingIdAtom);
  const highlightId = useAtomValue(highlightIdAtom);
  const selectedIds = useAtomValue(selectedIdsAtom);

  // 獲取動作函數
  const createItem = useSetAtom(createItemAtom);
  const updateItem = useSetAtom(updateItemAtom);
  const deleteItem = useSetAtom(deleteItemAtom);

  return (
    <div>
      <button onClick={() => createItem({ name: "New Item" })}>新增</button>

      <Table
        data={data?.list || []}
        currentPage={page}
        onUpdate={(id, fields) => updateItem({ id, data: fields })}
        onDelete={(id) => deleteItem(id)}
        editingId={editingId}
        highlightId={highlightId}
        selectedIds={selectedIds}
        isLoading={isLoading}
      />

      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
};
```

---

## 7. 混合方案對比

### TanStack Query + Zustand

```javascript
// Zustand 管理 UI 狀態
const useUIStore = create((set) => ({
  editingId: null,
  selectedIds: [],
  viewMode: "grid",
  setEditingId: (id) => set({ editingId: id }),
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),
}));

// TanStack Query 管理資料
const TablePage = () => {
  const { editingId, toggleSelect } = useUIStore();
  const { data } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  return <Table data={data} editingId={editingId} onToggle={toggleSelect} />;
};
```

**適用場景**：

- 中型專案
- 團隊熟悉 TanStack Query
- 需要複雜的快取策略

### TanStack Query + Jotai

```javascript
// Jotai atoms 管理 UI 狀態
const editingIdAtom = atom(null);
const selectedIdsAtom = atom([]);
const viewModeAtom = atom("grid");

// 資料查詢 atom
const itemsQueryAtom = atomWithQuery(() => ({
  queryKey: ["items"],
  queryFn: fetchItems,
}));

// 使用
const TablePage = () => {
  const { data } = useAtomValue(itemsQueryAtom);
  const [editingId, setEditingId] = useAtom(editingIdAtom);
  const [selectedIds, setSelectedIds] = useAtom(selectedIdsAtom);

  return (
    <Table
      data={data}
      editingId={editingId}
      selectedIds={selectedIds}
      onToggle={(id) =>
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        )
      }
    />
  );
};
```

**適用場景**：

- 需要精細的重渲染控制
- 狀態邏輯較複雜
- 喜歡原子化設計

### RTK Query + Redux Toolkit

```javascript
// RTK Query 處理資料
const itemsApi = createApi({
  reducerPath: "itemsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getItems: builder.query({
      query: ({ page, searchParams }) =>
        `items?page=${page}&${new URLSearchParams(searchParams)}`,
      providesTags: ["Items"],
    }),
  }),
});

// Redux slice 處理 UI 狀態
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    editingId: null,
    selectedIds: [],
  },
  reducers: {
    setEditingId: (state, action) => {
      state.editingId = action.payload;
    },
    toggleSelect: (state, action) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
  },
});
```

**適用場景**：

- 大型應用
- 需要嚴格的規範
- 團隊已經在使用 Redux

---

## 混合方案選擇建議

| 專案特徵               | 推薦組合                  | 理由               |
| ---------------------- | ------------------------- | ------------------ |
| **小型（< 10 頁）**    | SWR + Jotai               | 輕量、快速         |
| **中型（10-30 頁）**   | TanStack Query + Jotai    | 平衡功能與複雜度   |
| **中大型（30-50 頁）** | TanStack Query + Zustand  | 成熟穩定、易維護   |
| **大型（> 50 頁）**    | RTK Query + Redux Toolkit | 完整生態、團隊規範 |
| **複雜狀態邏輯**       | TanStack Query + Jotai    | 原子化細粒度控制   |
| **簡單 CRUD**          | SWR + Context             | 無需額外依賴       |

---

## 8. 開發防護與 QA 檢查清單

| 檢查項目         | 關鍵細節                                | 預期結果                             |
| ---------------- | --------------------------------------- | ------------------------------------ |
| **分頁重設**     | 刪除後 `setPage(1)` 是否正確執行？      | 使用者應看見第一頁最新列表           |
| **靜態緩存同步** | 若使用 sessionStorage，是否已同步更新？ | 重新整理後不應回到已刪除資料的舊分頁 |
| **空頁面處理**   | 刪除該頁最後一筆資料時的處理            | 應自動跳轉至 `page - 1`              |
| **API 競態防護** | fetchData 前是否加上 AbortController？  | 防止舊 API 回傳覆蓋新資料            |

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
