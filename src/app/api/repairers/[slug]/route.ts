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
};

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
    },
    select: {
      bio: true,
      serviceDescription: true,
      expertise: true,
      completedJobsCount: true,
      ratingSum: true,
      ratingCount: true,
    },
  });

  return NextResponse.json({
    bio: updated.bio,
    serviceDescription: updated.serviceDescription,
    expertise: expertiseFromJson(updated.expertise),
    completedJobsCount: updated.completedJobsCount,
    ratingSum: updated.ratingSum,
    ratingCount: updated.ratingCount,
  });
}
