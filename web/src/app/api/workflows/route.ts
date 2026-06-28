import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeWorkflow, paginated } from "@/lib/serializers";

export async function GET() {
  try {
    const user = await requireUser();
    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(paginated(workflows.map(serializeWorkflow)));
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const workflow = await prisma.workflow.create({
      data: {
        userId: user.id,
        name: body.name ?? "Untitled Workflow",
        description: body.description ?? "",
        nodes: body.nodes ?? [],
        edges: body.edges ?? [],
        isActive: body.is_active ?? true,
      },
    });
    return NextResponse.json(serializeWorkflow(workflow), { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
