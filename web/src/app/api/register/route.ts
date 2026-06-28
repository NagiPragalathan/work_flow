import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serializers";

/**
 * User registration. Mirrors the old Django /auth/signup/ contract:
 * accepts username, password, password_confirm/passwordConfirm, email,
 * first_name/firstName, last_name/lastName and returns { user, message }.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const username: string = body.username;
    const password: string = body.password;
    const passwordConfirm: string = body.password_confirm ?? body.passwordConfirm;
    const email: string = body.email ?? "";
    const firstName: string = body.first_name ?? body.firstName ?? "";
    const lastName: string = body.last_name ?? body.lastName ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Validation failed", message: "Username and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Validation failed", message: "password: Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (passwordConfirm !== undefined && password !== passwordConfirm) {
      return NextResponse.json(
        { error: "Validation failed", message: "password_confirm: Passwords do not match" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Validation failed", message: "username: A user with this username already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email: email || null, passwordHash, firstName, lastName },
    });

    return NextResponse.json(
      { user: serializeUser(user), message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: "Registration failed", message }, { status: 500 });
  }
}
