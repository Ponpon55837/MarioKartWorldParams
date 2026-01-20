# GitHub Branch Protection 設定指南

本文檔說明如何在 GitHub 上設定 `main` 分支保護，防止直接推送到 main 分支。

---

## 🎯 目的

在本地 Git hooks 的基礎上，添加遠端層級的保護，確保：

- 所有變更都必須通過 Pull Request
- 無法直接 push 到 main 分支
- 可選：需要 code review 才能合併

---

## 📋 設定步驟

### 1. 前往 Repository Settings

1. 打開你的 GitHub Repository
2. 點擊右上角的 **Settings** 標籤
3. 在左側選單中找到 **Branches**

### 2. 新增 Branch Protection Rule

1. 點擊 **Add rule** 或 **Add branch protection rule**
2. 在 **Branch name pattern** 中輸入：`main`

### 3. 基本保護設定（必選）

勾選以下選項：

#### ✅ Require a pull request before merging

- 強制所有變更都必須通過 PR
- **Require approvals**: 建議設定至少 1 個審核者
- **Dismiss stale pull request approvals when new commits are pushed**: 當有新 commit 時，重新要求審核

#### ✅ Require status checks to pass before merging

- 如果有 CI/CD 設定，可以要求測試通過才能合併
- **Require branches to be up to date before merging**: 確保分支是最新的

#### ✅ Require conversation resolution before merging

- 要求所有 PR 討論都已解決

#### ✅ Do not allow bypassing the above settings

- 防止管理員繞過規則（建議勾選）

### 4. 進階保護設定（可選）

#### 🔒 Restrict who can push to matching branches

- 限制誰可以推送到 main
- 建議：不允許任何人直接推送

#### 📝 Require signed commits

- 要求所有 commit 都經過 GPG 簽名（較嚴格）

#### 🔐 Require linear history

- 強制使用 rebase 或 squash merge（保持歷史線性）

---

## 🖼️ 建議設定截圖

```
[Branch Protection Rule for main]

☑️ Require a pull request before merging
   ☑️ Require approvals: 1
   ☑️ Dismiss stale pull request approvals when new commits are pushed
   ☐ Require review from Code Owners

☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   Status checks: (如果有 CI/CD，選擇需要通過的檢查)

☑️ Require conversation resolution before merging

☐ Require signed commits

☐ Require linear history

☑️ Do not allow bypassing the above settings

☐ Restrict who can push to matching branches
   (建議不允許任何人直接推送)

☐ Allow force pushes
☐ Allow deletions
```

---

## 🧪 測試設定

設定完成後，測試是否生效：

```bash
# 1. 切換到 main 分支
git checkout main

# 2. 做一些修改
echo "test" >> test.txt
git add test.txt
git commit -m "test: 測試分支保護"

# 3. 嘗試推送（應該會被拒絕）
git push origin main
```

**預期結果**：

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To https://github.com/Ponpon55837/Lucky50.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/Ponpon55837/Lucky50.git'
```

---

## ✅ 正確的工作流程

設定分支保護後，正確的流程是：

```bash
# 1. 從 main 建立新分支
git checkout main
git pull origin main
git checkout -b feat/lip/new-feature

# 2. 開發並提交
git add .
git commit -m "feat: 新增功能"

# 3. 推送到遠端
git push -u origin feat/lip/new-feature

# 4. 在 GitHub 上建立 Pull Request

# 5. 等待 code review 和 CI 檢查通過

# 6. 合併 PR（在 GitHub 上操作）

# 7. 更新本地 main
git checkout main
git pull origin main

# 8. 刪除本地功能分支
git branch -d feat/lip/new-feature
```

---

## 🔓 緊急情況處理

### 如果需要緊急修復

即使有分支保護，仍應遵循流程：

```bash
# 1. 建立 hotfix 分支
git checkout -b hotfix/lip/critical-fix

# 2. 修復並提交
git add .
git commit -m "fix: 緊急修復關鍵問題"

# 3. 推送
git push -u origin hotfix/lip/critical-fix

# 4. 建立 PR 並標註為緊急
# 5. 快速 review 後合併
```

### 臨時停用保護（不建議）

如果確實需要（例如倉庫管理員進行維護）：

1. 前往 Settings → Branches
2. 點擊 main 的 Branch protection rule
3. 暫時取消勾選某些規則
4. **完成後立即重新啟用**

---

## 🤝 團隊溝通

設定分支保護後，需要通知團隊：

### 📢 通知範本

```markdown
## 🔒 Main 分支保護已啟用

從現在開始，`main` 分支已啟用保護，無法直接推送。

**變更**：

- ✅ 所有變更必須通過 Pull Request
- ✅ 需要至少 1 位審核者批准
- ✅ CI 測試必須通過
- ❌ 無法直接 push 到 main

**正確流程**：

1. 建立功能分支
2. 開發並 push
3. 建立 PR
4. 等待 review
5. 合併 PR

**相關文檔**：

- `.githooks/README.md` - Git Hooks 說明
- `AGENTS.md` - 專案規則
```

---

## 📊 保護層級總結

| 層級 | 機制              | 阻止時機   | 繞過方式      | 強度       |
| ---- | ----------------- | ---------- | ------------- | ---------- |
| 1    | AGENTS.md         | AI 操作前  | AI 忽略       | ⭐⭐⭐     |
| 2    | Skills            | AI 操作前  | AI 忽略       | ⭐⭐⭐     |
| 3    | Git Hooks         | 本地提交時 | `--no-verify` | ⭐⭐⭐⭐   |
| 4    | Branch Protection | 遠端推送時 | 管理員權限    | ⭐⭐⭐⭐⭐ |

**建議**：啟用所有層級以獲得最佳保護效果。

---

## 📚 參考資源

- [GitHub Branch Protection 官方文檔](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)

---

**最後更新**：2026-01-20
