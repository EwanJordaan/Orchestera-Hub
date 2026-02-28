import { createHash } from 'crypto';

export function hashKey(apiKey: string): string {
	return createHash('sha256').update(apiKey).digest('hex');
}
