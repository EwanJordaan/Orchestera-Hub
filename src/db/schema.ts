import {
    boolean,
    index,
    integer,
    jsonb,
    pgSchema,
    text,
    timestamp,
    uuid,
    unique,
    type AnyPgColumn,
} from "drizzle-orm/pg-core";

const app = pgSchema("app");
const audit = pgSchema("audit");

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const tenants = app.table("tenants", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    created_at: timestamptz("created_at").notNull().defaultNow(),
});

export const users = app.table("users", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    email: text("email").unique().notNull(),
    password_hash: text("password_hash"),
    created_at: timestamptz("created_at").notNull().defaultNow(),
});

export const memberships = app.table(
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

export const api_keys = app.table("api_keys", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").notNull(),
    key_hash: text("key_hash").notNull(),
    name: text("name"),
    created_at: timestamptz("created_at").notNull().defaultNow(),
});

export const jwt_tokens = app.table("jwt_tokens", {
    id: uuid("id").primaryKey(),
    user_id: uuid("user_id").notNull().references(() => users.id),
    tenant_id: uuid("tenant_id").references(() => tenants.id),
    token_hash: text("token_hash").unique().notNull(),
    expires_at: timestamptz("expires_at").notNull(),
    revoked_at: timestamptz("revoked_at"),
    created_at: timestamptz("created_at").notNull().defaultNow(),
}, (table) => [
    index("idx_jwt_tokens").on(table.token_hash),
]);

export const workflows = app.table(
    "workflows",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull(),
        name: text("name").notNull(),
        slug: text("slug").notNull(),
        active_version_id: uuid("active_version_id").references((): AnyPgColumn => workflow_versions.id),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        unique("workflows_tenant_id_slug_unique").on(table.tenant_id, table.slug),
        index("idx_workflows_tenant").on(table.tenant_id),
    ],
);

export const workflow_versions = app.table(
    "workflow_versions",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull(),
        workflow_id: uuid("workflow_id").notNull().references(() => workflows.id),
        version: integer("version").notNull(),
        dag: jsonb("dag").notNull(),
        input_schema: jsonb("input_schema"),
        status: text("status").notNull(),
        checksum: text("checksum"),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        unique("workflow_versions_workflow_id_version_unique").on(table.workflow_id, table.version),
    ],
);

export const workflow_nodes = app.table(
    "workflow_nodes",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull(),
        workflow_version_id: uuid("workflow_version_id").notNull(),
        node_key: text("node_key").notNull(),
        type: text("type").notNull(),
        config: jsonb("config").notNull(),
        retry_policy: jsonb("retry_policy"),
        timeout_seconds: integer("timeout_seconds"),
    },
    (table) => [
        unique("workflow_nodes_workflow_version_id_node_key_unique").on(
            table.workflow_version_id,
            table.node_key,
        ),
    ],
);

export const workflow_edges = app.table("workflow_edges", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").notNull(),
    workflow_version_id: uuid("workflow_version_id").notNull(),
    from_node: text("from_node").notNull(),
    to_node: text("to_node").notNull(),
});

export const workflow_runs = app.table(
    "workflow_runs",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull(),
        workflow_version_id: uuid("workflow_version_id").notNull(),
        status: text("status").notNull(),
        input: jsonb("input"),
        context: jsonb("context"),
        started_at: timestamptz("started_at"),
        finished_at: timestamptz("finished_at"),
        trigger_type: text("trigger_type"),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        index("idx_runs_tenant_created").on(table.tenant_id, table.created_at),
        index("idx_runs_status").on(table.tenant_id, table.status),
    ],
);

export const task_runs = app.table(
    "task_runs",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull(),
        workflow_run_id: uuid("workflow_run_id").notNull(),
        node_key: text("node_key").notNull(),
        status: text("status").notNull(),
        attempt_count: integer("attempt_count").notNull().default(0),
        ready_at: timestamptz("ready_at"),
        lease_owner: text("lease_owner"),
        lease_expires_at: timestamptz("lease_expires_at"),
        output: jsonb("output"),
        error: jsonb("error"),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        index("idx_tasks_ready").on(table.status, table.ready_at),
        index("idx_tasks_run").on(table.workflow_run_id),
    ],
);

export const task_attempts = app.table("task_attempts", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id").notNull(),
    task_run_id: uuid("task_run_id").notNull(),
    attempt_number: integer("attempt_number").notNull(),
    status: text("status").notNull(),
    started_at: timestamptz("started_at"),
    finished_at: timestamptz("finished_at"),
    logs: text("logs"),
    error: jsonb("error"),
});

export const schedules = app.table(
    "schedules",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id").notNull(),
        workflow_id: uuid("workflow_id").notNull(),
        cron: text("cron").notNull(),
        next_run_at: timestamptz("next_run_at"),
        paused: boolean("paused").notNull().default(false),
        created_at: timestamptz("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_schedules_next_run").on(table.next_run_at),
    ],
);

export const workers = app.table("workers", {
    id: uuid("id").primaryKey(),
    tenant_id: uuid("tenant_id"),
    name: text("name"),
    last_heartbeat: timestamptz("last_heartbeat"),
    status: text("status"),
    created_at: timestamptz("created_at").notNull().defaultNow(),
});

export const worker_leases = app.table("worker_leases", {
    id: uuid("id").primaryKey(),
    task_run_id: uuid("task_run_id").notNull(),
    worker_id: uuid("worker_id").notNull(),
    lease_expires_at: timestamptz("lease_expires_at").notNull(),
});

export const events = audit.table(
    "events",
    {
        id: uuid("id").primaryKey(),
        tenant_id: uuid("tenant_id"),
        type: text("type").notNull(),
        entity_type: text("entity_type"),
        entity_id: uuid("entity_id"),
        payload: jsonb("payload"),
        created_at: timestamptz("created_at").notNull().defaultNow(),
    },
    (table) => [
        index("idx_audit_tenant_time").on(table.tenant_id, table.created_at),
    ],
);
