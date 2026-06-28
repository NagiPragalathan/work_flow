import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { executionEngine } from "@/lib/engine/engine";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Live execution still in memory?
    const live = executionEngine.getExecution(id);
    if (live) return NextResponse.json(live.toDict());

    const execution = await prisma.workflowExecution.findFirst({
      where: { id, workflow: { userId: user.id } },
    });
    if (!execution) return NextResponse.json({ detail: "Not found." }, { status: 404 });

    return NextResponse.json({
      execution_id: execution.id,
      status: execution.status,
      started_at: execution.startedAt.toISOString(),
      finished_at: execution.finishedAt ? execution.finishedAt.toISOString() : null,
      execution_order: execution.executionOrder,
      node_states: execution.nodeStates,
      errors: execution.errors,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
