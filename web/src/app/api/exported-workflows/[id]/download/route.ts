import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/session";
import { serializeExportedWorkflow } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const row = await prisma.exportedWorkflow.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    return NextResponse.json(serializeExportedWorkflow(row));
  } catch (e) {
    return handleApiError(e);
  }
}
