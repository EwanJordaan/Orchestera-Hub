export type ApiEnv = {
  port: number;
};

export function getApiEnv(): ApiEnv {
  return {
    port: Number(process.env.PORT ?? 3000)
  };
}
