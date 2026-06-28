import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { User } from "@prisma/client";

/** Error thrown when a request is not authenticated. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication credentials were not provided.");
  }
}

/**
 * Returns the current authenticated user record, or null.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Returns the current user or throws UnauthorizedError.
 * Use inside route handlers and catch with `handleApiError`.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Standard JSON error responses matching the old DRF behavior. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ detail: error.message }, { status: 401 });
  }
  const message = error instanceof Error ? error.message : "Request failed";
  console.error("API error:", error);
  return NextResponse.json({ error: "Request failed", message }, { status: 500 });
}
