---
description: Add an MSW + Faker mock endpoint for FE development before BE is ready
allowed-tools: Read, Glob, Grep, Edit, MultiEdit, Write, Bash(npm run typecheck), Bash(npm run lint)
---

Add mock endpoint: $ARGUMENTS

Use the existing MSW workflow:

1. Add or reuse a factory in `app/mocks/factories/`.
2. Add a handler in `app/mocks/handlers/<feature>.handler.ts`.
3. Export/register it through `app/mocks/handlers/index.ts`.
4. Keep mock code out of `features/` and `shared/`.
5. If Swagger/Orval already covers this endpoint, prefer generated handlers instead of hand-written mocks.

Verify with `npm run typecheck`.
