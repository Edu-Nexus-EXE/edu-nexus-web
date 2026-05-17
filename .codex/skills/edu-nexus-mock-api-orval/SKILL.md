---
name: edu-nexus-mock-api-orval
description: Use when adding API calls, MSW mock handlers, Faker factories, Swagger, or Orval codegen in edu-nexus-web.
---

# Edu Nexus Mock API and Orval

Use this skill for API, mock, Faker, Swagger, and Orval tasks.

## Mock-First Workflow

When BE is not ready:

1. Add a factory in `app/mocks/factories/<feature>.factory.ts`.
2. Add handlers in `app/mocks/handlers/<feature>.handler.ts`.
3. Register handlers in `app/mocks/handlers/index.ts`.
4. Keep mock code out of `features/` and `shared/`.

MSW is enabled by `VITE_ENABLE_MOCK=true` in local env.

## Orval Rules

- Do not hand-edit `app/api/model/`.
- Do not hand-edit `app/api/operations/`.
- Custom request behavior belongs in `app/api/mutator/custom-fetch.ts`.
- Swagger input is configured through `orval.config.ts` or `swagger.json`.
- Run `npm run orval` only when Swagger input is ready or the user asks.
- Prefer generated fetch functions in route loader/action.

## Migration When Swagger Arrives

1. Generate with `npm run orval`.
2. Import generated handlers into `app/mocks/handlers/index.ts`.
3. Replace matching hand-written mock handlers.
4. Replace local mock types with generated types from `~/api/model`.
5. Verify with `npm run typecheck`.
