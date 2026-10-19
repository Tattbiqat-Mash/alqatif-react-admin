import { ApiError } from "@/lib/api/errors"
import { messages } from "@/lib/messages"

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

/**
 * ⚠ For PROVISIONAL mappings only (no response sample yet): the first non-empty string
 * among candidate keys. Replace with the real key once the sample arrives.
 */
export function pickText(source: Record<string, unknown> | null | undefined, keys: readonly string[]): string {
  if (!source) return ""
  for (const key of keys) {
    const value = toText(source[key])
    if (value) return value
  }
  return ""
}

/** ⚠ PROVISIONAL mappings only: the first parseable number among candidate keys. */
export function pickNumber(
  source: Record<string, unknown> | null | undefined,
  keys: readonly string[],
  fallback = 0,
): number {
  if (!source) return fallback
  for (const key of keys) {
    const value = toNumber(source[key], Number.NaN)
    if (Number.isFinite(value)) return value
  }
  return fallback
}

/** `{ data: [x] }`, `{ data: x }` or `x` → x (details responses vary between endpoints). */
export function unwrapDetails(raw: unknown): Record<string, unknown> | null {
  const root = (raw ?? null) as { data?: unknown } | null
  if (!root || typeof root !== "object") return null
  const data = Array.isArray(root.data) ? root.data[0] : root.data
  const value = typeof data === "object" && data !== null ? data : root
  return value as Record<string, unknown>
}

/**
 * ⚠ PROVISIONAL details mappings: the error to throw when the reply cannot be read.
 * An empty `data` means the item is gone (404); anything else means the mapping is wrong,
 * which must not look like "not found". In development the raw reply is logged to copy as a sample.
 */
export function unreadableDetails(raw: unknown, endpoint: string, message: string): ApiError {
  if (process.env.NODE_ENV !== "production") console.warn(`[${endpoint}] unreadable reply — send it as a sample:`, raw)
  const data = (raw as { data?: unknown } | null)?.data
  const empty = raw == null || data === null || (Array.isArray(data) && data.length === 0)
  return new ApiError({
    // The HTTP status was 2xx; only an empty reply is treated as a missing item.
    statusCode: empty ? 404 : 200,
    message: empty ? messages.errors.notFound : message,
    serverMessage: `${endpoint}: unexpected shape (mapping is ⚠ TBD)`,
  })
}
