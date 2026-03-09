import { Context } from "hono";
import { db } from "../../config/db";
import { adminAuth } from "../authMiddleware";

export async function createTenant(c: Context) {
	const tenantId = crypto.randomUUID();
    const adminApiKey = c.req.param('adminApiKey');    

    if (!await adminAuth(c, async () => {})) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, email, role, payment_status } = body;
    if (!name) {
        return c.json({ error: 'Name is required' }, 400);
    }
    if (!email) {
        return c.json({ error: 'Email is required' }, 400);
    }
    if (!role) {
        return c.json({ error: 'Role is required' }, 400);
    }
    if (!payment_status) {
        return c.json({ error: 'Payment status is required' }, 400);
    }

    const stmt = db.prepare('INSERT INTO tenants (id, name, email, role, payment_status) VALUES (?, ?, ?, ?, ?)');
    stmt.run(tenantId, name, email, role, payment_status);

    return c.json({ message: 'Tenant created', tenantId: tenantId }, 201);
}