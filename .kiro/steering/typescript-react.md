---
inclusion: fileMatch
description: TypeScript and React rules for Edu Nexus.
fileMatchPattern: '*.ts,*.tsx'
---

# TypeScript and React Rules

- Strict TypeScript. Avoid `any`; prefer `unknown` plus narrowing.
- Use `import type` for type-only imports.
- Use function declarations and named exports for components.
- Default exports only in route modules.
- Guard `window`, `document`, and `localStorage` for SSR.
- Use `~/...` aliases for cross-folder imports.
- Use React Router APIs from `react-router`, not `react-router-dom`.
