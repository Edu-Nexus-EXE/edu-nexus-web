# Kiến trúc src — dành cho dev FE mới

> Tài liệu giải thích cách tổ chức source code của **edu-nexus-web** kèm ví dụ thực tế. Đọc file này trước khi code feature mới.
>
> Tài liệu liên quan: [`AGENTS.md`](./AGENTS.md) (chi tiết quy ước & API), [`README.md`](./README.md) (setup & scripts).

---

## 1. Tại sao phải tách như vậy?

Tưởng tượng bạn nhét **tất cả code vào 1 thư mục `app/components/`**:

```text
app/components/
├── login-form.tsx
├── login-button.tsx
├── course-card.tsx
├── course-list.tsx
├── button.tsx              ← cái nào là button chung? cái nào của course?
├── user-avatar.tsx
├── header.tsx
├── theme-toggle.tsx
├── ... 50 files khác
```

Sau 3 tháng:

- ❌ Không biết file nào dùng cho feature nào.
- ❌ Sửa `button.tsx` → vỡ chỗ khác mà không biết.
- ❌ Muốn xoá feature "course" → phải mò 20 file.
- ❌ Dev mới vào không biết bắt đầu từ đâu.

**Giải pháp**: chia theo **lớp** (layer) và **feature** (chức năng nghiệp vụ).

---

## 2. Mỗi thư mục làm gì? — analogy đơn giản

Hãy xem dự án như **một toà nhà**:

| Thư mục              | Vai trò trong toà nhà                                    | Trong code                                   |
| -------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `routes/`            | **Cửa ra vào** — dẫn khách tới phòng nào                 | URL → page nào                               |
| `features/`          | **Các phòng chức năng** — phòng ngủ, bếp, phòng tắm...   | Auth, Courses, Profile, Payment...           |
| `shared/ui/`         | **Đồ nội thất tiêu chuẩn** — ghế, bàn ai cũng dùng được  | Button, Input, Card (generic)                |
| `shared/components/` | **Đồ đã ráp** — bộ bàn ăn = bàn + ghế gắn liền           | ThemeToggle, LanguageSwitcher (đã ráp)       |
| `shared/lib/`        | **Dụng cụ** — kéo, búa, thước                            | `cn()`, `storage`, i18n init                 |
| `features/<x>/lib/`  | **Ngăn phụ trong từng phòng** — đồ chỉ phòng đó dùng     | visual mapping, helper nội bộ của feature    |
| `shared/config/`     | **Bảng địa chỉ, danh bạ**                                | `SITE.name`, `STORAGE_KEYS`, env vars        |
| `providers/`         | **Hệ thống điện/nước cấp toàn nhà**                      | Theme, i18n, sau này: Auth, Toast, Query     |
| `styles/`            | **Bảng màu sơn** của cả toà nhà                          | `theme.css` — đổi 1 chỗ áp cả nhà            |
| `locales/`           | **Bảng song ngữ** dán mọi nơi                            | `en/`, `vi/` — dịch theo namespace           |
| `api/`               | **Đường ống ra ngoài** (do Orval đúc sẵn từ swagger)     | `model/` types, `operations/` fetch fns      |
| `mocks/`             | **Bếp giả** — nấu data fake khi BE chưa sẵn sàng         | MSW handlers + Faker factories (dev only)    |

### Quy tắc vàng — ai được dùng ai?

```text
                ┌──────────┐
                │  routes  │   ← URL bind tới page
                └────┬─────┘
                     │ import
            ┌────────▼─────────┐
            │     features     │   ← code nghiệp vụ (Auth, Courses...)
            └────────┬─────────┘
                     │ import
            ┌────────▼─────────┐
            │     shared       │   ← đồ dùng chung
            └──────────────────┘
                     ▲
                     │ import
            ┌────────┴─────────┐
            │    providers     │   ← context cấp app
            └──────────────────┘
```

**Quy tắc cấm:**

- ❌ `shared/` **không bao giờ** import từ `features/` (đảo lộn chiều phụ thuộc → vòng lặp).
- ❌ `features/auth` **không** import từ `features/courses` (2 phòng độc lập). Nếu cần share, kéo lên `shared/`.
- ❌ `features/` và `shared/` **không** import từ `mocks/` — mock chỉ tồn tại trong `mocks/` và `entry.client.tsx`.
- ❌ `api/operations/*` chỉ được gọi từ **route loader/action** (hoặc feature hook nếu cần client-side fetch). Không gọi trực tiếp trong component render.
- ✅ `routes/` và `features/` được dùng `shared/` thoải mái.

