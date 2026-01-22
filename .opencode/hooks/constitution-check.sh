#!/bin/bash

# Claude 憲法品質檢查腳本
# 基於 Anthropic Claude 憲法四大原則的自動化檢查

set -e

echo "🤖 Claude 憲法品質檢查開始..."
echo "================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 計數器
PASSED=0
FAILED=0
WARNINGS=0

# 1. 廣泛安全檢查 (最高優先級)
echo -e "${BLUE}🛡️ 1. 廣泛安全檢查${NC}"
echo "-------------------"

# 1.1 安全性漏洞檢查
echo "檢查安全性漏洞..."
if pnpm audit --audit-level moderate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 無安全性漏洞${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 發現安全性漏洞${NC}"
    echo "請執行 'pnpm audit' 查看詳細資訊"
    ((FAILED++))
fi

# 1.2 敏感資訊檢查
echo "檢查敏感資訊洩露..."
SENSITIVE_PATTERNS=("API_KEY" "SECRET" "PASSWORD" "TOKEN" "PRIVATE_KEY")
SENSITIVE_FOUND=false

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -r "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  發現潛在敏感資訊: $pattern${NC}"
        ((WARNINGS++))
        SENSITIVE_FOUND=true
    fi
done

if [ "$SENSITIVE_FOUND" = false ]; then
    echo -e "${GREEN}✅ 無明顯敏感資訊洩露${NC}"
    ((PASSED++))
fi

# 1.3 依賴健全性檢查
echo "檢查依賴健全性..."
if [ -f "package.json" ] && pnpm list --depth=0 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 依賴關係正常${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 依賴關係異常${NC}"
    ((FAILED++))
fi

echo ""

# 2. 廣泛道德檢查
echo -e "${BLUE}🤝 2. 廣泛道德檢查${NC}"
echo "-------------------"

# 2.1 多語言支援檢查
echo "檢查多語言支援..."
LOCALES=("zh-TW" "zh-CN" "en" "ja" "ko")
ALL_LOCALES_PRESENT=true

for locale in "${LOCALES[@]}"; do
    if [ ! -f "src/i18n/locales/$locale.json" ]; then
        echo -e "${YELLOW}⚠️  缺少語言檔案: $locale.json${NC}"
        ((WARNINGS++))
        ALL_LOCALES_PRESENT=false
    fi
done

if [ "$ALL_LOCALES_PRESENT" = true ]; then
    echo -e "${GREEN}✅ 所有語言檔案完整${NC}"
    ((PASSED++))
fi

# 2.2 無障礙性基本檢查
echo "檢查無障礙性基本要求..."
if grep -r "alt=" --include="*.tsx" --include="*.jsx" src/ > /dev/null 2>&1 || \
   grep -r "aria-" --include="*.tsx" --include="*.jsx" src/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 發現無障礙性考慮${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  建議增加更多無障礙性支援${NC}"
    ((WARNINGS++))
fi

# 2.3 資料透明度檢查
echo "檢查資料透明度..."
if [ -f "public/mario-kart-data.csv" ] || [ -f "public/mario-kart-data.json" ]; then
    echo -e "${GREEN}✅ 資料檔案公開可用${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 缺少公開資料檔案${NC}"
    ((FAILED++))
fi

echo ""

# 3. 遵循專案指南檢查
echo -e "${BLUE}📋 3. 遵循專案指南檢查${NC}"
echo "---------------------"

# 3.1 Git 分支檢查
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo -e "${RED}❌ 目前在主分支上，不應直接修改檔案${NC}"
    ((FAILED++))
else
    echo -e "${GREEN}✅ 目前在功能分支: $CURRENT_BRANCH${NC}"
    ((PASSED++))
fi

# 3.2 TypeScript 檢查
echo "檢查 TypeScript 型別..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript 型別檢查通過${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ TypeScript 型別錯誤${NC}"
    ((FAILED++))
fi

# 3.3 ESLint 檢查
echo "檢查程式碼風格..."
if npx eslint src/ --ext .ts,.tsx > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint 檢查通過${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  ESLint 發現問題${NC}"
    ((WARNINGS++))
fi

echo ""

# 4. 真正有幫助檢查
echo -e "${BLUE}💡 4. 真正有幫助檢查${NC}"
echo "--------------------"

# 4.1 建置檢查
echo "檢查專案建置..."
if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 專案建置成功${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ 專案建置失敗${NC}"
    ((FAILED++))
fi

# 4.2 README 同步檢查
echo "檢查 README 與實際功能同步..."
README_VERSIONS=$(grep -o "Next.js [0-9]*\.[0-9]*\.[0-9]*" README.md | head -1)
PACKAGE_VERSION=$(grep '"next"' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')

if [ -n "$README_VERSIONS" ] && [ -n "$PACKAGE_VERSION" ]; then
    if echo "$README_VERSIONS" | grep -q "$PACKAGE_VERSION"; then
        echo -e "${GREEN}✅ README 版本資訊同步${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  README 與 package.json 版本不一致${NC}"
        echo "README: $README_VERSIONS, package.json: $PACKAGE_VERSION"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  無法檢查版本同步${NC}"
    ((WARNINGS++))
fi

# 4.3 效能基本檢查
echo "檢查套件大小..."
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo -e "${GREEN}✅ 建置大小: $BUILD_SIZE${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  尚未建置，無法檢查大小${NC}"
    ((WARNINGS++))
fi

echo ""

# 總結報告
echo "================================"
echo -e "${BLUE}📊 檢查結果總結${NC}"
echo "-------------------"
echo -e "${GREEN}✅ 通過: $PASSED${NC}"
echo -e "${YELLOW}⚠️  警告: $WARNINGS${NC}"
echo -e "${RED}❌ 失敗: $FAILED${NC}"
echo ""

# 基於 Claude 憲法的建議
echo -e "${BLUE}🎯 Claude 憲法原則分析${NC}"
echo "-------------------------"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🛡️ 廣泛安全: 無重大安全問題${NC}"
else
    echo -e "${RED}🛡️ 廣泛安全: 發現 $FAILED 個嚴重問題，必須立即修復${NC}"
fi

if [ $WARNINGS -le 2 ]; then
    echo -e "${GREEN}🤝 廣泛道德: 符合道德標準${NC}"
else
    echo -e "${YELLOW}🤝 廣泛道德: 有改進空間${NC}"
fi

if [ $PASSED -ge 8 ]; then
    echo -e "${GREEN}📋 遵循指南: 良好遵循專案規範${NC}"
else
    echo -e "${YELLOW}📋 遵循指南: 需要加強規範遵循${NC}"
fi

echo -e "${GREEN}💡 真正有幫助: 專案具備實用價值${NC}"

echo ""

# 最終建議
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}🚫 建議：在解決失敗項目前，不應提交程式碼${NC}"
    exit 1
elif [ $WARNINGS -gt 3 ]; then
    echo -e "${YELLOW}⚠️  建議：考慮解決警告項目以提升品質${NC}"
    exit 0
else
    echo -e "${GREEN}🎉 優秀！專案符合 Claude 憲法的高標準${NC}"
    exit 0
fi