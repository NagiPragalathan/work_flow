import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeExecution } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const wf = await prisma.workflow.findFirst({ where: { id, userId: user.id } });
    if (!wf) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: id },
      orderBy: { startedAt: "desc" },
    });
    return NextResponse.json(executions.map(serializeExecution));
  } catch (e) {
    return handleApiError(e);
  }
}
