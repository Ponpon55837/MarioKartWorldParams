#!/bin/bash

# MarioKartWorldParams 專案 - Git Hooks 安裝腳本
# 用於安裝專案的 Git hooks 到 .git/hooks/

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🔧 正在安裝 MarioKartWorldParams 專案的 Git hooks...${NC}"
echo ""

# 檢查是否在專案根目錄
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 錯誤：請在專案根目錄執行此腳本${NC}"
    echo "   目前目錄：$(pwd)"
    exit 1
fi

# 檢查 .githooks 目錄是否存在
if [ ! -d ".githooks" ]; then
    echo -e "${RED}❌ 錯誤：找不到 .githooks 目錄${NC}"
    exit 1
fi

# 確保 .git/hooks 目錄存在
mkdir -p .git/hooks

# 安裝 pre-commit hook
if [ -f ".githooks/pre-commit" ]; then
    echo -e "${YELLOW}📋 安裝 pre-commit hook...${NC}"
    cp .githooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}   ✅ pre-commit hook 已安裝${NC}"
else
    echo -e "${RED}   ❌ 找不到 .githooks/pre-commit${NC}"
fi

# 安裝 commit-msg hook
if [ -f ".githooks/commit-msg" ]; then
    echo -e "${YELLOW}📋 安裝 commit-msg hook...${NC}"
    cp .githooks/commit-msg .git/hooks/commit-msg
    chmod +x .git/hooks/commit-msg
    echo -e "${GREEN}   ✅ commit-msg hook 已安裝${NC}"
else
    echo -e "${RED}   ❌ 找不到 .githooks/commit-msg${NC}"
fi

echo ""
echo -e "${GREEN}✅ Git hooks 安裝完成！${NC}"
echo ""
echo -e "${BLUE}📝 已安裝的 hooks：${NC}"
echo "  • pre-commit  - 防止在 main 分支直接提交"
echo "  • commit-msg  - 檢查 commit message 格式"
echo ""
echo -e "${BLUE}🛡️  保護機制：${NC}"
echo "  1. 禁止在 main/master 分支直接提交"
echo "  2. 檢查分支命名是否符合規範"
echo "  3. 驗證 commit message 格式"
echo "  4. 確保使用繁體中文描述"
echo ""
echo -e "${YELLOW}🧪 測試建議：${NC}"
echo "  1. 切換到 main 分支：${GREEN}git checkout main${NC}"
echo "  2. 嘗試提交：${GREEN}git commit --allow-empty -m \"test\"${NC}"
echo "  3. 應該會看到錯誤訊息阻止提交 ✅"
echo ""
echo "  4. 建立功能分支：${GREEN}git checkout -b feat/test/test-hooks${NC}"
echo "  5. 嘗試錯誤格式提交：${GREEN}git commit --allow-empty -m \"test\"${NC}"
echo "  6. 應該會看到格式錯誤訊息 ✅"
echo ""
echo "  7. 正確格式提交：${GREEN}git commit --allow-empty -m \"feat: 測試 hooks\"${NC}"
echo "  8. 應該成功提交 ✅"
echo ""
echo -e "${BLUE}💡 重要提示：${NC}"
echo "  • 如果需要重新安裝，再次執行此腳本即可"
echo "  • ${RED}絕對不要${NC}使用 ${YELLOW}--no-verify${NC} 跳過 hook！"
echo "  • 這些 hooks 保護你不會違反專案規範"
echo "  • 如果是 AI 助手違反規範，請檢查 .opencode/config.yaml"
echo ""
echo -e "${GREEN}🎉 安裝成功！現在你的 Git 操作受到保護了。${NC}"
echo ""
