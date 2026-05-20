---
name: edu-nexus-feature
description: Use when adding or changing routes, feature modules, shared UI, providers, or React components.
---

# Edu Nexus Feature Work

- Feature pages: `app/features/<feature>/pages/`.
- Feature-only components: `app/features/<feature>/components/`.
- Feature-only helpers: `app/features/<feature>/lib/`.
- Generic UI primitives: `app/shared/ui/`.
- App-level shared components: `app/shared/components/`.
- Providers: `app/providers/`, composed in `app/providers/app-providers.tsx`.
- Routes: `app/routes/<domain>/<name>.tsx`, registered in `app/routes.ts`.

Rules:

- Keep route files thin.
- Export feature public API through `index.ts`.
- Use `~/...` aliases.
- Use function declarations and named exports.
- Default export only in route modules.
