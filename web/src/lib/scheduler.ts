/**
 * In-process cron scheduler. Every minute it checks workflows that have a
 * cron schedule enabled and runs the ones that are due. Started once from
 * instrumentation (Node runtime only). Suitable for a single-server MVP.
 */
import { CronExpressionParser } from "cron-parser";
import { prisma } from "@/lib/prisma";
import { runWorkflow } from "@/lib/execute";
import type { WorkflowEdge, WorkflowNode } from "@/lib/engine/types";

const g = globalThis as unknown as { __schedulerStarted?: boolean };

export function startScheduler() {
  if (g.__schedulerStarted) return;
  g.__schedulerStarted = true;
  console.log("[scheduler] started (checks every 60s)");
  // First tick shortly after boot, then every minute.
  setTimeout(tick, 5_000);
  setInterval(tick, 60_000);
}

async function tick() {
  const now = new Date();
  let workflows;
  try {
    workflows = await prisma.workflow.findMany({
      where: { scheduleEnabled: true, schedule: { not: null }, isActive: true },
    });
  } catch (e) {
    console.error("[scheduler] query failed:", e);
    return;
  }

  for (const wf of workflows) {
    if (!wf.schedule) continue;
    try {
      const interval = CronExpressionParser.parse(wf.schedule, { currentDate: now });
      const prev = interval.prev().toDate(); // most recent scheduled time <= now
      const windowStart = new Date(now.getTime() - 60_000);
      const due = prev >= windowStart;
      const notYetRun = !wf.lastRunAt || wf.lastRunAt < prev;
      if (due && notYetRun) {
        await prisma.workflow.update({ where: { id: wf.id }, data: { lastRunAt: now } });
        await runWorkflow({
          workflowId: wf.id,
          nodes: wf.nodes as unknown as WorkflowNode[],
          edges: wf.edges as unknown as WorkflowEdge[],
          triggerData: { scheduled: true, timestamp: now.toISOString() },
          userId: wf.userId,
        });
        console.log(`[scheduler] ran "${wf.name}" (${wf.id})`);
      }
    } catch (e) {
      console.error(`[scheduler] error for ${wf.id}:`, e instanceof Error ? e.message : e);
    }
  }
}
