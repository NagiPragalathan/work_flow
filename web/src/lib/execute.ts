/** Shared helper to run a workflow and persist a WorkflowExecution row. */
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { executionEngine } from "@/lib/engine/engine";
import type { WorkflowEdge, WorkflowNode } from "@/lib/engine/types";

interface RunArgs {
  workflowId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggerData?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  startNodeId?: string | null;
  userId?: string | null;
}

export async function runWorkflow(args: RunArgs) {
  const executionId = randomUUID();
  const credentials = { ...(args.credentials ?? {}), user_id: args.userId ?? null };

  const context = await executionEngine.executeWorkflow({
    workflowId: args.workflowId,
    executionId,
    nodes: args.nodes,
    edges: args.edges,
    triggerData: args.triggerData ?? {},
    credentials,
    startNodeId: args.startNodeId ?? null,
  });

  await prisma.workflowExecution.create({
    data: {
      id: executionId,
      workflowId: args.workflowId,
      status: context.status,
      startedAt: context.startTime,
      finishedAt: context.endTime,
      executionOrder: context.executionOrder,
      nodeStates: context.nodeStates as object,
      errors: context.errors,
      triggerData: (args.triggerData ?? {}) as object,
    },
  });

  return { executionId, context };
}
