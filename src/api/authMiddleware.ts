import { Context } from 'hono';
import { hashKey } from '../config/hash';
import { db } from '../config/db';

export async function auth(c: Context, next: () => Promise<void>) {
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Missing or invalid Authorization header' }, 401);
	}

	const apiKey = authHeader.slice(7);
	const keyHash = hashKey(apiKey);

	// The tenantId from the path is optional.
	const pathTenantId = c.req.param('tenantId');

	const stmt = db.prepare(
		'SELECT tenant_id FROM api_keys WHERE key_hash = ? AND (expires_at IS NULL OR expires_at > datetime("now"))'
	);
	const result = stmt.get(keyHash) as { tenant_id: string } | undefined;

	if (!result) {
		return c.json({ error: 'Invalid or expired API key' }, 401);
	}

	// If tenantId is present in the path, it must match the tenantId from the API key.
	if (pathTenantId && pathTenantId !== result.tenant_id) {
		return c.json({ error: 'API key does not match tenant' }, 403);
	}

	c.set('tenantId', result.tenant_id);
	await next();
}

export async function apiKeyAuth(c: Context, next: () => Promise<void>) {
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Missing or invalid Authorization header' }, 401);
	}

	const apiKey = authHeader.slice(7);
	const keyHash = hashKey(apiKey);

	const stmt = db.prepare('SELECT tenant_id FROM api_keys WHERE key_hash = ? AND (expires_at IS NULL OR expires_at > datetime("now"))');
	const result = stmt.get(keyHash) as { tenant_id: string } | undefined;

	if (!result) {
		return c.json({ error: 'Invalid or expired API key' }, 401);
	}

	c.set('apiTenantId', result.tenant_id);
	await next();
}

export async function adminAuth(c: Context, next: () => Promise<void>) {
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Missing or invalid Authorization header' }, 401);
	}

	const apiKey = authHeader.slice(7);
	const keyHash = hashKey(apiKey);

	const stmt = db.prepare('SELECT tenant_id FROM tenants WHERE id = ? AND role = "admin"');
	const result = stmt.get(keyHash) as { tenant_id: string } | undefined;

	return result !== undefined;
}
