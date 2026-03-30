import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  expertiseFromJson,
  expertiseToJson,
  parseExpertiseList,
} from "@/lib/repairerProfile";

export const runtime = "nodejs";

type PatchBody = {
  bio?: unknown;
  serviceDescription?: unknown;
  expertise?: unknown;
  servicePhotoUrl?: unknown;
  serviceLocationLabel?: unknown;
  serviceLatitude?: unknown;
  serviceLongitude?: unknown;
};

function normalizeOptionalUrl(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (t.length === 0) return null;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return undefined;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
  if (t.length > 2048) return undefined;
  return t;
}

function normalizeLocationLabel(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, 200);
}

function normalizeCoord(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() === "") return null;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const profile = await prisma.repairerProfile.findUnique({
    where: { slug },
    select: { userId: true },
  });
  if (!profile || profile.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bio = typeof body.bio === "string" ? body.bio.trim() : undefined;
  const serviceDescription =
    typeof body.serviceDescription === "string" ? body.serviceDescription.trim() : undefined;

  const servicePhotoUrl = normalizeOptionalUrl(body.servicePhotoUrl);
  if (body.servicePhotoUrl !== undefined && servicePhotoUrl === undefined && body.servicePhotoUrl !== null) {
    const raw = body.servicePhotoUrl;
    const emptyString = typeof raw === "string" && raw.trim() === "";
    if (!emptyString) {
      return NextResponse.json({ error: "servicePhotoUrl must be a valid http(s) URL or empty" }, { status: 400 });
    }
  }

  const serviceLocationLabel = normalizeLocationLabel(body.serviceLocationLabel);
  if (body.serviceLocationLabel !== undefined && serviceLocationLabel === undefined) {
    return NextResponse.json({ error: "serviceLocationLabel must be a string" }, { status: 400 });
  }

  const latKey = Object.prototype.hasOwnProperty.call(body, "serviceLatitude");
  const lngKey = Object.prototype.hasOwnProperty.call(body, "serviceLongitude");
  if (latKey !== lngKey) {
    return NextResponse.json(
      { error: "Include both serviceLatitude and serviceLongitude when updating map position" },
      { status: 400 },
    );
  }

  let serviceLatitude = normalizeCoord(body.serviceLatitude);
  let serviceLongitude = normalizeCoord(body.serviceLongitude);
  if (latKey && serviceLatitude === undefined) {
    return NextResponse.json({ error: "serviceLatitude must be a number or null" }, { status: 400 });
  }
  if (lngKey && serviceLongitude === undefined) {
    return NextResponse.json({ error: "serviceLongitude must be a number or null" }, { status: 400 });
  }

  const latProvided = serviceLatitude !== undefined && serviceLatitude !== null;
  const lngProvided = serviceLongitude !== undefined && serviceLongitude !== null;
  if (latProvided !== lngProvided) {
    return NextResponse.json(
      { error: "Set both serviceLatitude and serviceLongitude, or clear both" },
      { status: 400 },
    );
  }
  if (latProvided && lngProvided) {
    if (serviceLatitude! < -90 || serviceLatitude! > 90 || serviceLongitude! < -180 || serviceLongitude! > 180) {
      return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
    }
  }

  let expertiseJson: string | undefined;
  if (body.expertise !== undefined) {
    if (Array.isArray(body.expertise)) {
      const items = body.expertise.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
      expertiseJson = expertiseToJson(items);
    } else if (typeof body.expertise === "string") {
      expertiseJson = expertiseToJson(parseExpertiseList(body.expertise));
    } else {
      return NextResponse.json({ error: "expertise must be a string or string array" }, { status: 400 });
    }
  }

  const updated = await prisma.repairerProfile.update({
    where: { slug },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(serviceDescription !== undefined ? { serviceDescription } : {}),
      ...(expertiseJson !== undefined ? { expertise: expertiseJson } : {}),
      ...(servicePhotoUrl !== undefined ? { servicePhotoUrl } : {}),
      ...(serviceLocationLabel !== undefined ? { serviceLocationLabel } : {}),
      ...(serviceLatitude !== undefined ? { serviceLatitude } : {}),
      ...(serviceLongitude !== undefined ? { serviceLongitude } : {}),
    },
    select: {
      bio: true,
      serviceDescription: true,
      expertise: true,
      completedJobsCount: true,
      ratingSum: true,
      ratingCount: true,
      servicePhotoUrl: true,
      serviceLocationLabel: true,
      serviceLatitude: true,
      serviceLongitude: true,
    },
  });

  return NextResponse.json({
    bio: updated.bio,
    serviceDescription: updated.serviceDescription,
    expertise: expertiseFromJson(updated.expertise),
    completedJobsCount: updated.completedJobsCount,
    ratingSum: updated.ratingSum,
    ratingCount: updated.ratingCount,
    servicePhotoUrl: updated.servicePhotoUrl,
    serviceLocationLabel: updated.serviceLocationLabel,
    serviceLatitude: updated.serviceLatitude,
    serviceLongitude: updated.serviceLongitude,
  });
}
