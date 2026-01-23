# 🤝 貢獻指南

感謝您對 MarioKartWorldParams 專案的興趣！我們歡迎所有形式的貢獻，包括但不限於代碼、文檔、測試、翻譯和設計。

---

## 📋 目錄

- [開始之前](#開始之前)
- [如何貢獻](#如何貢獻)
- [開發流程](#開發流程)
- [代碼規範](#代碼規範)
- [測試要求](#測試要求)
- [文檔貢獻](#文檔貢獻)
- [翻譯貢獻](#翻譯貢獻)
- [問題回報](#問題回報)
- [社群準則](#社群準則)

---

## 🚀 開始之前

### 前置要求

- **Node.js**：18.0 或更高版本
- **pnpm**：8.0 或更高版本
- **Git**：熟悉基本 Git 操作
- **TypeScript**：了解基礎 TypeScript 語法
- **React/Next.js**：有基礎了解更佳

### 開發環境設置

1. **Fork 專案**

   ```bash
   # 在 GitHub 上 Fork 專案，然後克隆你的 Fork
   git clone https://github.com/YOUR_USERNAME/MarioKartWorldParams.git
   cd MarioKartWorldParams
   ```

2. **安裝依賴**

   ```bash
   pnpm install
   ```

3. **啟動開發伺服器**

   ```bash
   pnpm dev
   ```

4. **驗證環境**
   ```bash
   # 確保所有工具正常運行
   pnpm build
   pnpm lint
   pnpm typecheck
   ```

---

## 🔄 如何貢獻

### 1. 選擇貢獻類型

#### 🐛 Bug 修復

- 查看 [Issues](https://github.com/Ponpon55837/MarioKartWorldParams/issues) 標記為 "bug"
- 回應你想要修復的 Issue
- 開始修復工作

#### ✨ 新功能

- 查看 [Issues](https://github.com/Ponpon55837/MarioKartWorldParams/issues) 標記為 "enhancement"
- 或開新的 Issue 描述新功能想法
- 等待維護者審核和批准

#### 📚 文檔改進

- 發現文檔錯誤或不足
- 直接提出改進建議
- 或直接提交文檔 PR

#### 🌐 翻譯貢獻

- 查看現有語言支援
- 提出新語言翻譯
- 改進現有翻譯品質

---

## 🔧 開發流程

### 1. 建立分支

遵循分支命名規範：

```bash
# 功能開發
git checkout -b feat/username/feature-description

# Bug 修復
git checkout -b fix/username/bug-description

# 文檔更新
git checkout -b docs/username/documentation-updates

# 重構
git checkout -b refactor/username/code-refactoring
```

### 2. 開發階段

- **單一功能原則**：每個分支只處理一個功能或 bug
- **小步提交**：頻繁提交，清晰的提交訊息
- **測試先行**：先寫測試，再實現功能
- **遵循規範**：遵守項目代碼規範

### 3. 提交規範

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```bash
# 功能
feat: 新增使用者個人設定功能

# Bug 修復
fix: 修復搜尋結果顯示錯誤

# 文檔
docs: 更新 API 文檔說明

# 樣式
style: 調整按鈕顏色和間距

# 重構
refactor: 優化推薦算法效能

# 測試
test: 新增搜尋功能單元測試

# 雜項
chore: 更新依賴套件版本
```

### 4. 測試要求

在提交 PR 前確保：

```bash
# 所有測試通過
pnpm test

# 代碼檢查通過
pnpm lint

# 類型檢查通過
pnpm typecheck

# 建置成功
pnpm build
```

### 5. 提交 PR

1. **推送分支**

   ```bash
   git push -u origin branch-name
   ```

2. **建立 Pull Request**
   - 使用清晰的標題
   - 詳細描述變更內容
   - 引用相關 Issues
   - 添加測試說明

3. **PR 模板**

   ```markdown
   ## 📝 變更描述

   簡要描述本次變更的內容和目的

   ## 🔗 相關 Issues

   - Fixes #123
   - Related #456

   ## 🧪 測試

   - [ ] 單元測試通過
   - [ ] 整合測試通過
   - [ ] 手動測試完成
   - [ ] 無障礙性測試通過

   ## 📸 截圖

   如有 UI 變更，請提供前後對比截圖

   ## 📋 檢查清單

   - [ ] 代碼遵循專案規範
   - [ ] 提交訊息符合規範
   - [ ] 已添加適當的測試
   - [ ] 文檔已更新
   - [ ] 已測試無障礙性
   ```

---

## 📏 代碼規範

### TypeScript

```typescript
// ✅ 好的範例
interface UserStats {
  id: string;
  name: string;
  level: number;
}

async function getUserStats(userId: string): Promise<UserStats> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${userId}`);
  }
  return response.json();
}

// ❌ 避免
function getUser(userId) {
  // 缺少類型定義
  return fetch("/users/" + userId); // 字串拼接
}
```

### React 組件

```tsx
// ✅ 好的範例
interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchComponent({ onSearch, placeholder }: SearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} role="search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="搜尋"
      />
    </form>
  );
}

// ❌ 避免
export function Search({ onSearch }) {
  return <input onChange={(e) => onSearch(e.target.value)} />;
}
```

### 樣式規範

```tsx
// ✅ 使用 Tailwind 類別
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">標題</h2>
</div>

// ❌ 避免 inline 樣式
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'white' }}>
  <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>標題</h2>
</div>
```

---

## 🧪 測試要求

### 測試策略

1. **單元測試**：測試獨立函數和組件
2. **整合測試**：測試多個組件協作
3. **E2E 測試**：測試完整用戶流程

### 測試範例

```typescript
// 單元測試
describe('calculateRecommendations', () => {
  it('should return correct recommendations for given stats', () => {
    const character = { speed: 10, acceleration: 5 };
    const vehicle = { speed: 7, acceleration: 8 };

    const result = calculateRecommendations(character, vehicle);

    expect(result.score).toBeGreaterThan(0);
    expect(result.combination).toBeDefined();
  });
});

// 組件測試
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchComponent } from './SearchComponent';

describe('SearchComponent', () => {
  it('should call onSearch when form is submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchComponent onSearch={mockOnSearch} />);

    fireEvent.change(screen.getByLabelText('搜尋'), {
      target: { value: 'test query' }
    });
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }));

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });
});
```

---

## 📚 文檔貢獻

### 類型

1. **API 文檔**：自動生成和手動編寫
2. **組件文檔**：使用 JSDoc 註釋
3. **用戶指南**：使用手冊和教程
4. **開發者文檔**：架構說明和貢獻指南

### 文檔格式

````markdown
# 組件名稱

## 描述

簡要描述組件的功能和用途

## Props

| Prop     | 類型                    | 預設值 | 描述         |
| -------- | ----------------------- | ------ | ------------ |
| onSearch | (query: string) => void | -      | 搜尋回調函數 |

## 範例

```tsx
<SearchComponent onSearch={handleSearch} placeholder="輸入關鍵字" />
```
````

## 注意事項

- 重要的使用注意事項
- 相關的訪問性考量

````

---

## 🌐 翻譯貢獻

### 支援語言

- 繁體中文 (zh-TW) - 主要語言
- 簡體中文 (zh-CN)
- 英文 (en)
- 日文 (ja)
- 韓文 (ko)

### 新增語言步驟

1. **建立語言檔案**
   ```bash
   cp src/i18n/locales/zh-TW.json src/i18n/locales/your-lang.json
