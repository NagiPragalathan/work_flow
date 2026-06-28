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
  const components = (project?.components ?? {}) as { html?: string; workflowId?: string };
  let html = components.html;
  if (!html) {
    return new NextResponse("dApp not found", { status: 404 });
  }

  // Re-inject the linked workflow id at serve time. The id is baked into action
  // buttons (data-workflow) when the page is created, but the GrapesJS editor
  // can drop or blank that attribute when the page is published — leaving the
  // button "not linked". Storing the id on the page and re-applying it here keeps
  // the button working no matter what the editor did to the markup.
  const wf = components.workflowId;
  if (wf) {
    // A page is linked to one workflow, so point every action button at it —
    // this also heals buttons that still carry a stale/deleted id baked into the
    // saved markup (the editor can't re-inject like we do here).
    html = html
      .split("__WF__").join(wf)
      .replace(/data-workflow="[^"]*"/g, `data-workflow="${wf}"`)
      .replace(/data-workflow='[^']*'/g, `data-workflow="${wf}"`);
  }

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
