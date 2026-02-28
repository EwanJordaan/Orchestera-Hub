import { db } from './db';
import { schemaStatements } from '../db/schema';

export async function initDatabase() {
	const migrate = db.transaction(() => {
		for (const statement of schemaStatements) {
			db.run(statement);
		}
	});

	migrate();
}
