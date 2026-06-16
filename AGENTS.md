# AGENTS.md — edu-nexus-web

> Tài liệu dành cho các AI agent (Codex, Cursor, Cline, Claude Code, ...) và dev mới khi làm việc trên codebase frontend của dự án **Edu Nexus**.
> Mục tiêu: giúp AI/dev mới hiểu nhanh cấu trúc repo, quy ước code, i18n/theme/SSR, và "đường đi nước bước" khi thêm feature / route mới.

---

## 1. Bối cảnh dự án (Project Context)

- **Tên dự án:** Edu Nexus — nền tảng learning platform (SSR + SPA runtime).
- **Khoá / môn:** FPT University, Semester 8, môn **EXE**.
- **Repo:** Frontend web app (`edu-nexus-web`).
- **Yêu cầu UI:** đa ngôn ngữ (mặc định **VI**, hỗ trợ EN) + dark/light mode.
- **Nguyên tắc cốt lõi:** dễ maintain, dễ mở rộng, "thin routes", feature tách bạch.

---

## 2. Stack & phiên bản

| Lớp                | Công nghệ                                          | Phiên bản             |
| ------------------ | -------------------------------------------------- | --------------------- |
| Framework          | React Router 7 (SSR)                               | `7.14.0`              |
| UI Runtime         | React + React DOM                                  | `^19.2.4`             |
| Ngôn ngữ           | TypeScript (strict)                                | `^5.9.3`              |
| Build / Dev server | Vite                                               | `^8.0.3`              |
| CSS                | Tailwind CSS v4 (CSS-first)                        | `^4.2.2`              |
| i18n               | i18next + react-i18next + browser-languagedetector | `^26.0.8` / `^17.0.6` |
| Class merge util   | clsx + tailwind-merge (`cn()`)                     | `^2.1.1` / `^3.5.0`   |
| Mock API           | MSW + @faker-js/faker                              | `^2.14.2` / `^10.4.0` |
| API codegen        | Orval (OpenAPI → TypeScript)                       | `^7.13.2`             |

**Lưu ý quan trọng:**

- Tailwind v4 dùng cấu hình CSS-first → **không có** `tailwind.config.*`. Token nằm trong `app/styles/theme.css`.
- Dùng `react-router` v7, **không** dùng `react-router-dom`.
- Path alias `~/*` → `./app/*`.

---

## 3. Kiến trúc thư mục (high-level)

Tổ chức theo hướng **Feature-Sliced Design** (tinh gọn):

```
app/
├── routes.ts          → Route config tập trung (React Router 7)
├── root.tsx           → App entry, mount providers
├── entry.client.tsx   → Client-side hydration + MSW bootstrap
├── routes/            → Route modules THIN (compose page từ features)
│   ├── marketing/
│   ├── auth/
│   ├── onboarding/
│   ├── dashboard/
│   ├── admin/
│   └── jd/            → Legacy redirect routes
├── features/          → Business feature modules (11 features)
│   ├── admin/
│   ├── assessment/
│   ├── auth/
│   ├── cv/
│   ├── dashboard/
│   ├── jd/
│   ├── landing/
│   ├── portfolio/
│   ├── pricing/
│   ├── sprint1/
│   └── welcome/
├── shared/            → Cross-feature utilities & UI
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── config/
│   ├── types/
│   └── ui/
├── providers/         → App-level providers (ThemeProvider, I18nProvider)
├── locales/           → i18n JSON resources (en/ và vi/, 14 namespace)
├── api/               → Orval generated (model/, mutator/, operations/)
├── mocks/             → MSW handlers + factories (dev only)
└── styles/            → Global CSS + design tokens (app.css, theme.css)
```

---

## 4. Quy tắc dependency (import boundary)

```
routes ─┬─► features ─┐
        │             ├─► shared
        └─► providers ┘

(shared không import ngược lên features/routes)
(mocks chỉ import trong mocks/ + entry.client.tsx)
```

