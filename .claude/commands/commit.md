---
description: Draft or create a git commit from the current diff
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

Handle commit request: $ARGUMENTS

Context to inspect:

- Current status: !`git status --short`
- Current diff: !`git diff -- .`
- Recent commits: !`git log --oneline -10`

Rules:

- Do not commit unless the user explicitly asked to commit.
- Do not include unrelated user changes.
- Use a concise conventional-style message when it fits.
- Mention verification status before committing when possible.
