import { Context } from 'hono';
import { hashKey } from '../config/hash';
import { db } from '../config/db';

export async function auth(c: Context, next: () => Promise<void>) {
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ error: 'Missing or invalid Authorization header' }, 401);
	}

	const apiKey = authHeader.slice(7);
	const tenantId = c.req.param('tenantId');

	const keyHash = hashKey(apiKey);

	const stmt = db.prepare(
		'SELECT tenant_id FROM api_keys WHERE key_hash = ? AND tenant_id = ? AND (expires_at IS NULL OR expires_at > datetime("now"))'
	);
	const result = stmt.get(keyHash, tenantId) as { tenant_id: string } | undefined;

	if (!result) {
		return c.json({ error: 'Invalid or expired API key' }, 401);
	}

	c.set('tenantId', result.tenant_id);
	await next();
}
