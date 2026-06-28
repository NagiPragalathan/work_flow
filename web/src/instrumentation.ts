/**
 * Next.js startup hook. Boots the in-process cron scheduler once, on the
 * Node.js server runtime only.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/scheduler");
    startScheduler();
  }
}
