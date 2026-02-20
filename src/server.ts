import { Hono } from 'hono';

export interface Env {
  DB: D1Database;
  JOBS_QUEUE: Queue;
}

type Variables = {
  tenantId: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', async (c, next) => {
  const tenantId = c.req.header('X-Tenant-ID');
  if (!tenantId) {
    return c.json({ error: 'X-Tenant-ID header is required' }, 401);
  }
  c.set('tenantId', tenantId);
  await next();
});

app.get('/', (c) => {
  return c.json({ name: 'Orchestera Hub', version: '1.0.0' });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy' });
});

app.get('/jobs', async (c) => {
  const tenantId = c.get('tenantId');
  const jobs = await c.env.DB.prepare(
    'SELECT * FROM jobs WHERE tenant_id = ?'
  ).bind(tenantId).all();
  return c.json(jobs.results);
});

app.post('/jobs', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const { name, payload } = body;
  
  const result = await c.env.DB.prepare(
    'INSERT INTO jobs (tenant_id, name, payload, status) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(tenantId, name, JSON.stringify(payload), 'pending').first();
  
  return c.json({ id: result?.id, status: 'created' }, 201);
});

export default app;
