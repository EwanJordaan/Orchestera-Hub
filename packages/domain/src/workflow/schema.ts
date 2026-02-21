import { z } from "zod";

const retryPolicySchema = z.object({
  maxAttempts: z.number().int().positive(),
  backoffMs: z.number().int().nonnegative(),
  multiplier: z.number().positive(),
  jitter: z.boolean()
});

const baseNodeSchema = z.object({
  key: z.string().min(1),
  timeoutMs: z.number().int().positive(),
  retryPolicy: retryPolicySchema
});

const httpNodeSchema = baseNodeSchema.extend({
  type: z.literal("http"),
  config: z.object({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    url: z.string().url()
  })
});

const commandNodeSchema = baseNodeSchema.extend({
  type: z.literal("command"),
  config: z.object({
    command: z.string().min(1),
    args: z.array(z.string())
  })
});

const noopNodeSchema = baseNodeSchema.extend({
  type: z.literal("noop"),
  config: z.object({})
});

export const workflowNodeSchema = z.discriminatedUnion("type", [
  httpNodeSchema,
  commandNodeSchema,
  noopNodeSchema
]);

export const workflowDagSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(
    z.object({
      from: z.string().min(1),
      to: z.string().min(1)
    })
  )
});
