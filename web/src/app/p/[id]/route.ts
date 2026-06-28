import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public live dApp page. Serves the stored HTML verbatim (scripts intact) so
 * the page's action buttons actually run their linked workflow. Bypasses the
 * GrapesJS canvas (which sandboxes scripts).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.uIBuilderProject.findUnique({ where: { id } });
  const components = (project?.components ?? {}) as { html?: string };
  const html = components.html;
  if (!html) {
    return new NextResponse("dApp not found", { status: 404 });
  }
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
