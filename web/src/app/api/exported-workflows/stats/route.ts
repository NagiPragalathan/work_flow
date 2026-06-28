import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/session";

export async function GET() {
  try {
    const total = await prisma.exportedWorkflow.count();
    const agg = await prisma.exportedWorkflow.aggregate({
      _sum: { downloadCount: true, importCount: true },
    });
    return NextResponse.json({
      total_exported: total,
      total_downloads: agg._sum.downloadCount ?? 0,
      total_imports: agg._sum.importCount ?? 0,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
