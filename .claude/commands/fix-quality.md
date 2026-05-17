---
description: Run a focused quality pass on a scope
allowed-tools: Read, Glob, Grep, Edit, MultiEdit, Bash(rg:*), Bash(npm run typecheck), Bash(npm run lint), Bash(npm run prettier)
---

Run a focused quality pass for: $ARGUMENTS

Do this in order:

1. Inspect the relevant files and current diff.
2. Fix small correctness, typing, i18n, theme-token, and import-boundary issues.
3. Avoid unrelated refactors.
4. Run the narrowest useful checks.
5. Summarize changes and remaining risks.

Prefer `npm run typecheck` and `npm run lint` for code changes.
