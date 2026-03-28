import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureRepairerProfile } from "@/lib/repairerProfile";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("[auth/login] database", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error:
          "Database error while signing in. From the project folder run: npx prisma db push && npx prisma db seed",
        ...(process.env.NODE_ENV === "development" ? { detail: message } : {}),
      },
      { status: 503 },
    );
  }

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createSessionToken(user.id, user.email);
  } catch (err) {
    console.error("[auth/login] session token", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error:
          "Server could not create a session. Check AUTH_SECRET in .env (at least 32 characters).",
        ...(process.env.NODE_ENV === "development" ? { detail: message } : {}),
      },
      { status: 500 },
    );
  }

  let repairerSlug: string | null = null;
  if (user.role === "REPAIRER") {
    const ensured = await ensureRepairerProfile(user.id);
    repairerSlug = ensured?.slug ?? null;
  }

  const res = NextResponse.json({
    ok: true,
    role: user.role,
    repairerSlug,
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
