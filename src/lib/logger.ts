// Structured logger — JSON lines in production (Vercel logs), human-readable in dev.

const IS_DEV = process.env.NODE_ENV === "development";

type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, label: string, data?: unknown) {
  const ts = new Date().toISOString();
  if (IS_DEV) {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`[${ts}] ${level.toUpperCase()} [${label}]`, data ?? "");
  } else {
    const line: Record<string, unknown> = { ts, level, label };
    if (data !== undefined) {
      line.data = data instanceof Error
        ? { message: data.message, stack: data.stack }
        : data;
    }
    console.log(JSON.stringify(line));
  }
}

export const logger = {
  info:  (label: string, data?: unknown) => emit("info",  label, data),
  warn:  (label: string, data?: unknown) => emit("warn",  label, data),
  error: (label: string, data?: unknown) => emit("error", label, data),
};
