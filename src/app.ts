import { Hono } from 'hono';
import { registerRoutes } from './api/routes';

export function createApp() {
	const app = new Hono();
	registerRoutes(app);
	return app;
}
