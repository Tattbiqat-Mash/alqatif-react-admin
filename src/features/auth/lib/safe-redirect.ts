const DEFAULT_AFTER_LOGIN = "/dashboard"

/**
 * Where to go after login: the `redirect` param if it is a path inside this app,
 * otherwise the dashboard. Rejects absolute and protocol-relative URLs (`//evil.com`,
 * `/\evil.com`) so the param cannot send the admin to another site.
 */
export function safeRedirect(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_AFTER_LOGIN
  }
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/login/")) {
    return DEFAULT_AFTER_LOGIN
  }
  return value
}

/** Reads `?redirect=` at call time — avoids useSearchParams so /login prerenders fully. */
export function redirectFromLocation(): string {
  return safeRedirect(new URLSearchParams(window.location.search).get("redirect"))
}
