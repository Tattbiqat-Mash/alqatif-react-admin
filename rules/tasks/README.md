# Tasks

Do them in order — each one builds on the previous. Tick a task only when all its acceptance criteria pass (see [workflow.md](../workflow.md#6-report)).

| # | Task | Depends on | Status |
|---|---|---|---|
| 01 | [Project setup](01-project-setup.md) — deps, tokens, font, RTL, API client, base UI | — | ☑ |
| 02 | [Login and session](02-auth-login.md) | 01 | ◐ built and mapped; user acceptance after Task 03 |
| 03 | [Admin shell](03-admin-shell.md) — sidebar, header, user menu, guard, shared list pieces | 02 | ◐ built; drawer, user menu and keyboard need a manual click-through |
| 04 | [Dashboard](04-dashboard.md) — الرئيسية | 03 | ◐ built on the sample; the user confirms on `/v2` |
| 05 | [Content lists](05-posts-list.md) — الأخبار، الفيديوهات، الصور، وظائف، رسائل شكر، مفقودات | 03 | ◐ list, all six filters and row actions built on samples; the user confirms on `/v2` (and whether "حالات العرض" = `fixed`) |
| 06 | [Content create / edit](06-posts-form.md) | 05 | ◐ form, create/edit, upload, gallery and custom banners built on samples; edit lock deferred by the user (see Task 06) |
| 07 | [Comments](07-comments.md) — التعليقات | 05 | ☐ |
| 08 | [Ads](08-ads.md) — الإعلانات | 06 (image picker) | ☐ |
| 09 | [Editors](09-editors.md) — المحررين | 03 | ◐ built; `getDetails` mapping provisional until its sample arrives |
| 10 | [Notifications](10-notifications.md) — الاشعارات | 03 | ☐ |
| 11 | [Surveys](11-surveys.md) — الاستبيانات | 03 | ☐ |
| 12 | [Settings](12-settings.md) — الاعدادات العامة | 03 | ◐ built on the sample; open: the 4 extra fields (snapchat, telegram, tiktok, mobile) |

Screenshots of the old admin are the reference for **content** (fields, columns, filters, actions), not for the look. They live in [`screenshots/`](screenshots/), named `<task-number>-<what>.png` (e.g. `05-news-list.png`), and each task links its own. The sidebar and header (Task 03) appear in all of them.

## Task template

```markdown
# Task NN: <Title>

## Goal
One or two sentences, in user terms.

## Reference
Old admin URL and screenshot files.

## Scope
- Routes / files to create
- Endpoints (link to api-endpoints.md)

## Requirements
Content and behaviour, grouped by area.

## Open questions (⚠ TBD)
What must be confirmed before or during the task.

## Out of scope

## Acceptance criteria
- [ ] Checkable statements
```
