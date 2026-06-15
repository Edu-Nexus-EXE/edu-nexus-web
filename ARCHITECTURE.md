# Kiến trúc src — edu-nexus-web

> Tài liệu giải thích cách tổ chức source code của **edu-nexus-web** kèm cấu trúc thực tế đã mapping từ codebase.
> Đọc file này trước khi code feature mới hoặc refactor lớn.
>
> Tài liệu liên quan:
> - [`AGENTS.md`](./AGENTS.md) — quy ước & checklist cho AI/dev
> - [`README.md`](./README.md) — setup & scripts

---

## 1. Mục tiêu kiến trúc

- Dễ maintain và debug khi app lớn dần.
- Route modules mỏng (thin) → business logic nằm trong `features/`.
- Feature tách bạch, tránh import chéo giữa các feature.
- i18n theo namespace để scale.
- SSR-safe: tránh hydration mismatch khi đọc `localStorage`.

---

## 2. Layer overview

| Thư mục | Vai trò | Ghi chú |
| --- | --- | --- |
| `app/routes.ts` | Bản đồ URL tập trung | Đăng ký toàn bộ route config (React Router 7) |
| `app/routes/` | Route module THIN | URL → render page từ `features/*` |
| `app/features/` | Business feature modules | 11 feature: admin, assessment, auth, cv, dashboard, jd, landing, portfolio, pricing, sprint1, welcome |
| `app/shared/` | Cross-feature utilities | components, hooks, lib, config, ui |
| `app/providers/` | App-level providers | ThemeProvider, I18nProvider, AppProviders |
| `app/locales/` | i18n resources | 14 namespace × 2 ngôn ngữ (EN / VI) |
| `app/api/` | Orval generated code | operations/, model/, mutator/ |
| `app/mocks/` | MSW mock layer | handlers/, factories/ — dev only |
| `app/styles/` | Global styles + design tokens | app.css, theme.css |

### Quy tắc vàng (dependency direction)

```
routes ─┬─► features ─┐
        │             ├─► shared
        └─► providers ┘

(shared không import ngược lên features/routes)
(mocks chỉ được dùng trong mocks/ và entry.client.tsx)
```

---

## 3. Routing — React Router 7

### 3.1 Route config tập trung

File `app/routes.ts` là nơi **duy nhất** đăng ký route. Routes được nhóm bằng 5 hàm:

| Hàm | Domain | URL prefix |
| --- | --- | --- |
| `marketing()` | Landing / public pages | `/`, `/pricing`, `/checkout`, `/p/:slug`, ... |
| `auth()` | Xác thực | `/signup`, `/login`, `/register` |
| `onboarding()` | Onboarding wizard | `/onboarding` |
| `dashboard()` | User dashboard (có layout) | `/dashboard/*` |
| `admin()` | Admin panel (có layout) | `/admin/*` |

Ngoài ra còn có các **redirect routes** cho URL legacy `/jd/*` → `/dashboard/jd/*`.

### 3.2 Route module THIN

Route module chỉ làm 2 việc:
1. Export `meta()` (nếu cần)
2. Render page component từ `features/*`

**Ví dụ:**

```tsx
// app/routes/dashboard/jd/new.tsx
import { JdNewPage } from '~/features/jd'

export default function JdNewRoute() {
  return <JdNewPage />
}
```

### 3.3 Cấu trúc routes/ (thực tế)

