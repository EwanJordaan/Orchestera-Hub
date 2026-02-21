import { z } from "zod";

type workflow = {
    nodes: Array<{
        key: string;
        type: "http" | "command" | "noop";
        config: unknown;
        timeoutMs?: number;
        retryPolicy?: {
            maxAttempts: number;
            backoffMs: number;
            multiplier: number;
            jitter: boolean;
        };
    }>;
    edges: Array<{ from: string; to: string }>;
};


type RetryPolicy = {
    maxAttempts: number;
    backoffMs: number;
    multiplier: number;
    jitter: boolean;
}

type BaseNode = {
    key: string;
    timeoutMs: number;
    retryPolicy: RetryPolicy;
}

type HttpNode = BaseNode & {
    type: "http";
    config: {
        command: string;
        args: string;

    }
}
