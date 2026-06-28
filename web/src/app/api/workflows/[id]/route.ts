import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeWorkflow } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

async function getOwned(userId: string, id: string) {
  const wf = await prisma.workflow.findFirst({ where: { id, userId } });
  return wf;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const wf = await getOwned(user.id, id);
    if (!wf) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    return NextResponse.json(serializeWorkflow(wf));
  } catch (e) {
    return handleApiError(e);
  }
}

async function update(req: NextRequest, params: Params["params"]) {
  const user = await requireUser();
  const { id } = await params;
  const existing = await getOwned(user.id, id);
  if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const body = await req.json();
  const wf = await prisma.workflow.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.nodes !== undefined ? { nodes: body.nodes } : {}),
      ...(body.edges !== undefined ? { edges: body.edges } : {}),
      ...(body.is_active !== undefined ? { isActive: body.is_active } : {}),
      ...(body.schedule !== undefined ? { schedule: body.schedule || null } : {}),
      ...(body.schedule_enabled !== undefined ? { scheduleEnabled: body.schedule_enabled } : {}),
    },
  });
  return NextResponse.json(serializeWorkflow(wf));
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    return await update(req, params);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    return await update(req, params);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await getOwned(user.id, id);
    if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    await prisma.workflow.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
