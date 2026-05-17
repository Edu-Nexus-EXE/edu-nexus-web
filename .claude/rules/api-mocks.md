---
paths:
  - app/api/**
  - app/mocks/**
  - orval.config.ts
  - swagger.json
---

# API, Mock, and Orval Rules

- Use MSW + Faker for mock-first FE work before BE is ready.
- Factories live in `app/mocks/factories/`.
- Hand-written handlers live in `app/mocks/handlers/`.
- Keep mock imports out of `features/` and `shared/`.
- Do not hand-edit `app/api/model/` or `app/api/operations/`.
- Custom request behavior belongs in `app/api/mutator/custom-fetch.ts`.
- Generated fetch functions should usually be called from route loader/action.
- Run `npm run orval` only when Swagger input is ready or explicitly requested.
