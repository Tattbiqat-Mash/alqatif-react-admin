# Task 02: Login and Session

> **Status:** built. Mapping confirmed from `rules/api-samples/auth-login.json` (token at the root, admin in `data`, flags `null` for `type=0`, JWT valid 30 days). The 401 → `/login?redirect=…` redirect is done by the admin guard in Task 03 (the client only clears the session). Remaining: the user runs the acceptance criteria on `/v2` once Task 03 provides `/dashboard`.

## Goal

Admins sign in with their user name and password, optionally stay signed in, and are signed out when the token is no longer valid.

## Reference

Old admin: `https://www.alqhat.com/admin` (login screenshot).

Screenshots: [`02-login.png`](screenshots/02-login.png)

## Scope

- Route `src/app/login/page.tsx`
- `src/features/auth/{api,hooks,components,schemas,types}`
- `src/lib/auth/session-storage.ts`, `src/components/providers/auth-provider.tsx`
- Endpoint: `POST /admin/admins/login` ([api-endpoints.md](../api-endpoints.md#auth--adminadmins))

## Requirements

### Page

- Centered card on `bg-background`: logo, title "لوحة تحكم جريدة القطيف اليوم الاخبارية", the form.
- Fields: "اسم المستخدم" (LTR input, autocomplete `username`), "كلمة المرور" (`PasswordInput`, autocomplete `current-password`), checkbox "تذكرني", primary full-width button "دخول" with spinner while pending.
- Validation: both fields required ("هذا الحقل مطلوب").
- Errors as in [auth-and-permissions.md](../auth-and-permissions.md#login).
- `/login` reads `redirect` from `window.location` at submit time (no `useSearchParams`), so the page prerenders without a `Suspense` boundary.

### Session

- Implement storage, boot, expiry check, 401 sign-out and logout exactly as in [auth-and-permissions.md](../auth-and-permissions.md#session-storage).
- `useAuth()` returns `{ status: "loading" | "signed-in" | "signed-out", admin, can, signIn, signOut }` (the token stays inside the session module and the API client).
- The client's token getter and unauthorized handler are registered at module load in `auth-provider.tsx`.

### Contract ✅ confirmed

Ask the user for a sample login response (saved as `rules/api-samples/auth-login.json`, token redacted) and record in [api-endpoints.md](../api-endpoints.md#auth--adminadmins):

1. The success response shape (token location, profile fields, permission flags, avatar).
2. Whether the JWT has `exp` and how long it lasts.
3. Whether `type=0` admins come back with all `allow*` flags set.

Then remove the ⚠ markers you resolved in `auth-and-permissions.md` and `api-endpoints.md`.

## Open questions (⚠ TBD)

- ✅ Contract points 1–3 — answered by the sample.
- ✅ `/v2/admin/admins/login` works (confirmed by the user).
- Meaning of `allwoedCats` and `permissions` in the admin record.

## Out of scope

Change password, forgot password (no endpoint).

## Acceptance criteria

- [ ] Wrong credentials show the Arabic error and keep the user name.
- [ ] Correct credentials land on `/dashboard` (or the `redirect` path).
- [ ] With "تذكرني" the session survives closing the browser; without it, it survives a reload but not a new tab session.
- [ ] Deleting the token or receiving any 401 returns to `/login?redirect=…`.
- [ ] Token never appears in the console or the UI.
- [x] `pnpm check` passes.
