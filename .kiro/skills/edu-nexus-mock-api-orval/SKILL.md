---
name: edu-nexus-mock-api-orval
description: MSW, Faker, Swagger, and Orval workflow.
---

# Edu Nexus Mock API and Orval

- Factories live in `app/mocks/factories/`.
- Hand-written handlers live in `app/mocks/handlers/`.
- Register handlers in `app/mocks/handlers/index.ts`.
- Do not edit `app/api/model/` or `app/api/operations/` by hand.
- Custom fetch behavior belongs in `app/api/mutator/custom-fetch.ts`.
