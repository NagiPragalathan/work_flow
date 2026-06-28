import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser, handleApiError } from "@/lib/session";
import { serializeExportedWorkflow } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const row = await prisma.exportedWorkflow.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    if (!row.isPublic && (!user || row.userId !== user.id)) {
      return NextResponse.json({ detail: "Not found." }, { status: 404 });
    }
    return NextResponse.json(serializeExportedWorkflow(row));
  } catch (e) {
    return handleApiError(e);
  }
}

async function update(req: NextRequest, params: Params["params"]) {
  const user = await requireUser();
  const { id } = await params;
  const existing = await prisma.exportedWorkflow.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const body = await req.json();
  const row = await prisma.exportedWorkflow.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.version !== undefined ? { version: body.version } : {}),
      ...(body.export_type !== undefined ? { exportType: body.export_type } : {}),
      ...(body.nodes !== undefined ? { nodes: body.nodes } : {}),
      ...(body.edges !== undefined ? { edges: body.edges } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.author !== undefined ? { author: body.author } : {}),
      ...(body.is_public !== undefined ? { isPublic: body.is_public } : {}),
      ...(body.is_featured !== undefined ? { isFeatured: body.is_featured } : {}),
    },
  });
  return NextResponse.json(serializeExportedWorkflow(row));
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
    const existing = await prisma.exportedWorkflow.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    await prisma.exportedWorkflow.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
