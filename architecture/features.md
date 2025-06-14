# MCP Server - 功能與開發待辦清單

本文件是一個完整的待辦事項清單，旨在指導 MCP 伺服器專案從初始化到最終部署的整個開發過程。任務被劃分為多個史詩 (Epic)，以反映開發的各個階段。

## Epic 1: 專案初始化與基礎建設

此階段的目標是建立專案的骨架，設定開發環境和資料庫基礎。

-   [ ] **初始化專案倉庫**
    -   [ ] 建立一個新的 Git 倉庫。
    -   [ ] 建立 `README.md` 和 `.gitignore` 檔案。

-   [ ] **設定 Next.js 管理應用**
    -   [ ] 使用 `npx create-next-app@latest` 初始化 Next.js 專案。
    -   [ ] 按照設計稿建立專案目錄結構 (`/src`, `/components`, `/domains` 等)。

-   [ ] **設定 Cloudflare Worker**
    -   [ ] 在專案中初始化一個新的 Cloudflare Worker (`/worker` 目錄)。
    -   [ ] 配置 `wrangler.toml` 檔案。

-   [ ] **設定資料庫與 Prisma**
    -   [ ] 初始化 Prisma (`npx prisma init`)。
    -   [ ] 在 `prisma/schema.prisma` 中定義 `Rule`, `HistoryLog`, `ApiToken` 三個模型。
    -   [ ] 在 Cloudflare 儀表板中建立一個 D1 資料庫。
    -   [ ] 建立 `.env.example` 檔案，並在 `.env` 中配置 `DATABASE_URL`。

-   [ ] **設定前端 UI 框架**
    -   [ ] 安裝 MUI (`@mui/material`) 和 Emotion (`@emotion/react`)。
    -   [ ] 安裝 Tailwind CSS 並進行配置 (`tailwind.config.js`, `postcss.config.js`)。
    -   [ ] 建立一個 MUI `ThemeRegistry` 來整合 App Router。

## Epic 2: 程式碼品質與自動化流程

此階段的目標是建立自動化的品質保證機制，確保所有後續開發的程式碼風格統一且健壯。

-   [ ] **設定 Linting 與 Formatting**
    -   [ ] 安裝 ESLint 和 Prettier。
    -   [ ] 建立 `.eslintrc.json` 和 `.prettierrc` 設定檔。
    -   [ ] 安裝並設定 `eslint-config-prettier` 以解決規則衝突。

-   [ ] **設定 Git Pre-commit Hooks**
    -   [ ] 安裝 `husky` 和 `lint-staged`。
    -   [ ] 初始化 `husky` (`npx husky init`)。
    -   [ ] 建立 `pre-commit` hook，並在其中設定執行 `lint-staged`。
    -   [ ] 建立 `.lintstagedrc.js` 設定檔，指定對暫存檔案執行 `prettier` 和 `eslint`。

## Epic 3: 後端開發 - Agent API (Cloudflare Worker)

此階段專注於開發為 AI Agent 提供服務的核心 API。

-   [ ] **設定 Worker 的 Prisma Client**
    -   [ ] 安裝 `@prisma/adapter-cloudflare`。
    -   [ ] 在 Worker 的程式碼中初始化可供 Edge 環境使用的 Prisma Client。

-   [ ] **實作 API 安全機制**
    -   [ ] 建立一個 Worker 中間件，用於驗證 `Authorization: Bearer <TOKEN>`。
    -   [ ] Token 驗證邏輯：雜湊傳入的 Token 並與資料庫中的 `ApiToken` 進行比對。

-   [ ] **實作 API 端點**
    -   [ ] **`GET /health`**: 建立一個簡單的健康檢查端點。
    -   [ ] **`GET /discover`**: 建立端點，查詢並回傳所有已啟用規則的輕量摘要。
    -   [ ] **`GET /context`**: 建立核心端點，根據 `taskType` 查詢並回傳單一規則的完整 `content`。
        -   [ ] 在此端點中，使用 `context.waitUntil()` 實作**非同步**的請求日誌記錄 (`HistoryLog`)。

