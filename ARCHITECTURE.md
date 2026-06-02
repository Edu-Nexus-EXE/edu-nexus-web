# Kiến trúc src — edu-nexus-web

> Tài liệu giải thích cách tổ chức source code của **edu-nexus-web** kèm ví dụ thực tế.
> Đọc file này trước khi code feature mới hoặc refactor lớn.
>
> Tài liệu liên quan:
> - [`AGENTS.md`](./AGENTS.md) — quy ước & checklist cho AI/dev
> - [`README.md`](./README.md) — setup & scripts

---

## 1. Mục tiêu kiến trúc

- Dễ maintain và debug khi app lớn dần.
- Route modules mỏng (thin) → business logic nằm trong `features/`.
- Feature tách bạch, tránh import chéo.
- i18n theo namespace để scale.

---

## 2. Layer overview

Hãy xem dự án như một toà nhà:

| Thư mục | Vai trò | Trong code |
| --- | --- | --- |
| `app/routes.ts` | “Bản đồ cửa ra vào” | Đăng ký route config (React Router 7) |
| `app/routes/` | Cửa ra vào từng phòng | Route module THIN: URL → render page feature |
| `app/features/` | Phòng chức năng | Dashboard, JD, Assessment, CV, ... |
| `app/shared/` | Đồ dùng chung | UI primitives, helpers, config |
| `app/providers/` | Hệ thống điện/nước | Theme, i18n, (sau này auth/query) |
| `app/locales/` | Bảng song ngữ | EN/VI theo namespace |
| `app/api/` | Ống ra ngoài | Orval generated operations/models |
| `app/mocks/` | Bếp giả | MSW handlers/factories cho dev |

### Quy tắc vàng (dependency direction)

```
routes ─┬─► features ─┐
        │             ├─► shared
        └─► providers ┘

(shared không import ngược lên features/routes)
```

---

## 3. Routing chuẩn (React Router 7)

### 3.1 Route config tập trung
- File `app/routes.ts` là nơi duy nhất đăng ký route config.
- Routes được nhóm theo domain bằng các hàm: `marketing()`, `auth()`, `onboarding()`, `dashboard()`, `admin()`.

Mục tiêu: khi debug routing, chỉ cần nhìn 1 file để thấy toàn bộ URL map.

### 3.2 Route module THIN
Route module chỉ làm 2 việc:
1) `meta()` (nếu cần)
2) render page từ `features/*`.

Ví dụ:

```tsx
import { DashboardPage } from "~/features/dashboard";

export default function DashboardRoute() {
  return <DashboardPage />;
}
```

### 3.3 Grouping routes theo domain
Cấu trúc (điển hình):

```
app/routes/
├── marketing/
├── auth/
├── onboarding/
├── dashboard/
│   ├── layout.tsx
│   ├── index.tsx
│   ├── jd/
│   │   ├── new.tsx
│   │   └── $jdId/
│   │       ├── index.tsx
│   │       ├── assessment.tsx
│   │       └── assessment-results.tsx
│   ├── assessment-paths/
│   │   └── $pathId/
│   │       └── cv.tsx
│   ├── analytics/
│   │   ├── gap-analysis.tsx
│   │   └── analysis-history.tsx
│   ├── learning/
│   │   ├── learning-path.tsx
│   │   └── roadmap.tsx
│   ├── market/
│   │   └── index.tsx
│   ├── credentials/
│   │   └── certificates.tsx
│   ├── settings/
│   │   └── index.tsx
│   └── legacy/
│       ├── skills-cv.tsx
│       └── skills-test.tsx
└── admin/
```

---

## 4. Feature design (practical)

Mỗi feature nên có public API barrel:

```
app/features/<feature>/
├── pages/
├── components/
├── hooks/
├── lib/
└── index.ts
```

- Route module chỉ import từ `~/features/<feature>`.
- Feature không import chéo feature khác. Share code thì kéo lên `shared/`.

---

## 5. i18n theo namespace

- Mỗi feature 1 namespace → 1 file JSON.
- Namespace được đăng ký trong `app/shared/lib/i18n/resources.ts`.

Cấu trúc locales:

```
app/locales/en/{common,dashboard,jd,assessment,cv}.json
app/locales/vi/{common,dashboard,jd,assessment,cv}.json
```

---

## 6. SSR & hydration notes

- App đang chạy SSR.
- `I18nProvider`/`ThemeProvider` có cơ chế “mount-then-render” để tránh hydration mismatch khi đọc `localStorage`.

---

## 7. Checklist khi refactor routing

- [ ] Không đổi URL trừ khi có yêu cầu.
- [ ] Route module luôn THIN.
- [ ] Update `app/routes.ts` theo grouping chuẩn.
- [ ] Typecheck pass.
- [ ] Nếu rename đường dẫn file route, đảm bảo `routes.ts` trỏ đúng.
