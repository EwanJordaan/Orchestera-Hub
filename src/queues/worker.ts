import { createWorker } from './index';
import { QUEUE_NAMES } from './index';
import type { JobData, JobResult } from './types';

async function processEmailJob(job: { data: JobData }): Promise<JobResult> {
	const { email } = job.data;

	if (!email) {
		throw new Error('Email job data is missing');
	}

	console.log(`[Email Worker] Sending ${email.type} email to ${email.to}`);

	switch (email.type) {
		case 'welcome':
			return { success: true, message: 'Welcome email sent' };
		case 'reset-password':
			return { success: true, message: 'Password reset email sent' };
		case 'notification':
			return { success: true, message: 'Notification email sent' };
		default:
			return { success: false, message: 'Unknown email type' };
	}
}

async function processWorkspaceJob(job: { data: JobData }): Promise<JobResult> {
	const { workspace } = job.data;

	if (!workspace) {
		throw new Error('Workspace job data is missing');
	}

	console.log(`[Workspace Worker] Processing ${workspace.action} for workspace ${workspace.workspaceId}`);

	switch (workspace.action) {
		case 'create':
			return { success: true, message: 'Workspace created', data: { workspaceId: workspace.workspaceId } };
		case 'update':
			return { success: true, message: 'Workspace updated', data: { workspaceId: workspace.workspaceId } };
		case 'delete':
			return { success: true, message: 'Workspace deleted', data: { workspaceId: workspace.workspaceId } };
		case 'provision':
			return { success: true, message: 'Workspace provisioned', data: { workspaceId: workspace.workspaceId } };
		default:
			return { success: false, message: 'Unknown workspace action' };
	}
}

const emailWorker = createWorker(QUEUE_NAMES.EMAIL, processEmailJob);
const workspaceWorker = createWorker(QUEUE_NAMES.WORKSPACE, processWorkspaceJob);

emailWorker.on('completed', (job) => {
	console.log(`[Email Worker] Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
	console.error(`[Email Worker] Job ${job?.id} failed:`, err.message);
});

workspaceWorker.on('completed', (job) => {
	console.log(`[Workspace Worker] Job ${job.id} completed`);
});

workspaceWorker.on('failed', (job, err) => {
	console.error(`[Workspace Worker] Job ${job?.id} failed:`, err.message);
});

console.log('[Worker] Queue workers started');

export { emailWorker, workspaceWorker };
