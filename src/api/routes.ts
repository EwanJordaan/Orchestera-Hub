import { Hono } from 'hono';
import { apiKeyAuth, auth } from './authMiddleware';
import { getWorkspaces } from './workspaces/requestWorkspaces';
import { createTenant } from './tenants/createTenants';

export function registerRoutes(app: Hono) {
	app.get('/health', (c) => c.json({ health: 'active' }));

	app.post('/v1/tenants/:adminApiKey', apiKeyAuth, createTenant);

	const tenantRouter = new Hono();
	tenantRouter.use('*', auth);
	tenantRouter.get('/workspaces', getWorkspaces);

	app.route('/v1/tenants/:tenantId', tenantRouter);
}
