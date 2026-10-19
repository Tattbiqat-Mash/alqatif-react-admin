# Task 12: General Settings (الاعدادات العامة)

## Goal

Admins edit the site's contact links and static texts.

## Reference

Old admin: `/admin/settings`.

Screenshots: [`12-settings.png`](screenshots/12-settings.png)

## Scope

- `src/app/(admin)/settings/page.tsx`, `src/features/settings/*`
- Endpoints: `GET /admin/settings/getDetails`, `POST /admin/settings/edit` — [api-endpoints.md](../api-endpoints.md#settings--adminsettings)
- Permission: `allowSettings`

## Requirements

One form in two cards:

**وسائل التواصل**

| Field | Control |
|---|---|
| فيسبوك * (`facebook`) | URL input |
| تويتر / X * (`twitter`) | URL input |
| إنستغرام * (`insta`) | URL input |
| واتساب * (`whatsapp`) | phone input (LTR), e.g. `+966558511232` |
| البريد الإلكتروني * (`email`) | email input |

**الصفحات**

| Field | Control |
|---|---|
| عنّا * (`about`) | textarea (auto-grow) |
| سياسة الخصوصية * (`privacy`) | textarea |
| معلومات * (`info`) | textarea |

- Loads current values; "حفظ" sends all fields; toast on success; "تراجع" resets to the loaded values.
- URL fields validate as URLs (Arabic characters in the path are allowed, as in the current Facebook link).

> **Status:** built (`src/features/settings/`). The save body is the collection's (8 fields, all sent). `settings/getDetails` mapped from its [sample](../api-samples/settings-details.json) (`data` is a one-item array). Verified end-to-end on a local mock: values load, validation (empty URL, bad email) blocks the save, the save sends all 8 fields, line breaks in the texts are kept.

## Open questions (⚠ TBD)

- ✅ `settings/getDetails` shape.
- `getDetails` also returns `snapchat`, `telegram`, `tiktok`, `mobile`. They are not in the form but **are sent back unchanged with every save**, so a save cannot blank them. Still open: should they be editable?

- Are `about` / `privacy` / `info` plain text or HTML on the public site? (The old form uses plain textareas; current values are just ".")

## Acceptance criteria

- [ ] Values load from the sample and the save request contains every field; the user confirms on `/v2`.
- [ ] Validation messages in Arabic.
- [ ] `pnpm check` passes.
