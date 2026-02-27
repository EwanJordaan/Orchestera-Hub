# Orchestera-Hub
Orchestra Hub is a multi-tenant workflow orchestration backend in TypeScript. Define DAG-based jobs and run them with retries, scheduling, and safe concurrency via a DB-backed worker engine. API only, no frontend.

## Local Cloudflare D1 database

1. **Create the local database schema.**
   ```sh
   wrangler d1 execute DB --local --persist-to local-d1 \
     --command "CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);"
   ```
2. **Seed a record so you have something to query.**
   ```sh
   wrangler d1 execute DB --local --persist-to local-d1 \
     --command "INSERT INTO workspaces (id, name) VALUES ('ws-1', 'First Workspace');"
   ```
3. **Read the local data.**
   ```sh
   wrangler d1 execute DB --local --persist-to local-d1 \
     --command "SELECT id, name, created_at FROM workspaces;"
   ```

Local D1 state is stored under `local-d1/v3/d1/miniflare-D1DatabaseObject/`, so rerunning the commands reuses the same SQLite file without talking to Cloudflare's remote infrastructure.

### Using the database from your worker

When you run `wrangler dev --local --persist-to local-d1 apps/api/src/worker.ts`, the `DB` binding in `wrangler.toml` resolves to the local SQLite file instead of the remote production database. Example handler:

```ts
app.get('/api/v1/workspaces/:id', async (c) => {
  const workspace = await c.env.DB
    .prepare('SELECT id, name, created_at FROM workspaces WHERE id = ?')
    .bind(c.req.param('id'))
    .first();

  if (!workspace) {
    return c.json({ error: 'not found' }, 404);
  }

  return c.json(workspace);
});
```

The same binding works when you deploy the worker—just drop the `--local` flag and the remote `database_id` from `wrangler.toml` is used.
