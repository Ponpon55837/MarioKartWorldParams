#!/bin/bash

# OpenCode Pre-Modify Hook
# 在 AI 修改任何檔案前自動執行此腳本

set -e

echo "🔍 執行 pre-modify 檢查..."

# 檢查 1: 確認不在 main 分支上
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "❌ 錯誤：目前在 $CURRENT_BRANCH 分支上"
    echo "⚠️  不允許直接在主分支上修改檔案"
    echo ""
    echo "📋 建議操作："
    echo "   1. 建立新的功能分支"
    echo "   2. 格式：<type>/<name>/<description>"
    echo "   3. 例如：git checkout -b feat/opencode/add-feature"
    echo ""
    exit 1
fi

# 檢查 2: 確認分支命名符合規範
if [[ ! "$CURRENT_BRANCH" =~ ^(feat|fix|refactor|docs|style|test|chore|hotfix)\/.+\/.+ ]]; then
    echo "⚠️  警告：分支命名不符合規範"
    echo "當前分支：$CURRENT_BRANCH"
    echo "標準格式：<type>/<name>/<description>"
    echo ""
    # 這是警告，不中斷執行
fi

# 檢查 3: 確認工作目錄乾淨（可選）
if [ -n "$(git status --porcelain)" ]; then
    echo "ℹ️  注意：工作目錄有未提交的變更"
fi

echo "✅ Pre-modify 檢查通過"
echo "📍 目前分支：$CURRENT_BRANCH"
echo ""

exit 0
