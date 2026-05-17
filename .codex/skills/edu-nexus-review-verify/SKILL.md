---
name: edu-nexus-review-verify
description: Use before finalizing work, during code review, or when asked to review changes in edu-nexus-web.
---

# Edu Nexus Review and Verification

Use this skill before saying work is done or when reviewing code.

## Review Order

1. Requirement coverage.
2. Runtime correctness and SSR/hydration safety.
3. Layer boundaries and import direction.
4. i18n EN/VI parity.
5. Theme token compliance.
6. Generated-code safety.
7. Accessibility and responsive behavior for UI changes.
8. Verification commands and remaining risk.

## Common Risks

- Route files accumulating business UI.
- Feature-to-feature imports.
- `shared/` importing `features/`.
- Inline user-facing strings.
- Hard-coded colors in components.
- Direct `window`, `document`, or `localStorage` access during render.
- Edits inside Orval generated directories.
- Added dependencies without user approval.

## Commands

Choose the narrowest useful check:

- `npm run typecheck`
- `npm run lint`
- `npm run prettier`
- `npm run build`

If tests are absent for a risk, say what manual verification remains.
