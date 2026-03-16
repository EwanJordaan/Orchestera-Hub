import type { RedisOptions } from 'ioredis';

/**
 * Retrieves the Redis connection options from environment variables.
 * This function centralizes the configuration for connecting to Redis,
 * allowing bullmq to create its own optimized connections.
 */
export function getRedisConnectionOptions(): RedisOptions {
	const host = process.env.REDIS_HOST || 'localhost';
	const port = parseInt(process.env.REDIS_PORT || '6379', 10);
	const password = process.env.REDIS_PASSWORD;

	return {
		host,
		port,
		password: password || undefined,
		// It is recommended to set maxRetriesPerRequest to null for BullMQ.
		// This prevents ioredis from retrying commands that may have already timed out on the client side.
		maxRetriesPerRequest: null,
		// This setting is recommended for BullMQ for performance reasons.
		enableReadyCheck: false,
	};
}
