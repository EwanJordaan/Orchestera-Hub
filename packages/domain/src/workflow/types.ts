export type RetryPolicy = {
  maxAttempts: number;
  backoffMs: number;
  multiplier: number;
  jitter: boolean;
};

export type BaseNode = {
  key: string;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
};

export type HttpNode = BaseNode & {
  type: "http";
  config: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
  };
};

export type CommandNode = BaseNode & {
  type: "command";
  config: {
    command: string;
    args: string[];
  };
};

export type NoopNode = BaseNode & {
  type: "noop";
  config: Record<string, never>;
};

export type WorkflowNode = HttpNode | CommandNode | NoopNode;

export type WorkflowDag = {
  nodes: WorkflowNode[];
  edges: Array<{ from: string; to: string }>;
};
