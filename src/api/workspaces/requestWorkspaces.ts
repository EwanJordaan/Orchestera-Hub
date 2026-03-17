import { Context } from 'hono';
import { db } from '../../config/db';

export async function getWorkspaces(c: Context) {
	const tenantId = c.req.param('tenantId');

	const stmt = db.prepare('SELECT title, id FROM workspaces WHERE tenant_id = ?');
	const workspaces = await stmt.all(tenantId);

	return c.json({ workspaces });
}

export async function getWorkspace(c: Context){
	const tenantId = c.req.param('tenantId');
	const workspaceId = c.req.param('workspaceId');

	const stmt = db.prepare('SELECT title, id FROM workspaces WHERE tenant_id = ? AND id = ?');
	const workspace = await stmt.get(tenantId, workspaceId);

	return c.json({ workspace });
}
