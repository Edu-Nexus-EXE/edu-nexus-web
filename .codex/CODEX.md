# Codex Setup - edu-nexus-web

Purpose: give Codex a short, repo-specific operating guide so future sessions can
understand Edu Nexus quickly without rereading every long document.

## Read Order

1. `AGENTS.md` - source of truth for architecture and conventions.
2. `ARCHITECTURE.md` - practical map of layers and feature placement.
3. `.codex/skills/*/SKILL.md` - task-specific instructions, loaded only when relevant.

When documents disagree, follow `AGENTS.md`.

## Codex Skill Discovery

This repo stores local Codex skills in `.codex/skills/`.

Codex native skills are discovered from `~/.agents/skills/` at startup. To make
these repo skills available globally in Codex, follow `.codex/INSTALL.md`.

Use these skills when relevant:

- `edu-nexus-search-first` - inspect existing patterns and official docs before new integrations.
- `edu-nexus-workflow` - starting or modifying work in this repo.
- `edu-nexus-feature` - adding routes, features, components, or providers.
- `edu-nexus-i18n-theme` - changing user-facing copy, colors, theme, or UI tokens.
- `edu-nexus-mock-api-orval` - adding mock endpoints, factories, API calls, or Orval.
- `edu-nexus-review-verify` - reviewing code or finishing a task.

## Default Workflow

1. Clarify the goal and acceptance criteria.
2. Search first: inspect existing code with `rg` and nearby examples before inventing new patterns.
3. Plan the smallest safe change.
4. Implement inside the correct layer.
5. Review for architecture, i18n, theme, SSR, generated-code, and regression risk.
6. Verify with the narrowest useful command before saying done.

## Hard Rules

- Respect layers: `routes -> features -> shared`, `providers -> shared`.
- No cross-feature imports. Move shared behavior to `shared/` only when 2+ features need it.
- Keep route files thin; feature UI and logic live in `app/features/<feature>/`.
- Use `~/...` aliases instead of long relative imports.
- Do not hard-code colors in components. Use semantic Tailwind token classes.
- User-facing strings require both EN and VI locale keys.
- Do not hand-edit Orval output in `app/api/model/` or `app/api/operations/`.
- Do not add `tailwind.config.*` or `react-router-dom`.
- Do not install packages or commit unless the user explicitly asks.

## Verification

Use one or more:

- `npm run typecheck`
- `npm run lint`
- `npm run prettier`
- `npm run build` for routing, SSR, or build-sensitive changes

If a check cannot run, report the exact blocker.
