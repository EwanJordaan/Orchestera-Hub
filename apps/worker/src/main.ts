import { createJobPoller } from "./poller/jobPoller";

async function main() {
  const poller = createJobPoller();
  await poller.poll();
}

void main();
