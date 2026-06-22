---
name: postman-invoizmo-collection
description: Create or refresh the category-wise Invoizmo Postman collection from the local Express backend using the Postman MCP server. Use when the user asks to generate, rebuild, update, sync, or execute the Invoizmo API Postman collection, add endpoints with sample bodies, organize endpoints by module/category, or verify that the Invoizmo workspace/collection exists in Postman.
---

# Postman Invoizmo Collection

## Workflow

1. Verify the Postman MCP tools are available. Use `tool_search` for Postman tools if they are not already exposed.
2. Read `postman://instructions` once with `read_mcp_resource` before making Postman changes.
3. Find the `Invoizmo` workspace with `getWorkspaces({ limit: 100 })`; use workspace ID `3e468282-ed2a-4401-83a3-d33bfa230f74` only if it still appears in the response.
4. Inspect the local backend before creating requests. Prefer:
   - `backend/src/app.ts`
   - `backend/src/routes/index.ts`
   - `backend/src/routes/health.routes.ts`
   - `backend/src/modules/*/*.routes.ts`
   - `backend/src/modules/*/*.schema.ts`
5. Build a Postman Collection v2.1 payload with category folders matching backend modules.
6. Create a new collection with `createCollection`, or update an explicitly selected existing collection with `putCollection`. If the user did not ask to replace an existing collection, create a new timestamp-free collection named `Invoizmo API`.
7. Verify the result with `getCollection` and report category count, endpoint count, collection name, and collection ID.

## Required Collection Defaults

Use collection-level bearer auth:

```json
{
  "type": "bearer",
  "bearer": [{ "key": "token", "value": "{{accessToken}}", "type": "string" }]
}
```

Add variables:

```json
[
  { "key": "baseUrl", "value": "http://localhost:5000", "type": "string" },
  { "key": "accessToken", "value": "", "type": "string" },
  { "key": "invoiceId", "value": "000000000000000000000000", "type": "string" },
  { "key": "userId", "value": "000000000000000000000000", "type": "string" },
  { "key": "contactId", "value": "000000000000000000000000", "type": "string" },
  { "key": "resetToken", "value": "", "type": "string" }
]
```

Set `auth: { "type": "noauth" }` on public requests: health, auth register/login/refresh/forgot/reset, and contact submit.

For Login/Register/Refresh, add a test event that saves `json.data.accessToken` to `accessToken`.

## Route Reference

Read `references/invoizmo-routes.md` when creating or refreshing the full collection. It contains the current category list, endpoints, query parameters, and sample JSON request bodies derived from the backend.

## Guardrails

- Do not invent routes from memory; inspect the current repo and update the reference if routes changed.
- Do not overwrite an existing Postman collection unless the user asks to refresh/replace it or clearly identifies the collection.
- Keep sample bodies valid against the Zod schemas.
- Use collection variables for runtime IDs and tokens instead of hard-coded real user data.
- After creating the collection, verify with `getCollection`; the expected current baseline is 8 categories and 29 endpoints.
