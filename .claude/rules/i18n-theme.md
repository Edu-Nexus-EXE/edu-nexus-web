---
paths:
  - app/**/*.tsx
  - app/locales/**
  - app/styles/**
---

# I18n and Theme Rules

- Default language is Vietnamese; English is also supported.
- User-facing text belongs in locale files, not inline component strings.
- Add matching keys to both `app/locales/en/<namespace>.json` and `app/locales/vi/<namespace>.json`.
- Register new namespaces in `app/shared/lib/i18n/resources.ts`.
- Use `useTranslation("<namespace>")`; do not import locale JSON directly into components.
- Tailwind v4 is CSS-first. Do not add `tailwind.config.*`.
- Design tokens live in `app/styles/theme.css`.
- Components must use semantic classes such as `bg-card`, `text-foreground`, `border-border`, `bg-primary`.
- Do not hard-code hex colors or Tailwind palette classes in components.
- Use `dark:` mainly for layout/visibility, not duplicate token colors.
