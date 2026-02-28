import { Database } from 'bun:sqlite';
import { mkdirSync } from 'fs';

mkdirSync('data', { recursive: true });

const dbPath = process.env.DB_PATH || './data/db.sqlite';

export const db = new Database(dbPath);

export function configureDatabase() {
	db.run('PRAGMA journal_mode = WAL');
	db.run('PRAGMA synchronous = NORMAL');
	db.run('PRAGMA foreign_keys = ON');
	db.run('PRAGMA busy_timeout = 5000');
}