Khi feature lớn dần, đừng để mọi file nằm phẳng ở root của feature. Ưu tiên pattern:

```text
app/features/<feature>/
├── pages/                  # entry page của feature
├── components/
│   ├── layout/             # layout/shared within feature
│   ├── <screen-a>/         # component riêng cho màn A
│   └── <screen-b>/         # component riêng cho màn B
├── hooks/
├── lib/
└── index.ts
```

Tương tự với `app/routes/`, khi route nhiều nên nhóm theo domain:

```text
app/routes/
├── marketing/
├── auth/
└── dashboard/
```

---

## 3. Ví dụ thực tế: Thêm feature "Courses" từ A đến Z

Giả sử bạn cần làm trang **`/courses`** hiển thị danh sách khoá học.

### Bước 1 — Tạo cấu trúc feature

```text
app/features/courses/
├── components/
│   ├── course-card.tsx          # 1 thẻ khoá học
│   └── course-list.tsx          # danh sách
├── hooks/
│   └── use-courses.ts           # custom hook fetch courses
├── api/
│   └── courses-api.ts           # gọi API courses
├── types.ts                     # type Course
├── courses-page.tsx             # trang chính ráp lại
└── index.ts                     # public API barrel
```

### Bước 2 — Viết code

**`features/courses/types.ts`** — định nghĩa type:

```ts
export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
};
```

**`features/courses/api/courses-api.ts`** — gọi API:

```ts
import type { Course } from "../types";

// `fetch` đi qua MSW khi VITE_ENABLE_MOCK=true → trả về data fake từ
// app/mocks/handlers/. Khi BE có swagger thật, KHÔNG viết tay nữa —
// chuyển sang dùng generated function `getCourses()` từ `~/api/operations`.
export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses");
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}
```

> **Lưu ý mock-first:** project hiện setup MSW + Faker. Bạn code FE độc lập với BE — chỉ cần URL khớp với handler trong [`app/mocks/handlers/`](./app/mocks/handlers/). Xem mục **6** bên dưới để hiểu workflow.

**`features/courses/hooks/use-courses.ts`** — hook tái sử dụng:

```ts
import { useEffect, useState } from "react";
import type { Course } from "../types";
import { fetchCourses } from "../api/courses-api";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  return { courses, loading };
}
```

**`features/courses/components/course-card.tsx`** — UI từng item:

```tsx
import { useTranslation } from "react-i18next";
import { Button } from "~/shared/ui";
import type { Course } from "../types";

export function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation("courses");
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <img src={course.thumbnailUrl} alt={course.title} className="rounded" />
      <h3 className="mt-2 font-semibold text-card-foreground">{course.title}</h3>
      <p className="text-muted-foreground">{course.description}</p>
      <Button variant="primary" className="mt-3">{t("enroll")}</Button>
    </article>
  );
}
```

**`features/courses/components/course-list.tsx`**:

```tsx
import { useTranslation } from "react-i18next";
import { useCourses } from "../hooks/use-courses";
import { CourseCard } from "./course-card";

export function CourseList() {
  const { t } = useTranslation("common");
  const { courses, loading } = useCourses();

  if (loading) return <p>{t("loading")}</p>;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {courses.map((c) => <CourseCard key={c.id} course={c} />)}
    </div>
  );
}
```

**`features/courses/courses-page.tsx`** — ráp tất cả:

```tsx
import { useTranslation } from "react-i18next";
import { CourseList } from "./components/course-list";

export function CoursesPage() {
  const { t } = useTranslation("courses");
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <CourseList />
    </main>
  );
}
```

**`features/courses/index.ts`** — public API (chỉ export cái nào bên ngoài được dùng):

```ts
export { CoursesPage } from "./courses-page";
export type { Course } from "./types";
```

### Bước 3 — Thêm bản dịch

`app/locales/en/courses.json`:

```json
{
  "title": "Courses",
  "enroll": "Enroll now"
}
```

`app/locales/vi/courses.json`:

```json
{
  "title": "Khoá học",
  "enroll": "Đăng ký ngay"
}
```

Đăng ký namespace trong `app/shared/lib/i18n/resources.ts`:

