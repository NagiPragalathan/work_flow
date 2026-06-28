import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";

/**
 * PageBuilder "pages" are stored as UIBuilderProject rows; the full page
 * payload lives in the `components` JSON column.
 */
function toPage(p: { id: string; components: unknown; createdAt: Date; updatedAt: Date }) {
  const data = (p.components as Record<string, unknown>) ?? {};
  return { ...data, id: p.id, createdAt: p.createdAt, updatedAt: p.updatedAt };
}

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await prisma.uIBuilderProject.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(rows.map(toPage));
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const row = await prisma.uIBuilderProject.create({
      data: {
        userId: user.id,
        projectName: body.name ?? body.title ?? "Untitled Page",
        description: body.description ?? "",
        components: body,
      },
    });
    return NextResponse.json(toPage(row), { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
