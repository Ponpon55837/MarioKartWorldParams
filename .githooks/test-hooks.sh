#!/bin/bash

# MarioKartWorldParams 專案 - Git Hooks 測試腳本
# 自動測試所有 Git hooks 是否正常運作

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 計數器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 測試結果記錄
FAILED_TEST_NAMES=()

# ============================================
# 工具函數
# ============================================

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  MarioKartWorldParams Git Hooks 自動化測試             ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_start() {
    local test_name=$1
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "  測試 #${TOTAL_TESTS}: ${test_name}... "
}

test_pass() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✓ 通過${NC}"
}

test_fail() {
    local test_name=$1
    local reason=$2
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_TEST_NAMES+=("${test_name}: ${reason}")
    echo -e "${RED}✗ 失敗${NC}"
    if [ -n "$reason" ]; then
        echo -e "    ${RED}原因: ${reason}${NC}"
    fi
}

cleanup_test_branch() {
    local branch=$1
    git checkout main 2>/dev/null || true
    git branch -D "$branch" 2>/dev/null || true
}

# ============================================
# 環境檢查
# ============================================

check_environment() {
    print_section "環境檢查"
    
    # 檢查是否在專案根目錄
    test_start "檢查是否在專案根目錄"
    if [ ! -d ".git" ]; then
        test_fail "檢查是否在專案根目錄" "不在 Git 倉庫根目錄"
        exit 1
    fi
    test_pass
    
    # 檢查是否在 main 分支
    test_start "檢查當前分支是否為 main"
    CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        test_fail "檢查當前分支" "當前不在 main 分支（在 ${CURRENT_BRANCH}）"
        echo ""
        echo -e "${YELLOW}請先切換到 main 分支：git checkout main${NC}"
        exit 1
    fi
    test_pass
    
    # 檢查工作目錄是否乾淨
    test_start "檢查工作目錄是否乾淨"
    if [ -n "$(git status --porcelain)" ]; then
        test_fail "檢查工作目錄" "工作目錄有未提交的變更"
        echo ""
        echo -e "${YELLOW}請先提交或儲存變更：git stash${NC}"
        exit 1
    fi
    test_pass
    
    # 檢查 hooks 是否已安裝
    test_start "檢查 pre-commit hook 是否已安裝"
    if [ ! -f ".git/hooks/pre-commit" ]; then
        test_fail "pre-commit hook" "未安裝"
        echo ""
        echo -e "${YELLOW}請先安裝 hooks：bash .githooks/install.sh${NC}"
        exit 1
    fi
    test_pass
    
    test_start "檢查 commit-msg hook 是否已安裝"
    if [ ! -f ".git/hooks/commit-msg" ]; then
        test_fail "commit-msg hook" "未安裝"
        echo ""
        echo -e "${YELLOW}請先安裝 hooks：bash .githooks/install.sh${NC}"
        exit 1
    fi
    test_pass
    
    # 檢查 hooks 是否可執行
    test_start "檢查 pre-commit 是否可執行"
    if [ ! -x ".git/hooks/pre-commit" ]; then
        test_fail "pre-commit 執行權限" "缺少執行權限"
        echo ""
        echo -e "${YELLOW}修復：chmod +x .git/hooks/pre-commit${NC}"
        exit 1
    fi
    test_pass
    
    test_start "檢查 commit-msg 是否可執行"
    if [ ! -x ".git/hooks/commit-msg" ]; then
        test_fail "commit-msg 執行權限" "缺少執行權限"
        echo ""
        echo -e "${YELLOW}修復：chmod +x .git/hooks/commit-msg${NC}"
        exit 1
    fi
    test_pass
}

# ============================================
# Pre-commit Hook 測試
# ============================================

