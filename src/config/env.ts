// `NEXT_PUBLIC_*` values are inlined at build time, so they must be read with
// their literal names (no dynamic `process.env[key]`).
const apiUrl = process.env.NEXT_PUBLIC_API_URL

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local (https://dreamapi.alqhat.com/v2).",
  )
}

export const env = {
  /** e.g. https://dreamapi.alqhat.com/v2 — no trailing slash. */
  apiUrl: apiUrl.replace(/\/+$/, ""),
} as const
