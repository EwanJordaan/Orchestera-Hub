import type { Context } from 'hono';
import type { WorkerEnv } from '../config/env';

type AuthorizationResult =
    | { authorized: true }
    | { authorized: false; error: string };

export async function authorizeUser(c: Context<WorkerEnv>): Promise<AuthorizationResult> {
    const env = c.env as WorkerEnv | undefined;
    const db = env?.DB;
    if (!db) {
        return { authorized: false, error: 'database unavailable' };
    }

    const authEntry = await db
        .prepare('SELECT id, api, expired FROM auth_db WHERE id = ?')
        .bind(c.req.param('id'))
        .first();

    const header = c.req.header('Authorization');
    const storedApi = (authEntry?.json as { api?: string } | undefined)?.api;
    if (!authEntry || storedApi !== header) {
        return { authorized: false, error: 'unauthorized id or api key' };
    }

    return { authorized: true };
}
