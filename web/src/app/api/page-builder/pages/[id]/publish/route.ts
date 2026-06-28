import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const row = await prisma.uIBuilderProject.findFirst({ where: { id, userId: user.id } });
    if (!row) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    return NextResponse.json({ id: row.id, published: true, url: `/pages/${row.id}` });
  } catch (e) {
    return handleApiError(e);
  }
}
