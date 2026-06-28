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
    const nodeId: string | undefined = body.node_id;
    if (!nodeId) {
      return NextResponse.json({ error: "node_id is required" }, { status: 400 });
    }
    const nodes = wf.nodes as unknown as WorkflowNode[];
    if (!nodes.find((n) => n.id === nodeId)) {
      return NextResponse.json(
        { error: `Node ${nodeId} not found in workflow` },
        { status: 404 }
      );
    }

    const { executionId, context } = await runWorkflow({
      workflowId: wf.id,
      nodes,
      edges: wf.edges as unknown as WorkflowEdge[],
      triggerData: body.trigger_data ?? {},
      credentials: body.credentials ?? {},
      startNodeId: nodeId,
      userId: user.id,
    });

    return NextResponse.json({
      execution_id: executionId,
      node_id: nodeId,
      status: context.status,
      execution: context.toDict(),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
