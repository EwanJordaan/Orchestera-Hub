import type { DbClient } from "../client";

export function createRunsRepo(db: DbClient) {
  return {
    async listByWorkflowVersion(workflowVersionId: string) {
      return db.query("select * from runs where workflow_version_id = ?", [workflowVersionId]);
    }
  };
}
