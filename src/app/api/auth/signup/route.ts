import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  expertiseToJson,
  parseExpertiseList,
  uniqueRepairerSlug,
} from "@/lib/repairerProfile";

export const runtime = "nodejs";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  serviceName?: string;
  services?: string;
  bio?: string;
  postalCode?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
};

export async function POST(request: NextRequest) {
  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const roleUi = body.role === "repairer" ? "repairer" : "user";
  const roleDb = roleUi === "repairer" ? "REPAIRER" : "USER";
  const serviceName = String(body.serviceName ?? "").trim();
  const servicesRaw = String(body.services ?? "").trim();
  const bioRepairer = String(body.bio ?? "").trim();
  const postalCode = String(body.postalCode ?? "").trim();
  const locationName = String(body.locationName ?? "").trim();
  const latitude = typeof body.latitude === "number" && isFinite(body.latitude) ? body.latitude : null;
  const longitude = typeof body.longitude === "number" && isFinite(body.longitude) ? body.longitude : null;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  if (roleDb === "REPAIRER") {
    if (!serviceName) {
      return NextResponse.json(
        { error: "Service name is required for repairer accounts" },
        { status: 400 },
      );
    }
    if (!servicesRaw) {
      return NextResponse.json(
        { error: "Services offered are required for repairer accounts" },
        { status: 400 },
      );
    }
    if (!bioRepairer) {
      return NextResponse.json(
        { error: "A short bio is required for repairer accounts" },
        { status: 400 },
      );
    }
  }

  let passwordHash: string;
  try {
    passwordHash = await bcrypt.hash(password, 10);
  } catch (err) {
    console.error("[auth/signup] bcrypt", err);
    return NextResponse.json({ error: "Could not process password" }, { status: 500 });
  }

  let user: { id: string; email: string };
  let repairerSlug: string | undefined;
  try {
    if (roleDb === "REPAIRER") {
      const expertise = parseExpertiseList(servicesRaw);
      const slug = await uniqueRepairerSlug(serviceName);
      const created = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: roleDb,
          repairerProfile: {
            create: {
              slug,
              serviceName,
              bio: bioRepairer,
              serviceDescription: "",
              expertise: expertiseToJson(expertise),
              servicePostalCode: postalCode,
              serviceLocationLabel: locationName,
              serviceLatitude: latitude,
              serviceLongitude: longitude,
            },
          },
        },
        select: { id: true, email: true },
      });
      user = created;
      repairerSlug = slug;
    } else {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: roleDb,
        },
        select: { id: true, email: true },
      });
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    console.error("[auth/signup] database", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error:
          "Database error while signing up. From the project folder run: npx prisma db push && npx prisma db seed",
        ...(process.env.NODE_ENV === "development" ? { detail: message } : {}),
      },
      { status: 503 },
    );
  }

  let token: string;
  try {
    token = await createSessionToken(user.id, user.email);
  } catch (err) {
    console.error("[auth/signup] session token", err);
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

  const res = NextResponse.json({
    ok: true,
    role: roleDb,
    ...(repairerSlug ? { repairerSlug } : {}),
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
