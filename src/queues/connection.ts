import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisConnection(): Redis {
	if (redisClient) {
		return redisClient;
	}

	const host = process.env.REDIS_HOST || 'localhost';
	const port = parseInt(process.env.REDIS_PORT || '6379', 10);
	const password = process.env.REDIS_PASSWORD;

	redisClient = new Redis({
		host,
		port,
		password: password || undefined,
		maxRetriesPerRequest: 3,
		enableReadyCheck: true,
		lazyConnect: false,
	});

	redisClient.on('connect', () => {
		console.log(`[Redis] Connected to ${host}:${port}`);
	});

	redisClient.on('error', (err) => {
		console.error('[Redis] Connection error:', err);
	});

	return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
	if (redisClient) {
		await redisClient.quit();
		redisClient = null;
		console.log('[Redis] Connection closed');
	}
}
