# Task 07: Comments (التعليقات)

## Goal

Moderators review readers' comments, publish or stop them, edit their text, and delete them.

## Reference

Old admin: `/admin/comments`, `/admin/comments/{id}/edit`.

Screenshots: [`07-comment-edit.png`](screenshots/07-comment-edit.png) · [`07-comments-list.png`](screenshots/07-comments-list.png)

## Scope

- `src/app/(admin)/comments/page.tsx`, `src/app/(admin)/comments/[id]/edit/page.tsx`, `src/features/comments/*`
- Endpoints: `comments/list`, `getDetails`, `edit`, `changeActive`, `delete` — [api-endpoints.md](../api-endpoints.md#comments--admincomments)
- Permission: `allowComments`

## Requirements

### List

- No "إضافة" button.
- Filters (URL): بحث (`search`), حالة النشر (`active`: الكل / منشور / موقوف). Also accepts `postId` from the URL (link from the posts list): show a removable chip "تعليقات الخبر: {title}" when set.
- Columns:

| Column | Content |
|---|---|
| م | comment id |
| التعليق / الخبر / التاريخ | comment text (2 lines); below in small text: date-time · post title (`text-primary-ink`, links to the post's edit page) |
| المستخدم | commenter name |
| الحالة | `StatusBadge` |
| التحكم | تعديل (`Pencil`), تغيير الحالة (`ToggleRight`, toggle), حذف (`Trash2`, confirm) |

### Edit page

- Read-only info block: عنوان الخبر، المستخدم، التاريخ.
- Fields: التعليق * (textarea), الحالة * (select).
- Footer: حفظ / تراجع.

## Open questions (⚠ TBD)

- Response shapes of `list` / `getDetails` (commenter name, post title and type for the link).
- Status labels: is `0` "موقوف" and `1` "منشور"? Is there a "تحت المراجعة" state?

## Acceptance criteria

- [ ] List, filters, `postId` filter from the posts list, toggle, delete, and edit all build the right requests; the user confirms on `/v2`.
- [ ] Toggle updates the badge in place; delete asks for confirmation.
- [ ] `pnpm check` passes.
