---
description: Review UI for accessibility, responsive behavior, theme tokens, and i18n
allowed-tools: Read, Glob, Grep, Bash(rg:*), Bash(npm run lint), Bash(npm run typecheck)
---

Review UI scope: $ARGUMENTS

Report findings first, ordered by severity, with file references.

Focus on:

- Broken responsive layout or text overflow.
- Missing accessible labels, focus states, landmarks, or semantic HTML.
- Hard-coded colors instead of semantic tokens.
- Incorrect dark/light behavior.
- User-facing strings missing i18n.
- Routes doing feature work instead of composing.
- Shared importing feature code.

Run targeted searches with `rg` before concluding there are no issues.
