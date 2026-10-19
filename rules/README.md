# Rules Index

Read this first, then only the files that match the task.

| File | Read it when |
|---|---|
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Always — what the product is, its pages, and decisions already made |
| [workflow.md](workflow.md) | Always — how to approach, verify, and report a task |
| [architecture.md](architecture.md) | Creating files, folders, routes, state, forms, or adding a dependency |
| [api.md](api.md) | Any API call — client, request format, errors, query keys, pagination |
| [api-endpoints.md](api-endpoints.md) | Wiring a specific screen — every endpoint, its fields and enum values |
| [auth-and-permissions.md](auth-and-permissions.md) | Login, logout, token, guarded routes, permission-based UI |
| [design-system.md](design-system.md) | Any UI — colours, layout shell, sidebar, header, components, status badges |
| [rtl-and-arabic.md](rtl-and-arabic.md) | Any UI — Arabic copy, RTL layout, numbers and dates |
| [tables-and-forms.md](tables-and-forms.md) | List screens, filters, create/edit pages, confirmations, image pickers |
| [tasks/README.md](tasks/README.md) | Picking the next task — order, status, and the task template |

The source of truth for the backend contract is `alqhat2022-Admin.postman_collection.json` in the repo root, summarised in [api-endpoints.md](api-endpoints.md).

Anything marked **⚠ TBD** is not confirmed yet. Do not guess it — ask the user (for a sample response in [`api-samples/`](api-samples/README.md) or an answer) and update the rule file in the same change.

## ⛔ No API requests

**The AI agent never sends any request to the API** (`dreamapi.alqhat.com`, `/v1` or `/v2`) — no curl, no fetch scripts, no test calls, not even unauthenticated GETs, and no running the app against it. Response shapes come from samples the user provides in [`api-samples/`](api-samples/README.md). Verification by the agent is limited to `pnpm check` and local tests with mocked responses; the user tests against the real API.
