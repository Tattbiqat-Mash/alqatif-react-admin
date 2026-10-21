# Task 09: Editors (المحررين)

## Goal

Admins manage the accounts that can sign in to this dashboard and what each one may access.

## Reference

Old admin: `/admin/authors`, `/admin/authors/{id}/edit`.

Screenshots: [`09-editor-edit.png`](screenshots/09-editor-edit.png) · [`09-editors-list.png`](screenshots/09-editors-list.png)

## Scope

- `src/app/(admin)/editors/{page,new/page,[id]/edit/page}.tsx`, `src/features/editors/*`
- Endpoints: `admins/list`, `getDetails`, `add`, `edit`, `delete` — [api-endpoints.md](../api-endpoints.md#editors-admins--adminadmins)
- Permission: `allowAdmins`

## Requirements

### List

- Page header "المحررين" + "إضافة".
- Filters (URL): بحث (`search`), النوع (`type`), الحالة (`active`) — the old page had none; the endpoint supports them.
- Columns: اسم المستخدم (`userName`, LTR) · الاسم الظاهر (`displayName`) · النوع · الحالة (`StatusBadge` فعال / موقوف) · التحكم (تعديل, أخبار المحرر, حذف).
- No activate/stop toggle in the row (user's decision) — the status is changed in the form.
- أخبار المحرر (`Newspaper`): a link to `/content/news?editor=<id>` (the news list's المحرر filter); shown only with `allowPosts`.
- The signed-in admin's own row: no delete button.

### Form

| Field | Control | Notes |
|---|---|---|
| اسم المستخدم * | input (LTR) | `userName`, used to sign in |
| البريد الإلكتروني * | email input | |
| كلمة المرور * | `PasswordInput` | required on create; on edit, helper "اتركها فارغة للإبقاء على كلمة المرور الحالية" ⚠ |
| الاسم الذي يظهر مع الخبر * | input | `displayName` |
| النوع * | select | أدمن / أدمن فرعي |
| الحالة * | select | فعال / موقوف |
| الصلاحيات * | checkbox group | المواضيع، التعليقات، الإعلانات، المحررين، الإشعارات، الاستبيانات، الإعدادات → `allow*` flags; at least one required for أدمن فرعي; hidden (all on) for أدمن ⚠ |

- Deactivating (setting الحالة = موقوف in the form) asks for confirmation naming the editor.
- If the admin edits their own permissions, refresh their session profile after save.

> **Status:** built (`src/features/editors/`). List on the `admins/list` sample; add/edit bodies match the collection. `admins/getDetails` is read **provisionally** as the login's admin record (under `data` or at the root). On edit an empty password is **not sent at all**, so the server never receives a blank one. Email validation is lenient (`x@y`) because existing accounts have addresses like `m1m@mm.com1`. Your own account: no deactivate/delete in the list, type and status locked in the form, and the session profile updates after saving. Verified end-to-end on a local mock (list actions, edit without password, create validation and body).

## Open questions (⚠ TBD)

- The `admins/getDetails` response shape.

- Type labels: the old list shows "محرر" / "معلن" while the form shows "ادمن فرعي". Confirm the real meaning and labels of `type` 0 / 1.
- Does `edit` keep the password when `password` is empty?
- Do أدمن (`type=0`) accounts ignore the permission flags?

## Acceptance criteria

- [ ] List, create, edit and delete build the right requests; the user confirms on `/v2`.
- [ ] Password rules differ between create and edit as described.
- [ ] An admin cannot delete or deactivate themselves from the UI.
- [ ] `pnpm check` passes.
