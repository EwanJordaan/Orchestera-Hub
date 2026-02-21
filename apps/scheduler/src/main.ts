import { createTickLoop } from "./tick/tickLoop";

async function main() {
  const loop = createTickLoop();
  await loop.tick();
}

void main();
