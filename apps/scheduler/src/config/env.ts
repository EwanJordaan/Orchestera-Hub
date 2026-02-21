export type SchedulerEnv = {
  tickIntervalMs: number;
};

export function getSchedulerEnv(): SchedulerEnv {
  return {
    tickIntervalMs: Number(process.env.SCHEDULER_TICK_INTERVAL_MS ?? 1000)
  };
}
