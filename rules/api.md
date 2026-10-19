# API Integration

## Contract first

- **Base URL:** `https://dreamapi.alqhat.com/v2`, from `NEXT_PUBLIC_API_URL`. All admin paths start with `/admin/...`.
- **Contract source:** `alqhat2022-Admin.postman_collection.json` (repo root), summarised per module in [api-endpoints.md](api-endpoints.md).
- The collection has **request examples only — no saved responses.** Response shapes are ⚠ TBD until the user provides a sample in [`api-samples/`](api-samples/README.md). From a sample, write the TypeScript type in the feature's `types/` and record the shape in [api-endpoints.md](api-endpoints.md).
- **Never send a request to the API yourself** — not to explore, not to test (see [README.md](README.md#-no-api-requests)).

Never invent an endpoint, method, field, or enum value. If something is not in the collection or the rules, ask the user.

## Responses that are not available yet (2026-10-19)

The user cannot provide the replies of **add / edit / delete / toggle** calls for now ("we'll see the responses later"). Until they do:

- Any non-error reply to a mutation counts as success; the app then refetches the affected lists/details.
- Screens whose **list / details** samples are missing are built with **provisional** mappings (`pickText` / `pickNumber` / `unwrapDetails` in `src/lib/api/parse.ts`, candidate keys from the collection's request fields and the old screenshots), each flagged `⚠ TBD — PROVISIONAL` in code. Replace them with the real DTO when a sample arrives.
- Never drop data the form does not show: fields the details carry but the save body lacks are passed through unchanged (e.g. settings' snapchat / telegram / tiktok / mobile).

## What is confirmed (observed once during setup, before the no-requests rule)

| Fact | Detail |
|---|---|
| Auth header | `Authorization: Bearer <JWT>` — without it: `401 {"status":"error","message":"Token not found."}`; malformed: `401 … "Wrong number of segments"` |
| CORS | `Access-Control-Allow-Origin: *`; allowed headers include `Authorization`, `Content-Type` — the browser can call the API directly |
| Error envelope | `{ "status": "error", "message": "…" }` or `{ "status": "error", "errorCode": "…" }` (login uses `errorCode`, e.g. `"Invalid credentials"` with HTTP 401) |
| Content-Type | Responses are sometimes sent as `text/html` even though the body is JSON — the client must parse JSON regardless of the header |

## Request format

- **POST** bodies are `application/x-www-form-urlencoded` (build them with `URLSearchParams`), not JSON.
- **GET** endpoints take ids in the path: `/admin/posts/getDetails/{id}`, `/admin/ads/delete/{id}`.
- Booleans are sent as `1` / `0`.
- Multi-value fields are comma-separated strings: `banners=1,2`, `categories=1,2`.
- Uploads are `multipart/form-data`: single file field `attachment`; multiple files `images[]`.
- Note the collection uses **GET for mutations** (`delete`, `changeActive`, `changeFixed`, `deleteQuestion`). Call them as documented; treat them as mutations in TanStack Query.

## Layers

```text
Component  →  Feature hook (TanStack Query)  →  Feature API function  →  Shared client  →  API
features/x/components   features/x/hooks          features/x/api           src/lib/api
```

- Components never call Axios or `fetch` directly.
- API functions use the shared client from `src/lib/api/client.ts` and paths from `src/config/endpoints.ts`. Never create another Axios instance or hardcode a path.
- Map API shapes to UI shapes inside the API layer (pure functions): unwrap the envelope, convert `"1"`/`"0"` strings to numbers/booleans if the API sends strings, normalise dates. Components never see raw API quirks.
- Form values → request body mapping also lives in the API layer (`toPostBody(values)`).

## Shared client (`src/lib/api/client.ts`, built in Task 01)

- Base URL, 30 s timeout, `Accept: application/json`.
- Adds `Authorization: Bearer <token>` from the auth storage.
- Serialises plain-object bodies to `URLSearchParams` for POST.
- Parses the body as JSON even when `Content-Type` is `text/html`.
- Treats `{ status: "error" }` as an error even if the HTTP status is 200 (⚠ TBD whether the API ever does this — handle it anyway).
- Normalises every failure to `ApiError { statusCode, message, code?, fieldErrors? }` (`src/lib/api/errors.ts`). `message` falls back to a generic Arabic message when the API sends only `errorCode`.
- On `401` from any endpoint **except login**: clear the session and redirect to `/login`. There is no refresh-token endpoint.

## Errors in the UI

| Status | UI behaviour |
|---|---|
| 401 on login | "اسم المستخدم أو كلمة المرور غير صحيحة" under the form |
| 401 elsewhere | Handled by the client (sign out → `/login`) |
| 403 | `<ForbiddenState />` |
| 404 | Not-found state ("العنصر غير موجود") with a link back to the list |
| 400 / 422 | Map field errors onto form fields if the API sends them (⚠ TBD format); otherwise show the message in the form banner |
| 5xx / network / timeout | `<ErrorState />` with "إعادة المحاولة" |

Never show a raw Axios error or an English API message such as `Token not found.` to the admin.

## TanStack Query

Defaults (`src/components/providers/query-provider.tsx`): `staleTime` 30 s, `refetchOnWindowFocus: false`, one retry, no retry for 400/401/403/404/422.

- **Keys:** list `["<resource>", "list", params]`, detail `["<resource>", "detail", id]`. Every request parameter goes in the key; nothing else. Keys are built by a `<resource>Keys` object in the feature's hooks file.
- **Guards:** detail queries use `enabled: Boolean(id)`.
- **Mutations:** on success, invalidate every affected list and detail key and show a success toast. Show an error toast (or the form banner) on failure. Optimistic updates (e.g. toggling status) must roll back on error.
- Lists use `placeholderData: keepPreviousData` so the table keeps its rows while the next page loads.

## Pagination

- List endpoints take `page` starting at **0**. Confirmed envelope ([posts-list sample](api-samples/posts-list.json)): `{ status, rowsCount, pagesCount, data: [] }` — `rowsCount` is the number of rows in this page (40 for a full posts page), `pagesCount` the number of pages; **there is no total count**, so headers show no record count and the pager shows "صفحة X من Y". Every list goes through `normalizeList()` in `src/lib/api/list.ts`.
- The URL shows 1-based pages (`?page=1`); convert to 0-based only in the API function.
- Page, search and filters live in the URL (nuqs) and in the query key.

## Data conventions

- Dates come as `YYYY-MM-DD` and datetimes as `YYYY-MM-DD HH:mm:ss` (seen in the old admin). ⚠ TBD timezone (assume Saudi time, UTC+3, as displayed). Format for display with the helpers in `src/lib/format.ts` (see [rtl-and-arabic.md](rtl-and-arabic.md#numbers-and-dates)).
- Images: `mainImage` / `image` hold full URLs; uploads return `fileName` + `filePath` and are stored as `filePath/fileName`. Show any stored value through `imageUrl()` (`src/config/content-types.ts`).

## Checklist for a new integration

1. Path added to `endpoints.ts`
2. Request / response types; nullable fields marked; no `any`; response shape (from the user's sample) recorded in `api-endpoints.md`
3. API function using the shared client, with mapping
4. Hook with a stable key, `enabled` guard, invalidation + toasts for mutations
5. Loading, empty, error, and forbidden states wired in the UI
6. Enum values come from the label maps, not literals in JSX
