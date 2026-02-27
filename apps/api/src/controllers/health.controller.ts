import type { Context } from "hono";
import type { WorkerEnv } from "../config/env";

export function getHealth(c: Context<WorkerEnv>) {
    return c.json({ status: "healthy", timestamp: new Date().toISOString() });
}
