---
name: edu-nexus-search-first
description: Research-before-coding workflow for Edu Nexus. Use before adding new utilities, libraries, integrations, or unfamiliar patterns.
---

# Edu Nexus Search First

Use this before writing net-new code or adding integrations.

## Local First

1. Search existing code with `rg --files` and targeted `rg`.
2. Read nearby examples in `app/features`, `app/shared`, `app/providers`, and `app/mocks`.
3. Check `AGENTS.md` and `ARCHITECTURE.md` for placement and constraints.
4. Prefer existing helpers (`cn`, `storage`, i18n resources, theme tokens) over new abstractions.

## External Research

Use official docs or trusted package docs when:

- Adding or upgrading a dependency.
- Using React Router, Tailwind, i18next, MSW, Orval, Vite, or OpenAI APIs in a way not already shown.
- The user explicitly asks to research or compare options.

## Decision

- Reuse existing repo pattern when possible.
- Wrap or extend a proven library only when the project already depends on it or the user approves install.
- Build custom only after confirming no local pattern/library fits.
