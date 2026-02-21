import test from "node:test";
import assert from "node:assert/strict";

import { validateDag } from "../src/workflow/validateDag";

test("validateDag accepts an acyclic workflow", () => {
  const result = validateDag({
    nodes: [
      {
        key: "start",
        type: "noop",
        timeoutMs: 1000,
        retryPolicy: {
          maxAttempts: 1,
          backoffMs: 0,
          multiplier: 1,
          jitter: false
        },
        config: {}
      }
    ],
    edges: []
  });

  assert.equal(result.valid, true);
});
