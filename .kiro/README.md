# Kiro Setup - edu-nexus-web

This folder mirrors the Claude/Codex project rules for Kiro.

It follows the lightweight structure used by Everything Claude Code for Kiro:

- `agents/` - specialist agents for planning and review.
- `skills/` - on-demand workflows.
- `steering/` - always-on or path-matched project rules.
- `hooks/` - IDE hook definitions.
- `scripts/` - deterministic helper scripts used by hooks.

## How to Use

- Start with `steering/project-context.md` and `steering/development-workflow.md`.
- Use agents such as `frontend-architect` and `code-reviewer` for focused sessions.
- Use skills such as `edu-nexus-feature`, `edu-nexus-i18n-theme`, and `edu-nexus-review-verify`.
- Trigger the `quality-gate` hook before finishing major work.

`AGENTS.md` remains the source of truth when any instruction conflicts.
