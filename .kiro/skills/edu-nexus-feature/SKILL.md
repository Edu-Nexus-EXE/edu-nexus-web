---
name: edu-nexus-feature
description: Add or change routes, features, shared UI, providers, or React components.
---

# Edu Nexus Feature Work

- Routes live in `app/routes/` and are registered in `app/routes.ts`.
- Feature pages/components/hooks/lib live under `app/features/<feature>/`.
- Shared primitives live in `app/shared/ui/`.
- App-level components live in `app/shared/components/`.
- Providers live in `app/providers/`.
- Keep route files thin and export features through `index.ts`.
