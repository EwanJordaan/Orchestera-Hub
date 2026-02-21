import type { WorkflowDag } from "./types";

export function validateDag(dag: WorkflowDag) {
  const nodeKeys = new Set(dag.nodes.map((node) => node.key));

  for (const edge of dag.edges) {
    if (!nodeKeys.has(edge.from) || !nodeKeys.has(edge.to)) {
      return { valid: false, reason: "edge references unknown node" } as const;
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const graph = new Map<string, string[]>();

  for (const key of nodeKeys) {
    graph.set(key, []);
  }
  for (const edge of dag.edges) {
    graph.get(edge.from)?.push(edge.to);
  }

  function hasCycle(node: string): boolean {
    if (visiting.has(node)) {
      return true;
    }
    if (visited.has(node)) {
      return false;
    }

    visiting.add(node);
    for (const next of graph.get(node) ?? []) {
      if (hasCycle(next)) {
        return true;
      }
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  }

  for (const key of nodeKeys) {
    if (hasCycle(key)) {
      return { valid: false, reason: "workflow contains cycle" } as const;
    }
  }

  return { valid: true } as const;
}
