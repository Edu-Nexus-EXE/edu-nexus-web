# Claude Setup - edu-nexus-web

You are working on `edu-nexus-web`, the frontend web app for Edu Nexus.
This project is a React Router 7 SSR app with React 19, TypeScript strict,
Vite 8, Tailwind CSS v4 CSS-first tokens, i18next EN/VI, MSW, and Orval.

## Required Reading

Before proposing or changing code, read:

1. `AGENTS.md` - source of truth for architecture, conventions, recipes, DO/DON'T.
2. `ARCHITECTURE.md` - practical explanation of layer boundaries and feature layout.
3. `README.md` - setup, scripts, and project capabilities.

When these files disagree, prefer `AGENTS.md`.

## Context Loading Strategy

This repo uses layered context to reduce token cost:

- `CLAUDE.md` at repo root is the thin auto-loaded entrypoint.
- `.claude/CLAUDE.md` is the compact project operating guide.
- `.claude/rules/` contains path-scoped rules for route, feature, UI, i18n, theme, and API work.
- `.claude/skills/` contains auto-triggered workflows for common Edu Nexus tasks.
- `.claude/commands/` contains explicit slash commands for repeatable team workflows.
- `.claude/agents/` contains specialist subagents for focused review/planning.

Load only the rule or skill needed for the current task, then read nearby source files.

## Default Workflow

Use a Superpowers-inspired workflow, tuned for this repo:

1. Clarify the goal, acceptance criteria, affected screens, and assumptions.
2. Inspect existing code before editing. Prefer `rg` and read nearby patterns.
3. Plan the smallest coherent change with explicit files and verification.
4. Implement inside the correct layer. Keep routes thin and features independent.
5. Review your own diff for architecture, i18n, theme, SSR, and generated-code risks.
6. Verify with the narrowest useful command, usually `npm run typecheck`, `npm run lint`, or both.

For trivial edits, keep the plan implicit, but still inspect and verify.

## Hard Constraints

- Respect dependency direction: `routes -> features -> shared`, `providers -> shared`.
- Do not import across feature modules. Move shared behavior to `shared/` only when 2+ features need it.
- Keep route files thin. Business UI and logic live in `app/features/<feature>/`.
- Use `~/...` aliases instead of long relative imports.
- Do not install new libraries without asking first.
- Do not commit unless the user explicitly asks.
- Do not hand-edit generated Orval output in `app/api/model/` or `app/api/operations/`.
- Do not add `tailwind.config.js` or `tailwind.config.ts`; Tailwind v4 is configured in CSS.
- Do not add `react-router-dom`; this project uses `react-router`.

## Frontend Rules

- Use semantic Tailwind token classes: `bg-background`, `text-foreground`,
  `bg-card`, `border-border`, `bg-primary`, `text-muted-foreground`, etc.
- Do not hard-code hex colors or palette utilities like `bg-orange-500` in components.
- Add new design tokens in `app/styles/theme.css` first, then use semantic classes.
- Use `cn()` from `~/shared/lib/cn` for conditional class composition.
- Every user-facing string belongs in i18n. Add keys to both `app/locales/en` and `app/locales/vi`.
- Use `useTranslation("<namespace>")`; do not import locale JSON directly into components.
- SSR matters: guard `window`, `document`, and `localStorage`, or use shared helpers.
- Theme and i18n providers are composed once in `app/providers/app-providers.tsx`.

## File Placement

- One feature: `app/features/<feature>/`.
- Feature pages: `app/features/<feature>/pages/`.
- Feature-only UI: `app/features/<feature>/components/`.
- Feature-only helpers: `app/features/<feature>/lib/`.
- Generic primitives: `app/shared/ui/`.
- App-level composed shared components: `app/shared/components/`.
- Pure shared helpers: `app/shared/lib/`.
- App config/constants: `app/shared/config/`.
- App providers: `app/providers/`.
- New routes: `app/routes/<domain>/<name>.tsx` plus `app/routes.ts`.
- Mock data: `app/mocks/factories/` and `app/mocks/handlers/`.

## Quality Gates

Before saying a task is done:

- Confirm the requirement is covered end to end.
- Check layer boundaries and imports.
- Check theme token usage and dark/light impact.
- Check i18n EN/VI parity for added user-facing text.
- Check SSR/hydration safety.
- Run the relevant verification command. Prefer:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run prettier`
  - `npm run build` for routing/SSR/build-sensitive changes

If verification cannot run, say exactly why.

## Useful Commands

- `/add-feature <feature-name>` - scaffold or implement a feature in the repo pattern.
- `/search-first <topic>` - inspect repo patterns and relevant docs before coding.
- `/add-route <path> <feature>` - add a thin route and register it.
- `/add-locale <namespace>` - add or update EN/VI i18n keys safely.
- `/mock-endpoint <method> <path>` - add MSW + Faker mock flow.
- `/orval-sync` - prepare for swagger-driven codegen.
- `/review-ui <scope>` - review accessibility, responsive behavior, and token usage.
- `/fix-quality <scope>` - run a focused quality pass.
- `/commit` - draft or create a commit only when requested.

## Project Skills

Use these skills when the task matches:

- `edu-nexus-search-first` - inspect existing patterns and official docs before new integrations.
- `edu-nexus-workflow` - general repo work and task startup.
- `edu-nexus-feature` - routes, features, components, providers, shared UI.
- `edu-nexus-i18n-theme` - translations, copy, design tokens, dark/light behavior.
- `edu-nexus-mock-api-orval` - MSW, Faker, Swagger, Orval.
- `edu-nexus-review-verify` - review and final verification.

## Collaboration

Be direct, evidence-based, and conservative with architecture. The goal is not
to produce the most code; it is to keep the Edu Nexus frontend easy to change.
