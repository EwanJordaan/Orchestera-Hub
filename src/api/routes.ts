import { Hono } from 'hono';
import { auth, systemAdminAuth } from './authMiddleware';
import { getWorkspaces, getWorkspace } from './workspaces/requestWorkspaces';
import { createTenant } from './tenants/createTenants';
import { getAllTenants, getTenants } from './tenants/getTenants';

export function registerRoutes(app: Hono) {
	app.get('/health', (c) => c.json({ health: 'active' }));

	app.post('/v1/tenants/', systemAdminAuth, createTenant);
	app.get('/v1/tenants/', systemAdminAuth, getAllTenants);
	app.get('/v1/tenants/:tenantId/', getTenants);

	const tenantRouter = new Hono();
	tenantRouter.use('*', auth);
	tenantRouter.get('/workspaces', getWorkspaces);
	tenantRouter.get('/workspace/:workspaceId', getWorkspace);

	app.route('/v1/tenants/:tenantId', tenantRouter);
}
