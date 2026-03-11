import { db } from './db';
import { schemaStatements } from '../db/schema';

export async function initDatabase() {
	await db.run('BEGIN');
	try {
		for (const statement of schemaStatements) {
			await db.run(statement);
		}
		await db.run('COMMIT');
	} catch (error) {
		await db.run('ROLLBACK');
		throw error;
	}
}
