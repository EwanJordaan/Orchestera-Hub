export async function initDatabase(d1: D1Database) {
	await d1.prepare(`
		CREATE TABLE IF NOT EXISTS tenants(
			id TEXT NOT NULL,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
	`).run();
}