````

2. **翻譯內容**
   - 翻譯所有鍵值對
   - 保持鍵名不變
   - 注意上下文語義

3. **更新配置**

   ```typescript
   // src/i18n/config.ts
   export const SUPPORTED_LANGUAGES = [
     "zh-TW",
     "zh-CN",
     "en",
     "ja",
     "ko",
     "your-lang", // 新增語言
   ] as const;
   ```

4. **測試翻譯**
   - 檢查所有頁面顯示
   - 確認文字長度適中
   - 測試語言切換功能

---

## 🐛 問題回報

### Bug 回報格式

使用 Issue 模板：

```markdown
## 🐛 Bug 描述

清楚簡潔地描述問題

## 🔄 重現步驟

1. 前往 '...'
2. 點擊 '....'
3. 滾動到 '....'
4. 看到錯誤

## 📱 環境資訊

- 作業系統：[例如 iOS]
- 瀏覽器：[例如 chrome]
- 版本：[例如 22]

## 📸 預期行為

描述你期望發生的情況

## 📸 實際行為

描述實際發生的情況

## 📸 截圖

如果適用，添加截圖來幫助解釋問題
```

### 功能請求格式

```markdown
## ✨ 功能描述

清楚簡潔地描述你想要的的功能

## 💡 解決的問題

這個功能解決什麼問題？

## 🎯 替代方案

描述你考慮過的替代方案

## 📝 額外上下文

添加任何其他相關資訊或截圖
```

---

## 🤖 社群準則

### 我們的價值觀

- **尊重**：尊重所有參與者，保持友善
- **包容**：歡迎不同背景的貢獻者
- **協作**：鼓勵協作和知識分享
- **品質**：追求高品質的代碼和文檔
- **學習**：支持彼此學習和成長

### 行為準則

#### ✅ 鼓勵的行為

- 提供建設性回饋
- 幫助新貢獻者入門
- 分享有用的資源
- 承認錯誤並學習
- 專注於問題本身

#### ❌ 不當行為

- 使用攻擊性語言
- 個人攻擊或騷擾
- 公開或私下騷擾
- 發布他人私人資訊
- 未經許可發布商業宣傳

### 衝突解決

1. **直接溝通**：首先嘗試直接溝通解決
2. **尋求協調**：可尋求維護者協調
3. **正式投訴**：嚴重問題聯繫專案維護者
4. **社群投票**：重大決策由社群投票決定

---

## 🎉 認可貢獻者

我們使用 [All Contributors](https://allcontributors.org/) 規範來認可所有類型的貢獻：

- 💻 代碼貢獻
- 📖 文檔貢獻
- 🌐 翻譯貢獻
- 🐛 Bug 報告
- 💡 想法建議
- 🤔 問題回應
- 🎨 設計貢獻
- 📢 推廣貢獻

### 添加貢獻者

```bash
# 為代碼貢獻者添加
npx all-contributors add @username code

# 為文檔貢獻者添加
npx all-contributors add @username doc

# 為多種貢獻添加
npx all-contributors add @username code,doc,bug
```

---

## 📞 聯繫方式

- **Issues**：[GitHub Issues](https://github.com/Ponpon55837/MarioKartWorldParams/issues)
- **Discussions**：[GitHub Discussions](https://github.com/Ponpon55837/MarioKartWorldParams/discussions)
- **Email**：專案維護者信箱

---

## 📄 授權

貢獻者需同意將貢獻內容以相同授權條款發布（MIT License）。

---

**感謝您的貢獻！🎉**

_最後更新：2025-01-22_
