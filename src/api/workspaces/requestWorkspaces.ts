import { Context } from 'hono';
import { db } from '../../config/db';

export async function getWorkspaces(c: Context) {
	const tenantId = c.req.param('tenantId');

	const stmt = db.prepare('SELECT title, id FROM workspaces WHERE tenant_id = ?');
	const workspaces = await stmt.all(tenantId);

	return c.json({ workspaces });
}
