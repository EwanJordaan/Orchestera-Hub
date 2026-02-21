import { serve } from "@hono/node-server";

import { getApiEnv } from "./config/env";
import { createApp } from "./app";

const env = getApiEnv();
const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.port
  },
  (info: { port: number }) => {
    console.log(`api listening on http://localhost:${info.port}`);
  }
);
