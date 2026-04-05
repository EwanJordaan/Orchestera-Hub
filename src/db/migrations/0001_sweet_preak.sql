CREATE TABLE "audit"."logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"type" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"error" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_audit_logs_time" ON "audit"."logs" USING btree ("created_at");
