import { Pool, type PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false,
    },

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

const pool = new Pool(poolConfig);

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

export default pool;