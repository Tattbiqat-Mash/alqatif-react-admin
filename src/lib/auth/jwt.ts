/**
 * Reads a JWT's payload without verifying it — only to show the session's expiry
 * and claims in the UI. The server is the one that verifies the token.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split(".")[1]
  if (!part) return null
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** `exp` claim (seconds) → epoch ms, or null. */
export function jwtExpiresAt(token: string): number | null {
  const exp = decodeJwtPayload(token)?.exp
  return typeof exp === "number" ? exp * 1000 : null
}
