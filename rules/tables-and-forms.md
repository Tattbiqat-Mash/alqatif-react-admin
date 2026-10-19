# Tables, Forms, and Confirmations

Applies to every list screen and every create / edit page.

## List screens

Page shape:

```tsx
<div className="flex flex-col gap-4 md:gap-6">
  <PageHeader title="الأخبار" action={can(...) && <AddButton href=".../new" />} />
  <Card>
    <FiltersBar />   {/* values in the URL via nuqs */}
    <XTable />       {/* renders <DataTable /> */}
  </Card>
</div>
```

The feature component that reads the URL is wrapped in `<Suspense>` in `page.tsx` (see [architecture.md](architecture.md#nextjs-16-notes)).

### `DataTable` (`@/components/ui/data-table`, built in Task 03)

One shared table for every list. Build features by passing props, never a raw `<table>`:

| Concern | Props |
|---|---|
| Columns and rows | `columns`, `data`, `getRowId` |
| Pagination | `page`, `pageCount` or `hasNextPage`, `onPageChange` (⚠ TBD which the API supports — see [api.md](api.md#pagination)) |
| Loading | `isLoading` → skeleton rows |
| Refetching | `isFetching` → thin progress bar on top; rows stay visible |
| Error | `isError`, `onRetry` → `<ErrorState />` |
| Empty | `emptyTitle`, `emptyDescription` → `<EmptyState />` |

- Header row `bg-surface-muted text-muted-text font-medium` (not sticky — the table scrolls with the page; it only scrolls horizontally inside its card); rows divided by `border-border`, hover `bg-surface-muted`.
- The table scrolls horizontally inside its card on small screens; the page never does.
- The id column (م) is narrow and muted; the actions column (التحكم) is last.
- Long titles wrap to at most two lines (`line-clamp-2`) with the full title in `title` on hover.

### Filters

- Search uses `<SearchInput>` (`Search` icon, clear button, debounced 400 ms).
- Filters over thousands of values (الكاتب: ~4000 names) are a text field with native suggestions (`<SearchInput listId>` + `<SuggestionsList>`, a `<datalist>`), not a select.
- Selects default to "الكل" / "كل …" (e.g. "كل التصنيفات"), which means the parameter is not sent.
- Filters apply immediately on change (no "بحث" button), reset the page to 1, and live in the URL so a view is shareable and survives reload.
- A "مسح الفلاتر" link appears when any filter is set.

### Row actions

Icon buttons (ghost, 32px, `aria-label` + tooltip) in the actions column, in this order: edit, toggle status, feature-specific actions, delete. Delete is `text-danger-ink`. Clicking the title also opens the edit page.

Forbidden: when the admin lacks the permission, or the query fails with `403`, render `<ForbiddenState />` instead of the card.

## Create and edit pages

- Routes: `/<resource>/new` and `/<resource>/[id]/edit`. One form component per resource handles both (`mode: "create" | "edit"`), receiving `defaultValues` from the details query in edit mode.
- Edit mode shows a skeleton while details load, and a not-found state on `404`.
- Layout: one `Card`, fields stacked with labels on top; two-column grid (`md:grid-cols-2`) only for short related fields (dates, durations, small selects). Groups of yes/no options sit together as a list of switches.
- Footer (bottom of the card): "حفظ" (primary, shows a spinner and is disabled while saving) and "تراجع" (outline, back to the list).
- Above the fields: a server-error banner (`bg-danger-muted text-danger-ink`) when the save fails.
- On success: invalidate the list and detail keys, toast "تم الحفظ بنجاح", navigate back to the list (keep the list's filters by returning to the previous URL when it is the list).
- Leaving a dirty form ("تراجع" or a sidebar link) asks "تجاهل التغييرات؟" in a confirm dialog.
- Forms use React Hook Form + Zod; the schema lives in the feature's `schemas/`. Field-to-body mapping is in the API layer.
- Required fields: mark the label with `*` and validate in the schema. Follow the old admin for which fields are required.

## Image field (`@/components/ui/image-picker`, built in Task 06)

Used for the post main image and the ad image:

- Shows the current image as a preview (with a remove button), or an empty drop area.
- "رفع مباشرة" uploads a file through the feature's `uploadImage` endpoint and sets the field to the returned value. Shows upload progress; accepts images only; ⚠ TBD max size.
- "من معرض الصور" (posts only) opens a dialog with the gallery (`listImages`) as a paginated grid; picking one sets the field.
- Broken image URLs show a neutral placeholder, not a broken icon.

## Confirmation dialogs

Every destructive or hard-to-undo action asks for confirmation in `<ConfirmDialog>` (`@/components/ui/confirm-dialog`, shadcn `AlertDialog`) that names its target. Never use `window.confirm` or `alert`.

| Action | The dialog says |
|---|---|
| Delete anything | "هل تريد حذف «{title}»؟ لا يمكن التراجع عن هذا الإجراء." |
| Send a push notification (notifications page, or `sendNotification` on save) | that it goes to all app users, with the title |
| Deactivate an editor | the editor's name and that they lose access |
| Delete a survey answer | the answer text |
| Discard unsaved changes | "تجاهل التغييرات؟" |

Toggling a post / comment / ad status from the list does not need a dialog; it updates in place (optimistic, rolls back on error) and toasts.
