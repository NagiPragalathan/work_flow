import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeExecution, paginated } from "@/lib/serializers";

export async function GET() {
  try {
    const user = await requireUser();
    const executions = await prisma.workflowExecution.findMany({
      where: { workflow: { userId: user.id } },
      orderBy: { startedAt: "desc" },
    });
    return NextResponse.json(paginated(executions.map(serializeExecution)));
  } catch (e) {
    return handleApiError(e);
  }
}
