import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, handleApiError } from "@/lib/session";
import { serializeExportedWorkflow } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

// Singular GET endpoint matching the old /exported-workflow/<uuid>/ route.
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const row = await prisma.exportedWorkflow.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    if (!row.isPublic && (!user || row.userId !== user.id)) {
      return NextResponse.json(
        { error: "You do not have permission to access this workflow" },
        { status: 403 }
      );
    }
    return NextResponse.json(serializeExportedWorkflow(row));
  } catch (e) {
    return handleApiError(e);
  }
}
