# Task 08: Ads (الإعلانات)

## Goal

Manage the site/app ads: banners, pop-ups ("اقتحامي") and in-post banners, with their image, link, schedule and target categories.

## Reference

Old admin: `/admin/ads`, `/admin/ads/{id}/edit` (2 screenshots).

Screenshots: [`08-ad-edit-1.png`](screenshots/08-ad-edit-1.png) · [`08-ad-edit-2.png`](screenshots/08-ad-edit-2.png) · [`08-ads-list.png`](screenshots/08-ads-list.png)

## Scope

- `src/app/(admin)/ads/{page,new/page,[id]/edit/page}.tsx`, `src/features/ads/*`
- Endpoints: `ads/list`, `getDetails`, `add`, `edit`, `changeActive`, `delete`, `uploadImage` — [api-endpoints.md](../api-endpoints.md#ads--adminads)
- Reuses `ImagePicker` (upload only, no gallery) from Task 06
- Permission: `allowAds`

## Requirements

### List

- Page header "الإعلانات" + "إضافة".
- Filters (URL): النوع (`type`: الكل / بانر / اقتحامي / بانر داخل الخبر), الحالة (`active`: الكل / فعال / غير فعال).
- Columns:

| Column | Content |
|---|---|
| م | id |
| الصورة | thumbnail 120×68, `object-cover`, rounded; click opens it full size |
| العنوان | title (links to edit) |
| النوع | type label |
| تاريخ العرض | `startDate` |
| تاريخ النهاية | `endDate` — `text-danger-ink` when already past |
| عدد مرات الظهور | views count |
| الحالة | `StatusBadge` فعال / غير فعال |
| التحكم | تعديل, تغيير الحالة (toggle), حذف (confirm) |

### Form

| Field | Control | Notes |
|---|---|---|
| العنوان * | input | |
| النوع * | select | بانر / اقتحامي / بانر داخل الخبر |
| عدد مرات الظهور للشخص الواحد * | number input (LTR) | `requiredViews`, ≥ 0 |
| الصورة | image picker (upload) | `image`; helper "يمكنك تغيير الصورة بالضغط عليها" |
| طبيعة العمل * | select | خبر / لينك خارجي |
| الخبر * | post id input (when kind = خبر) | `postId` ⚠ (a searchable post picker is nicer — confirm) |
| اللينك * | URL input (when kind = لينك خارجي) | `link`, must be a valid URL |
| تاريخ العرض * / تاريخ النهاية * | date inputs, side by side | end ≥ start |
| الحالة * | select | فعال / غير فعال |
| التصنيف * | multi-select of categories | `categories`, sent comma-separated |

> **Status:** built (`src/features/ads/`) with **provisional** list/details mappings (keys from the add body and getBanners rows). Add/edit body = collection; both `link` and `postId` are always sent, the unused one empty/0. Image upload uses the shared `uploadImageTo` (⚠ assumes the posts upload reply). Categories = news categories (type 0) for now. Verified on a local mock with agent-made data.

## Open questions (⚠ TBD)

- Response shapes; whether "عدد مرات الظهور" in the list is total views or `requiredViews`.
- The old ad form showed an internal link (`https://alqhat.com/q/521121`) with kind "لينك خارجي" — confirm how "خبر" ads are stored (`postId` only?).
- Which category types are valid targets (all types, or news only)?
- Recommended image dimensions per ad type (to show as helper text).

## Acceptance criteria

- [ ] List with both filters, toggle, delete; create and edit with image upload build the right requests; the user confirms on `/v2`.
- [ ] Conditional fields switch with "طبيعة العمل"; the hidden field is not sent.
- [ ] Date validation in Arabic.
- [ ] `pnpm check` passes.
