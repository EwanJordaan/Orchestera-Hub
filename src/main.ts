import { initDatabase } from './config/init';
import { createRoutes } from './app';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		await initDatabase(env.D1);
		const app = createRoutes();
		return app.fetch(request, env, ctx);
	}
};
