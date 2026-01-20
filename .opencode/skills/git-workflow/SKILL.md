---
name: git-workflow
description: Git 分支命名與工作流程規範
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: git
---

## 我的功能

- 提供標準化的 Git 分支命名規範
- 確保分支類型、開發者名稱和功能描述的一致性
- 協助團隊遵循最佳的 Git 工作流程

## 何時使用我

在以下情況下使用此技能：

- 建立新的 Git 分支時
- 需要確認分支命名是否符合規範
- 團隊協作需要統一的分支管理策略
- 進行 code review 時檢查分支命名

## 分支命名規範

### 標準格式

```
<type>/<developer-name>/<feature-description>
```

### 分支類型 (type)

- **feat**: 新功能開發
  - 例如: `feat/lip/user-authentication`
  - 用於: 開發全新的功能或特性

- **fix**: 錯誤修復
  - 例如: `fix/lip/login-button-error`
  - 用於: 修復現有功能的 bug

- **refactor**: 程式碼重構
  - 例如: `refactor/lip/optimize-state-management`
  - 用於: 改善程式碼結構，但不改變功能

- **docs**: 文件更新
  - 例如: `docs/lip/update-readme`
  - 用於: 更新專案文件、README、註解等

- **style**: 樣式調整
  - 例如: `style/lip/improve-button-design`
  - 用於: UI/UX 改進、CSS 調整

- **test**: 測試相關
  - 例如: `test/lip/add-unit-tests`
  - 用於: 新增或修改測試

- **chore**: 雜項任務
  - 例如: `chore/lip/update-dependencies`
  - 用於: 依賴更新、建置配置等

### 命名原則

1. **使用小寫字母**: 所有分支名稱使用小寫
2. **使用連字符**: 單詞之間使用 `-` 連接
3. **簡潔明確**: 功能描述應簡短但具描述性
4. **英文命名**: 統一使用英文命名
5. **避免特殊字符**: 只使用字母、數字和連字符

### 實際範例

```bash
# ✅ 正確範例
git checkout -b feat/lip/add-language-selector
git checkout -b fix/lip/fix-search-modal-crash
git checkout -b refactor/lip/improve-jotai-structure
git checkout -b docs/lip/update-api-documentation

# ❌ 錯誤範例
git checkout -b new-feature              # 缺少類型和開發者名稱
git checkout -b feat/AddFeature          # 使用大寫字母
git checkout -b feat/lip/新增功能     # 使用中文
git checkout -b feat-lip-feature      # 格式錯誤
```

## 工作流程

### 1. 建立新分支

```bash
# 從 main 分支建立新分支
git checkout main
git pull origin main
git checkout -b <type>/<name>/<description>
```

### 2. 開發過程

```bash
# 定期提交變更
git add .
git commit -m "feat: implement user authentication"

# 定期同步主分支
git fetch origin main
git rebase origin/main
```

### 3. 準備合併

```bash
# 推送分支到遠端
git push -u origin <branch-name>

# 建立 Pull Request
# 使用 GitHub/GitLab 介面建立 PR
```

### 4. 合併後清理

```bash
# 刪除本地分支
git branch -d <branch-name>

# 刪除遠端分支
git push origin --delete <branch-name>
```

## 提交訊息規範

### 格式

```
<type>: <subject>

<body>

<footer>
```

### 類型 (type)

與分支類型相同: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

### 範例

```bash
# 簡單提交
git commit -m "feat: add language selector component"

# 詳細提交
git commit -m "feat: add language selector component

- Implement dropdown with 5 language options
- Add language persistence to localStorage
- Update i18n configuration

Closes #123"
```

## 注意事項

1. **絕不直接在 main 分支開發**: 永遠從 main 建立新分支
2. **保持分支生命週期短**: 盡快完成並合併分支
3. **定期同步主分支**: 避免合併衝突
4. **使用有意義的名稱**: 讓他人能理解分支目的
5. **一個分支一個功能**: 避免在單一分支混合多個不相關的變更

## 常見問題

### Q: 如何處理長期開發的功能？

A: 建立 feature 分支，定期從 main rebase，完成後再合併。

### Q: 可以在分支名稱中使用 issue 編號嗎？

A: 可以，格式: `feat/lip/add-feature-#123`

### Q: 如何處理緊急修復？

A: 使用 `hotfix` 類型: `hotfix/lip/critical-bug-fix`

## 參考資源

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
