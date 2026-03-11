import { Queue, Worker } from 'bullmq';
import { getRedisConnection } from './connection';
import type { JobData, JobResult } from './types';

export const QUEUE_NAMES = {
	EMAIL: 'email-queue',
	WORKSPACE: 'workspace-queue',
} as const;

export function createQueue(name: string): Queue<JobData, JobResult> {
	const connection = getRedisConnection();

	return new Queue<JobData, JobResult>(name, {
		connection,
		defaultJobOptions: {
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 1000,
			},
			removeOnComplete: {
				age: 3600,
				count: 100,
			},
			removeOnFail: {
				age: 86400,
				count: 500,
			},
		},
	});
}

export const emailQueue = createQueue(QUEUE_NAMES.EMAIL);
export const workspaceQueue = createQueue(QUEUE_NAMES.WORKSPACE);

export function createWorker(
	name: string,
	processor: (job: { data: JobData }) => Promise<JobResult>
): Worker<JobData, JobResult> {
	const connection = getRedisConnection();

	return new Worker<JobData, JobResult>(name, async (job) => {
		console.log(`[Worker] Processing job ${job.id} on queue "${name}"`);
		const result = await processor(job);
		console.log(`[Worker] Job ${job.id} completed:`, result);
		return result;
	}, {
		connection,
		concurrency: 5,
	});
}

export async function addEmailJob(data: JobData['email']): Promise<void> {
	await emailQueue.add('send-email', { email: data });
}

export async function addWorkspaceJob(data: JobData['workspace']): Promise<void> {
	await workspaceQueue.add('process-workspace', { workspace: data });
}
