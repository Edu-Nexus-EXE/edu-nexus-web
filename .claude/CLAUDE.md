# Claude Setup - edu-nexus-web

Muc tieu: giup AI code dung chuan, de hieu, de maintain, theo workflow inspired by Superpowers.

## 0) Bat buoc doc truoc khi code
1. `AGENTS.md` (nguon truth ve architecture + conventions)
2. `ARCHITECTURE.md` (hieu luong du lieu va module boundaries)
3. `README.md` (scripts va setup runtime)

## 1) Workflow mac dinh (bat buoc)
1. **Brainstorming**: lam ro scope, assumptions, edge cases.
2. **Writing plans**: chia task nho, ro file can sua, ro expected behavior.
3. **Implementing**: uu tien thay doi nho, dung boundary, khong patch theo kieu ad-hoc.
4. **Requesting review**: soat lai logic, typing, i18n/theme impacts.
5. **Finishing branch**: dam bao docs lien quan duoc cap nhat.

## 2) Project rules (hard constraints)
- Ton trong dependency graph: `routes -> features -> shared`, `providers -> shared`.
- Khong import cheo giua cac feature.
- Khong hard-code color; dung semantic classes va token trong `app/styles/theme.css`.
- i18n key moi phai co du cho `en` va `vi`.
- Uu tien alias `~/...` thay vi relative path dai.
- Khong sua tay cac file generated trong `app/api/model` va `app/api/operations`.
- Route file giu "thin", business logic dat trong `features/*`.

## 3) Quality gates truoc khi ket luan xong task
- Check requirement da duoc cover end-to-end.
- Check khong pha vo conventions cua repo.
- Check code de doc, de test, de mo rong.

## 4) Principle
- Evidence over claims.
- Simplicity over cleverness.
- Maintainability over speed.
