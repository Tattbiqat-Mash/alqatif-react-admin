# Task 03: Admin Shell

## Goal

Every authenticated page shares one shell: a collapsible dark sidebar with the logo and permission-filtered navigation, and a header with the signed-in admin's menu. Also build the shared list pieces the feature tasks reuse.

## Reference

Sidebar and header in every screenshot of the old admin (`/admin/dashboard`, `/admin/posts?type=0`, …).

## Scope

- `src/app/(admin)/layout.tsx` (guard + shell), placeholder `page.tsx` for every route in [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md#4-pages) showing the page header only
- `src/components/layout/{admin-shell,sidebar,sidebar-nav,header,user-menu,auth-guard}.tsx`
- `src/config/nav.ts`, `src/config/content-types.ts` (slugs, titles, `type`, `categoryId` — used here for nav labels and in Task 05)
- `src/components/ui/{page-header,data-table,search-input,filters-bar,fetching-bar}.tsx`
- `src/app/(admin)/not-found.tsx`

## Requirements

### Guard

As in [auth-and-permissions.md](../auth-and-permissions.md#guarding-routes): full-screen loader while the session loads, redirect when signed out. Routes without permission render `<ForbiddenState />`.

### Sidebar

Everything in [design-system.md](../design-system.md#sidebar-srccomponentslayoutsidebartsx): logo, expanded/collapsed with persistence, mobile drawer, items and icons, المحتوى accordion (auto-open on child routes), active state, tooltips/popover when collapsed, permission filtering.

Suggested icons (lucide): الرئيسية `LayoutDashboard` · المحتوى `Newspaper` · التعليقات `MessageSquare` · الإعلانات `Megaphone` · المحررين `Users` · الاشعارات `Bell` · الاستبيانات `ListChecks` · الاعدادات العامة `Settings`.

### Header and user menu

As in [design-system.md](../design-system.md#header-srccomponentslayoutheadertsx): "مرحباً، {displayName}", avatar, chevron, dropdown with avatar, name, email, "خروج". "خروج" signs out (Task 02).

### Shared list pieces

- `PageHeader` — title, optional count, action slot.
- `DataTable`, `SearchInput`, `FiltersBar`, `FetchingBar` — as in [tables-and-forms.md](../tables-and-forms.md#list-screens). Pagination UI: previous / next and page numbers; adapt to the API's pagination once Task 05 confirms it.

## Open questions (⚠ TBD)

- ✅ Avatar: the profile has no image URL, so the initial letter is used.

## Out of scope

Page content (Tasks 04–12).

## Acceptance criteria

- [x] Signed-out visit to any admin route goes to `/login?redirect=…`.
- [x] Sidebar shows only the items the admin's flags allow; المحتوى hides when `allowPosts` is 0.
- [x] Collapse state survives reload; mobile (390px) shows the menu button instead of the sidebar.
- [ ] Drawer opens from the menu button and closes on navigation — *built, not clicked through yet (headless screenshots cannot click)*.
- [x] Active item and المحتوى accordion follow the current route.
- [ ] User menu shows name and email; "خروج" returns to `/login` — *built, not clicked through yet*.
- [ ] Keyboard: every item is reachable and has a visible focus ring; collapsed items have accessible names — *focus styles and aria-labels are in the code; not tested by keyboard yet*.
- [x] `pnpm check` passes.
