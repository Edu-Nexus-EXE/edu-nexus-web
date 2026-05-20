---
description: Add or evolve a feature using the Edu Nexus feature-sliced pattern
allowed-tools: Read, Glob, Grep, Edit, MultiEdit, Write, Bash(rg:*), Bash(npm run typecheck), Bash(npm run lint)
---

Add or evolve this feature: $ARGUMENTS

Follow this workflow:

1. Read `AGENTS.md`, `ARCHITECTURE.md`, `app/routes.ts`, and nearby feature patterns.
2. Identify the correct feature folder under `app/features/<feature>/`.
3. Keep route entries thin; place feature UI and logic in feature pages/components/hooks/lib.
4. Use `~/...` aliases for cross-folder imports.
5. Add user-facing text to both EN and VI locale files.
6. Use semantic theme token classes only.
7. Export public feature API through `app/features/<feature>/index.ts`.
8. Run `npm run typecheck` and, when UI/classes changed, `npm run lint`.

Before final response, summarize changed files and verification.
