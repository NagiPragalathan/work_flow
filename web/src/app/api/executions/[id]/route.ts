import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeExecution } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const execution = await prisma.workflowExecution.findFirst({
      where: { id, workflow: { userId: user.id } },
    });
    if (!execution) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    return NextResponse.json(serializeExecution(execution));
  } catch (e) {
    return handleApiError(e);
  }
}