```
app/routes/
├── marketing/
│   ├── home.tsx              → /
│   ├── pricing.tsx           → /pricing
│   ├── checkout.tsx          → /checkout
│   ├── checkout-success.tsx  → /checkout-success
│   ├── contact.tsx           → /contact
│   └── portfolio-public.tsx  → /p/:slug
├── auth/
│   ├── login.tsx             → /login
│   ├── signup.tsx            → /signup
│   └── register-redirect.tsx → /register
├── onboarding/
│   └── index.tsx             → /onboarding
├── dashboard/
│   ├── layout.tsx            (layout wrapper — DashboardLayout)
│   ├── index.tsx             → /dashboard
│   ├── jd/
│   │   ├── new.tsx                          → /dashboard/jd/new
│   │   └── $jdId/
│   │       ├── index.tsx                    → /dashboard/jd/:jdId
│   │       ├── assessment.tsx               → /dashboard/jd/:jdId/assessment
│   │       └── assessment-results.tsx       → /dashboard/jd/:jdId/assessment/results
│   ├── assessment-paths/
│   │   └── $pathId/
│   │       └── cv.tsx                       → /dashboard/assessment-paths/:pathId/cv
│   ├── analytics/
│   │   ├── gap-analysis.tsx                 → /dashboard/analytics/gap-analysis
│   │   └── analysis-history.tsx             → /dashboard/analytics/analysis-history
│   ├── learning/
│   │   ├── learning-path.tsx                → /dashboard/learning/learning-path
│   │   ├── roadmap.tsx                      → /dashboard/learning/roadmap
│   │   └── career-track.tsx                 → /dashboard/learning/career-track
│   ├── market/
│   │   └── index.tsx                        → /dashboard/market
│   ├── credentials/
│   │   └── certificates.tsx                 → /dashboard/credentials/certificates
│   ├── portfolio/
│   │   └── index.tsx                        → /dashboard/portfolio
│   └── settings/
│       └── index.tsx                        → /dashboard/settings
├── admin/
│   ├── layout.tsx            (layout wrapper — AdminLayout)
│   ├── index.tsx             → /admin
│   ├── resources.tsx         → /admin/resources
│   ├── rag-documents.tsx     → /admin/rag-documents
│   ├── skills.tsx            → /admin/skills
│   ├── revenue.tsx           → /admin/revenue
│   ├── users.tsx             → /admin/users
│   ├── user-detail.tsx       → /admin/users/:id
│   ├── subscriptions.tsx     → /admin/subscriptions
│   ├── jd-logs.tsx           → /admin/jd-logs
│   └── jd-log-detail.tsx     → /admin/jd-logs/:id
└── jd/
    ├── jd-redirects.tsx      (redirect /jd/* → /dashboard/jd/*)
    └── $jdId/
```

> **Spec-routes**: Một số URL alias không có prefix `dashboard/` hoặc `admin/` (ví dụ `/portfolio`, `/settings`, `/roadmaps`, `/career-tracks`) được đăng ký riêng với `id` định danh để tương thích với đặc tả API.

---

## 4. Features (business modules)

Mỗi feature có **public API barrel** (`index.ts`) và tuân theo cấu trúc:

```
app/features/<feature>/
├── pages/       → page-level components
├── components/  → UI components nội bộ feature (tổ chức theo sub-domain)
├── hooks/       → custom hooks nội bộ (nếu có)
├── lib/         → utilities, helpers nội bộ (nếu có)
└── index.ts     → barrel export (public API duy nhất ra ngoài)
```

### Feature map

| Feature | Exports chính | Pages |
| --- | --- | --- |
| `admin` | AdminDashboardPage, AdminUserManagementPage, AdminUserDetailPage, AdminRevenuePage, AdminSubscriptionPage, AdminJdLogsPage, AdminJdLogDetailPage, AdminResourceManagementPage, AdminRagManagementPage, AdminSkillsQueuePage, AdminLayout | 10 pages |
| `assessment` | AssessmentPage, AssessmentResultsPage | 2 pages |
| `auth` | LoginPage, SignupPage | 2 pages |
| `cv` | AssessmentCvPage | 1 page |
| `dashboard` | DashboardPage, GapAnalysisPage, AnalysisHistoryPage, LearningPathPage, CareerTrackPage, RoadmapPage, MarketPage, SettingsPage, CertificatesPage, DashboardLayout | 9 pages + layout |
| `jd` | JdDetailPage, JdNewPage | 2 pages |
| `landing` | LandingPage, CheckoutPage, CheckoutSuccessPage, ContactPage, MarketingLayout, LandingNavbar, LandingFooter | 4 pages + layout |
| `portfolio` | PortfolioEditorPage, PortfolioPublicPage | 2 pages |
| `pricing` | PricingPage | 1 page |
| `sprint1` | *(internal legacy, không export ra ngoài)* | — |
| `welcome` | WelcomePage | 1 page |

