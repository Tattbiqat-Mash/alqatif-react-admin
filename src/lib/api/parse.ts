/**
 * Helpers for the API's loose value types (numbers often arrive as strings, e.g. "3191039").
 * Use them in the API layer only.
 */

/** "3191039" → 3191039; anything unparseable → `fallback`. */
export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

/** Trimmed string, or "" for null/undefined/non-strings. */
export function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : ""
}

/** The API's arrays are sometimes missing; treat that as empty. */
export function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}
