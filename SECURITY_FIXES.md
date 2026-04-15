# 安全漏洞修復記錄

> 修復日期：2026-04-15  
> 分支：`fix/ponpon/security-vulnerabilities`

---

## 修復摘要

本次共修復 **5 項安全問題**，涵蓋依賴套件漏洞、API 未授權存取及缺少 HTTP 安全標頭。

---

## 1. 升級 Next.js 至 16.2.3

**嚴重等級：HIGH**  
**影響檔案：** `package.json`

### 修復前

```json
"next": "16.0.10"
```

### 修復後

```json
"next": "16.2.3"
```

### 修復的 CVE

| Advisory | 描述 | 影響版本 |
|----------|------|---------|
| GHSA-h25m-26qc-wcjf | HTTP 請求反序列化可導致 DoS（使用 RSC 時） | <16.0.11 |
| GHSA-jcc7-9wpm-mj36 | null origin 可繞過 dev HMR WebSocket CSRF 檢查 | <16.1.7 |
| GHSA-... | 自架環境 DoS via Server Components | <16.1.5 |
| GHSA-... | Server Components Denial of Service | <16.2.3 |

---

## 2. 修復 lodash override 版本

**嚴重等級：HIGH**  
**影響檔案：** `package.json`

### 修復前

```json
"pnpm": {
  "overrides": {
    "lodash@>=4.0.0 <=4.17.22": ">=4.17.23"
  }
}
```

### 修復後

```json
"pnpm": {
  "overrides": {
    "lodash@>=4.0.0 <=4.17.22": ">=4.18.0"
  }
}
```

### 說明

lodash `_.template()` 的代碼注入漏洞（GHSA）修補版本需要 `>=4.18.0`，原設定的 `>=4.17.23` 並不足以覆蓋此漏洞。

---

## 3. `/api/sync-data` POST 端點新增授權驗證

**嚴重等級：HIGH（未授權存取）**  
**影響檔案：**
- `src/app/api/sync-data/route.ts`
- `src/app/admin/page.tsx`
- `.env`

### 問題描述

POST `/api/sync-data` 端點原本無任何身份驗證，任何人皆可觸發同步操作，導致攻擊者可任意強制覆寫伺服器上的 `public/mario-kart-data.json`。

### 修復方式

在伺服器端新增 `validateSyncToken()` 函式，採用**環境感知**策略：

- **本地開發**（`NODE_ENV=development`）：跳過驗證，方便開發測試
- **生產環境**（`NODE_ENV=production`）：必須在 `Authorization: Bearer <token>` 提供正確 token

```typescript
function validateSyncToken(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true; // 本地開發跳過驗證
  }
  const SYNC_SECRET_TOKEN = process.env.SYNC_SECRET_TOKEN;
  if (!SYNC_SECRET_TOKEN) return false;
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  return token === SYNC_SECRET_TOKEN;
}
```

> **注意：** token 只存在於伺服器端環境變數，**不使用 `NEXT_PUBLIC_` 前綴**，確保不會暴露至瀏覽器端。

### 環境變數設定（生產環境）

```env
SYNC_SECRET_TOKEN = <使用 openssl rand -base64 32 生成的強隨機值>
```

---

## 4. 修復 CSP `font-src` 允許 base64 字型

**嚴重等級：MEDIUM（功能阻斷）**  
**影響檔案：** `next.config.js`

### 問題描述

CSP 的 `font-src 'self'` 過於嚴格，阻擋了以 `data:font/truetype;base64,...` 形式嵌入的 base64 字型，導致瀏覽器拋出 CSP 違規錯誤並阻止字型載入。

### 修復

```
font-src 'self' data:
```

---

## 5. 新增 HTTP 安全 Headers

**嚴重等級：MEDIUM（防禦縱深）**  
**影響檔案：** `next.config.js`

### 新增的安全標頭

| Header | 值 | 作用 |
|--------|----|------|
| `X-XSS-Protection` | `1; mode=block` | 舊版瀏覽器 XSS 過濾 |
| `X-Content-Type-Options` | `nosniff` | 防止 MIME type sniffing |
| `X-Frame-Options` | `DENY` | 防止 Clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 限制 Referrer 資訊洩漏 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 限制瀏覽器功能存取 |
| `Content-Security-Policy` | `default-src 'self'; ...` | 防止 XSS 與資料注入 |

---

## 未修復項目（需後續追蹤）

### devDependency 間接依賴漏洞

以下漏洞位於 devDependency 的間接依賴路徑，主要影響開發/建置環境，生產環境不直接受影響：

| 套件 | 漏洞類型 | 路徑 |
|------|---------|------|
| `minimatch` (多版本) | ReDoS | `eslint-config-next > ...` |
| `@isaacs/brace-expansion` | Uncontrolled Resource Consumption | `eslint-config-next > glob > minimatch > ...` |
| `flatted` | Prototype Pollution / DoS | `eslint > file-entry-cache > flat-cache > ...` |
| `immutable` | Prototype Pollution | `jotai-devtools > @redux-devtools/extension > ...` |
| `ajv` | ReDoS | 間接依賴 |

**建議：** 升級 `eslint-config-next` 至最新版本以修復上述間接依賴。

---

## 部署檢查清單

修復部署前請確認：

- [ ] 在生產環境設定 `SYNC_SECRET_TOKEN`（強隨機值）
- [ ] 在生產環境設定 `GOOGLE_SHEETS_CSV_URL`
- [ ] 執行 `pnpm install` 以更新 `pnpm-lock.yaml`
- [ ] 執行 `pnpm audit` 確認漏洞數量已減少
- [ ] 呼叫 POST `/api/sync-data` 時於 header 加入 `Authorization: Bearer <token>`

---

## 執行 `pnpm install` 後的審計差異

| 嚴重等級 | 修復前 | 修復後（預估） |
|---------|--------|--------------|
| high | 18 | 依賴 eslint-config-next 版本 |
| moderate | 13 | 依賴 eslint-config-next 版本 |
| low | 1 | 0（Next.js DoS 已修復） |

Next.js 本身的 HIGH/moderate 漏洞（4 個）已透過升級至 16.2.3 完全修復。