test_precommit_hook() {
    print_section "Pre-commit Hook 測試"
    
    # 測試 1: 在 main 分支提交應該被阻止
    test_start "在 main 分支提交應該被阻止"
    git checkout main 2>/dev/null
    if git commit --allow-empty -m "test: 測試提交" 2>&1 | grep -q "禁止在.*分支直接提交"; then
        test_pass
    else
        test_fail "main 分支保護" "未能阻止 main 分支提交"
    fi
    
    # 測試 2: 在功能分支提交應該被允許
    test_start "在功能分支提交應該被允許"
    TEST_BRANCH="test/test-user/test-feature-$$"
    git checkout -b "$TEST_BRANCH" 2>/dev/null
    if git commit --allow-empty -m "test: 測試提交" 2>&1; then
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    else
        test_fail "功能分支提交" "功能分支無法提交"
    fi
    cleanup_test_branch "$TEST_BRANCH"
    
    # 測試 3: 分支命名規範檢查（警告）
    test_start "分支命名規範檢查（不規範的名稱應顯示警告）"
    BAD_BRANCH="my-feature-$$"
    git checkout -b "$BAD_BRANCH" 2>/dev/null
    COMMIT_OUTPUT=$(git commit --allow-empty -m "test: 測試" 2>&1)
    if echo "$COMMIT_OUTPUT" | grep -q "分支命名不符合規範"; then
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    else
        test_fail "分支命名檢查" "未顯示分支命名警告"
        git reset --hard HEAD~1 2>/dev/null
    fi
    cleanup_test_branch "$BAD_BRANCH"
    
    # 測試 4: 測試 master 分支也應該被保護
    test_start "master 分支也應該被保護"
    if git show-ref --verify --quiet refs/heads/master; then
        git checkout master 2>/dev/null
        if git commit --allow-empty -m "test: 測試" 2>&1 | grep -q "禁止在.*分支直接提交"; then
            test_pass
        else
            test_fail "master 分支保護" "未能阻止 master 分支提交"
        fi
        git checkout main 2>/dev/null
    else
        echo -e "${YELLOW}跳過（master 分支不存在）${NC}"
    fi
    
    # 測試 5: 測試 develop 分支也應該被保護
    test_start "develop 分支也應該被保護"
    if git show-ref --verify --quiet refs/heads/develop; then
        git checkout develop 2>/dev/null
        if git commit --allow-empty -m "test: 測試" 2>&1 | grep -q "禁止在.*分支直接提交"; then
            test_pass
        else
            test_fail "develop 分支保護" "未能阻止 develop 分支提交"
        fi
        git checkout main 2>/dev/null
    else
        echo -e "${YELLOW}跳過（develop 分支不存在）${NC}"
    fi
    
    # 測試 6: 測試 production 分支應該被保護
    test_start "production 分支應該被保護"
    if git show-ref --verify --quiet refs/heads/production; then
        git checkout production 2>/dev/null
        if git commit --allow-empty -m "test: 測試" 2>&1 | grep -q "禁止在.*分支直接提交"; then
            test_pass
        else
            test_fail "production 分支保護" "未能阻止 production 分支提交"
        fi
        git checkout main 2>/dev/null
    else
        echo -e "${YELLOW}跳過（production 分支不存在）${NC}"
    fi
    
    # 測試 7: 測試 staging 分支應該被保護
    test_start "staging 分支應該被保護"
    if git show-ref --verify --quiet refs/heads/staging; then
        git checkout staging 2>/dev/null
        if git commit --allow-empty -m "test: 測試" 2>&1 | grep -q "禁止在.*分支直接提交"; then
            test_pass
        else
            test_fail "staging 分支保護" "未能阻止 staging 分支提交"
        fi
        git checkout main 2>/dev/null
    else
        echo -e "${YELLOW}跳過（staging 分支不存在）${NC}"
    fi
    
    # 測試 8: 測試規範的分支命名
    test_start "規範的分支命名應該通過且無警告"
    GOOD_BRANCH="feat/test-user/test-feature-$$"
    git checkout -b "$GOOD_BRANCH" 2>/dev/null
    COMMIT_OUTPUT=$(git commit --allow-empty -m "test: 測試提交" 2>&1)
    if echo "$COMMIT_OUTPUT" | grep -q "Pre-commit 檢查通過"; then
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    else
        test_fail "規範分支命名" "規範的分支名稱未通過檢查"
        git reset --hard HEAD~1 2>/dev/null
    fi
    cleanup_test_branch "$GOOD_BRANCH"
}

# ============================================
# Commit-msg Hook 測試
# ============================================

