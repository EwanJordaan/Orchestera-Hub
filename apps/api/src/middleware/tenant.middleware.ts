import type { MiddlewareHandler } from "hono";

export const tenantMiddleware: MiddlewareHandler = async (c, next) => {
  const tenantId = c.req.header("x-tenant-id");
  if (!tenantId) {
    return c.json({ error: "x-tenant-id header is required" }, 401);
  }

  c.set("tenantId", tenantId);
  await next();
};
