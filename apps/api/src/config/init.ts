import type { D1Database } from '@cloudflare/workers-types';

type Migration = {
    id: string;
    sql: string;
};

const migrations: Migration[] = [
    {
        id: '001-create-auth-db',
        sql: `
      CREATE TABLE IF NOT EXISTS auth_db (
        id TEXT PRIMARY KEY,
        api TEXT NOT NULL,
        expired BOOLEAN DEFAULT FALSE
      );
    `
    },
    {
        id: '002-create-schema-migrations',
        sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `
    },
    {
        id: '003-create-tenants',
        sql: `
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY DEFAULT (
          lower(
            printf(
              '%s-%s-%s-%s-%s',
              substr(hex(randomblob(4)), 1, 8),
              substr(hex(randomblob(2)), 1, 4),
              substr(hex(randomblob(2)), 1, 4),
              substr(hex(randomblob(2)), 1, 4),
              substr(hex(randomblob(6)), 1, 12)
            )
          )
        ),
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    }
];

let initialized = false;

export async function initializeDatabase(db: D1Database) {
    if (initialized) return;

    await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

    const applied = await db
        .prepare('SELECT id FROM schema_migrations')
        .all<{ id: string }>();

    const appliedIds = new Set(applied.results.map((row) => row.id));

    for (const migration of migrations) {
        if (appliedIds.has(migration.id)) continue;
        await db.exec(migration.sql);
        await db
            .prepare('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)')
            .bind(migration.id, new Date().toISOString())
            .run();
    }

    initialized = true;
}
