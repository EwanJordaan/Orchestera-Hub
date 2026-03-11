import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/mydatabase';

const pool = new Pool({
	connectionString: DATABASE_URL
});

function normalizeSql(sql: string): string {
	let placeholderCount = 0;
	const placeholderSql = sql.replace(/\?/g, () => {
		placeholderCount += 1;
		return `$${placeholderCount}`;
	});
	return placeholderSql.replace(/datetime\((['"])now\1\)/gi, 'CURRENT_TIMESTAMP');
}

type Params = unknown[];

export const db = {
	async run(sql: string, ...params: Params) {
		const result = await pool.query(normalizeSql(sql), params);
		return { changes: result.rowCount ?? 0 };
	},
	prepare(sql: string) {
		const text = normalizeSql(sql);
		return {
			async get(...params: Params) {
				const result = await pool.query(text, params);
				return result.rows[0];
			},
			async all(...params: Params) {
				const result = await pool.query(text, params);
				return result.rows;
			},
			async run(...params: Params) {
				const result = await pool.query(text, params);
				return { changes: result.rowCount ?? 0 };
			}
		};
	},
	transaction<T>(fn: () => Promise<T>) {
		return async () => {
			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				const result = await fn();
				await client.query('COMMIT');
				return result;
			} catch (error) {
				await client.query('ROLLBACK');
				throw error;
			} finally {
				client.release();
			}
		};
	}
};

export function configureDatabase() {
	// PostgreSQL configuration is managed by server settings and connection params.
}
