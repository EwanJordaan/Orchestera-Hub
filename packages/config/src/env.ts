import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

export function getEnv() {
  return envSchema.parse(process.env);
}
