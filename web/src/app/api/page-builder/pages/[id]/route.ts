import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";

function toPage(p: { id: string; components: unknown; createdAt: Date; updatedAt: Date }) {
  const data = (p.components as Record<string, unknown>) ?? {};
  return { ...data, id: p.id, createdAt: p.createdAt, updatedAt: p.updatedAt };
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const row = await prisma.uIBuilderProject.findFirst({ where: { id, userId: user.id } });
    if (!row) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    return NextResponse.json(toPage(row));
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await prisma.uIBuilderProject.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    const body = await req.json();
    const row = await prisma.uIBuilderProject.update({
      where: { id },
      data: {
        projectName: body.name ?? body.title ?? existing.projectName,
        components: body,
      },
    });
    return NextResponse.json(toPage(row));
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