```ts
import enCourses from "~/locales/en/courses.json";
import viCourses from "~/locales/vi/courses.json";

export const NAMESPACES = ["common", "welcome", "courses"] as const;
//                                              ^^^^^^^^^ thêm

export const resources = {
  en: { common: enCommon, welcome: enWelcome, courses: enCourses },
  vi: { common: viCommon, welcome: viWelcome, courses: viCourses },
};
```

### Bước 4 — Mount vào URL

`app/routes/courses.tsx` (route thin — chỉ wrap feature):

```tsx
import { CoursesPage } from "~/features/courses";
import type { Route } from "./+types/courses";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Khoá học - Edu Nexus" }];
}

export default function Courses() {
  return <CoursesPage />;
}
```

Đăng ký vào `app/routes.ts`:

```ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("courses", "routes/courses.tsx"),    // ← thêm dòng này
] satisfies RouteConfig;
```

**Xong!** URL `/courses` đã chạy. Tất cả code course gói gọn trong `features/courses/`. Muốn xoá feature → xoá nguyên thư mục đó + 1 dòng trong `routes.ts` + 2 file json. Không ảnh hưởng feature khác.

---

## 4. Khi nào kéo lên `shared/`?

**Quy tắc kinh nghiệm:** chỉ kéo lên khi có **2 feature trở lên** dùng. Đừng "premature share".

### Ví dụ: `<Avatar />` ban đầu chỉ dùng trong `features/profile`

→ Để ở `features/profile/components/avatar.tsx`.

Sau này `features/courses` cũng cần show avatar tác giả → **lúc đó** kéo lên `app/shared/components/avatar.tsx`. Sửa import 2 chỗ là xong.

### Phân biệt `shared/ui/` vs `shared/components/`

| `shared/ui/`                          | `shared/components/`                           |
| ------------------------------------- | ---------------------------------------------- |
| Generic, headless, không có business  | Có business meaning, đã ráp                    |
| `Button`, `Input`, `Card`, `Dialog`   | `ThemeToggle`, `LanguageSwitcher`, `AppHeader` |
| Có thể copy sang dự án khác           | Chỉ làm việc trong dự án này                   |
| Phụ thuộc: chỉ Tailwind + `cn()`      | Phụ thuộc: provider, hook, config của app      |

---

## 5. Ví dụ ngắn: dùng `cn()` để merge class

```tsx
import { cn } from "~/shared/lib/cn";

function Card({ className, isActive }: { className?: string; isActive: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border p-4",   // base
        isActive && "ring-2 ring-ring",          // conditional
        className                                  // override từ ngoài
      )}
    />
  );
}

// Dùng:
<Card className="bg-primary" isActive />
// → tailwind-merge tự loại class trùng, giữ class sau (override class trước)
```

---

## 6. Mock API — code FE độc lập với BE

**Hoàn cảnh:** BE chưa sẵn sàng, nhưng FE phải code sẵn UI + flow. Giải pháp: **MSW + Faker**.

### 6.1 Cách hoạt động

```text
component / hook gọi fetch("/api/courses")
       │
       ▼
[ MSW Service Worker (browser) ]   ← chỉ active khi VITE_ENABLE_MOCK=true
       │
       ▼
handler trong app/mocks/handlers/  ← khớp URL → trả Faker data
       │
       ▼
component nhận response như API thật
```

### 6.2 Thêm 1 endpoint mock mới

**Ví dụ:** thêm `GET /api/lessons/:courseId` trả về list bài giảng.

**Bước 1** — factory `app/mocks/factories/lesson.factory.ts`:

```ts
import { faker } from "@faker-js/faker";

export type Lesson = { id: string; title: string; durationMin: number };

export function createLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(4),
    durationMin: faker.number.int({ min: 5, max: 90 }),
    ...overrides,
  };
}
```

**Bước 2** — handler `app/mocks/handlers/lesson.handler.ts`:

```ts
import { http, HttpResponse } from "msw";
import { createLesson } from "../factories/lesson.factory";

export const lessonHandlers = [
  http.get("/api/lessons/:courseId", () =>
    HttpResponse.json(Array.from({ length: 5 }, () => createLesson())),
  ),
];
```

**Bước 3** — đăng ký vào `app/mocks/handlers/index.ts`:

```ts
import { lessonHandlers } from "./lesson.handler";

export const handlers = [...exampleHandlers, ...lessonHandlers];
```

Restart dev server → `fetch("/api/lessons/abc")` đã trả data fake.

### 6.3 Khi BE giao swagger.json

