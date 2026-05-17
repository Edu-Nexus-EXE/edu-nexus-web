---
name: edu-nexus-review-verify
description: Review and quality gate workflow before finishing.
---

# Edu Nexus Review and Verify

Review requirement coverage, runtime behavior, SSR safety, architecture, i18n, theme tokens, accessibility, and generated-code safety.

Run the narrowest useful check:

- `npm run typecheck`
- `npm run lint`
- `npm run prettier`
- `npm run build`
