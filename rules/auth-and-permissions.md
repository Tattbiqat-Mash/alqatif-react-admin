# Auth and Permissions

Implementation: `src/features/auth/`, `src/lib/auth/session-storage.ts`, `src/lib/api/client.ts`, `src/components/providers/auth-provider.tsx`.

## Login

- `/login` form: اسم المستخدم (`userName`), كلمة المرور (`password`), تذكرني (checkbox), زر "دخول".
- `POST /admin/admins/login` without the auth header.
- On success: store the session (below), then go to the `redirect` query param if it is a same-app path, else `/dashboard`.
- On `401` / `errorCode: "Invalid credentials"`: show "اسم المستخدم أو كلمة المرور غير صحيحة" — do not clear the fields.
- A signed-in admin who opens `/login` is sent to `/dashboard`.

Response (confirmed from [api-samples/auth-login.json](api-samples/auth-login.json)): `token` at the root, the admin in `data` with its `type` and `allow*` flags — no extra request is needed after login. Mapping: `mapLoginResponse()` / `mapAdmin()` in `src/features/auth/api/auth.api.ts`. Only the mapped `Admin` is stored; `data.password` (an MD5 hash the API should not send) is dropped.

## Session storage

| Item | Where | Why |
|---|---|---|
| JWT + admin profile | `localStorage` when "تذكرني" is checked, otherwise `sessionStorage` | The API is called from the browser, so the token must be readable by JS; `sessionStorage` limits an unremembered session to the tab |

- One module (`session-storage.ts`) reads and writes the session; every access is inside `try/catch`. No other code touches storage keys.
- On boot, `AuthProvider` loads the session. If the JWT has an `exp` claim and it has passed, treat it as signed out.
- There is no refresh endpoint. Any `401` from an authenticated call ends the session: the client's unauthorized handler clears storage; `AuthProvider` clears the query cache when the status becomes `signed-out`; the admin guard redirects to `/login?redirect=<current path>`.
- The token getter and the unauthorized handler are registered at module load in `auth-provider.tsx`, not in an effect (child effects run first, so early queries would go out without the token).
- Do not call `usePathname()` / `useSearchParams()` in root-level providers — they would make every route under the provider suspend (client-side bailout). `/login` reads `?redirect=` from `window.location` at submit time.
- Logout (user menu "خروج"): clear storage and the query cache, go to `/login`. There is no logout endpoint.
- Never render or log the token or password.

Do not reimplement any of this inside features — use `useAuth()` and the shared client.

## Guarding routes

- `src/app/(admin)/layout.tsx` renders a client `AuthGuard`: while the session loads it shows a full-screen loader; with no session it redirects to `/login?redirect=…`; otherwise it renders the shell.
- No `proxy.ts` — the token is not in a cookie, so the server cannot check it.

## Permissions

The server enforces access. The UI hides what the admin may not use.

`useAuth()` exposes `can(permission)` where `permission` is one of:

| Flag | Sidebar items / routes |
|---|---|
| `allowPosts` | المحتوى and all `/content/*` routes |
| `allowComments` | التعليقات `/comments*` |
| `allowAds` | الإعلانات `/ads*` |
| `allowAdmins` | المحررين `/editors*` |
| `allowNotifications` | الاشعارات `/notifications` |
| `allowSurveys` | الاستبيانات `/surveys*` |
| `allowSettings` | الاعدادات العامة `/settings` |
| — | الرئيسية `/dashboard` is open to every signed-in admin |

- Admin `type`: `0` أدمن (full access), `1` أدمن فرعي (limited by the flags). A `type=0` admin's flags come back `null`, so `can()` returns `true` for `type=0` — keep that logic only inside `can()`.
- ⚠ TBD: `allwoedCats` (e.g. `"1,2"`) may restrict a sub-admin to some categories, and `permissions` (a number) is unexplained. Ask the user before using either.
- The avatar is the first letter of `displayName` — the API has no image field.
- Sidebar items come from `src/config/nav.ts`, each with its permission; the sidebar filters them through `can()`. A group (المحتوى) shows only if at least one child is allowed.
- Opening a route without the permission renders `<ForbiddenState />` inside the shell (no redirect). A `403` from the API renders the same state.
- Hide create / edit / delete / toggle buttons the admin cannot use. Never gate on the display name or user name.

## Editing lock on posts

`changePostEditor` / `freePostEditor` look like an edit lock so two editors do not edit the same post. ⚠ TBD (Task 06): confirm the behaviour and response, then document it here. Until confirmed, do not block editing on it.
