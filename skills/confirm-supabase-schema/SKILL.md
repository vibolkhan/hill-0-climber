---
name: confirm-supabase-schema
description: Confirm Supabase table names, column names, and PostgREST query shape before writing or changing frontend Supabase queries. Use when Codex works with Supabase tables, sees schema-cache errors such as PGRST205/PGRST204, creates migrations, maps UI data to database fields, or needs to verify singular/plural table names and selected columns.
---

# Confirm Supabase Schema

Verify the live Supabase schema before changing app queries or migrations.

## Workflow

1. Read the app code for the intended table and selected columns.
2. Read Supabase config from `.env.local`, `.env`, or the existing client helper.
3. Probe the live REST endpoint before editing:
   - Check table existence with `select=*` and `limit=0`.
   - Check required columns with an explicit `select=col_a,col_b` and `limit=0`.
   - Treat PostgREST hints as strong evidence, especially singular/plural table suggestions.
4. If a table or column is missing, update the app query to match the live schema when the live schema is clearly authoritative.
5. If a migration is being created or maintained, keep table and column names consistent with the app query.
6. Preserve RLS expectations:
   - A frontend publishable/anon key can only read rows when a select policy permits it.
   - A successful `limit=0` probe confirms the table and columns, not that rows are visible.
7. Report the confirmed table, confirmed columns, and any remaining risk such as RLS or missing seed data.

## Script

Use `scripts/probe-supabase-schema.mjs` from the repo root:

```bash
node skills/confirm-supabase-schema/scripts/probe-supabase-schema.mjs --table products --columns id,name,description,price,stock
```

The script reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env.local` by default. Override with:

```bash
node skills/confirm-supabase-schema/scripts/probe-supabase-schema.mjs --env .env --table products --columns id,name
```

## Interpreting Results

- `ok: true` for both probes means the table and selected columns exist for REST queries.
- `PGRST205` means PostgREST cannot find the table in the schema cache; use the hint if present.
- Column errors usually mean the selected field name differs from the live schema.
- HTTP 401/403 usually points to credentials, API key, or RLS/policy issues rather than spelling.
