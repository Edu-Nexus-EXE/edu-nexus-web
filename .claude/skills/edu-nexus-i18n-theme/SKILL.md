---
name: edu-nexus-i18n-theme
description: Use when changing translations, user-facing copy, colors, Tailwind classes, or dark/light UI.
---

# Edu Nexus I18n and Theme

I18n:

- Add user-facing strings to both EN and VI locale files.
- Use one namespace per feature.
- Register new namespaces in `app/shared/lib/i18n/resources.ts`.
- Use interpolation instead of string concatenation.

Theme:

- Tokens live in `app/styles/theme.css`.
- Components use semantic Tailwind classes.
- Do not hard-code hex colors or palette utilities.
- Use `dark:` for layout/visibility differences only.
