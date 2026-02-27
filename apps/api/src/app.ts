import { Hono } from "hono";

import { registerRoutes } from "./routes";
import { initializeDatabase } from "./config/init";
import type { WorkerEnv } from "./config/env";

export function createApp() {
  const app = new Hono<WorkerEnv>();

  app.use("*", async (c, next) => {
    const env = c.env as WorkerEnv | undefined;
    const db = env?.DB;

    if (db) {
      await initializeDatabase(db);
    }

    return next();
  });

  registerRoutes(app);
  return app;
}
