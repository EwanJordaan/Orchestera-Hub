import { Pool, type PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    },

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });
export const query = pool.query.bind(pool);
