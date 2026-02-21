import { spawn } from "node:child_process";

spawn("npm", ["run", "dev", "--workspace", "@orchestra/worker"], {
  stdio: "inherit",
  shell: true
});
