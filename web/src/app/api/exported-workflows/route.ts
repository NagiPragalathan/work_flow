import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, handleApiError } from "@/lib/session";
import { serializeExportedWorkflow, paginated } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sp = req.nextUrl.searchParams;

    const where: Prisma.ExportedWorkflowWhereInput = {};
    const visibility: Prisma.ExportedWorkflowWhereInput[] = [{ isPublic: true }];
    if (user) visibility.push({ userId: user.id });
    where.OR = visibility;

    const exportType = sp.get("export_type");
    if (exportType) where.exportType = exportType;
    const category = sp.get("category");
    if (category) where.category = category;
    const isFeatured = sp.get("is_featured");
    if (isFeatured != null) where.isFeatured = isFeatured.toLowerCase() === "true";
    const search = sp.get("search");
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const rows = await prisma.exportedWorkflow.findMany({
      where,
      orderBy: { exportedAt: "desc" },
    });
    return NextResponse.json(paginated(rows.map(serializeExportedWorkflow)));
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const row = await prisma.exportedWorkflow.create({
      data: {
        userId: user?.id ?? null,
        name: body.name,
        description: body.description ?? "",
        version: body.version ?? "1.0.0",
        exportType: body.export_type ?? "template",
        nodes: body.nodes ?? [],
        edges: body.edges ?? [],
        tags: body.tags ?? [],
        category: body.category ?? "",
        author: body.author ?? "",
        isPublic: body.is_public ?? false,
        isFeatured: body.is_featured ?? false,
      },
    });
    return NextResponse.json(serializeExportedWorkflow(row), { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
