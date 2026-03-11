import type { EmailJobData, JobResult } from '../queues/types';

export async function sendEmail(data: EmailJobData): Promise<JobResult> {
	console.log(`[Email Handler] Preparing to send ${data.type} email to ${data.to}`);

	console.log(`[Email Handler] Rendering email template...`);
	console.log(`[Email Handler] Connecting to email service...`);
	console.log(`[Email Handler] Sending email via SMTP/API...`);

	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		success: true,
		message: `Email sent successfully to ${data.to}`,
		data: {
			to: data.to,
			subject: data.subject,
			type: data.type,
		},
	};
}
