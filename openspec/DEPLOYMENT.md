# 🚀 部署指南

本文檔指導如何將 MarioKartWorldParams 應用程式部署到不同平台。

---

## 📋 目錄

- [前置要求](#前置要求)
- [建置準備](#建置準備)
- [部署平台](#部署平台)
- [環境變數](#環境變數)
- [監控與維護](#監控與維護)
- [故障排除](#故障排除)

---

## 🔧 前置要求

### 系統要求

- **Node.js**：18.0 或更高版本
- **pnpm**：12.8.1（版本由 `package.json` 固定）
- **Git**：用於版本控制
- **終端機**：執行命令列指令

### 帳號準備

1. **GitHub 帳號**：代碼託管
2. **部署平台帳號**：
   - [Vercel](https://vercel.com/) (推薦)
   - [Netlify](https://www.netlify.com/)
   - [AWS](https://aws.amazon.com/)
   - [Google Cloud](https://cloud.google.com/)

---

## 🏗️ 建置準備

### 1. 本地測試

```bash
# 1. 克隆專案
git clone https://github.com/Ponpon55837/MarioKartWorldParams.git
cd MarioKartWorldParams

# 2. 安裝依賴
pnpm install

# 3. 環境變數設置
cp .env.example .env.local

# 4. 本地建置測試
pnpm build

# 5. 本地測試
pnpm start
```

### 2. 代碼品質檢查

```bash
# 執行所有檢查
pnpm lint          # 代碼檢查
pnpm typecheck     # 類型檢查
pnpm test          # 測試檢查
```

### 3. 性能測試

```bash
# 使用 Lighthouse CLI
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# 或使用 web-vitals
npx web-vitals http://localhost:3000
```

---

## 🌐 部署平台

### 🥇 Vercel (推薦)

#### 優勢

- 零配置部署
- 自動 HTTPS
- 全球 CDN
- 分支預覽
- 無伺服器函數支援

#### 部署步驟

1. **連接 GitHub**

   ```
   1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
   2. 點擊 "New Project"
   3. 連接 GitHub 帳號
   4. 選擇 MarioKartWorldParams 專案
   ```

2. **配置設定**

   ```json
   {
     "buildCommand": "pnpm build",
     "outputDirectory": ".next",
     "installCommand": "pnpm install",
     "framework": "nextjs"
   }
   ```

3. **環境變數**

   ```
   在 Vercel Dashboard 設置：
   - NEXT_PUBLIC_API_URL
   - NODE_ENV=production
   ```

4. **自動部署**
   ```
   ✅ 自動部署到 main 分支
   ✅ 預覽部署到功能分支
   ✅ 自動 HTTPS 和全球 CDN
   ```

#### Vercel 特定配置

**vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

---

### 🥈 Netlify

#### 優勢

- 簡單易用
- 免費 SSL
- 表單處理
- Edge Functions

#### 部署步驟

1. **準備建置腳本**

   ```json
   {
     "scripts": {
       "netlify-build": "pnpm build && pnpm export"
     }
   }
   ```

2. **Netlify 配置**

   ```toml
   [build]
     publish = "out"
     command = "pnpm netlify-build"

   [build.environment]
     NODE_VERSION = "18"
     NPM_VERSION = "8"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

3. **部署**
   ```
   1. 連接 Netlify 到 GitHub
   2. 設置建置命令：pnpm netlify-build
   3. 發布目錄：out
   4. 設置環境變數
   ```

---

### 🥉 AWS Amplify

#### 部署步驟

1. **安裝 Amplify CLI**

   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **初始化 Amplify**

   ```bash
   amplify init
   ```

3. **添加 Web Hosting**
   ```bash
   amplify add hosting
   amplify publish
   ```

---

### 🔧 自定義伺服器

#### Docker 部署

**Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# 依賴安裝
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 建置階段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN corepack enable pnpm && pnpm build

# 運行階段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml**

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

---

## 🔐 環境變數

### 必需變數

```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### 可選變數

```bash
# 分析工具
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# 功能開關
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true

# 第三方服務
GOOGLE_SHEETS_API_KEY=your-api-key
GOOGLE_SHEETS_SHEET_ID=your-sheet-id
```

### 安全注意事項

```bash
# ❌ 不要在前端使用敏感資訊
API_SECRET_KEY=secret-key

# ✅ 客戶端安全的變數
NEXT_PUBLIC_APP_URL=https://example.com

# ✅ 伺服器端變數
DATABASE_URL=postgres://...
```

---

## 📊 監控與維護

### 性能監控

#### Vercel Analytics

```javascript
// pages/_app.js
import { Analytics } from "@vercel/analytics/react";

function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

#### 自定義監控

```javascript
// utils/monitoring.js
export function trackEvent(eventName, properties) {
  if (typeof window !== "undefined") {
    // Google Analytics 4
    gtag("event", eventName, properties);

    // Vercel Analytics
    window.va?.track(eventName, properties);
  }
}
```

### 錯誤監控

#### Sentry 集成

```bash
pnpm add @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 日誌管理

```javascript
// utils/logger.js
export function logError(error, context = {}) {
  console.error("[ERROR]", {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : null,
  });
}
```

---

## 🚨 故障排除

### 常見問題

#### 1. 建置失敗

**問題**：`Type error: Cannot find module`

```bash
# 解決方案
pnpm install --force
rm -rf .next
pnpm build
```

**問題**：`ESLint errors`

```bash
# 解決方案
pnpm lint:fix
pnpm build
```

#### 2. 運行時錯誤

**問題**：`Hydration failed`

```javascript
// 解決方案
import dynamic from "next/dynamic";

const DynamicComponent = dynamic(() => import("./Component"), {
  ssr: false,
});
```

**問題**：`API route not found`

```javascript
// 檢查 API 路由結構
src / app / api / route.ts;
```

#### 3. 性能問題

**問題**：頁面載入慢

```javascript
// 解決方案：動態導入
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>Loading...</div>,
});
```

#### 4. 環境變數問題

**問題**：`process.env` 為 undefined

```javascript
// 檢查變數命名
// 客戶端變數必須以 NEXT_PUBLIC_ 開頭
console.log(process.env.NEXT_PUBLIC_API_URL); // ✅
console.log(process.env.API_SECRET); // ❌ 客戶端無法存取
```

### 除錯工具

```bash
# Vercel 日誌
vercel logs

# 本地除錯
DEBUG=* pnpm dev

# 性能分析
npx @next/bundle-analyzer
```

---

## 🔄 CI/CD 流程

### GitHub Actions

**.github/workflows/deploy.yml**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "pnpm"

      - run: corepack enable pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

---

## 📋 部署檢查清單

### 部署前

- [ ] 本地測試通過
- [ ] 代碼檢查通過
- [ ] 所有測試通過
- [ ] 環境變數設置完成
- [ ] 性能測試通過
- [ ] 安全檢查完成

### 部署後

- [ ] 網站正常訪問
- [ ] API 端點正常運作
- [ ] 無障礙性測試通過
- [ ] 行動裝置適配正常
- [ ] 多語言功能正常
- [ ] 分析工具正常記錄
- [ ] 錯誤監控正常運作

### 定期維護

- [ ] 更新依賴套件
- [ ] 檢查安全性漏洞
- [ ] 監控性能指標
- [ ] 備份重要數據
- [ ] 審查使用者回饋

---

## 📞 支援資源

- **Vercel 文檔**：[vercel.com/docs](https://vercel.com/docs)
- **Next.js 部署**：[nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **GitHub Actions**：[docs.github.com/en/actions](https://docs.github.com/en/actions)
- **專案 Issues**：[github.com/Ponpon55837/MarioKartWorldParams/issues](https://github.com/Ponpon55837/MarioKartWorldParams/issues)

---

_最後更新：2025-01-22_
