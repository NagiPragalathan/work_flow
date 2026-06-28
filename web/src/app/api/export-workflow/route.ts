import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, handleApiError } from "@/lib/session";
import { serializeExportedWorkflow } from "@/lib/serializers";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    for (const field of ["name", "nodes", "edges"]) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    const row = await prisma.exportedWorkflow.create({
      data: {
        userId: user?.id ?? null,
        name: body.name,
        description: body.description ?? "",
        version: body.version ?? "1.0.0",
        exportType: body.export_type ?? "template",
        nodes: body.nodes,
        edges: body.edges,
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
