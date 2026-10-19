# Working Method

How to approach a task in this repository.

## 1. Understand

- Read the task file in `rules/tasks/` and the screenshots or notes it references.
- What is requested, and what is explicitly not?
- If missing information affects correctness (an API field, an enum value, a permission), ask. If the answer is clear from existing code or the rules, do not ask.
- Items marked **⚠ TBD** must be confirmed before you depend on them — ask the user; for response shapes ask for a sample in `rules/api-samples/`. When you confirm one, update the rule file and remove the marker.
- **Never send a request to the API** (see [README.md](README.md#-no-api-requests)).

## 2. Inspect before creating

Search for something that already does the job before writing anything new:

- `src/components/ui/` — shadcn primitives and the shared pieces (`data-table`, `page-header`, `status-badge`, `confirm-dialog`, `image-picker`, states)
- `src/components/layout/` — sidebar, header, admin shell
- `src/features/<feature>/` — the feature's own api, hooks, components, types
- `src/lib/` — API client, auth, labels, utils
- `src/config/` — `endpoints.ts`, `nav.ts`, `content-types.ts`

Then read the rule files that match the task (see the index in [README.md](README.md)).

Before writing Next.js code, check the relevant guide in `node_modules/next/dist/docs/` — this is Next.js 16 with Cache Components; APIs differ from older versions (see [architecture.md](architecture.md#nextjs-16-notes)).

## 3. Plan (non-trivial tasks)

Briefly state which files you will create or change, the data flow, and the states and permissions involved. Skip this for one-line fixes.

## 4. Implement

- Put the code in the layer that owns it: routes in `src/app/`, domain code in `src/features/<feature>/`, generic UI in `src/components/ui/`, infrastructure in `src/lib/`.
- Smallest correct change. Keep the existing design unless a visual change is requested.
- If you find an unrelated problem, leave it and mention it. If it blocks the task, make the smallest fix and explain it.

## 5. Verify

Run `pnpm check` (`tsc --noEmit`, `eslint`, `next build`) for any code change. (The script is added in Task 01; until then run the three commands directly.)

For UI changes, also check:

- [ ] RTL layout is correct; no physical `left/right` utilities
- [ ] 390 px mobile and desktop widths; no page-level horizontal scroll
- [ ] Sidebar expanded, collapsed, and mobile drawer
- [ ] Loading, empty, error, and forbidden states
- [ ] Tables: internal scroll, sticky header, pagination works
- [ ] Forms: field errors, server error banner, disabled submit while saving, success toast
- [ ] Destructive actions ask for confirmation
- [ ] Items hidden when the admin lacks the permission flag

**Local visual check (no API):** `pnpm build`, `npx next start -p 3100`, then headless Chrome (`chrome --headless=new --window-size=1440,900 --virtual-time-budget=6000 --screenshot=… URL`) and read the PNG. For pages behind the guard, a temporary `public/__seed.html` can write a fake session to `localStorage` (`qatif_admin_session`) and redirect; for 390px, a same-origin `public/__mobile.html` with a 390px iframe (headless Chrome enforces a wider minimum window). For screens that load data, run a local mock that serves the user's samples (a small Node `http` server on another port with CORS `*`) and build with `NEXT_PUBLIC_API_URL=http://localhost:<port>`; check `grep -rl dreamapi .next/static` is empty before starting, and **rebuild with the normal env afterwards** so no mock-pointed build is left behind. Delete both helpers afterwards and stop the server (kill the process on the port — stopping the `npx` task leaves `node` running).

When the API is involved, test the mapping with the samples in `rules/api-samples/` (mocked, no network). For code that goes through the shared client, start an in-process `node:http` server on `127.0.0.1` that answers with the sample and run the script with `NEXT_PUBLIC_API_URL=http://127.0.0.1:<port>` (patching `axios.defaults.adapter` from a scratch script does not work — it gets a different axios instance). Never call the API yourself; list the flows the user should try against `/v2` in the report.

## 6. Report

```text
Implemented   — what changed, in user terms
Files changed — list
Verification  — only checks actually run, with their real result
Notes         — anything skipped, unverified, ⚠ TBD items confirmed or still open
```

Never claim a check you did not run. Tick the task in [tasks/README.md](tasks/README.md) only when its acceptance criteria pass.