Switch sang Orval:

1. Đặt `swagger.json` ở root, hoặc đổi URL trong [`orval.config.ts`](./orval.config.ts).
2. Chạy `npm run orval` → auto-generate:
   - `app/api/model/` — TS types khớp 100% swagger
   - `app/api/operations/` — fetch functions sẵn dùng (`getCourses()`, `createLesson()`...)
   - `app/api/operations/**/*.msw.ts` — MSW handler từ swagger examples
3. Trong [`app/mocks/handlers/index.ts`](./app/mocks/handlers/index.ts), import generated handlers, **xoá** handler tay tương ứng.
4. Trong factory: thay `export type Course = {...}` → `import type { Course } from "~/api/model"`.
5. Trong feature, không gọi `fetch` thẳng nữa — dùng generated function:

```ts
// route loader (preferred)
import { getCourses } from "~/api/operations";

export async function loader() {
  return { courses: await getCourses() };
}
```

⚠️ **KHÔNG** viết code tay trong `app/api/model/` và `app/api/operations/` — Orval xoá sạch khi chạy lại. Customize fetch behavior (auth header, error handling) trong [`app/api/mutator/custom-fetch.ts`](./app/api/mutator/custom-fetch.ts).

### 6.4 Bật / tắt mock

`.env.local`:

```env
VITE_ENABLE_MOCK=true   # bật MSW (dev)
VITE_ENABLE_MOCK=false  # tắt, gọi API thật qua VITE_API_URL
```

Khi tắt, code MSW bị **tree-shake** khỏi production bundle (dynamic import trong [`app/entry.client.tsx`](./app/entry.client.tsx)).

---

## 7. Cheatsheet — khi cần làm X, mở file nào?

| Việc cần làm                            | Mở file                                                   |
| --------------------------------------- | --------------------------------------------------------- |
| Đổi màu chủ đạo                         | `app/styles/theme.css`                                    |
| Thêm key dịch                           | `app/locales/{en,vi}/<namespace>.json`                    |
| Thêm namespace mới                      | `app/shared/lib/i18n/resources.ts`                        |
| Thêm trang mới                          | `app/routes/<name>.tsx` + `app/routes.ts`                 |
| Thêm feature mới                        | tạo `app/features/<name>/` (xem mục 3)                    |
| Thêm UI primitive (Button, Input...)    | `app/shared/ui/`                                          |
| Thêm provider mới (Toast, Query...)     | `app/providers/` + ráp vào `app-providers.tsx`            |
| Thêm env var                            | `.env.local` (+ `.env.example`) + `app/shared/config/env.ts` |
| Thêm hằng số toàn app                   | `app/shared/config/site.ts`                               |
| Thêm helper thuần (date format, ...)    | `app/shared/lib/<topic>.ts`                               |
| Thêm mock endpoint                      | `app/mocks/factories/` + `app/mocks/handlers/` (xem mục 6)|
| Bật / tắt mock                          | `.env.local` → `VITE_ENABLE_MOCK`                         |
| Codegen từ swagger                      | đặt `swagger.json` + `npm run orval`                      |

---

## 8. TL;DR — 3 nguyên tắc đáng nhớ nhất

1. **1 feature = 1 thư mục độc lập trong `features/`**. Muốn xoá → xoá 1 thư mục.
2. **Mọi màu đi qua token `theme.css`**, không hard-code hex. Đổi màu = sửa 1 file.
3. **`shared/` không biết gì về `features/`**. Vi phạm = vòng lặp dependency = code thối.
4. **BE chưa có?** Không sao — viết handler trong `mocks/`, dev FE độc lập. Khi BE giao swagger → `npm run orval` lấy types thật, xoá mock tay.

Khi phân vân "đặt file này ở đâu?", hỏi 2 câu:

- Cái này có **business meaning** không? (có → `features/` hoặc `shared/components/`; không → `shared/ui/` hoặc `shared/lib/`)
- Có **2+ feature** sẽ dùng không? (có → `shared/`; chỉ 1 → `features/<x>/components/`)

Nếu là helper/mapping chỉ phục vụ 1 feature nhưng không phải UI component, đặt cạnh feature đó (ví dụ `features/dashboard/dashboard-tone.ts` hoặc `features/<x>/lib/`).

---

_Có chỗ nào khó hiểu hỏi senior trong team, hoặc đọc kèm [`AGENTS.md`](./AGENTS.md) để xem chi tiết quy ước._
