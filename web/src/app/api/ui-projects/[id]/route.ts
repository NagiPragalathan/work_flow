import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeUIProject } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const p = await prisma.uIBuilderProject.findFirst({ where: { id, userId: user.id } });
    if (!p) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    return NextResponse.json(serializeUIProject(p));
  } catch (e) {
    return handleApiError(e);
  }
}

async function update(req: NextRequest, params: Params["params"]) {
  const user = await requireUser();
  const { id } = await params;
  const existing = await prisma.uIBuilderProject.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const body = await req.json();
  const p = await prisma.uIBuilderProject.update({
    where: { id },
    data: {
      ...(body.project_name !== undefined || body.projectName !== undefined
        ? { projectName: body.project_name ?? body.projectName }
        : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.components !== undefined ? { components: body.components } : {}),
      ...(body.styles !== undefined ? { styles: body.styles } : {}),
      ...(body.assets !== undefined ? { assets: body.assets } : {}),
      ...(body.is_active !== undefined ? { isActive: body.is_active } : {}),
    },
  });
  return NextResponse.json(serializeUIProject(p));
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
    const existing = await prisma.uIBuilderProject.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    await prisma.uIBuilderProject.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
