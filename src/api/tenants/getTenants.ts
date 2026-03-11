import { Context } from 'hono';
import { hashKey } from '../../config/hash';
import { db } from '../../config/db';

export async function getTenants(c: Context) {
	const tenantId = c.req.param('tenantId');
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Missing or invalid Authorization header' }, 401);
	}

	const apiKeyValue = authHeader.slice(7);
	const keyHash = hashKey(apiKeyValue);

	const adminStmt = db.prepare(
		'SELECT id FROM admin_api_keys WHERE key_hash = ? AND (expires_at IS NULL OR expires_at > datetime("now"))'
	);
	const adminKey = (await adminStmt.get(keyHash)) as { id: string } | undefined;

	const targetTenantId = tenantId;
	if (!targetTenantId) {
		return c.json({ error: 'Tenant id is required' }, 400);
	}

	let readableTenantId = targetTenantId;
	if (!adminKey) {
		const apiKeyStmt = db.prepare(
			'SELECT tenant_id FROM api_keys WHERE key_hash = ? AND (expires_at IS NULL OR expires_at > datetime("now"))'
		);
		const apiKeyRow = (await apiKeyStmt.get(keyHash)) as { tenant_id: string } | undefined;

		if (!apiKeyRow) {
			return c.json({ error: 'Invalid or expired API key' }, 401);
		}

		if (apiKeyRow.tenant_id !== targetTenantId) {
			return c.json({ error: 'API key does not match tenant' }, 403);
		}

		readableTenantId = apiKeyRow.tenant_id;
	}

	const tenantStmt = db.prepare('SELECT id, role, email, name FROM tenants WHERE id = ?');
	const tenant = (await tenantStmt.get(readableTenantId)) as
		| { id: string; role: string; email: string; name: string }
		| undefined;

	if (!tenant) {
		return c.json({ error: 'Tenant not found' }, 404);
	}

	return c.json({ tenant });
}
