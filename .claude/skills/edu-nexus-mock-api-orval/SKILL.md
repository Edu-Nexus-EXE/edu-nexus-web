---
name: edu-nexus-mock-api-orval
description: Use when adding API calls, MSW handlers, Faker factories, Swagger, or Orval integration.
---

# Edu Nexus Mock API and Orval

Mock-first flow:

1. Add Faker factory in `app/mocks/factories/`.
2. Add MSW handler in `app/mocks/handlers/`.
3. Register handler in `app/mocks/handlers/index.ts`.
4. Keep mocks out of `features/` and `shared/`.

Orval flow:

- Do not hand-edit `app/api/model/` or `app/api/operations/`.
- Update `orval.config.ts`, `swagger.json`, or `app/api/mutator/custom-fetch.ts` instead.
- Prefer generated fetch functions in route loader/action.
- Verify with `npm run typecheck`.
