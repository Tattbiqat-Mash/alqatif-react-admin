# Arabic and RTL

The whole app is Arabic and right-to-left. There is no second language and no i18n library.

## Document

- `src/app/layout.tsx`: `<html lang="ar" dir="rtl">`, Cairo font variable on `<html>`, `font-sans` mapped to Cairo in `globals.css`.
- Radix / shadcn primitives read direction from `<DirectionProvider dir="rtl">` (from `@/components/ui/direction`, which wraps `radix-ui`'s `Direction`; set up in Task 01) — wrap the app with it so dropdowns, selects and menus open correctly.

## Copy

- Write UI text in Arabic directly in the component. No dictionaries, no `t()`.
- Text used in more than one place lives in one constant, not repeated:
  - Enum labels (statuses, post types, ad types, khatma kinds…) → label maps in `src/lib/labels.ts` (or the feature's `types/`).
  - Shared actions and messages (حفظ، تراجع، إضافة، حذف، "حدث خطأ غير متوقع"، "تم الحفظ بنجاح") → `src/lib/messages.ts`.
- Use correct Arabic spelling in new copy (الإعلانات، الإشعارات، الإعدادات، مرحباً) even where the old admin had typos.
- Never show raw English API messages to the admin (see [api.md](api.md#errors-in-the-ui)).

## Numbers and dates

**Every number is shown in Western digits (0–9)** — counts, views, ids, dates, times, phone numbers — matching the old admin.

- Format through the helpers in `src/lib/format.ts`, which use the locale `ar-SA-u-nu-latn-ca-gregory` (Arabic month/day names, Western digits, Gregorian calendar):
  - `formatNumber(n)` → `125,139`
  - `formatDate("2026-10-17")` → `17-10-2026` (the old admin's order; ⚠ TBD if the user prefers month names)
  - `formatDateTime("2026-10-17 23:51:45")` → `23:51:45 17-10-2026`
- Never call `toLocaleString()` / `toLocaleDateString()` without that locale, never hardcode another locale, and never type Arabic-Indic digits (٠–٩) in code.
- Numbers, dates, ids, phone numbers and URLs inside Arabic text are wrapped in `<bdi>` or `dir="ltr"` spans so they do not flip.

## RTL layout

- Use logical utilities only: `ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s rounded-e`. Never `ml-* mr-* pl-* pr-* left-* right-* text-left text-right`.
- The one exception is a shadcn `Sheet` / `side` prop, which is physical: the sidebar drawer is `side="right"`.
- Directional icons (chevrons, arrows, "back") flip with `rtl:rotate-180` or are picked for RTL (back = `ArrowRight`).
- LTR values keep LTR: emails, URLs, user names, passwords, phone numbers, ids, code and shortcodes get `dir="ltr"` on their input or element (`<Input type="email|url|password|tel">` sets it automatically — see Task 01). Free text (titles, comments, content) gets `dir="auto"` only where mixed content is common; otherwise inherits RTL.
- Icons inside a field go through the `Input` component's `startIcon` / `endAdornment` props, never an absolutely positioned sibling.
- Tables: first column at the start (right). Action columns at the end (left).
- Check every UI change in RTL at mobile and desktop widths.
