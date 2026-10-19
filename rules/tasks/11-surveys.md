# Task 11: Surveys (الاستبيانات)

## Goal

Admins create surveys with answer options and a validity period, and manage them.

## Reference

Old admin: `/admin/surveys`, `/admin/surveys/{id}/edit`.

Screenshots: [`11-survey-edit.png`](screenshots/11-survey-edit.png) · [`11-surveys-list.png`](screenshots/11-surveys-list.png)

## Scope

- `src/app/(admin)/surveys/{page,new/page,[id]/edit/page}.tsx`, `src/features/surveys/*`
- Endpoints: `surveys/list`, `getDetails`, `add`, `edit`, `addQuestion`, `editQuestion`, `deleteQuestion`, `changeActive`, `delete` — [api-endpoints.md](../api-endpoints.md#surveys--adminsurveys)
- Permission: `allowSurveys`

## Requirements

### List

- Page header "الاستبيانات" + "إضافة".
- Filters (URL): بحث, الحالة.
- Columns: م · العنوان (links to edit) · التصنيف · تاريخ ووقت النشر · الحالة · عدد الإجابات · التحكم (تعديل, تغيير الحالة, حذف).

### Form

Section 1 — survey data:

| Field | Control |
|---|---|
| التصنيف * | category select (`catId`) |
| العنوان * | input |
| مدة الاستقصاء * | three selects side by side: أيام (`validDays`), ساعات (`validHours`), دقائق (`validMin`) — at least one non-zero |
| الحالة * | فعال / غير فعال |

Section 2 — "الإجابات" (the API calls them `questions`):

- **Create:** an editable list of answer inputs (add / remove rows, at least two), sent with the survey in `questions`.
- **Edit:** existing answers listed with their votes count ("عدد الإجابات"); each can be edited inline (`editQuestion`) or deleted (confirm, `deleteQuestion`); "إضافة إجابة" adds one (`addQuestion`). These save immediately, independently of the survey "حفظ".

Footer: حفظ / تراجع.

## Open questions (⚠ TBD)

- Format of `questions` on add (comma-separated vs. JSON array of `{question}`).
- `edit` field name `vaildHours` vs `validHours` — test which one `/v2` updates.
- Allowed ranges for days/hours/minutes; what "تاريخ ووقت النشر" is based on.
- Which category types surveys use.

## Acceptance criteria

- [ ] Create a survey with answers, then edit its data and answers — requests built correctly; the user confirms on `/v2`.
- [ ] Duration validation; at least two answers on create.
- [ ] Toggle and delete from the list.
- [ ] `pnpm check` passes.