- `routes/*` chỉ import `features/*` (qua barrel) và đôi khi `shared/*`.
- `features/*` được dùng `shared/*` và `api/*`. **Không import chéo giữa các feature.**
- `shared/*` không bao giờ import `features/*` hay `routes/*`.
- `api/*` là generated code, không sửa tay.
- `mocks/*` chỉ dùng trong `mocks/*` + `entry.client.tsx`.

---

## 5. Routing (React Router 7) — chuẩn "thin routes"

### 5.1 Route config

Toàn bộ routes đăng ký trong `app/routes.ts`, nhóm bằng 5 hàm:

- `marketing()` → public landing pages
- `auth()` → `/signup`, `/login`, `/register`
- `onboarding()` → `/onboarding`
- `dashboard()` → `/dashboard/*` (wrapped bởi `dashboard/layout.tsx`)
- `admin()` → `/admin/*` (wrapped bởi `admin/layout.tsx`)

Ngoài ra có redirect routes `jd/*` → `dashboard/jd/*` để tương thích URL cũ.

### 5.2 Quy ước route module

Route module trong `app/routes/**` **không** xử lý business logic.
Route module chỉ:

- export `meta` (nếu cần)
- render page component từ `features/*`

```tsx
// ✅ Đúng pattern
import { JdNewPage } from '~/features/jd'

export default function JdNewRoute() {
  return <JdNewPage />
}
```

### 5.3 Nhóm route theo domain

```
app/routes/
├── marketing/   → home, pricing, checkout, checkout-success, contact, portfolio-public
├── auth/        → login, signup, register-redirect
├── onboarding/  → index
├── dashboard/
│   ├── layout.tsx + index.tsx
│   ├── jd/new + jd/$jdId/{index,assessment,assessment-results}
│   ├── assessment-paths/$pathId/cv
│   ├── analytics/{gap-analysis,analysis-history}
│   ├── learning/{learning-path,roadmap,career-track}
│   ├── market/index
│   ├── credentials/certificates
│   ├── portfolio/index
│   └── settings/index
├── admin/       → layout, index, resources, rag-documents, skills, revenue,
│                  users, user-detail, subscriptions, jd-logs, jd-log-detail
└── jd/          → jd-redirects (legacy URL support)
```

### 5.4 Spec-routes (alias routes)

Một số URL không có prefix `dashboard/` được đăng ký với `id` riêng để tương thích đặc tả:

| Spec URL             | File thực tế                                 | Route ID                         |
| -------------------- | -------------------------------------------- | -------------------------------- |
| `/portfolio`         | `routes/dashboard/portfolio/index.tsx`       | `portfolio-spec-route`           |
| `/settings`          | `routes/dashboard/settings/index.tsx`        | `settings-spec-route`            |
| `/roadmaps`          | `routes/dashboard/learning/roadmap.tsx`      | `roadmaps-spec-route`            |
| `/career-tracks`     | `routes/dashboard/learning/career-track.tsx` | `career-tracks-spec-route`       |
| `/career-tracks/:id` | `routes/dashboard/learning/career-track.tsx` | `career-track-detail-spec-route` |

---

## 6. Features — Public API & cấu trúc nội bộ

Mỗi feature export ra ngoài **chỉ qua `index.ts`**:

```
app/features/<feature>/
├── pages/       → page-level components
├── components/  → UI components nội bộ (tổ chức theo sub-domain)
├── hooks/       → custom hooks nội bộ (nếu có)
├── lib/         → helpers nội bộ (nếu có)
└── index.ts     → barrel export (public API duy nhất)
```

### Features hiện tại

