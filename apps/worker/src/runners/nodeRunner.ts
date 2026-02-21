import { createLeaseManager } from "../leases/leaseManager";

export function createNodeRunner() {
  const leases = createLeaseManager();

  return {
    async run(nodeId: string) {
      const lease = await leases.acquire(nodeId);
      if (!lease.acquired) {
        return;
      }

      console.log(`running node: ${nodeId}`);
      await leases.release(nodeId);
    }
  };
}
