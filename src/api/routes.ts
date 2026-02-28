import { Hono } from 'hono';
import { auth } from './authMiddleware';
import { getWorkspaces } from './workspaces/requestWorkspaces';

export function registerRoutes(app: Hono) {
	app.get('/health', (c) => c.json({ health: 'active' }));

	const tenantRouter = new Hono();
	tenantRouter.use('*', auth);
	tenantRouter.get('/workspaces', getWorkspaces);

	app.route('/api/:tenantId', tenantRouter);
}
