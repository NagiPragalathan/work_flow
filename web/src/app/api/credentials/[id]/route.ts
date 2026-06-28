import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";
import { serializeCredential } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const cred = await prisma.credential.findFirst({ where: { id, userId: user.id } });
    if (!cred) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    return NextResponse.json(serializeCredential(cred));
  } catch (e) {
    return handleApiError(e);
  }
}

async function update(req: NextRequest, params: Params["params"]) {
  const user = await requireUser();
  const { id } = await params;
  const existing = await prisma.credential.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const body = await req.json();
  const cred = await prisma.credential.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.credential_type !== undefined ? { credentialType: body.credential_type } : {}),
      ...(body.data !== undefined ? { data: body.data } : {}),
    },
  });
  return NextResponse.json(serializeCredential(cred));
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    return await update(req, params);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    return await update(req, params);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await prisma.credential.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    await prisma.credential.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
