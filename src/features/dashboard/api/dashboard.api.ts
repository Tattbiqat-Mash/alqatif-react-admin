import { endpoints } from "@/config/endpoints"
import { apiGet } from "@/lib/api/client"
import { toArray, toNumber, toText } from "@/lib/api/parse"
import { formatDate } from "@/lib/format"
import type { AdminHomeDto } from "@/features/dashboard/types/dashboard.dto"
import type { ChartPoint, Dashboard } from "@/features/dashboard/types/dashboard.types"

/** ⚠ TBD: the sample has no weekday values yet; English names are translated if they come. */
const WEEKDAYS_AR: Record<string, string> = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
}

function weekdayLabel(value: string) {
  return WEEKDAYS_AR[value.toLowerCase()] ?? value
}

/** "2026-10-17" → "17-10"; anything else is shown as sent. */
function dayLabel(value: string) {
  const formatted = formatDate(value)
  return /^\d{2}-\d{2}-\d{4}$/.test(formatted) ? formatted.slice(0, 5) : formatted
}

/**
 * The API sends one `{ label: "", totalViews: "0" }` row when there is no data, so rows
 * with an empty raw label are dropped before the label is formatted.
 */
function points<T>(
  rows: T[],
  rawLabel: (row: T) => unknown,
  views: (row: T) => unknown,
  format: (label: string) => string = (label) => label,
): ChartPoint[] {
  return rows
    .map((row) => ({ raw: toText(rawLabel(row)), views: toNumber(views(row)) }))
    .filter((p) => p.raw !== "")
    .map((p) => ({ label: format(p.raw), views: p.views }))
}

export function mapAdminHome(dto: AdminHomeDto): Dashboard {
  const summary = dto.todaySummary ?? {}
  return {
    today: {
      news: toNumber(summary.todayNews),
      views: toNumber(summary.todayViews),
      visitors: toNumber(summary.todayVistores),
    },
    topCategories: points(toArray<AdminHomeDto["topCategories"][number]>(dto.topCategories), (r) => r.title, (r) => r.totalViews)
      .filter((p) => p.views > 0)
      .sort((a, b) => b.views - a.views),
    weekDays: points(toArray<AdminHomeDto["topWeekDays"][number]>(dto.topWeekDays), (r) => r.dayname, (r) => r.totalViews, weekdayLabel),
    monthDays: points(toArray<AdminHomeDto["monthDays"][number]>(dto.monthDays), (r) => r.openDate, (r) => r.totalViews, dayLabel),
    topPosts: toArray<AdminHomeDto["topPosts"][number]>(dto.topPosts).map((p) => ({
      title: toText(p.title),
      category: toText(p.categoryTitle),
      views: toNumber(p.views),
    })),
  }
}

export async function getDashboard(): Promise<Dashboard> {
  return mapAdminHome(await apiGet<AdminHomeDto>(endpoints.dashboard.home))
}
