import type { Hono } from "hono";

import { getHealth } from "../controllers/health.controller";
import { postWorkspace } from "../controllers/workspace.controller";
import type { WorkerEnv } from "../config/env";

export function registerRoutes(app: Hono<WorkerEnv>) {
    app.get("/", (c) => c.json({ service: "api", status: "ok" }));
    app.get("/health", getHealth);
    app.post("/api/:id/workspace", postWorkspace)
}
