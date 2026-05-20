---
description: Add a thin React Router 7 route and register it
allowed-tools: Read, Glob, Grep, Edit, MultiEdit, Write, Bash(npm run typecheck)
---

Add this route: $ARGUMENTS

Rules:

- Route modules live in `app/routes/`, grouped by domain when useful.
- Register routes in `app/routes.ts` with React Router helpers.
- Route modules should compose feature pages from `~/features/<feature>`.
- Use route generated types from `./+types/<route-name>` when needed.
- Keep business logic out of route files unless it is loader/action glue.
- Add or update meta only with i18n/theme conventions in mind.

Verify with `npm run typecheck`.
