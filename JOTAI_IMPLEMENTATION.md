# 🚀 Jotai 全域狀態管理實現

## 📋 概述

將原本的 React 本地狀態管理升級為使用 Jotai 的全域狀態管理系統，提升應用程式性能並實現用戶組合的本地持久化。

## ✨ 主要改進

### 1. 🔧 全域狀態管理
- **之前**: 每個頁面切換都會重新載入 CSV 資料
- **現在**: 資料載入一次後存儲在全域狀態中，頁面切換零延遲

### 2. 💾 持久化儲存
- **之前**: 用戶組合只存在於記憶體，重新整理會消失
- **現在**: 使用 `atomWithStorage` 自動將組合儲存到 localStorage

### 3. ⚡ 性能優化
- **減少重複載入**: CSV 檔案只載入一次
- **智能計算**: 使用 Jotai 的 derived atoms 進行依賴追蹤
- **自動優化**: Jotai 自動處理 re-render 優化

## 🏗️ 架構設計

### 核心文件結構

```
src/
├── store/
│   └── atoms.ts                    # Jotai atoms 定義
├── providers/
│   └── JotaiProvider.tsx          # Provider 組件
├── hooks/
│   └── useMarioKartStore.ts       # 自定義 hooks
└── components/
    └── TestPersistence.tsx        # 持久化測試工具
```

### Atoms 設計

#### 基礎資料 Atoms
- `charactersAtom` - 角色資料
- `vehiclesAtom` - 載具資料
- `loadingAtom` - 載入狀態
- `errorAtom` - 錯誤狀態

#### 過濾狀態 Atoms
- `sortByAtom` - 排序方式
- `speedFilterAtom` - 速度過濾
- `handlingFilterAtom` - 操控過濾
- `currentPageAtom` - 當前頁面

#### 持久化 Atoms
- `combinationsAtom` - 用戶組合 (localStorage)

#### 計算 Atoms
- `maxStatsAtom` - 最大數值計算
- `sortedCharactersAtom` - 排序後的角色
- `sortedVehiclesAtom` - 排序後的載具

#### 操作 Atoms
- `loadDataAtom` - 資料載入操作
- `addCombinationAtom` - 新增組合操作
- `removeCombinationAtom` - 移除組合操作

## 🔍 使用方式

### 主要 Hook
```typescript
const {
  loading,
  error,
  characters,
  vehicles,
  maxStats,
  sortedCharacters,
  sortedVehicles,
  sortBy,
  setSortBy,
  speedFilter,
  setSpeedFilter,
  handlingFilter,
  setHandlingFilter,
  currentPage,
  setCurrentPage,
  combinations,
  addCombination,
  removeCombination,
  clearAllCombinations,
} = useMarioKartStore();
```

### 專用 Hooks
```typescript
// 只需要基本資料
const { loading, error, characters, vehicles } = useMarioKartData();

// 只需要過濾功能
const { sortBy, setSortBy, speedFilter, setSpeedFilter } = useFilters();

// 只需要組合管理
const { combinations, addCombination, removeCombination } = useCombinations();
```

## 💾 持久化機制

### localStorage 鍵值
- `mario-kart-combinations` - 用戶組合資料

### 資料格式
```json
[
  {
    "id": "瑪利歐-標準車-1642089600000",
    "character": { /* 角色資料 */ },
    "vehicle": { /* 載具資料 */ },
    "combinedStats": { /* 組合統計 */ }
  }
]
```

### 自動儲存時機
- 新增組合時自動儲存
- 移除組合時自動儲存
- 清除所有組合時自動儲存

## 🧪 測試功能

### 持久化測試工具
位於 `/admin` 頁面，提供：
- 測試組合的建立
- localStorage 狀態檢查
- 持久化功能驗證

### 開發工具
- **Jotai DevTools**: 開發模式下自動啟用
- **狀態檢視**: 即時查看 atoms 狀態變化
- **時間旅行**: 調試狀態變更歷史

## ⚡ 性能對比

### 之前 (React 本地狀態)
1. 切換到角色頁面 → 載入 CSV (200ms)
2. 切換到載具頁面 → 重新載入 CSV (200ms)
3. 切換到組合頁面 → 再次載入 CSV (200ms)
4. 重新整理 → 用戶組合消失

### 現在 (Jotai 全域狀態)
1. 初次載入 → 載入 CSV (200ms)
2. 切換到任何頁面 → 即時切換 (0ms)
3. 資料在記憶體中共享
4. 重新整理 → 用戶組合自動恢復

## 🔮 未來擴展

### 可能的改進
- [ ] 添加離線支援
- [ ] 實現資料版本控制
- [ ] 添加用戶偏好設定持久化
- [ ] 實現跨設備同步 (Cloud Storage)
- [ ] 添加效能監控和分析

### 其他 Atoms
- 用戶偏好設定 (主題、語言等)
- 瀏覽歷史
- 收藏的角色/載具
- 自定義排序偏好

## 📊 技術細節

### 依賴套件
```json
{
  "jotai": "^2.12.5",
  "jotai-devtools": "^0.12.0"
}
```

### Bundle 大小影響
- Jotai: ~15KB (gzipped ~5KB)
- DevTools: 僅開發模式使用
- 整體影響: 微小，性能提升明顯

### 瀏覽器支援
- 支援所有現代瀏覽器
- localStorage API 普遍支援
- 無需額外 polyfills

## 🐛 故障排除

### 常見問題

1. **組合沒有持久化**
   - 檢查瀏覽器是否支援 localStorage
   - 確認沒有無痕模式
   - 檢查控制台錯誤

2. **狀態不同步**
   - 確認 JotaiProvider 正確包裝
   - 檢查是否有多個 Provider 實例

3. **性能問題**
   - 使用 Jotai DevTools 檢查 atoms 更新頻率
   - 確認沒有不必要的 atom 訂閱

### 調試技巧
- 使用 `console.log` 在 atoms 中調試
- 利用 DevTools 查看狀態變化
- 檢查 localStorage 內容
