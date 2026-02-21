export type WorkerEnv = {
  pollIntervalMs: number;
};

export function getWorkerEnv(): WorkerEnv {
  return {
    pollIntervalMs: Number(process.env.WORKER_POLL_INTERVAL_MS ?? 1000)
  };
}
