import type { D1Database } from '@cloudflare/workers-types';
import type { Env } from 'hono';

export type ApiEnv = {
    port: number;
};

export interface WorkerEnv extends Env {
    DB: D1Database;
}

export function getApiEnv(): ApiEnv {
    return {
        port: Number(process.env.PORT ?? 3000)
    };
}
