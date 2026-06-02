# AGENTS.md — edu-nexus-web

> Tài liệu dành cho các AI agent (Codex, Cursor, Cline, Claude Code, ...) và dev mới khi làm việc trên codebase frontend của dự án **Edu Nexus**.
> Mục tiêu: giúp AI/dev mới hiểu nhanh cấu trúc repo, quy ước code, i18n/theme/SSR, và “đường đi nước bước” khi thêm feature / route mới.

---

## 1. Bối cảnh dự án (Project Context)

- **Tên dự án:** Edu Nexus — nền tảng learning platform (SSR + SPA runtime).
- **Khoá / môn:** FPT University, semester 7, môn **EXE**.
- **Repo:** Frontend web app (`edu-nexus-web`).
- **Yêu cầu UI:** đa ngôn ngữ (mặc định **VI**, hỗ trợ EN) + dark/light mode.
- **Nguyên tắc cốt lõi:** dễ maintain, dễ mở rộng, “thin routes”, feature tách bạch.

---

## 2. Stack & phiên bản

| Lớp | Công nghệ | Phiên bản |
| --- | --- | --- |
| Framework | React Router 7 (SSR) | `7.14.0` |
| UI Runtime | React + React DOM | `^19.2.4` |
| Ngôn ngữ | TypeScript (strict) | `^5.9.3` |
| Build / Dev server | Vite | `^8.0.3` |
| CSS | Tailwind CSS v4 (CSS-first) | `^4.2.2` |
| i18n | i18next + react-i18next + detector | mới nhất |
| Class merge util | clsx + tailwind-merge (`cn()`) | mới nhất |
| Mock API | MSW + @faker-js/faker | mới nhất |
| API codegen | Orval (khi BE có swagger) | mới nhất |

**Lưu ý quan trọng**
- Tailwind v4 dùng cấu hình CSS-first → **không có** `tailwind.config.*`. Token nằm trong `app/styles/theme.css` và đăng ký trong `app/styles/app.css`.
- Dùng `react-router` v7, **không** dùng `react-router-dom`.
- Path alias `~/*` → `./app/*`.

---

## 3. Kiến trúc thư mục (high-level)

Tổ chức theo hướng Feature-Sliced Design (tinh gọn):

- `app/routes.ts`: **route config** (đăng ký URL → route module)
- `app/routes/`: **route modules** (THIN) — chỉ compose page từ feature
- `app/features/`: business modules (dashboard, jd, assessment, cv, ...)
- `app/shared/`: cross-feature utilities + UI
- `app/providers/`: app-level providers (theme/i18n, ...)
- `app/locales/`: i18n resources theo namespace
- `app/mocks/`: MSW handlers/factories (dev only)
- `app/api/`: orval generated code

---

## 4. Quy tắc dependency (import boundary)

```
routes ─┬─► features ─┐
        │             ├─► shared
        └─► providers ┘

(shared không import ngược lên features/routes)
```

- `routes/*` chỉ import `features/*` (qua barrel) và đôi khi `shared/*`.
- `features/*` được dùng `shared/*`. **Không import chéo giữa các feature**.
- `shared/*` không bao giờ import `features/*` hay `routes/*`.
- `mocks/*` chỉ dùng trong `mocks/*` + `entry.client.tsx`.

---

## 5. Routing (React Router 7) — chuẩn “thin routes”

### 5.1 Route config
- Toàn bộ routes đăng ký trong `app/routes.ts` (không auto-discovery).
- Route module types được generate vào `./.react-router/types`.

### 5.2 Quy ước route module
- Route module trong `app/routes/**` **không** xử lý business logic.
- Route module chỉ:
  - export `meta` (nếu cần)
  - render page component từ `features/*`

Ví dụ (pattern):

```tsx
import { DashboardPage } from "~/features/dashboard";

export default function DashboardRoute() {
  return <DashboardPage />;
}
```

### 5.3 Nhóm route theo domain
`app/routes/` được nhóm theo domain để dễ maintain:

- `routes/marketing/*`
- `routes/auth/*`
- `routes/onboarding/*`
- `routes/dashboard/*`
  - sub-domains: `dashboard/jd/*`, `dashboard/assessment-paths/*`, `dashboard/analytics/*`, `dashboard/learning/*`, `dashboard/market/*`, `dashboard/credentials/*`, `dashboard/settings/*`, `dashboard/legacy/*`
- `routes/admin/*`

---

## 6. i18n (EN/VI)

### 6.1 Quy tắc
- Mỗi feature 1 namespace, mỗi namespace 1 file.
- Key phải có trong **cả EN và VI**.
- Không ghép chuỗi — dùng interpolation `{{name}}`.

### 6.2 Cấu trúc locales

```
app/locales/
├── en/
│   ├── common.json
│   ├── dashboard.json
│   ├── jd.json
│   ├── assessment.json
│   └── cv.json
└── vi/
    ├── common.json
    ├── dashboard.json
    ├── jd.json
    ├── assessment.json
    └── cv.json
```

### 6.3 Đăng ký resources
- File: `app/shared/lib/i18n/resources.ts`
  - import từng namespace
  - add vào `resources.{en,vi}`
  - add namespace vào `NAMESPACES`

---

## 7. Theme (Dark/Light) — token-driven

- Token nằm ở `app/styles/theme.css`.
- Component chỉ dùng semantic classes (`bg-primary`, `text-foreground`, ...).
- Không hardcode màu kiểu `bg-orange-500`.

---

## 8. Lint / Format / Typecheck

```bash
pnpm -s exec tsc -p tsconfig.json --noEmit
pnpm run lint
pnpm run prettier
```

---

## 9. DO / DON'T

### ✅ DO
- Route module phải THIN.
- Feature export qua `features/<feature>/index.ts`.
- Thêm i18n key ở cả EN+VI, đúng namespace.

### ❌ DON'T
- Không tạo `tailwind.config.*`.
- Không import chéo `features/*`.
- Không import locales trực tiếp trong component (phải dùng `useTranslation`).
- Không commit khi user chưa yêu cầu.
