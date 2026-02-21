import type { DbClient } from "../client";

export function createWorkflowVersionsRepo(db: DbClient) {
  return {
    async listByWorkflow(workflowId: string) {
      return db.query("select * from workflow_versions where workflow_id = ?", [workflowId]);
    }
  };
}
