import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { login, logout, auth } from './middleware/auth';

const app = new Hono();

app.get('/health', (c) => {return c.json({status: 'ok'})});
app.post('/login', login);
app.post('/logout', logout);
app.all('/api/*', auth);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: port,
})