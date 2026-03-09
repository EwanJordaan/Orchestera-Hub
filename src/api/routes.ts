import { Hono } from 'hono';
import { auth, systemAdminAuth } from './authMiddleware';
import { getWorkspaces } from './workspaces/requestWorkspaces';
import { createTenant } from './tenants/createTenants';
import { getTenants } from './tenants/getTenants';

export function registerRoutes(app: Hono) {
	app.get('/health', (c) => c.json({ health: 'active' }));

	app.post('/v1/tenants/', systemAdminAuth, createTenant);


	const tenantRouter = new Hono();
	tenantRouter.get('/', getTenants);
	tenantRouter.use('/workspaces', auth);
	tenantRouter.get('/workspaces', getWorkspaces);

	app.route('/v1/tenants/:tenantId', tenantRouter);
}
