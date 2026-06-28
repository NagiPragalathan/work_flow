import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { runWorkflow } from "@/lib/execute";
import type { WorkflowEdge, WorkflowNode } from "@/lib/engine/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const wf = await prisma.workflow.findFirst({ where: { id, userId: user.id } });
    if (!wf) return NextResponse.json({ detail: "Not found." }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { executionId, context } = await runWorkflow({
      workflowId: wf.id,
      nodes: wf.nodes as unknown as WorkflowNode[],
      edges: wf.edges as unknown as WorkflowEdge[],
      triggerData: body.trigger_data ?? {},
      credentials: body.credentials ?? {},
      startNodeId: body.start_node_id ?? null,
      userId: user.id,
    });

    return NextResponse.json({
      execution_id: executionId,
      status: context.status,
      execution: context.toDict(),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
