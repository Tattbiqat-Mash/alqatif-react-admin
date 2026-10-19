import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every admin screen fetches in the browser (rules/architecture.md#rendering), so there is
// no ISR or data cache to persist — no R2 / KV incremental cache.
export default defineCloudflareConfig();