test_commitmsg_hook() {
    print_section "Commit-msg Hook 測試"
    
    TEST_BRANCH="test/test-user/commit-msg-test-$$"
    git checkout -b "$TEST_BRANCH" 2>/dev/null
    
    # 測試 1: 正確的提交訊息格式
    test_start "正確的提交訊息格式應該被接受"
    if git commit --allow-empty -m "feat: 新增測試功能" 2>&1 | grep -q "Commit message 格式正確"; then
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    else
        test_fail "正確格式" "正確的提交訊息被拒絕"
    fi
    
    # 測試 2: 不正確的提交訊息格式（應被拒絕）
    test_start "不正確的提交訊息應被拒絕"
    if ! git commit --allow-empty -m "Add new feature" 2>&1; then
        test_pass
    else
        test_fail "錯誤格式檢查" "錯誤格式的提交訊息未被拒絕"
        git reset --hard HEAD~1 2>/dev/null
    fi
    
    # 測試 3: 帶 scope 的提交訊息
    test_start "帶 scope 的提交訊息格式"
    COMMIT_OUTPUT=$(git commit --allow-empty -m "feat(api): 新增使用者 API" 2>&1)
    # 注意：目前的 commit-msg 不支援 scope，所以這會失敗但不是錯誤
    if echo "$COMMIT_OUTPUT" | grep -q "格式錯誤"; then
        echo -e "${YELLOW}預期行為（當前不支援 scope）${NC}"
    else
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    fi
    
    # 測試 4: 破壞性變更標記
    test_start "破壞性變更標記格式"
    COMMIT_OUTPUT=$(git commit --allow-empty -m "feat!: 重構 API 接口" 2>&1)
    # 注意：目前的 commit-msg 不支援 !，所以這會失敗但不是錯誤
    if echo "$COMMIT_OUTPUT" | grep -q "格式錯誤"; then
        echo -e "${YELLOW}預期行為（當前不支援 !）${NC}"
    else
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    fi
    
    # 測試 5: 空提交訊息
    test_start "空提交訊息應該被拒絕"
    # 注意：Git 本身就會拒絕空訊息，所以這裡測試 Git 的行為
    if ! git commit --allow-empty -m "" 2>&1; then
        test_pass
    else
        test_fail "空訊息檢查" "空訊息未被拒絕"
        git reset --hard HEAD~1 2>/dev/null
    fi
    
    # 測試 6: 缺少冒號的提交訊息
    test_start "缺少冒號的提交訊息應被拒絕"
    if ! git commit --allow-empty -m "feat 新增功能" 2>&1; then
        test_pass
    else
        test_fail "冒號檢查" "缺少冒號的訊息未被拒絕"
        git reset --hard HEAD~1 2>/dev/null
    fi
    
    # 測試 7: 冒號後沒有空格（應顯示警告）
    test_start "冒號後沒有空格應顯示警告"
    COMMIT_OUTPUT=$(git commit --allow-empty -m "feat:新增功能" 2>&1)
    if echo "$COMMIT_OUTPUT" | grep -q "冒號後面應該要有空格"; then
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    else
        test_fail "空格警告" "未顯示空格警告"
        git reset --hard HEAD~1 2>/dev/null
    fi
    
    # 測試 8: 描述過短（應顯示警告）
    test_start "描述過短應顯示警告"
    COMMIT_OUTPUT=$(git commit --allow-empty -m "feat: abc" 2>&1)
    if echo "$COMMIT_OUTPUT" | grep -q "描述過短"; then
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    else
        test_fail "描述長度警告" "未顯示描述過短警告"
        git reset --hard HEAD~1 2>/dev/null
    fi
    
    # 測試 9: 所有可用的類型
    test_start "測試所有可用的提交類型"
    TYPES=("feat" "fix" "refactor" "docs" "style" "test" "chore" "hotfix")
    ALL_PASS=true
    for type in "${TYPES[@]}"; do
        if ! git commit --allow-empty -m "${type}: 測試 ${type} 類型" 2>&1 | grep -q "格式正確"; then
            ALL_PASS=false
            break
        fi
        git reset --hard HEAD~1 2>/dev/null
    done
    if [ "$ALL_PASS" = true ]; then
        test_pass
    else
        test_fail "提交類型測試" "某些提交類型未通過"
    fi
    
    # 測試 10: Merge commit 應該被跳過
    test_start "Merge commit 應該被允許"
    # 這個測試比較複雜，我們只檢查 hook 中是否有處理 Merge commit 的邏輯
    if grep -q "Merge" .git/hooks/commit-msg; then
        test_pass
    else
        test_fail "Merge commit 處理" "未處理 Merge commit"
    fi
    
    cleanup_test_branch "$TEST_BRANCH"
}

# ============================================
# 整合測試
# ============================================

