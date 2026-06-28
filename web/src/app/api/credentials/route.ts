import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeCredential, paginated } from "@/lib/serializers";

export async function GET() {
  try {
    const user = await requireUser();
    const creds = await prisma.credential.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(paginated(creds.map(serializeCredential)));
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const cred = await prisma.credential.create({
      data: {
        userId: user.id,
        name: body.name,
        credentialType: body.credential_type,
        data: body.data ?? {},
      },
    });
    return NextResponse.json(serializeCredential(cred), { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
