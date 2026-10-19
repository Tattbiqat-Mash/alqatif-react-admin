# Architecture and Code Conventions

## Stack

Next.js 16.4 (App Router, Turbopack, `cacheComponents` + `partialPrefetching` on) · React 19.3 · TypeScript (strict) · Tailwind CSS v4 · pnpm. Added in [Task 01](tasks/01-project-setup.md):

| Package | Use |
|---|---|
| shadcn/ui (`radix-nova` style, `radix-ui`, RTL on) + `lucide-react` | UI primitives (`src/components/ui/`) and icons. Class merging uses `cn` from the `cn` package (shadcn's) — components import it directly |
| `@tanstack/react-query` v5 | Server data |
| `axios` | HTTP client (upload progress, interceptors) |
| `react-hook-form` + `zod` + `@hookform/resolvers` | Forms and validation |
| `nuqs` | Filters, search, page in the URL |
| `sonner` | Toasts (via shadcn) |
| `recharts` | Dashboard charts |
| `jodit` 4.17.1 + `jodit-react` 5.7.1 (pinned, MIT) | Post content editor — `src/components/ui/rich-text-editor.tsx`. Chosen by the user for keeping legacy HTML as is. Loaded with `next/dynamic` (`ssr: false`). `cleanHTML` rewriting is off, and `sourceEditor: "area"` + `beautifyHTML: false` keep it from downloading ACE / js-beautify from cdnjs |

Do not add any other dependency without asking. First check whether an installed package, the platform, or a few lines of local code already solve it.

## Folder layout

```text
src/
├── app/
│   ├── layout.tsx            root: <html lang="ar" dir="rtl">, font, providers
│   ├── login/                public
│   └── (admin)/              authenticated shell (guard + sidebar + header)
│       ├── dashboard/
│       ├── content/[type]/   list, new, [id]/edit — one set of routes for all post types
│       ├── comments/  ads/  editors/  notifications/  surveys/  settings/
├── components/
│   ├── ui/                   generic primitives (shadcn + shared pieces)
│   ├── layout/               sidebar, header, user-menu, admin-shell
│   └── providers/            query, auth, toaster
├── features/<feature>/       auth, dashboard, posts, comments, ads, editors, notifications, surveys, settings, categories
│   ├── api/                  <feature>.api.ts — HTTP functions + mapping
│   ├── hooks/                TanStack Query hooks
│   ├── components/           feature UI (tables, forms, filters)
│   ├── schemas/              zod schemas for forms
│   └── types/                feature types
├── config/
│   ├── endpoints.ts          every API path
│   ├── nav.ts                sidebar items (label, icon, href, permission)
│   └── content-types.ts      per-type config for posts (type, categoryId, title, fields)
├── lib/                      api client, auth storage, labels, format, utils
└── types/                    shared types (api envelope, auth)
```

- Pages compose feature components; keep business logic out of `page.tsx`.
- Domain-specific code stays in its feature. Move something to `components/ui` only when a second feature needs it and it carries no domain logic.
- Create folders only when you put something in them.

## Rendering

The token lives in the browser (see [auth-and-permissions.md](auth-and-permissions.md)), so the server cannot fetch on the admin's behalf. Therefore:

- Every admin screen is a Client Component that fetches through TanStack Query.
- Server Components are limited to layouts, thin `page.tsx` wrappers, `metadata` exports, and static `not-found` / `error` pages.
- No Server Actions, no Route Handlers, no `proxy.ts` for auth — the browser talks to the API directly.

## Next.js 16 notes

Read the matching guide in `node_modules/next/dist/docs/01-app/` before using any Next API. The points that bite most often here:

- **Cache Components is on.** Any client component that reads `useSearchParams()` (including every `nuqs` hook) or `useParams()` must render inside a `<Suspense>` boundary, otherwise the build fails with a blocking-prerender error. Put the boundary in `page.tsx` around the feature component, with a skeleton fallback.
- `params` and `searchParams` passed to pages and layouts are **Promises**. In this project, read them on the client with `useParams()` / `nuqs` instead.
- Use the global `PageProps<"/route">` and `LayoutProps<"/route">` helper types for page/layout props.
- **`instant = false` on `src/app/(admin)/layout.tsx`.** The session is browser-only, so on the server `AuthGuard` renders a loader instead of the page and the dev overlay reported every admin page as a "dropped segment" (instant-navigation validation). The admin area is opted out; do not remove it, and do not add `instant = true` to admin pages. `/login` and other public routes still validate.
- Middleware is now `proxy.ts`. This project does not need one.
- `next/font/google` for fonts, `next/image` for local images (`public/logo.jpeg`). Images from the API domain are shown with a plain `<img>` unless the domain is added to `images.remotePatterns`.

## State

| Kind | Tool |
|---|---|
| Server data | TanStack Query hooks |
| Filters, search, page, sort | URL via nuqs |
| Form state | React Hook Form + Zod |
| Signed-in admin, token | `AuthProvider` / `useAuth()` |
| Sidebar collapsed | `localStorage` (inside `try/catch`) |
| Everything else | local `useState` |

Do not add a global store (Zustand, Redux, …).

## Forms

React Hook Form + Zod for every form. Every form shows field errors under the field, a server-error banner, a disabled submit with a spinner while pending, required markers (`*`) on required labels, and labelled inputs. Client validation is for UX only — the server validates. Form conventions: [tables-and-forms.md](tables-and-forms.md).

## TypeScript

- `strict`; no `any`, no `@ts-ignore` / `@ts-expect-error` to silence real errors, no unnecessary `as` casts.
- Type API responses, component props, form values, and mapped models explicitly. Mark nullable API fields `| null`.
- API numeric enums (`active`, `type`, `kind`…) get a TypeScript union and a label map in one place (`src/lib/labels.ts` or the feature's `types/`), never magic numbers in components.

## Naming and imports

- Files kebab-case (`post-form.tsx`); components and types PascalCase; variables and functions camelCase.
- API files `<feature>.api.ts`; hooks `use-<thing>.ts`; schemas `<thing>.schema.ts`.
- Import through `@/…`; avoid deep relative paths and circular imports.

## Scope

- Do only what the task asks. No unrelated refactors, renames, or redesigns.
- Refactoring needed for the task: minimal, local, behaviour-preserving, and explained in the report.

## Security

- The only env var is `NEXT_PUBLIC_API_URL=https://dreamapi.alqhat.com/v2` — a public URL, not a secret. Commit `.env.example`; `.env*` files are git-ignored.
- No secrets in client code. Never log tokens or passwords.
- Post content is legacy HTML. Never render API HTML with `dangerouslySetInnerHTML` outside the editor; titles and comments render as text.

## Deployment

⚠ TBD — hosting target not decided. Until it is, the app only needs `pnpm build` to pass; avoid platform-specific APIs.
## Deployment (Cloudflare Workers via OpenNext)

- Config: `open-next.config.ts`, `wrangler.jsonc` (`nodejs_compat`, assets in `.open-next/assets`).
- Scripts: `pnpm dev`, `pnpm build` (Next build), `pnpm cf:build`, `pnpm preview`, `pnpm deploy`.
- `.open-next/` and `.wrangler/` are git-ignored.
- Avoid Node-only APIs that are not covered by `nodejs_compat`.