/**
 * Display formatting. Every number is shown with Western digits (0–9); Arabic words
 * (month and day names) come from the Arabic locale with the Gregorian calendar.
 * See rules/rtl-and-arabic.md.
 */
export const INTL_LOCALE = "ar-SA-u-nu-latn-ca-gregory"

const numberFormat = new Intl.NumberFormat(INTL_LOCALE)

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? numberFormat.format(n) : String(value)
}

const compactFormat = new Intl.NumberFormat(INTL_LOCALE, { notation: "compact", maximumFractionDigits: 1 })

/** For axis ticks and tight labels: 17267 → "17.3 ألف", 3191039 → "3.2 مليون". */
export function formatCompact(value: number): string {
  return Number.isFinite(value) ? compactFormat.format(value) : "—"
}

const DATE_RE =/^(\d{4})-(\d{2})-(\d{2})/
const TIME_RE = /(\d{2}:\d{2}(?::\d{2})?)$/

/**
 * API dates are `YYYY-MM-DD` and datetimes `YYYY-MM-DD HH:mm:ss` in Saudi time (⚠ TBD).
 * They are reformatted as text, not parsed into `Date`, so the browser's timezone
 * cannot shift them.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const m = DATE_RE.exec(value)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : value
}

/** `2026-10-17 23:51:45` → `23:51:45 17-10-2026` (the old admin's order). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = formatDate(value)
  const time = TIME_RE.exec(value.trim())?.[1]
  return time && DATE_RE.test(value) ? `${time} ${date}` : date
}

/** Weekday and month names in Arabic, digits Western — for chart labels and headings. */
export function formatDateLong(value: string | null | undefined): string {
  if (!value) return "—"
  const m = DATE_RE.exec(value)
  if (!m) return value
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return date.toLocaleDateString(INTL_LOCALE, { day: "numeric", month: "long", year: "numeric" })
}
