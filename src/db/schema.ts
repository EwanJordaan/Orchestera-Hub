export const schemaStatements = [
	`CREATE TABLE IF NOT EXISTS tenants(
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT,
		role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
		payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('paid', 'unpaid', 'trialing')),
		created_at TEXT DEFAULT CURRENT_TIMESTAMP
	);`,
	`CREATE TABLE IF NOT EXISTS api_keys(
		id TEXT PRIMARY KEY,
		key_hash TEXT NOT NULL,
		tenant_id TEXT NOT NULL,
		expires_at TEXT,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (tenant_id) REFERENCES tenants(id)
	);`,
	`CREATE TABLE IF NOT EXISTS admin_api_keys(
		id TEXT PRIMARY KEY,
		key_hash TEXT NOT NULL UNIQUE,
		label TEXT,
		expires_at TEXT,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP
	);`,
	`CREATE TABLE IF NOT EXISTS workspaces(
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		tenant_id TEXT NOT NULL,
		info TEXT NOT NULL,
		version TEXT NOT NULL,
		updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (tenant_id) REFERENCES tenants(id)
	);`,
	`CREATE TABLE IF NOT EXISTS nodes(
		id TEXT PRIMARY KEY,
		tenant_id TEXT NOT NULL,
		info TEXT NOT NULL,
		version TEXT NOT NULL,
		updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (tenant_id) REFERENCES tenants(id)
	);`,
	`CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_hash ON api_keys(tenant_id, key_hash);`,
	`CREATE INDEX IF NOT EXISTS idx_admin_api_keys_hash ON admin_api_keys(key_hash);`,
	`CREATE INDEX IF NOT EXISTS idx_workspaces_tenant ON workspaces(tenant_id);`,
	`CREATE INDEX IF NOT EXISTS idx_nodes_tenant ON nodes(tenant_id);`,
];
