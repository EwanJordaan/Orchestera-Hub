import { spawn } from "node:child_process";

spawn("npm", ["run", "dev", "--workspace", "@orchestra/api"], {
  stdio: "inherit",
  shell: true
});
