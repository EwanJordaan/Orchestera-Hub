import type { DbClient } from "../client";

export function createNodeRunsRepo(db: DbClient) {
  return {
    async listByRun(runId: string) {
      return db.query("select * from node_runs where run_id = ?", [runId]);
    }
  };
}
