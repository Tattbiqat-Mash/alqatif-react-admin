<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Project rules

This is the admin dashboard for **القطيف اليوم** (Arabic-only, RTL, light mode). Before any task, read [rules/README.md](rules/README.md) — it indexes the project rules and the ordered task list in [rules/tasks/](rules/tasks/README.md).

**Never send any request to the API** (`dreamapi.alqhat.com`) — no curl, scripts, or test calls. Ask the user for response samples in `rules/api-samples/` instead.
