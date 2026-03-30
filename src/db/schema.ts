import { query } from "./connection";

export const createAccessTables = async () => {
    await query(`CREATE TABLE IF NOT EXISTS app.tenants (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app.users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app.memberships (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL REFERENCES app.tenants(id),
        user_id UUID NOT NULL REFERENCES app.users(id),
        role TEXT NOT NULL, -- admin, editor, operator, viewer
        UNIQUE (tenant_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS app.api_keys (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        key_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);
};

export const createWorkflowTables = async () => {
    await query(`CREATE TABLE IF NOT EXISTS app.workflows (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        active_version_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (tenant_id, slug)
    );
    CREATE TABLE IF NOT EXISTS app.workflow_versions (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        workflow_id UUID NOT NULL REFERENCES app.workflows(id),
        version INT NOT NULL,
        dag JSONB NOT NULL,
        input_schema JSONB,
        status TEXT NOT NULL, -- draft, published, archived
        checksum TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (workflow_id, version)
    );
    CREATE TABLE IF NOT EXISTS app.workflow_nodes (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        workflow_version_id UUID NOT NULL,
        node_key TEXT NOT NULL,
        type TEXT NOT NULL,
        config JSONB NOT NULL,
        retry_policy JSONB,
        timeout_seconds INT,
        UNIQUE (workflow_version_id, node_key)
    );
    CREATE TABLE IF NOT EXISTS app.workflow_edges (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        workflow_version_id UUID NOT NULL,
        from_node TEXT NOT NULL,
        to_node TEXT NOT NULL
    );`);
}

export const createExecutionTables = async () => {
    await query(`CREATE TABLE IF NOT EXISTS app.workflow_runs (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        workflow_version_id UUID NOT NULL,
        status TEXT NOT NULL, -- queued, running, succeeded, failed, cancelled
        input JSONB,
        context JSONB,
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        trigger_type TEXT, -- manual, schedule, api
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app.task_runs (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        workflow_run_id UUID NOT NULL,
        node_key TEXT NOT NULL,
        status TEXT NOT NULL,
        attempt_count INT NOT NULL DEFAULT 0,
        ready_at TIMESTAMPTZ,
        lease_owner TEXT,
        lease_expires_at TIMESTAMPTZ,
        output JSONB,
        error JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app.task_attempts (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        task_run_id UUID NOT NULL,
        attempt_number INT NOT NULL,
        status TEXT NOT NULL,
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        logs TEXT,
        error JSONB
    );`);
}

export const createScheduleTables = async () => {
    await query(`CREATE TABLE IF NOT EXISTS app.schedules (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        workflow_id UUID NOT NULL,
        cron TEXT NOT NULL,
        next_run_at TIMESTAMPTZ,
        paused BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);
}

export const createWorkerTables = async () => {
    await query(`CREATE TABLE IF NOT EXISTS app.workers (
        id UUID PRIMARY KEY,
        tenant_id UUID,
        name TEXT,
        last_heartbeat TIMESTAMPTZ,
        status TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app.worker_leases (
        id UUID PRIMARY KEY,
        task_run_id UUID NOT NULL,
        worker_id UUID NOT NULL,
        lease_expires_at TIMESTAMPTZ NOT NULL
    );`);
}

export const createAuditTables = async () => {
    await query(`CREATE TABLE IF NOT EXISTS audit.events (
        id UUID PRIMARY KEY,
        tenant_id UUID,
        type TEXT NOT NULL,
        entity_type TEXT,
        entity_id UUID,
        payload JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);
}

export const createIndexes = async () => {
    await query(`CREATE INDEX IF NOT EXISTS idx_name ON table (columns);

        -- workflows
        CREATE INDEX idx_workflows_tenant ON app.workflows (tenant_id);

        -- workflow runs
        CREATE INDEX idx_runs_tenant_created ON app.workflow_runs (tenant_id, created_at DESC);
        CREATE INDEX idx_runs_status ON app.workflow_runs (tenant_id, status);

        -- task runs
        CREATE INDEX idx_tasks_ready ON app.task_runs (status, ready_at);
        CREATE INDEX idx_tasks_run ON app.task_runs (workflow_run_id);

        -- schedules
        CREATE INDEX idx_schedules_next_run ON app.schedules (next_run_at);

        -- audit
        CREATE INDEX idx_audit_tenant_time ON audit.events (tenant_id, created_at DESC);`
    );
};