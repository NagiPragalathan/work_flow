import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeUIProject, paginated } from "@/lib/serializers";

export async function GET() {
  try {
    const user = await requireUser();
    const projects = await prisma.uIBuilderProject.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(paginated(projects.map(serializeUIProject)));
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const project = await prisma.uIBuilderProject.create({
      data: {
        userId: user.id,
        projectName: body.project_name ?? body.projectName ?? "Untitled Project",
        description: body.description ?? "",
        components: body.components ?? {},
        styles: body.styles ?? {},
        assets: body.assets ?? [],
        isActive: body.is_active ?? true,
      },
    });
    return NextResponse.json(serializeUIProject(project), { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
