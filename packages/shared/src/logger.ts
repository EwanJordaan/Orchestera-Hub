type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, meta?: unknown) {
  const payload = meta === undefined ? "" : ` ${JSON.stringify(meta)}`;
  console.log(`[${level}] ${message}${payload}`);
}
