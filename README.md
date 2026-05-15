# edu-nexus-web

Frontend của dự án **Edu Nexus** — nền tảng học tập (FPT University, semester 7, môn EXE).

> **Dev FE mới?** Đọc [`ARCHITECTURE.md`](./ARCHITECTURE.md) trước — giải thích kiến trúc kèm ví dụ thực tế.
>
> **AI agent / cần chi tiết quy ước?** Đọc [`AGENTS.md`](./AGENTS.md) — tài liệu chi tiết về kiến trúc, quy ước, recipe và DO/DON'T.
>
> **Chuẩn AI theo tool:**  
> - Claude: [`./.claude/CLAUDE.md`](./.claude/CLAUDE.md)  
> - Codex: [`./.codex/CODEX.md`](./.codex/CODEX.md)

---

## Tech stack

- **React Router 7** (SSR mặc định) + **React 19** + **TypeScript** strict
- **Vite 8** — dev server + build
- **Tailwind CSS v4** (CSS-first config — không có `tailwind.config.js`)
- **i18next** + `react-i18next` + `i18next-browser-languagedetector` — đa ngôn ngữ EN/VI
- **clsx** + **tailwind-merge** — class merging composable

---

## Tính năng đã có sẵn

- ✅ **Theme dark/light** — token-driven, đổi màu chủ đạo bằng cách sửa 1 file CSS
- ✅ **i18n EN/VI** — namespace theo feature, mặc định tiếng Việt
- ✅ **Anti-FOUC theme** — script đồng bộ trong `<head>` áp class `dark` trước hydrate
- ✅ **Kiến trúc feature-based** rõ lớp `routes / features / shared / providers / styles`
- ✅ **UI primitive `<Button>`** làm mẫu cho component composable
- ✅ **Mock API** — MSW + Faker, FE dev không cần BE thật; Orval sẵn sàng codegen khi BE có swagger

---

## Bắt đầu

### Cài đặt

```bash
npm install
```

### Chạy dev server

```bash
npm run dev
```

Mở `http://localhost:5173`.

### Scripts

| Lệnh                   | Mục đích                                       |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Dev server (HMR)                               |
| `npm run build`        | Build production (SSR)                         |
| `npm start`            | Chạy server bundle production                  |
| `npm run start:csr`    | Preview SPA (vite preview)                     |
| `npm run typecheck`    | `react-router typegen && tsc`                  |
| `npm run lint`         | ESLint                                         |
| `npm run lint:fix`     | ESLint auto-fix                                |
| `npm run prettier`     | Kiểm tra format                                |
| `npm run prettier:fix` | Format code                                    |
| `npm run orval`        | Codegen từ swagger → types + services + MSW    |
| `npm run orval:watch`  | Codegen tự động khi swagger.json thay đổi      |

---

## Kiến trúc thư mục

```
app/
├── root.tsx                     # Root layout, gắn AppProviders
├── routes.ts                    # Route registry
├── routes/                      # Route entry — thin
├── features/                    # Business features (1 thư mục / feature)
│   └── welcome/
│       ├── components/          # Component nội bộ feature
│       ├── assets/
│       ├── welcome-page.tsx
│       └── index.ts             # public API barrel
├── shared/                      # Tái sử dụng cross-feature
│   ├── ui/                      # UI primitives (Button, ...)
│   ├── components/              # Component cấp app (ThemeToggle, LanguageSwitcher)
│   ├── hooks/
│   ├── lib/                     # cn, storage, i18n core
│   └── config/                  # site, env, storage keys
├── providers/                   # ThemeProvider, I18nProvider, AppProviders
├── styles/
│   ├── app.css                  # entry tailwind + đăng ký token
│   └── theme.css                # CSS variables — chỗ duy nhất sửa khi đổi màu
└── locales/
    ├── en/{common,welcome}.json
    └── vi/{common,welcome}.json
```

Nguyên tắc dependency:

```
routes ──► features ──► shared
        ╲    │
         ╲   ▼
          ► providers ──► shared
```

Không import chéo giữa các feature. Cần share → kéo lên `shared/`.

Path alias: `~/*` → `./app/*`.

Chi tiết: xem [`AGENTS.md`](./AGENTS.md).

---

## Đổi màu chủ đạo

Mở [`app/styles/theme.css`](./app/styles/theme.css) — sửa biến `--color-*` trong khối `:root` (light) và `.dark` (dark). Không cần đụng vào component, vì component dùng class semantic (`bg-primary`, `text-foreground`, ...).