### Quy tắc import

```ts
// ✅ Route module import từ barrel
import { JdNewPage } from '~/features/jd'

// ❌ Không import trực tiếp vào trong feature
import { JdNewPage } from '~/features/jd/pages/jd-new-page'

// ❌ Không import chéo giữa các feature
import { DashboardLayout } from '~/features/dashboard'  // trong features/jd → SAI
```

---

## 5. Shared layer

`app/shared/` chứa code **không thuộc bất kỳ feature nào** và có thể dùng bởi nhiều feature:

```
app/shared/
├── components/              → Cross-feature UI components
│   ├── language-switcher.tsx
│   ├── theme-toggle.tsx
│   ├── toast-provider.tsx
│   └── quota-exceeded-modal.tsx
├── hooks/                   → Cross-feature React hooks
│   ├── use-click-outside.ts
│   ├── use-debounce.ts
│   ├── use-hydrated.ts
│   └── use-media-query.ts
├── lib/                     → Utilities & helpers
│   ├── auth-session.ts      → Quản lý AuthSession (localStorage)
│   ├── cn.ts                → clsx + tailwind-merge helper
│   ├── format-date.ts       → Date formatting
│   ├── get-meta-t.ts        → Helper tạo <meta> tags cho i18n
│   ├── storage.ts           → Wrapper localStorage
│   ├── sprint2-api-runtime.ts → API wrappers cho roadmap/gap-analysis/career-tracks
│   ├── assessment-api.ts    → API wrappers cho assessment
│   └── i18n/
│       ├── index.ts         → i18next instance setup
│       └── resources.ts     → NAMESPACES, resources, SUPPORTED_LANGUAGES, FALLBACK_LANGUAGE
├── config/
│   ├── env.ts               → Typed Vite env vars (VITE_API_URL, VITE_ENABLE_MOCK, ...)
│   └── site.ts              → STORAGE_KEYS và các hằng số site-wide
├── types/                   → (reserved — hiện rỗng)
└── ui/                      → Headless / primitive UI components
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── textarea.tsx
```

---

## 6. Providers

`app/providers/` — App-level context providers, được mount trong `root.tsx`:

| File | Chức năng |
| --- | --- |
| `app-providers.tsx` | Wrapper tổng hợp, mount ThemeProvider + I18nProvider |
| `theme-provider.tsx` | Dark/Light mode, đọc từ `localStorage`, SSR-safe |
| `i18n-provider.tsx` | Khởi tạo i18next, mount-then-render để tránh hydration mismatch |

---

## 7. i18n (EN / VI)

### Namespace hiện tại

| Namespace | Feature tương ứng |
| --- | --- |
| `common` | Cross-feature |
| `welcome` | `welcome` |
| `landing` | `landing` |
| `pricing` | `pricing` |
| `subscription` | Subscription / checkout |
| `auth` | `auth` |
| `dashboard` | `dashboard` |
| `settings` | Settings trong dashboard |
| `admin` | `admin` |
| `jd` | `jd` |
| `assessment` | `assessment` |
| `cv` | `cv` |
| `onboarding` | Onboarding wizard |
| `portfolio` | `portfolio` |

**14 namespace**, đăng ký trong `app/shared/lib/i18n/resources.ts`.

### Cấu trúc locales

