---
name: edu-nexus-feature
description: Use when adding or changing routes, feature modules, shared UI, providers, or React components in edu-nexus-web.
---

# Edu Nexus Feature Work

Use this skill for feature, route, component, provider, or shared UI work.

## Placement

- Feature page: `app/features/<feature>/pages/`.
- Feature-only component: `app/features/<feature>/components/`.
- Feature-only helper: `app/features/<feature>/lib/`.
- Generic primitive: `app/shared/ui/`.
- App-level composed component: `app/shared/components/`.
- Pure helper: `app/shared/lib/`.
- App constants/env: `app/shared/config/`.
- Provider: `app/providers/`, composed in `app/providers/app-providers.tsx`.
- Route module: `app/routes/<domain>/<name>.tsx`, registered in `app/routes.ts`.

## Component Rules

- Use function declarations and named exports.
- Default export only for route entry modules.
- One component per file when practical.
- Props interface lives next to the component and is named `XxxProps`.
- Use `cn()` from `~/shared/lib/cn` for conditional classes.

## Route Rules

- Keep route files thin.
- Compose feature pages from `~/features/<feature>`.
- Use React Router 7 APIs from `react-router`, not `react-router-dom`.
- Add routes through `app/routes.ts`.

## Checks

Run `npm run typecheck` for route, TS, or export changes.
Run `npm run lint` when component logic or hooks changed.