```css
:root {
  --color-primary: #f97316;          /* đổi cam → màu khác */
  --color-primary-foreground: #fff;
  /* ... */
}

.dark {
  --color-primary: #38bdf8;          /* đổi sky → màu khác */
  --color-primary-foreground: #0b1220;
  /* ... */
}
```

---

## Thêm bản dịch / ngôn ngữ

### Thêm key mới
1. Thêm key vào **cả 2** file: `app/locales/en/<namespace>.json` và `app/locales/vi/<namespace>.json`.
2. Dùng:
   ```tsx
   const { t } = useTranslation("welcome"); // namespace
   t("title");
   ```

### Thêm namespace mới (vd `auth`)
1. Tạo `app/locales/{en,vi}/auth.json`.
2. Sửa [`app/shared/lib/i18n/resources.ts`](./app/shared/lib/i18n/resources.ts) — thêm import + entry vào `resources` + thêm `"auth"` vào `NAMESPACES`.

### Thêm ngôn ngữ mới (vd `ja`)
1. Tạo `app/locales/ja/{common,welcome,...}.json` đầy đủ key.
2. Trong `resources.ts`: thêm `ja: { ... }` vào `resources` và `"ja"` vào `SUPPORTED_LANGUAGES`.
3. Cập nhật `LABEL` trong [`language-switcher.tsx`](./app/shared/components/language-switcher.tsx).

---

## Mock API (MSW + Faker + Orval)

BE chưa sẵn sàng — FE dev với mock API qua MSW, dữ liệu fake bằng Faker. Khi BE có swagger, dùng Orval để codegen.

### Bật / tắt mock

`.env.local`:

```env
VITE_API_URL=             # để trống khi dùng mock
VITE_ENABLE_MOCK=true     # false để gọi API thật
```

Khi `VITE_ENABLE_MOCK=true`, [`app/entry.client.tsx`](./app/entry.client.tsx) dynamic-import MSW worker và start trước khi hydrate. Khi `false`, code mock tree-shake khỏi bundle production.

### Thêm endpoint mock mới (chưa có swagger)

1. Tạo factory: [`app/mocks/factories/<feature>.factory.ts`](./app/mocks/factories/) — dùng `faker` sinh data.
2. Tạo handler: [`app/mocks/handlers/<feature>.handler.ts`](./app/mocks/handlers/) — `http.get/post(...)` trả về factory data.
3. Đăng ký vào [`app/mocks/handlers/index.ts`](./app/mocks/handlers/index.ts).

Chi tiết kèm code mẫu: xem [`AGENTS.md`](./AGENTS.md) §12.

### Khi BE có swagger

1. Đặt `swagger.json` (hoặc đổi URL trong [`orval.config.ts`](./orval.config.ts)).
2. `npm run orval` — generate vào:
   - `app/api/model/` — TypeScript types
   - `app/api/operations/` — fetch functions + `*.msw.ts` handler
3. Import generated handler vào `app/mocks/handlers/index.ts`, xoá handler tay.
4. Dùng generated fetch trong route loader: `import { getCourses } from "~/api/operations"`.

⚠️ KHÔNG viết tay trong `app/api/model/` và `app/api/operations/` — Orval xoá sạch khi chạy lại. Customize fetch behavior trong [`app/api/mutator/custom-fetch.ts`](./app/api/mutator/custom-fetch.ts).

---

## Sử dụng theme & i18n trong code

```tsx
import { useTranslation } from "react-i18next";
import { useTheme } from "~/providers/theme-provider";
import { Button } from "~/shared/ui";
import { cn } from "~/shared/lib/cn";

export function Example() {
  const { t } = useTranslation("common");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn("rounded-lg bg-card p-4 text-card-foreground")}>
      <p className="text-muted-foreground">{t("appName")}</p>
      <Button onClick={toggleTheme}>{theme === "dark" ? t("light") : t("dark")}</Button>
    </div>
  );
}
```

---

## Deployment

### Docker

```bash
docker build -t edu-nexus-web .
docker run -p 3000:3000 edu-nexus-web
```

### Node

Build + chạy server bundle:

```bash
npm run build
npm start
```

Output:

```
build/
├── client/    # Static assets
└── server/    # Server-side code
```

---

Built with React Router. Frontend cho dự án EXE — FPT University.
