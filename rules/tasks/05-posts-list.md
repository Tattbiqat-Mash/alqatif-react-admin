# Task 05: Content Lists (المحتوى)

## Goal

One list screen, driven by config, serves the six content sections: الأخبار، الفيديوهات، الصور، وظائف، رسائل شكر، مفقودات وموجودات.

## Reference

Old admin: `/admin/posts?type=0` (news), `?type=1` (videos), `?type=2` (photos), `?type=3&categoryId=79` (jobs), `?type=3&categoryId=81` (thanks), `?type=3&categoryId=80` (lost & found). The old page title for all `type=3` sections was "المختصرات"; ours uses the section name.

Screenshots: [`05-jobs-list.png`](screenshots/05-jobs-list.png) · [`05-lost-found-list.png`](screenshots/05-lost-found-list.png) · [`05-news-list.png`](screenshots/05-news-list.png) · [`05-photos-list.png`](screenshots/05-photos-list.png) · [`05-thanks-list.png`](screenshots/05-thanks-list.png) · [`05-videos-list.png`](screenshots/05-videos-list.png)

## Scope

- `src/app/(admin)/content/[type]/page.tsx` (validates the slug → `notFound()` for unknown slugs; `generateStaticParams` returns the six slugs — check the dynamic-routes guide in `node_modules/next/dist/docs/` for Cache Components behaviour)
- `src/config/content-types.ts`:

| Slug | Title | `type` | `categoryId` | Category filter |
|---|---|---|---|---|
| `news` | الأخبار | 0 | — | yes |
| `videos` | الفيديوهات | 1 | — | yes |
| `photos` | الصور | 2 | — | yes |
| `jobs` | وظائف | 3 | 79 ⚠ | no (fixed) |
| `thanks` | رسائل شكر | 3 | 81 ⚠ | no (fixed) |
| `lost-found` | مفقودات وموجودات | 3 | 80 ⚠ | no (fixed) |

- `src/features/posts/{api,hooks,components,types}`, `src/features/categories/{api,hooks}` (category options)
- Endpoints: `posts/list`, `posts/listAutherNames`, `posts/sendPostNotification`, `posts/delete`, `admins/list` (editor filter), `categories/list` — see [api-endpoints.md](../api-endpoints.md#posts--adminposts)

## Requirements

### Page header

Section title + "إضافة" → `/content/<slug>/new` (only with `allowPosts`).

### Filters (URL state)

| Filter | Param | Options |
|---|---|---|
| بحث | `search` | free text |
| كل التصنيفات | `categoryId` | categories of this `type` (hidden for fixed-category sections) |
| كل المحررين | `author` | admins list (id → displayName) |
| كل الكتاب | `authorName` | `listAutherNames` |
| كل حالات النشر | `active` | تحت المراجعة / منشور / موقوف |
| كل حالات العرض | `fixed` ⚠ | مثبت / غير مثبت |

### Columns

| Column | Content |
|---|---|
| م | post id |
| العنوان / التصنيف / التاريخ | title (2 lines max, links to edit); below it in small text: category (`text-primary-ink`) · date-time · views count with `Eye` icon |
| المحرر | the admin who created it |
| الكاتب | `authorName` |
| الحالة | `StatusBadge` (تحت المراجعة / منشور / موقوف) |
| مثبت | badge مثبت / غير مثبت |
| التحكم | actions below |

Titles are 2 lines max in every section — `type=3` too, where the title is the whole short text — with the full text in `title` on hover (user's decision).

### Row actions

| Action | Icon | Behaviour |
|---|---|---|
| تعديل | `Pencil` | `/content/<slug>/<id>/edit` |
| إرسال إشعار | `Bell` | confirm → `GET sendPostNotification/{id}` (pushes the post to the app's users; toast "تم إرسال الإشعار") |
| التعليقات | `MessageSquare` | `/comments?postId=<id>` |
| مشاهدة الخبر | `ExternalLink` | opens `https://alqhat.com/q/<id>` in a new tab ⚠ |
| حذف | `Trash2` | confirm → `delete/{id}` |

No status or pin actions in the row (user's decision) — status and pinning are changed in the edit form. Optimistic delete with rollback; toasts on success/failure.

### Pagination

Confirm the API's paging (page size, total / last page) on this list and finish `normalizeList()` in `src/lib/api/list.ts`, then record it in [api.md](../api.md#pagination). All other lists reuse it.

## Open questions (⚠ TBD)

- ✅ Response shape of `posts/list` — [sample](../api-samples/posts-list.json).
- Category ids 79 / 80 / 81 on `/v2`.
- Whether "كل حالات العرض" maps to `fixed` (or to `orderCase`); what `orderCase` values do.
- Public link format for "مشاهدة الخبر" (`/q/<id>` is seen in an ad link).

## Out of scope

Bulk actions, export, `type=4` (deaths) as its own section.

## Acceptance criteria

- [ ] All six sections send the right type/category and render the sample data; the user confirms on `/v2`.
- [ ] Every filter changes the URL and the results; reload keeps them; page resets to 1 on filter change.
- [ ] Status change, pin, delete work and the row updates without a full reload.
- [ ] Unknown slug → not-found; no `allowPosts` → forbidden.
- [ ] Loading, empty, error states; table scrolls inside its card at 390px.
- [ ] `pnpm check` passes.
