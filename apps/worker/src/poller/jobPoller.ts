import { createNodeRunner } from "../runners/nodeRunner";

export function createJobPoller() {
  const runner = createNodeRunner();

  return {
    async poll() {
      await runner.run("bootstrap-node");
      console.log("worker poll tick");
    }
  };
}
