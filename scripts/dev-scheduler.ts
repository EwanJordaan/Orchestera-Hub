import { spawn } from "node:child_process";

spawn("npm", ["run", "dev", "--workspace", "@orchestra/scheduler"], {
  stdio: "inherit",
  shell: true
});
