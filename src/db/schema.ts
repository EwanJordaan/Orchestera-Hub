import {
    boolean,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
    unique,
    type AnyPgColumn,
} from "drizzle-orm/pg-core";

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const tenants = pgTable("tenants", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    created_at: timestamptz("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    email: text("email").unique().notNull(),
    password_hash: text("password_hash").notNull(),
    role: text("role"),
    updated_at: timestamptz("updated_at"),
    created_at: timestamptz("created_at").notNull().defaultNow(),
});

export const memberships = pgTable(
    "memberships",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull().references(() => tenants.id),
        user_id: uuid("user_id").notNull().references(() => users.id),
        role: text("role").notNull(),
    },
    (table) => [
        unique("memberships_tenant_id_user_id_unique").on(table.tenant_id, table.user_id),
    ],
);

export const api_keys = pgTable("api_keys", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").notNull(),
    key_hash: text("key_hash").notNull(),
    name: text("name"),
    created_at: timestamptz("created_at").notNull().defaultNow(),
    expires_at: timestamptz("expires_at"),
});

export const workflows = pgTable(
    "workflows",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull().references(() => tenants.id),
        name: text("name").notNull(),
        description: text("description"),
        is_active: boolean("is_active"),
        active_version_id: uuid("active_version_id").references((): AnyPgColumn => workflow_versions.id),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        unique("workflows_tenant_id_name_unique").on(table.tenant_id, table.name),
        index("idx_workflows_tenant").on(table.tenant_id),
    ],
);

export const workflow_versions = pgTable(
    "workflow_versions",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull().references(() => tenants.id),
        workflow_id: uuid("workflow_id").notNull().references(() => workflows.id),
        version: integer("version").notNull(),
        definition_json: jsonb("definition_json").notNull(),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        unique("workflow_versions_workflow_id_version_unique").on(table.workflow_id, table.version),
    ],
);

export const tasks = pgTable(
    "tasks",
    {
        id: uuid("id").primaryKey(),
        workflow_version_id: uuid("workflow_version_id").notNull().references(() => workflow_versions.id),
        name: text("name").notNull(),
        type: text("type").notNull(),
        config: jsonb("config").notNull(),
        retry_policy: jsonb("retry_policy"),
        timeout_seconds: integer("timeout_seconds"),
    },
    (table) => [
        unique("tasks_workflow_version_id_name_unique").on(table.workflow_version_id, table.name),
    ],
);

export const task_dependencies = pgTable("task_dependencies", {
    id: uuid("id").primaryKey(),
    workflow_version_id: uuid("workflow_version_id").notNull().references(() => workflow_versions.id),
    parent_task_id: uuid("parent_task_id").notNull().references(() => tasks.id),
    child_task_id: uuid("child_task_id").notNull().references(() => tasks.id),
});

export const workflow_runs = pgTable(
    "workflow_runs",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull().references(() => tenants.id),
        workflow_id: uuid("workflow_id").notNull().references(() => workflows.id),
        workflow_version_id: uuid("workflow_version_id").notNull().references(() => workflow_versions.id),
        status: text("status", { enum: ["pending", "running", "completed", "failed"] }).notNull(),
        triggered_by: text("triggered_by", { enum: ["user", "system", "schedule"] }),
        started_at: timestamptz("started_at"),
        finished_at: timestamptz("finished_at"),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        index("idx_runs_tenant_created").on(table.tenant_id, table.created_at),
        index("idx_runs_status").on(table.tenant_id, table.status),
    ],
);

export const task_runs = pgTable(
    "task_runs",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull().references(() => tenants.id),
        workflow_run_id: uuid("workflow_run_id").references(() => workflow_runs.id),
        task_id: uuid("task_id").references(() => tasks.id),
        status: text("status").notNull(),
        attempt_count: integer("attempt_count").notNull().default(0),
        ready_at: timestamptz("ready_at"),
        output: jsonb("output"),
        error: jsonb("error"),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        index("idx_tasks_ready").on(table.status, table.ready_at),
        index("idx_tasks_run").on(table.workflow_run_id),
    ],
);

/*
export const task_run_dependencies = pgTable("task_run_dependencies", {
    id: uuid("id").primaryKey(),
    task_run_id: uuid("task_run_id").references(() => task_runs.id),
    depends_on_task_run_id: uuid("depends_on_task_run_id").references(() => task_runs.id),
});
*/

