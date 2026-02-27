import type { Context } from "hono";
import { authorizeUser } from "../scripts/auth";
import type { WorkerEnv } from "../config/env";

export async function postWorkspace(c: Context<WorkerEnv>) {
    const id = c.req.param("id");

    const authResult = await authorizeUser(c);
    if (!authResult.authorized) {
        return c.json({ error: authResult.error }, 401);
    }

    return c.json({ id, message: "workspace created" });
}
