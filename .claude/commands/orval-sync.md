---
description: Prepare or review Swagger/Orval codegen integration
allowed-tools: Read, Glob, Grep, Edit, MultiEdit, Write, Bash(npm run orval), Bash(npm run typecheck)
---

Prepare or review Orval sync for: $ARGUMENTS

Rules:

- Do not hand-edit `app/api/model/` or `app/api/operations/`.
- Custom fetch behavior belongs in `app/api/mutator/custom-fetch.ts`.
- Swagger input is controlled by `orval.config.ts` or `swagger.json`.
- Generated fetch functions should usually be called from route loader/action.
- Generated MSW handlers can replace hand-written mocks when BE schema is ready.

Run `npm run orval` only if the user requested codegen or the Swagger source is present.
Verify with `npm run typecheck`.
