---
name: edu-nexus-workflow
description: Use when starting work or modifying edu-nexus-web.
---

# Edu Nexus Workflow

1. Read `AGENTS.md` and only the relevant parts of `ARCHITECTURE.md`.
2. Inspect current code and imports before editing.
3. Plan the smallest safe change.
4. Implement inside the correct layer.
5. Review for architecture, i18n, theme, SSR, generated-code, and regression risks.
6. Verify with the narrowest useful command.

Default checks:

- `npm run typecheck`
- `npm run lint`
- `npm run build` for routing, SSR, or build-sensitive work
