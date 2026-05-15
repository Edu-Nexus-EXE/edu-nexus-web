# Codex Setup - edu-nexus-web

Muc tieu: tao standard workflow cho Codex de team code nhat quan, de review, de maintain.

## 0) Required context first
- Doc `AGENTS.md` truoc khi de xuat hoac sua code.
- Khi thay doi lon, doc them `ARCHITECTURE.md`.

## 1) Default operating workflow (Superpowers-inspired)
1. **Clarify**: xac dinh dung problem, constraints, acceptance criteria.
2. **Plan**: liet ke files, impact, rollback-safe approach.
3. **Implement**: thay doi nho, theo boundaries, uu tien typing ro rang.
4. **Review**: tu check logic, regression risk, maintainability.
5. **Finalize**: cap nhat tai lieu lien quan neu co thay doi convention/flow.

## 2) Repo-specific engineering constraints
- Respect layers: `routes -> features -> shared`; `providers -> shared`.
- No cross-feature imports; can share thi move len `shared`.
- Keep routes thin; business logic nam trong feature modules.
- Khong hard-code mau trong components; dung token + semantic utility classes.
- i18n key moi phai update ca `app/locales/en` va `app/locales/vi`.
- Khong edit hand-written vao file codegen cua Orval (`app/api/model`, `app/api/operations`).
- Uu tien path alias `~/...`.

## 3) Definition of done
- Dung yeu cau.
- Dung conventions cua repo.
- Code ro rang, de maintain, khong tang debt khong can thiet.
