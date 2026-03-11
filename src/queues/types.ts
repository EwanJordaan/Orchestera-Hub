export interface EmailJobData {
	type: 'welcome' | 'reset-password' | 'notification';
	to: string;
	subject: string;
	metadata?: Record<string, unknown>;
}

export interface WorkspaceJobData {
	workspaceId: string;
	tenantId: string;
	action: 'create' | 'update' | 'delete' | 'provision';
	payload?: Record<string, unknown>;
}

export interface JobData {
	email?: EmailJobData;
	workspace?: WorkspaceJobData;
}

export interface JobResult {
	success: boolean;
	message?: string;
	data?: unknown;
}
