---
name: edu-nexus-i18n-theme
description: Use when changing user-facing text, translations, colors, Tailwind classes, theme tokens, or dark/light UI behavior in edu-nexus-web.
---

# Edu Nexus I18n and Theme Guard

Use this skill for UI copy, translations, colors, and theme behavior.

## I18n Rules

- Default language is Vietnamese; English is also supported.
- User-facing strings belong in locale files, not inline components.
- Add the same key shape to both `app/locales/en/<namespace>.json` and
  `app/locales/vi/<namespace>.json`.
- Register new namespaces in `app/shared/lib/i18n/resources.ts`.
- Components use `useTranslation("<namespace>")`.
- Use interpolation instead of concatenating translated strings.

## Theme Rules

- Tailwind v4 is CSS-first. Do not add `tailwind.config.js` or `tailwind.config.ts`.
- Tokens live in `app/styles/theme.css`.
- Components use semantic classes such as:
  - `bg-background`
  - `text-foreground`
  - `bg-card`
  - `text-card-foreground`
  - `border-border`
  - `bg-primary`
  - `text-muted-foreground`
- Do not hard-code hex colors or palette classes like `bg-orange-500` in components.
- Use `dark:` mainly for layout or visibility, not duplicating token colors.

## Review

Search for:

- Missing EN/VI key parity.
- Inline copy in components.
- Hex colors in TS/TSX.
- Tailwind palette utilities in components.
- Theme changes outside `theme.css` that should be tokens.
