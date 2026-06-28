import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/session";
import { runWorkflow } from "@/lib/execute";
import type { WorkflowEdge, WorkflowNode } from "@/lib/engine/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const workflowId: string | undefined = body.workflow_id;
    const message: string = body.message ?? "";
    const user: string = body.user ?? "anonymous";
    const channel: string = body.channel ?? "";
    // Extra form/input fields collected from the page UI.
    const inputs: Record<string, unknown> =
      body.inputs && typeof body.inputs === "object" ? body.inputs : {};

    if (!workflowId) {
      return NextResponse.json({ error: "workflow_id is required" }, { status: 400 });
    }

    const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) return NextResponse.json({ detail: "Not found." }, { status: 404 });

    const nodes = wf.nodes as unknown as WorkflowNode[];

    const { executionId, context } = await runWorkflow({
      workflowId: wf.id,
      nodes,
      edges: wf.edges as unknown as WorkflowEdge[],
      triggerData: { message, user, channel, timestamp: "", ...inputs },
      credentials: {},
      userId: wf.userId,
    });

    return NextResponse.json({
      execution_id: executionId,
      status: context.status,
      chat_response: context.chatResponse,
      execution: context.toDict(),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
