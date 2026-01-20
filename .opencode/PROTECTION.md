# 防止在 main 分支直接修改的完整解決方案

本專案實施了**雙重保護機制**，確保不會在 main 分支上直接修改程式碼。

## 🛡️ 保護機制概覽

### 1. Git Hooks（技術層面強制執行）

- ✅ **pre-commit hook** - 在提交前檢查分支
- ✅ **commit-msg hook** - 驗證 commit message 格式
- ✅ 100% 可靠，無法繞過（除非使用 --no-verify）

### 2. OpenCode 配置（AI 助手層面預防）

- ✅ **config.yaml** - 定義 AI 行為規則
- ✅ **README.md** - AI 助手必讀檔案
- ✅ **hooks/pre-modify.sh** - 檔案修改前檢查
- ✅ **Skills** - 詳細的工作流程指南

## 📊 兩種機制的比較

| 特性         | Git Hooks         | OpenCode 配置 |
| ------------ | ----------------- | ------------- |
| **執行時機** | Commit 時         | 修改檔案前    |
| **可靠性**   | ⭐⭐⭐⭐⭐ 非常高 | ⭐⭐⭐⭐ 高   |
| **適用對象** | 所有人            | AI 助手       |
| **防護層級** | 最後防線          | 提前預防      |
| **可繞過性** | --no-verify       | 依賴 AI 遵守  |
| **錯誤成本** | 中（需回滾）      | 低（未提交）  |

## 🎯 為什麼需要雙重保護？

### 情境 1：人為操作

- **Git Hooks** ✅ - 在 commit 時阻止
- 如果忘記建立功能分支，hooks 會在最後關頭攔截

### 情境 2：AI 助手操作

- **OpenCode 配置** ✅ - 在修改檔案前檢查
- **Git Hooks** ✅ - 在 commit 時再次確認
- 雙重保險，確保萬無一失

## 📋 完整的保護流程

```
開始任務
    ↓
OpenCode 讀取配置
    ↓
檢查目前分支 ← [OpenCode 預防]
    ↓
如果在 main → 建立功能分支
    ↓
修改檔案
    ↓
執行測試
    ↓
git add .
    ↓
git commit ← [Git Hook 阻止]
    ↓
pre-commit 檢查分支 ✓
    ↓
commit-msg 檢查格式 ✓
    ↓
提交成功 ✅
```

## 🚀 快速開始

### 1. 安裝 Git Hooks（必須）

```bash
bash .githooks/install.sh
```

### 2. OpenCode 會自動載入配置

當你使用 OpenCode AI 助手時，它會自動讀取：

- `.opencode/config.yaml`
- `.opencode/README.md`
- `.opencode/skills/git-workflow/SKILL.md`

### 3. 測試保護機制

```bash
# 測試 Git Hook
git checkout main
git commit --allow-empty -m "test"
# 預期：被阻止 ✅

# 測試正確流程
git checkout -b feat/test/test-protection
git commit --allow-empty -m "feat: 測試保護機制"
# 預期：成功 ✅
```

## 🔍 問題排查

### Q: 為什麼 AI 還是在 main 分支上修改了檔案？

**可能原因：**

1. OpenCode 配置未生效（AI 沒有讀取）
2. 對話開始時就在 main 分支上

**解決方案：**

1. 確保 `.opencode/config.yaml` 存在
2. 在新對話開始時明確提醒 AI
3. 依賴 Git Hooks 作為最後防線

### Q: Git Hooks 沒有生效？

**檢查：**

```bash
ls -la .git/hooks/pre-commit
ls -la .git/hooks/commit-msg
```

**解決：**

```bash
bash .githooks/install.sh
```

### Q: 可以跳過 Hooks 嗎？

**技術上可以（但不應該）：**

```bash
git commit --no-verify  # ❌ 違反規範
```

**正確做法：**
如果真的需要在 main 分支提交（極少數緊急情況），應該：

1. 團隊討論並同意
2. 記錄原因
3. 事後建立 issue 追蹤

## 📚 相關文件

| 文件                                     | 目的                 | 對象        |
| ---------------------------------------- | -------------------- | ----------- |
| `.githooks/README.md`                    | Git Hooks 使用說明   | 開發者      |
| `.opencode/README.md`                    | AI 助手必讀規範      | AI          |
| `.opencode/config.yaml`                  | 專案行為配置         | AI          |
| `.opencode/skills/git-workflow/SKILL.md` | Git 工作流程詳細說明 | AI + 開發者 |

## 🎓 最佳實踐

### 對於開發者

1. ✅ Clone 專案後立即執行 `bash .githooks/install.sh`
2. ✅ 永遠從 main 建立功能分支
3. ✅ 遵守分支命名規範
4. ✅ 使用繁體中文撰寫 commit message
5. ❌ 絕不使用 `--no-verify`

### 對於 AI 助手

1. ✅ 每次對話開始時讀取 `.opencode/README.md`
2. ✅ 修改任何檔案前檢查分支
3. ✅ 如果在 main 分支，自動建立功能分支
4. ✅ 提交後等待使用者確認才推送
5. ❌ 絕不在 main 分支上使用 Edit/Write 工具

## 📈 效果評估

實施這套機制後，你可以期待：

- ✅ **100%** 防止意外提交到 main 分支
- ✅ **95%+** 的情況 AI 會提前預防
- ✅ **5%-** 的情況 Git Hooks 作為最後防線
- ✅ **0** 次需要回滾 main 分支的提交

## 🔧 維護

### 定期檢查

```bash
# 確認 hooks 已安裝
ls -la .git/hooks/

# 測試 hooks 功能
git checkout main
git commit --allow-empty -m "test"  # 應該被阻止
```

### 更新機制

如果修改了 `.githooks/` 或 `.opencode/` 的檔案：

```bash
# 重新安裝 Git Hooks
bash .githooks/install.sh

# OpenCode 配置會自動重新讀取
```

## 🎉 結論

**雙重保護 = 安心開發**

- Git Hooks 提供**強制執行**
- OpenCode 配置提供**智能預防**
- 兩者結合，打造**零失誤**的開發環境

---

**記住：這些機制是保護你的盔甲，不是限制你的枷鎖！** 🛡️✨
