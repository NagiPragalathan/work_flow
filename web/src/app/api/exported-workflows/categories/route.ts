import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/session";

export async function GET() {
  try {
    const rows = await prisma.exportedWorkflow.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    const categories = rows.map((r) => r.category).filter(Boolean);
    return NextResponse.json({ categories });
  } catch (e) {
    return handleApiError(e);
  }
}
