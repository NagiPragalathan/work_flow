import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeUIProject } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const src = await prisma.uIBuilderProject.findFirst({ where: { id, userId: user.id } });
    if (!src) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    const copy = await prisma.uIBuilderProject.create({
      data: {
        userId: user.id,
        projectName: `${src.projectName} (Copy)`,
        description: src.description,
        components: src.components as object,
        styles: src.styles as object,
        assets: src.assets as object,
        isActive: src.isActive,
      },
    });
    return NextResponse.json(serializeUIProject(copy), { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