| Feature      | Pages      | Có components/ | Có hooks/ | Có lib/ |
| ------------ | ---------- | -------------- | --------- | ------- |
| `admin`      | 10         | ✅             | —         | ✅      |
| `assessment` | 2          | —              | —         | —       |
| `auth`       | 2          | ✅             | —         | ✅      |
| `cv`         | 1          | —              | —         | —       |
| `dashboard`  | 9 + layout | ✅             | ✅        | ✅      |
| `jd`         | 2          | ✅             | —         | —       |
| `landing`    | 4 + layout | ✅             | —         | —       |
| `portfolio`  | 2          | —              | ✅        | ✅      |
| `pricing`    | 1          | ✅             | —         | ✅      |
| `sprint1`    | (legacy)   | —              | —         | —       |
| `welcome`    | 1          | ✅             | —         | —       |

---

## 7. Shared layer — chi tiết

### 7.1 `shared/lib/`

| File                     | Công dụng                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `auth-session.ts`        | Quản lý `AuthSession` trong localStorage (getAuthSession, setAuthSession, clearAuthSession, getAccessToken, updateTokens) |
| `cn.ts`                  | `cn(...inputs)` = clsx + tailwind-merge                                                                                   |
| `format-date.ts`         | Định dạng ngày tháng                                                                                                      |
| `get-meta-t.ts`          | Helper tạo meta tags cho i18n (SSR-safe)                                                                                  |
| `storage.ts`             | Wrapper an toàn cho localStorage (`readStorage`, `writeStorage`, `removeStorage`)                                         |
| `sprint2-api-runtime.ts` | Thin API wrappers: gap-analysis, roadmap, career-tracks                                                                   |
| `assessment-api.ts`      | Thin API wrappers: assessment sessions                                                                                    |
| `i18n/index.ts`          | i18next instance khởi tạo                                                                                                 |
| `i18n/resources.ts`      | `NAMESPACES`, `resources`, `SUPPORTED_LANGUAGES`, `FALLBACK_LANGUAGE`                                                     |

### 7.2 `shared/ui/` — Primitive components

| Component      | Mô tả           |
| -------------- | --------------- |
| `button.tsx`   | Button variants |
| `input.tsx`    | Text input      |
| `textarea.tsx` | Textarea        |
| `card.tsx`     | Card container  |
| `badge.tsx`    | Status badge    |

### 7.3 `shared/components/` — Cross-feature components

| Component                  | Mô tả                |
| -------------------------- | -------------------- |
| `language-switcher.tsx`    | Toggle EN / VI       |
| `theme-toggle.tsx`         | Toggle dark / light  |
| `toast-provider.tsx`       | Toast notifications  |
| `quota-exceeded-modal.tsx` | Modal khi vượt quota |

### 7.4 `shared/hooks/`

| Hook                   | Mô tả                             |
| ---------------------- | --------------------------------- |
| `use-click-outside.ts` | Detect click ngoài element        |
| `use-debounce.ts`      | Debounce value                    |
| `use-hydrated.ts`      | SSR-safe: biết khi nào đã hydrate |
| `use-media-query.ts`   | Responsive breakpoint detection   |

### 7.5 `shared/config/`

| File      | Nội dung                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `env.ts`  | Typed Vite env vars: `VITE_API_URL`, `VITE_APP_ENV`, `VITE_ENABLE_MOCK`, `VITE_ENABLE_GOOGLE_LOGIN`, `VITE_GOOGLE_CLIENT_ID` |
| `site.ts` | `STORAGE_KEYS` và hằng số site-wide                                                                                          |

---

## 8. i18n (EN / VI)

### 8.1 Quy tắc

- Mỗi feature 1 namespace, mỗi namespace 1 file JSON.
- Key phải có trong **cả EN và VI**.
- Không ghép chuỗi — dùng interpolation `{{name}}`.
- Component dùng `useTranslation('namespace')`, không import JSON trực tiếp.

### 8.2 Namespaces (14 namespace)

```
common | welcome | landing | pricing | subscription | auth
dashboard | settings | admin | jd | assessment | cv | onboarding | portfolio
```

### 8.3 Đăng ký namespace mới

