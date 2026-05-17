---
paths:
  - app/**
  - AGENTS.md
  - ARCHITECTURE.md
---

# Architecture Rules

- Read `AGENTS.md` before code changes and `ARCHITECTURE.md` for feature placement.
- Respect dependency direction: `routes -> features -> shared`, `providers -> shared`.
- `shared/` must not import `features/` or `routes/`.
- Features must not import each other. Move shared behavior to `shared/` only when 2+ features need it.
- Keep route modules thin; route files compose feature pages and hold loader/action/meta glue.
- Use `~/...` aliases for cross-folder imports.
- Do not edit generated Orval output in `app/api/model/` or `app/api/operations/`.
