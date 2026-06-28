import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { getCurrentUser } from "@/lib/session";

const ALLOWED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/\s+/g, "_");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED.join(", ")}` },
        { status: 400 }
      );
    }

    const customName = (form.get("custom_name") as string) || "";
    const ext = path.extname(file.name).toLowerCase();
    let filename: string;
    if (customName.trim()) {
      filename = `${sanitize(customName)}${ext}`;
    } else {
      const base = sanitize(path.basename(file.name, ext));
      filename = `${base}_${randomBytes(4).toString("hex")}${ext}`;
    }

    const user = await getCurrentUser();
    const userId = user?.id ?? "guest";
    const relDir = path.posix.join("uploads", "ui_assets", `user_${userId}`);
    const absDir = path.join(process.cwd(), "public", relDir);
    await fs.mkdir(absDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(absDir, filename), buffer);

    const url = `/${relDir}/${filename}`;
    return NextResponse.json(
      {
        success: true,
        url,
        filename,
        path: url,
        size: buffer.length,
        content_type: file.type,
      },
      { status: 201 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}