Sửa file `app/shared/lib/i18n/resources.ts`:

1. Import `en<Name>` và `vi<Name>` từ `~/locales/en/<name>.json`.
2. Thêm vào `NAMESPACES` array.
3. Thêm vào `resources.en` và `resources.vi`.

---

## 9. Theme (Dark/Light) — token-driven

- Token nằm ở `app/styles/theme.css` (CSS custom properties).
- Component chỉ dùng semantic classes: `bg-primary`, `text-foreground`, `border-border`, `bg-card`, ...
- Không hardcode màu kiểu `bg-orange-500` hay `text-[#fff]`.
- `ThemeProvider` đọc từ localStorage, SSR-safe bằng cơ chế "mount-then-render".

---

## 10. API & Mock

### 10.1 Orval (generated code)

```bash
pnpm orval          # generate từ OpenAPI spec
pnpm orval:watch    # watch mode
```

Không sửa tay bất kỳ file nào trong `app/api/`.

### 10.2 MSW (mock)

- Bật mock: đặt `VITE_ENABLE_MOCK=true` trong `.env`.
- Thêm handler: tạo file `app/mocks/handlers/<feature>.handler.ts`, sau đó export trong `app/mocks/handlers/index.ts`.
- Factory: `app/mocks/factories/` dùng `@faker-js/faker`.

---

## 11. Lint / Format / Typecheck

```bash
pnpm -s exec tsc -p tsconfig.json --noEmit    # typecheck
pnpm run lint                                   # ESLint
pnpm run lint:fix                              # ESLint auto-fix
pnpm run prettier                              # check format
pnpm run prettier:fix                          # auto-format
```

---

## 12. Scripts thường dùng

```bash
pnpm dev            # dev server (SSR mode)
pnpm build          # production build
pnpm start          # serve production build (node)
pnpm start:csr      # serve production build (CSR/vite preview)
pnpm typecheck      # typegen + tsc
pnpm orval          # regenerate API types từ OpenAPI
```

---

## 13. Workflow khi thêm feature mới

### Step 1 — Tạo feature directory

```
app/features/<feature>/
├── pages/
│   └── <feature>-page.tsx
├── components/   (nếu cần)
├── hooks/        (nếu cần)
├── lib/          (nếu cần)
└── index.ts
```

### Step 2 — Đăng ký route

Thêm vào hàm tương ứng trong `app/routes.ts`:

```ts
route('dashboard/<feature>', 'routes/dashboard/<feature>/index.tsx')
```

### Step 3 — Tạo route module THIN

```tsx
// app/routes/dashboard/<feature>/index.tsx
import { <Feature>Page } from '~/features/<feature>'

export default function <Feature>Route() {
  return <<Feature>Page />
}
```

### Step 4 — Thêm i18n

```bash
# Tạo file
app/locales/en/<feature>.json
app/locales/vi/<feature>.json
```

Đăng ký trong `app/shared/lib/i18n/resources.ts`.

### Step 5 — Verify

```bash
pnpm -s exec tsc -p tsconfig.json --noEmit
pnpm run lint
```

---

## 14. DO / DON'T

### ✅ DO

- Route module phải THIN — chỉ import page từ feature.
- Feature export **chỉ qua** `features/<feature>/index.ts`.
- Thêm i18n key ở cả EN+VI, đúng namespace.
- Dùng semantic color classes từ design tokens.
- Dùng `cn()` khi merge Tailwind classes.
- Dùng `useTranslation('namespace')` để lấy text.
- Chạy typecheck trước khi kết thúc task.

### ❌ DON'T

- Không tạo `tailwind.config.*`.
- Không import chéo `features/*`.
- Không import locales JSON trực tiếp trong component (phải dùng `useTranslation`).
- Không sửa tay file trong `app/api/`.
- Không commit khi user chưa yêu cầu.
- Không hardcode màu hex/RGB trong component.
- Không để business logic trong route module.
