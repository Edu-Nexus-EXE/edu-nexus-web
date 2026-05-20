---
paths:
  - app/routes/**
  - app/routes.ts
---

# React Router 7 Rules

- This project uses React Router 7 with SSR enabled.
- Import routing APIs from `react-router`, not `react-router-dom`.
- Add routes in `app/routes.ts` using React Router route helpers.
- Route modules should be thin and compose feature exports from `~/features/<feature>`.
- Use generated route types from `./+types/<route-name>` where needed.
- Keep business UI and domain logic inside `app/features/<feature>/`.
