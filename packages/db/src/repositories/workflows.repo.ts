import type { DbClient } from "../client";

export function createWorkflowsRepo(db: DbClient) {
  return {
    async listByTenant(tenantId: string) {
      return db.query("select * from workflows where tenant_id = ?", [tenantId]);
    }
  };
}
