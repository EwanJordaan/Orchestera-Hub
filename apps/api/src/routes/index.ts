import type { Hono } from "hono";

import { getHealth } from "../controllers/health.controller";
import { tenantMiddleware } from "../middleware/tenant.middleware";

export function registerRoutes(app: Hono) {
  app.get("/", (c) => c.json({ service: "api", status: "ok" }));
  app.get("/health", getHealth);
  app.use("/v1/*", tenantMiddleware);
}