export const job_queue = pgTable(
    "job_queue",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").references(() => tenants.id),
        task_run_id: uuid("task_run_id").references(() => task_runs.id),
        status: text("status", { enum: ["queued", "claimed", "done", "failed"] }).notNull(),
        priority: text("priority"),
        scheduled_at: timestamptz("scheduled_at").notNull(),
        available_at: timestamptz("available_at"),
        created_at: timestamptz("created_at").defaultNow(),
    },
);

/*
export const scheduled_jobs = pgTable("scheduled_jobs", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    workflow_id: uuid("workflow_id").references(() => workflows.id),
    cron_expression: text("cron_expression").notNull(),
    next_run_at: timestamptz("next_run_at"),
    is_active: boolean("is_active").default(false),
    created_at: timestamptz("created_at").defaultNow(),
});

export const job_locks = pgTable("job_locks", {
    id: uuid("id").primaryKey(),
    resource_key: text("resource_key"),
    locked_by: text("locked_by"),
    expires_at: timestamptz("expires_at"),
    created_at: timestamptz("created_at").defaultNow(),
});

export const retry_policies = pgTable("retry_policies", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    max_retries: integer("max_retries").notNull(),
    backoff_strategy: text("backoff_strategy", { enum: ["fixed", "exponential"] }).default("fixed"),
    delay_seconds: integer("delay_seconds").notNull(),
});

export const task_run_attempts = pgTable("task_run_attempts", {
    id: uuid("id").primaryKey(),
    task_run_id: uuid("task_run_id").references(() => task_runs.id),
    attempt_number: integer("attempt_number").default(1),
    started_at: timestamptz("started_at"),
    completed_at: timestamptz("completed_at").defaultNow(),
    status: text("status"),
    error_message: text("error_message"),
});

export const dead_letter_queue = pgTable("dead_letter_queue", {
    id: uuid("id").primaryKey(),
    task_run_id: uuid("task_run_id").references(() => task_runs.id),
    reason: text("reason"),
    payload: jsonb("payload"),
    created_at: timestamptz("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    workflow_run_id: uuid("workflow_run_id").references(() => workflow_runs.id),
    task_run_id: uuid("task_run_id").references(() => task_runs.id),
    level: text("level", { enum: ["info", "error", "debug"] }).default("info"),
    message: text("message"),
    metadata_json: jsonb("metadata_json"),
    created_at: timestamptz("created_at").defaultNow(),
});

export const metrics = pgTable("metrics", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    workflow_run_id: uuid("workflow_run_id").references(() => workflow_runs.id),
    task_run_id: uuid("task_run_id").references(() => task_runs.id),
    metric_name: text("metric_name").notNull(),
    metric_value: integer("metric_value"),
    recorded_at: timestamptz("recorded_at").defaultNow(),
});

export const workers = pgTable("workers", {
    id: uuid("id").primaryKey(),
    name: text("name"),
    status: text("status"),
    last_heartbeat: timestamptz("last_heartbeat"),
    capabilities: jsonb("capabilities"),
    created_at: timestamptz("created_at").notNull().defaultNow(),
});

export const worker_heartbeats = pgTable("worker_heartbeats", {
    id: uuid("id").primaryKey(),
    worker_id: uuid("worker_id").references(() => workers.id),
    heartbeat_at: timestamptz("heartbeat_at").defaultNow(),
});

export const roles = pgTable("roles", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    name: text("name").notNull(),
});

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
});

export const role_permissions = pgTable("role_permissions", {
    roles_id: uuid("roles_id").references(() => roles.id),
    permissions_id: uuid("permissions_id").references(() => permissions.id),
});

export const user_roles = pgTable("user_roles", {
    user_id: uuid("user_id").references(() => users.id),
    role_id: uuid("role_id").references(() => roles.id),
});

export const artifacts = pgTable("artifacts", {
    id: uuid("id").primaryKey(),
    task_run_id: uuid("task_run_id").references(() => task_runs.id),
    storage_url: text("storage_url"),
    metadata_json: jsonb("metadata_json"),
});

export const secrets = pgTable("secrets", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    name: text("name").notNull(),
    encrypted_value: text("encrypted_value").notNull(),
    created_at: timestamptz("created_at").defaultNow(),
});

export const event_triggers = pgTable("event_triggers", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    event_type: text("event_type"),
    config_json: jsonb("config_json"),
});
*/
