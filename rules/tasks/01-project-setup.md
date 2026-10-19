# Task 01: Project Setup

## Goal

Turn the Create Next App starter into the base of the admin: dependencies, design tokens, Arabic RTL document, API client, providers, and the shared UI primitives every later task needs.

## Scope

- `package.json`, `.env.example`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- `src/lib/api/{client,errors,list}.ts`, `src/lib/{labels,messages,format,utils}.ts`
- `src/config/endpoints.ts`
- `src/components/providers/*`
- `src/components/ui/*` (shadcn primitives + states)

## Requirements

### Dependencies

- Install: `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `nuqs`, `sonner`, `recharts`, `lucide-react`.
- Initialise shadcn/ui for Tailwind v4 (`init -t next -b radix -p nova --rtl --pointer`; it brings `radix-ui`, `cn` — shadcn's class merger, used instead of `clsx` + `tailwind-merge` — `class-variance-authority`, `tw-animate-css`) and add `direction` plus: `button`, `input`, `textarea`, `label`, `select`, `checkbox`, `switch`, `card`, `badge`, `dialog`, `alert-dialog`, `dropdown-menu`, `sheet`, `tooltip`, `popover`, `skeleton`, `avatar`, `separator`, `collapsible`, `sonner`.
- Add scripts: `"typecheck": "tsc --noEmit"`, `"check": "pnpm typecheck && pnpm lint && pnpm build"`.
- Remove the starter content in `src/app/page.tsx` (it becomes a redirect to `/dashboard`) and the unused starter SVGs in `public/` (keep `logo.jpeg`).

### Document and font

- `<html lang="ar" dir="rtl">`, Cairo via `next/font/google` (`arabic` + `latin`), remove Geist.
- Metadata: title template `%s | لوحة تحكم القطيف اليوم`, default `لوحة تحكم جريدة القطيف اليوم الاخبارية`; icon from `public/logo.jpeg`.
- Wrap the app in `DirectionProvider dir="rtl"`.

### Tokens

- Replace `globals.css` with the full token set from [design-system.md](../design-system.md#colour-tokens) (light only — delete the `prefers-color-scheme: dark` block), mapped through `@theme inline`, plus `--radius: 8px` and `--font-sans: var(--font-cairo)`.
- Map shadcn's expected variables (`--primary`, `--ring`, `--destructive`, …) onto our tokens so generated components use them.

### Providers (`src/components/providers/`)

- `QueryProvider` with the defaults in [api.md](../api.md#tanstack-query).
- `NuqsAdapter` (Next app router adapter).
- `Toaster` (sonner, top-center, RTL).
- `AuthProvider` is added in Task 02.

### API layer

- `.env.example`: `NEXT_PUBLIC_API_URL=https://dreamapi.alqhat.com/v2`.
- `src/config/endpoints.ts`: every path in [api-endpoints.md](../api-endpoints.md), as functions where an id is in the path.
- `src/lib/api/client.ts` and `errors.ts` exactly as described in [api.md](../api.md#shared-client-srclibapiclientts-built-in-task-01). The 401 handler calls a `setUnauthorizedHandler()` hook that Task 02 registers.
- `src/lib/api/list.ts`: placeholder `normalizeList()` with a `// ⚠ TBD` note; finished in Task 05.

### Shared helpers

- `src/lib/format.ts`: `formatNumber`, `formatDate`, `formatDateTime` (see [rtl-and-arabic.md](../rtl-and-arabic.md#numbers-and-dates)).
- `src/lib/labels.ts`: label + tone maps for every enum in [api-endpoints.md](../api-endpoints.md) (post status, post type, yes/no, ad type, ad kind, editor type, active/inactive, khatma kind/size).
- `src/lib/messages.ts`: shared Arabic action labels and messages.

### Base UI (`src/components/ui/`)

- `Input` wrapper: sets `dir="ltr"` for `type="email" | "password" | "url" | "tel"`, supports `startIcon` / `endAdornment`; `PasswordInput` with show/hide.
- `StatusBadge` (tone + label), `EmptyState`, `ErrorState` (with retry), `ForbiddenState`, `NotFoundState`, `FullPageLoader`, `Spinner`.
- `ConfirmDialog` on `AlertDialog`.

## Open questions (⚠ TBD)

- Hosting target (affects nothing in this task; note it stays open).
- A high-resolution logo (the current file is 48×48).

## Out of scope

Login, layout shell, any page content.

## Acceptance criteria

- [x] `pnpm check` passes.
- [x] Opening the app shows Arabic RTL with Cairo; no starter content remains.
- [x] No hex colours in components; tokens exist for every value in the design system.
- [x] The client turns a `401 {"status":"error","message":"Token not found."}` response into an `ApiError` with `statusCode: 401` and an Arabic message, and calls the unauthorized handler.
- [x] `formatNumber(125139)` → `125,139` and `formatDateTime("2026-10-17 23:51:45")` shows Western digits.
