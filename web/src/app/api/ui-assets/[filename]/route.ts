import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ filename: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { filename } = await params;
    // Prevent path traversal.
    const safe = path.basename(filename);
    const user = await getCurrentUser();
    const userId = user?.id ?? "guest";
    const abs = path.join(
      process.cwd(),
      "public",
      "uploads",
      "ui_assets",
      `user_${userId}`,
      safe
    );
    try {
      await fs.unlink(abs);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Asset deleted successfully" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: `Delete failed: ${msg}` }, { status: 500 });
  }
}
