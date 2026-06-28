import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/session";

interface Node {
  id: string;
  data?: { type?: string };
}
interface Edge {
  source: string;
  target: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const nodes: Node[] = body.nodes ?? [];
    const edges: Edge[] = body.edges ?? [];

    const errors: string[] = [];
    const warnings: string[] = [];

    const triggerCount = nodes.filter((n) =>
      (n.data?.type ?? "").endsWith("-trigger")
    ).length;
    if (triggerCount === 0) {
      errors.push("Workflow must have at least one trigger node");
    }

    const connected = new Set<string>();
    for (const e of edges) {
      connected.add(e.source);
      connected.add(e.target);
    }
    const orphaned = nodes
      .filter((n) => !connected.has(n.id) && edges.length > 0)
      .map((n) => n.id);
    if (orphaned.length) {
      warnings.push(`Orphaned nodes detected: ${orphaned.join(", ")}`);
    }

    return NextResponse.json({ valid: errors.length === 0, errors, warnings });
  } catch (e) {
    return handleApiError(e);
  }
}
