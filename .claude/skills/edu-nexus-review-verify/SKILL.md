---
name: edu-nexus-review-verify
description: Use before finalizing work or when reviewing changes.
---

# Edu Nexus Review and Verify

Review in this order:

1. Requirement coverage.
2. Runtime correctness and SSR/hydration safety.
3. Layer boundaries and imports.
4. i18n EN/VI parity.
5. Theme token compliance.
6. Generated-code safety.
7. Accessibility and responsive behavior.
8. Verification results.

Run the smallest useful check:

- `npm run typecheck`
- `npm run lint`
- `npm run prettier`
- `npm run build`
