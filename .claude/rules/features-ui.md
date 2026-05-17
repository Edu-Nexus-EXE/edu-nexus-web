---
paths:
  - app/features/**
  - app/shared/ui/**
  - app/shared/components/**
  - app/providers/**
---

# Feature and UI Rules

- Feature pages live in `app/features/<feature>/pages/`.
- Feature-only components live in `app/features/<feature>/components/`.
- Generic primitives live in `app/shared/ui/`.
- App-level composed components live in `app/shared/components/`.
- App providers live in `app/providers/` and are composed in `app/providers/app-providers.tsx`.
- Use function declarations and named exports for components.
- Default exports are for route modules only.
- Define props interfaces next to components as `XxxProps`.
- Use `cn()` from `~/shared/lib/cn` for conditional classes.
