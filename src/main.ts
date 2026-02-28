import { initDatabase } from './config/init';
import { createApp } from './app';
import { configureDatabase } from './config/db';

const PORT = process.env.PORT || 3000;

async function start() {
	configureDatabase();
	await initDatabase();
	const app = createApp();

	console.log(`Server running on http://localhost:${PORT}`);

	Bun.serve({
		port: PORT,
		fetch: (req) => app.fetch(req)
	});
}

start();