-   [ ] **建立資料庫種子資料**
    -   [ ] 建立一個 Prisma `seed` 腳本。
    -   [ ] 在腳本中至少建立一個可用的 `ApiToken`，以便於 API 測試。

## Epic 4: 後端開發 - 管理介面 API (Next.js)

此階段專注於為前端管理介面提供支援的後端 API (BFF)。

-   [ ] **實作管理員認證**
    -   [ ] 建立 Next.js Middleware (`src/middleware.ts`)，保護所有 `/admin/*` 路徑。
    -   [ ] 建立一個 API 端點 `POST /api/auth/login`，用於驗證預設帳密並設定加密的 Session Cookie。
    -   [ ] 建立一個 API 端點 `POST /api/auth/logout`，用於清除 Session Cookie。

-   [ ] **實作規則 (Rules) 的 CRUD API**
    -   [ ] `GET /api/admin/rules`: 獲取規則列表。
    -   [ ] `POST /api/admin/rules`: 新增一條規則。
    -   [ ] `GET /api/admin/rules/[id]`: 獲取單一規則詳情。
    -   [ ] `PUT /api/admin/rules/[id]`: 更新單一規則。
    -   [ ] `DELETE /api/admin/rules/[id]`: 刪除單一規則。

-   [ ] **實作歷史紀錄 (History) 的 API**
    -   [ ] `GET /api/admin/history`: 獲取 `HistoryLog` 的分頁列表。

## Epic 5: 前端開發 - 管理介面 UI (Next.js + MUI)

此階段專注於開發使用者可操作的管理介面。

-   [ ] **建立核心 UI 佈局**
    -   [ ] 建立受保護的路由群組 `(admin)/layout.tsx`，包含側邊欄導航或頂部導航列。
    -   [ ] 導航應包含「規則管理」和「請求歷史」的連結。

-   [ ] **開發頁面 (Pages)**
    -   [ ] **登入頁面 (`/login`)**: 建立一個包含帳號、密碼輸入框和提交按鈕的表單。
    -   [ ] **規則列表頁面 (`/admin/rules`)**:
        -   [ ] 呼叫 API 獲取規則列表。
        -   [ ] 使用 MUI `Table` 元件將規則資料渲染成表格。
        -   [ ] 實作新增、編輯、刪除按鈕的功能。
    -   [ ] **規則新增/編輯頁面 (`/admin/rules/[id]`)**:
        -   [ ] 建立一個可重用的 `RuleForm` 元件。
        -   [ ] 表單能根據 URL 中是否有 `id` 來判斷是處於「新增模式」還是「編輯模式」。
        -   [ ] 提交表單時，呼叫對應的後端 API。
    -   [ ] **請求歷史頁面 (`/admin/history`)**:
        -   [ ] 呼叫 API 獲取歷史紀錄。
        -   [ ] 使用 MUI `Table` 或 `List` 元件將日誌渲染出來。

## Epic 6: 部署與最終化

此階段的目標是將應用程式部署到雲端並完成最終的潤飾。

-   [ ] **部署應用程式**
    -   [ ] 將 Next.js 應用程式連接並部署到 Cloudflare Pages。
    -   [ ] 使用 Wrangler CLI 將 Cloudflare Worker 部署到正式環境。

-   [ ] **配置生產環境**
    -   [ ] 在 Cloudflare 儀表板中設定生產環境所需的環境變數（資料庫 URL、管理員帳密、API Token 等）。
    -   [ ] 將 D1 資料庫綁定到 Pages 應用和 Worker。

-   [ ] **撰寫專案文件**
    -   [ ] 更新 `README.md` 文件，包含：
        -   [ ] 專案介紹。
        -   [ ] 如何進行本地開發（環境變數設定、啟動指令）。
        -   [ ] 部署流程說明。

-   [ ] **端到端測試**
    -   [ ] 執行一次完整的端到端測試：登入 -> 新增規則 -> 使用 API 工具 (如 Postman) 帶 Token 請求 `/context` -> 驗證回應 -> 檢查歷史紀錄中是否已產生新日誌。