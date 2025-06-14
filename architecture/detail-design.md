# MCP Server - Detail Design Document

*   **Status**: `Final`
*   **Version**: `1.0.1`
*   **Author**: AI Assistant

## 1. Introductiona

本文件提供了 MCP 伺服器專案的詳細技術設計。內容包含具體的函式庫版本、基於領域驅動設計 (DDD) 的專案結構、資料庫模型、API 端點細節以及核心功能的實現思路。本文件旨在作為開發團隊的主要技術參考。

## 2. Technology Stack & Versions

為確保專案的穩定性與一致性，我們將採用以下函式庫及其特定版本：

| 類別 | Library | 版本 | 用途 |
| :--- | :--- | :--- | :--- |
| **框架** | Next.js | `^14.2.4` | 管理介面與後端 BFF |
| **UI 元件庫** | React MUI | `@mui/material ^5.15.20` | 提供標準化、高品質的前端 UI 元件 |
| **UI 樣式** | Emotion | `@emotion/react ^11.11.4` | MUI 的預設樣式引擎 |
| **UI 樣式** | Tailwind CSS | `^3.4.4` | 用於快速、原子化的 CSS 樣式佈局 |
| **API 執行環境** | Cloudflare Workers | `wrangler ^3.60.0` | 部署高效能、低延遲的 Agent API |
| **ORM** | Prisma | `^5.15.0` | 提供類型安全的資料庫存取 |
| **DB Adapter** | Prisma Cloudflare Adapter | `@prisma/adapter-cloudflare ^5.15.0` | 連接 Prisma 與 Cloudflare D1 |
| **資料庫** | Cloudflare D1 | N/A | 無伺服器 SQL 資料庫 |

## 3. Domain-Driven Design (DDD) Application

為了使系統結構清晰、易於擴展，我們將引入 DDD 的戰術模式，劃分明確的界限上下文 (Bounded Contexts)。

### 3.1. Bounded Contexts

1.  **規則管理上下文 (Rule Management Context)**:
    *   **描述**: 此上下文涵蓋了「規則」從建立到封存的整個生命週期。
    *   **核心聚合 (Aggregate)**: `Rule` (規則)。
    *   **參與者**: 技術主管/架構師。
    *   **通用語言**: `Rule`, `TaskType`, `Content`, `Activate`, `Deactivate`, `HistoryLog`。

2.  **上下文服務上下文 (Context Serving Context)**:
    *   **描述**: 此上下文專注於為 AI Agent 提供高效、安全的規則查詢服務。
    *   **核心實體**: `ApiToken` (用於驗證)。
    *   **參與者**: AI Agent 協調系統。
    *   **通用語言**: `Context`, `Discovery`, `Health Check`, `Request`, `Response`, `API Token`。

## 4. Project Directory Structure

專案將採用 Monorepo 結構，將 Next.js 應用和 Cloudflare Worker 的原始碼放在同一個 Git 倉儲中，並基於 DDD 理念組織程式碼。

```
mcp-server/
├── .vscode/                 # VSCode 設定
├── prisma/
│   └── schema.prisma        # Prisma 資料庫模型定義
├── src/
│   ├── app/                 # Next.js App Router (頁面)
│   │   ├── (admin)/         # 受保護的管理員路由群組
│   │   │   ├── layout.tsx
│   │   │   ├── admin/rules/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── admin/token/page.tsx
│   │   │   ├── admin/history/page.tsx
│   │   ├── login/page.tsx   # 登入頁面
│   │   └── layout.tsx       # 根佈局
│   ├── components/          # 共用的、無狀態的前端元件
│   │   ├── ui/              # 原子 UI 元件 (e.g., ThemedButton)
│   │   └── domain/          # 與特定領域相關的複合元件 (e.g., RuleForm)
│   ├── domains/             # 核心商業邏輯 (DDD)
│   │   └── rule-management/
│   │       ├── services/    # 規則相關的後端服務
│   │       └── types.ts     # 規則相關的 TypeScript 型別
│   ├── lib/                 # 函式庫與共用邏輯
│   │   ├── auth.ts          # 認證相關的輔助函式
│   │   └── prisma.ts        # Prisma Client 實例
│   └── middleware.ts        # Next.js 中間件 (處理管理員登入驗證)
└── worker/
    ├── src/
    │   ├── domains/
    │   │   └── context-serving/
    │   │       └── services/  # 服務相關的邏輯
    │   ├── middleware/
    │   │   └── auth.ts      # Worker 的 Token 驗證中間件
    │   └── index.ts         # Cloudflare Worker 入口點
    └── wrangler.toml          # Worker 設定檔
```

