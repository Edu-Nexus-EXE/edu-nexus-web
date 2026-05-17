---
inclusion: fileMatch
description: Translation and theme rules for UI files.
fileMatchPattern: '*.tsx,*.css,*.json'
---

# I18n and Theme Rules

- User-facing strings need EN and VI locale keys.
- Use `useTranslation("<namespace>")` in components.
- Tailwind v4 is CSS-first; do not add `tailwind.config.*`.
- Use semantic classes such as `bg-card`, `text-foreground`, `border-border`, `bg-primary`.
- Do not hard-code colors in components.
- New color tokens belong in `app/styles/theme.css`.