```
app/locales/
├── en/
│   ├── admin.json
│   ├── assessment.json
│   ├── auth.json
│   ├── common.json
│   ├── cv.json
│   ├── dashboard.json
│   ├── jd.json
│   ├── landing.json
│   ├── onboarding.json
│   ├── portfolio.json
│   ├── pricing.json
│   ├── settings.json
│   ├── subscription.json
│   └── welcome.json
└── vi/
    └── (same 14 files)
```

### Quy tắc i18n

- Mỗi namespace 1 file JSON.
- Key phải có ở **cả EN và VI**.
- Không ghép chuỗi — dùng interpolation `{{name}}`.
- Component dùng `useTranslation('namespace')`, không import JSON trực tiếp.

---

## 8. API Layer

### 8.1 Orval generated code

`app/api/` — được sinh tự động từ OpenAPI spec bằng `pnpm orval`:

```
app/api/
├── model/         → TypeScript types / interfaces
├── mutator/       → Custom axios/fetch mutator (auth header, token refresh)
└── operations/    → Generated API functions, nhóm theo resource:
    ├── admin-jds/
    ├── admin-payments/
    ├── admin-rag-documents/
    ├── admin-resources/
    ├── admin-skills/
    ├── admin-subscription-tiers/
    ├── admin-users/
    ├── assessment-paths/
    ├── assessment-sessions/
    ├── auth/
    ├── career-tracks/
    ├── cv-submissions/
    ├── gap-analysis/
    ├── jd-submissions/
    ├── onboarding/
    ├── portfolios/
    ├── roadmaps/
    ├── subscription/
    └── users/
```

> **Không sửa tay** các file trong `app/api/`. Chạy `pnpm orval` để regenerate.

### 8.2 API Runtime helpers

`app/shared/lib/sprint2-api-runtime.ts` và `app/shared/lib/assessment-api.ts` là **thin wrappers** trên các generated functions, phục vụ các use-case phức tạp hơn (gap-analysis, roadmap, career-track, assessment).

### 8.3 Environment variables (API)

```
VITE_API_URL            → Base URL của backend API
VITE_APP_ENV            → development | staging | production
VITE_ENABLE_MOCK        → "true" để bật MSW mock
VITE_ENABLE_GOOGLE_LOGIN→ "true" để hiện nút Google login
VITE_GOOGLE_CLIENT_ID   → Google OAuth client ID
```

---

## 9. MSW Mock layer (dev only)

```
app/mocks/
├── browser.ts           → Service Worker setup (MSW)
├── handlers/
│   ├── index.ts         → Tổng hợp tất cả handlers
│   ├── jd.handler.ts    → JD submission mock handlers
│   └── example.handler.ts
└── factories/
    ├── index.ts
    ├── user.factory.ts  → Fake user data (faker-js)
    └── course.factory.ts
```

MSW chỉ được kích hoạt khi `VITE_ENABLE_MOCK=true` (trong `entry.client.tsx`).

---

## 10. Styles & Design System

```
app/styles/
├── theme.css   → CSS custom properties (design tokens: màu, spacing, radius, ...)
└── app.css     → Tailwind v4 import + global resets + utilities
```

- **Tailwind CSS v4** dùng CSS-first config — **không có** `tailwind.config.*`.
- Token semantic: `bg-primary`, `text-foreground`, `border-border`, ...
- Không hardcode màu hex/RGB trực tiếp trong component.

---

## 11. Checklist khi thêm feature mới

- [ ] Tạo thư mục `app/features/<feature>/` với cấu trúc `pages/`, `components/`, `hooks/`, `lib/`, `index.ts`.
- [ ] Thêm route vào đúng nhóm trong `app/routes.ts`.
- [ ] Tạo route module THIN trong `app/routes/<domain>/<feature>.tsx`.
- [ ] Thêm locale files `en/<feature>.json` và `vi/<feature>.json`.
- [ ] Đăng ký namespace trong `app/shared/lib/i18n/resources.ts`.
- [ ] Chạy `pnpm -s exec tsc -p tsconfig.json --noEmit` để typecheck.
- [ ] Không import chéo giữa các feature.
