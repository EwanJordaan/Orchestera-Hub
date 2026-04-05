CREATE SCHEMA IF NOT EXISTS "app";
CREATE SCHEMA IF NOT EXISTS "audit";

CREATE TABLE "app"."api_keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key_hash" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit"."events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"type" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."jwt_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jwt_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "app"."memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "memberships_tenant_id_user_id_unique" UNIQUE("tenant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "app"."schedules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"cron" text NOT NULL,
	"next_run_at" timestamp with time zone,
	"paused" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."task_attempts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"task_run_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"logs" text,
	"error" jsonb
);
--> statement-breakpoint
CREATE TABLE "app"."task_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_run_id" uuid NOT NULL,
	"node_key" text NOT NULL,
	"status" text NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"ready_at" timestamp with time zone,
	"lease_owner" text,
	"lease_expires_at" timestamp with time zone,
	"output" jsonb,
	"error" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."tenants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "app"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"email" text NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "app"."worker_leases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"task_run_id" uuid NOT NULL,
	"worker_id" uuid NOT NULL,
	"lease_expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."workers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"name" text,
	"last_heartbeat" timestamp with time zone,
	"status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."workflow_edges" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_version_id" uuid NOT NULL,
	"from_node" text NOT NULL,
	"to_node" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."workflow_nodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_version_id" uuid NOT NULL,
	"node_key" text NOT NULL,
	"type" text NOT NULL,
	"config" jsonb NOT NULL,
	"retry_policy" jsonb,
	"timeout_seconds" integer,
	CONSTRAINT "workflow_nodes_workflow_version_id_node_key_unique" UNIQUE("workflow_version_id","node_key")
);
--> statement-breakpoint
CREATE TABLE "app"."workflow_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_version_id" uuid NOT NULL,
	"status" text NOT NULL,
	"input" jsonb,
	"context" jsonb,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"trigger_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."workflow_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"dag" jsonb NOT NULL,
	"input_schema" jsonb,
	"status" text NOT NULL,
	"checksum" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_versions_workflow_id_version_unique" UNIQUE("workflow_id","version")
);
--> statement-breakpoint
CREATE TABLE "app"."workflows" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"active_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflows_tenant_id_slug_unique" UNIQUE("tenant_id","slug")
);
--> statement-breakpoint
ALTER TABLE "app"."jwt_tokens" ADD CONSTRAINT "jwt_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."jwt_tokens" ADD CONSTRAINT "jwt_tokens_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."memberships" ADD CONSTRAINT "memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "app"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."workflow_versions" ADD CONSTRAINT "workflow_versions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "app"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."workflows" ADD CONSTRAINT "workflows_active_version_id_workflow_versions_id_fk" FOREIGN KEY ("active_version_id") REFERENCES "app"."workflow_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_tenant_time" ON "audit"."events" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_jwt_tokens" ON "app"."jwt_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_schedules_next_run" ON "app"."schedules" USING btree ("next_run_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_ready" ON "app"."task_runs" USING btree ("status","ready_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_run" ON "app"."task_runs" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "idx_runs_tenant_created" ON "app"."workflow_runs" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_runs_status" ON "app"."workflow_runs" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "idx_workflows_tenant" ON "app"."workflows" USING btree ("tenant_id");