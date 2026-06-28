import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id ?? "guest";
    const relDir = path.posix.join("uploads", "ui_assets", `user_${userId}`);
    const absDir = path.join(process.cwd(), "public", relDir);

    let files: string[] = [];
    try {
      files = await fs.readdir(absDir);
    } catch {
      files = [];
    }

    const assets = await Promise.all(
      files.map(async (filename) => {
        const stat = await fs.stat(path.join(absDir, filename));
        return {
          filename,
          url: `/${relDir}/${filename}`,
          path: `/${relDir}/${filename}`,
          size: stat.size,
        };
      })
    );

    return NextResponse.json({ assets, count: assets.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to list assets";
    return NextResponse.json({ error: `Failed to list assets: ${msg}` }, { status: 500 });
  }
}