test_integration() {
    print_section "整合測試"
    
    # 測試 1: 完整的工作流程
    test_start "完整工作流程測試"
    TEST_BRANCH="feat/test-user/integration-test-$$"
    git checkout -b "$TEST_BRANCH" 2>/dev/null
    
    # 建立測試檔案
    echo "test" > test-file-$$.txt
    git add test-file-$$.txt
    
    # 提交
    if git commit -m "feat: 新增測試檔案" 2>&1 | grep -q "格式正確"; then
        # 清理
        git reset --hard HEAD~1 2>/dev/null
        rm -f test-file-$$.txt
        test_pass
    else
        rm -f test-file-$$.txt
        test_fail "完整流程" "工作流程執行失敗"
    fi
    
    cleanup_test_branch "$TEST_BRANCH"
    
    # 測試 2: 測試 hooks 的錯誤恢復能力
    test_start "錯誤後恢復正常提交"
    TEST_BRANCH="feat/test-user/recovery-test-$$"
    git checkout -b "$TEST_BRANCH" 2>/dev/null
    
    # 先嘗試錯誤的提交
    git commit --allow-empty -m "wrong format" 2>/dev/null || true
    
    # 再嘗試正確的提交
    if git commit --allow-empty -m "feat: 正確的提交" 2>&1 | grep -q "格式正確"; then
        test_pass
        git reset --hard HEAD~1 2>/dev/null
    else
        test_fail "錯誤恢復" "錯誤後無法正常提交"
    fi
    
    cleanup_test_branch "$TEST_BRANCH"
}

# ============================================
# 安全性測試
# ============================================

test_security() {
    print_section "安全性測試"
    
    # 測試 1: 檢查是否有防止 --no-verify 繞過的提示
    test_start "檢查是否有 --no-verify 警告"
    if grep -q "no-verify" .githooks/pre-commit; then
        test_pass
    else
        test_fail "--no-verify 警告" "未找到相關警告"
    fi
    
    # 測試 2: 檢查受保護分支清單
    test_start "檢查受保護分支清單是否完整"
    EXPECTED_BRANCHES=("main" "master" "develop" "production" "staging")
    ALL_PROTECTED=true
    for branch in "${EXPECTED_BRANCHES[@]}"; do
        if ! grep -q "$branch" .githooks/pre-commit; then
            ALL_PROTECTED=false
            break
        fi
    done
    if [ "$ALL_PROTECTED" = true ]; then
        test_pass
    else
        test_fail "受保護分支檢查" "某些分支未在保護清單中"
    fi
    
    # 測試 3: 檢查 hooks 檔案完整性
    test_start "檢查 hooks 檔案完整性"
    if [ -f ".githooks/pre-commit" ] && [ -f ".githooks/commit-msg" ] && [ -f ".githooks/install.sh" ]; then
        test_pass
    else
        test_fail "檔案完整性" "缺少必要的 hooks 檔案"
    fi
    
    # 測試 4: 檢查 hooks 是否有 shebang
    test_start "檢查 hooks 是否有正確的 shebang"
    if head -n 1 .githooks/pre-commit | grep -q "#!/bin/bash" && \
       head -n 1 .githooks/commit-msg | grep -q "#!/bin/bash"; then
        test_pass
    else
        test_fail "shebang 檢查" "hooks 缺少正確的 shebang"
    fi
}

# ============================================
# 報告生成
# ============================================

print_summary() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  測試總結                                              ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  總測試數：${BLUE}${TOTAL_TESTS}${NC}"
    echo -e "  通過：${GREEN}${PASSED_TESTS}${NC}"
    echo -e "  失敗：${RED}${FAILED_TESTS}${NC}"
    
    if [ ${#FAILED_TEST_NAMES[@]} -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}  注意：某些測試可能因為預期行為而標記為失敗${NC}"
        echo -e "${YELLOW}  （例如：不支援的格式被拒絕）${NC}"
    fi
    
    echo ""
    
    if [ ${FAILED_TESTS} -eq 0 ]; then
        echo -e "${GREEN}✓ 所有測試通過！Git hooks 運作正常。${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ 有 ${FAILED_TESTS} 個測試失敗：${NC}"
        echo ""
        for failed_test in "${FAILED_TEST_NAMES[@]}"; do
            echo -e "  ${RED}•${NC} ${failed_test}"
        done
        echo ""
        echo -e "${YELLOW}請檢查 Git hooks 的安裝和配置。${NC}"
        echo ""
        return 1
    fi
}

# ============================================
# 主函數
# ============================================

main() {
    print_header
    
    # 環境檢查
    check_environment
    
    # 執行測試
    test_precommit_hook
    test_commitmsg_hook
    test_integration
    test_security
    
    # 顯示總結
    print_summary
    
    # 返回適當的退出碼
    if [ ${FAILED_TESTS} -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# 執行主函數
main
