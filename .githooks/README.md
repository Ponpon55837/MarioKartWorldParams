# Git Hooks 說明

本目錄包含專案的 Git hooks，用於自動檢查和防止違反專案規範的操作。

## 📋 包含的 Hooks

### 1. `pre-commit`

**執行時機**：在執行 `git commit` 之前

**檢查項目**：

- ❌ **阻止**在 `main` 或 `master` 分支直接提交
- ⚠️ **警告**分支命名不符合規範
- ✅ 確保所有提交都在功能分支上進行

**錯誤範例**：

```bash
$ git checkout main
$ git commit -m "feat: 新增功能"

🚫 錯誤：禁止在 main 分支直接提交程式碼！
```

### 2. `commit-msg`

**執行時機**：在 commit message 寫入後、提交完成前

**檢查項目**：

- ❌ **阻止**不符合格式的 commit message
- ⚠️ **警告**冒號後沒有空格
- ⚠️ **警告**描述過短（少於 5 個字元）

**正確格式**：

```
<type>: <描述>
```

**可用的類型**：

- `feat` - 新功能
- `fix` - Bug 修復
- `refactor` - 程式碼重構
- `docs` - 文件更新
- `style` - 樣式調整
- `test` - 測試相關
- `chore` - 雜項任務
- `hotfix` - 緊急修復

**正確範例**：

```bash
git commit -m "feat: 新增語言選擇器元件"
git commit -m "fix: 修正登入按鈕無反應問題"
git commit -m "docs: 更新 README 安裝說明"
```

**錯誤範例**：

```bash
git commit -m "add feature"          # ❌ 缺少類型前綴
git commit -m "feat:新增功能"         # ❌ 冒號後沒有空格
git commit -m "feat: add"            # ⚠️ 描述過短
```

## 🚀 安裝

### 首次使用或重新安裝

在專案根目錄執行：

```bash
bash .githooks/install.sh
```

### 自動安裝（建議）

將以下內容加入 `package.json` 的 `scripts`：

```json
{
  "scripts": {
    "postinstall": "bash .githooks/install.sh || true"
  }
}
```

這樣每次執行 `pnpm install` 時會自動安裝 hooks。

## 🧪 測試

### 測試 pre-commit hook

```bash
# 1. 切換到 main 分支
git checkout main

# 2. 嘗試提交（應該被阻止）
git commit --allow-empty -m "test"

# 預期結果：看到錯誤訊息，提交被阻止 ✅
```

### 測試 commit-msg hook

```bash
# 1. 建立測試分支
git checkout -b feat/test/test-hooks

# 2. 測試錯誤格式（應該被阻止）
git commit --allow-empty -m "test"

# 預期結果：看到格式錯誤訊息 ✅

# 3. 測試正確格式（應該成功）
git commit --allow-empty -m "feat: 測試 commit message 格式"

# 預期結果：成功提交 ✅
```

## 🛡️ 保護機制

這些 hooks 提供以下保護：

| 保護項目                | Hook       | 嚴重程度 | 行為       |
| ----------------------- | ---------- | -------- | ---------- |
| 在 main 分支提交        | pre-commit | ❌ 錯誤  | 阻止提交   |
| 分支命名不規範          | pre-commit | ⚠️ 警告  | 允許但警告 |
| Commit message 格式錯誤 | commit-msg | ❌ 錯誤  | 阻止提交   |
| 冒號後沒空格            | commit-msg | ⚠️ 警告  | 允許但警告 |
| 描述過短                | commit-msg | ⚠️ 警告  | 允許但警告 |

## ⚠️ 重要注意事項

### 不要跳過 Hooks！

雖然可以使用 `--no-verify` 跳過 hooks：

```bash
git commit --no-verify -m "bypassing hooks"  # ❌ 不要這樣做！
```

**但這樣做會：**

- ❌ 違反專案規範
- ❌ 可能導致程式碼被推送到 main 分支
- ❌ 讓團隊其他成員困擾
- ❌ 破壞專案的保護機制

**唯一例外**：
在極少數緊急情況下，經過團隊討論同意後才可使用。

### 配合 OpenCode 使用

如果你使用 OpenCode AI 助手：

1. Git hooks 提供**最後防線**，在 commit 時阻止錯誤
2. `.opencode/config.yaml` 提供**提前預防**，在修改檔案前就檢查
3. 兩者配合使用，提供雙重保護

## 🔧 維護

### 更新 Hooks

如果修改了 `.githooks/` 中的檔案，需要重新安裝：

```bash
bash .githooks/install.sh
```

### 檢查 Hooks 是否已安裝

```bash
ls -la .git/hooks/pre-commit
ls -la .git/hooks/commit-msg
```

如果檔案存在且可執行，表示已正確安裝。

### 移除 Hooks（不建議）

```bash
rm .git/hooks/pre-commit
rm .git/hooks/commit-msg
```

## 📚 相關文件

- `.opencode/README.md` - OpenCode AI 助手規範
- `.opencode/skills/git-workflow/SKILL.md` - Git 工作流程詳細說明
- `.opencode/config.yaml` - 專案配置

## 💡 常見問題

### Q: 為什麼需要這些 hooks？

A: 防止在 main 分支直接提交是專案的核心規範，hooks 提供技術手段強制執行這個規範，避免人為錯誤。

### Q: Hooks 會影響效能嗎？

A: 不會。這些 hooks 執行時間不到 0.1 秒，不會影響開發體驗。

### Q: 如果 hooks 有 bug 怎麼辦？

A: 可以暫時移除有問題的 hook，但請立即報告問題並盡快修復。

### Q: AI 助手也會受到 hooks 影響嗎？

A: 是的！任何透過 `git commit` 的操作都會觸發 hooks，包括 AI 助手執行的提交。這就是為什麼需要配合 `.opencode/config.yaml` 提前預防。

### Q: 新成員加入專案需要做什麼？

A: Clone 專案後執行：

```bash
pnpm install  # 會自動安裝 hooks（如果有設定 postinstall）
# 或手動執行
bash .githooks/install.sh
```

## 🎯 最佳實踐

1. **首次 clone 專案後立即安裝 hooks**
2. **定期執行測試確保 hooks 正常運作**
3. **絕不使用 `--no-verify` 跳過檢查**
4. **如果發現 hooks 有問題，立即報告**
5. **定期更新 hooks（執行 install.sh）**

---

**記住：這些 hooks 是保護你的朋友，不是阻礙你的敵人！** 🛡️
