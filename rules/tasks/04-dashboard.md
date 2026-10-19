# Task 04: Dashboard (الرئيسية)

## Goal

On sign-in, admins see today's activity and what readers read most this week and month.

## Reference

Old admin: `/admin/dashboard` (2 screenshots).

Screenshots: [`04-dashboard-1.png`](screenshots/04-dashboard-1.png) · [`04-dashboard-2.png`](screenshots/04-dashboard-2.png)

## Scope

- `src/app/(admin)/dashboard/page.tsx`, `src/features/dashboard/*`
- Endpoint: `GET /admin/settings/adminHome`

## Requirements

### Stat cards (row of 3, one column on mobile)

| Card | Content |
|---|---|
| عدد الأخبار اليوم | number of posts today |
| عدد الزوار اليوم | visitors today |
| مجموع مشاهدات اليوم | total views today |

Big number (`formatNumber`), label below, an icon in a `bg-primary-muted` circle.

### Panels (two-column grid on desktop)

| Panel | Display |
|---|---|
| أكثر الأقسام قراءة هذا الأسبوع | horizontal bar chart: category name → views |
| أعلى أيام الأسبوع زيارة | bar chart: weekday → visits |
| أكثر 10 أيام زيارة هذا الشهر | bar chart: date → visits |
| أكثر 10 أخبار قراءة هذا الأسبوع | list: rank, title, category, views badge (not linked — the API sends no id) |

Charts follow [design-system.md](../design-system.md#charts-dashboard). Each panel has its own skeleton, empty state ("لا توجد بيانات") and the page has one error state with retry.

## Open questions (⚠ TBD)

- ✅ The `adminHome` response shape — [sample](../api-samples/dashboard-admin-home.json), recorded in [api-endpoints.md](../api-endpoints.md#dashboard--adminsettings), mapped in `src/features/dashboard/api/dashboard.api.ts`.
- The old admin shows `0` for all three stat cards and two empty charts — confirm with the user whether the API returns these values on `/v2`, or the panels should be hidden when the data is missing.
- ✅ Top-10 posts have no id or type, so they are not linked.
- `dayname` / `openDate` formats are unknown (the sample has no data for them).

## Out of scope

Date range pickers, exporting.

## Acceptance criteria

- [x] All seven blocks render from the sample data (or their empty state) — checked with a local mock, plus a filled variant for the day charts.
- [ ] The user confirms on `/v2`.
- [x] Numbers use Western digits with thousands separators.
- [x] Charts read right-to-left and fit at 390px without page scroll.
- [x] `pnpm check` passes.