## 5. Database Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 規則管理上下文
model Rule {
  id          Int      @id @default(autoincrement())
  taskType    String   @unique
  name        String
  description String?
  content     Json
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  historyLogs HistoryLog[]
}

// 規則管理上下文
model HistoryLog {
  id              Int      @id @default(autoincrement())
  taskType        String
  requestSource   String?
  responsePayload Json
  timestamp       DateTime @default(now())
  ruleId          Int?
  rule            Rule?    @relation(fields: [ruleId], references: [id])
}

// 上下文服務上下文
model ApiToken {
  id           Int      @id @default(autoincrement())
  hashedToken  String   @unique
  name         String
  createdAt    DateTime @default(now())
}
```

## 6. Frontend Page & Component Design

我們將大量使用標準的 MUI 元件，以減少客製化並加速開發。

*   **登入頁面 (`/login`)**:
    *   使用 MUI 的 `Container`, `Box`, `TextField`, `Button`, `Typography` 元件構成一個居中的登入表單。

*   **規則列表頁面 (`/admin/rules`)**:
    *   使用 MUI 的 `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell` 來顯示規則列表。
    *   每一行包含編輯和刪除操作，使用 `IconButton` 搭配 `EditIcon` 和 `DeleteIcon`。
    *   頁面頂部有一個 `Button` 連結到新增規則頁面。

*   **規則編輯/新增頁面 (`/admin/rules/[id]`)**:
    *   一個表單，包含：
        *   `TextField` 用於 `name`, `taskType`, `description`。
        *   `Switch` 用於 `isActive` 狀態。
        *   `content` 欄位使用一個第三方 JSON 編輯器元件或一個基本的 `TextField` (設定為 `multiline`)。

*   **請求歷史頁面 (`/admin/history`)**:
    *   與規則列表頁面類似，使用 `Table` 來展示 `HistoryLog` 的內容。

*   **API Token 頁面 (`/admin/token`)**:
    *   提供 API Token 的列表，並提供新增、編輯、刪除的操作。

## 7. API Design & Security

### 7.1. Admin API (Next.js API Routes)

*   **認證**: 透過 Next.js Middleware 檢查 Session Cookie，保護所有 `/api/admin/*` 路由。
*   **端點**:
    *   `POST /api/admin/rules`: 新增規則。
    *   `GET /api/admin/rules`: 獲取規則列表。
    *   `GET /api/admin/rules/[id]`: 獲取單一規則。
    *   `PUT /api/admin/rules/[id]`: 更新單一規則。
    *   `DELETE /api/admin/rules/[id]`: 刪除單一規則。
    *   `GET /api/admin/history`: 獲取請求歷史。
    *   `POST /api/admin/token`: 新增 API Token。
    *   `GET /api/admin/token`: 獲取 API Token 列表。
    *   `PUT /api/admin/token/[id]`: 更新單一 API Token。
    *   `DELETE /api/admin/token/[id]`: 刪除單一 API Token。

### 7.2. Agent API (Cloudflare Worker)

*   **認證**: 所有請求必須在 Header 中包含 `Authorization: Bearer <API_TOKEN>`。此邏輯在 Worker 的一個共用中間件中處理。
*   **端點**:
    *   `GET /context`: 根據 `taskType` 獲取規則。
    *   `POST /context`: 根據 `taskType` 新增或更新規則。
    *   `GET /discover`: 獲取所有可用的規則摘要。
    *   `GET /health`: 服務健康檢查。

## 8. Authentication & Authorization Flow

### 8.1. 管理員登入流程

1.  **訪問**: 管理員訪問 `/admin/rules`。
2.  **攔截**: `src/middleware.ts` 攔截請求，檢查是否存在有效的登入 Session (例如，一個加密的 Cookie)。
3.  **重導**: 如果 Session 無效，將使用者重導至 `/login`。
4.  **提交**: 使用者在 `/login` 頁面輸入預設帳號密碼並提交。
5.  **驗證**: Next.js 後端 API 驗證帳密是否與環境變數中設定的預設值匹配。
6.  **設定 Session**: 驗證成功後，建立一個加密的 Session Cookie 並回傳給瀏覽器。
7.  **重導**: 將使用者重導回他最初想訪問的 `/admin/rules` 頁面。

### 8.2. Agent API Token 驗證流程

1.  **請求**: AI Agent 向 Worker 的任一端點 (如 `/context`) 發起請求。
2.  **攔截**: Worker 的路由處理器會先執行一個認證中間件 (`worker/src/middleware/auth.ts`)。
3.  **提取 Token**: 中間件從 `Authorization` Header 中提取 Bearer Token。如果不存在，立即回傳 `401 Unauthorized`。
4.  **雜湊與比對**:
    *   中間件對收到的 Token 進行雜湊運算 (例如，使用 SHA-256)。
    *   使用 Prisma Client 查詢 D1 資料庫中的 `ApiToken` 表，尋找 `hashedToken` 欄位與計算出的雜湊值匹配的紀錄。
5.  **決策**:
    *   如果找到匹配的紀錄，則認為請求已授權，將請求傳遞給下一個處理函式。
    *   如果找不到匹配的紀錄，回傳 `403 Forbidden`。

## 9. Code Quality & Formatting

為確保程式碼庫的一致性、可讀性和健壯性，我們將實施一套自動化的程式碼品質與格式化流程。

### 9.1. Tooling & Versions

| 類別 | Library | 版本 | 用途 |
| :--- | :--- | :--- | :--- |
| **Linter** | ESLint | `^8.57.0` | 檢測程式碼中的錯誤與不規範寫法 |
| **Formatter** | Prettier | `^3.3.2` | 自動格式化程式碼，保持風格統一 |
| **整合工具** | eslint-config-prettier | `^9.1.0` | 關閉 ESLint 中與 Prettier 衝突的樣式規則 |
| **Git Hooks** | husky | `^9.0.11` | 輕鬆管理 Git Hooks |
| **暫存檔處理** | lint-staged | `^15.2.7` | 在 Pre-commit Hook 中僅對暫存檔案執行指令 |

### 9.2. Automation Workflow

此工作流程將在開發過程中無縫整合，確保提交到版本庫的都是符合規範的程式碼。

1.  **開發中 (IDE)**:
    *   開發者在 VS Code 中安裝 `ESLint` 和 `Prettier - Code formatter` 擴充套件。
    *   在專案的 `.vscode/settings.json` 中配置 **format on save**。當開發者儲存檔案時，Prettier 會自動格式化程式碼。

2.  **提交前 (Pre-commit)**:
    *   開發者執行 `git commit`。
    *   `husky` 觸發 `pre-commit` hook。
    *   `pre-commit` hook 執行 `lint-staged`。
    *   `lint-staged` 會對所有被 `git add` 的檔案 (`*.{js,ts,tsx}`) 執行以下兩個指令：
        1.  `prettier --write`: 確保程式碼被 Prettier 格式化。
        2.  `eslint --fix`: 執行 ESLint 檢查，並自動修復所有可修復的問題。
    *   **結果**:
        *   **成功**: 如果沒有任何錯誤，commit 流程會繼續。
        *   **失敗**: 如果 Prettier 或 ESLint 報告了無法自動修復的錯誤，commit 將被**自動中止**，並在控制台顯示錯誤訊息。開發者必須手動修復問題後才能再次提交。

### 9.3. Configuration Files

專案根目錄將包含以下設定檔：

*   `.eslintrc.json`: ESLint 設定檔，繼承 `next/core-web-vitals` 和 `prettier` 規則。
*   `.prettierrc`: Prettier 設定檔，定義程式碼風格（如單引號、縮排寬度等）。
*   `.lintstagedrc.js`: `lint-staged` 的設定檔，定義在 pre-commit 階段要執行的指令。
    ```javascript
    module.exports = {
      // 對所有指定的檔案執行 Prettier 和 ESLint
      '**/*.{js,ts,tsx}': [
        'prettier --write',
        'eslint --fix',
      ],
    };
    ```
*   `husky` 的設定將透過 `npx husky init` 指令生成在 `.husky/` 目錄中。