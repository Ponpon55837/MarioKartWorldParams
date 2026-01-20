# OpenCode AI 助手 - 專案規範

> 🤖 此文件是 OpenCode AI 助手的**必讀檔案**  
> 在執行任何操作前，AI 必須先閱讀並遵守以下規範

---

## 🚨 關鍵規則（Critical Rules）

### 1. Git 分支管理 - 最高優先級

**在執行任何檔案修改操作前，必須執行以下檢查：**

```bash
# 步驟 1: 檢查目前分支
CURRENT_BRANCH=$(git branch --show-current)

# 步驟 2: 判斷是否在主分支
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "❌ 錯誤：不可在主分支上修改檔案"
    echo "✅ 操作：建立新的功能分支"
    git checkout -b <type>/<name>/<description>
fi
```

#### 禁止操作清單

❌ **絕對不可以**在 `main` 或 `master` 分支上：

- 修改任何檔案
- 新增任何檔案
- 刪除任何檔案
- 執行 `git add`
- 執行 `git commit`
- 使用 Edit、Write 工具

#### 強制流程

✅ **必須**遵守的流程：

1. **檢查分支**

   ```bash
   git branch --show-current
   ```

2. **如果在 main，立即建立功能分支**

   ```bash
   git checkout -b feat/<name>/<description>
   ```

3. **在功能分支上進行修改**

4. **測試變更**

5. **提交到功能分支**

6. **等待使用者確認後才推送**

---

## 📋 自動檢查流程

### 在每次對話開始時

1. ✅ 自動讀取 `.opencode/config.yaml`
2. ✅ 自動載入 `git-workflow` skill
3. ✅ 自動載入 `code-standards` skill

### 在修改檔案前

1. ✅ 執行 `git branch --show-current`
2. ✅ 確認不在 main/master 分支
3. ✅ 如果在主分支，自動建立功能分支
4. ✅ 確認分支命名符合規範

### 在修改檔案後

1. ✅ 提醒執行測試
2. ✅ 提交到本地功能分支
3. ⏸️ **等待使用者確認**
4. ✅ 確認後才推送到遠端

---

## 🎯 Skills 自動觸發規則

| 操作類型           | 自動載入的 Skills                        |
| ------------------ | ---------------------------------------- |
| 任何檔案修改       | `git-workflow`, `code-standards`         |
| React/Next.js 開發 | `react-best-practices`, `code-standards` |
| UI 審查            | `web-design-guidelines`                  |
| 多語言相關         | `i18n-workflow`                          |

---

## 🛡️ 安全檢查清單

### 每次執行操作前，AI 必須確認：

- [ ] 已讀取 `.opencode/config.yaml`
- [ ] 已載入相關 skills
- [ ] 已檢查目前 Git 分支
- [ ] 不在 main/master 分支上
- [ ] 分支命名符合規範
- [ ] 理解要執行的操作
- [ ] 知道操作的風險

### 每次操作後，AI 必須：

- [ ] 告知使用者完成了什麼
- [ ] 提醒需要測試
- [ ] 等待使用者確認
- [ ] 不自動推送到遠端

---

## 🔧 Hook 腳本

專案提供自動檢查腳本：

```bash
.opencode/hooks/pre-modify.sh
```

此腳本會：

- 檢查目前分支
- 驗證分支命名
- 防止在主分支上操作

---

## 📚 相關文件

- `.opencode/config.yaml` - 專案配置
- `.opencode/skills/git-workflow/SKILL.md` - Git 工作流程規範
- `.opencode/skills/code-standards/SKILL.md` - 程式碼標準
- `.opencode/hooks/pre-modify.sh` - 自動檢查腳本

---

## 💡 快速參考

### 正確的操作流程範例

```bash
# 1. 檢查分支
$ git branch --show-current
main  # ❌ 在主分支上

# 2. 建立功能分支
$ git checkout -b feat/opencode/add-new-feature

# 3. 現在可以安全地修改檔案
# 使用 Edit、Write 工具

# 4. 提交變更
$ git add .
$ git commit -m "feat: 新增功能"

# 5. ⏸️ 告知使用者並等待確認
"修改已完成，請檢查後確認是否推送"

# 6. ✅ 使用者確認後才推送
$ git push origin feat/opencode/add-new-feature
```

### 錯誤的操作範例

```bash
# ❌ 錯誤：直接在 main 分支修改
$ git branch --show-current
main
# 直接使用 Edit 工具修改檔案 ← 錯誤！

# ❌ 錯誤：未經確認就推送
$ git push origin feature-branch ← 錯誤！
```

---

## 🚀 AI 助手啟動檢查

當 AI 助手啟動時，應該執行：

```bash
# 1. 讀取配置
cat .opencode/config.yaml

# 2. 讀取此文件
cat .opencode/README.md

# 3. 載入必要的 skills
- git-workflow
- code-standards

# 4. 檢查目前狀態
git branch --show-current
git status
```

---

**記住：預防錯誤比修正錯誤更重要！**

在每次執行檔案操作前，花 3 秒鐘檢查分支，可以避免 99% 的問題。
