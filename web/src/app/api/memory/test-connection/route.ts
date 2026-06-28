import { NextRequest, NextResponse } from "next/server";

const BUILTIN = [
  "window-buffer-memory",
  "simple-memory",
  "vector-memory",
  "agent-flow-db-memory",
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const memoryType: string | undefined = body.memory_type;
  if (!memoryType) {
    return NextResponse.json({ error: "memory_type is required" }, { status: 400 });
  }
  if (BUILTIN.includes(memoryType)) {
    return NextResponse.json({ valid: true, message: `${memoryType} configuration is valid` });
  }
  return NextResponse.json({ valid: false, error: `Unknown memory type: ${memoryType}` });
}
