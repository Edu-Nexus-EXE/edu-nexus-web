---
name: edu-nexus-workflow
description: Use when starting work in edu-nexus-web or before modifying this repository.
---

# Edu Nexus Workflow

Use this skill before changing code in `edu-nexus-web`.

## Required Context

Read only what is needed:

- `AGENTS.md` for authoritative conventions.
- `ARCHITECTURE.md` for layer and feature placement.
- `package.json` for available scripts.
- Nearby files matching the task.

## Workflow

1. Clarify the request and acceptance criteria.
2. Inspect existing patterns before editing.
3. Choose the smallest change that fits the architecture.
4. Implement in the correct layer.
5. Review your own diff.
6. Verify before final response.

## Architecture Rules

- `routes -> features -> shared`
- `providers -> shared`
- `shared` must not import `features` or `routes`.
- Features must not import each other.
- Routes stay thin and compose feature exports.
- Use `~/...` aliases for cross-folder imports.

## Finish Criteria

Before saying done, check:

- Requirement covered end to end.
- No dependency boundary violation.
- No hand edits in Orval generated directories.
- i18n and theme rules followed.
- Relevant verification command run or blocker reported.
