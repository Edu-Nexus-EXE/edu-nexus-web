---
description: Add or review i18n namespace/key changes with EN/VI parity
allowed-tools: Read, Glob, Grep, Edit, MultiEdit, Write, Bash(npm run typecheck)
---

Add or update i18n for: $ARGUMENTS

Checklist:

- Locate the feature namespace in `app/locales/en` and `app/locales/vi`.
- Add the same key shape in both languages.
- Use camelCase keys and feature namespaces.
- Do not concatenate translated strings in components; use interpolation.
- If creating a namespace, update `app/shared/lib/i18n/resources.ts`.
- Use `useTranslation("<namespace>")` in components.

Verify TypeScript if imports/resources changed.
