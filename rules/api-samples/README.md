# API Response Samples

The AI agent never calls the API. Response shapes come from samples the **user** captures (Postman, browser DevTools) and saves here.

- One file per endpoint: `<module>-<endpoint>.json`, e.g. `auth-login.json`, `posts-list.json`, `posts-details.json`, `dashboard-admin-home.json`.
- Paste the raw response body as returned by `/v2`. For lists, a page with 2–3 items is enough.
- **Redact secrets** before saving: replace the JWT with `"<token>"` and remove passwords. Real names/phone numbers in content can stay only if the user is fine with committing them.
- An error example is welcome as `<module>-<endpoint>.error.json`.

When a sample arrives, the agent writes the TypeScript type in the feature's `types/`, records the shape in [../api-endpoints.md](../api-endpoints.md), and uses the sample as a mocked response in tests.
